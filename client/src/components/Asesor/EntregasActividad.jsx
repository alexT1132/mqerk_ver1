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
    // Validar que esté en el rango 1-100
    if (calificacion < 1 || calificacion > 100) {
      return alert('La calificación debe estar entre 1 y 100');
    }
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
  <div className="mx-auto max-w-[95rem] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header mejorado */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div className="h-6 w-px bg-slate-200" />
            {areaTitle && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Área</p>
                <p className="text-sm font-semibold text-slate-700">{areaTitle}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-6 sm:p-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-200/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Entregas de la actividad
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mb-6">Revisa, califica y agrega comentarios a las entregas de los estudiantes.</p>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Asignados</div>
                <div className="text-2xl font-bold text-slate-900">{totalAsignados}</div>
              </div>
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/80 backdrop-blur-sm px-4 py-3 shadow-sm">
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Entregadas</div>
                <div className="text-2xl font-bold text-indigo-700">{totalEntregadas}</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-4 py-3 shadow-sm">
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Revisadas</div>
                <div className="text-2xl font-bold text-emerald-700">{totalRevisadas}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-3 flex items-start gap-3 shadow-sm">
          <span className="text-rose-600 font-bold">⚠</span>
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0">
              <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Entregado el</th>
              <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Archivo(s)</th>
              <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Calificación</th>
              <th className="px-6 py-4 text-right text-slate-600 text-xs font-bold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4"><div className="h-5 w-48 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                <td className="px-6 py-4"><div className="h-7 w-24 bg-slate-200/70 rounded-full animate-pulse"/></td>
                <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                <td className="px-6 py-4"><div className="h-10 w-32 bg-slate-200/70 rounded-xl animate-pulse"/></td>
                <td className="px-6 py-4"><div className="h-10 w-80 bg-slate-200/70 rounded-xl animate-pulse"/></td>
                <td className="px-6 py-4"><div className="h-10 w-28 ml-auto bg-slate-200/70 rounded-xl animate-pulse"/></td>
              </tr>
            ))}
            {!loading && rows.map(r => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 transition-all duration-200 group">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{r.estudiante_nombre || r.id_estudiante}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={badgeEstado(r.estado)}>
                    {(r.estado || 'pendiente').replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{formatDateTime(r.entregada_at)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {r.entrega_id ? (
                    <button 
                      onClick={() => openFiles(r.entrega_id)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95"
                    >
                      <FileText className="w-4 h-4" /> 
                      Ver archivo{fileCounts[r.entrega_id] !== undefined ? ` (${fileCounts[r.entrega_id]})` : ''}
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="Calificación"
                        className="w-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        value={grading[r.id]?.calificacion ?? (r.calificacion ?? '')}
                        onChange={(e) => setGrading(prev => ({ ...prev, [r.id]: { ...prev[r.id], calificacion: e.target.value } }))}
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Escribe comentarios aquí..."
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        value={grading[r.id]?.comentarios ?? ''}
                        onChange={(e) => setGrading(prev => ({ ...prev, [r.id]: { ...prev[r.id], comentarios: e.target.value } }))}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onGrade(r.entrega_id || r.id)}
                    disabled={!r.entrega_id || savingId === (r.entrega_id || r.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all transform hover:scale-105 active:scale-95
                      ${r.entrega_id 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed hover:scale-100'
                      }
                      ${savingId === (r.entrega_id || r.id) ? 'opacity-90' : ''}`}
                  >
                    {savingId === (r.entrega_id || r.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-700">No hay entregas</p>
                      <p className="text-sm text-slate-500 mt-1">Los estudiantes aún no han entregado esta actividad</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
