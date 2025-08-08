/**
 * Servicio para generar contratos PDF desde plantilla oficial
 * Utiliza la plantilla PDF oficial y rellena los campos específicos
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configuración de coordenadas para los campos del PDF
// NOTA: Estas coordenadas deben ajustarse según la plantilla real
const COORDENADAS_CAMPOS = {
  // Datos del estudiante (ajustar según plantilla real)
  nombre: { x: 356, y: 629 },  // Campo "XXXXXXXXX" después de "NOMBRE (S)"
  apellidos: { x: 755, y: 629 }, // Campo "XXXXXXXXX" después de "APELLIDOS:"
  nivelAcademico: { x: 356, y: 648 }, // Campo después de "NIVEL ACADÉMICO:"
  correoElectronico: { x: 355, y: 668 }, // Campo después de "CORREO ELECTRÓNICO:"
  telefono: { x: 797, y: 668 }, // Campo después de "NÚMERO DE TELÉFONO DEL ESTUDIANTE:"
  nombreTutor: { x: 320, y: 687 }, // Campo después de "NOMBRE DEL TUTOR:"
  telefonoTutor: { x: 880, y: 687 }, // Campo después de "NÚMERO DE TELÉFONO DEL TUTOR:"
  alergias: { x: 320, y: 705 }, // Campo después de "ALERGIAS A:"
  
  // Campos de seguimiento psicológico
  seguimientoPsicologico: { x: 593, y: 722 }, // Sí/No después de "SEGUIMIENTO PSICOLÓGICO:"
  
  // Datos del curso
  monto: { x: 350, y: 553 }, // Campo del monto principal en rojo
  planCurso: { x: 400, y: 418 }, // Plan Básico - 6 meses
  
  // Fechas y firma
  fechaGeneracion: { x: 100, y: 100 }, // Fecha de generación del contrato
};

// Configuración de colores
const COLORES = {
  camposVariables: rgb(0.86, 0.21, 0.27), // Rojo para campos que se llenan
  textoNormal: rgb(0, 0, 0), // Negro para texto normal
  destacado: rgb(0, 0, 0.8), // Azul para texto destacado
};

// Configuración de fuentes
const FUENTES = {
  tamaño: {
    normal: 9,
    pequeño: 8,
    grande: 11,
    destacado: 12
  }
};

/**
 * Genera un folio único para el contrato
 */
export const generarFolioContrato = () => {
  const año = new Date().getFullYear();
  const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const dia = new Date().getDate().toString().padStart(2, '0');
  const numeroAleatorio = Math.floor(Math.random() * 9999) + 1;
  const numeroFormateado = numeroAleatorio.toString().padStart(4, '0');
  
  return `MQEEAU-${año}-${mes}${dia}-${numeroFormateado}`;
};

/**
 * Procesa y limpia los datos del alumno para el contrato
 */
export const procesarDatosAlumno = (alumno) => {
  // Separar nombre y apellidos si viene todo junto
  const nombreCompleto = alumno.alumno || '';
  const partesNombre = nombreCompleto.trim().split(' ');
  const nombre = partesNombre[0] || '';
  const apellidos = partesNombre.slice(1).join(' ') || '';
  
  return {
    // Datos básicos
    nombre: nombre.toUpperCase(),
    apellidos: apellidos.toUpperCase(),
    nombreCompleto: nombreCompleto.toUpperCase(),
    
    // Datos académicos
    nivelAcademico: alumno.nivelAcademico || 'PREPARATORIA',
    
    // Contacto
    correoElectronico: alumno.correoElectronico || 'ejemplo@email.com',
    telefono: alumno.telefono || '(999) 999-9999',
    
    // Tutor (si aplica)
    nombreTutor: alumno.nombreTutor || '',
    telefonoTutor: alumno.telefonoTutor || '',
    
    // Datos médicos
    alergias: alumno.alergias || 'NINGUNA',
    seguimientoPsicologico: alumno.seguimientoPsicologico ? 'SÍ' : 'NO',
    
    // Datos del curso
    categoria: alumno.categoria || '',
    planCurso: alumno.planCurso || '',
    turno: alumno.turno || '',
    
    // Datos financieros
    pagoCurso: alumno.pagoCurso || '',
    metodoPago: alumno.metodoPago || '',
    
    // Fechas
    fechaEntrada: alumno.fechaEntrada || '',
    
    // Identificadores
    folio: alumno.folio || '',
    id: alumno.id
  };
};

/**
 * Rellena los campos específicos del PDF con los datos del alumno
 */
