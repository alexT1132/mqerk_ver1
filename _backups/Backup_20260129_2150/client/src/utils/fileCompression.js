import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js (necesario para leer PDFs)
// Nota: En producción, es mejor apuntar a un archivo local en tu carpeta public/
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Comprime un archivo (Imagen o PDF)
 */
export async function compressFile(file, onProgress = null) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const fileSize = file.size;

    // Si es pequeño, devolver original
    if (fileSize <= MAX_SIZE) {
        return file;
    }

    try {
        // 1. Estrategia para IMÁGENES
        if (file.type.startsWith('image/')) {
            return await compressImage(file, onProgress);
        }

        // 2. Estrategia para PDFs (NUEVO)
        if (file.type === 'application/pdf') {
            return await compressPdf(file, onProgress);
        }

        // 3. Otros archivos
        console.warn(`El archivo ${file.name} no soporta compresión visual.`);
        return file;

    } catch (error) {
        console.error("Error en la compresión principal:", error);
        throw error;
    }
}

/**
 * Lógica de compresión de PDF (Rasterización)
 */
async function compressPdf(file, onProgress) {
    if (onProgress) onProgress(0.1, 'Analizando PDF...');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const totalPages = pdf.numPages;
    
    // Crear un nuevo PDF donde guardaremos las páginas comprimidas
    const newPdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        compress: true 
    });

    // Iterar por cada página
    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        
        // Renderizar página en un Canvas de alta resolución (scale 2 para calidad decente)
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        // Convertir Canvas a Blob (Imagen)
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        const imageFile = new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' });

        // Informar progreso
        const progressPercent = 0.1 + ((i / totalPages) * 0.7); // Del 10% al 80%
        if (onProgress) onProgress(progressPercent, `Procesando página ${i} de ${totalPages}...`);

        // Comprimir la imagen de la página usando tu función existente
        // Usamos parámetros agresivos porque va dentro de un PDF
        const options = {
            maxSizeMB: 1,           // Queremos páginas ligeras
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.7
        };
        
        const compressedImage = await imageCompression(imageFile, options);
        
        // Convertir la imagen comprimida a DataURL para jsPDF
        const imgData = await imageCompression.getDataUrlFromFile(compressedImage);

        // Añadir página al nuevo PDF
        const imgProps = newPdf.getImageProperties(imgData);
        const pdfWidth = newPdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 1) newPdf.addPage();
        newPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    if (onProgress) onProgress(0.9, 'Generando archivo final...');

    // Generar el archivo PDF final
    const pdfBlob = newPdf.output('blob');
    const finalFile = new File([pdfBlob], file.name, { type: 'application/pdf' });

    if (onProgress) onProgress(1.0, '¡PDF Comprimido!');

    // Verificación de seguridad: si el "comprimido" quedó más grande, devolver original
    if (finalFile.size > file.size) {
        console.warn("La compresión resultó en un archivo más grande, devolviendo original.");
        return file;
    }

    return finalFile;
}

/**
 * Tu función original de comprimir imagen (Ligeramente ajustada)
 */
async function compressImage(file, onProgress) {
    // ... (Mantén tu lógica existente aquí, funciona bien) ...
    // Solo asegúrate de que use las opciones que ya tenías
    const options = {
        maxSizeMB: 9,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8, // Un poco más bajo por defecto ayuda
        onProgress: (p) => {
            // Adaptar el progreso interno de la librería a tu barra (0-100)
            if(onProgress) onProgress(p / 100, 'Comprimiendo imagen...'); 
        }
    };
    
    try {
        return await imageCompression(file, options);
    } catch (error) {
        console.error(error);
        return file; // Fallback seguro
    }
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}