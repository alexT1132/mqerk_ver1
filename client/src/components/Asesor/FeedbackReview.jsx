import { useEffect, useMemo, useState } from 'react';
import { listTasks, listSubmissionsByStudent, getSubmissionNote, upsertSubmissionNote } from '../../api/feedback.js';
import { buildStaticUrl } from '../../utils/url.js';
import { Eye, Download, Save, Check, ExternalLink, Loader2, AlertTriangle, FileText, Calendar, Award, MessageSquare, CheckCircle2, Clock, XCircle, X as XIcon } from 'lucide-react';

const NOTE_MAX_CHARS = 400;

/**
 * Advisor-facing review of a student's feedback tasks and submissions.
 * - Read-only: no grading, no cancel.
 * - Can add/update a note per submission.
 */
export default function FeedbackReview({ studentId, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({}); // { subId: { text, original, editing, saving, savedAt } }
  const [pdfModal, setPdfModal] = useState({ open: false, url: null, title: '' });
  const [pdfState, setPdfState] = useState({ loading: false, failed: false });

  const monthKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };

  // Month selector + pagination states (require explicit selection; no 'Todos')
  const [selectedMonth, setSelectedMonth] = useState(''); // stores ordinal label (e.g., 'Octavo') or '' when none
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Distinct months from rows (with dueDate), sorted desc
  const distinctMonths = useMemo(() => {
    const set = new Set();
    for (const r of rows) { if (r.dueDate) set.add(monthKey(r.dueDate)); }
    return Array.from(set).sort((a, b) => new Date(b + "-01") - new Date(a + "-01"));
  }, [rows]);

  // Map distinct available months to ordinal labels with newest = Octavo (matching alumno UI)
  const REVERSED_ORDINALS = ['Octavo', 'Séptimo', 'Sexto', 'Quinto', 'Cuarto', 'Tercero', 'Segundo', 'Primero'];
  const monthLabelFor = (k) => {
    const idx = distinctMonths.indexOf(k); // 0 = más reciente
    if (idx >= 0 && idx < REVERSED_ORDINALS.length) return REVERSED_ORDINALS[idx];
    // Fallback to locale if not found
    if (k === 'sin-fecha') return 'Sin fecha';
    const [y, m] = k.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  // Flatten and sort all items by dueDate desc (fallback to very old for missing)
  const allItems = useMemo(() => {
    const copy = rows.map(r => ({
      ...r,
      _month: r.dueDate ? monthKey(r.dueDate) : 'sin-fecha',
      _sortKey: r.dueDate ? new Date(r.dueDate).getTime() : 0,
    }));
    copy.sort((a, b) => b._sortKey - a._sortKey);
    return copy;
  }, [rows]);

  // Map calendar month keys to ordinal labels (newest=Octavo)
  const monthKeyByOrdinal = useMemo(() => {
    const map = {};
    distinctMonths.forEach((mk, idx) => {
      if (idx < REVERSED_ORDINALS.length) map[REVERSED_ORDINALS[idx]] = mk;
    });
    return map;
  }, [distinctMonths]);

  // Only offer ordinals that exist in data, maintaining newest-first order
  const availableOrdinals = useMemo(() => {
    return distinctMonths.map((_, idx) => REVERSED_ORDINALS[idx]).filter(Boolean);
  }, [distinctMonths]);

  // UX: auto-seleccionar el mes más reciente disponible si no hay uno seleccionado
  useEffect(() => {
    if (!selectedMonth && availableOrdinals.length > 0) {
      setSelectedMonth(availableOrdinals[0]);
    }
  }, [availableOrdinals, selectedMonth]);

  // Filter by selected ordinal label; if none selected, show nothing
  const filtered = useMemo(() => {
    if (!selectedMonth) return [];
    const mk = monthKeyByOrdinal[selectedMonth];
    if (!mk) return []; // ordinal seleccionado sin datos disponibles
    return allItems.filter(r => r._month === mk);
  }, [allItems, selectedMonth, monthKeyByOrdinal]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [selectedMonth]);

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [tasksRes, subsRes] = await Promise.all([
          listTasks({ activo: 1 }),
          listSubmissionsByStudent(studentId, { limit: 10000 }).catch(() => ({ data: { data: [] } }))
        ]);
        const tasks = tasksRes?.data?.data || [];
        const subs = subsRes?.data?.data || [];
        const latestByTask = new Map();
        for (const s of subs) {
          if (!s.replaced_by) {
            const prev = latestByTask.get(s.id_task);
            if (!prev || new Date(s.created_at) > new Date(prev.created_at)) latestByTask.set(s.id_task, s);
          }
        }
        const merged = tasks.map(t => {
          const sub = latestByTask.get(t.id) || null;
          const rel = sub?.archivo || null; const fullUrl = rel ? buildStaticUrl(rel) : null;
          return {
            id: t.id,
            name: t.nombre,
            puntos: t.puntos || 10,
            dueDate: t.due_date,
            submittedPdf: fullUrl,
            submissionId: sub?.id || null,
            submittedAt: sub?.created_at || null,
            score: sub?.puntos ?? null,
            originalName: sub?.original_nombre || null,
          };
        });
        if (!alive) return;
        setRows(merged);
        // Prefetch notes for existing submissions
        const withSub = merged.filter(r => r.submissionId);
        const pairs = await Promise.all(withSub.map(async r => {
          try {
            const res = await getSubmissionNote(r.submissionId);
            return [r.submissionId, res?.data?.data?.nota || ''];
          } catch {
            return [r.submissionId, ''];
          }
        }));
        const initial = {};
        for (const [sid, text] of pairs) {
          initial[sid] = { text, original: text, editing: !text, saving: false, savedAt: null };
        }
        if (alive) setNotes(prev => ({ ...initial }));
      } catch (e) {
        if (alive) { setError('Error cargando feedback del estudiante'); }
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const onChangeNote = (sid, val) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid] || {}), text: val } }));
  };
  const enterEdit = (sid) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid] || {}), editing: true } }));
  };
  const cancelEdit = (sid) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid] || {}), text: prev[sid]?.original || '', editing: false } }));
  };
  const onSave = async (sid) => {
    const current = notes[sid];
    if (!current) return;
    setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], saving: true } }));
    try {
      await upsertSubmissionNote(sid, current.text || '');
      setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], original: current.text || '', editing: false, saving: false, savedAt: new Date().toISOString() } }));
    } catch (e) {
      setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], saving: false } }));
      alert('No se pudo guardar la nota');
    }
  };

  const openPdf = (url, title) => {
    setPdfModal({ open: true, url, title: title || 'Documento' });
    setPdfState({ loading: false, failed: false });
  };
  const closePdf = () => {
    setPdfModal({ open: false, url: null, title: '' });
    setPdfState({ loading: false, failed: false });
  };

  // Close on ESC
  useEffect(() => {
    if (!pdfModal.open) return;
    const onKey = (e) => { if (e.key === 'Escape') closePdf(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pdfModal.open]);

  // Detectar si el PDF falla al cargar después de un tiempo razonable
  useEffect(() => {
    if (!pdfModal.open || !pdfModal.url) {
      return;
    }

    // Esperar un tiempo razonable (12 segundos) para ver si el PDF carga
    const checkTimer = setTimeout(() => {
      setPdfState(prev => {
        // Si ya tenemos un estado definitivo, no hacer nada
        if (prev.failed || (!prev.loading && !prev.failed)) {
          return prev;
        }
        return { loading: false, failed: false };
      });
    }, 12000);

    return () => clearTimeout(checkTimer);
  }, [pdfModal.open, pdfModal.url || '']);

  if (!studentId) return <div className={className}>Selecciona un estudiante</div>;
  if (loading) return <div className={className}>Cargando…</div>;
  if (error) return <div className={className}>Error: {error}</div>;

  const ordinalForMonthKey = (mk) => {
    const idx = distinctMonths.indexOf(mk);
    return idx >= 0 && idx < REVERSED_ORDINALS.length ? REVERSED_ORDINALS[idx] : 'Sin fecha';
  };

  return (
    <div className={`space-y-6 w-full ${className}`}>
      {/* Controls: month selector + pagination */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 ring-2 ring-slate-100/50 p-6 sm:p-8">
        {/* Selector de meses con botones */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
              <Calendar className="size-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Selecciona el mes para revisar y calificar:</h3>
          </div>
          {availableOrdinals.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {availableOrdinals.map((opt) => {
                const isSelected = selectedMonth === opt;
                const monthIndex = REVERSED_ORDINALS.indexOf(opt);
                const monthData = distinctMonths[monthIndex];
                const tasksInMonth = allItems.filter(r => r._month === monthData).length;
                const submittedInMonth = allItems.filter(r => r._month === monthData && r.submittedPdf).length;

                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedMonth(opt)}
                    className={`
                      relative px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-200 transform shadow-md hover:shadow-lg
                      ${isSelected
                        ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl scale-105 ring-4 ring-violet-300'
                        : 'bg-white text-slate-700 hover:bg-gradient-to-br hover:from-violet-50 hover:to-indigo-50 hover:scale-[1.02] border-2 border-slate-200 hover:border-violet-300'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-lg font-extrabold">{opt}</span>
                      {tasksInMonth > 0 && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ring-2 ${isSelected
                            ? 'bg-white/30 text-white ring-white/50'
                            : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 ring-slate-300'
                          }`}>
                          {submittedInMonth}/{tasksInMonth} entregadas
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white rounded-full shadow-md"></div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-sm">
              No hay meses disponibles con tareas asignadas
            </div>
          )}
        </div>

        {/* Paginación y contador */}
        {selectedMonth && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t-2 border-slate-200">
            <div className="flex items-center gap-2">
              <div className="px-5 py-2.5 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border-2 border-violet-200 ring-2 ring-violet-100/50 shadow-sm">
                <span className="text-sm text-slate-700 font-bold">
                  Mostrando <span className="text-violet-700 font-extrabold">{pageItems.length}</span> de{' '}
                  <span className="text-slate-800 font-extrabold">{filtered.length}</span> tareas en{' '}
                  <span className="text-violet-700 font-extrabold">{selectedMonth}</span>
                </span>
              </div>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all font-bold text-sm shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  ← Anterior
                </button>
                <span className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-extrabold text-sm min-w-[90px] text-center shadow-lg ring-2 ring-violet-300">
                  {currentPage} / {pageCount}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount}
                  className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all font-bold text-sm shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items: Cards with modern design */}
      <section className="space-y-4">
        {!selectedMonth ? (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 ring-2 ring-slate-100/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 ring-4 ring-violet-200 mb-4 shadow-lg">
              <Calendar className="size-10 text-violet-600" />
            </div>
            <p className="text-lg font-bold text-slate-700">Selecciona un mes para ver las actividades</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 ring-2 ring-slate-100/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-4 ring-slate-200 mb-4 shadow-lg">
              <FileText className="size-10 text-slate-500" />
            </div>
            <p className="text-lg font-bold text-slate-700">No hay tareas para mostrar en este mes</p>
          </div>
        ) : (
          pageItems.map((r, idx) => {
            const prev = pageItems[idx - 1];
            const showHeader = !prev || prev._month !== r._month;
            const noteState = r.submissionId ? notes[r.submissionId] : null;
            const isSubmitted = !!r.submittedPdf;

            return (
              <div key={`${r.id}-${idx}`} className="space-y-3">
                {showHeader && (
                  <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                      <div className="h-2 w-12 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-full shadow-md"></div>
                      {ordinalForMonthKey(r._month)}
                    </h2>
                  </div>
                )}

                {/* Card principal */}
                <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-200 hover:border-violet-300 hover:shadow-xl transition-all duration-300 overflow-hidden ring-2 ring-slate-100/50 hover:ring-violet-200/50">
                  <div className="p-6 sm:p-7 space-y-6">
                    {/* Header de la tarea */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl shadow-md ring-2 ${isSubmitted ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-emerald-300' : 'bg-gradient-to-br from-amber-500 to-orange-600 ring-amber-300'}`}>
                            {isSubmitted ? (
                              <CheckCircle2 className="size-6 text-white" />
                            ) : (
                              <Clock className="size-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{r.name}</h3>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-700 border-2 border-blue-200 ring-1 ring-blue-100">
                                <Calendar className="size-4 text-indigo-600" />
                                <span className="text-xs font-bold">Vence: {r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                              </div>
                              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-2 border-indigo-300 ring-2 ring-indigo-200 shadow-md">
                                <Award className="size-4" />
                                <span className="text-xs font-bold">{r.puntos} puntos</span>
                              </div>
                              {isSubmitted ? (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-2 border-emerald-300 ring-2 ring-emerald-200 shadow-md">
                                  <CheckCircle2 className="size-4" />
                                  <span className="text-xs font-bold">Entregado</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white border-2 border-amber-300 ring-2 ring-amber-200 shadow-md">
                                  <XCircle className="size-4" />
                                  <span className="text-xs font-bold">Pendiente</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

                    {/* Contenido: Entrega */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                          <FileText className="size-4" />
                        </div>
                        <h4 className="text-base font-extrabold text-slate-700">Entrega</h4>
                      </div>
                      {r.submittedPdf ? (
                        <div className="space-y-4">
                          <button
                            type="button"
                            onClick={() => openPdf(r.submittedPdf, r.originalName || r.name)}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                          >
                            <Eye className="size-5" /> Ver PDF
                          </button>
                          <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-violet-200 ring-2 ring-violet-100/50 p-4 space-y-3 shadow-sm">
                            {r.originalName && (
                              <div className="flex items-start gap-2">
                                <FileText className="size-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-purple-700 mb-0.5">Archivo entregado:</p>
                                  <p className="text-xs text-slate-700 truncate" title={r.originalName}>
                                    {r.originalName}
                                  </p>
                                </div>
                              </div>
                            )}
                            {r.submittedAt && (
                              <div className="flex items-start gap-2">
                                <Calendar className="size-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-purple-700 mb-0.5">Fecha de entrega:</p>
                                  <p className="text-xs text-slate-700">
                                    {new Date(r.submittedAt).toLocaleDateString('es-ES', { 
                                      weekday: 'long',
                                      day: 'numeric', 
                                      month: 'long', 
                                      year: 'numeric',
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 ring-2 ring-slate-100/50">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 ring-4 ring-slate-100 mb-3">
                            <XCircle className="size-8 text-slate-500" />
                          </div>
                          <p className="text-sm text-slate-600 font-bold">Sin entrega</p>
                        </div>
                      )}
                    </div>

                    {/* Nota del asesor */}
                    {r.submissionId && (
                      <>
                        <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2.5">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                              <MessageSquare className="size-4" />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-700">Nota del asesor</h4>
                          </div>
                          {noteState && noteState.original && !noteState.editing ? (
                            <div className="space-y-4">
                              <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-xl p-5 border-l-4 border-violet-500 ring-2 ring-violet-100/50 shadow-sm">
                                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                                  {noteState.original}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => enterEdit(r.submissionId)}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                  <MessageSquare className="size-4" /> Editar nota
                                </button>
                                {noteState?.savedAt && (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <Check className="size-3.5 text-emerald-600" />
                                    Guardado {new Date(noteState.savedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <textarea
                                className="w-full border-2 border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none h-32 overflow-auto bg-white shadow-md hover:shadow-lg transition-all"
                                maxLength={NOTE_MAX_CHARS}
                                placeholder="Escribe una nota para el alumno sobre esta entrega…"
                                value={noteState?.text || ''}
                                onChange={e => onChangeNote(r.submissionId, e.target.value)}
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    disabled={noteState?.saving || (noteState && (noteState.text || '').trim() === (noteState.original || '').trim())}
                                    onClick={() => onSave(r.submissionId)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                                  >
                                    {noteState?.saving ? (
                                      <> <Loader2 className="size-4 animate-spin" /> Guardando…</>
                                    ) : (
                                      <> <Save className="size-4" /> Guardar nota</>
                                    )}
                                  </button>
                                  {noteState && noteState.original !== undefined && (
                                    <button
                                      onClick={() => cancelEdit(r.submissionId)}
                                      className="px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-slate-500 font-medium">{(noteState?.text || '').length}/{NOTE_MAX_CHARS}</span>
                                  {noteState?.savedAt && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                      <Check className="size-3.5 text-emerald-600" />
                                      {new Date(noteState.savedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* PDF Viewer Modal - Compacto y Responsive */}
      {pdfModal.open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-end justify-center p-2 sm:p-4 md:p-6 pb-8 sm:pb-10">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePdf}
          />

          {/* Modal Container - Más compacto */}
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-white/30 flex flex-col" style={{ maxHeight: '85vh', height: 'auto', minHeight: '500px' }}>
            {/* Header Compacto */}
            <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs opacity-90 mb-0.5">MQerk Academy · PDF</div>
                <div className="font-semibold text-xs sm:text-sm leading-tight truncate">{pdfModal.title}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={pdfModal.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs transition-colors"
                  title="Abrir en nueva pestaña"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline text-xs">Abrir</span>
                </a>
                <a
                  href={pdfModal.url || '#'}
                  download
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs transition-colors"
                  title="Descargar PDF"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline text-xs">Descargar</span>
                </a>
                <button
                  onClick={closePdf}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
                  title="Cerrar"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Container - Más compacto, sin espacios en blanco */}
            <div className="relative bg-slate-100 overflow-hidden" style={{ height: 'calc(85vh - 45px)', maxHeight: '700px', minHeight: '500px' }}>
              {pdfModal.url ? (
                <>
                  {/* Visor PDF nativo */}
                  {!pdfState.failed && (
                    <iframe
                      allowFullScreen
                      key={`pdf-iframe-${pdfModal.url}`}
                      src={pdfModal.url}
                      title={pdfModal.title}
                      className="w-full h-full border-0 bg-white"
                      onLoad={() => {
                        setPdfState({ loading: false, failed: false });
                      }}
                      onError={() => {
                        setPdfState({ loading: false, failed: true });
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                      }}
                    />
                  )}

                  {/* Mensaje de error */}
                  {pdfState.failed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-4 bg-slate-50">
                      <AlertTriangle className="size-10 text-amber-500" />
                      <div className="text-center space-y-2 max-w-md">
                        <p className="text-sm font-medium text-slate-700">No se pudo cargar el PDF embebido</p>
                        <p className="text-xs text-slate-500">Puede estar bloqueado por el navegador o el servidor</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-center">
                        <a
                          href={pdfModal.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-4" />
                          Abrir en nueva pestaña
                        </a>
                        <a
                          href={pdfModal.url}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="size-4" />
                          Descargar
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No se pudo cargar el documento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
