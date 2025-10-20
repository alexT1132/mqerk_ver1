import { useEffect, useMemo, useState } from 'react';
import { listTasks, listSubmissionsByStudent, getSubmissionNote, upsertSubmissionNote } from '../../api/feedback.js';
import { buildStaticUrl } from '../../utils/url.js';
import { Eye, Download, Save, Check, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';

const NOTE_MAX_CHARS = 400;

/**
 * Advisor-facing review of a student's feedback tasks and submissions.
 * - Read-only: no grading, no cancel.
 * - Can add/update a note per submission.
 */
export default function FeedbackReview({ studentId, className = '' }){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({}); // { subId: { text, original, editing, saving, savedAt } }
  const [pdfModal, setPdfModal] = useState({ open: false, url: null, title: '' });
  const [pdfState, setPdfState] = useState({ loading: false, failed: false });

  const monthKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  };

  // Month selector + pagination states (require explicit selection; no 'Todos')
  const [selectedMonth, setSelectedMonth] = useState(''); // stores ordinal label (e.g., 'Octavo') or '' when none
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Distinct months from rows (with dueDate), sorted desc
  const distinctMonths = useMemo(() => {
    const set = new Set();
    for (const r of rows) { if (r.dueDate) set.add(monthKey(r.dueDate)); }
    return Array.from(set).sort((a,b)=> new Date(b+"-01") - new Date(a+"-01"));
  }, [rows]);

  // Map distinct available months to ordinal labels with newest = Octavo (matching alumno UI)
  const REVERSED_ORDINALS = ['Octavo','Séptimo','Sexto','Quinto','Cuarto','Tercero','Segundo','Primero'];
  const monthLabelFor = (k) => {
    const idx = distinctMonths.indexOf(k); // 0 = más reciente
    if (idx >= 0 && idx < REVERSED_ORDINALS.length) return REVERSED_ORDINALS[idx];
    // Fallback to locale if not found
    if(k==='sin-fecha') return 'Sin fecha';
    const [y,m] = k.split('-').map(Number);
    const d = new Date(y, m-1, 1);
    return d.toLocaleDateString('es-MX', { month:'long', year:'numeric' });
  };

  // Flatten and sort all items by dueDate desc (fallback to very old for missing)
  const allItems = useMemo(() => {
    const copy = rows.map(r => ({
      ...r,
      _month: r.dueDate ? monthKey(r.dueDate) : 'sin-fecha',
      _sortKey: r.dueDate ? new Date(r.dueDate).getTime() : 0,
    }));
    copy.sort((a,b)=> b._sortKey - a._sortKey);
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
  useEffect(()=>{ setPage(1); }, [selectedMonth]);

  useEffect(()=>{
    if(!studentId) return;
    let alive = true;
    (async ()=>{
      setLoading(true); setError(null);
      try{
        const [tasksRes, subsRes] = await Promise.all([
          listTasks({ activo: 1 }),
          listSubmissionsByStudent(studentId, { limit: 10000 }).catch(()=>({ data: { data: [] }}))
        ]);
        const tasks = tasksRes?.data?.data || [];
        const subs = subsRes?.data?.data || [];
        const latestByTask = new Map();
        for(const s of subs){
          if(!s.replaced_by){
            const prev = latestByTask.get(s.id_task);
            if(!prev || new Date(s.created_at) > new Date(prev.created_at)) latestByTask.set(s.id_task, s);
          }
        }
        const merged = tasks.map(t=>{
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
        if(!alive) return;
        setRows(merged);
        // Prefetch notes for existing submissions
        const withSub = merged.filter(r=> r.submissionId);
        const pairs = await Promise.all(withSub.map(async r=>{
          try{
            const res = await getSubmissionNote(r.submissionId);
            return [r.submissionId, res?.data?.data?.nota || ''];
          }catch{
            return [r.submissionId, ''];
          }
        }));
        const initial = {};
        for(const [sid, text] of pairs){
          initial[sid] = { text, original: text, editing: !text, saving:false, savedAt: null };
        }
        if(alive) setNotes(prev => ({ ...initial }));
      }catch(e){
        if(alive){ setError('Error cargando feedback del estudiante'); }
      } finally { if(alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const onChangeNote = (sid, val) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid]||{}), text: val } }));
  };
  const enterEdit = (sid) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid]||{}), editing: true } }));
  };
  const cancelEdit = (sid) => {
    setNotes(prev => ({ ...prev, [sid]: { ...(prev[sid]||{}), text: prev[sid]?.original || '', editing: false } }));
  };
  const onSave = async (sid) => {
    const current = notes[sid];
    if(!current) return;
    setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], saving: true } }));
    try{
      await upsertSubmissionNote(sid, current.text || '');
      setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], original: current.text || '', editing: false, saving:false, savedAt: new Date().toISOString() } }));
    }catch(e){
      setNotes(prev => ({ ...prev, [sid]: { ...prev[sid], saving:false } }));
      alert('No se pudo guardar la nota');
    }
  };

  const openPdf = (url, title) => {
  setPdfModal({ open: true, url, title: title || 'Documento' });
  setPdfState({ loading: true, failed: false });
  };
  const closePdf = () => setPdfModal({ open: false, url: null, title: '' });

  // Close on ESC
  useEffect(() => {
    if (!pdfModal.open) return;
    const onKey = (e) => { if (e.key === 'Escape') closePdf(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pdfModal.open]);

  // Detect load failure (e.g., iframes blocked) and show fallback
  useEffect(() => {
    if (!pdfModal.open || !pdfModal.url) return;
    setPdfState(s => ({ ...s, loading: true, failed: false }));
    const timer = setTimeout(() => {
      setPdfState(s => ({ ...s, failed: true }));
    }, 3500); // if not loaded by then, assume blocked/slow and show fallback
    return () => clearTimeout(timer);
  }, [pdfModal.open, pdfModal.url]);

  if(!studentId) return <div className={className}>Selecciona un estudiante</div>;
  if(loading) return <div className={className}>Cargando…</div>;
  if(error) return <div className={className}>Error: {error}</div>;

  const ordinalForMonthKey = (mk) => {
    const idx = distinctMonths.indexOf(mk);
    return idx >= 0 && idx < REVERSED_ORDINALS.length ? REVERSED_ORDINALS[idx] : 'Sin fecha';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls: month selector + pagination */}
  <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-0">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Mes:</label>
          <select
            value={selectedMonth || ''}
            onChange={(e)=> setSelectedMonth(e.target.value)}
            className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="" disabled>Selecciona…</option>
            {availableOrdinals.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
    {selectedMonth && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Mostrando {pageItems.length} de {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={()=> setPage(p => Math.max(1, p-1))}
              disabled={currentPage<=1}
              className="px-2 py-1 border border-slate-300 rounded-md bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Anterior
            </button>
            <span className="px-2">{currentPage} / {pageCount}</span>
            <button
              onClick={()=> setPage(p => Math.min(pageCount, p+1))}
              disabled={currentPage>=pageCount}
              className="px-2 py-1 border border-slate-300 rounded-md bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Items: insert month headers within page when changes */}
  <section className="bg-white rounded-xl border border-slate-200">
        <div className="p-3 sm:p-4 space-y-3">
          {!selectedMonth ? (
            <div className="text-sm text-slate-600">Selecciona un mes para ver las actividades.</div>
          ) : pageItems.length === 0 ? (
            <div className="text-sm text-slate-500">No hay tareas para mostrar.</div>
          ) : (
            pageItems.map((r, idx) => {
              const prev = pageItems[idx-1];
              const showHeader = !prev || prev._month !== r._month;
              const noteState = r.submissionId ? notes[r.submissionId] : null;
              return (
                <div key={`${r.id}-${idx}`}>
                  {showHeader && (
                    <div className="px-2 py-2 font-semibold text-slate-800 bg-slate-50 rounded-md mb-2">
                      {ordinalForMonthKey(r._month)}
                    </div>
                  )}
                  <div className="px-4 py-4 sm:px-5 border-t border-slate-200 first:border-t-0 transition grid grid-cols-1 md:grid-cols-12 gap-4 hover:bg-slate-50">
                    <div className="md:col-span-4">
                      <div className="text-slate-900 font-semibold">{r.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span>Vence: {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">Puntos: {r.puntos}</span>
                        {r.submittedPdf ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Entregado</span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pendiente</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-4">
                      {r.submittedPdf ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openPdf(r.submittedPdf, r.originalName || r.name)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-700 hover:bg-purple-800 text-white text-sm shadow-md"
                          >
                            <Eye className="size-4"/> Ver PDF
                          </button>
                          {r.originalName && (
                            <span className="text-xs text-slate-500 truncate max-w-[220px]" title={r.originalName}>{r.originalName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Sin entrega</span>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm">
                        {r.score != null ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Calificación: {r.score}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">Sin calificar</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      {r.submissionId ? (
                        <div>
                          {noteState && noteState.original && !noteState.editing ? (
                            <>
                              <div className="w-full min-h-[64px] whitespace-pre-wrap text-sm text-slate-800 border-l-4 border-slate-300 pl-3">
                                {noteState.original}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <button
                                  onClick={()=> enterEdit(r.submissionId)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-black text-white text-sm shadow-none"
                                >
                                  Editar nota
                                </button>
                                <div className="flex items-center gap-3">
                                  {noteState?.savedAt && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><Check className="size-3"/> {new Date(noteState.savedAt).toLocaleTimeString()}</span>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <textarea
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none h-20 overflow-auto"
                                maxLength={NOTE_MAX_CHARS}
                                placeholder="Escribe una nota para el alumno…"
                                value={noteState?.text || ''}
                                onChange={e=> onChangeNote(r.submissionId, e.target.value)}
                              />
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={noteState?.saving || (noteState && (noteState.text||'').trim() === (noteState.original||'').trim())}
                                    onClick={()=> onSave(r.submissionId)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-700 hover:bg-purple-800 text-white text-sm disabled:opacity-60 shadow-none"
                                  >
                                    {noteState?.saving ? (
                                      <> <Save className="size-4 animate-pulse"/> Guardando…</>
                                    ) : (
                                      <> <Save className="size-4"/> Guardar cambios</>
                                    )}
                                  </button>
                                  {noteState && noteState.original !== undefined && (
                                    <button
                                      onClick={()=> cancelEdit(r.submissionId)}
                                      className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 shadow-none"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-slate-500">{(noteState?.text || '').length}/{NOTE_MAX_CHARS}</span>
                                  {noteState?.savedAt && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><Check className="size-3"/> {new Date(noteState.savedAt).toLocaleTimeString()}</span>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {pdfModal.open && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={closePdf}
          />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-[96vw] sm:w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="px-3 sm:px-4 py-3 bg-[#3d18c3] text-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs opacity-90">MQerk Academy · PDF</div>
                  <div className="font-semibold leading-tight truncate">{pdfModal.title}</div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <a
                    href={pdfModal.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm"
                    title="Abrir en otra pestaña"
                  >
                    <ExternalLink className="size-4"/>
                    <span className="hidden sm:inline">Abrir pestaña</span>
                  </a>
                  <a
                    href={pdfModal.url || '#'}
                    download
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm"
                    title="Descargar PDF"
                  >
                    <Download className="size-4"/>
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button
                    onClick={closePdf}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white text-slate-800 text-xs sm:text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              <div className="relative h-[82vh] sm:h-[78vh] bg-slate-50">
                {pdfModal.url ? (
                  <>
                    {!pdfState.failed && (
                      <iframe
                        src={pdfModal.url}
                        title={pdfModal.title}
                        className="w-full h-full"
                        onLoad={() => setPdfState({ loading: false, failed: false })}
                      />
                    )}
                    {pdfState.failed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3 text-slate-700">
                        <AlertTriangle className="size-7 text-amber-600" />
                        <p className="text-center text-sm">No se pudo mostrar el PDF embebido. Puede estar bloqueado por el navegador/servidor.</p>
                        <div className="w-full h-[65vh] bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <object data={pdfModal.url} type="application/pdf" className="w-full h-full">
                            <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm p-4">
                              Tu navegador no soporta visor PDF embebido.
                            </div>
                          </object>
                        </div>
                      </div>
                    )}
                    {pdfState.loading && !pdfState.failed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/70 rounded-xl px-3 py-2 shadow border border-slate-200 flex items-center gap-2 text-slate-700">
                          <Loader2 className="size-4 animate-spin" /> Cargando PDF…
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No se pudo cargar el documento.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}