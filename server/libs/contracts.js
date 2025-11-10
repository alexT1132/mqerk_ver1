import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ==============================
// CONFIGURACIÓN PLANTILLA
// ==============================
// Ruta relativa (dentro de server/public) de la plantilla oficial.
const TEMPLATE_FILENAME = 'CONTRATO_C_E_E_A.pdf';

// Coordenadas (ejemplo) para los campos a rellenar.
// IMPORTANTE: Ajustar según la plantilla real usando una herramienta de calibración
// (puedes reutilizar la lógica del cliente pdfCalibrationService.js para encontrar valores exactos).
// El origen (0,0) de pdf-lib está en la ESQUINA INFERIOR IZQUIERDA.
const COORDS = {
  nombres: { x: 95, y: 640 },
  apellidos: { x: 300, y: 640 },
  folio_formateado: { x: 450, y: 700 },
  curso: { x: 95, y: 620 },
  plan: { x: 250, y: 620 },
  turno: { x: 380, y: 620 },
  modalidad: { x: 500, y: 620 },
  academia: { x: 95, y: 600 },
  nombre_tutor: { x: 95, y: 580 },
  tel_tutor: { x: 400, y: 580 },
  telefono: { x: 95, y: 560 },
  email: { x: 300, y: 560 },
  fecha_emision: { x: 95, y: 520 },
};

// Opciones tipográficas
const FONT_SIZES = {
  small: 8,
  normal: 10,
  large: 12
};

