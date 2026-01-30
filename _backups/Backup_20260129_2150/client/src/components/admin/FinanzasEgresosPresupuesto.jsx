import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { getBudget, setBudget, loadBudgets, saveBudgets, getBudgetSnapshot, rolloverIfNeeded, sumExpensesMonth } from '../../utils/budgetStore.js';
import { listPresupuestos, upsertPresupuesto, deletePresupuesto, getResumenMensual } from '../../service/finanzasPresupuesto.js';
import { listarPagos } from '../../service/pagosAsesores.js';

export default function FinanzasEgresosPresupuesto() {
  const [presupuestos, setPresupuestos] = useState([]); // [{ id, mes: '2025-09', monto }]
  const [mes, setMes] = useState(dayjs().format('YYYY-MM'));
  const [monto, setMonto] = useState('');
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportExcelError, setExportExcelError] = useState('');
  // Modo de guardado: por defecto SUMAR al presupuesto existente del mes
  const [sumar, setSumar] = useState(true);
  // Confirmación de borrado por fila
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { mes, monto }
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  // Snapshot del mes actual y resúmenes por mes (preferir backend)
  const [snap, setSnap] = useState({ budget: 0, spent: 0, leftover: 0 });
  const [summaries, setSummaries] = useState({}); // { 'YYYY-MM': { budget, spent, leftover } }
  // Filtros de historial (por mes)
  const [showFilters, setShowFilters] = useState(false);
  const [filterFrom, setFilterFrom] = useState(''); // YYYY-MM
  const [filterTo, setFilterTo] = useState('');

  const formatCurrency = (n) => {
    const num = Number(n || 0);
    try {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(num);
    } catch (_) {
      return `$${num.toFixed(2)}`;
    }
  };

  useEffect(() => {
    // asegurar rollover al entrar (cliente)
    rolloverIfNeeded();
    // Cargar desde backend; si falla, caer a localStorage
    const load = async () => {
      try {
        const rows = await listPresupuestos();
        if (Array.isArray(rows) && rows.length) {
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Historial de presupuestos</h2>
            <button onClick={()=> setShowFilters(s=>!s)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{showFilters ? 'Ocultar filtros' : 'Filtros'}</button>
          </div>
          {showFilters && (
            <div className="px-6 pb-4 pt-4 border-b border-gray-200 bg-gray-50/60 text-xs sm:text-[13px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Desde (mes)</label>
                  <input type="month" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Hasta (mes)</label>
                  <input type="month" value={filterTo} onChange={e=>setFilterTo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                  <button onClick={()=>{/* se filtra por memo automáticamente */}} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Aplicar</button>
                  <button onClick={()=>{ setFilterFrom(''); setFilterTo(''); }} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Limpiar</button>
                </div>
              </div>
            </div>
          )}
          <div className="px-6 py-5">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Mes</th>
                    <th className="text-right font-semibold px-4 py-3">Presupuesto</th>
                    <th className="text-right font-semibold px-4 py-3">Gastado</th>
                    <th className="text-right font-semibold px-4 py-3">Disponible</th>
                    <th className="text-right font-semibold px-4 py-3">Excedente</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPresupuestos.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin registros</td></tr>
                  ) : filteredPresupuestos.slice().sort((a,b)=> a.mes.localeCompare(b.mes)).map(p => {
                    const summary = summaries[p.mes] || { budget: p.monto||0, spent:0, leftover:(p.monto||0) };
                    const exced = Math.max(0, Number(summary.spent||0) - Number(summary.budget||0));
                    return (
                      <tr key={p.mes} className="border-b last:border-b-0 border-gray-200">
                        <td className="px-4 py-2 text-gray-700 font-medium">{p.mes}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(summary.budget||0)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(summary.spent||0)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(summary.leftover||0)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(exced)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          setPresupuestos(rows.map(r => ({ id: r.id ?? r.mes, mes: r.mes, monto: Number(r.monto || 0) })));
        } else {
          // fallback a local
          const data = loadBudgets();
          const items = Object.entries(data.months || {}).map(([m, value]) => ({ id: m, mes: m, monto: Number(value || 0) }));
          setPresupuestos(items);
        }
      } catch {
        const data = loadBudgets();
        const items = Object.entries(data.months || {}).map(([m, value]) => ({ id: m, mes: m, monto: Number(value || 0) }));
        setPresupuestos(items);
      }
    };
    load();
  }, []);

  const filteredPresupuestos = useMemo(() => {
    if (!filterFrom && !filterTo) return presupuestos;
    return presupuestos.filter(p => {
      if (filterFrom && p.mes < filterFrom) return false;
      if (filterTo && p.mes > filterTo) return false;
      return true;
    });
  }, [presupuestos, filterFrom, filterTo]);

  // Presupuesto del mes: preferir backend snapshot (snap.budget); si viene en 0, caer al listado o a localStorage
  const totalMesSeleccionado = useMemo(() => {
    const snapBudget = typeof snap?.budget === 'number' ? Number(snap.budget || 0) : 0;
    if (snapBudget > 0) return snapBudget;
    const fromList = presupuestos.find((p) => p.mes === mes)?.monto;
    if (fromList && Number(fromList) > 0) return Number(fromList);
    return getBudget(mes);
  }, [mes, presupuestos, snap]);

  const onChangeMonto = (e) => {
    let v = e.target.value || '';
    v = v.replace(/[^\d.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    const [enteroRaw, decRaw] = v.split('.');
    const entero = (enteroRaw || '').replace(/^0+(?=\d)/, '');
    const withCommas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const dec = decRaw !== undefined ? decRaw.slice(0, 2) : undefined;
    const formatted = dec !== undefined ? (dec.length ? `${withCommas}.${dec}` : `${withCommas}.`) : withCommas;
    setMonto(formatted);
  };

  const parseCurrency = (s) => {
    if (typeof s === 'number') return s;
    if (!s) return 0;
    const clean = String(s).replace(/,/g, '');
    const n = parseFloat(clean);
    return Number.isNaN(n) ? 0 : n;
  };

  // Exportar histórico de presupuestos con resumen (gastado/disponible) a Excel
  const handleExportExcel = async () => {
    try {
      setExportExcelLoading(true); setExportExcelError('');
      const [ExcelJS] = await Promise.all([
        import('exceljs')
      ]);
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Presupuestos');
      const columns = [
        { header: 'Mes', key: 'mes' },
        { header: 'Presupuesto', key: 'budget' },
        { header: 'Gastado', key: 'spent' },
        { header: 'Disponible', key: 'leftover' },
        { header: 'Excedente', key: 'excedente' },
      ];
      ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: Math.max(12, c.header.length + 2) }));
      // Para cada mes listado, usar summaries ya precargados si existen; si no, llamar a getResumenMensual
      for (const p of presupuestos.slice().sort((a,b)=>a.mes.localeCompare(b.mes))) {
        let summary = summaries[p.mes];
        if (!summary) {
          try { summary = await getResumenMensual(p.mes); } catch { summary = { budget: p.monto||0, spent: 0, leftover: (p.monto||0) }; }
        }
        const budget = Number(summary?.budget ?? p.monto ?? 0);
        const spent = Number(summary?.spent ?? 0);
        const leftover = Number(summary?.leftover ?? Math.max(0, budget - spent));
        const excedente = Math.max(0, spent - budget);
        ws.addRow({ mes: p.mes, budget, spent, leftover, excedente });
      }
      // Encabezado estilizado
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle' };
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        cell.border = { top: { style: 'thin', color: { argb: 'FFDBEAFE' } }, left: { style: 'thin', color: { argb: 'FFDBEAFE' } }, bottom: { style: 'thin', color: { argb: 'FFDBEAFE' } }, right: { style: 'thin', color: { argb: 'FFDBEAFE' } } };
      });
      // Formatos moneda
      ['budget','spent','leftover','excedente'].forEach(k=>{ const col = ws.getColumn(k); col.numFmt = '#,##0.00'; col.alignment = { horizontal: 'right' }; });
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
      ws.columns.forEach((col) => {
        let max = col.header ? String(col.header).length : 10;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value == null ? '' : String(cell.value);
          max = Math.max(max, v.length);
        });
        col.width = Math.min(60, Math.max(12, Math.ceil(max * 1.1)));
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      a.href = url; a.download = `presupuestos-${ts}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportExcelError('No se pudo exportar Excel.');
    } finally { setExportExcelLoading(false); }
  };

  const savePresupuesto = async (e) => {
    e.preventDefault();
    const amount = parseCurrency(monto);
    if (!amount) return;
    // Si hay presupuesto existente y el modo es "sumar", acumular
    const existente = presupuestos.find(p => p.mes === mes)?.monto || 0;
    const finalAmount = sumar ? (Number(existente) + amount) : amount;
    try {
      const saved = await upsertPresupuesto({ mes, monto: finalAmount });
      // refrescar lista desde backend
      const rows = await listPresupuestos();
      setPresupuestos(rows.map(r => ({ id: r.id ?? r.mes, mes: r.mes, monto: Number(r.monto || 0) })));
    } catch {
      // fallback local
      setBudget(mes, finalAmount);
      const data = loadBudgets();
      const items = Object.entries(data.months || {}).map(([m, value]) => ({ id: m, mes: m, monto: Number(value || 0) }));
      setPresupuestos(items);
    }
    // limpiar solo el monto (mantener mes seleccionado)
    setMonto('');
  };

  const removePresupuesto = async (targetMes) => {
    try {
      await deletePresupuesto(targetMes);
      const rows = await listPresupuestos();
      setPresupuestos(rows.map(r => ({ id: r.id ?? r.mes, mes: r.mes, monto: Number(r.monto || 0) })));
    } catch {
      const data = loadBudgets();
      if (data.months) { delete data.months[targetMes]; saveBudgets(data); }
      const items = Object.entries(data.months || {}).map(([m, value]) => ({ id: m, mes: m, monto: Number(value || 0) }));
      setPresupuestos(items);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadSnap = async () => {
      try {
  const r = await getResumenMensual(mes);
  // Combinar con gastos locales (fallback/merge) y pagos a asesores del mes
  const localSpent = sumExpensesMonth(mes); // fijos + variables (local)
  // Sumar pagos de asesores Pagado (API)
  let asesorSpent = 0;
  try {
    const start = dayjs(mes + '-01').format('YYYY-MM-DD');
    const end = dayjs(mes + '-01').endOf('month').format('YYYY-MM-DD');
    const pagos = await listarPagos({ from: start, to: end, status: 'Pagado' });
    asesorSpent = (pagos || []).reduce((acc, p) => acc + Number(p.ingreso_final || 0), 0);
  } catch {}
  // Budget efectivo: backend > listado > local
  const backendBudget = Number(r.budget || 0);
  const listBudget = presupuestos.find((x) => x.mes === mes)?.monto || 0;
  const effectiveBudget = backendBudget > 0 ? backendBudget : (Number(listBudget) > 0 ? Number(listBudget) : getBudget(mes));
  const backendSpent = Number(r.spent || 0);
  const mergedSpent = Math.max(backendSpent, localSpent + asesorSpent);
  const leftover = Math.max(0, effectiveBudget - mergedSpent);
  if (!cancelled) setSnap({ budget: effectiveBudget, spent: mergedSpent, leftover });
      } catch {
        // fallback local
        if (!cancelled) setSnap(getBudgetSnapshot(mes));
      }
    };
    loadSnap();
    return () => { cancelled = true; };
  }, [mes, presupuestos]);

  // Prefetch summaries for all listed months to show "Gastado" y "Disponible" desde backend
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      const months = Array.from(new Set(presupuestos.map(p => p.mes)));
      const acc = {};
      await Promise.all(months.map(async (m) => {
        try {
          const r = await getResumenMensual(m);
          const localSpent = sumExpensesMonth(m);
          let asesorSpent = 0;
          try {
            const start = dayjs(m + '-01').format('YYYY-MM-DD');
            const end = dayjs(m + '-01').endOf('month').format('YYYY-MM-DD');
            const pagos = await listarPagos({ from: start, to: end, status: 'Pagado' });
            asesorSpent = (pagos || []).reduce((acc, p) => acc + Number(p.ingreso_final || 0), 0);
          } catch {}
          // Budget efectivo por fila
          const backendBudget = Number(r.budget || 0);
          const listBudget = presupuestos.find((x) => x.mes === m)?.monto || 0;
          const budget = backendBudget > 0 ? backendBudget : (Number(listBudget) > 0 ? Number(listBudget) : getBudget(m));
          const backendSpent = Number(r.spent || 0);
          const spent = Math.max(backendSpent, localSpent + asesorSpent);
          const leftover = Math.max(0, budget - spent);
          acc[m] = { budget, spent, leftover };
        } catch {
          acc[m] = getBudgetSnapshot(m);
        }
      }));
      if (!cancelled) setSummaries(acc);
    };
    if (presupuestos.length) fetchAll(); else setSummaries({});
    return () => { cancelled = true; };
  }, [presupuestos]);

  const gastadoMes = snap.spent;
  const disponible = snap.leftover;
  const excedenteMes = useMemo(() => {
    const budgetEff = typeof snap?.budget === 'number' ? Number(snap.budget || 0) : Number(totalMesSeleccionado || 0);
    const spentEff = Number(snap?.spent || 0);
    return Math.max(0, spentEff - budgetEff);
  }, [snap, totalMesSeleccionado]);

  return (
    <section className="px-4 sm:px-6 lg:px-10 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-6 max-w-screen-2xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Presupuesto de egresos</h1>
          <p className="text-sm text-gray-500">Asigna un presupuesto mensual para controlar los gastos.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <Link to="/administrativo/finanzas/egresos/fijos" className="text-sm text-gray-600 hover:text-gray-800">Gastos fijos</Link>
            <Link to="/administrativo/finanzas/egresos/variables" className="text-sm text-gray-600 hover:text-gray-800">Gastos variables</Link>
            <Link to="/administrativo/finanzas" className="text-sm text-indigo-600 hover:text-indigo-800">Finanzas</Link>
            <button onClick={handleExportExcel} disabled={exportExcelLoading} className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60">{exportExcelLoading ? 'Exportando…' : 'Exportar Excel'}</button>
          </div>
        </div>
      </header>

      {/* Resumen rápido */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Mes seleccionado</p>
          <p className="text-2xl font-semibold text-gray-800">{dayjs(mes + '-01').format('MMMM YYYY')}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Presupuesto</p>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totalMesSeleccionado)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Gastado</p>
          <p className="text-2xl font-semibold text-rose-600">{formatCurrency(gastadoMes)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Disponible</p>
          <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(disponible)}</p>
        </div>
        {excedenteMes > 0 && (
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
            <p className="text-xs text-gray-500">Excedente</p>
            <p className="text-2xl font-semibold text-rose-700">{formatCurrency(excedenteMes)}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Asignar presupuesto mensual</h2>
        </div>
        {exportExcelError && (
          <div className="px-6 py-2 text-sm text-amber-600">{exportExcelError}</div>
        )}
        <form onSubmit={savePresupuesto} className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mes</label>
            <input type="month" value={mes} onChange={(e)=>setMes(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monto mensual</label>
            <input value={monto} onChange={onChangeMonto} placeholder="0.00" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600 select-none">
              <input type="checkbox" checked={sumar} onChange={(e)=>setSumar(e.target.checked)} className="rounded border-gray-300" />
              Sumar al presupuesto actual de este mes
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar</button>
            {/* Eliminar movido a acciones por fila */}
          </div>
        </form>

        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Histórico de presupuestos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">Mes</th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">Monto</th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">Gastado</th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">Disponible</th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">Excedente</th>
                  <th className="text-center font-semibold px-4 py-3">Acciones</th>
                </tr>
              </thead>
        <tbody>
                {presupuestos.length === 0 ? (
                  <tr className="border-b border-gray-200"><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No hay presupuestos a\u00fan.</td></tr>
                ) : (
                  presupuestos
                    .slice()
                    .sort((a,b)=>a.mes.localeCompare(b.mes))
        .map((p)=>{
      const snapRow = summaries[p.mes] || getBudgetSnapshot(p.mes);
      const g = snapRow.spent;
      const disp = snapRow.leftover;
            const exced = Math.max(0, g - (snapRow.budget || 0));
                      return (
                        <tr key={p.id} className="border-b border-gray-200">
                          <td className="px-4 py-3 text-gray-800 border-r border-gray-100">{dayjs(p.mes+'-01').format('MMMM YYYY')}</td>
              <td className="px-4 py-3 text-right text-gray-900 font-medium border-r border-gray-100">{formatCurrency(p.monto)}</td>
                          <td className="px-4 py-3 text-right text-rose-600 border-r border-gray-100">{formatCurrency(g)}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 border-r border-gray-100">{formatCurrency(disp)}</td>
                          <td className={`px-4 py-3 text-right ${exced>0?'text-rose-700':'text-gray-500'} border-r border-gray-100`}>{formatCurrency(exced)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => { setConfirmError(''); setConfirmTarget({ mes: p.mes, monto: p.monto }); setConfirmOpen(true); }}
                            >Eliminar</button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal Confirmación eliminar presupuesto */}
      {confirmOpen && confirmTarget && (
        <div className="fixed inset-0 z-[10050] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Eliminar presupuesto</h3>
              <button onClick={()=>!confirmLoading && setConfirmOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
              <p>¿Seguro que deseas eliminar el presupuesto de este mes?</p>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 text-xs">
                <div><span className="text-gray-500">Mes:</span> <span className="text-gray-800 font-medium">{dayjs(confirmTarget.mes+'-01').format('MMMM YYYY')}</span></div>
                <div><span className="text-gray-500">Monto:</span> <span className="text-gray-800 font-medium">{formatCurrency(confirmTarget.monto)}</span></div>
              </div>
              {confirmError ? (<p className="text-[11px] text-rose-600">{confirmError}</p>) : null}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >Cancelar</button>
              <button
                type="button"
                onClick={async()=>{
                  if(!confirmTarget) return;
                  setConfirmLoading(true); setConfirmError('');
                  try {
                    await removePresupuesto(confirmTarget.mes);
                    setConfirmOpen(false); setConfirmTarget(null);
                  } catch (e) {
                    setConfirmError('No se pudo eliminar. Intenta de nuevo.');
                  } finally { setConfirmLoading(false); }
                }}
                className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70"
                disabled={confirmLoading}
              >{confirmLoading ? 'Eliminando…' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
