import * as XLSX from 'xlsx';
import { formatCurrencyMXN, formatDateTimeMX } from './formatters.js';

export function exportReportToExcel({ resumenGeneral, ingresosPorMes, pagosPorCurso, metodosDepago, pagosDetallados, ingresosPorSemana, ingresosPorAnio }, filename = 'reportes_pagos.xlsx') {
  const wb = XLSX.utils.book_new();

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

  // 2) Ingresos por Mes
  if (Array.isArray(ingresosPorMes) && ingresosPorMes.length) {
    const wsMes = XLSX.utils.json_to_sheet(ingresosPorMes.map(m => ({
      Mes: m.mes,
      Año: m.anio,
      Ingresos: m.ingresos,
      Pagos: m.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsMes, 'Ingresos_Mes');
  }

  // 3) Pagos por Curso
  if (Array.isArray(pagosPorCurso) && pagosPorCurso.length) {
    const wsCurso = XLSX.utils.json_to_sheet(pagosPorCurso.map(c => ({
      Curso: c.curso,
      Pagos: c.pagos,
      Ingresos: c.ingresos,
    })));
    XLSX.utils.book_append_sheet(wb, wsCurso, 'Pagos_Curso');
  }

  // 4) Metodos de Pago
  if (Array.isArray(metodosDepago) && metodosDepago.length) {
    const wsMet = XLSX.utils.json_to_sheet(metodosDepago.map(m => ({
      Metodo: m.metodo,
      Cantidad: m.cantidad,
      Porcentaje: m.porcentaje
    })));
    XLSX.utils.book_append_sheet(wb, wsMet, 'Metodos');
  }

  // 5) Ingresos por Semana
  if (Array.isArray(ingresosPorSemana) && ingresosPorSemana.length) {
    const wsSem = XLSX.utils.json_to_sheet(ingresosPorSemana.map(s => ({
      Año: s.anio,
      Semana: s.semana,
      FechaInicio: s.fechaInicio,
      FechaFin: s.fechaFin,
      Ingresos: s.ingresos,
      Pagos: s.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsSem, 'Ingresos_Semana');
  }

  // 6) Ingresos por Año
  if (Array.isArray(ingresosPorAnio) && ingresosPorAnio.length) {
    const wsAnio = XLSX.utils.json_to_sheet(ingresosPorAnio.map(a => ({
      Año: a.anio,
      Ingresos: a.ingresos,
      Pagos: a.pagos
    })));
    XLSX.utils.book_append_sheet(wb, wsAnio, 'Ingresos_Año');
  }

  // 7) Pagos Detallados
  if (Array.isArray(pagosDetallados) && pagosDetallados.length) {
    const wsDet = XLSX.utils.json_to_sheet(pagosDetallados.map(r => ({
      Folio: r.folio,
      Alumno: r.alumno,
      Curso: r.curso,
      Estado: r.estado === 1 ? 'Pendiente' : r.estado === 2 ? 'Aprobado' : 'Rechazado',
      Importe: r.importe ?? '',
      Metodo: r.metodo || '',
      MotivoRechazo: r.motivoRechazo || '',
      Creado: r.created_at,
      Actualizado: r.updated_at
    })));
    XLSX.utils.book_append_sheet(wb, wsDet, 'Pagos_Detallados');
  }

  // Auto width de columnas básicas
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
      '#': i + 1,
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
  const hh = String(ts.getHours()).padStart(2, '0');
  const mm = String(ts.getMinutes()).padStart(2, '0');
  const filename = `aprobados_${String(curso || 'CURSO')}_${String(grupo || 'GRUPO')}_${y}${m}${d}_${hh}${mm}.xlsx`;
  XLSX.writeFile(wb, filename);
}
