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
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 sm:p-8">
        {/* Selector de meses con botones */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-800">Selecciona el mes para revisar y calificar:</h3>
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
                      relative px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform
                      ${isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105 ring-4 ring-purple-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-[1.02] border-2 border-slate-200'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">{opt}</span>
                      {tasksInMonth > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-600'
                          }`}>
                          {submittedInMonth}/{tasksInMonth} entregadas
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full"></div>
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
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-sm text-slate-600 font-medium">
                  Mostrando <span className="text-purple-700 font-bold">{pageItems.length}</span> de{' '}
                  <span className="text-slate-800 font-bold">{filtered.length}</span> tareas en{' '}
                  <span className="text-purple-700 font-bold">{selectedMonth}</span>
                </span>
              </div>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border-2 border-slate-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium text-sm"
                >
                  ← Anterior
                </button>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold text-sm min-w-[80px] text-center">
                  {currentPage} / {pageCount}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount}
                  className="px-4 py-2 border-2 border-slate-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium text-sm"
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <Calendar className="size-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Selecciona un mes para ver las actividades</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <FileText className="size-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No hay tareas para mostrar en este mes</p>
          </div>
        ) : (
          pageItems.map((r, idx) => {
            const prev = pageItems[idx - 1];
            const showHeader = !prev || prev._month !== r._month;
            const noteState = r.submissionId ? notes[r.submissionId] : null;
            const isSubmitted = !!r.submittedPdf;
            const isGraded = r.score != null;

            return (
              <div key={`${r.id}-${idx}`} className="space-y-3">
                {showHeader && (
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <div className="h-1 w-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
                      {ordinalForMonthKey(r._month)}
                    </h2>
                  </div>
                )}

                {/* Card principal */}
                <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Header de la tarea */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${isSubmitted ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {isSubmitted ? (
                              <CheckCircle2 className={`size-5 ${isSubmitted ? 'text-emerald-600' : 'text-amber-600'}`} />
                            ) : (
                              <Clock className="size-5 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{r.name}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                <Calendar className="size-3.5" />
                                <span className="text-xs font-medium">Vence: {r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
                                <Award className="size-3.5" />
                                <span className="text-xs font-medium">{r.puntos} puntos</span>
                              </div>
                              {isSubmitted ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="size-3.5" />
                                  <span className="text-xs font-semibold">Entregado</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                  <XCircle className="size-3.5" />
                                  <span className="text-xs font-semibold">Pendiente</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    {/* Contenido: Entrega y Calificación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Columna izquierda: Entrega */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="size-4 text-purple-600" />
                          <h4 className="text-sm font-semibold text-slate-700">Entrega</h4>
                        </div>
                        {r.submittedPdf ? (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => openPdf(r.submittedPdf, r.originalName || r.name)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                            >
                              <Eye className="size-4" /> Ver PDF
                            </button>
                            {r.originalName && (
                              <p className="text-xs text-slate-500 truncate px-2" title={r.originalName}>
                                <span className="font-medium">Archivo:</span> {r.originalName}
                              </p>
                            )}
                            {r.submittedAt && (
                              <p className="text-xs text-slate-500 px-2">
                                <span className="font-medium">Entregado:</span> {new Date(r.submittedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 px-3 bg-slate-50 rounded-lg border border-slate-200">
                            <XCircle className="size-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Sin entrega</p>
                          </div>
                        )}
                      </div>

                      {/* Columna derecha: Calificación */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="size-4 text-purple-600" />
                          <h4 className="text-sm font-semibold text-slate-700">Calificación</h4>
                        </div>
                        {isGraded ? (
                          <div className="text-center py-4 px-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
                            <div className="text-3xl font-bold text-emerald-700 mb-1">{r.score}</div>
                            <p className="text-xs text-emerald-600 font-medium">de {r.puntos} puntos</p>
                          </div>
                        ) : (
                          <div className="text-center py-4 px-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">Sin calificar</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nota del asesor */}
                    {r.submissionId && (
                      <>
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="size-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-slate-700">Nota del asesor</h4>
                          </div>
                          {noteState && noteState.original && !noteState.editing ? (
                            <div className="space-y-3">
                              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-l-4 border-purple-500">
                                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                  {noteState.original}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => enterEdit(r.submissionId)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors"
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
                            <div className="space-y-3">
                              <textarea
                                className="w-full border-2 border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none h-32 overflow-auto bg-white shadow-sm transition-all"
                                maxLength={NOTE_MAX_CHARS}
                                placeholder="Escribe una nota para el alumno sobre esta entrega…"
                                value={noteState?.text || ''}
                                onChange={e => onChangeNote(r.submissionId, e.target.value)}
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={noteState?.saving || (noteState && (noteState.text || '').trim() === (noteState.original || '').trim())}
                                    onClick={() => onSave(r.submissionId)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
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
                                      className="px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
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