export const rellenarCamposPDF = async (pdfDoc, datosAlumno) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Folio del contrato (generar nuevo)
  const folio = generarFolioContrato();
  
  try {
    // Rellenar campos del estudiante
    if (datosAlumno.nombre) {
      firstPage.drawText(datosAlumno.nombre, {
        x: COORDENADAS_CAMPOS.nombre.x,
        y: COORDENADAS_CAMPOS.nombre.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.apellidos) {
      firstPage.drawText(datosAlumno.apellidos, {
        x: COORDENADAS_CAMPOS.apellidos.x,
        y: COORDENADAS_CAMPOS.apellidos.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.nivelAcademico) {
      firstPage.drawText(datosAlumno.nivelAcademico, {
        x: COORDENADAS_CAMPOS.nivelAcademico.x,
        y: COORDENADAS_CAMPOS.nivelAcademico.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.correoElectronico) {
      firstPage.drawText(datosAlumno.correoElectronico, {
        x: COORDENADAS_CAMPOS.correoElectronico.x,
        y: COORDENADAS_CAMPOS.correoElectronico.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.telefono) {
      firstPage.drawText(datosAlumno.telefono, {
        x: COORDENADAS_CAMPOS.telefono.x,
        y: COORDENADAS_CAMPOS.telefono.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.nombreTutor) {
      firstPage.drawText(datosAlumno.nombreTutor, {
        x: COORDENADAS_CAMPOS.nombreTutor.x,
        y: COORDENADAS_CAMPOS.nombreTutor.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.telefonoTutor) {
      firstPage.drawText(datosAlumno.telefonoTutor, {
        x: COORDENADAS_CAMPOS.telefonoTutor.x,
        y: COORDENADAS_CAMPOS.telefonoTutor.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    if (datosAlumno.alergias) {
      firstPage.drawText(datosAlumno.alergias, {
        x: COORDENADAS_CAMPOS.alergias.x,
        y: COORDENADAS_CAMPOS.alergias.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    // Seguimiento psicológico
    firstPage.drawText(datosAlumno.seguimientoPsicologico, {
      x: COORDENADAS_CAMPOS.seguimientoPsicologico.x,
      y: COORDENADAS_CAMPOS.seguimientoPsicologico.y,
      size: FUENTES.tamaño.normal,
      font: fontBold,
      color: COLORES.camposVariables,
    });
    
    // Monto del curso (campo destacado en rojo)
    if (datosAlumno.pagoCurso) {
      firstPage.drawText(datosAlumno.pagoCurso, {
        x: COORDENADAS_CAMPOS.monto.x,
        y: COORDENADAS_CAMPOS.monto.y,
        size: FUENTES.tamaño.destacado,
        font: fontBold,
        color: COLORES.camposVariables,
      });
    }
    
    // Plan del curso
    if (datosAlumno.planCurso) {
      firstPage.drawText(datosAlumno.planCurso, {
        x: COORDENADAS_CAMPOS.planCurso.x,
        y: COORDENADAS_CAMPOS.planCurso.y,
        size: FUENTES.tamaño.normal,
        font: font,
        color: COLORES.camposVariables,
      });
    }
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    firstPage.drawText(`Generado el: ${fechaActual}`, {
      x: COORDENADAS_CAMPOS.fechaGeneracion.x,
      y: COORDENADAS_CAMPOS.fechaGeneracion.y,
      size: FUENTES.tamaño.pequeño,
      font: font,
      color: COLORES.textoNormal,
    });
    
    console.log('✅ Campos PDF rellenados correctamente');
    return folio;
    
  } catch (error) {
    console.error('❌ Error al rellenar campos del PDF:', error);
    throw new Error('Error al completar los campos del contrato');
  }
};

/**
 * Genera el contrato PDF completo desde la plantilla oficial
 */
export const generarContratoPDF = async (alumno) => {
  try {
    console.log('🔄 Iniciando generación de contrato PDF para:', alumno.alumno);
    
    // 1. Cargar la plantilla PDF oficial
    const plantillaUrl = '/CONTRATO DEL CURSO DE ENTRENAMIENTO AL EXAMEN DE ADMISION - ORIGINAL.pdf';
    const response = await fetch(plantillaUrl);
    
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // 2. Procesar datos del alumno
    const datosAlumno = procesarDatosAlumno(alumno);
    
    // 3. Rellenar campos del PDF
    const folio = await rellenarCamposPDF(pdfDoc, datosAlumno);
    
    // 4. Generar el PDF final
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // 5. Configurar nombre del archivo
    const nombreArchivo = `Contrato_${folio}_${datosAlumno.nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    
    console.log('✅ Contrato PDF generado exitosamente:', nombreArchivo);
    
    return {
      url,
      nombreArchivo,
      folio,
      blob
    };
    
  } catch (error) {
    console.error('❌ Error en generación de contrato PDF:', error);
    throw error;
  }
};

/**
 * Descarga automáticamente el PDF generado
 */
export const descargarPDF = (url, nombreArchivo) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ PDF descargado:', nombreArchivo);
  } catch (error) {
    console.error('❌ Error al descargar PDF:', error);
    throw new Error('Error al descargar el archivo PDF');
  }
};

/**
 * Función principal que orquesta todo el proceso
 */
export const generarYDescargarContrato = async (alumno) => {
  try {
    // Generar el contrato
    const resultado = await generarContratoPDF(alumno);
    
    // Descargar automáticamente
    descargarPDF(resultado.url, resultado.nombreArchivo);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en proceso completo:', error);
    throw error;
  }
};

export default {
  generarContratoPDF,
  generarYDescargarContrato,
  descargarPDF,
  procesarDatosAlumno,
  generarFolioContrato
};