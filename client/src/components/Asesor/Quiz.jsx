import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  CircleDashed,
  PlaySquare, 
  ChevronLeft,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import QuiztModal from "./QuiztModal";
import { generarPreguntasIA, getCooldownRemainingMs } from "../../service/simuladoresAI";
import { listQuizzes, deleteQuiz as apiDeleteQuiz, getQuizFull, getQuizEstudiantesEstado, getQuizIntentoReview } from "../../api/quizzes";
import { getAreasCatalog } from "../../api/areas";


/* ------------------- helpers ------------------- */

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}
    >
      {type === "success" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {type === "draft" && <CircleDashed className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

/* Formatea nombre de asesor a partir de username o email */
function formatAsesorName(raw) {
  if (!raw) return '—';
  let s = String(raw).trim();
  // cortar dominio si es email
  const at = s.indexOf('@');
  if (at > 0) s = s.slice(0, at);
  // si ya parece un nombre con espacios y mayúsculas, devolver tal cual
  if (/[A-ZÁÉÍÓÚÑ]/.test(s) && /\s/.test(s)) return s;
  // reemplazar separadores comunes por espacio
  s = s.replace(/[._-]+/g, ' ');
  // quitar 'asesor' si es prefijo o sufijo
  s = s.replace(/^(asesor|asesora)\s+/i, '').replace(/\s+(asesor|asesora)$/i, '');
  // capitalizar palabras
  s = s.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return s || raw;
}

/* Tarjeta compacta para móvil */
function MobileRow({ item, onView, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
        </div>
        {item.status === "Publicado" ? (
          <Badge type="success">Publicado</Badge>
        ) : (
          <Badge type="draft">Borrador</Badge>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Preguntas</dt>
          <dd className="font-semibold text-slate-900">{item.questions}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Intentos</dt>
          <dd className="font-semibold text-slate-900">
            {item.total_intentos_global != null ? `${item.total_intentos_global}/${item.attempts === '∞' ? '∞' : item.attempts}` : item.attempts}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Actualizado</dt>
          <dd className="font-semibold text-slate-900">{item.updatedAt}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Creador</dt>
          <dd className="font-semibold text-slate-900">{formatAsesorName(item.createdBy)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(item)}
          className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(item)}
          className="ml-auto inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </button>
      </div>
    </article>
  );
}

/* ------------------- main component ------------------- */

export default function SimuladoresAdmin({ Icon = PlaySquare, title = "QUIZZES", }) {

  const STORAGE_KEY = "selectedAreaTitle";

  function getSafeStoredTitle() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const val = String(raw).trim();
    if (!val || val.toLowerCase() === "null" || val.toLowerCase() === "undefined") return null;
    return val;
  }
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  // IA quick generate controls
  const MAX_IA = Number(import.meta.env?.VITE_AI_MAX_QUESTIONS || 50);
  const COUNT_OPTIONS = [5,10,30,50].filter(n => n <= MAX_IA);
  const [iaQuickCount, setIaQuickCount] = useState(COUNT_OPTIONS[0] || 5);
  const [iaTopic, setIaTopic] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);
  // Estado temporal para flujo IA -> prellenar modal y adjuntar preguntas
  const [iaDraft, setIaDraft] = useState(null);
  const [iaQuestions, setIaQuestions] = useState(null);
  // Modal de elección IA (general vs por temas)
  const [iaChoiceOpen, setIaChoiceOpen] = useState(false);
  const [iaChoiceMode, setIaChoiceMode] = useState('general'); // 'general' | 'temas'
  const [iaChoiceTopics, setIaChoiceTopics] = useState(''); // coma-separado
  // En esta vista trabajamos por área; ocultar filtro por materia para simplificar UX
  const SHOW_AREA_FILTER = false;

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsRows, setResultsRows] = useState([]);
  const [resultsQuizMeta, setResultsQuizMeta] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewHeader, setReviewHeader] = useState({ quiz: null, estudiante: null });
  // Delete confirmation modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cooldown ticker
  useEffect(() => {
    const tick = () => setCooldownMs(getCooldownRemainingMs());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Conexión: listar quizzes (actividades generales tipo 'quiz')
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // cargar catálogo de áreas para filtrar
        try {
          const { data: areasRes } = await getAreasCatalog();
          if (alive) {
            const options = [];
            if (areasRes?.data?.generales) options.push(...areasRes.data.generales);
            if (areasRes?.data?.modulos) options.push(...areasRes.data.modulos);
            setAreas(options);
            // Resolver id inicial por título si aún no hay uno seleccionado
            if (selectedAreaId == null) {
              const norm = (s) => (s || '').toString().trim().toLowerCase();
              const match = options.find(a => norm(a.nombre || a.title) === norm(areaTitle));
              if (match?.id) {
                setSelectedAreaId(match.id);
              }
            }
          }
        } catch {}

        // Usar el id seleccionado (o el derivado) para la primera carga
        const effectiveId = selectedAreaId ?? (function() {
          const norm = (s) => (s || '').toString().trim().toLowerCase();
          const match = (areas || []).find(a => norm(a.nombre || a.title) === norm(areaTitle));
          return match?.id || null;
        })();
        const params = effectiveId ? { id_area: effectiveId } : {};
        const { data } = await listQuizzes(params);
        if (!alive) return;
        const rows = Array.isArray(data?.data) ? data.data : [];
        const mapped = rows.map((r) => {
          const now = new Date();
          const vd = r.visible_desde ? new Date(r.visible_desde) : null;
          const vh = r.visible_hasta ? new Date(r.visible_hasta) : null;
          const publicado = r.activo && (!vd || vd <= now) && (!vh || vh >= now);
          return {
            id: r.id,
            name: r.titulo || r.nombre || `Quiz ${r.id}`,
            type: r.materia || "Áreas generales",
            questions: r.total_preguntas ?? r.questions_count ?? '—',
            attempts: r.max_intentos ?? '∞',
            status: publicado ? "Publicado" : "Borrador",
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString().slice(0, 10) : "—",
            createdBy: r.creado_por_nombre || r.creado_por || null,
            id_area: r.id_area || null,
            total_intentos_global: r.total_intentos_global ?? null,
          };
        });
        setData(mapped);
      } catch (e) {
        setError(e?.response?.data?.message || "No se pudieron cargar los quizzes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedAreaId]);

  /* handlers */
  // Vista previa: abre el runner del alumno en una nueva pestaña en modo seguro
  const handleView = async (item) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewQuiz(null);
    try {
      const { data } = await getQuizFull(item.id);
      setPreviewQuiz(data?.data || null);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'No se pudo cargar la vista previa');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };
  // Edición: redirigir a builder nuevo (a futuro cargaría preguntas existentes)
  const handleEdit = (item) => {
    // Pasar quizId también por querystring para sobrevivir refresh/nueva pestaña
    navigate(`/asesor/quizt/builder?id=${encodeURIComponent(item.id)}`,
      { state: { quizId: item.id, title: areaTitle } }
    );
  };
  // Resultados por estudiantes (primer intento oficial)
  const handleResultados = async (item) => {
    setResultsOpen(true);
    setResultsLoading(true);
    setResultsRows([]);
    setResultsQuizMeta({ id: item.id, titulo: item.name });
    try {
      const { data } = await getQuizEstudiantesEstado(item.id);
      const rows = Array.isArray(data?.data) ? data.data : [];
      setResultsRows(rows);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'No se pudo cargar el estado de estudiantes');
      setResultsOpen(false);
    } finally {
      setResultsLoading(false);
    }
  };
  const openReview = async (row) => {
    if (!resultsQuizMeta?.id || !row?.id_estudiante) return;
    setReviewOpen(true);
    setReviewLoading(true);
    setReviewData(null);
    setReviewHeader({ quiz: resultsQuizMeta, estudiante: { id: row.id_estudiante, nombre: `${row.apellidos || ''} ${row.nombre || ''}`.trim() } });
    try {
      // Forzar intento=1 (oficial)
      const { data } = await getQuizIntentoReview(resultsQuizMeta.id, row.id_estudiante, 1);
      setReviewData(data?.data || null);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'No se pudo cargar el detalle del intento');
      setReviewOpen(false);
    } finally {
      setReviewLoading(false);
    }
  };
  const handleDelete = async (item) => {
    // Confirmación
    // eslint-disable-next-line no-alert
    if (!confirm(`¿Eliminar el quiz "${item.name}"? Esta acción no se puede deshacer.`)) return;
    // Optimista: quitar de UI
    const prev = data;
    setData((d) => d.filter((q) => q.id !== item.id));
    try {
      await apiDeleteQuiz(item.id);
    } catch (e) {
      // Revertir en error
      setData(prev);
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'No se pudo eliminar el quiz');
    }
  };

  // Abrir modal de confirmación de eliminación
  const openDeleteConfirm = (item) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiDeleteQuiz(deleteTarget.id);
      setData((d) => d.filter((q) => q.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo eliminar el quiz');
    } finally {
      setDeleteLoading(false);
    }
  };

  const location = useLocation();
  
    // llega desde AreasDeEstudio con Link state={{ title }}
    const incomingTitle = typeof location.state?.title === "string"
      ? location.state.title.trim()
      : null;
  
    const [areaTitle, setAreaTitle] = useState(
      incomingTitle || getSafeStoredTitle() || "Español y redacción indirecta"
    );
  
    useEffect(() => {
      if (incomingTitle && incomingTitle.length > 0) {
        setAreaTitle(incomingTitle);
        sessionStorage.setItem(STORAGE_KEY, incomingTitle);
      }
    }, [incomingTitle]);

  // Si tenemos catálogo de áreas y un título seleccionado, fijar el filtro inicial por id_area
  useEffect(() => {
    if (!areas.length) return;
    if (selectedAreaId != null) return; // no pisar selección manual
    if (!areaTitle) return;
    const match = areas.find(a => (a.nombre || a.title) === areaTitle);
    if (match?.id) setSelectedAreaId(match.id);
  }, [areas, areaTitle]);

  const headerTitle = `${title} — ${areaTitle}`;

  const crearQuizRapidoIA = async () => {
    if (iaLoading) return;
    // Si no hay área seleccionada, exigir tema manual; si hay área, el tema puede omitirse
    if (!selectedAreaId && !iaTopic.trim()) { alert('Escribe un tema para generar con IA'); return; }
    const cantidad = Number(iaQuickCount) || 5;
    if (cantidad > MAX_IA) { alert(`Máximo ${MAX_IA} preguntas por IA`); return; }
    setIaLoading(true);
    try {
      const tema = iaTopic.trim() || areaTitle || 'Quiz';
      const preguntasIA = await generarPreguntasIA({ tema, cantidad, area: areaTitle, nivel: 'intermedio' });
      // Mapear preguntas IA -> contrato de createQuiz
      const preguntas = preguntasIA.map((q) => {
        if (q.type === 'multi') {
          // Asegurar 4 opciones y una correcta
          let options = (q.options||[]).map(o => ({ text: o.text || '', correct: !!o.correct }));
          if (options.length > 4) options = options.slice(0,4);
          while (options.length < 4) options.push({ text: `Opción ${options.length+1}`, correct: false });
          const idxC = options.findIndex(o=>o.correct);
          if (idxC === -1) options[0].correct = true; else options = options.map((o,j)=> ({ ...o, correct: j===idxC }));
          return { type: 'multiple', text: q.text, points: Number(q.points||1), options };
        }
        if (q.type === 'tf') {
          return { type: 'tf', text: q.text, points: Number(q.points||1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        return { type: 'short', text: q.text, points: Number(q.points||1), answer: String(q.answer||'') };
      });
      // Guardar preguntas y abrir modal prellenado (no crear aún)
      setIaQuestions(preguntas);
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas)`;
  const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. Responde con calma y confirma tu elección antes de avanzar.`;
      setIaDraft({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: '',
        publico: false,
  horas: 0,
  minutos: 0,
        intentosMode: 'unlimited',
        maxIntentos: 3,
      });
      setOpen(true);
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        alert('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
        setCooldownMs(getCooldownRemainingMs());
      } else if (e?.code === 'COOLDOWN') {
        const secs = Math.ceil((e?.remainingMs || getCooldownRemainingMs())/1000);
        alert(`Debes esperar ${secs}s antes de volver a generar con IA.`);
        setCooldownMs(getCooldownRemainingMs());
      } else {
        alert(e?.response?.data?.message || e?.message || 'No se pudo crear el quiz con IA');
      }
    } finally {
      setIaLoading(false);
    }
  };

  // Crear quiz con IA permitiendo elegir modo general o por temas
  const crearQuizConIAOpciones = async ({ modo = 'general', temasText = '' } = {}) => {
    if (iaLoading) return;
    // Si no hay área seleccionada, exigir tema manual; si hay área, el tema puede omitirse
    if (!selectedAreaId && !iaTopic.trim()) { alert('Escribe un tema para generar con IA'); return; }
    const cantidad = Number(iaQuickCount) || 5;
    if (cantidad > MAX_IA) { alert(`Máximo ${MAX_IA} preguntas por IA`); return; }
    setIaLoading(true);
    try {
      const tema = iaTopic.trim() || areaTitle || 'Quiz';
      const opts = { tema, cantidad, area: areaTitle || undefined, nivel: 'intermedio' };
      const temasList = String(temasText || '').split(',').map(s => s.trim()).filter(Boolean);
      if (modo === 'temas' && temasList.length) { opts.modo = 'temas'; opts.temas = temasList; } else { opts.modo = 'general'; }
      const preguntasIA = await generarPreguntasIA(opts);
      // Mapear preguntas IA -> contrato de createQuiz
      const preguntas = preguntasIA.map((q) => {
        if (q.type === 'multi') {
          // Asegurar 4 opciones y una correcta
          let options = (q.options||[]).map(o => ({ text: o.text || '', correct: !!o.correct }));
          if (options.length > 4) options = options.slice(0,4);
          while (options.length < 4) options.push({ text: `Opción ${options.length+1}`, correct: false });
          const idxC = options.findIndex(o=>o.correct);
          if (idxC === -1) options[0].correct = true; else options = options.map((o,j)=> ({ ...o, correct: j===idxC }));
          return { type: 'multiple', text: q.text, points: Number(q.points||1), options };
        }
        if (q.type === 'tf') {
          return { type: 'tf', text: q.text, points: Number(q.points||1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        return { type: 'short', text: q.text, points: Number(q.points||1), answer: String(q.answer||'') };
      });
      setIaQuestions(preguntas);
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas${opts.modo==='temas' ? ' · por temas' : ''})`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. ${opts.modo==='temas' ? 'Este quiz incluye preguntas por temas específicos.' : 'Este quiz cubre contenido general del área.'}`;
      setIaDraft({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: '',
        publico: false,
        horas: 0,
        minutos: 0,
        intentosMode: 'unlimited',
        maxIntentos: 3,
      });
      setOpen(true);
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        alert('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
        setCooldownMs(getCooldownRemainingMs());
      } else if (e?.code === 'COOLDOWN') {
        const secs = Math.ceil((e?.remainingMs || getCooldownRemainingMs())/1000);
        alert(`Debes esperar ${secs}s antes de volver a generar con IA.`);
        setCooldownMs(getCooldownRemainingMs());
      } else {
        alert(e?.response?.data?.message || e?.message || 'No se pudo crear el quiz con IA');
      }
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      {/* Botón volver */}
      <div className="mb-3">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/asesor/actividades');
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>
      </div>

      {/* Modal: elección de IA (general vs por temas) */}
      {iaChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={()=> setIaChoiceOpen(false)} />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-3.5">
              <h3 className="text-base font-semibold text-slate-900">Generar con IA</h3>
              <p className="text-xs text-slate-600">Elige si quieres un banco general del área o enfocado en temas específicos.</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button type="button" onClick={()=> setIaChoiceMode('general')} className={["text-left rounded-xl border p-3 transition", iaChoiceMode==='general' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'].join(' ')}>
                  <div className="text-sm font-semibold text-slate-800">General del área</div>
                  <div className="mt-1 text-xs text-slate-600">Crea preguntas variadas usando "{areaTitle || 'esta área'}" como contexto.</div>
                </button>
                <button type="button" onClick={()=> setIaChoiceMode('temas')} className={["text-left rounded-xl border p-3 transition", iaChoiceMode==='temas' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'].join(' ')}>
                  <div className="text-sm font-semibold text-slate-800">Por temas específicos</div>
                  <div className="mt-1 text-xs text-slate-600">Indica ramas como "sinónimos, ortografía, lectura" y distribuiremos las preguntas.</div>
                </button>
              </div>
              {iaChoiceMode === 'temas' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Temas (separados por comas)</label>
                  <input value={iaChoiceTopics} onChange={e=> setIaChoiceTopics(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="tema1, tema2, tema3" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Preguntas</label>
                <select value={iaQuickCount} onChange={e=> setIaQuickCount(Number(e.target.value))} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
                  {COUNT_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-4">
              <button onClick={()=> setIaChoiceOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">Cancelar</button>
              <button onClick={async ()=> { await crearQuizConIAOpciones({ modo: iaChoiceMode, temasText: iaChoiceTopics }); setIaChoiceOpen(false); }} disabled={iaLoading || (!selectedAreaId && !iaTopic.trim()) || cooldownMs>0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                <Sparkles className="h-4 w-4" /> {cooldownMs>0? `Espera ${Math.ceil(cooldownMs/1000)}s` : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Encabezado breve */}
  <div className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 px-5 pt-3 pb-5 sm:px-7 sm:pt-4 sm:pb-7 shadow-sm mb-6">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative z-10 flex items-center gap-4">
        {/* ícono con badge */}
        <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg sm:size-14">
          <Icon className="size-6 sm:size-7" />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-white">
            <Sparkles className="size-3 text-white" />
          </span>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700 sm:text-2xl">
            {headerTitle}
          </h2>

          {/* subrayado doble */}
          <div className="mt-1 flex gap-2">
            <span className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
          </div>
        </div>
      </div>
    </div>

      {/* Filtros y acción principal */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch gap-3 sm:items-center sm:justify-end">
        {SHOW_AREA_FILTER && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Filtrar por materia:</label>
            <select
              value={selectedAreaId || ''}
              onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Todas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre || a.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* IA quick generate */}
          <div className="flex items-center gap-2">
            {/* En módulos/áreas específicas no pedimos tema: usamos el título del área */}
            {!selectedAreaId && (
              <input
                type="text"
                value={iaTopic}
                onChange={(e)=> setIaTopic(e.target.value)}
                placeholder="Tema del quiz (p. ej., Redacción)"
                className="w-64 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            )}
            <label className="hidden sm:block text-xs text-slate-500">Preguntas</label>
            <select
              value={iaQuickCount}
              onChange={(e)=> setIaQuickCount(Number(e.target.value))}
              className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              aria-label="Cantidad de preguntas IA"
            >
              {COUNT_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {/* Tiempo se ajusta dentro del builder después de crear */}
            <button
              onClick={()=> setIaChoiceOpen(true)}
              disabled={iaLoading || (!selectedAreaId && !iaTopic.trim()) || cooldownMs > 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs/1000)}s` : 'Genera con IA'}
            </button>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo quizt
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Móvil: tarjetas */}
      <div className="grid gap-3 md:hidden">
        {!loading && data.map((item) => (
          <MobileRow
            key={item.id}
            item={item}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={openDeleteConfirm}
          />
        ))}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Cargando quizzes…
          </div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto lg:overflow-x-visible">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50/60">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-slate-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[22rem]"
                  >
                    Quizt
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[7rem]"
                  >
                    Preguntas
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[9rem]"
                  >
                    Intentos (max)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[12rem]"
                  >
                    Creador
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[8rem]"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-[9rem]"
                  >
                    Actualizado
                  </th>
                  <th scope="col" className="px-4 py-3 w-[12rem]"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading && data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-4 w-[22rem]">
                      <div className="truncate font-medium text-slate-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                      {item.questions}
                    </td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                      {item.total_intentos_global != null ? `${item.total_intentos_global}/${item.attempts === '∞' ? '∞' : item.attempts}` : item.attempts}
                    </td>
                    <td className="px-4 py-4 text-slate-700 truncate max-w-[12rem]">
                      {formatAsesorName(item.createdBy)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.status === "Publicado" ? (
                        <Badge type="success">Publicado</Badge>
                      ) : (
                        <Badge type="draft">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                      {item.updatedAt}
                    </td>
                    <td className="px-4 py-4 w-[12rem]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResultados(item)}
                          title="Resultados"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          %
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-14 text-center text-slate-500"
                    >
                      Aún no hay quizt. Crea el primero con el botón
                      <span className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
                        Nuevo quizt
                      </span>
                      .
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Cargando quizzes…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b px-2 py-1.5">
              <h3 className="text-base font-semibold text-slate-900">Vista previa</h3>
              <button onClick={() => setPreviewOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
           <div className="max-h-[60vh] overflow-y-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {previewLoading && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Cargando…</div>
              )}
              {!previewLoading && previewQuiz && (
                <div className="space-y-2.5">
                  <header className="border-b pb-0.5">
                    <h4 className="text-base font-semibold text-slate-900">{previewQuiz.quiz?.titulo || 'Quiz'}</h4>
                    <p className="text-xs text-slate-500">Preguntas: {Array.isArray(previewQuiz.preguntas) ? previewQuiz.preguntas.length : 0}</p>
                  </header>
                  <ol className="space-y-1.5">
                    {previewQuiz.preguntas?.map((p, idx) => (
                      <li key={p.id} className="rounded border border-slate-200 p-1.5">
                        <div className="mb-0.5 text-xs text-slate-500">
                          {idx + 1}. {p.tipo === 'opcion_multiple' ? 'Opción múltiple' : p.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Respuesta corta'} • {p.puntos || 1} pt{(p.puntos || 1) > 1 ? 's' : ''}
                        </div>
                        <div className="font-medium text-slate-900 mb-0.5 text-sm">{p.enunciado}</div>
                        {p.tipo === 'opcion_multiple' && (
                          <ul className="mt-0.5 space-y-1">
                            {p.opciones?.map((o) => (
                              <li key={o.id} className={`rounded border px-1.5 py-1 text-xs ${o.es_correcta ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                {o.texto || '—'}
                              </li>
                            ))}
                          </ul>
                        )}
                        {p.tipo === 'verdadero_falso' && (
                          <p className="mt-0.5 text-xs text-slate-700">Correcta: <strong>{p.opciones?.find(x => x.es_correcta)?.texto || '—'}</strong></p>
                        )}
                        {p.tipo === 'respuesta_corta' && (
                          <p className="mt-0.5 text-xs text-slate-700">Respuesta esperada: <strong>{p.opciones?.find(x => x.es_correcta)?.texto || '—'}</strong></p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-2 py-1.5">
              <button onClick={() => setPreviewOpen(false)} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Resultados modal */}
      {resultsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b px-2 py-1.5">
              <h3 className="text-base font-semibold text-slate-900">Resultados • {resultsQuizMeta?.titulo || 'Quiz'}</h3>
              <button onClick={() => setResultsOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {resultsLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Cargando…</div>
              ) : resultsRows.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/60">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Estudiante</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Grupo</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Intentos</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Oficial (1er intento)</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultsRows.map((r) => (
                        <tr key={r.id_estudiante}>
                          <td className="px-4 py-2 text-slate-800">{`${r.apellidos || ''} ${r.nombre || ''}`.trim()}</td>
                          <td className="px-4 py-2 text-slate-600">{r.grupo || '—'}</td>
                          <td className="px-4 py-2 text-slate-700">{r.total_intentos || 0}</td>
                          <td className="px-4 py-2">
                            {r.total_intentos > 0 ? (
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                                (Number(r.oficial_puntaje || 0) >= 70)
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : (Number(r.oficial_puntaje || 0) >= 50)
                                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                  : 'bg-rose-50 text-rose-700 ring-rose-200'
                              }`}>
                                {Number(r.oficial_puntaje || 0)}%
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">Sin intento</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              disabled={r.total_intentos === 0}
                              onClick={() => openReview(r)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-600 text-sm">Aún no hay estudiantes con intentos registrados.</div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-2 py-1.5">
              <button onClick={() => setResultsOpen(false)} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3 border-b bg-gradient-to-r from-slate-50 to-indigo-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Eliminar simulador</h3>
                  <p className="text-[11px] text-slate-500">Acción permanente</p>
                </div>
              </div>
              <button onClick={() => setDeleteOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-slate-700">
                ¿Deseas eliminar el simulador
                {deleteTarget?.name ? (
                  <>
                    {' “'}
                    <span className="font-semibold">{deleteTarget.name}</span>
                    {'”?'}
                  </>
                ) : ' seleccionado?'}
              </p>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-xs">Esta acción es permanente y no se puede deshacer.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-3 py-2.5">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:from-rose-700 hover:to-pink-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando…' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b px-2 py-1.5">
              <h3 className="text-base font-semibold text-slate-900">Detalle intento 1 • {reviewHeader.quiz?.titulo || 'Quiz'} • {reviewHeader.estudiante?.nombre || 'Alumno'}</h3>
              <button onClick={() => setReviewOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviewLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Cargando…</div>
              ) : reviewData && Array.isArray(reviewData.preguntas) ? (
                <div className="space-y-2.5">
                  {reviewData.preguntas.map((p, idx) => {
                    const sel = new Set(p.seleccionadas || []);
                    const corr = !!p.correcta;
                    return (
                      <div key={p.id || idx} className="rounded border border-slate-200 p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium text-slate-900">{p.orden || (idx+1)}. {p.enunciado}</div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${corr ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{corr ? 'Correcta' : 'Incorrecta'}</span>
                        </div>
                        <ul className="mt-1.5 space-y-1">
                          {(p.opciones || []).map((o) => {
                            const isSel = sel.has(o.id);
                            const isOk = o.es_correcta === 1;
                            const base = 'text-xs rounded-lg border px-3 py-1.5 flex items-center justify-between';
                            const cl = isSel && isOk ? 'bg-emerald-50 border-emerald-300' : isSel && !isOk ? 'bg-rose-50 border-rose-300' : !isSel && isOk ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200';
                            return (
                              <li key={o.id} className={`${base} ${cl}`}>
                                <span>{o.texto}</span>
                                <div className="text-[10px] text-slate-600">{isOk ? 'Correcta' : (isSel ? 'Marcada' : '')}</div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-600 text-sm">No hay detalles disponibles para el intento 1.</div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-2 py-1.5">
              <button onClick={() => setReviewOpen(false)} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <QuiztModal
        open={open}
        onClose={() => { setOpen(false); setIaDraft(null); setIaQuestions(null); }}
        areaTitle={areaTitle}
        initialForm={iaDraft || null}
        onCreate={async (form) => {
          setOpen(false);
          // Si venimos del flujo IA, crear directamente con preguntas y abrir builder
          if (iaQuestions && iaQuestions.length) {
            try {
              const body = {
                titulo: form.nombre || form.titulo,
                descripcion: form.instrucciones || 'Quiz generado automáticamente con IA.',
                materia: areaTitle,
                id_area: selectedAreaId || null,
                publico: !!form.publico,
                shuffle_questions: true,
                time_limit_min: (Math.max(0, Math.trunc(Number(form.horas||0))*60) + Math.max(0, Math.trunc(Number(form.minutos||0)))),
                preguntas: iaQuestions,
                ...(form.intentosMode === 'limited' ? { max_intentos: Math.max(1, Number(form.maxIntentos||1)) } : {}),
              };
              const res = await (await import('../../api/quizzes')).createQuiz(body);
              const created = res?.data?.data || res?.data || null;
              if (created?.id) {
                setData(prev => [
                  {
                    id: created.id,
                    name: created.titulo || body.titulo,
                    type: areaTitle,
                    questions: iaQuestions.length,
                    attempts: body.max_intentos ?? '∞',
                    status: 'Borrador',
                    updatedAt: new Date().toISOString().slice(0,10),
                    createdBy: created.creado_por_nombre || null,
                    id_area: selectedAreaId || null,
                    total_intentos_global: 0,
                  },
                  ...prev
                ]);
                setIaDraft(null);
                setIaQuestions(null);
                navigate(`/asesor/quizt/builder?id=${encodeURIComponent(created.id)}`);
                return;
              }
            } catch (e) {
              alert(e?.response?.data?.message || e?.message || 'No se pudo crear el quiz con IA');
              return;
            }
          }
          // Flujo normal (sin IA): navegar al constructor de nuevo con el borrador
          navigate('/asesor/quizt/nuevo', { state: { title: areaTitle, draft: form } });
        }}
      />
    </div>
  );
}
