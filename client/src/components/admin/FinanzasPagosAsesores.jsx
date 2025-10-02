import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { listarPagos, crearPago, actualizarPago, eliminarPago } from '../../service/pagosAsesores.js';
import { getResumenMensual } from '../../service/finanzasPresupuesto.js';
import api from '../../api/axios.js';

// Este componente replica el patrón de FinanzasIngresos: click en fila para editar, modal de confirmación para borrar y toast para deshacer.

export default function FinanzasPagosAsesores(){
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportExcelError, setExportExcelError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(null);
  const [asesores, setAsesores] = useState([]);
  const [notaOpen, setNotaOpen] = useState(false);
  const [notaTexto, setNotaTexto] = useState('');
  // Confirmación borrado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [rowToDelete, setRowToDelete] = useState(null);
  // Undo (7s)
  const undoTimerRef = useRef(null);
  const [undoState, setUndoState] = useState({ open:false, row:null, index:null, saving:false, error:'' });
  // Presupuesto mensual
  const [budgetSummary, setBudgetSummary] = useState({ budget:0, spent:0, leftover:0, mes: dayjs().format('YYYY-MM') });
  const [budgetWarn, setBudgetWarn] = useState({ open:false, info:null, payload:null, editId:null, original:null });
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterAsesor, setFilterAsesor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterTipoServicio, setFilterTipoServicio] = useState('');

  const emptyForm = { asesor_preregistro_id:'', tipo_servicio:'curso', servicio_detalle:'', monto_base:'', horas_trabajadas:'', honorarios_comision:'', ingreso_final:'', fecha_pago: dayjs().format('YYYY-MM-DD'), metodo_pago:'', nota:'', status:'Pagado'};
  const [form, setForm] = useState(emptyForm);

  const money = (v)=> Number(v||0).toLocaleString('es-MX',{ style:'currency', currency:'MXN'});

  // Exportar pagos a Excel
  const handleExportExcel = async () => {
    try {
      setExportExcelLoading(true); setExportExcelError('');
      const [ExcelJS, data] = await Promise.all([
        import('exceljs'),
        listarPagos()
      ]);
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Pagos asesores');
      const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Asesor', key: 'asesor_nombre' },
        { header: 'Tipo servicio', key: 'tipo_servicio' },
        { header: 'Detalle', key: 'servicio_detalle' },
        { header: 'Monto base', key: 'monto_base' },
        { header: 'Horas', key: 'horas_trabajadas' },
        { header: 'Honorarios/Comisión', key: 'honorarios_comision' },
        { header: 'Ingreso final', key: 'ingreso_final' },
        { header: 'Fecha pago', key: 'fecha_pago' },
        { header: 'Método', key: 'metodo_pago' },
        { header: 'Status', key: 'status' },
        { header: 'Nota', key: 'nota' },
      ];
      ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: Math.max(12, c.header.length + 2) }));
      for (const r of (Array.isArray(data) ? data : [])) {
        ws.addRow({
          id: r.id,
          asesor_nombre: r.asesor_nombre || '',
          tipo_servicio: r.tipo_servicio || '',
          servicio_detalle: r.servicio_detalle || '',
          monto_base: r.tipo_servicio==='curso' ? 0 : Number(r.monto_base ?? 0),
          horas_trabajadas: Number(r.horas_trabajadas ?? 0),
          honorarios_comision: Number(r.honorarios_comision ?? 0),
          ingreso_final: Number(r.ingreso_final ?? 0),
          fecha_pago: r.fecha_pago || '',
          metodo_pago: r.metodo_pago || '',
          status: r.status || '',
          nota: r.nota || ''
        });
      }
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle' };
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        cell.border = { top: { style: 'thin', color: { argb: 'FFDBEAFE' } }, left: { style: 'thin', color: { argb: 'FFDBEAFE' } }, bottom: { style: 'thin', color: { argb: 'FFDBEAFE' } }, right: { style: 'thin', color: { argb: 'FFDBEAFE' } } };
      });
      // Formatos moneda
      ['monto_base','honorarios_comision','ingreso_final'].forEach(k=>{ const col = ws.getColumn(k); col.numFmt = '#,##0.00'; col.alignment = { horizontal: 'right' }; });
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
      a.href = url; a.download = `pagos-asesores-${ts}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportExcelError('No se pudo exportar Excel.');
    } finally { setExportExcelLoading(false); }
  };

  async function loadPagos(){
    try {
      setLoading(true); setError('');
      const data = await listarPagos({ from: filterFrom || undefined, to: filterTo || undefined, asesor_id: filterAsesor || undefined, status: filterStatus || undefined, metodo: filterMetodo || undefined, tipo_servicio: filterTipoServicio || undefined });
      setPagos(data);
    } catch(e){ setError('Error cargando pagos'); } finally { setLoading(false);} }
  
  async function loadAsesores(){
    try { 
      const { data } = await api.get('/asesores/admin/list');
      // AJUSTE: Se filtran los asesores para mostrar únicamente los que tienen estatus 'completed'.
      const asesoresCompletados = (data?.data || []).filter(asesor => asesor.status === 'completed');
      setAsesores(asesoresCompletados);
    } catch { 
     
    }
  }

  useEffect(()=>{ 
    loadPagos(); 
    loadAsesores(); 
    refreshBudget();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Aplicar filtros manualmente (no en cada keystroke)
  const applyFilters = () => { loadPagos(); };
  const clearFilters = () => {
    setFilterFrom(''); setFilterTo(''); setFilterAsesor(''); setFilterStatus(''); setFilterMetodo(''); setFilterTipoServicio('');
    setTimeout(()=> loadPagos(),0);
  };

  async function refreshBudget(mes){
    try {
      const target = mes || dayjs().format('YYYY-MM');
      const r = await getResumenMensual(target);
      setBudgetSummary({ budget:Number(r.budget||0), spent:Number(r.spent||0), leftover:Number(r.leftover||0), mes: r.mes || target });
    } catch(e){ /* silenciar */ }
  }

  function openNew(){ setEdit(null); setForm(emptyForm); setErrors({}); setShowForm(true); }
  const toDateInput = (val)=>{
    if(!val) return '';
    const d = dayjs(val);
    if(d.isValid()) return d.format('YYYY-MM-DD');
    if(typeof val === 'string' && val.includes('T')) return val.split('T')[0];
    return val;
  };
  const formatFecha = (val)=>{
    if(!val) return '';
    const d = dayjs(val);
    if(d.isValid()) return d.format('DD/MM/YY');
    if(typeof val === 'string' && val.includes('T')) return val.split('T')[0];
    return val;
  };
  function openEdit(p){
    setEdit(p);
    setForm({
      ...p,
      fecha_pago: toDateInput(p.fecha_pago),
      monto_base:p.monto_base??'',
      horas_trabajadas:p.horas_trabajadas??'',
      honorarios_comision:p.honorarios_comision??'',
      ingreso_final:p.ingreso_final??''
    });
    setErrors({});
    setShowForm(true);
  }

  const [errors, setErrors] = useState({});

  function validate(current){
    const errs = {};
    if(!current.asesor_preregistro_id) errs.asesor_preregistro_id = 'Seleccione asesor';
    if(!current.tipo_servicio) errs.tipo_servicio = 'Requerido';
    if(current.tipo_servicio !== 'curso') {
      if(current.monto_base !== '' && Number(current.monto_base) < 0) errs.monto_base = 'No negativo';
    }
    if(current.horas_trabajadas !== '' && Number(current.horas_trabajadas) < 0) errs.horas_trabajadas = 'No negativo';
    if(current.honorarios_comision !== '' && Number(current.honorarios_comision) < 0) errs.honorarios_comision = 'No negativo';
    if(current.tipo_servicio === 'curso') {
      // Requeridos para calcular
      if(current.horas_trabajadas === '' || Number(current.horas_trabajadas) === 0) errs.horas_trabajadas = errs.horas_trabajadas || 'Requerido';
      if(current.honorarios_comision === '' || Number(current.honorarios_comision) === 0) errs.honorarios_comision = errs.honorarios_comision || 'Requerido';
    } else {
      if(current.ingreso_final !== '' && Number(current.ingreso_final) < 0) errs.ingreso_final = 'No negativo';
    }
    if(!current.fecha_pago) errs.fecha_pago = 'Fecha requerida';
    return errs;
  }

  async function handleSubmit(e){ e.preventDefault();
    const vErrs = validate(form); setErrors(vErrs); if(Object.keys(vErrs).length) return;
    try { setSaving(true); const payload = { ...form };
      // Parse numéricos y cálculo según tipo
      for (const k of ['monto_base','horas_trabajadas','honorarios_comision','ingreso_final']) { if(payload[k] === '') payload[k] = null; }
      if (payload.tipo_servicio === 'curso') {
        const horas = Number(payload.horas_trabajadas||0);
        const tarifa = Number(payload.honorarios_comision||0);
        // Fórmula curso: Horas * Honorarios (sin factor adicional)
        payload.ingreso_final = +(horas * tarifa).toFixed(2);
        // Debe ir 0 porque la columna es NOT NULL DEFAULT 0
        payload.monto_base = 0;
        if (payload.honorarios_comision == null) payload.honorarios_comision = 0;
      } else {
        if (!payload.ingreso_final){
          const base = Number(payload.monto_base||0); 
          const hon = Number(payload.honorarios_comision||0); 
          payload.ingreso_final = base + hon; 
        }
      }
      const selectedAsesor = asesores.find(a=> String(a.id) === String(payload.asesor_preregistro_id));
      if (selectedAsesor) payload.asesor_nombre = `${selectedAsesor.nombres} ${selectedAsesor.apellidos}`.trim();

      // Validación de presupuesto: sólo si marcado Pagado
      const monthOfPay = dayjs(payload.fecha_pago).isValid()? dayjs(payload.fecha_pago).format('YYYY-MM'): dayjs().format('YYYY-MM');
      const isSameMonth = monthOfPay === budgetSummary.mes;
      const newAmount = Number(payload.ingreso_final||0);
      let available = budgetSummary.leftover;
      if(edit && edit.status==='Pagado'){ // al editar, se libera el monto previo
        available += Number(edit.ingreso_final||0);
      }
      if(payload.status==='Pagado' && isSameMonth && newAmount > available){
        // Abrir modal de advertencia y almacenar payload pendiente
        setBudgetWarn({ open:true, info:{ month:monthOfPay, falta: newAmount-available, available, newAmount }, payload, editId: edit? edit.id:null, original: edit });
        setSaving(false);
        return; // detener flujo hasta confirmación
      }

      if (edit) { await actualizarPago(edit.id, payload); } else { await crearPago(payload); }
      await loadPagos(); await refreshBudget(monthOfPay); setShowForm(false); }
    catch(err){ console.error(err); alert('Error guardando'); } finally { setSaving(false);} }

  async function confirmBudgetOverride(){
    if(!budgetWarn.payload) { setBudgetWarn({ open:false, info:null, payload:null, editId:null, original:null }); return; }
    try {
      setSaving(true);
      const { payload, editId } = budgetWarn;
      const monthOfPay = dayjs(payload.fecha_pago).isValid()? dayjs(payload.fecha_pago).format('YYYY-MM'): dayjs().format('YYYY-MM');
      if(editId) await actualizarPago(editId, payload); else await crearPago(payload);
      await loadPagos(); await refreshBudget(monthOfPay);
      setShowForm(false);
    } catch(e){ console.error(e); alert('Error guardando'); }
    finally {
      setSaving(false);
      setBudgetWarn({ open:false, info:null, payload:null, editId:null, original:null });
    }
  }

  async function saveAsPendingFromBudgetWarn(){
    if(!budgetWarn.payload) return;
    try {
      setSaving(true);
      const { payload, editId } = budgetWarn;
      const pendingPayload = { ...payload, status:'Pendiente' };
      const monthOfPay = dayjs(pendingPayload.fecha_pago).isValid()? dayjs(pendingPayload.fecha_pago).format('YYYY-MM'): dayjs().format('YYYY-MM');
      if(editId) await actualizarPago(editId, pendingPayload); else await crearPago(pendingPayload);
      await loadPagos(); await refreshBudget(monthOfPay);
      setShowForm(false);
    } catch(e){ console.error(e); alert('Error guardando'); }
    finally {
      setSaving(false);
      setBudgetWarn({ open:false, info:null, payload:null, editId:null, original:null });
    }
  }

  // Borrado con confirmación y deshacer
  function requestDelete(row){
    setConfirmError('');
    setRowToDelete(row);
    setConfirmOpen(true);
  }
  async function performDelete(row){
    try {
      const originalIndex = pagos.findIndex(r=>r.id===row.id);
      await eliminarPago(row.id);
      setPagos(prev=> prev.filter(r=> r.id !== row.id));
      startUndo(row, originalIndex < 0 ? undefined : originalIndex);
      await refreshBudget();
      return true;
    } catch {
      return false;
    }
  }
  function startUndo(row, index){
    if(undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState({ open:true, row, index, saving:false, error:'' });
    undoTimerRef.current = setTimeout(()=>{
      setUndoState({ open:false, row:null, index:null, saving:false, error:'' });
      undoTimerRef.current = null;
    },7000);
  }
  async function handleUndo(){
    if(!undoState.row) return;
    setUndoState(s=>({...s, saving:true, error:'' }));
    const r = undoState.row;
    try {
      const payload = { asesor_preregistro_id: r.asesor_preregistro_id || null, asesor_nombre: r.asesor_nombre || null, tipo_servicio: r.tipo_servicio, servicio_detalle: r.servicio_detalle || '', monto_base: r.monto_base || 0, horas_trabajadas: r.horas_trabajadas || 0, honorarios_comision: r.honorarios_comision || 0, ingreso_final: r.ingreso_final || 0, fecha_pago: r.fecha_pago, metodo_pago: r.metodo_pago || '', nota: r.nota || '', status: r.status || 'Pagado' };
      await crearPago(payload);
      await loadPagos();
      await refreshBudget();
      if(undoTimerRef.current){ clearTimeout(undoTimerRef.current); undoTimerRef.current=null; }
      setUndoState({ open:false, row:null, index:null, saving:false, error:'' });
    } catch {
      setUndoState(s=>({...s, saving:false, error:'No se pudo restaurar.' }));
    }
  }
  useEffect(()=>()=>{ if(undoTimerRef.current) clearTimeout(undoTimerRef.current); },[]);

  const resumen = useMemo(()=>{ 
    let total = 0, today=0, week=0, month=0, year=0; 
    const now = dayjs();
    pagos.forEach(p=>{ const val = Number(p.ingreso_final||0); total += val; const d = dayjs(p.fecha_pago);
      if(d.isValid()){
        if(d.isSame(now,'day')) today += val;
        if(d.isAfter(now.subtract(7,'day'),'day')) week += val;
        if(d.isSame(now,'month')) month += val;
        if(d.isSame(now,'year')) year += val;
      }
    });
    return { total, count: pagos.length, today, week, month, year };
  },[pagos]);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-6 max-w-screen-2xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Pagos de asesores</h1>
          <p className="text-sm text-gray-500">Registro de honorarios, comisiones y servicios impartidos.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 ring-1 ring-gray-200 text-gray-700 text-sm">
          {notaOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={()=>setNotaOpen(false)}>
              <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-5 relative" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setNotaOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" aria-label="Cerrar">✕</button>
                <h3 className="text-base font-semibold mb-3">Nota</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-72 overflow-auto border rounded-md p-3 bg-gray-50">{notaTexto}</div>
                <div className="mt-4 text-right">
                  <button onClick={()=>setNotaOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Cerrar</button>
                </div>
              </div>
            </div>
          )}
              <span className="text-xs text-gray-500">Total</span>
              <strong className="font-semibold text-gray-900">{money(resumen.total)}</strong>
            </div>
            <button onClick={()=> setShowFilters(s=>!s)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{showFilters ? 'Ocultar filtros' : 'Filtros'}</button>
            <Link to="/administrativo/finanzas/egresos/fijos" className="text-sm text-gray-600 hover:text-gray-800">Fijos</Link>
            <Link to="/administrativo/finanzas/egresos/variables" className="text-sm text-gray-600 hover:text-gray-800">Variables</Link>
            <Link to="/administrativo/finanzas/egresos/presupuesto" className="text-sm text-gray-600 hover:text-gray-800">Presupuesto</Link>
            <Link to="/administrativo/finanzas" className="text-sm text-indigo-600 hover:text-indigo-800">Finanzas</Link>
          </div>
        </div>
      </header>
      {showFilters && (
        <div className="mb-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 pb-4 pt-4 border-b border-gray-200 bg-gray-50/60 text-xs sm:text-[13px]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Desde</label>
                <input type="date" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Hasta</label>
                <input type="date" value={filterTo} onChange={e=>setFilterTo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Asesor</label>
                <select value={filterAsesor} onChange={e=>setFilterAsesor(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todos</option>
                  {asesores.map(a => <option key={a.id} value={a.id}>{`${a.nombres} ${a.apellidos||''}`.trim()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Estatus</label>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todos</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Programado">Programado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Método</label>
                <select value={filterMetodo} onChange={e=>setFilterMetodo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Tipo servicio</label>
                <select value={filterTipoServicio} onChange={e=>setFilterTipoServicio(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todos</option>
                  <option value="curso">Curso</option>
                  <option value="clase">Clase</option>
                  <option value="asesoria">Asesoría</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={applyFilters} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Aplicar filtros</button>
              <button onClick={clearFilters} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Limpiar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Hoy</p>
          <p className="text-2xl font-semibold text-emerald-600">{money(resumen.today)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Últimos 7 días</p>
          <p className="text-2xl font-semibold text-emerald-600">{money(resumen.week)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Mes</p>
          <p className="text-2xl font-semibold text-emerald-600">{money(resumen.month)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Año</p>
          <p className="text-2xl font-semibold text-emerald-600">{money(resumen.year)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Pagos</p>
            <p className="text-2xl font-semibold text-gray-900">{loading?'…': resumen.count}</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-rose-100 text-rose-700 text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Registro de pagos a asesores</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} disabled={exportExcelLoading} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60">{exportExcelLoading? 'Exportando…':'Exportar Excel'}</button>
            <button onClick={openNew} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Nuevo pago</button>
          </div>
        </div>
        {exportExcelError && (
          <div className="px-6 py-2 text-sm text-amber-600">{exportExcelError}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">ID_Pago</th>
                <th className="px-3 py-2 text-center font-semibold">Asesor</th>
                <th className="px-3 py-2 text-center font-semibold">Tipo de servicio</th>
                <th className="px-3 py-2 text-center font-semibold">Monto base</th>
                <th className="px-3 py-2 text-center font-semibold">Horas trabajadas</th>
                <th className="px-3 py-2 text-center font-semibold">Honorarios / Comisión</th>
                <th className="px-3 py-2 text-center font-semibold">Ingreso final</th>
                <th className="px-3 py-2 text-center font-semibold">Fecha de pago</th>
                <th className="px-3 py-2 text-center font-semibold">Método de pago</th>
                <th className="px-3 py-2 text-center font-semibold">Nota</th>
                <th className="px-3 py-2 text-center font-semibold">Status</th>
                {/* Columna de acciones removida: edición por click en fila, eliminación dentro del modal */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-500">Cargando…</td></tr>
              ) : pagos.length ? pagos.map(p => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-indigo-50 cursor-pointer transition-colors"
                  onClick={()=> openEdit(p)}
                  title="Click para editar"
                >
                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap text-center">{p.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800 text-center">{p.asesor_nombre}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">{p.tipo_servicio}{p.servicio_detalle ? ' - '+p.servicio_detalle : ''}</td>
                  <td className="px-3 py-2 text-center">{(p.monto_base===null || p.monto_base===undefined || p.monto_base==='') ? '—' : money(p.monto_base)}</td>
                  <td className="px-3 py-2 text-center">{p.horas_trabajadas ?? '—'}</td>
                  <td className="px-3 py-2 text-center">{p.tipo_servicio==='asesoria' ? ((p.honorarios_comision!==null && p.honorarios_comision!==undefined && p.honorarios_comision!=='') ? `${Number(p.honorarios_comision).toLocaleString()}%` : '—') : money(p.honorarios_comision)}</td>
                  <td className="px-3 py-2 text-center font-semibold">{money(p.ingreso_final)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">{formatFecha(p.fecha_pago)}</td>
                  <td className="px-3 py-2 text-center">{p.metodo_pago || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    {p.nota ? (
                      <button
                        type="button"
                        onClick={(e)=>{ e.stopPropagation(); setNotaTexto(p.nota); setNotaOpen(true); }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-50 text-indigo-600"
                        title="Ver nota"
                        aria-label="Ver nota"
                      >
                        <FaRegEye className="w-4 h-4" />
                      </button>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status==='Pagado'?'bg-emerald-100 text-emerald-700':p.status==='Pendiente'?'bg-amber-100 text-amber-700':'bg-rose-100 text-rose-700'}`}>{p.status}</span>
                  </td>
                  {/* Acciones removidas */}
                </tr>
              )) : (
                <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-500">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="bg-white w-full max-w-lg mt-24 rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50/70">
              <h2 className="text-lg font-semibold text-gray-800">{edit? 'Editar pago':'Nuevo pago'}</h2>
              <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Asesor</label>
                  <select className={`w-full border rounded-lg px-3 py-2 ${errors.asesor_preregistro_id?'border-rose-400 bg-rose-50':''}`} value={form.asesor_preregistro_id} onChange={e=>{ const v = e.target.value; setForm(f=>({...f, asesor_preregistro_id:v})); setErrors(er=>{ const copy={...er}; delete copy.asesor_preregistro_id; return copy; }); }}>
                    <option value="">Seleccione…</option>
                    {asesores.map(a=> <option key={a.id} value={a.id}>{a.nombres} {a.apellidos}</option>)}
                  </select>
                  {errors.asesor_preregistro_id && <p className="mt-1 text-[11px] text-rose-600">{errors.asesor_preregistro_id}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo Servicio</label>
                  <select className={`w-full border rounded-lg px-3 py-2 ${errors.tipo_servicio?'border-rose-400 bg-rose-50':''}`} value={form.tipo_servicio} onChange={e=>{ const v=e.target.value; setForm(f=>({...f, tipo_servicio:v})); setErrors(er=>{ const copy={...er}; delete copy.tipo_servicio; return copy; }); }} required>
                    <option value="curso">Curso</option>
                    <option value="asesoria">Asesoría</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.tipo_servicio && <p className="mt-1 text-[11px] text-rose-600">{errors.tipo_servicio}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Detalle Servicio</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={form.servicio_detalle} onChange={e=> setForm(f=>({...f, servicio_detalle:e.target.value}))} placeholder="Nombre del curso / tema / referencia" />
                </div>
                {form.tipo_servicio !== 'curso' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monto Base</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                      <input type="number" step="0.01" className={`w-full border rounded-lg pl-5 pr-3 py-2 ${errors.monto_base?'border-rose-400 bg-rose-50':''}`} value={form.monto_base} onChange={e=> { const v=e.target.value; setForm(f=>({...f, monto_base:v})); setErrors(er=>{ const copy={...er}; delete copy.monto_base; return copy; }); }} />
                    </div>
                    {errors.monto_base && <p className="mt-1 text-[11px] text-rose-600">{errors.monto_base}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Horas Trabajadas</label>
                  <input type="number" step="0.01" className={`w-full border rounded-lg px-3 py-2 ${errors.horas_trabajadas?'border-rose-400 bg-rose-50':''}`} value={form.horas_trabajadas} onChange={e=> { const v=e.target.value; setForm(f=>({...f, horas_trabajadas:v})); setErrors(er=>{ const copy={...er}; delete copy.horas_trabajadas; return copy; }); }} />
                  {errors.horas_trabajadas && <p className="mt-1 text-[11px] text-rose-600">{errors.horas_trabajadas}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Honorarios / Comisión {form.tipo_servicio==='asesoria' && '(%)'}</label>
                  <div className="relative">
                    <input type="number" step="0.01" className={`w-full border rounded-lg ${form.tipo_servicio==='asesoria'?'pr-8':'pr-3'} px-3 py-2 ${errors.honorarios_comision?'border-rose-400 bg-rose-50':''}`} value={form.honorarios_comision} onChange={e=> { const v=e.target.value; setForm(f=>({...f, honorarios_comision:v, ingreso_final:''})); setErrors(er=>{ const copy={...er}; delete copy.honorarios_comision; return copy; }); }} />
                    {form.tipo_servicio==='asesoria' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">%</span>}
                  </div>
                  {errors.honorarios_comision && <p className="mt-1 text-[11px] text-rose-600">{errors.honorarios_comision}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ingreso Final {form.tipo_servicio==='curso' && '(Horas × Honorarios)'}</label>
                  {(() => { const autoCalc = (() => { const h=Number(form.horas_trabajadas||0); const r=Number(form.honorarios_comision||0); return (h && r)? (h*r).toFixed(2):''; })();
                    return (
                      <input
                        type="number"
                        step="0.01"
                        className={`w-full border rounded-lg px-3 py-2 ${errors.ingreso_final?'border-rose-400 bg-rose-50':''} ${form.tipo_servicio==='curso'?'bg-gray-50 cursor-not-allowed':''}`}
                        value={form.tipo_servicio==='curso' ? autoCalc : form.ingreso_final}
                        onChange={e=> { if(form.tipo_servicio==='curso') return; const v=e.target.value; setForm(f=>({...f, ingreso_final:v})); setErrors(er=>{ const copy={...er}; delete copy.ingreso_final; return copy; }); }}
                        placeholder={form.tipo_servicio==='curso' ? 'Horas × Honorarios' : 'Auto = base + comisión'}
                        disabled={form.tipo_servicio==='curso'}
                      />
                    ); })()}
                  {errors.ingreso_final && <p className="mt-1 text-[11px] text-rose-600">{errors.ingreso_final}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Pago</label>
                  <input type="date" className={`w-full border rounded-lg px-3 py-2 ${errors.fecha_pago?'border-rose-400 bg-rose-50':''}`} value={form.fecha_pago} onChange={e=> { const v=e.target.value; setForm(f=>({...f, fecha_pago:v})); setErrors(er=>{ const copy={...er}; delete copy.fecha_pago; return copy; }); }} required />
                  {errors.fecha_pago && <p className="mt-1 text-[11px] text-rose-600">{errors.fecha_pago}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Método Pago</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={form.metodo_pago} onChange={e=> setForm(f=>({...f, metodo_pago:e.target.value}))}>
                    <option value="">Seleccione…</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Deposito">Deposito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estatus</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={e=> setForm(f=>({...f, status:e.target.value}))}>
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nota</label>
                  <textarea rows={3} className="w-full border rounded-lg px-3 py-2 resize-none" value={form.nota} onChange={e=> setForm(f=>({...f, nota:e.target.value}))} placeholder="Observaciones" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                {edit && (
                  <button
                    type="button"
                    onClick={()=> requestDelete(edit)}
                    className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium border border-rose-200"
                  >Borrar</button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                <button type="button" onClick={()=> setShowForm(false)} className="px-3 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 text-xs font-medium">Cancelar</button>
                <button disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-60 text-xs">{saving? 'Guardando…':'Guardar'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal confirmación borrado */}
      {confirmOpen && rowToDelete && (
        <div className="fixed inset-0 z-[10050] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Eliminar pago</h3>
              <button onClick={()=>!confirmLoading && setConfirmOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
              <p>¿Seguro que deseas eliminar este pago? Podrás deshacer durante 7 segundos.</p>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 text-xs space-y-1">
                <div><span className="text-gray-500">ID:</span> <span className="text-gray-800 font-medium">{rowToDelete.id}</span></div>
                <div><span className="text-gray-500">Asesor:</span> <span className="text-gray-800">{rowToDelete.asesor_nombre || '—'}</span></div>
                <div><span className="text-gray-500">Fecha:</span> <span className="text-gray-800">{rowToDelete.fecha_pago}</span></div>
                <div><span className="text-gray-500">Ingreso final:</span> <span className="text-emerald-700 font-medium">{money(rowToDelete.ingreso_final)}</span></div>
              </div>
              {confirmError && <p className="text-[11px] text-rose-600">{confirmError}</p>}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={()=> setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >Cancelar</button>
              <button
                type="button"
                onClick={async()=>{
                  setConfirmLoading(true); setConfirmError('');
                  const ok = await performDelete(rowToDelete);
                  setConfirmLoading(false);
                  if(ok){ setConfirmOpen(false); setRowToDelete(null); setShowForm(false); setEdit(null); }
                  else setConfirmError('No se pudo eliminar.');
                }}
                className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70"
                disabled={confirmLoading}
              >{confirmLoading ? 'Eliminando…':'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast undo */}
      {undoState.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10100]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
            <span className="text-sm text-gray-700">Pago eliminado.</span>
            {undoState.error && <span className="text-[11px] text-rose-600">{undoState.error}</span>}
            <button
              onClick={undoState.saving? undefined : handleUndo}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
              disabled={undoState.saving}
            >{undoState.saving ? 'Restaurando…' : 'Deshacer'}</button>
          </div>
        </div>
      )}
      {/* Modal presupuesto insuficiente */}
      {budgetWarn.open && budgetWarn.info && (()=>{ const info = budgetWarn.info; const fmt = (n)=> Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'}); return (
        <div className="fixed inset-0 z-[11000] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-amber-50/60">
              <h3 className="text-base font-semibold text-amber-800">Presupuesto insuficiente</h3>
              <button onClick={()=> setBudgetWarn({ open:false, info:null, payload:null, editId:null, original:null })} className="text-amber-600 hover:text-amber-800">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-3">
              <p>El egreso marcado excede el presupuesto disponible del mes.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Presupuesto</div><div className="font-semibold">{fmt(budgetSummary.budget)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Gastado</div><div className="font-semibold">{fmt(budgetSummary.spent)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Disponible</div><div className="font-semibold">{fmt(budgetSummary.leftover)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Egreso</div><div className="font-semibold text-rose-600">{fmt(info.newAmount)}</div></div>
              </div>
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">Continuar lo dejará en negativo por {fmt(info.falta)}.</div>
            </div>
            <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-gray-50">
              <button onClick={saveAsPendingFromBudgetWarn} className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm">Guardar como Pendiente</button>
              <button onClick={confirmBudgetOverride} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Continuar y guardar</button>
            </div>
          </div>
        </div>
      ); })()}
    </section>
  );
}