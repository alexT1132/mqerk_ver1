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

// Frases que NO deben mostrarse en el contrato (se eliminan silenciosamente)
const FORBIDDEN_SNIPPETS = [
  'CBTIS - CONCLUIDO',
  'CBTIS CONCLUIDO',
  'BCTIS - CONCLUIDO',
  'BCTOS - CONCLUIDO',
  'BCTOS CONCLUIDO'
];

// Patrones amplios para eliminar cualquier referencia a bachillerato / CBTIS
const FORBIDDEN_REGEXPS = [
  /CBTIS[^\n]*/gi,
  /C\s*B\s*T\s*I\s*S[^\n]*/gi,
  /BACHILLERATO[^\n]*/gi,
  /BACHILLERATO\s+CONCLUIDO/gi,
  /CBT[I1]S\s*-?\s*CONCLUIDO/gi
];

const sanitizeValue = (val) => {
  if (!val) return val;
  let out = String(val);
  FORBIDDEN_SNIPPETS.forEach(snippet => {
    const regex = new RegExp(snippet.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig');
    out = out.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
  });
  FORBIDDEN_REGEXPS.forEach(rgx => {
    out = out.replace(rgx, '');
  });
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
};

// Resolución de tamaños de página comunes
const resolvePageSize = (pageSize) => {
  if (Array.isArray(pageSize) && pageSize.length === 2) return pageSize;
  switch ((pageSize || 'A4').toString().toUpperCase()) {
    case 'LETTER': return [612, 792]; // carta
    case 'A4':
    default: return [595.28, 841.89];
  }
};

// Rectángulos medidos desde el ORIGEN SUPERIOR-IZQUIERDO (como en la herramienta de coordenadas)
// Cada rect define x1,y1 (esquina superior-izquierda) y x2,y2 (esquina inferior-derecha)
// Los valores provienen del usuario para: FOLIO, FECHA, NOMBRE TUTOR
const RECT_TOP_ORIGIN = {
  // Campos en cabecera
  // Folio (ajustado nuevamente)
  FOLIO: { x1: 502.0, y1: 21.0, x2: 560.5, y2: 30.0 },
  // Fecha de contrato (cabecera) ajustada (segunda fecha distinta de la de la página 2)
  FECHA: { x1: 159.50, y1: 21.75, x2: 209.75, y2: 28.50 },
  // Nombre del tutor (cabecera) ajustado
  NOMBRE_TUTOR: { x1: 211.50, y1: 181.00, x2: 359.50, y2: 191.00 },
  // Fecha (cuerpo) separada en Día / Mes / Año
  FECHA_DIA: { x1: 154.4, y1: 660.0, x2: 160.4, y2: 665.6 },
  FECHA_MES: { x1: 193.2, y1: 660.8, x2: 238.4, y2: 668.0 },
  FECHA_ANIO: { x1: 249.2, y1: 659.2, x2: 291.2, y2: 667.2 },

  // Campos en el cuerpo del contrato
  NOMBRE: { x1: 108.0, y1: 350.0, x2: 247.5, y2: 359.0 },
  // Correo electrónico del alumno (ajustado)
  CORREO_ELECTRONICO: { x1: 141.0, y1: 373.0, x2: 323.0, y2: 385.5 },
  // Punto alternativo proporcionado: (178.8, 376.0) - ignorado por ahora al usar el rectángulo
  // Nombre del tutor en el formulario (ajustado)
  NOMBRE_TUTOR_FORM: { x1: 129.0, y1: 386.0, x2: 311.5, y2: 395.0 },
  // Alergias: indicador SI / NO
  ALERGIAS: { x1: 121.50, y1: 397.00, x2: 238.00, y2: 406.50 },
  // Alergias detalle (a cuáles) nuevo rect
  ALERGIAS_DETALLE: { x1: 72.50, y1: 408.00, x2: 250.00, y2: 418.50 },
  // Discapacidad (segundo campo) - proviene de discapacidad / discapacidad2 (o typo dsicapacidad2)
  DISCAPACIDAD2: { x1: 459.5, y1: 397.5, x2: 583.0, y2: 407.0 },
  // Apellidos (ajustado)
  APELLIDOS: { x1: 312.0, y1: 349.0, x2: 581.5, y2: 358.0 },
  // UNIVERSIDADES a postularse (ajuste fino solicitado)
  UNIVERSIDAD: { x1: 209.50, y1: 450.00, x2: 353.50, y2: 459.00 },
  // Campo adicional: LICENCIATURAS a postularse (segunda caja a la derecha)
  // Campo adicional: LICENCIATURAS a postularse (coordenadas actualizadas)
  LICENCIATURAS: { x1: 430.00, y1: 451.00, x2: 563.00, y2: 459.00 },
  POSTULACION: { x1: 86.0, y1: 463.0, x2: 178.5, y2: 471.0 },
  // Orientación vocacional-psicoeducativa: marcar SI o NO
  ORIENTACION_SI: { x1: 293.0, y1: 419.5, x2: 307.0, y2: 428.5 },
  ORIENTACION_NO: { x1: 341.33, y1: 419.67, x2: 350.67, y2: 428.33 },
  // Planes (marcar con X según tipo de plan)
  // PLAN_MENSUAL (ajuste solicitado)
  PLAN_MENSUAL: { x1: 530.50, y1: 622.00, x2: 539.00, y2: 629.00 },
  // PLAN_START (nuevo ajuste solicitado)
  PLAN_START: { x1: 531.50, y1: 648.00, x2: 539.50, y2: 654.50 },
  // PLAN_PREMIUM (ajuste solicitado)
  PLAN_PREMIUM: { x1: 531.50, y1: 633.00, x2: 539.00, y2: 639.50 },

  // Número de teléfono del estudiante (ajustado)
  TELEFONO_ESTUDIANTE: { x1: 505.5, y1: 371.0, x2: 582.0, y2: 383.5 },
  // Número de teléfono del tutor
  TELEFONO_TUTOR: { x1: 487.5, y1: 386.5, x2: 582.0, y2: 396.0 },

  // ====== Página 2: Fecha del contrato (DÍA / MES / AÑO) ======
  // Coordenadas medidas desde el origen superior-izquierdo
  // DÍA
  P2_FECHA_DIA: { x1: 158.50, y1: 658.00, x2: 174.50, y2: 669.00 },
  // MES (nombre)
  P2_FECHA_MES: { x1: 209.00, y1: 660.00, x2: 254.00, y2: 667.00 },
  // AÑO (4 dígitos)
  P2_FECHA_ANIO: { x1: 268.50, y1: 660.00, x2: 295.00, y2: 668.00 },
  // Nueva fecha de inicio (DIA MES(letras) AÑO) en segunda hoja
  P2_FECHA_INICIO_LARGO: { x1: 29.00, y1: 180.00, x2: 166.50, y2: 190.50 },
  // Fecha de inicio +1 mes (segunda línea)
  P2_FECHA_INICIO_LARGO_MAS1: { x1: 28.50, y1: 191.50, x2: 167.50, y2: 201.00 },
  // Fecha de inicio +2 meses (tercera línea)
  P2_FECHA_INICIO_LARGO_MAS2: { x1: 28.50, y1: 201.50, x2: 166.50, y2: 211.00 },
  // Fecha de inicio +3 meses (cuarta línea izquierda)
  P2_FECHA_INICIO_LARGO_MAS3: { x1: 29.20, y1: 212.00, x2: 166.80, y2: 220.80 },
  // Columna derecha de fechas (continuación +4 a +7 meses)
  P2_FECHA_INICIO_LARGO_COL2_MAS4: { x1: 306.40, y1: 180.00, x2: 443.60, y2: 189.60 },
  P2_FECHA_INICIO_LARGO_COL2_MAS5: { x1: 306.80, y1: 191.60, x2: 443.60, y2: 201.20 },
  P2_FECHA_INICIO_LARGO_COL2_MAS6: { x1: 306.40, y1: 202.40, x2: 443.20, y2: 210.40 },
  P2_FECHA_INICIO_LARGO_COL2_MAS7: { x1: 306.80, y1: 211.60, x2: 443.60, y2: 220.40 },
  
  // Mes actual (nombre) en cabecera/sección indicada por el usuario
  // Fecha set 1 (mes actual y +8) en línea inferior
  // MES_ACTUAL (ajuste fino de coordenadas solicitado)
  MES_ACTUAL: { x1: 502.00, y1: 79.00, x2: 572.00, y2: 87.50 },
  MES_MAS_8: { x1: 284.50, y1: 90.00, x2: 327.50, y2: 97.50 },
  // Fecha set 2 (otra fecha) 
  MES_ACTUAL_2: { x1: 467.67, y1: 292.00, x2: 508.67, y2: 297.00 },
  MES_MAS_8_2: { x1: 332.33, y1: 299.00, x2: 376.67, y2: 304.33 },
  // Nuevo mes actual adicional (Set 3) 
  MES_ACTUAL_3: { x1: 467.00, y1: 292.00, x2: 509.50, y2: 298.00 },
};

// Dibuja texto dentro de un rect definido desde el origen superior usando pdf-lib (origen inferior)
const drawTextInTopRect = (page, text, rect, opts = {}) => {
  if (!text) return;
  const { height } = page.getSize();
  const rectWidth = Math.max(0, (rect.x2 - rect.x1));
  const rectHeight = Math.max(0, (rect.y2 - rect.y1));
  // Tamaño objetivo: quepa en la altura del rect (con pequeño margen)
  const baseSize = typeof opts.size === 'number' ? opts.size : FUENTES.tamaño.normal;
  const targetSize = Math.max(6, Math.min(baseSize, rectHeight - 1));
  const x = rect.x1;
  const yBase = height - rect.y1 - targetSize; // convertir top->bottom y alinear por arriba
  const finalOpts = {
    ...opts,
    size: targetSize,
    maxWidth: rectWidth,
    align: 'left',
  };
  drawTextAt(page, String(text), { x, y: yBase }, finalOpts);
};

// Convierte rect top-origin (x1,y1,x2,y2) a parámetros para drawRectangle de pdf-lib
const topRectToPdfRect = (page, rect) => {
  const { height } = page.getSize();
  const w = Math.max(0, rect.x2 - rect.x1);
  const h = Math.max(0, rect.y2 - rect.y1);
  const x = rect.x1;
  const y = height - rect.y2; // y en pdf-lib (origen inferior)
  return { x, y, width: w, height: h };
};

const drawTopRectOutline = (page, rect, color = rgb(1, 0, 0)) => {
  const r = topRectToPdfRect(page, rect);
  page.drawRectangle({ x: r.x, y: r.y, width: r.width, height: r.height, borderColor: color, borderWidth: 0.7 });
};

// Dibuja un rectángulo blanco (para "borrar" fondo) y luego el texto en rojo dentro del rect top-origin
// Útil cuando el PDF base tiene tablas o textos que se quieren sobre-escribir visualmente
const drawOverlayTextInTopRect = (page, text, rect, opts = {}) => {
  if (!text) return;
  const { height } = page.getSize();
  const w = Math.max(0, rect.x2 - rect.x1);
  const h = Math.max(0, rect.y2 - rect.y1);
  const pdfY = height - rect.y2; // posición inferior para pdf-lib
  // Fondo blanco ligeramente expandido para tapar líneas finas de tabla
  page.drawRectangle({ x: rect.x1 - 0.6, y: pdfY - 0.4, width: w + 1.2, height: h + 0.8, color: rgb(1, 1, 1) });
  drawTextInTopRect(page, text, rect, opts);
};

// Añade meses clamping el día (evita que 30 -> 02 siguiente mes si el mes intermedio no tiene ese día)
const addMonthsClamped = (date, monthsToAdd) => {
  const year = date.getFullYear();
  const month = date.getMonth() + monthsToAdd;
  const desiredDay = date.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(desiredDay, lastDay);
  return new Date(year, month, day);
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
  // Preferir columnas reales de la BD: nombre, apellidos
  let nombre = String(alumno.nombre || '').trim();
  let apellidos = String(alumno.apellidos || '').trim();
  // Compatibilidad: si no vienen separados, intentar partir 'alumno'
  if (!nombre && !apellidos && alumno.alumno) {
    const partes = String(alumno.alumno).trim().split(/\s+/);
    nombre = partes[0] || '';
    apellidos = partes.slice(1).join(' ');
  }
  const nombreCompleto = [nombre, apellidos].filter(Boolean).join(' ');
  // Universidades (dos campos en BD). Aceptar strings con comas y deduplicar
  const uniSet = new Set();
  const pushParts = (s) => {
    if (!s) return;
    String(s)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(v => uniSet.add(v.toUpperCase()));
  };
  pushParts(alumno.universidades1);
  pushParts(alumno.universidades2);
  const universidadObjetivo = Array.from(uniSet).join(', ');
  // Carrera / licenciatura a la que se postula
  const postulacion = String(alumno.postulacion || alumno.carrera || alumno.licenciatura || '')
    .trim()
    .toUpperCase();
  // Orientación (Si/No)
  const normalizeSiNo = (val) => {
    const s = String(val || '').trim().toUpperCase();
    if (['SI', 'SÍ', 'S', 'TRUE', '1', 'YES', 'Y'].includes(s)) return 'SI';
    if (['NO', 'N', 'FALSE', '0'].includes(s)) return 'NO';
    return '';
  };
  const orientacion = normalizeSiNo(alumno.orientacion);
  
  // Utilidades de extracción segura
  const pickFirst = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
    }
    return '';
  };

  const telefonoEst = pickFirst(
    alumno.telefono, // columna oficial
    alumno.tel,
    alumno.telefonoEstudiante,
    alumno.tel_estudiante,
    alumno.celular,
    alumno.cel,
    alumno.phone,
    alumno.telefonoAlumno,
    alumno.telefono_alumno,
    alumno.num_telefono,
    alumno.numeroTelefono,
    alumno.numeroTelefonoEstudiante
  );

  const telefonoTut = pickFirst(
    alumno.tel_tutor, // columna oficial
    alumno.telefonoTutor,
    alumno.telefono_del_tutor,
    alumno.telefonoTutorAlumno,
    alumno.tutorTelefono,
    alumno.phoneTutor
  );

  const correo = pickFirst(
    alumno.email, // columna oficial
    alumno.correoElectronico,
    alumno.correo,
    alumno.mail
  );

  const nombreTut = pickFirst(
    alumno.nombre_tutor, // columna oficial
    alumno.nombreTutor,
    alumno.tutor,
    alumno.nom_tutor
  );

  // Alergias: combinar alergia y alergia2
  const alergiasList = [
    String(alumno.alergia || '').trim(),
    String(alumno.alergia2 || '').trim(),
  ].filter(Boolean);
  const alergiasCombined = alergiasList.join(', ');

  // Discapacidad: soportar nombres variados (discapacidad, discapacidad2, dsicapacidad2)
  const discapacidadPrim = String(alumno.discapacidad || alumno.discapacidad1 || '').trim();
  const discapacidadSec = String(alumno.discapacidad2 || alumno.dsicapacidad2 || '').trim();
  const discapacidad2Text = [discapacidadPrim, discapacidadSec].filter(Boolean).join(', ').toUpperCase();

  // Nivel académico: combinar academico1/academico2/semestre si existen
  const nivelList = [
    String(alumno.academico1 || '').trim(),
    String(alumno.academico2 || '').trim(),
    String(alumno.semestre || '').trim(),
  ].filter(Boolean);
  const nivelAcademicoText = nivelList.join(' - ');

  // Seguimiento psicológico: solo si viene algo de la BD
  const segVal = (alumno.seguimientoPsicologico === true || String(alumno.seguimientoPsicologico).trim().toLowerCase() === 'true')
    ? 'SÍ' : (String(alumno.seguimientoPsicologico).trim() === '' || alumno.seguimientoPsicologico === undefined ? '' : 'NO');

  // Plan: normalizar (mensual, start, premium)
  const planRaw = String(alumno.plan || alumno.planCurso || '').trim().toLowerCase();
  let planTipo = '';
  if (/(mensual|month|mes)/i.test(planRaw)) planTipo = 'MENSUAL';
  else if (/start/i.test(planRaw)) planTipo = 'START';
  else if (/prem/i.test(planRaw)) planTipo = 'PREMIUM';

  return {
    // Datos básicos
  nombre: sanitizeValue(nombre.toUpperCase()),
  apellidos: sanitizeValue(apellidos.toUpperCase()),
  nombreCompleto: sanitizeValue(nombreCompleto.toUpperCase()),
    
    // Datos académicos
  nivelAcademico: sanitizeValue(nivelAcademicoText ? nivelAcademicoText.toUpperCase() : (alumno.nivelAcademico ? String(alumno.nivelAcademico).toUpperCase() : '')), // se mostrará solo si showNivelAcademico === true
    
    // Contacto
  correoElectronico: sanitizeValue(correo),
  telefono: sanitizeValue(telefonoEst),
    
    // Tutor (si aplica)
  nombreTutor: sanitizeValue(nombreTut),
  telefonoTutor: sanitizeValue(telefonoTut),
    
    // Datos médicos
  alergias: sanitizeValue(alergiasCombined ? alergiasCombined.toUpperCase() : (alumno.alergias ? String(alumno.alergias).toUpperCase() : '')),
  discapacidad2Text: sanitizeValue(discapacidad2Text),
    seguimientoPsicologico: segVal,
    
    // Datos del curso
  categoria: sanitizeValue(alumno.categoria || ''),
  planCurso: sanitizeValue(alumno.plan || alumno.planCurso || ''),
  planTipo,
  turno: alumno.turno || '',
    
    // Datos financieros
  pagoCurso: sanitizeValue(alumno.pagoCurso || ''),
  metodoPago: sanitizeValue(alumno.metodoPago || ''),
    
    // Fechas
  fechaEntrada: sanitizeValue(alumno.fechaEntrada || ''),
    
    // Identificadores
  folio: sanitizeValue(alumno.folio_formateado || alumno.folioFormat || alumno.folio || ''),
    id: alumno.id,
    // Universidades objetivo
    universidadObjetivo: sanitizeValue(universidadObjetivo),
    carreraPostulacion: sanitizeValue(postulacion),
    orientacion: sanitizeValue(orientacion)
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
    debug = false, // ya no activa marcadores visuales; solo se conserva para compatibilidad
    bold = false,
    yAdjust = 0, // ajustar si se quiere alinear visualmente con media altura
  } = opts || {};

  // Marcadores visuales desactivados por defecto; use opts.debugMarkers === true para activarlos explícitamente
  const debugMarkers = Boolean(opts && opts.debugMarkers);

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

  if (debugMarkers) {
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
  const debugLegacy = Boolean(opciones.debugLegacy);
  const showOutlines = Boolean(opciones.showOutlines); // outlines desactivados por defecto
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  try {
    if (debug) {
      console.log('[PDF DEBUG] Datos procesados:', {
        telefono: datosAlumno.telefono,
        telefonoTutor: datosAlumno.telefonoTutor,
        universidadObjetivo: datosAlumno.universidadObjetivo,
        carreraPostulacion: datosAlumno.carreraPostulacion,
        orientacion: datosAlumno.orientacion,
        nombreTutor: datosAlumno.nombreTutor,
        correoElectronico: datosAlumno.correoElectronico
      });
    }
    // Rellenar campos del estudiante
    if (datosAlumno.nombre) {
      if (RECT_TOP_ORIGIN.NOMBRE) {
        drawTextInTopRect(firstPage, datosAlumno.nombre, RECT_TOP_ORIGIN.NOMBRE, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.NOMBRE, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.nombre, getCoords('nombre'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 360 });
      }
    }

    if (datosAlumno.apellidos) {
      if (RECT_TOP_ORIGIN.APELLIDOS) {
        drawTextInTopRect(firstPage, datosAlumno.apellidos, RECT_TOP_ORIGIN.APELLIDOS, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.APELLIDOS, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.apellidos, getCoords('apellidos'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 180 });
      }
    }

    // Nivel académico (oculto por defecto; requiere opciones.showNivelAcademico === true)
    if (opciones.showNivelAcademico === true && datosAlumno.nivelAcademico) {
      drawTextAt(firstPage, datosAlumno.nivelAcademico, getCoords('nivelAcademico'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy, maxWidth: 300 });
    }

    if (datosAlumno.correoElectronico) {
      if (RECT_TOP_ORIGIN.CORREO_ELECTRONICO) {
        drawTextInTopRect(firstPage, datosAlumno.correoElectronico, RECT_TOP_ORIGIN.CORREO_ELECTRONICO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.CORREO_ELECTRONICO, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.correoElectronico, getCoords('correoElectronico'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 420 });
      }
    }

    if (datosAlumno.telefono) {
      if (RECT_TOP_ORIGIN.TELEFONO_ESTUDIANTE) {
        drawTextInTopRect(firstPage, datosAlumno.telefono, RECT_TOP_ORIGIN.TELEFONO_ESTUDIANTE, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.TELEFONO_ESTUDIANTE, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.telefono, getCoords('telefono'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy, maxWidth: 140, align: 'left' });
      }
    }

    if (datosAlumno.nombreTutor) {
      if (RECT_TOP_ORIGIN.NOMBRE_TUTOR_FORM) {
        drawTextInTopRect(firstPage, datosAlumno.nombreTutor, RECT_TOP_ORIGIN.NOMBRE_TUTOR_FORM, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.NOMBRE_TUTOR_FORM, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.nombreTutor, getCoords('nombreTutor'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug, maxWidth: 300 });
      }
    }

    if (datosAlumno.telefonoTutor) {
      if (RECT_TOP_ORIGIN.TELEFONO_TUTOR) {
        drawTextInTopRect(firstPage, datosAlumno.telefonoTutor, RECT_TOP_ORIGIN.TELEFONO_TUTOR, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.TELEFONO_TUTOR, rgb(0.2, 0.6, 1));
      } else {
        drawTextAt(firstPage, datosAlumno.telefonoTutor, getCoords('telefonoTutor'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy, maxWidth: 140 });
      }
    }

    if (datosAlumno.alergias) {
      const rawAlergias = datosAlumno.alergias.trim();
      const rawUpper = rawAlergias.toUpperCase();
      const tokensNo = ['NO','NINGUNA','NO APLICA','SIN','SIN ALERGIAS'];
      const tokensYesOnly = ['SI','SÍ','SI.'];
      // Separar posibles ítems
      let partes = rawUpper.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      // Filtrar tokens que son sólo indicadores
      const partesDetalle = partes.filter(p => !tokensYesOnly.includes(p) && !tokensNo.includes(p));
      // Determinar indicador final
      let indicador;
      if (!rawUpper || tokensNo.includes(rawUpper)) indicador = 'NO';
      else indicador = 'SI';
      if (RECT_TOP_ORIGIN.ALERGIAS) {
        drawTextInTopRect(firstPage, indicador, RECT_TOP_ORIGIN.ALERGIAS, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.ALERGIAS, rgb(0.2, 0.6, 1));
      }
      if (RECT_TOP_ORIGIN.ALERGIAS_DETALLE) {
        if (partesDetalle.length) {
          const detalle = partesDetalle.join(', ');
          drawTextInTopRect(firstPage, detalle, RECT_TOP_ORIGIN.ALERGIAS_DETALLE, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        } else if (indicador === 'NO') {
          drawTextInTopRect(firstPage, 'NO APLICA', RECT_TOP_ORIGIN.ALERGIAS_DETALLE, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        }
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.ALERGIAS_DETALLE, rgb(0.2, 0.6, 1));
      }
      if (debugLegacy && getCoords('alergias')) {
        drawTextAt(firstPage, rawUpper, getCoords('alergias'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy, maxWidth: 420 });
      }
    }

    // Discapacidad (campo adicional)
    if (datosAlumno.discapacidad2Text) {
      if (RECT_TOP_ORIGIN.DISCAPACIDAD2) {
  drawTextInTopRect(firstPage, datosAlumno.discapacidad2Text, RECT_TOP_ORIGIN.DISCAPACIDAD2, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.DISCAPACIDAD2, rgb(0.2, 0.6, 1));
      }
    }

    // Seguimiento psicológico (oculto por defecto en nueva plantilla)
    if (opciones.showSeguimiento === true) {
      drawTextAt(firstPage, datosAlumno.seguimientoPsicologico, COORDENADAS_CAMPOS.seguimientoPsicologico, { font, fontBold, bold: true, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy });
    }

    // Monto del curso (oculto por defecto)
    if (opciones.showMonto === true && datosAlumno.pagoCurso) {
      drawTextAt(firstPage, datosAlumno.pagoCurso, getCoords('monto'), { font, fontBold, bold: true, color: COLORES.camposVariables, size: FUENTES.tamaño.destacado, debug: debugLegacy, maxWidth: 180 });
    }

    // Plan del curso (oculto por defecto)
    if (opciones.showPlanCurso === true && datosAlumno.planCurso) {
      drawTextAt(firstPage, datosAlumno.planCurso, getCoords('planCurso'), { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug: debugLegacy, maxWidth: 360 });
    }

    // FOLIO (usando rectángulo top-origin especificado por el usuario) en página 1 y también en página 2
    let folioTextSeleccionado = '';
    if (datosAlumno.folio || (opciones && typeof opciones.sampleFolioText === 'string')) {
      const folioClean = datosAlumno.folio ? String(datosAlumno.folio).replace(/\s+/g, '') : '';
      folioTextSeleccionado = (opciones && typeof opciones.sampleFolioText === 'string' && opciones.sampleFolioText)
        ? String(opciones.sampleFolioText)
        : folioClean;
      if (folioTextSeleccionado) {
        drawTextInTopRect(firstPage, folioTextSeleccionado, RECT_TOP_ORIGIN.FOLIO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.FOLIO, rgb(0.2, 0.6, 1));
      }
    }

    // FECHA (cabecera) ahora visible en ambas páginas: usar fechaEntrada o sampleFechaText
    const fechaCabeceraText = datosAlumno.fechaEntrada
      || (opciones && typeof opciones.sampleFechaText === 'string' && opciones.sampleFechaText)
      || '';
    if (fechaCabeceraText) {
      drawTextInTopRect(firstPage, fechaCabeceraText, RECT_TOP_ORIGIN.FECHA, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
      if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.FECHA, rgb(0.2, 0.6, 1));
    }

    // NOMBRE TUTOR (cabecera)
    const nombreTutorText = datosAlumno.nombreTutor
      || (opciones && typeof opciones.sampleNombreTutorText === 'string' && opciones.sampleNombreTutorText)
      || '';
    if (nombreTutorText) {
      drawTextInTopRect(firstPage, nombreTutorText, RECT_TOP_ORIGIN.NOMBRE_TUTOR, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    }
  if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.NOMBRE_TUTOR, rgb(0.2, 0.6, 1));


    // UNIVERSIDAD(ES) objetivo del alumno (desde universidades1/universidades2)
    const uniText = (datosAlumno.universidadObjetivo && datosAlumno.universidadObjetivo.trim())
      || (opciones && typeof opciones.sampleUniversidadText === 'string' && opciones.sampleUniversidadText)
      || '';
    if (uniText) {
      // Solo universidades en su rectángulo izquierdo
      drawTextInTopRect(firstPage, uniText, RECT_TOP_ORIGIN.UNIVERSIDAD, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    }
    // Licenciatura / carrera va en el rect LICENCIATURAS (derecha)
    const carreraText = (datosAlumno.carreraPostulacion && datosAlumno.carreraPostulacion.trim())
      || (datosAlumno.postulacion && datosAlumno.postulacion.trim())
      || (opciones && typeof opciones.samplePostulacionText === 'string' && opciones.samplePostulacionText)
      || '';
    if (carreraText && RECT_TOP_ORIGIN.LICENCIATURAS) {
      drawTextInTopRect(firstPage, carreraText.toUpperCase(), RECT_TOP_ORIGIN.LICENCIATURAS, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    }
    if (showOutlines) {
      drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.UNIVERSIDAD, rgb(0.2, 0.6, 1));
      if (RECT_TOP_ORIGIN.LICENCIATURAS) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.LICENCIATURAS, rgb(0.2, 0.6, 1));
    }

    // ORIENTACIÓN (SI/NO) marcar con 'X' el correspondiente
    const oriValue = (datosAlumno.orientacion && datosAlumno.orientacion.trim())
      || (opciones && typeof opciones.sampleOrientacion === 'string' && opciones.sampleOrientacion.trim().toUpperCase())
      || '';
    if (oriValue === 'SI') {
  drawTextInTopRect(firstPage, 'X', RECT_TOP_ORIGIN.ORIENTACION_SI, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    } else if (oriValue === 'NO') {
  drawTextInTopRect(firstPage, 'X', RECT_TOP_ORIGIN.ORIENTACION_NO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
    }
    if (showOutlines) {
      drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.ORIENTACION_SI, rgb(0.2, 0.6, 1));
      drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.ORIENTACION_NO, rgb(0.2, 0.6, 1));
      if (RECT_TOP_ORIGIN.TELEFONO_ESTUDIANTE) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.TELEFONO_ESTUDIANTE, rgb(0.2, 0.6, 1));
      if (RECT_TOP_ORIGIN.TELEFONO_TUTOR) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.TELEFONO_TUTOR, rgb(0.2, 0.6, 1));
    }

    // PLAN (Mensual / Start / Premium) marcar con 'X'
    if (datosAlumno.planTipo) {
      if (datosAlumno.planTipo === 'MENSUAL' && RECT_TOP_ORIGIN.PLAN_MENSUAL) {
  drawTextInTopRect(firstPage, 'X', RECT_TOP_ORIGIN.PLAN_MENSUAL, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.PLAN_MENSUAL, rgb(0.2, 0.6, 1));
      }
      if (datosAlumno.planTipo === 'START' && RECT_TOP_ORIGIN.PLAN_START) {
  drawTextInTopRect(firstPage, 'X', RECT_TOP_ORIGIN.PLAN_START, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.PLAN_START, rgb(0.2, 0.6, 1));
      }
      if (datosAlumno.planTipo === 'PREMIUM' && RECT_TOP_ORIGIN.PLAN_PREMIUM) {
  drawTextInTopRect(firstPage, 'X', RECT_TOP_ORIGIN.PLAN_PREMIUM, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
        if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.PLAN_PREMIUM, rgb(0.2, 0.6, 1));
      }
    }

    // ====== Página 2 (o fallback a Página 1 si solo hay una): Fecha y bloques de meses ======
    const pagesAll = pdfDoc.getPages();
    const hasSecond = pagesAll.length >= 2;
    const secondPage = hasSecond ? pagesAll[1] : pagesAll[0];
    if (debug) console.log('[PDF DEBUG] totalPaginas=', pagesAll.length, 'usandoFallbackSegunda=', !hasSecond);
  if (secondPage) {
      const ahora = new Date();
      const diaStr = String(ahora.getDate()).padStart(2, '0');
      // Mes en español (nombre) en mayúsculas
      const mesStr = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(ahora).toUpperCase();
      const anioStr = String(ahora.getFullYear());

      if (hasSecond) {
        // Solo imprimimos el bloque día/mes/año si realmente existe segunda página
        drawTextInTopRect(secondPage, diaStr, RECT_TOP_ORIGIN.P2_FECHA_DIA, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        drawTextInTopRect(secondPage, mesStr, RECT_TOP_ORIGIN.P2_FECHA_MES, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        drawTextInTopRect(secondPage, anioStr, RECT_TOP_ORIGIN.P2_FECHA_ANIO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        // Nueva fecha inicio larga (ej: 30 SEPTIEMBRE 2025)
        if (RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO) {
          const fechaInicioLargo = `${diaStr} ${mesStr} ${anioStr}`;
          drawTextInTopRect(secondPage, fechaInicioLargo, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
          if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO, rgb(0.2, 0.6, 1));
          // Fecha un mes después
          if (RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS1) {
            const baseDate = addMonthsClamped(ahora, 1);
            const dia2 = String(baseDate.getDate()).padStart(2, '0');
            const mes2 = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(baseDate).toUpperCase();
            const anio2 = String(baseDate.getFullYear());
            const fechaMas1 = `${dia2} ${mes2} ${anio2}`;
            drawTextInTopRect(secondPage, fechaMas1, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS1, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
            if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS1, rgb(0.2, 0.6, 1));
            // Fecha +2 meses
            if (RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS2) {
              const baseDate2 = addMonthsClamped(ahora, 2);
              const dia3 = String(baseDate2.getDate()).padStart(2, '0');
              const mes3 = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(baseDate2).toUpperCase();
              const anio3 = String(baseDate2.getFullYear());
              const fechaMas2 = `${dia3} ${mes3} ${anio3}`;
              drawTextInTopRect(secondPage, fechaMas2, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS2, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
              if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS2, rgb(0.2, 0.6, 1));
              // Fecha +3 meses
              if (RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS3) {
                const baseDate3 = addMonthsClamped(ahora, 3);
                const dia4 = String(baseDate3.getDate()).padStart(2, '0');
                const mes4 = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(baseDate3).toUpperCase();
                const anio4 = String(baseDate3.getFullYear());
                const fechaMas3 = `${dia4} ${mes4} ${anio4}`;
                drawTextInTopRect(secondPage, fechaMas3, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS3, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
                if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_INICIO_LARGO_MAS3, rgb(0.2, 0.6, 1));
              }
              // Columna derecha +4 a +7 meses
              const fechasCol2 = [
                { key: 'P2_FECHA_INICIO_LARGO_COL2_MAS4', offset: 4 },
                { key: 'P2_FECHA_INICIO_LARGO_COL2_MAS5', offset: 5 },
                { key: 'P2_FECHA_INICIO_LARGO_COL2_MAS6', offset: 6 },
                { key: 'P2_FECHA_INICIO_LARGO_COL2_MAS7', offset: 7 },
              ];
              for (const cfg of fechasCol2) {
                const rect = RECT_TOP_ORIGIN[cfg.key];
                if (!rect) continue;
                const bd = addMonthsClamped(ahora, cfg.offset);
                const d = String(bd.getDate()).padStart(2, '0');
                const m = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(bd).toUpperCase();
                const y = String(bd.getFullYear());
                const fstr = `${d} ${m} ${y}`;
                drawTextInTopRect(secondPage, fstr, rect, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
                if (showOutlines) drawTopRectOutline(secondPage, rect, rgb(0.2, 0.6, 1));
              }
            }
          }
        }
      } else if (debug) {
        console.log('[PDF DEBUG] No hay segunda página: omitiendo P2_FECHA_DIA/MES/AÑO');
      }

      // MES ACTUAL (nombre del mes) en coordenada indicada (segunda hoja)
      try {
        const baseDate = new Date();
        const mesActualTexto = (opciones && typeof opciones.sampleMesActualText === 'string' && opciones.sampleMesActualText)
          || new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(baseDate).toUpperCase();
        // Eliminado mes +8 (ya no se requiere). Sólo mes actual.
        const mesMas8Texto = null;

        // Set 1
        if (opciones.hideMesSet1 !== true) {
          if (mesActualTexto && RECT_TOP_ORIGIN.MES_ACTUAL) {
            drawTextInTopRect(secondPage, mesActualTexto, RECT_TOP_ORIGIN.MES_ACTUAL, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
            if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.MES_ACTUAL, rgb(0.2, 0.6, 1));
          }
          // Omitido MES_MAS_8
        }
        // Set 2 (otra fecha) AHORA por defecto visible salvo que se oculte
        if (opciones.hideMesSet2 !== true) {
          if (debug) console.log('[PDF DEBUG] Intentando dibujar MES_ACTUAL_2 en', RECT_TOP_ORIGIN.MES_ACTUAL_2);
          if (mesActualTexto && RECT_TOP_ORIGIN.MES_ACTUAL_2) {
            drawOverlayTextInTopRect(secondPage, mesActualTexto, RECT_TOP_ORIGIN.MES_ACTUAL_2, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
            if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.MES_ACTUAL_2, rgb(0.2, 0.6, 1));
          } else if (debug) {
            console.warn('[PDF DEBUG] No se dibujó MES_ACTUAL_2. mesActualTexto=', mesActualTexto);
          }
          // Omitido MES_MAS_8_2
        }
        // Set 3: solo mes actual en nueva coordenada
        if (opciones.showMesSet3 === true) {
          if (debug) console.log('[PDF DEBUG] Intentando dibujar MES_ACTUAL_3 en', RECT_TOP_ORIGIN.MES_ACTUAL_3);
          if (RECT_TOP_ORIGIN.MES_ACTUAL_3 && mesActualTexto) {
            drawOverlayTextInTopRect(secondPage, mesActualTexto, RECT_TOP_ORIGIN.MES_ACTUAL_3, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
            if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.MES_ACTUAL_3, rgb(0.2, 0.8, 0.4));
          } else if (debug) {
            console.warn('[PDF DEBUG] No se dibujó MES_ACTUAL_3. mesActualTexto=', mesActualTexto);
          }
        }
      } catch (e) {
        if (debug) console.warn('No se pudo renderizar meses (segunda hoja):', e);
      }

      // Folio también en la segunda hoja (misma coordenada)
      if (folioTextSeleccionado) {
        drawTextInTopRect(secondPage, folioTextSeleccionado, RECT_TOP_ORIGIN.FOLIO, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.normal, debug });
        if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.FOLIO, rgb(0.2, 0.6, 1));
      }

      // Fecha cabecera también en segunda hoja si existe texto
      if (fechaCabeceraText) {
        drawTextInTopRect(secondPage, fechaCabeceraText, RECT_TOP_ORIGIN.FECHA, { font, fontBold, color: COLORES.camposVariables, size: FUENTES.tamaño.pequeño, debug });
        if (showOutlines) drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.FECHA, rgb(0.2, 0.6, 1));
      }

      if (showOutlines && hasSecond) {
        drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_DIA, rgb(0.2, 0.6, 1));
        drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_MES, rgb(0.2, 0.6, 1));
        drawTopRectOutline(secondPage, RECT_TOP_ORIGIN.P2_FECHA_ANIO, rgb(0.2, 0.6, 1));
      }
    }

    // FECHA (Día/Mes/Año) en el cuerpo de la PÁGINA 1 DESACTIVADA POR DEFECTO
      // FECHA (Día/Mes/Año) en el cuerpo de la PÁGINA 1 DESACTIVADA POR DEFECTO
      // Solo se imprimirá si se pasa opciones.showFechaPagina1 === true
      if (opciones && opciones.showFechaPagina1 === true) {
        const fechaRaw2 = opciones && opciones.fechaContrato ? new Date(opciones.fechaContrato) : new Date();
        const fechaOk2 = isNaN(fechaRaw2?.getTime?.()) ? new Date() : fechaRaw2;
        const dia2 = String(fechaOk2.getDate()).padStart(2, '0');
        const mesNombre2 = fechaOk2.toLocaleDateString('es-MX', { month: 'long' }).toUpperCase();
        const anio2 = String(fechaOk2.getFullYear());

        if (RECT_TOP_ORIGIN.FECHA_DIA) {
          drawTextInTopRect(firstPage, dia2, RECT_TOP_ORIGIN.FECHA_DIA, { font, fontBold, color: COLORES.textoNormal, size: FUENTES.tamaño.pequeño, debug });
    if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.FECHA_DIA, rgb(0.2, 0.6, 1));
        }
        if (RECT_TOP_ORIGIN.FECHA_MES) {
          drawTextInTopRect(firstPage, mesNombre2, RECT_TOP_ORIGIN.FECHA_MES, { font, fontBold, color: COLORES.textoNormal, size: FUENTES.tamaño.pequeño, debug });
    if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.FECHA_MES, rgb(0.2, 0.6, 1));
        }
        if (RECT_TOP_ORIGIN.FECHA_ANIO) {
          drawTextInTopRect(firstPage, anio2, RECT_TOP_ORIGIN.FECHA_ANIO, { font, fontBold, color: COLORES.textoNormal, size: FUENTES.tamaño.pequeño, debug });
    if (showOutlines) drawTopRectOutline(firstPage, RECT_TOP_ORIGIN.FECHA_ANIO, rgb(0.2, 0.6, 1));
        }
    }
    
  console.log('✅ Campos PDF rellenados correctamente');
  return datosAlumno.folio || '';
    
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
    
    // 1. Crear documento base
  // Usar plantilla del backend expuesta por Express: /public/CONTRATO_C_E_E_A.pdf
  const plantillaUrl = opciones.templateUrl || '/public/CONTRATO_C_E_E_A.pdf';
    let pdfDoc;
    const wantsBlank = opciones.useTemplate === false || opciones.createBlank === true;
    if (wantsBlank) {
      // Crear PDF en blanco con tamaño configurable
      pdfDoc = await PDFDocument.create();
      const size = resolvePageSize(opciones.pageSize);
      pdfDoc.addPage(size);
    } else {
      try {
        const response = await fetch(plantillaUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`No se pudo cargar la plantilla PDF: ${response.status} ${response.statusText}`);
        }
        const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
        const arrayBuffer = await response.arrayBuffer();
        const u8 = new Uint8Array(arrayBuffer.slice(0, 5));
        const head = String.fromCharCode(...u8);
        const looksPdf = head === '%PDF-';
        if (!looksPdf || !contentType.includes('pdf')) {
          throw new Error('El recurso cargado no es un PDF válido (falta cabecera %PDF)');
        }
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (e) {
        if (opciones.debug || opciones.allowBlankFallback) {
          // Fallback: crear PDF en blanco para poder visualizar rectángulos/textos
          const showBanner = opciones.showMissingTemplateBanner !== false; // por defecto mostrar
          console.warn('⚠️ Plantilla no disponible o inválida. Usando página en blanco. Detalle:', e.message || e);
          pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage(resolvePageSize(opciones.pageSize));
          if (showBanner) {
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page.drawText('PLANTILLA NO ENCONTRADA - MODO DEBUG', { x: 40, y: page.getSize().height - 30, size: 10, font, color: rgb(1, 0, 0) });
            page.drawText('Coloca el archivo en client/public con el nombre exacto o pasa opciones.templateUrl', { x: 40, y: page.getSize().height - 44, size: 8, font, color: rgb(0.6, 0, 0) });
          }
        } else {
          throw new Error('No se pudo cargar la plantilla PDF. Verifica que el archivo exista en client/public o especifica opciones.templateUrl');
        }
      }
    }
    
    // 2. Procesar datos del alumno
    const datosAlumno = procesarDatosAlumno(alumno);
    
    // 3. Rellenar campos del PDF
  const folioRendered = await rellenarCamposPDF(pdfDoc, datosAlumno, opciones);
    
    // 4. (Opcional) Marca de agua PRELIMINAR
    if (opciones.preliminar === true) {
      try {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        pages.forEach(p => {
          const { width, height } = p.getSize();
          const text = 'PRELIMINAR';
          const fontSize = 72;
            const textWidth = font.widthOfTextAtSize(text, fontSize);
          p.drawText(text, {
            x: (width - textWidth) / 2,
            y: height / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(1, 0, 0),
            rotate: { type: 'degrees', angle: 30 },
            opacity: 0.12
          });
        });
      } catch (wmErr) {
        console.warn('No se pudo aplicar watermark PRELIMINAR:', wmErr);
      }
    }

    // 5. Generar el PDF final
  const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
  // 6. Configurar nombre del archivo
  const folioParaNombre = datosAlumno.folio || folioRendered || generarFolioContrato();
  const nombreArchivo = `Contrato_${folioParaNombre}_${datosAlumno.nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    
    console.log('✅ Contrato PDF generado exitosamente:', nombreArchivo);
    
  return {
      url,
      nombreArchivo,
  folio: folioParaNombre,
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