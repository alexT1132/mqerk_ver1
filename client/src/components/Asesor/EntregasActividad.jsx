import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  listEntregasActividad,
  calificarEntrega,
  listArchivosEntrega,
  getActividad,
  getEstudiantesAsignadosActividad,
  extenderFechaLimiteGrupo,
  extenderFechaLimiteEstudiante,
  permitirEditarDespuesCalificada
} from '../../api/actividades.js';
import { ArrowLeft, FileText, Save, Loader2, Clock, Users, User, Edit, X, CheckCircle, AlertCircle, Info, ClipboardList } from 'lucide-react';
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
  const [actividad, setActividad] = useState(null);
  const [showExtendGrupo, setShowExtendGrupo] = useState(false);
  const [showExtendEstudiante, setShowExtendEstudiante] = useState(false);
  const [extendData, setExtendData] = useState({ grupo: '', id_estudiante: null, nueva_fecha_limite: '', notas: '' });
  const [extending, setExtending] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '', title: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', title: '', onConfirm: null, onCancel: null });

  dayjs.locale('es');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        // ✅ Obtener estudiantes que recibieron realmente la asignación (notificación) para esta actividad
        const [actRes, estudiantesAsignadosRes, entRes] = await Promise.all([
          getActividad(actividadId),
          getEstudiantesAsignadosActividad(actividadId).catch(() => ({ data: [] })), // Si falla, usar array vacío
          listEntregasActividad(actividadId, { limit: 500 })
        ]);
        if (!alive) return;
        const actividad = actRes?.data || {};
        setActividad(actividad);
        const estudiantesAsignados = Array.isArray(estudiantesAsignadosRes?.data) ? estudiantesAsignadosRes.data : [];
        const entregas = Array.isArray(entRes?.data) ? entRes.data : [];

        // Debug: Verificar estudiantes asignados
        console.log('[EntregasActividad] DEBUG:', {
          actividadId,
          estudiantesAsignadosCount: estudiantesAsignados.length,
          estudiantesAsignados: estudiantesAsignados.map(s => ({
            id: s.id,
            nombre: s.nombre,
            apellidos: s.apellidos,
            grupo: s.grupo,
            estatus: s.estatus
          }))
        });

        // Index entregas por id_estudiante (última por ahora)
        const lastByStudent = new Map();
        for (const e of entregas) {
          const k = String(e.id_estudiante);
          if (!lastByStudent.has(k) || (lastByStudent.get(k).id < e.id)) lastByStudent.set(k, e);
        }

        // ✅ IMPORTANTE: Usar solo estudiantes que recibieron la notificación (ya filtrados por estatus activo en el backend)
        // Si no hay estudiantes asignados (actividad creada antes del cambio), usar estudiantes del grupo como fallback
        let assignedStudents = estudiantesAsignados;
        if (assignedStudents.length === 0) {
          // Fallback: si no hay notificaciones (actividad antigua), obtener estudiantes del grupo
          console.log('[EntregasActividad] No se encontraron estudiantes asignados por notificación, usando fallback de grupo');
          const grupos = Array.isArray(actividad.grupos) ? actividad.grupos.map(g => String(g).toLowerCase()) : [];
          if (grupos.length > 0) {
            const { listEstudiantes } = await import('../../api/estudiantes.js');
            const todosEstudiantes = await listEstudiantes().catch(() => []);
            assignedStudents = todosEstudiantes.filter(s => {
              const grupoMatch = s.grupo && grupos.includes(String(s.grupo).toLowerCase());
              const estatusActivo = s.estatus === 'Activo';
              return grupoMatch && estatusActivo;
            });
          }
        }

        console.log('[EntregasActividad] Estudiantes asignados después del filtro:', assignedStudents.length);

        // Mapear filas: siempre mostrar asignados, con o sin entrega
        const merged = assignedStudents.map(s => {
          const ent = lastByStudent.get(String(s.id));
          // Convertir calificación de escala 0-100 (BD) a escala 0-10 (UI)
          const calificacion = ent?.calificacion !== null && ent?.calificacion !== undefined
            ? ent.calificacion / 10
            : null;
          return {
            id: ent?.id ?? `s-${s.id}`,
            id_estudiante: s.id,
            estudiante_nombre: `${s.nombre || ''} ${s.apellidos || ''}`.trim() || s.email || s.id,
            estado: ent?.estado || 'pendiente',
            calificacion: calificacion,
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

  const showNotification = (type, message, title = '') => {
    setNotification({ show: true, type, message, title });
    setTimeout(() => setNotification({ show: false, type: 'success', message: '', title: '' }), 4000);
  };

  const showConfirm = (message, title, onConfirm, onCancel = null) => {
    setConfirmModal({
      show: true,
      message,
      title,
      onConfirm: () => {
        setConfirmModal({ show: false, message: '', title: '', onConfirm: null, onCancel: null });
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmModal({ show: false, message: '', title: '', onConfirm: null, onCancel: null });
        if (onCancel) onCancel();
      }
    });
  };

  const openFiles = async (entregaId) => {
    try {
      const { data } = await listArchivosEntrega(entregaId);
      const files = Array.isArray(data) ? data : [];
      if (!files.length) {
        showNotification('info', 'Esta entrega no tiene archivos disponibles', 'Sin archivos');
        return;
      }
      // Abrir el primero por simplicidad
      const url = files[0]?.archivo;
      if (url) window.open(url, '_blank', 'noopener');
    } catch (e) {
      showNotification('error', e.message || 'No se pudieron abrir los archivos', 'Error');
    }
  };

  const onGrade = async (entregaId) => {
    const g = grading[entregaId];
    // Si no hay dato en estado local, usar el valor actual de la fila
    const currentRow = rows.find(r => String(r.id) === String(entregaId));
    const calRaw = g?.calificacion ?? currentRow?.calificacion;
    const comentarios = (g?.comentarios ?? '').trim();
    if (calRaw === undefined || calRaw === null || calRaw === '') {
      showNotification('error', 'Ingresa una calificación', 'Validación');
      return;
    }
    const calificacion = Number(calRaw);
    // Validar que esté en el rango 0-10 (escala del sistema)
    if (calificacion < 0 || calificacion > 10) {
      showNotification('error', 'La calificación debe estar entre 0 y 10', 'Validación');
      return;
    }
    // Convertir de escala 0-10 a escala 0-100 para guardar en BD
    const calificacion100 = calificacion * 10;
    try {
      setSavingId(entregaId);
      const resp = await calificarEntrega(entregaId, { calificacion: calificacion100, comentarios });
      // Usar respuesta del servidor si viene, si no, actualizar localmente
      const updated = resp?.data || null;
      // La calificación en BD está en escala 0-100, pero mostramos en escala 0-10
      const calificacionMostrar = updated?.calificacion ? updated.calificacion / 10 : calificacion;
      setRows(prev => prev.map(r => String(r.id) === String(entregaId)
        ? { ...r, calificacion: calificacionMostrar, estado: updated?.estado || 'revisada' }
        : r
      ));
      // Limpiar estado de grading para esa fila
      setGrading(prev => { const cp = { ...prev }; delete cp[entregaId]; return cp; });
      showNotification('success', 'Calificación guardada exitosamente', 'Éxito');
    } catch (e) {
      showNotification('error', e.message || 'No se pudo calificar', 'Error');
    } finally {
      setSavingId(null);
    }
  };

  const handleExtendGrupo = async () => {
    if (!extendData.grupo || !extendData.nueva_fecha_limite) {
      showNotification('error', 'Completa grupo y nueva fecha límite', 'Validación');
      return;
    }
    try {
      setExtending(true);
      await extenderFechaLimiteGrupo(actividadId, extendData);
      showNotification('success', 'Fecha límite extendida exitosamente para el grupo', 'Éxito');
      setShowExtendGrupo(false);
      setExtendData({ grupo: '', id_estudiante: null, nueva_fecha_limite: '', notas: '' });
    } catch (e) {
      showNotification('error', e.message || 'Error al extender fecha límite', 'Error');
    } finally {
      setExtending(false);
    }
  };

  const handleExtendEstudiante = async () => {
    if (!extendData.id_estudiante || !extendData.nueva_fecha_limite) {
      showNotification('error', 'Selecciona estudiante y nueva fecha límite', 'Validación');
      return;
    }
    try {
      setExtending(true);
      await extenderFechaLimiteEstudiante(actividadId, extendData);
      showNotification('success', 'Fecha límite extendida exitosamente para el estudiante', 'Éxito');
      setShowExtendEstudiante(false);
      setExtendData({ grupo: '', id_estudiante: null, nueva_fecha_limite: '', notas: '' });
    } catch (e) {
      showNotification('error', e.message || 'Error al extender fecha límite', 'Error');
    } finally {
      setExtending(false);
    }
  };

  const handlePermitirEditar = async (entregaId, permite) => {
    showConfirm(
      permite ? '¿Permitir editar esta entrega después de calificada?' : '¿Desactivar edición después de calificada?',
      'Confirmar acción',
      async () => {
        try {
          await permitirEditarDespuesCalificada(entregaId, permite);
          showNotification('success', permite ? 'Edición permitida' : 'Edición desactivada', 'Éxito');
        } catch (e) {
          showNotification('error', e.message || 'Error al actualizar permiso', 'Error');
        }
      }
    );
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

  const Badge = ({ className = '', children }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${className}`}>{children}</span>
  );

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* Fondo fijo independiente del scroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

      <div className="relative z-10 mx-auto max-w-[95rem] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExtendGrupo(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
              >
                <Users className="w-4 h-4" /> Extender por grupo
              </button>
              <button
                onClick={() => setShowExtendEstudiante(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all"
              >
                <User className="w-4 h-4" /> Extender por estudiante
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-6 sm:p-8 shadow-lg">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-200/30 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="hidden sm:flex p-4 rounded-3xl bg-white/40 backdrop-blur-md shadow-xl ring-1 ring-white/50">
                <ClipboardList className="w-10 h-10 text-indigo-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="sm:hidden p-2 rounded-xl bg-white/40 backdrop-blur-md shadow-lg ring-1 ring-white/50">
                    <ClipboardList className="w-6 h-6 text-indigo-700" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block pb-1" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                      Entregas de la actividad
                    </span>
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-2xl">Revisa, califica y agrega comentarios a las entregas de los estudiantes de manera eficiente.</p>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Asignados</div>
                      <div className="text-xl font-extrabold text-slate-900 leading-none">{totalAsignados}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/80 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Entregadas</div>
                      <div className="text-xl font-extrabold text-indigo-700 leading-none">{totalEntregadas}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Revisadas</div>
                      <div className="text-xl font-extrabold text-emerald-700 leading-none">{totalRevisadas}</div>
                    </div>
                  </div>
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
                  <td className="px-6 py-4"><div className="h-5 w-48 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-7 w-24 bg-slate-200/70 rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-32 bg-slate-200/70 rounded-xl animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-80 bg-slate-200/70 rounded-xl animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-28 ml-auto bg-slate-200/70 rounded-xl animate-pulse" /></td>
                </tr>
              ))}
              {!loading && rows.map(r => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 transition-all duration-200 group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{r.estudiante_nombre || r.id_estudiante}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={badgeEstado(r.estado)}>
                      {(r.estado || 'pendiente').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                          min={0}
                          max={10}
                          step={0.1}
                          placeholder="Calificación"
                          className="w-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          value={grading[r.id]?.calificacion ?? (r.calificacion !== null && r.calificacion !== undefined ? String(r.calificacion) : '')}
                          onChange={(e) => setGrading(prev => ({ ...prev, [r.id]: { ...prev[r.id], calificacion: e.target.value } }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">/10</span>
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
                    <div className="flex flex-col items-end gap-2">
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
                        {r.estado === 'revisada' && r.calificacion ? 'Actualizar calificación' : 'Guardar calificación'}
                      </button>
                      {r.entrega_id && r.estado === 'revisada' && r.calificacion && (
                        <button
                          onClick={() => handlePermitirEditar(r.entrega_id, true)}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-all"
                          title="Permitir que el estudiante edite su entrega después de calificada"
                        >
                          <Edit className="w-3 h-3" /> Permitir edición al estudiante
                        </button>
                      )}
                    </div>
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

        {/* Modal extender fecha por grupo */}
        {showExtendGrupo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Extender fecha límite por grupo</h3>
                <button onClick={() => setShowExtendGrupo(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
                  <input
                    type="text"
                    value={extendData.grupo}
                    onChange={(e) => setExtendData(prev => ({ ...prev, grupo: e.target.value }))}
                    placeholder="Ej: m1, v2, s1"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva fecha límite</label>
                  <input
                    type="datetime-local"
                    value={extendData.nueva_fecha_limite}
                    onChange={(e) => setExtendData(prev => ({ ...prev, nueva_fecha_limite: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                  <textarea
                    value={extendData.notas}
                    onChange={(e) => setExtendData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Razón de la extensión..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowExtendGrupo(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExtendGrupo}
                    disabled={extending}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {extending ? 'Extendiendo...' : 'Extender'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal extender fecha por estudiante */}
        {showExtendEstudiante && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Extender fecha límite por estudiante</h3>
                <button onClick={() => setShowExtendEstudiante(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante</label>
                  <select
                    value={extendData.id_estudiante || ''}
                    onChange={(e) => setExtendData(prev => ({ ...prev, id_estudiante: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona un estudiante</option>
                    {rows.map(r => (
                      <option key={r.id_estudiante} value={r.id_estudiante}>
                        {r.estudiante_nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva fecha límite</label>
                  <input
                    type="datetime-local"
                    value={extendData.nueva_fecha_limite}
                    onChange={(e) => setExtendData(prev => ({ ...prev, nueva_fecha_limite: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                  <textarea
                    value={extendData.notas}
                    onChange={(e) => setExtendData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Razón de la extensión..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowExtendEstudiante(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExtendEstudiante}
                    disabled={extending}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {extending ? 'Extendiendo...' : 'Extender'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de notificación personalizado */}
        {notification.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div
              className={`
              relative max-w-md w-full rounded-2xl shadow-2xl transform transition-all duration-300 pointer-events-auto
              ${notification.show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
              ${notification.type === 'success'
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200'
                  : notification.type === 'error'
                    ? 'bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200'
                }
            `}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                  ${notification.type === 'success'
                      ? 'bg-emerald-100 text-emerald-600'
                      : notification.type === 'error'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }
                `}>
                    {notification.type === 'success' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : notification.type === 'error' ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <Info className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h3 className={`
                      text-lg font-bold mb-1
                      ${notification.type === 'success'
                          ? 'text-emerald-900'
                          : notification.type === 'error'
                            ? 'text-rose-900'
                            : 'text-indigo-900'
                        }
                    `}>
                        {notification.title}
                      </h3>
                    )}
                    <p className={`
                    text-sm
                    ${notification.type === 'success'
                        ? 'text-emerald-700'
                        : notification.type === 'error'
                          ? 'text-rose-700'
                          : 'text-indigo-700'
                      }
                  `}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification({ show: false, type: 'success', message: '', title: '' })}
                    className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${notification.type === 'success'
                        ? 'text-emerald-600 hover:bg-emerald-100'
                        : notification.type === 'error'
                          ? 'text-rose-600 hover:bg-rose-100'
                          : 'text-indigo-600 hover:bg-indigo-100'
                      }
                  `}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Barra de progreso animada */}
              <div className={`
              h-1 rounded-b-2xl transition-all duration-4000
              ${notification.type === 'success'
                  ? 'bg-emerald-500'
                  : notification.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
                }
            `} style={{ width: notification.show ? '100%' : '0%' }} />
            </div>
          </div>
        )}

        {/* Modal de confirmación personalizado */}
        {confirmModal.show && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
              className="relative max-w-md w-full rounded-2xl shadow-2xl transform transition-all duration-300 bg-white border-2 border-slate-200"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {confirmModal.title && (
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {confirmModal.title}
                      </h3>
                    )}
                    <p className="text-sm text-slate-700">
                      {confirmModal.message}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={confirmModal.onCancel || (() => setConfirmModal({ show: false, message: '', title: '', onConfirm: null, onCancel: null }))}
                    className="px-5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
