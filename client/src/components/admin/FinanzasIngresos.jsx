import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function FinanzasIngresos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    alumno: '',
    curso: '',
    fechaInicio: '',
  horaInicio: '',
  asesorId: '',
    metodo: 'Efectivo',
    importe: '',
    estatus: 'Pagado',
  descripcion: '',
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Formato y validación de importe: solo números y punto decimal, con comas de miles
  const onChangeImporte = (e) => {
    let v = e.target.value || '';
    // Dejar solo dígitos y puntos
    v = v.replace(/[^\d.]/g, '');
    // Mantener solo un punto decimal
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    // Separar entero y decimales, limitar a 2 decimales
    const [enteroRaw, decRaw] = v.split('.');
    const entero = (enteroRaw || '').replace(/^0+(?=\d)/, '');
    const withCommas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const dec = decRaw !== undefined ? decRaw.slice(0, 2) : undefined;
    const formatted = dec !== undefined ? (dec.length ? `${withCommas}.${dec}` : `${withCommas}.`) : withCommas;
    setForm((f) => ({ ...f, importe: formatted }));
  };

  const [asesores, setAsesores] = useState([]);
  const [asesoresLoading, setAsesoresLoading] = useState(false);
  const [asesoresError, setAsesoresError] = useState('');

  // Helper para normalizar fechas a YYYY-MM-DD para UI
  const toDateLabel = (v) => {
    const d = dayjs(v);
    if (d.isValid()) return d.format('YYYY-MM-DD');
    if (typeof v === 'string' && v.includes('T')) return v.split('T')[0];
    return v || '';
  };

  // Hora “inteligente” para el evento del calendario
  // - Si la fecha es hoy: usar hora local actual +15 min (redondeado al siguiente múltiplo de 5)
  // - Si es otra fecha: usar 09:00
  const getSmartEventTime = (fechaYYYYMMDD) => {
    const today = dayjs();
    const eventDate = dayjs(fechaYYYYMMDD, 'YYYY-MM-DD');
    if (eventDate.isSame(today, 'day')) {
      let t = today.add(15, 'minute');
      const mins = t.minute();
      const rounded = Math.ceil(mins / 5) * 5;
      if (rounded === 60) {
        t = t.add(1, 'hour').minute(0);
      } else {
        t = t.minute(rounded);
      }
      // No ir al siguiente día por overflow
      if (!t.isSame(today, 'day')) t = today.endOf('day').hour(21).minute(0); // 21:00 como tope
      return t.format('HH:mm'); // 24h
    }
    return '09:00';
  };

  // Estilos por estatus
  const statusClasses = (s) => {
    if (s === 'Pagado') return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    if (s === 'Pendiente') return 'border border-amber-200 bg-amber-50 text-amber-700';
    return 'border border-rose-200 bg-rose-50 text-rose-700';
  };
  // Estilos por asistencia
  const asistenciaClasses = (s) => {
    if (!s) return 'border border-gray-200 bg-gray-50 text-gray-600';
    if (s === 'Impartida') return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    if (String(s).toLowerCase().includes('alumno')) return 'border border-amber-200 bg-amber-50 text-amber-700';
    return 'border border-rose-200 bg-rose-50 text-rose-700';
  };

  useEffect(() => {
    const loadAsesores = async () => {
      try {
        setAsesoresLoading(true); setAsesoresError('');
        const res = await api.get('/asesores/admin/list');
        setAsesores(res.data?.data || []);
      } catch (e) {
        setAsesoresError('No se pudieron cargar los asesores');
      } finally { setAsesoresLoading(false); }
    };
    const loadIngresos = async () => {
      try {
        setLoading(true); setError('');
  const res = await api.get('/finanzas/ingresos?origen=manual');
        const list = (res.data?.data || []).map((r) => ({
          alumno: r.alumno_nombre || (r.estudiante_nombre ? `${r.estudiante_nombre} ${r.estudiante_apellidos || ''}`.trim() : (r.estudiante_id ? `#${r.estudiante_id}` : `Ingreso ${r.id}`)),
          curso: r.curso,
          fechaInicio: toDateLabel(r.fecha),
          horaInicio: r.hora || '',
          asesor: r.asesor_nombre || '',
          metodo: r.metodo,
          importe: Number(r.importe || 0),
          estatus: r.estatus,
          descripcion: r.descripcion || '',
          calendarEventId: r.calendar_event_id || null,
          ...( (()=>{ try { const n = r.notas && JSON.parse(r.notas); const a = n?.asistencia; return a ? { asistenciaEstado: a.estado || null, asistenciaNota: a.nota || '', asistenciaFecha: a.fecha || null } : {}; } catch { return {}; } })() ),
          _id: r.id,
        }));
        setRows(list);
      } catch (e) {
        setError('No se pudieron cargar los ingresos');
      } finally {
        setLoading(false);
      }
    };
    loadAsesores();
    loadIngresos();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    // Validación mínima
  if (!form.alumno || !form.curso || !form.fechaInicio || !form.asesorId || !form.metodo || !form.importe) return;
    const amount = parseFloat(String(form.importe).replace(/,/g, ''));
    if (Number.isNaN(amount)) return;
    const asesorSel = asesores.find(a => String(a.id) === String(form.asesorId));
    const asesorNombre = asesorSel ? `${asesorSel.nombres} ${asesorSel.apellidos || ''}`.trim() : '';
    const nuevo = {
      alumno: form.alumno.trim(),
      curso: form.curso.trim(),
      fechaInicio: form.fechaInicio,
  horaInicio: form.horaInicio || '',
      asesor: asesorNombre,
      metodo: form.metodo,
      importe: amount,
      estatus: form.estatus || 'Pagado',
  descripcion: form.descripcion?.trim() || '',
    };
    // Crear en backend y refrescar lista
  try {
      const payload = {
        estudiante_id: null,
        alumno_nombre: nuevo.alumno,
        asesor_preregistro_id: form.asesorId || null,
        asesor_nombre: asesorNombre || null,
        curso: nuevo.curso,
        fecha: nuevo.fechaInicio,
        hora: nuevo.horaInicio || null,
        metodo: nuevo.metodo,
        importe: nuevo.importe,
        estatus: nuevo.estatus,
        comprobante_id: null,
        notas: null,
        descripcion: nuevo.descripcion || null,
      };
      const createdRes = await api.post('/finanzas/ingresos', payload);
      const createdIngreso = createdRes?.data?.ingreso;
      // Crear evento en Calendario para la misma fecha/hora de inicio
      try {
        const titulo = `Inicio ${nuevo.curso} - ${nuevo.alumno}`;
        const descripcion = `Asesor: ${asesorNombre || '-'} | Método: ${nuevo.metodo} | Importe: ${formatCurrency(nuevo.importe)} | Estatus: ${nuevo.estatus}` + (nuevo.descripcion ? ` | Nota: ${nuevo.descripcion}` : '');
        const horaEvento = nuevo.horaInicio ? nuevo.horaInicio : getSmartEventTime(nuevo.fechaInicio);
        const recordarMinutos = dayjs(nuevo.fechaInicio).isSame(dayjs(), 'day') ? 10 : 30;
        const evRes = await api.post('/admin/calendar/events', {
          titulo,
          descripcion,
          fecha: nuevo.fechaInicio,
          hora: horaEvento,
          tipo: 'trabajo',
          prioridad: 'media',
          recordarMinutos,
          completado: false,
        });
        const ev = evRes?.data;
        if (createdIngreso?.id && ev?.id) {
          try { await api.put(`/finanzas/ingresos/${createdIngreso.id}`, { calendar_event_id: ev.id }); } catch {}
        }
      } catch (calErr) {
        console.warn('No se pudo crear el evento de calendario para el ingreso:', calErr?.response?.status || calErr?.message || calErr);
      }
      const res = await api.get('/finanzas/ingresos?origen=manual');
      const list = (res.data?.data || []).map((r) => ({
        alumno: r.alumno_nombre || (r.estudiante_nombre ? `${r.estudiante_nombre} ${r.estudiante_apellidos || ''}`.trim() : (r.estudiante_id ? `#${r.estudiante_id}` : `Ingreso ${r.id}`)),
        curso: r.curso,
        fechaInicio: toDateLabel(r.fecha),
        horaInicio: r.hora || '',
        asesor: r.asesor_nombre || '',
        metodo: r.metodo,
        importe: Number(r.importe || 0),
        estatus: r.estatus,
        descripcion: r.descripcion || '',
        calendarEventId: r.calendar_event_id || null,
        ...( (()=>{ try { const n = r.notas && JSON.parse(r.notas); const a = n?.asistencia; return a ? { asistenciaEstado: a.estado || null, asistenciaNota: a.nota || '', asistenciaFecha: a.fecha || null } : {}; } catch { return {}; } })() ),
        _id: r.id,
      }));
      setRows(list);
    } catch (_e) {
      // Fallback local si hay error
      setRows((r) => [...r, nuevo]);
    }
  setForm({ alumno: '', curso: '', fechaInicio: '', horaInicio: '', asesorId: '', metodo: 'Efectivo', importe: '', estatus: 'Pagado', descripcion: '' });
    closeModal();
  };

  const formatCurrency = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  // Totales dinámicos
  const totals = useMemo(() => {
    const now = dayjs();
    const todayStart = now.startOf('day');
    const todayEnd = now.endOf('day');
    const weekStart = todayStart.subtract(6, 'day'); // Inclusivo, últimos 7 días: hoy y 6 días atrás

    let totalAll = 0;
    let totalToday = 0;
    let totalWeek = 0; // últimos 7 días
    let totalMonth = 0;
    let totalYear = 0;

    for (const r of rows) {
      if (String(r.estatus) !== 'Pagado') continue; // Solo sumar Pagado
      const amt = Number(r.importe) || 0;
      const d = dayjs(r.fechaInicio);
      totalAll += amt;
      if (d.isSame(now, 'day')) totalToday += amt;
      if ((d.isAfter(weekStart) || d.isSame(weekStart, 'day')) && (d.isBefore(todayEnd) || d.isSame(todayEnd, 'day'))) totalWeek += amt;
      if (d.isSame(now, 'month')) totalMonth += amt;
      if (d.isSame(now, 'year')) totalYear += amt;
    }
    return { all: totalAll, today: totalToday, week: totalWeek, month: totalMonth, year: totalYear };
  }, [rows]);

  // Datos para gráfica: últimos 6 meses por mes
  const monthlyData = useMemo(() => {
    const now = dayjs();
    const months = Array.from({ length: 6 }, (_, i) => now.subtract(5 - i, 'month'));
    return months.map(m => {
      const value = rows.reduce((acc, r) => {
        if (String(r.estatus) !== 'Pagado') return acc;
        return acc + (dayjs(r.fechaInicio).isSame(m, 'month') ? (Number(r.importe) || 0) : 0);
      }, 0);
      return { label: m.format('YYYY-MM'), total: Number(value.toFixed(2)) };
    });
  }, [rows]);

  const [showChart, setShowChart] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  // Modal: ver descripción
  const [descOpen, setDescOpen] = useState(false);
  const [descRow, setDescRow] = useState(null);
  // Modal: marcar asistencia
  const [asistOpen, setAsistOpen] = useState(false);
  const [asistRow, setAsistRow] = useState(null);
  const [asistEstado, setAsistEstado] = useState('Impartida');
  const [asistNota, setAsistNota] = useState('');
  const [asistSaving, setAsistSaving] = useState(false);
  const [asistError, setAsistError] = useState('');
  // Confirmación de borrado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [rowToDelete, setRowToDelete] = useState(null);

  // Deshacer borrado (7s)
  const undoTimerRef = useRef(null);
  const [undoState, setUndoState] = useState({ open: false, row: null, index: null, saving: false, error: '' });

  const startUndo = (row, index) => {
    if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); }
    setUndoState({ open: true, row, index, saving: false, error: '' });
    undoTimerRef.current = setTimeout(() => {
      setUndoState({ open: false, row: null, index: null, saving: false, error: '' });
      undoTimerRef.current = null;
    }, 7000);
  };

  const handleUndo = async () => {
    if (!undoState.row) return;
    setUndoState(s => ({ ...s, saving: true, error: '' }));
    const r = undoState.row;
    try {
      // Recrear ingreso
      const payload = {
        estudiante_id: null,
        alumno_nombre: r.alumno,
        asesor_preregistro_id: null,
        asesor_nombre: r.asesor || null,
        curso: r.curso,
        fecha: r.fechaInicio,
        hora: r.horaInicio || null,
        metodo: r.metodo,
        importe: Number(r.importe) || 0,
        estatus: r.estatus || 'Pagado',
        comprobante_id: null,
        notas: r.asistenciaEstado || r.asistenciaNota || r.asistenciaFecha ? JSON.stringify({ asistencia: { estado: r.asistenciaEstado || null, nota: r.asistenciaNota || '', fecha: r.asistenciaFecha || null } }) : null,
        descripcion: r.descripcion || null,
      };
      const createdRes = await api.post('/finanzas/ingresos', payload);
      const createdIngreso = createdRes?.data?.ingreso;

      let newCalendarEventId = null;
      // Recrear evento de calendario
      try {
        const titulo = `Inicio ${r.curso} - ${r.alumno}`;
        const descripcion = `Asesor: ${r.asesor || '-'} | Método: ${r.metodo} | Importe: ${formatCurrency(Number(r.importe)||0)} | Estatus: ${r.estatus || 'Pagado'}` + (r.descripcion ? ` | Nota: ${r.descripcion}` : '');
        const horaEvento = r.horaInicio || getSmartEventTime(r.fechaInicio);
        const recordarMinutos = dayjs(r.fechaInicio).isSame(dayjs(), 'day') ? 10 : 30;
        const evRes = await api.post('/admin/calendar/events', {
          titulo,
          descripcion,
          fecha: r.fechaInicio,
          hora: horaEvento,
          tipo: 'trabajo',
          prioridad: 'media',
          recordarMinutos,
          completado: false,
        });
        const ev = evRes?.data;
        if (createdIngreso?.id && ev?.id) {
          newCalendarEventId = ev.id;
          try { await api.put(`/finanzas/ingresos/${createdIngreso.id}`, { calendar_event_id: ev.id }); } catch {}
        }
      } catch (_) { /* opcional: ignorar */ }

      // Insertar de vuelta en la posición original
      const restored = {
        ...r,
        _id: createdIngreso?.id || r._id,
        calendarEventId: newCalendarEventId,
      };
      setRows(prev => {
        const arr = [...prev];
        const idx = Math.min(Math.max(undoState.index ?? arr.length, 0), arr.length);
        arr.splice(idx, 0, restored);
        return arr;
      });

      if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
      setUndoState({ open: false, row: null, index: null, saving: false, error: '' });
    } catch (e) {
      setUndoState(s => ({ ...s, saving: false, error: 'No se pudo deshacer.' }));
    }
  };

  useEffect(() => {
    return () => { if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); } };
  }, []);

  const openEdit = (row) => { setEditData({ ...row }); setEditOpen(true); };
  const closeEdit = () => { setEditOpen(false); setEditData(null); };
  const onDelete = async (row) => {
    try {
      const originalIndex = rows.findIndex(x => x._id === row._id);
      await api.delete(`/finanzas/ingresos/${row._id}`);
      // Intentar borrar el evento de calendario enlazado (fallback por si el servidor no pudo)
      if (row.calendarEventId) {
        try {
          await api.delete(`/admin/calendar/events/${row.calendarEventId}`);
        } catch (err) {
          // Si está protegido por vínculo, ignorar y continuar
          // Silenciar: si ya fue borrado en backend o no existe, ignorar
          if (err?.response?.status === 409) {
            console.info('Evento ligado a ingreso: borrado solo desde Ingresos.');
          }
        }
      }
  setRows(prev => prev.filter(x => x._id !== row._id));
  // Mostrar deshacer
  startUndo(row, originalIndex < 0 ? undefined : originalIndex);
      return true;
    } catch {
      return false;
    }
  };
  const onEditSubmit = async (e) => {
    e.preventDefault(); if (!editData) return;
    try {
      const body = {};
      if (editData.alumno) body.alumno_nombre = editData.alumno;
      if (editData.curso) body.curso = editData.curso;
      if (editData.fechaInicio) body.fecha = editData.fechaInicio;
      if (editData.horaInicio) body.hora = editData.horaInicio;
      if (editData.metodo) body.metodo = editData.metodo;
      if (typeof editData.importe === 'number') body.importe = editData.importe;
      if (editData.estatus) body.estatus = editData.estatus;
      if (typeof editData.descripcion !== 'undefined') body.descripcion = editData.descripcion;
      await api.put(`/finanzas/ingresos/${editData._id}`, body);
      setRows(prev => prev.map(x => x._id === editData._id ? { ...x, ...editData } : x));
      closeEdit();
    } catch { alert('No se pudo guardar cambios'); }
  };


  return (
  <section className="px-4 sm:px-6 lg:px-10 pt-4 pb-8 max-w-screen-2xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Ingresos</h1>
          <p className="text-sm text-gray-500">Registra y consulta los ingresos de la academia.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link to="/administrativo/finanzas" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">Volver a Finanzas</Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 ring-1 ring-gray-200 text-gray-700 text-sm">
              <span className="text-xs text-gray-500">Total</span>
              <strong className="font-semibold text-gray-900">{formatCurrency(totals.all)}</strong>
            </div>
            <button onClick={() => setShowChart(true)} className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Ver gráfica
            </button>
          </div>
        </div>
      </header>

      {/* Tarjetas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Hoy</p>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totals.today)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Últimos 7 días</p>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totals.week)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Mes</p>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totals.month)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Año</p>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totals.year)}</p>
        </div>
      </div>

      {/* Registro de ingresos */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Registro de ingresos</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="sm:hidden text-xs text-gray-600">Total: <span className="font-semibold text-gray-900">{formatCurrency(totals.all)}</span></div>
            <button onClick={openModal} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo ingreso</span>
            </button>
          </div>
        </div>

        {/* Vista móvil (cards) */}
    <div className="sm:hidden p-4 space-y-3">
          {loading && <div className="text-sm text-gray-500">Cargando…</div>}
          {error && <div className="text-sm text-amber-600">{error}</div>}
          {rows.map((r, idx) => (
      <div key={idx} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 cursor-pointer" onClick={() => openEdit(r)}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900 truncate pr-2">{idx + 1}. {r.alumno}</div>
                <select
                  className={`${statusClasses(r.estatus)} rounded-md text-[11px] px-2 py-1`}
                  value={r.estatus}
          onClick={(e)=>e.stopPropagation()}
                  onChange={async (e) => {
                    const newVal = e.target.value;
                    setRows(prev => prev.map(x => x._id === r._id ? { ...x, estatus: newVal } : x));
                    try {
                      await api.put(`/finanzas/ingresos/${r._id}`, { estatus: newVal });
                      if (r.calendarEventId) {
                        const desc = `Asesor: ${r.asesor || '-'} | Método: ${r.metodo} | Importe: ${formatCurrency(r.importe)} | Estatus: ${newVal}` + (r.descripcion ? ` | Nota: ${r.descripcion}` : '');
                        try { await api.put(`/admin/calendar/events/${r.calendarEventId}`, { descripcion: desc }); } catch {}
                      }
                    } catch (err) {
                      setRows(prev => prev.map(x => x._id === r._id ? { ...x, estatus: r.estatus } : x));
                    }
                  }}
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>
              <div className="text-xs text-gray-600 mb-2 truncate">{r.curso}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-2">
                <div className="flex items-center gap-1"><span className="text-gray-500">Inicio:</span><span className="font-medium text-gray-800">{r.fechaInicio}</span></div>
                <div className="flex items-center gap-1"><span className="text-gray-500">Hora:</span><span className="font-medium text-gray-800">{r.horaInicio ? String(r.horaInicio).slice(0,5) : '-'}</span></div>
                <div className="flex items-center gap-1"><span className="text-gray-500">Asesor:</span><span className="font-medium text-gray-800 truncate">{r.asesor}</span></div>
                <div className="flex items-center gap-1"><span className="text-gray-500">Método:</span><span className="font-medium text-gray-800">{r.metodo}</span></div>
                <div className="flex items-center justify-end gap-1 col-span-2">
                  <span className="text-gray-500">Importe</span>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{formatCurrency(r.importe)}</span>
                </div>
              </div>
              {r.descripcion ? (
                <div className="text-[11px] text-gray-600 truncate"><span className="text-gray-500">Descripción:</span> <span className="text-gray-800" title={r.descripcion}>{r.descripcion}</span></div>
              ) : null}
              <div className="mt-1 text-[11px] text-gray-600 flex items-center gap-2">
                <span className="text-gray-500">Asistencia:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${asistenciaClasses(r.asistenciaEstado)}`}>{r.asistenciaEstado || '—'}</span>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                {r.descripcion ? (
                  <button
                    className="inline-flex items-center px-2 py-1 text-[10px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                    title="Ver descripción"
                    onClick={(e)=>{ e.stopPropagation(); setDescRow(r); setDescOpen(true); }}
                  >👁️ Ver</button>
                ) : null}
                <button
                  className="inline-flex items-center px-2 py-1 text-[10px] rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  title={r.asistenciaEstado ? `Asistencia: ${r.asistenciaEstado}` : 'Marcar asistencia'}
                  onClick={(e)=>{ e.stopPropagation(); setAsistRow(r); setAsistEstado(r.asistenciaEstado || 'Impartida'); setAsistNota(r.asistenciaNota || ''); setAsistOpen(true); }}
                >✅ Asistencia</button>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop/tablet (tabla) */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto max-h-[60vh]">
      <table className="min-w-[980px] md:min-w-[1060px] xl:min-w-[1260px] w-full text-sm">
    <thead className="bg-gray-50/80 backdrop-blur text-gray-600 sticky top-0 z-10">
              <tr>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">#</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Alumno</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Curso / Asesoría</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Fecha</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Hora</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Asesor</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Pago</th>
        <th className="text-right font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Importe</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0">Estatus</th>
  <th className="text-center font-semibold px-2 py-3 border-r border-gray-200 last:border-r-0 w-[60px] min-w-[60px] max-w-[60px] whitespace-nowrap">Desc.</th>
        <th className="text-left font-semibold px-4 py-3 border-r border-gray-200 last:border-r-0 whitespace-nowrap">Asistencia</th>
        <th className="text-left font-semibold px-4 py-3">Acciones</th>
              </tr>
            </thead>
      <tbody>
              {rows.map((r, idx) => (
        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50 cursor-pointer" onClick={() => openEdit(r)}>
          <td className="px-4 py-3 text-gray-500 border-r border-gray-100">{idx + 1}</td>
          <td className="px-4 py-3 text-gray-900 font-medium max-w-[240px] truncate border-r border-gray-100">{r.alumno}</td>
          <td className="px-4 py-3 text-gray-700 max-w-[260px] truncate border-r border-gray-100">{r.curso}</td>
          <td className="px-4 py-3 text-gray-700 border-r border-gray-100">{(r.fechaInicio && dayjs(r.fechaInicio).isValid()) ? dayjs(r.fechaInicio).format('DD/MM/YY') : (r.fechaInicio || '-')}</td>
          <td className="px-4 py-3 text-gray-700 border-r border-gray-100">{r.horaInicio ? String(r.horaInicio).slice(0,5) : '-'}</td>
          <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate border-r border-gray-100">{r.asesor}</td>
          <td className="px-4 py-3 text-gray-700 border-r border-gray-100">{String(r.metodo || '').toLowerCase()}</td>
          <td className="px-4 py-3 text-right border-r border-gray-100">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-semibold">{formatCurrency(r.importe)}</span>
                  </td>
          <td className="px-4 py-3 border-r border-gray-100">
                    <select
                      className={`${statusClasses(r.estatus)} rounded-md text-xs px-2 py-1`}
                      value={r.estatus}
                      onClick={(e)=>e.stopPropagation()}
                      onChange={async (e) => {
                        const newVal = e.target.value;
                        setRows(prev => prev.map(x => x._id === r._id ? { ...x, estatus: newVal } : x));
                        try {
                          await api.put(`/finanzas/ingresos/${r._id}`, { estatus: newVal });
                          // Si hay evento de calendario, actualizar su descripción para reflejar el nuevo estatus
                          if (r.calendarEventId) {
                            const desc = `Asesor: ${r.asesor || '-'} | Método: ${r.metodo} | Importe: ${formatCurrency(r.importe)} | Estatus: ${newVal}` + (r.descripcion ? ` | Nota: ${r.descripcion}` : '');
                            try { await api.put(`/admin/calendar/events/${r.calendarEventId}`, { descripcion: desc }); } catch {}
                          }
                        } catch (err) {
                          // revertir en caso de error
                          setRows(prev => prev.map(x => x._id === r._id ? { ...x, estatus: r.estatus } : x));
                        }
                      }}
                    >
                      <option value="Pagado">Pagado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Vencido">Vencido</option>
                    </select>
                  </td>
      <td className="px-2 py-3 text-gray-700 border-r border-gray-100 text-center w-[60px] min-w-[60px] max-w-[60px]">
                    {r.descripcion ? (
                      <button
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-indigo-600 mx-auto"
                        aria-label="Ver descripción"
                        title="Ver descripción"
                        onClick={(e)=>{ e.stopPropagation(); setDescRow(r); setDescOpen(true); }}
                      >
                        <FaRegEye className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 border-r border-gray-100">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md ${asistenciaClasses(r.asistenciaEstado)}`}>{r.asistenciaEstado || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        title={r.asistenciaEstado ? `Asistencia: ${r.asistenciaEstado}` : 'Marcar asistencia'}
                        onClick={(e)=>{ e.stopPropagation(); setAsistRow(r); setAsistEstado(r.asistenciaEstado || 'Impartida'); setAsistNota(r.asistenciaNota || ''); setAsistOpen(true); }}
                      >✅</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Modal Gráfica */}
      {showChart && (
  <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 pt-[92px] sm:pt-[112px] pb-8 bg-black/40">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden mx-auto my-6 sm:my-8">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Ingresos por mes</h3>
                <p className="text-xs text-gray-500">Últimos 6 meses</p>
              </div>
              <button onClick={() => setShowChart(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 h-[300px] sm:h-[340px] md:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString('es-MX')} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <div className="text-gray-600">Total acumulado: <span className="font-semibold text-gray-900">{formatCurrency(totals.all)}</span></div>
              <button onClick={() => setShowChart(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Ver Descripción */}
      {descOpen && descRow && (
        <div className="fixed inset-0 z-[9999] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Descripción</h3>
              <button onClick={()=>setDescOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm text-gray-700">
              <div className="text-gray-500 text-xs">{descRow.alumno} • {descRow.curso} • {descRow.fechaInicio}{descRow.horaInicio?` ${descRow.horaInicio}`:''}</div>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 whitespace-pre-wrap break-words min-h-[80px]">{descRow.descripcion}</div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end">
              <button onClick={()=>setDescOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Marcar Asistencia */}
      {asistOpen && asistRow && (
  <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden mx-auto my-6 sm:my-8">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Marcar asistencia</h3>
              <button onClick={()=>!asistSaving && setAsistOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="text-xs text-gray-500">{asistRow.alumno} • {asistRow.curso} • {asistRow.fechaInicio}{asistRow.horaInicio?` ${asistRow.horaInicio}`:''}</div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select value={asistEstado} onChange={(e)=>setAsistEstado(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Impartida">Impartida</option>
                  <option value="No asistió alumno">No asistió alumno</option>
                  <option value="No asistió asesor">No asistió asesor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nota (opcional)</label>
                <textarea rows={3} maxLength={200} value={asistNota} onChange={(e)=>setAsistNota(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Motivo, comentarios" />
                {asistError ? (<p className="mt-1 text-[11px] text-rose-600">{asistError}</p>) : null}
                {asistRow.asistenciaEstado ? (
                  <p className="mt-2 text-[11px] text-gray-500">Última marcación: <span className="font-medium text-gray-700">{asistRow.asistenciaEstado}</span>{asistRow.asistenciaFecha?` • ${asistRow.asistenciaFecha}`:''}</p>
                ) : null}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={()=>setAsistOpen(false)} disabled={asistSaving} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60">Cancelar</button>
              <button
                onClick={async()=>{
                  if(!asistRow) return;
                  setAsistSaving(true); setAsistError('');
                  const payload = { asistencia: { estado: asistEstado, nota: asistNota, fecha: dayjs().format('YYYY-MM-DD HH:mm:ss') } };
                  try {
                    await api.put(`/finanzas/ingresos/${asistRow._id}`, { notas: JSON.stringify(payload) });
                    setRows(prev => prev.map(x => x._id === asistRow._id ? { ...x, asistenciaEstado: payload.asistencia.estado, asistenciaNota: payload.asistencia.nota, asistenciaFecha: payload.asistencia.fecha } : x));
                    setAsistOpen(false); setAsistRow(null);
                  } catch(e) {
                    setAsistError('No se pudo guardar.');
                  } finally { setAsistSaving(false); }
                }}
                disabled={asistSaving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
              >{asistSaving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Editar Ingreso */}
      {editOpen && editData && (
  <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">Editar ingreso</h3>
              <button onClick={closeEdit} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={onEditSubmit} className="flex-1 flex flex-col">
              <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alumno</label>
                    <input value={editData.alumno} onChange={(e)=>setEditData(d=>({...d, alumno:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Curso / Asesoría</label>
                    <input value={editData.curso} onChange={(e)=>setEditData(d=>({...d, curso:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
                    <input type="date" value={editData.fechaInicio} onChange={(e)=>setEditData(d=>({...d, fechaInicio:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                    <input type="time" value={editData.horaInicio || ''} onChange={(e)=>setEditData(d=>({...d, horaInicio:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Método</label>
                    <select value={editData.metodo} onChange={(e)=>setEditData(d=>({...d, metodo:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Importe</label>
                    <input type="number" step="0.01" value={editData.importe} onChange={(e)=>setEditData(d=>({...d, importe:Number(e.target.value || 0)}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estatus</label>
                    <select value={editData.estatus} onChange={(e)=>setEditData(d=>({...d, estatus:e.target.value}))} className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${statusClasses(editData.estatus)}`}>
                      <option value="Pagado">Pagado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Vencido">Vencido</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                    <textarea rows={2} maxLength={200} value={editData.descripcion || ''} onChange={(e)=>setEditData(d=>({...d, descripcion:e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => { setConfirmError(''); setRowToDelete(editData); setConfirmOpen(true); }}
                  className="px-4 py-2 text-sm rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Borrar
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Ingreso */}
      {showModal && (
  <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">Nuevo ingreso</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alumno</label>
                    <input name="alumno" value={form.alumno} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nombre del alumno" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Curso / Asesoría</label>
                    <input name="curso" value={form.curso} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nombre del curso" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                    <input type="time" name="horaInicio" value={form.horaInicio} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Asesor</label>
                    <select name="asesorId" value={form.asesorId} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                      <option value="" disabled>{asesoresLoading ? 'Cargando asesores…' : 'Selecciona asesor'}</option>
                      {asesores.map(a => (
                        <option key={a.id} value={a.id}>{`${a.nombres} ${a.apellidos || ''}`.trim()}</option>
                      ))}
                    </select>
                    {asesoresError && <p className="mt-1 text-[11px] text-amber-600">{asesoresError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pago</label>
                    <select name="metodo" value={form.metodo} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Importe</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="importe"
                      value={form.importe}
                      onChange={onChangeImporte}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estatus</label>
                    <select name="estatus" value={form.estatus} onChange={onChange} className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${statusClasses(form.estatus)}`}>
                      <option value="Pagado">Pagado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Vencido">Vencido</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} maxLength={200} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Notas o detalles (máx. 200 caracteres)" />
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-end gap-2 sticky bottom-0">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de borrado */}
      {confirmOpen && rowToDelete && (
        <div className="fixed inset-0 z-[10050] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Eliminar ingreso</h3>
              <button onClick={()=>!confirmLoading && setConfirmOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
              <p>¿Seguro que deseas eliminar este ingreso? Podrás deshacer durante 7 segundos.</p>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 text-xs">
                <div><span className="text-gray-500">Alumno:</span> <span className="text-gray-800 font-medium">{rowToDelete.alumno}</span></div>
                <div><span className="text-gray-500">Fecha:</span> <span className="text-gray-800">{rowToDelete.fechaInicio}</span> <span className="text-gray-500 ml-2">Importe:</span> <span className="text-gray-800 font-medium">{formatCurrency(Number(rowToDelete.importe)||0)}</span></div>
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
                  if(!rowToDelete) return;
                  setConfirmLoading(true); setConfirmError('');
                  const ok = await onDelete(rowToDelete);
                  setConfirmLoading(false);
                  if(ok){ setConfirmOpen(false); setRowToDelete(null); setEditOpen(false); setEditData(null); }
                  else { setConfirmError('No se pudo eliminar. Intenta de nuevo.'); }
                }}
                className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70"
                disabled={confirmLoading}
              >{confirmLoading ? 'Eliminando…' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Deshacer */}
      {undoState.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10060]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
            <span className="text-sm text-gray-700">Ingreso eliminado.</span>
            {undoState.error ? (<span className="text-[11px] text-rose-600">{undoState.error}</span>) : null}
            <button
              onClick={undoState.saving ? undefined : handleUndo}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
              disabled={undoState.saving}
            >{undoState.saving ? 'Restaurando…' : 'Deshacer'}</button>
          </div>
        </div>
      )}
    </section>
  );
}

// Tooltip simple para Recharts
const CurrencyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const v = payload[0].value ?? 0;
    const formatted = Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-gray-200 shadow">
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-indigo-600 font-medium">{formatted}</div>
      </div>
    );
  }
  return null;
};