// ==============================
// UTILIDADES
// ==============================
function getTemplateAbsolutePath() {
  // server/libs/contracts.js -> subimos a raíz del proyecto y apuntamos a server/public
  // process.cwd() normalmente es la carpeta 'server' si arrancas con node server/index.js
  const base = process.cwd();
  // Si el proceso se lanza desde la raíz (monorepo), garantizar ruta server/public
  const publicPathCandidates = [
    path.join(base, 'public'),
    path.join(base, 'server', 'public'),
  ];
  for (const p of publicPathCandidates) {
    const candidate = path.join(p, TEMPLATE_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(base, 'public', TEMPLATE_FILENAME); // fallback
}

// Recorta texto si excede un ancho en caracteres (rápido). Para algo más preciso habría que medir stringWidth.
function truncate(text = '', maxChars = 55) {
  const t = String(text || '').trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars - 1) + '…';
}

// Dibuja texto seguro (ignora campos vacíos)
function drawField(page, font, cfg) {
  const { value, x, y, size = FONT_SIZES.normal, color = rgb(0,0,0) } = cfg;
  if (!value) return;
  page.drawText(String(value), { x, y, size, font, color });
}

// ==============================
// GENERACIÓN PRINCIPAL
// ==============================
/**
 * Genera un contrato PDF usando la PLANTILLA OFICIAL si existe.
 * Si la plantilla no se encuentra o hay error, cae a modo simple (texto plano).
 * @param {object} estudiante Registro del estudiante (nombres, apellidos, etc.)
 * @param {object} [options]
 * @param {boolean} [options.forceSimple=false] Forzar el modo simple ignorando la plantilla.
 */
export async function generarContratoEstudiante(estudiante, options = {}) {
  const { forceSimple = false } = options;
  const templateAbs = getTemplateAbsolutePath();
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  // Helper interno para modo simple original
  async function generateSimple() {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;
    page.drawText('CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS', { x: 50, y, size: 14, font: fontBold });
    y -= 30;
    page.drawText(`Fecha: ${fechaStr}`, { x: 50, y, size: 10, font });
    y -= 20;
    const lineas = [
      `Alumno: ${estudiante.nombres || estudiante.nombre || ''} ${estudiante.apellidos || ''}`,
      `Folio: ${estudiante.folio_formateado || estudiante.folio}`,
      `Curso: ${estudiante.curso || ''}  Plan: ${estudiante.plan || ''}  Turno: ${estudiante.turno || ''}`,
      `Modalidad: ${estudiante.modalidad || ''}  Academia: ${estudiante.academia || ''}`,
      `Tutor: ${estudiante.nombre_tutor || estudiante.nombreTutor || ''}  Tel. Tutor: ${estudiante.tel_tutor || estudiante.telefonoTutor || ''}`,
      `Teléfono Alumno: ${estudiante.telefono || estudiante.telefonoAlumno || ''}`,
      `Email Alumno: ${estudiante.email || estudiante.correoElectronico || ''}`,
      '',
      'Cláusulas:',
      '1. La academia se compromete a brindar los servicios educativos descritos en el plan contratado.',
      '2. El alumno y su tutor se comprometen a cumplir con las políticas y reglamentos internos.',
      '3. Los pagos efectuados no son reembolsables salvo disposición legal aplicable.',
      '4. Cualquier modificación al presente contrato deberá hacerse por escrito.',
      '',
      'Firmas:'
    ];
    for (const linea of lineas) {
      if (y < 60) {
        y = height - 50;
        page = pdfDoc.addPage();
      }
      page.drawText(linea, { x: 50, y, size: 10, font });
      y -= 16;
    }
    y -= 40;
    page.drawText('______________________________', { x: 50, y, size: 10, font });
    page.drawText('Alumno', { x: 80, y: y - 12, size: 10, font });
    page.drawText('______________________________', { x: 300, y, size: 10, font });
    page.drawText('Tutor', { x: 340, y: y - 12, size: 10, font });
    y -= 50;
    page.drawText('______________________________', { x: 50, y, size: 10, font });
    page.drawText('Representante Academia', { x: 50, y: y - 12, size: 10, font });
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  if (forceSimple) {
    return generateSimple();
  }

  // Intentar cargar plantilla
  try {
    if (!fs.existsSync(templateAbs)) {
      console.warn(`[contracts] Plantilla no encontrada en ${templateAbs}, usando modo simple.`);
      return generateSimple();
    }

    const bytes = await fs.promises.readFile(templateAbs);
    const pdfDoc = await PDFDocument.load(bytes);
    const page = pdfDoc.getPage(0);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Normalizar nombres de campos provenientes del modelo
    const data = {
      nombres: estudiante.nombres || estudiante.nombre || '',
      apellidos: estudiante.apellidos || '',
      folio_formateado: estudiante.folio_formateado || estudiante.folio || '',
      curso: estudiante.curso || '',
      plan: estudiante.plan || estudiante.plan_curso || '',
      turno: estudiante.turno || '',
      modalidad: estudiante.modalidad || estudiante.modality || '',
      academia: estudiante.academia || 'MQerKAcademy',
      nombre_tutor: estudiante.nombre_tutor || estudiante.nombreTutor || '',
      tel_tutor: estudiante.tel_tutor || estudiante.telefonoTutor || '',
      telefono: estudiante.telefono || estudiante.telefonoAlumno || estudiante.telefono_alumno || '',
      email: estudiante.email || estudiante.correoElectronico || '',
      fecha_emision: fechaStr,
    };

    // Dibujo de cada campo (truncando para evitar desbordes)
    drawField(page, font, { x: COORDS.nombres.x, y: COORDS.nombres.y, value: truncate(data.nombres, 30) });
    drawField(page, font, { x: COORDS.apellidos.x, y: COORDS.apellidos.y, value: truncate(data.apellidos, 35) });
    drawField(page, bold, { x: COORDS.folio_formateado.x, y: COORDS.folio_formateado.y, value: truncate(data.folio_formateado, 25), size: FONT_SIZES.large, color: rgb(0.75,0,0) });
    drawField(page, font, { x: COORDS.curso.x, y: COORDS.curso.y, value: truncate(data.curso, 15) });
    drawField(page, font, { x: COORDS.plan.x, y: COORDS.plan.y, value: truncate(data.plan, 20) });
    drawField(page, font, { x: COORDS.turno.x, y: COORDS.turno.y, value: truncate(data.turno, 15) });
    drawField(page, font, { x: COORDS.modalidad.x, y: COORDS.modalidad.y, value: truncate(data.modalidad, 15) });
    drawField(page, font, { x: COORDS.academia.x, y: COORDS.academia.y, value: truncate(data.academia, 25) });
    drawField(page, font, { x: COORDS.nombre_tutor.x, y: COORDS.nombre_tutor.y, value: truncate(data.nombre_tutor, 40) });
    drawField(page, font, { x: COORDS.tel_tutor.x, y: COORDS.tel_tutor.y, value: truncate(data.tel_tutor, 18) });
    drawField(page, font, { x: COORDS.telefono.x, y: COORDS.telefono.y, value: truncate(data.telefono, 18) });
    drawField(page, font, { x: COORDS.email.x, y: COORDS.email.y, value: truncate(data.email, 40) });
    drawField(page, font, { x: COORDS.fecha_emision.x, y: COORDS.fecha_emision.y, value: data.fecha_emision, size: FONT_SIZES.small });

    const output = await pdfDoc.save();
    return Buffer.from(output);
  } catch (err) {
    console.error('[contracts] Error usando plantilla, fallback simple:', err.message);
    return generateSimple();
  }
}
