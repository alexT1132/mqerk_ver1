import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { svgElementToPngDataUrl } from './svgToPng.js';
import { formatCurrencyMXN, formatDateTimeMX } from './formatters.js';

/**
 * Exporta un reporte completo y estructurado a Excel con múltiples hojas,
 * filtros, encabezados congelados y formatos básicos de números y fechas.
 * @param {Object} data
 * @param {string} filename
 * @param {Object} options - { startDate?: string, endDate?: string, generatedAt?: Date }
 */
export function exportReportToExcel(
  { resumenGeneral, ingresosPorMes, pagosPorCurso, metodosDepago, pagosDetallados, ingresosPorSemana, ingresosPorAnio },
  filename = 'reportes_pagos.xlsx',
  options = {}
) {
  const wb = XLSX.utils.book_new();

  const { startDate = '', endDate = '', generatedAt = new Date() } = options || {};

  // Helper: aplicar autofiltro y congelar encabezado
  const finalizeSheet = (ws) => {
    if (!ws || !ws['!ref']) return;
    try {
      ws['!autofilter'] = { ref: ws['!ref'] };
      // Congelar fila de encabezados (fila 1)
      ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
    } catch (_) { /* noop */ }
  };

  // Helper: formatear columna por encabezado
  const setFormatByHeader = (ws, headerName, { type = 'number', z } = {}) => {
    if (!ws || !ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    // localizar columna por encabezado en fila 1
    let targetCol = -1;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
      const v = cell && cell.v ? String(cell.v).trim() : '';
      if (v.toLowerCase() === String(headerName).toLowerCase()) { targetCol = c; break; }
    }
    if (targetCol === -1) return;
    // aplicar formato a partir de fila 2
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const addr = XLSX.utils.encode_cell({ r, c: targetCol });
      const cell = ws[addr];
      if (!cell) continue;
      if (type === 'number') {
        const num = typeof cell.v === 'number' ? cell.v : Number(String(cell.v).toString().replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) { cell.t = 'n'; cell.v = num; if (z) cell.z = z; }
      } else if (type === 'date') {
        const d = (cell.v instanceof Date) ? cell.v : new Date(cell.v);
        if (!isNaN(d.getTime())) { cell.t = 'd'; cell.v = d; if (z) cell.z = z; }
      } else if (type === 'percent') {
        const num = typeof cell.v === 'number' ? cell.v : Number(cell.v);
        if (!isNaN(num)) { cell.t = 'n'; cell.v = num / 100; cell.z = z || '0.00%'; }
      }
      ws[addr] = cell;
    }
  };

  // 0) Hoja de Información / Parámetros
  const infoRows = [
    ['Reporte de Pagos MQerK'],
    ['Generado', generatedAt],
    ['Rango', startDate && endDate ? `${startDate} a ${endDate}` : '—'],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
  // Formato de fecha para la celda "Generado"
  try {
    const genCell = wsInfo['B2']; if (genCell) { genCell.t = 'd'; genCell.z = 'dd/mm/yyyy hh:mm'; }
  } catch (_) {}
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');
  finalizeSheet(wsInfo);

  // 1) Resumen General
  const resumenRows = [
    ['Métrica', 'Valor'],
    ['Total Ingresos', (resumenGeneral?.totalIngresos ?? 0)],
    ['Total Pagos (Procesados)', (resumenGeneral?.totalPagos ?? 0)],
    ['Pagos Aprobados', (resumenGeneral?.pagosAprobados ?? 0)],
    ['Pagos Pendientes', (resumenGeneral?.pagosPendientes ?? 0)],
    ['Pagos Rechazados', (resumenGeneral?.pagosRechazados ?? 0)],
    ['Promedio Mensual', (resumenGeneral?.promedioMensual ?? 0)],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  finalizeSheet(wsResumen);
  // Aplicar formato moneda a métricas de dinero
  try {
    const range = XLSX.utils.decode_range(wsResumen['!ref']);
    for (let r = 1; r <= range.e.r; r++) {
      const label = (wsResumen[XLSX.utils.encode_cell({ r, c: 0 })]?.v || '').toString();
      const isMoney = /Ingresos|Promedio/i.test(label);
      if (isMoney) {
        const addr = XLSX.utils.encode_cell({ r, c: 1 });
        const cell = wsResumen[addr];
        if (cell) { cell.t = 'n'; cell.z = '#,##0.00'; wsResumen[addr] = cell; }
      }
    }
  } catch(_) {}

  // 2) Ingresos por Mes
  if (Array.isArray(ingresosPorMes) && ingresosPorMes.length) {
    const wsMes = XLSX.utils.json_to_sheet(ingresosPorMes.map(m => ({
      Mes: m.mes,
      Año: m.anio,
      Ingresos: m.ingresos,
      Pagos: m.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsMes, 'Ingresos_Mes');
    finalizeSheet(wsMes);
    setFormatByHeader(wsMes, 'Ingresos', { type: 'number', z: '#,##0.00' });
  }

  // 3) Pagos por Curso
  if (Array.isArray(pagosPorCurso) && pagosPorCurso.length) {
    const wsCurso = XLSX.utils.json_to_sheet(pagosPorCurso.map(c => ({
      Curso: c.curso,
      Pagos: c.pagos,
      Ingresos: c.ingresos,
    })));
    XLSX.utils.book_append_sheet(wb, wsCurso, 'Pagos_Curso');
  finalizeSheet(wsCurso);
  setFormatByHeader(wsCurso, 'Ingresos', { type: 'number', z: '#,##0.00' });
  }

  // 4) Metodos de Pago
  if (Array.isArray(metodosDepago) && metodosDepago.length) {
    const wsMet = XLSX.utils.json_to_sheet(metodosDepago.map(m => ({
      Metodo: m.metodo,
      Cantidad: m.cantidad,
      Porcentaje: m.porcentaje
    })));
    XLSX.utils.book_append_sheet(wb, wsMet, 'Metodos');
  finalizeSheet(wsMet);
  setFormatByHeader(wsMet, 'Cantidad', { type: 'number' });
  // Mantener porcentaje como número plano (0-100) con 2 decimales
  setFormatByHeader(wsMet, 'Porcentaje', { type: 'number', z: '0.00' });
  }

  // 5) Ingresos por Semana
  if (Array.isArray(ingresosPorSemana) && ingresosPorSemana.length) {
    const wsSem = XLSX.utils.json_to_sheet(ingresosPorSemana.map(s => ({
      Año: s.anio,
      Semana: s.semana,
      FechaInicio: s.fechaInicio ? new Date(s.fechaInicio) : '',
      FechaFin: s.fechaFin ? new Date(s.fechaFin) : '',
      Ingresos: s.ingresos,
      Pagos: s.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsSem, 'Ingresos_Semana');
    finalizeSheet(wsSem);
    setFormatByHeader(wsSem, 'Ingresos', { type: 'number', z: '#,##0.00' });
    setFormatByHeader(wsSem, 'FechaInicio', { type: 'date', z: 'dd/mm/yyyy' });
    setFormatByHeader(wsSem, 'FechaFin', { type: 'date', z: 'dd/mm/yyyy' });
  }

  // 6) Ingresos por Año
  if (Array.isArray(ingresosPorAnio) && ingresosPorAnio.length) {
    const wsAnio = XLSX.utils.json_to_sheet(ingresosPorAnio.map(a => ({
      Año: a.anio,
      Ingresos: a.ingresos,
      Pagos: a.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsAnio, 'Ingresos_Año');
  finalizeSheet(wsAnio);
  setFormatByHeader(wsAnio, 'Ingresos', { type: 'number', z: '#,##0.00' });
  }

  // 7) Pagos Detallados
  if (Array.isArray(pagosDetallados) && pagosDetallados.length) {
    const wsDet = XLSX.utils.json_to_sheet(pagosDetallados.map(r => ({
      Folio: r.folio,
      Alumno: r.alumno,
      Curso: r.curso,
      Grupo: r.grupo || '',
      Estado: r.estado === 1 ? 'Pendiente' : r.estado === 2 ? 'Aprobado' : 'Rechazado',
      Importe: Number(r.importe ?? 0),
      Método: r.metodo || r.metodoPago || '',
      MotivoRechazo: r.motivoRechazo || '',
      Creado: r.created_at ? new Date(r.created_at) : '',
      Actualizado: r.updated_at ? new Date(r.updated_at) : ''
    })));
    XLSX.utils.book_append_sheet(wb, wsDet, 'Pagos_Detallados');
    finalizeSheet(wsDet);
    setFormatByHeader(wsDet, 'Importe', { type: 'number', z: '#,##0.00' });
    setFormatByHeader(wsDet, 'Creado', { type: 'date', z: 'dd/mm/yyyy hh:mm' });
    setFormatByHeader(wsDet, 'Actualizado', { type: 'date', z: 'dd/mm/yyyy hh:mm' });
  }

  // Auto width de columnas básicas para todas las hojas
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref']);
    const colWidths = Array(range.e.c - range.s.c + 1).fill({ wch: 12 });
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        const v = cell && cell.v ? String(cell.v) : '';
        if (v.length > max) max = Math.min(60, v.length);
      }
      colWidths[C] = { wch: max + 2 };
    }
    ws['!cols'] = colWidths;
  });

  XLSX.writeFile(wb, filename);
}

/**
 * Exporta un libro de Excel con imágenes de gráficas embebidas (si están disponibles en el DOM).
 * Usa exceljs para soportar imágenes. Si no logra obtener imágenes, no falla: el Excel sólo tendrá datos.
 * @param {Object} params - mismo objeto de datos del reporte
 * @param {string} filename
 * @param {Object} options - { startDate, endDate, selectors?: { ingresosMes?: string, pagosCurso?: string, metodos?: string } }
 */
export async function exportReportToExcelWithCharts(
  params,
  filename = 'reportes_pagos.xlsx',
  options = {}
) {
  try {
    // Intentar crear un workbook con exceljs
    const wb = new ExcelJS.Workbook();
    const { startDate = '', endDate = '', selectors = {} } = options || {};

    // Hoja Info
    const info = wb.addWorksheet('Info');
    info.columns = [{ width: 24 }, { width: 40 }];
    info.addRow(['Reporte de Pagos MQerK']);
    info.addRow(['Generado', new Date()]).getCell(2).numFmt = 'dd/mm/yyyy hh:mm';
    info.addRow(['Rango', startDate && endDate ? `${startDate} a ${endDate}` : '—']);

    // Hoja Resumen
    const resumen = wb.addWorksheet('Resumen');
    resumen.addRow(['Métrica', 'Valor']);
    const r = params.resumenGeneral || {};
    resumen.addRows([
      ['Total Ingresos', r.totalIngresos || 0],
      ['Total Pagos (Procesados)', r.totalPagos || 0],
      ['Pagos Aprobados', r.pagosAprobados || 0],
      ['Pagos Pendientes', r.pagosPendientes || 0],
      ['Pagos Rechazados', r.pagosRechazados || 0],
      ['Promedio Mensual', r.promedioMensual || 0],
    ]);
    resumen.getColumn(2).numFmt = '#,##0.00';
    resumen.autoFilter = { from: 'A1', to: 'B1' };
    resumen.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Ingresos_Mes
    const ingresosMes = wb.addWorksheet('Ingresos_Mes');
    ingresosMes.columns = [
      { header: 'Mes', key: 'mes', width: 18 },
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Ingresos', key: 'ingresos', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Pagos', key: 'pagos', width: 10 },
    ];
    (params.ingresosPorMes || []).forEach(m => ingresosMes.addRow({ mes: m.mes, anio: m.anio, ingresos: m.ingresos, pagos: m.pagos }));
    ingresosMes.autoFilter = 'A1:D1';
    ingresosMes.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Pagos_Curso
    const pagosCurso = wb.addWorksheet('Pagos_Curso');
    pagosCurso.columns = [
      { header: 'Curso', key: 'curso', width: 28 },
      { header: 'Pagos', key: 'pagos', width: 10 },
      { header: 'Ingresos', key: 'ingresos', width: 16, style: { numFmt: '#,##0.00' } },
    ];
    (params.pagosPorCurso || []).forEach(c => pagosCurso.addRow({ curso: c.curso, pagos: c.pagos, ingresos: c.ingresos }));
    pagosCurso.autoFilter = 'A1:C1';
    pagosCurso.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Metodos
    const metodos = wb.addWorksheet('Metodos');
    metodos.columns = [
      { header: 'Metodo', key: 'metodo', width: 18 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Porcentaje', key: 'porcentaje', width: 12 },
    ];
    (params.metodosDepago || []).forEach(m => metodos.addRow({ metodo: m.metodo, cantidad: m.cantidad, porcentaje: m.porcentaje }));
    metodos.autoFilter = 'A1:C1';
    metodos.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Ingresos_Semana
    const ingresosSemana = wb.addWorksheet('Ingresos_Semana');
    ingresosSemana.columns = [
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Semana', key: 'semana', width: 10 },
      { header: 'FechaInicio', key: 'fechaInicio', width: 14 },
      { header: 'FechaFin', key: 'fechaFin', width: 14 },
      { header: 'Ingresos', key: 'ingresos', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Pagos', key: 'pagos', width: 10 },
    ];
    (params.ingresosPorSemana || []).forEach(s => ingresosSemana.addRow({ anio: s.anio, semana: s.semana, fechaInicio: s.fechaInicio, fechaFin: s.fechaFin, ingresos: s.ingresos, pagos: s.pagos }));
    ingresosSemana.autoFilter = 'A1:F1';
    ingresosSemana.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Ingresos_Año
    const ingresosAnio = wb.addWorksheet('Ingresos_Año');
    ingresosAnio.columns = [
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Ingresos', key: 'ingresos', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Pagos', key: 'pagos', width: 10 },
    ];
    (params.ingresosPorAnio || []).forEach(a => ingresosAnio.addRow({ anio: a.anio, ingresos: a.ingresos, pagos: a.pagos }));
    ingresosAnio.autoFilter = 'A1:C1';
    ingresosAnio.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Hoja Pagos_Detallados
    const detallados = wb.addWorksheet('Pagos_Detallados');
    detallados.columns = [
      { header: 'Folio', key: 'folio', width: 12 },
      { header: 'Alumno', key: 'alumno', width: 26 },
      { header: 'Curso', key: 'curso', width: 24 },
      { header: 'Grupo', key: 'grupo', width: 10 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Importe', key: 'importe', width: 14, style: { numFmt: '#,##0.00' } },
      { header: 'Método', key: 'metodo', width: 14 },
      { header: 'MotivoRechazo', key: 'motivo', width: 30 },
      { header: 'Creado', key: 'creado', width: 18 },
      { header: 'Actualizado', key: 'actualizado', width: 18 },
    ];
    (params.pagosDetallados || []).forEach(r => detallados.addRow({
      folio: r.folio,
      alumno: r.alumno,
      curso: r.curso,
      grupo: r.grupo || '',
      estado: r.estado === 1 ? 'Pendiente' : r.estado === 2 ? 'Aprobado' : 'Rechazado',
      importe: r.importe ?? 0,
      metodo: r.metodo || r.metodoPago || '',
      motivo: r.motivoRechazo || '',
      creado: r.created_at ? new Date(r.created_at) : '',
      actualizado: r.updated_at ? new Date(r.updated_at) : ''
    }));
    detallados.autoFilter = 'A1:J1';
    detallados.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Intentar capturar gráficos desde el DOM (Recharts renderiza SVG)
    const sel = {
      ingresosMes: selectors.ingresosMes || '[data-chart="ingresos-mes"] svg',
      pagosCurso: selectors.pagosCurso || '[data-chart="pagos-curso"] svg',
      metodos: selectors.metodos || '[data-chart="metodos-pago"] svg',
    };

    const waitFor = (fn, timeout = 1000, interval = 50) => new Promise(resolve => {
      const start = Date.now();
      const tick = () => {
        const val = fn();
        if (val) return resolve(val);
        if (Date.now() - start >= timeout) return resolve(null);
        setTimeout(tick, interval);
      };
      tick();
    });

    const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const addChartImage = async (worksheet, cell, selector, size = { width: 720, height: 360 }) => {
      // Allow selector to be either container or direct svg
      let el = await waitFor(() => document.querySelector(selector), 800, 40);
      if (!el) return false;
      // If the found element is not an SVG, try to find an svg inside
      let svg = (el.tagName && el.tagName.toLowerCase() === 'svg') ? el : el.querySelector('svg');
      if (!svg) {
        // try one more time with explicit svg under the same container
        await nextFrame();
        svg = el.querySelector('svg') || document.querySelector(`${selector} svg`);
      }
      if (!svg) return false;
      // Give Recharts a frame to finish measuring
      await nextFrame();
      const dataUrl = await svgElementToPngDataUrl(svg, { width: size.width, height: size.height, background: '#ffffff', scale: 2 });
      if (!dataUrl) return false;
      // exceljs espera el contenido base64 sin el prefijo data URL
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      if (!base64) return false;
      const imageId = wb.addImage({ base64, extension: 'png' });
      worksheet.addImage(imageId, { tl: { col: 0, row: cell }, ext: { width: size.width, height: size.height } });
      return true;
    };

    // Hoja Gráficas con imágenes
    const charts = wb.addWorksheet('Gráficas');
    charts.getColumn(1).width = 120;
  const ok1 = await addChartImage(charts, 0, sel.ingresosMes.replace(/\s+svg$/, ''));
  const ok2 = await addChartImage(charts, 22, sel.pagosCurso.replace(/\s+svg$/, ''));
  const ok3 = await addChartImage(charts, 44, sel.metodos.replace(/\s+svg$/, ''));
    if (!(ok1 || ok2 || ok3)) {
      charts.addRow(['No se pudieron capturar las gráficas para exportar.']);
    }

    // Descargar archivo
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback: si falla exceljs o la captura, al menos exportar los datos con XLSX
    try {
      exportReportToExcel(params, filename, options);
    } catch (_) { /* noop */ }
    console.warn('Export con gráficas falló, se entregó Excel de datos:', e);
  }
}

/**
 * Exporta a Excel la tabla de "Comprobantes Aprobados" tal como se ve en UI
 * columns: Folio, Nombre del Alumno, Fecha y Hora, Importe, Método, Fecha Aprobación, Comprobante
 * list: arreglo de comprobantes (del componente ComprobanteRecibo)
 * opts: { curso, grupo, apiOrigin }
 */
export function exportApprovedComprobantesToExcel(list = [], opts = {}) {
  const { curso = '', grupo = '', apiOrigin = '' } = opts;
  const wb = XLSX.utils.book_new();
  const yearTwo = String(new Date().getFullYear() + 1).slice(-2);

  const rows = (Array.isArray(list) ? list : []).map((c, i) => {
    const folioNum = String(c.folio ?? '').padStart(4, '0');
    const folioShown = `M${String(curso || '').toUpperCase()}${yearTwo}-${folioNum}`;
    const fullUrl = (typeof c.comprobante === 'string' && c.comprobante.startsWith('http'))
      ? c.comprobante
      : (c.comprobante ? `${apiOrigin}${c.comprobante}` : '');
    return {
  'No.': i + 1,
      'FOLIO': folioShown,
      'NOMBRE DEL ALUMNO': `${c.nombre || ''} ${c.apellidos || ''}`.trim(),
      'FECHA Y HORA': formatDateTimeMX(c.created_at),
      'IMPORTE': Number(c.importe ?? 0),
      'MÉTODO': c.metodoPago || c.metodo || '',
      'FECHA APROBACIÓN': formatDateTimeMX(c.created_at),
      'COMPROBANTE': fullUrl,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Aprobados');

  // Auto width
  const range = XLSX.utils.decode_range(ws['!ref']);
  const cols = Array(range.e.c - range.s.c + 1).fill({ wch: 14 });
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let max = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      const v = cell && cell.v ? String(cell.v) : '';
      if (v.length > max) max = Math.min(60, v.length);
    }
    cols[C] = { wch: max + 2 };
  }
  ws['!cols'] = cols;

  const ts = new Date();
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, '0');
  const d = String(ts.getDate()).padStart(2, '0');
  // Truncado: quitar la hora/minuto del final; mantener solo fecha YYYYMMDD
  const filename = `aprobados_${String(curso || 'CURSO')}_${String(grupo || 'GRUPO')}_${y}${m}${d}.xlsx`;
  XLSX.writeFile(wb, filename);
}
