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
  // Folio original visible (ajustar según cabecera de la plantilla)
  folioOriginal: { x: 480, y: 770 },
  
  // Fechas y firma
  fechaGeneracion: { x: 100, y: 100 }, // Fecha de generación del contrato
};

// Overrides dinámicos (localStorage) para calibración sin tocar código
const LS_KEY = 'contractCoordsOverrides';
let COORD_OVERRIDES = {};
try {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
  if (raw) COORD_OVERRIDES = JSON.parse(raw);
} catch (_) {}

const saveOverrides = () => {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(COORD_OVERRIDES)); } catch (_) {}
};

export const setCoordOverride = (campo, x, y) => {
  COORD_OVERRIDES = { ...COORD_OVERRIDES, [campo]: { x: Number(x)||0, y: Number(y)||0 } };
  saveOverrides();
};

export const clearCoordOverrides = () => { COORD_OVERRIDES = {}; saveOverrides(); };
export const getCoordOverrides = () => ({ ...COORD_OVERRIDES });

const getCoords = (campo) => {
  const ov = COORD_OVERRIDES[campo];
  if (ov && typeof ov.x === 'number' && typeof ov.y === 'number') return ov;
  return COORDENADAS_CAMPOS[campo];
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
// Helper para dibujar texto con opciones (alineación, maxWidth) y marcadores en modo debug
const drawTextAt = (page, text, coords, opts) => {
  const {
    font,
    fontBold,
    size = FUENTES.tamaño.normal,
    color = COLORES.camposVariables,
    align = 'left', // left | center | right
    maxWidth = undefined,
    debug = false,
    bold = false,
    yAdjust = 0, // ajustar si se quiere alinear visualmente con media altura
  } = opts || {};

  const f = bold && fontBold ? fontBold : font;
  if (!f) return;
  let x = coords.x;
  let y = coords.y + yAdjust;
  let txt = String(text ?? '').trim();
  if (!txt) return;

  // Calcular ancho y ajustar por alineación
  let width = f.widthOfTextAtSize(txt, size);
  if (maxWidth && width > maxWidth) {
    // Estrategia simple: reducir tamaño hasta que quepa o llegar a 7pt
    let s = size;
    while (s > 7 && f.widthOfTextAtSize(txt, s) > maxWidth) s -= 0.5;
    // Si aún no cabe, truncar con '…'
    if (f.widthOfTextAtSize(txt, s) > maxWidth) {
      while (txt.length > 0 && f.widthOfTextAtSize(txt + '…', s) > maxWidth) {
        txt = txt.slice(0, -1);
      }
      txt = txt + '…';
    }
    width = f.widthOfTextAtSize(txt, s);
    // aplicar nuevo size
    page.drawText(txt, { x: 0, y: 0, size: s, font: f, color }); // dummy para usar s abajo
    // drawText real más abajo; actualizamos opts size
    opts.size = s;
  }

  if (align === 'center') x = x - width / 2;
  if (align === 'right') x = x - width;

  if (debug) {
    // Marcar punto y caja de referencia
    page.drawCircle({ x: coords.x, y: coords.y, size: 2, color: rgb(1, 0, 0) });
    if (maxWidth) {
      page.drawRectangle({ x: coords.x, y: coords.y - (opts.size || size), width: maxWidth, height: (opts.size || size) + 4, borderColor: rgb(1, 0, 0), borderWidth: 0.5 });
    }
  }

  page.drawText(txt, {
    x,
    y,
    size: opts.size || size,
    font: f,
    color,
  });
};

export const rellenarCamposPDF = async (pdfDoc, datosAlumno, opciones = {}) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const debug = Boolean(opciones.debug);
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Folio del contrato (generar nuevo)
  const folio = generarFolioContrato();
  
  try {
    // Rellenar campos del estudiante
  if (datosAlumno.nombre) drawTextAt(firstPage, datosAlumno.nombre, getCoords('nombre'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 360 });
    
  if (datosAlumno.apellidos) drawTextAt(firstPage, datosAlumno.apellidos, getCoords('apellidos'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 180 });
    
  if (datosAlumno.nivelAcademico) drawTextAt(firstPage, datosAlumno.nivelAcademico, getCoords('nivelAcademico'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 300 });
    
  if (datosAlumno.correoElectronico) drawTextAt(firstPage, datosAlumno.correoElectronico, getCoords('correoElectronico'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 420 });
    
  if (datosAlumno.telefono) drawTextAt(firstPage, datosAlumno.telefono, getCoords('telefono'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 140, align: 'left' });
    
  if (datosAlumno.nombreTutor) drawTextAt(firstPage, datosAlumno.nombreTutor, getCoords('nombreTutor'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 300 });
    
  if (datosAlumno.telefonoTutor) drawTextAt(firstPage, datosAlumno.telefonoTutor, getCoords('telefonoTutor'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 140 });
    
  if (datosAlumno.alergias) drawTextAt(firstPage, datosAlumno.alergias, getCoords('alergias'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 420 });
    
    // Seguimiento psicológico
    drawTextAt(firstPage, datosAlumno.seguimientoPsicologico, COORDENADAS_CAMPOS.seguimientoPsicologico, { font, fontBold, bold: true, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    
    // Monto del curso (campo destacado en rojo)
  if (datosAlumno.pagoCurso) drawTextAt(firstPage, datosAlumno.pagoCurso, getCoords('monto'), { font, fontBold, bold: true, color: COLORES.camposVariables, size: FUENTES.tamaño.destacado, debug, maxWidth: 180 });
    
    // Plan del curso
  if (datosAlumno.planCurso) drawTextAt(firstPage, datosAlumno.planCurso, getCoords('planCurso'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 360 });

    // Folio original (si viene del alumno), anclado al margen derecho
    if (datosAlumno.folio) {
      const { width, height } = firstPage.getSize();
      const folioClean = String(datosAlumno.folio).replace(/\s+/g, '');
      const pos = {
        x: width - (typeof opciones.folioRightMargin === 'number' ? opciones.folioRightMargin : 40),
        y: typeof opciones.folioTopY === 'number' ? opciones.folioTopY : (height - 50),
      };
      drawTextAt(firstPage, `Folio original: ${folioClean}`, pos, { font, fontBold, color: COLORES.textoNormal, size: FUENTES.tamaño.pequeño, debug, align: 'right', maxWidth: 240 });
    }
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
  drawTextAt(firstPage, `Generado el: ${fechaActual}`, getCoords('fechaGeneracion'), { font, fontBold, color: COLORES.textoNormal, size: FUENTES.tamaño.pequeño, debug });
    
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
export const generarContratoPDF = async (alumno, opciones = {}) => {
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
  const folio = await rellenarCamposPDF(pdfDoc, datosAlumno, opciones);
    
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
export const generarYDescargarContrato = async (alumno, opciones = {}) => {
  try {
    // Generar el contrato
  const resultado = await generarContratoPDF(alumno, opciones);
    
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