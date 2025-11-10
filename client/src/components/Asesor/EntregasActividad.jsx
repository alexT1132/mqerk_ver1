import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { listEntregasActividad, calificarEntrega, listArchivosEntrega, getActividad } from '../../api/actividades.js';
import { listEstudiantes } from '../../api/estudiantes.js';
import { ArrowLeft, FileText, Save, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

export default function EntregasActividad() {
  const { actividadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const areaTitle = location.state?.title || sessionStorage.getItem('selectedAreaTitle') || '';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState({}); // entregaId -> { calificacion, comentarios }
  const [savingId, setSavingId] = useState(null);
  const [fileCounts, setFileCounts] = useState({}); // entregaId -> count

  dayjs.locale('es');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const [actRes, ests, entRes] = await Promise.all([
          getActividad(actividadId),
          listEstudiantes(),
          listEntregasActividad(actividadId, { limit: 500 })
        ]);
        if (!alive) return;
        const actividad = actRes?.data || {};
        const grupos = Array.isArray(actividad.grupos) ? actividad.grupos.map(g => String(g).toLowerCase()) : [];
        const estudiantes = Array.isArray(ests) ? ests : [];
        const entregas = Array.isArray(entRes?.data) ? entRes.data : [];

        // Index entregas por id_estudiante (última por ahora)
        const lastByStudent = new Map();
        for (const e of entregas) {
          const k = String(e.id_estudiante);
          if (!lastByStudent.has(k) || (lastByStudent.get(k).id < e.id)) lastByStudent.set(k, e);
        }

        // Filtrar estudiantes por grupos asignados en la actividad (si hay)
        const assignedStudents = grupos.length
          ? estudiantes.filter(s => s.grupo && grupos.includes(String(s.grupo).toLowerCase()))
          : estudiantes; // si no hay grupos definidos, asumimos actividad abierta

        // Mapear filas: siempre mostrar asignados, con o sin entrega
        const merged = assignedStudents.map(s => {
          const ent = lastByStudent.get(String(s.id));
          return {
            id: ent?.id ?? `s-${s.id}`,
            id_estudiante: s.id,
            estudiante_nombre: `${s.nombre || ''} ${s.apellidos || ''}`.trim() || s.email || s.id,
            estado: ent?.estado || 'pendiente',
            calificacion: ent?.calificacion ?? null,
            entrega_id: ent?.id || null,
            entregada_at: ent?.entregada_at || ent?.created_at || null,
          };
        });

        setRows(merged);
      } catch (e) {
        setError(e.message || 'No se pudieron cargar las entregas');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [actividadId]);

  // Cargar conteo de archivos por entrega (cuando haya filas)
  useEffect(() => {
    const ids = rows.filter(r => r.entrega_id && fileCounts[r.entrega_id] === undefined).map(r => r.entrega_id);
    if (!ids.length) return;
    let alive = true;
    (async () => {
      const entries = await Promise.all(ids.map(async (id) => {
        try {
          const { data } = await listArchivosEntrega(id);
          const count = Array.isArray(data) ? data.length : 0;
          return [id, count];
        } catch {
          return [id, 0];
        }
      }));
      if (!alive) return;
      setFileCounts(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
    return () => { alive = false; };
  }, [rows]);

  const formatDateTime = (val) => {
    if (!val) return '—';
    const d = dayjs(val);
    if (!d.isValid()) return '—';
    return d.format('DD/MM/YYYY HH:mm');
  };

  const openFiles = async (entregaId) => {
    try {
      const { data } = await listArchivosEntrega(entregaId);
      const files = Array.isArray(data) ? data : [];
      if (!files.length) return alert('Sin archivos');
      // Abrir el primero por simplicidad
      const url = files[0]?.archivo;
      if (url) window.open(url, '_blank', 'noopener');
    } catch (e) {
      alert(e.message || 'No se pudieron abrir los archivos');
    }
  };

  const onGrade = async (entregaId) => {
    const g = grading[entregaId];
    // Si no hay dato en estado local, usar el valor actual de la fila
    const currentRow = rows.find(r => String(r.id) === String(entregaId));
    const calRaw = g?.calificacion ?? currentRow?.calificacion;
    const comentarios = (g?.comentarios ?? '').trim();
    if (calRaw === undefined || calRaw === null || calRaw === '') {
      return alert('Ingresa una calificación');
    }
    const calificacion = Number(calRaw);
    try {
      setSavingId(entregaId);
      const resp = await calificarEntrega(entregaId, { calificacion, comentarios });
      // Usar respuesta del servidor si viene, si no, actualizar localmente
      const updated = resp?.data || null;
      setRows(prev => prev.map(r => String(r.id) === String(entregaId)
        ? { ...r, calificacion: updated?.calificacion ?? calificacion, estado: updated?.estado || 'revisada' }
        : r
      ));
      // Limpiar estado de grading para esa fila
      setGrading(prev => { const cp = { ...prev }; delete cp[entregaId]; return cp; });
    } catch (e) {
      alert(e.message || 'No se pudo calificar');
    } finally {
      setSavingId(null);
    }
  };

  // Métricas rápidas
  const totalAsignados = rows.length;
  const totalEntregadas = rows.filter(r => r.entrega_id).length;
  const totalRevisadas = rows.filter(r => (r.estado || '').toLowerCase() === 'revisada').length;

  const badgeEstado = (estado) => {
    const e = (estado || 'pendiente').toLowerCase();
    if (e === 'revisada') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (e === 'en_revision') return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
    if (e === 'entregada') return 'bg-blue-50 text-blue-700 ring-blue-200';
    return 'bg-amber-50 text-amber-700 ring-amber-200'; // pendiente
  };

  const Badge = ({ className='', children }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${className}`}>{children}</span>
  );

  return (
  <div className="mx-auto max-w-[95rem] px-3 pb-8 pt-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-white">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          {areaTitle && <span className="text-sm text-slate-500">Área: {areaTitle}</span>}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Entregas de la actividad</h2>
          <p className="text-sm text-slate-600 mt-1">Revisa, califica y agrega comentarios a las entregas de los estudiantes.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-slate-900 text-slate-50 ring-slate-700/50">Asignados: {totalAsignados}</Badge>
            <Badge className="bg-indigo-600 text-white ring-indigo-600/40">Entregadas: {totalEntregadas}</Badge>
            <Badge className="bg-emerald-600 text-white ring-emerald-600/40">Revisadas: {totalRevisadas}</Badge>
          </div>
        </div>
      </div>

      {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/70 backdrop-blur supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0">
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Estudiante</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Entregado el</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Archivo(s)</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Calificación</th>
              <th className="px-4 py-3 text-right text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b last:border-0">
                <td className="px-4 py-3"><div className="h-3 w-40 bg-slate-200/70 rounded animate-pulse"/></td>
                <td className="px-4 py-3"><div className="h-6 w-16 bg-slate-200/70 rounded-full animate-pulse"/></td>
                <td className="px-4 py-3"><div className="h-3 w-36 bg-slate-200/70 rounded animate-pulse"/></td>
                <td className="px-4 py-3"><div className="h-8 w-28 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                <td className="px-4 py-3"><div className="h-8 w-64 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                <td className="px-4 py-3"><div className="h-8 w-24 ml-auto bg-slate-200/70 rounded-lg animate-pulse"/></td>
              </tr>
            ))}
            {!loading && rows.map(r => (
              <tr key={r.id} className="border-b last:border-0 odd:bg-slate-50/30 hover:bg-indigo-50/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{r.estudiante_nombre || r.id_estudiante}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={badgeEstado(r.estado)}>{(r.estado || 'pendiente').replace('_',' ')}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(r.entregada_at)}</td>
                <td className="px-4 py-3">
                  {r.entrega_id ? (
                    <button onClick={() => openFiles(r.entrega_id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                      <FileText className="w-4 h-4" /> Ver archivo{fileCounts[r.entrega_id] !== undefined ? ` (${fileCounts[r.entrega_id]})` : ''}
                    </button>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={grading[r.id]?.calificacion ?? (r.calificacion ?? '')}
                      onChange={(e) => setGrading(prev => ({ ...prev, [r.id]: { ...prev[r.id], calificacion: e.target.value } }))}
                    />
                    <input
                      type="text"
                      placeholder="Comentarios"
                      className="w-56 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={grading[r.id]?.comentarios ?? ''}
                      onChange={(e) => setGrading(prev => ({ ...prev, [r.id]: { ...prev[r.id], comentarios: e.target.value } }))}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onGrade(r.entrega_id || r.id)}
                    disabled={!r.entrega_id || savingId === (r.entrega_id || r.id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition
                      ${r.entrega_id ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}
                      ${savingId === (r.entrega_id || r.id) ? 'opacity-90' : ''}`}
                  >
                    {savingId === (r.entrega_id || r.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin entregas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
