/**
 * Herramienta para calibrar coordenadas del PDF
 * Ayuda a identificar las posiciones exactas donde colocar los campos
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Añade una grilla de coordenadas al PDF para facilitar el posicionamiento
 */
export const agregarGrillaCoordenadas = async (pdfDoc) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const gridColor = rgb(0.8, 0.8, 0.8); // Gris claro
  const textColor = rgb(0.5, 0.5, 0.5); // Gris medio
  
  // Líneas verticales cada 50 píxeles
  for (let x = 0; x <= width; x += 50) {
    firstPage.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.5,
      color: gridColor
    });
    
    // Etiquetas de coordenadas X cada 100 píxeles
    if (x % 100 === 0) {
      firstPage.drawText(`${x}`, {
        x: x + 2,
        y: height - 15,
        size: 8,
        font,
        color: textColor
      });
    }
  }
  
  // Líneas horizontales cada 50 píxeles
  for (let y = 0; y <= height; y += 50) {
    firstPage.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: 0.5,
      color: gridColor
    });
    
    // Etiquetas de coordenadas Y cada 100 píxeles
    if (y % 100 === 0) {
      firstPage.drawText(`${y}`, {
        x: 5,
        y: y + 2,
        size: 8,
        font,
        color: textColor
      });
    }
  }
};

/**
 * Marca los puntos donde deberían ir los campos principales
 */
export const marcarPuntosCampos = async (pdfDoc, coordenadas) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const markerColor = rgb(1, 0, 0); // Rojo brillante
  
  Object.entries(coordenadas).forEach(([campo, coords]) => {
    // Dibujar un punto rojo
    firstPage.drawCircle({
      x: coords.x,
      y: coords.y,
      size: 3,
      color: markerColor
    });
    
    // Etiqueta del campo
    firstPage.drawText(campo, {
      x: coords.x + 5,
      y: coords.y + 5,
      size: 6,
      font,
      color: markerColor
    });
    
    // Coordenadas exactas
    firstPage.drawText(`(${coords.x},${coords.y})`, {
      x: coords.x + 5,
      y: coords.y - 5,
      size: 5,
      font,
      color: markerColor
    });
  });
};

/**
 * Genera un PDF de calibración con grilla y marcadores
 */
export const generarPDFCalibracion = async () => {
  try {
    console.log('🔧 Generando PDF de calibración...');
    
    // Cargar plantilla original
    const plantillaUrl = '/CONTRATO DEL CURSO DE ENTRENAMIENTO AL EXAMEN DE ADMISION - ORIGINAL.pdf';
    const response = await fetch(plantillaUrl);
    
    if (!response.ok) {
      throw new Error('No se pudo cargar la plantilla para calibración');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Coordenadas actuales (a ajustar)
    const coordenadasActuales = {
      nombre: { x: 356, y: 629 },
      apellidos: { x: 755, y: 629 },
      nivelAcademico: { x: 356, y: 648 },
      correoElectronico: { x: 355, y: 668 },
      telefono: { x: 797, y: 668 },
      nombreTutor: { x: 320, y: 687 },
      telefonoTutor: { x: 880, y: 687 },
      alergias: { x: 320, y: 705 },
      seguimientoPsicologico: { x: 593, y: 722 },
      monto: { x: 350, y: 553 },
      planCurso: { x: 400, y: 418 }
    };
    
    // Añadir grilla de coordenadas
    await agregarGrillaCoordenadas(pdfDoc);
    
    // Marcar puntos de campos
    await marcarPuntosCampos(pdfDoc, coordenadasActuales);
    
    // Generar PDF de calibración
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Contrato_Calibracion_Coordenadas.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ PDF de calibración generado');
    return url;
    
  } catch (error) {
    console.error('❌ Error en calibración:', error);
    throw error;
  }
};

export default {
  generarPDFCalibracion,
  agregarGrillaCoordenadas,
  marcarPuntosCampos
};