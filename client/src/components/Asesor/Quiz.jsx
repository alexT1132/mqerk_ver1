import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
  AlertTriangle,
  X,
  Loader2,
  UploadCloud
} from "lucide-react";
import QuiztModal from "./QuiztModal";
import AnalizadorFallosRepetidos from "./AnalizadorFallosRepetidos";
import QuizIAModal from "./simGen/QuizIAModal";
import ManualReviewShortAnswer from "./ManualReviewShortAnswer";
import { getCooldownRemainingMs } from "../../service/simuladoresAI";
import { logInfo, logError, logDebug } from "../../utils/logger";
import { listQuizzes, deleteQuiz as apiDeleteQuiz, getQuizFull, getQuizEstudiantesEstado, getQuizIntentoReview, updateQuiz } from "../../api/quizzes";
import { getAreasCatalog } from "../../api/areas";


/* ------------------- helpers ------------------- */

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 ring-2 ring-slate-300",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-300 shadow-md",
    draft: "bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-2 ring-amber-300 shadow-md",
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${styles}`}
    >
      {type === "success" && <CheckCircle2 className="h-4 w-4" />}
      {type === "draft" && <CircleDashed className="h-4 w-4" />}
      {children}
    </span>
  );
}

/* Formatea nombre de asesor a partir de username o email */
function formatAsesorName(raw) {
  if (!raw) return '—';
  let s = String(raw).trim();

  // Si es solo un número (ID), mostrar "Asesor #ID"
  if (/^\d+$/.test(s)) {
    return `Asesor #${s}`;
  }

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
function MobileRow({ item, onView, onEdit, onDelete, onPublish }) {
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

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </button>
        {item.status === "Borrador" && (
          <button
            onClick={() => onPublish(item)}
            className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Publicar
          </button>
        )}
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

export default function Quiz({ Icon = PlaySquare, title = "QUIZZES", }) {

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
  const COUNT_OPTIONS = [5, 10, 30, 50].filter(n => n <= MAX_IA);
  const [iaQuickCount, setIaQuickCount] = useState(COUNT_OPTIONS[0] || 5);
  const [iaTopic, setIaTopic] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);
  // Estado temporal para flujo IA -> prellenar modal y adjuntar preguntas
  const [iaDraft, setIaDraft] = useState(null);
  const [iaQuestions, setIaQuestions] = useState(null);
  // Modal de elección IA (general vs por temas)
  const [iaChoiceOpen, setIaChoiceOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', count: 0 });

  // En esta vista trabajamos por área; ocultar filtro por materia para simplificar UX
  const SHOW_AREA_FILTER = false;

  const navigate = useNavigate();
  const location = useLocation();

  // llega desde AreasDeEstudio con Link state={{ title }}
  const incomingTitle = typeof location.state?.title === "string"
    ? location.state.title.trim()
    : null;

  const [areaTitle, setAreaTitle] = useState(
    incomingTitle || getSafeStoredTitle() || "Español y redacción indirecta"
  );

  const [data, setData] = useState([]);
  const prevPathnameRef = useRef(location.pathname); // Para detectar cuando se regresa del builder
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
  const [selectedIntentoReview, setSelectedIntentoReview] = useState(1); // Intentar oficial por defecto

  // Generic confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info', // 'danger' | 'info' | 'success'
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar'
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cooldown ticker - actualiza el estado y limpia el error cuando expira
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const remaining = getCooldownRemainingMs();
      setCooldownMs(remaining);
      // Si el cooldown expiró, limpiar el error relacionado con cooldown/rate limit
      if (remaining === 0) {
        // Reset cooldown related states if any
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []); // Sin dependencias para evitar el warning - usamos mounted flag y funciones de setState con callbacks



  // Función para cargar quizzes (extraída para reutilizar)
  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let currentAreas = areas; // Usar el valor actual de areas

      // cargar catálogo de áreas para filtrar (solo si no hay áreas cargadas)
      if (!currentAreas || currentAreas.length === 0) {
        try {
          const { data: areasRes } = await getAreasCatalog();
          const options = [];
          if (areasRes?.data?.generales) options.push(...areasRes.data.generales);
          if (areasRes?.data?.modulos) options.push(...areasRes.data.modulos);
          setAreas(options);
          currentAreas = options; // Actualizar la referencia local
          // Resolver id inicial por título si aún no hay uno seleccionado
          if (selectedAreaId == null) {
            const norm = (s) => (s || '').toString().trim().toLowerCase();
            const match = options.find(a => norm(a.nombre || a.title) === norm(areaTitle));
            if (match?.id) {
              setSelectedAreaId(match.id);
            }
          }
        } catch { }
      }

      // Usar el id seleccionado (o el derivado) para la primera carga
      const effectiveId = selectedAreaId ?? (function () {
        const norm = (s) => (s || '').toString().trim().toLowerCase();
        const match = (currentAreas || []).find(a => norm(a.nombre || a.title) === norm(areaTitle));
        return match?.id || null;
      })();
      // Mostrar tanto borradores como publicados (visible: false)
      const params = effectiveId ? { id_area: effectiveId, visible: false } : { visible: false };
      const { data } = await listQuizzes(params);
      const rows = Array.isArray(data?.data) ? data.data : [];
      const mapped = rows.map((r) => {
        const now = new Date();
        const vd = r.visible_desde ? new Date(r.visible_desde) : null;
        const vh = r.visible_hasta ? new Date(r.visible_hasta) : null;
        const publicado = (r.publicado === 1 || r.publicado === true) && r.activo && (!vd || vd <= now) && (!vh || vh >= now);
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
      setLoading(false);
    }
  }, [selectedAreaId, areaTitle]); // Removido 'areas' de las dependencias para evitar loop

  // Conexión: listar quizzes (actividades generales tipo 'quiz')
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadQuizzes();
    })();
    return () => { alive = false; };
  }, [selectedAreaId, loadQuizzes]);

  // Recargar cuando se regresa de editar (detectar cuando se navega desde el builder)
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathnameRef.current;

    // Si venimos del builder (ruta contiene 'builder') y ahora estamos en la lista de quizzes, recargar
    const wasInBuilder = prevPath && prevPath.includes('/builder');
    const isInQuizList = (currentPath.includes('/asesor/actividades/quiz') ||
      currentPath.includes('/asesor/quizt')) && !currentPath.includes('/builder');

    if (wasInBuilder && isInQuizList) {
      // Pequeño delay para asegurar que la navegación se completó
      const timer = setTimeout(() => {
        loadQuizzes();
      }, 300);
      prevPathnameRef.current = currentPath; // Actualizar después de programar la recarga
      return () => clearTimeout(timer);
    }

    prevPathnameRef.current = currentPath;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Solo dependemos de location.pathname para evitar recargas innecesarias

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
      { state: { quizId: item.id, title: areaTitle }, replace: true }
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
    setSelectedIntentoReview(1); // Resetear al intento oficial
    setReviewHeader({
      quiz: resultsQuizMeta,
      estudiante: {
        id: row.id_estudiante,
        nombre: `${row.apellidos || ''} ${row.nombre || ''}`.trim(),
        totalIntentos: row.total_intentos || 0
      }
    });
    try {
      // Cargar intento oficial por defecto
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
  
  // Función para cambiar el intento en el modal de review
  const handleChangeIntentoReview = async (intentoNum) => {
    if (!resultsQuizMeta?.id || !reviewHeader.estudiante?.id) return;
    setSelectedIntentoReview(intentoNum);
    setReviewLoading(true);
    try {
      const { data } = await getQuizIntentoReview(resultsQuizMeta.id, reviewHeader.estudiante.id, intentoNum);
      setReviewData(data?.data || null);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'No se pudo cargar el detalle del intento');
    } finally {
      setReviewLoading(false);
    }
  };
  const handleDelete = async (item) => {
    setConfirmModal({
      open: true,
      title: 'Eliminar Quiz',
      message: `¿Estás seguro de eliminar el quiz "${item.name}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        setDeleteLoading(true);
        // Optimista: quitar de UI
        const prev = data;
        setData((d) => d.filter((q) => q.id !== item.id));
        try {
          await apiDeleteQuiz(item.id);
          setConfirmModal(prev => ({ ...prev, open: false }));
        } catch (e) {
          // Revertir en error
          setData(prev);
          alert(e?.response?.data?.message || 'No se pudo eliminar el quiz');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  // Legacy openDeleteConfirm wrapper if needed, but handleDelete handles it now directly
  const openDeleteConfirm = (item) => handleDelete(item);

  const handlePublish = async (item) => {
    setConfirmModal({
      open: true,
      title: 'Publicar Quiz',
      message: `¿Publicar el quiz "${item.name}"? Esto lo hará visible para los estudiantes.`,
      type: 'success',
      confirmText: 'Publicar',
      onConfirm: async () => {
        // Optimista
        const prev = [...data];
        setData(d => d.map(q => q.id === item.id ? { ...q, status: 'Publicado' } : q));

        try {
          await updateQuiz(item.id, { publico: true });
          setConfirmModal(prev => ({ ...prev, open: false }));
        } catch (e) {
          // Revertir
          setData(prev);
          alert(e?.response?.data?.message || 'No se pudo publicar el quiz');
        }
      }
    });
  };

  // Si tenemos catálogo de áreas y un título seleccionado, fijar el filtro inicial por id_area
  useEffect(() => {
    if (!areas.length) return;
    if (selectedAreaId != null) return; // no pisar selección manual
    if (!areaTitle) return;
    const match = areas.find(a => (a.nombre || a.title) === areaTitle);
    if (match?.id) setSelectedAreaId(match.id);
  }, [areas, areaTitle]);

  const headerTitle = `${title} — ${areaTitle}`;

  // Plantillas de temas comunes por área (estilo examen IPN)
  const temasPlantillas = useMemo(() => {
    const areaLower = (areaTitle || '').toLowerCase();
    if (areaLower.includes('español') || areaLower.includes('redacción')) {
      return ['sinónimos y antónimos', 'ortografía', 'lectura comprensiva', 'acentuación', 'gramática'];
    } else if (areaLower.includes('matemática') || areaLower.includes('matemáticas') || areaLower.includes('pensamiento') || areaLower.includes('analítico')) {
      return ['ecuaciones y sistemas', 'geometría y trigonometría', 'fracciones y porcentajes', 'funciones y gráficas', 'razonamiento numérico'];
    } else if (areaLower.includes('física') || areaLower.includes('fisica')) {
      return ['cinemática', 'dinámica y fuerzas', 'energía y trabajo', 'termodinámica', 'electricidad'];
    } else if (areaLower.includes('química') || areaLower.includes('quimica')) {
      return ['estequiometría', 'soluciones y molaridad', 'balanceo de ecuaciones', 'tabla periódica', 'reacciones químicas'];
    } else if (areaLower.includes('ciencia') || areaLower.includes('social')) {
      return ['mecánica', 'termodinámica', 'óptica', 'electricidad', 'ondas'];
    }
    return ['conceptos básicos', 'aplicaciones', 'análisis', 'síntesis', 'evaluación'];
  }, [areaTitle]);



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

      {/* Modal: nueva implementación con componente extraído */}
      <QuizIAModal
        open={iaChoiceOpen}
        onClose={() => setIaChoiceOpen(false)}
        areaTitle={areaTitle}
        selectedAreaId={selectedAreaId}
        initialTopic={iaTopic}
        initialCount={iaQuickCount}
        onSuccess={({ draft, questions }) => {
          setIaQuestions(questions);
          // Preserve current state + new draft
          setIaDraft(prev => ({
            ...prev,
            ...draft,
            // Ensure critical IDs are preserving
            areaTitle: draft.areaTitle || areaTitle,
            selectedAreaId: draft.selectedAreaId || selectedAreaId
          }));
          setOpen(true);
        }}
      />
      {/* Encabezado breve */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 px-6 pt-4 pb-6 sm:px-8 sm:pt-5 sm:pb-8 shadow-xl ring-2 ring-slate-100/50 mb-8">
        {/* blobs suaves al fondo */}
        <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

        <div className="relative z-10 flex items-center gap-5">
          {/* ícono con badge */}
          <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg sm:size-14">
            <Icon className="size-6 sm:size-7" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-white">
              <Sparkles className="size-3 text-white" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700">
              {headerTitle}
            </h2>

            {/* subrayado doble */}
            <div className="mt-1 flex gap-2">
              <span className="h-1 w-14 sm:w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
              <span className="h-1 w-8 sm:w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
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
                onChange={(e) => setIaTopic(e.target.value)}
                placeholder="Tema del quiz (p. ej., Redacción)"
                className="w-64 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            )}
            <label className="hidden sm:block text-xs text-slate-500">Preguntas</label>
            <select
              value={iaQuickCount}
              onChange={(e) => setIaQuickCount(Number(e.target.value))}
              className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              aria-label="Cantidad de preguntas IA"
            >
              {COUNT_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {/* Tiempo se ajusta dentro del builder después de crear */}
            <button
              onClick={() => setIaChoiceOpen(true)}
              disabled={iaLoading || (!selectedAreaId && !iaTopic.trim()) || cooldownMs > 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {cooldownMs > 0 ? (() => {
                const mins = Math.floor(cooldownMs / 60000);
                const secs = Math.ceil((cooldownMs % 60000) / 1000);
                return mins > 0 ? `Espera ${mins}m ${secs}s` : `Espera ${secs}s`;
              })() : 'Genera con IA'}
            </button>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
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
            onPublish={handlePublish}
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
        <div className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl ring-2 ring-slate-100/50">
          <div className="overflow-x-auto lg:overflow-x-visible">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 px-6 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-700 w-[22rem] border-r-2 border-slate-200"
                  >
                    Quizt
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 w-[8rem]"
                  >
                    Preguntas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 w-[9rem]"
                  >
                    Intentos
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 w-[8rem]"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-700 w-[9rem]"
                  >
                    Actualizado
                  </th>
                  <th scope="col" className="px-6 py-5 w-[12rem]"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {!loading && data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="bg-white hover:bg-gradient-to-r hover:from-violet-50/30 hover:via-indigo-50/30 hover:to-purple-50/30 transition-all duration-200"
                  >
                    <td className="sticky left-0 z-10 bg-inherit hover:bg-gradient-to-r hover:from-violet-50/30 hover:via-indigo-50/30 hover:to-purple-50/30 px-6 py-5 w-[22rem] border-r-2 border-slate-200">
                      <div className="truncate font-bold text-slate-900 text-sm">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-slate-700 whitespace-nowrap font-bold">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-2 ring-blue-200">
                        {item.questions}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-slate-700 whitespace-nowrap">
                      {item.total_intentos_global != null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 ring-2 ring-slate-300 shadow-sm">
                          {item.total_intentos_global} / {item.attempts === '∞' ? '∞' : item.attempts}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">{item.attempts}</span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      {item.status === "Publicado" ? (
                        <Badge type="success">Publicado</Badge>
                      ) : (
                        <Badge type="draft">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-sm font-medium whitespace-nowrap">
                      {item.updatedAt}
                    </td>
                    <td className="px-6 py-5 w-[12rem]">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(item)}
                          title="Vista previa"
                          className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResultados(item)}
                          title="Resultados"
                          className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:from-emerald-100 hover:to-green-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        >
                          <span className="font-bold text-sm">%</span>
                        </button>
                        {item.status === "Borrador" && (
                          <button
                            onClick={() => handlePublish(item)}
                            title="Publicar"
                            className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:from-emerald-100 hover:to-green-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                          >
                            <UploadCloud className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Editar"
                          aria-label="Editar"
                          className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:from-indigo-100 hover:to-violet-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item)}
                          title="Eliminar"
                          aria-label="Eliminar"
                          className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:from-rose-100 hover:to-red-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
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
                      className="px-4 py-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 ring-4 ring-violet-200">
                          <PlaySquare className="w-10 h-10 text-violet-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-slate-700">
                            Aún no hay quizt
                          </p>
                          <p className="text-sm text-slate-500">
                            Crea el primero con el botón
                            <span className="mx-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 font-bold text-white shadow-md">
                              Nuevo quizt
                            </span>
                          </p>
                        </div>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
            {/* Header mejorado */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                  <span className="text-white font-bold text-lg">%</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Resultados del Quiz</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{resultsQuizMeta?.titulo || 'Quiz'}</p>
                </div>
              </div>
              <button
                onClick={() => setResultsOpen(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/30">
              {resultsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium text-slate-600">Cargando resultados...</p>
                  </div>
                </div>
              ) : resultsRows.length ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/60">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                            Estudiante
                          </th>
                          <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                            Grupo
                          </th>
                          <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                            Intentos
                          </th>
                          <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                            Puntaje Oficial
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {resultsRows.map((r, idx) => (
                          <tr
                            key={r.id_estudiante}
                            className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900 text-sm">
                                {`${r.apellidos || ''} ${r.nombre || ''}`.trim() || 'Sin nombre'}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">
                                {r.grupo || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                                {r.total_intentos || 0}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {r.total_intentos > 0 ? (
                                <span className={`inline-flex items-center justify-center min-w-[4rem] px-4 py-2 rounded-xl font-bold text-sm shadow-sm ${(Number(r.oficial_puntaje || 0) >= 70)
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white ring-2 ring-emerald-200'
                                    : (Number(r.oficial_puntaje || 0) >= 50)
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-2 ring-amber-200'
                                      : 'bg-gradient-to-r from-rose-500 to-red-600 text-white ring-2 ring-rose-200'
                                  }`}>
                                  {Number(r.oficial_puntaje || 0)}%
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium">
                                  Sin intento
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                disabled={r.total_intentos === 0}
                                onClick={() => openReview(r)}
                                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                    <PlaySquare className="h-10 w-10 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">Sin resultados aún</h4>
                  <p className="text-sm text-slate-500 text-center max-w-sm">
                    Aún no hay estudiantes que hayan completado este quiz.
                  </p>
                </div>
              )}
            </div>

            {/* Footer mejorado */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/60">
              <div className="text-sm text-slate-600">
                {resultsRows.length > 0 && (
                  <span className="font-medium">
                    {resultsRows.length} {resultsRows.length === 1 ? 'estudiante' : 'estudiantes'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setResultsOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-violet-700 transition-all hover:shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b px-2 py-1.5">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  {reviewHeader.quiz?.titulo || 'Quiz'} • {reviewHeader.estudiante?.nombre || 'Alumno'}
                </h3>
                {reviewHeader.estudiante?.totalIntentos > 1 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 font-medium">Intento:</label>
                    <select
                      value={selectedIntentoReview}
                      onChange={(e) => handleChangeIntentoReview(Number(e.target.value))}
                      className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {Array.from({ length: reviewHeader.estudiante.totalIntentos }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num === 1 ? `Intento ${num} (Oficial)` : `Intento ${num} (Práctica)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button onClick={() => setReviewOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviewLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Cargando…</div>
              ) : reviewData && Array.isArray(reviewData.preguntas) ? (
                <div className="space-y-4">
                  {/* Analizador de fallos repetidos */}
                  {reviewHeader.estudiante?.totalIntentos >= 2 && (
                    <AnalizadorFallosRepetidos
                      tipo="quiz"
                      id={resultsQuizMeta?.id}
                      idEstudiante={reviewHeader.estudiante?.id}
                      totalIntentos={reviewHeader.estudiante?.totalIntentos}
                    />
                  )}
                  
                  {/* Separar preguntas por tipo */}
                  {(() => {
                    const preguntasOpcionMultiple = reviewData.preguntas.filter(p => p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso' || p.tipo === 'multi_respuesta');
                    const respuestasCortas = reviewData.preguntas.filter(p => p.tipo === 'respuesta_corta');
                    
                    return (
                      <>
                        {/* Preguntas de opción múltiple */}
                        {preguntasOpcionMultiple.length > 0 && (
                          <div className="space-y-2.5">
                            {preguntasOpcionMultiple.map((p, idx) => {
                              const sel = new Set(p.seleccionadas || []);
                              const corr = !!p.correcta;
                              return (
                                <div key={p.id || idx} className="rounded border border-slate-200 p-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm font-medium text-slate-900">{p.orden || (idx + 1)}. {p.enunciado}</div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${corr ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{corr ? 'Correcta' : 'Incorrecta'}</span>
                                  </div>
                                  <ul className="mt-1.5 space-y-1">
                                    {(p.opciones || []).map((o) => {
                                      const isSel = sel.has(o.id);
                                      const isOk = o.es_correcta === 1;
                                      const base = 'text-xs rounded-lg border px-3 py-1.5 flex items-center justify-between';
                                      // Colores según el estado: seleccionada y correcta (verde), seleccionada e incorrecta (rojo), solo correcta (verde claro), ninguna (gris)
                                      const cl = isSel && isOk ? 'bg-emerald-50 border-emerald-300' : isSel && !isOk ? 'bg-rose-50 border-rose-300' : !isSel && isOk ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200';
                                      return (
                                        <li key={o.id} className={`${base} ${cl}`}>
                                          <span>{o.texto}</span>
                                          <div className="flex items-center gap-2">
                                            {isSel && <span className="text-[10px] font-bold text-slate-700">✓ Seleccionada</span>}
                                            {isOk && <span className="text-[10px] font-bold text-green-700">Correcta</span>}
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Sección de Respuestas Cortas para Revisión Manual */}
                        {respuestasCortas.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <span>📝</span>
                              <span>Respuestas Cortas para Revisión</span>
                              {respuestasCortas.filter(p => {
                                // Verificar si requiere revisión (baja confianza o estado manual_review)
                                const requiereRevision = p.calificacion_confianza < 70 || p.calificacion_status === 'manual_review';
                                return requiereRevision;
                              }).length > 0 && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                                  {respuestasCortas.filter(p => {
                                    const requiereRevision = p.calificacion_confianza < 70 || p.calificacion_status === 'manual_review';
                                    return requiereRevision;
                                  }).length} requieren revisión
                                </span>
                              )}
                            </h4>
                            
                            <div className="space-y-4">
                              {respuestasCortas.map((pregunta) => {
                                // Obtener respuesta esperada (opción correcta)
                                const respuestaEsperada = pregunta.opciones?.find(o => o.es_correcta === 1)?.texto;
                                
                                if (!respuestaEsperada) return null;
                                
                                // Construir objeto respuesta para el componente
                                // Usar los datos disponibles en la pregunta y mapear a la estructura esperada
                                // Validar que tenemos id_respuesta antes de crear el componente
                                // Si no hay id_respuesta, no podemos hacer revisión manual
                                if (!pregunta.id_respuesta) {
                                  console.warn('[Quiz] Respuesta corta sin id_respuesta:', {
                                    pregunta_id: pregunta.id,
                                    valor_texto: pregunta.valor_texto,
                                    calificacion_status: pregunta.calificacion_status
                                  });
                                  // Mostrar mensaje de que la respuesta aún no está disponible para revisión
                                  return (
                                    <div key={pregunta.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <p className="text-sm text-yellow-800">
                                        ⚠️ Esta respuesta aún no está disponible para revisión manual. 
                                        La respuesta se está procesando automáticamente.
                                      </p>
                                    </div>
                                  );
                                }
                                
                                const respuestaObj = {
                                  id: pregunta.id_respuesta, // DEBE ser el ID de la respuesta, no de la pregunta
                                  valor_texto: pregunta.valor_texto || null,
                                  texto_libre: pregunta.valor_texto || null,
                                  correcta: pregunta.correcta ? 1 : 0,
                                  calificacion_status: pregunta.calificacion_status || 'pending',
                                  calificacion_metodo: pregunta.calificacion_metodo || null,
                                  calificacion_confianza: pregunta.calificacion_confianza || null,
                                  revisada_por: pregunta.revisada_por || null,
                                  notas_revision: pregunta.notas_revision || null
                                };
                                
                                return (
                                  <ManualReviewShortAnswer
                                    key={pregunta.id}
                                    respuesta={respuestaObj}
                                    pregunta={pregunta.enunciado}
                                    respuestaEsperada={respuestaEsperada}
                                    tipo="quiz"
                                    onReviewComplete={(updatedData) => {
                                      // Recargar datos del intento actualmente seleccionado
                                      if (resultsQuizMeta?.id && reviewHeader.estudiante?.id) {
                                        getQuizIntentoReview(resultsQuizMeta.id, reviewHeader.estudiante.id, selectedIntentoReview)
                                          .then(({ data }) => setReviewData(data?.data || null))
                                          .catch(err => console.error('Error al recargar datos:', err));
                                      }
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
        onFormChange={useCallback((formState) => {
          // Mantener iaDraft sincronizado con el estado del formulario del modal
          // Esto preserva la configuración cuando se genera con IA
          // Solo actualizar si realmente hay cambios para evitar loops infinitos
          if (open && formState) {
            setIaDraft((prev) => {
              const newDraft = {
                ...(prev || {}),
                ...formState,
                areaTitle: areaTitle,
                selectedAreaId: selectedAreaId,
              };
              // Comparar strings para evitar actualizaciones innecesarias
              const prevStr = JSON.stringify(prev);
              const newStr = JSON.stringify(newDraft);
              if (prevStr === newStr) return prev;
              return newDraft;
            });
          }
        }, [open, areaTitle, selectedAreaId])}
        onCreate={async (form) => {
          setOpen(false);
          // Si venimos del flujo IA, crear directamente con preguntas y abrir builder
          if (iaQuestions && iaQuestions.length) {
            try {
              // Usar el área guardada en iaDraft si está disponible, sino usar el actual
              const currentAreaTitle = iaDraft?.areaTitle || areaTitle;
              const currentAreaId = iaDraft?.selectedAreaId ?? selectedAreaId ?? null;

              // Asegurar que haya descripción (instrucciones) - usar las del form o generar una por defecto
              const descripcionRaw = form.instrucciones || form.descripcion || '';
              const descripcion = descripcionRaw.trim() || `Quiz generado automáticamente con IA. Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área de ${currentAreaTitle || 'la materia'}.`;

              const body = {
                titulo: form.nombre || form.titulo,
                descripcion: descripcion, // Siempre tendrá un valor
                materia: currentAreaTitle,
                id_area: currentAreaId,
                publico: false, // Siempre crear como borrador cuando se usa IA
                shuffle_questions: true,
                time_limit_min: (Math.max(0, Math.trunc(Number(form.horas || 0)) * 60) + Math.max(0, Math.trunc(Number(form.minutos || 0)))),
                preguntas: iaQuestions,
                ...(form.intentosMode === 'limited' ? { max_intentos: Math.max(1, Number(form.maxIntentos || 1)) } : {}),
                // Incluir grupos si fueron seleccionados en el formulario
                ...(form.grupos && Array.isArray(form.grupos) && form.grupos.length > 0 ? { grupos: form.grupos } : {}),
              };

              logInfo('Quiz.jsx', 'Creando quiz con IA', {
                titulo: body.titulo,
                cantidadPreguntas: iaQuestions.length,
                preguntas: iaQuestions.map(q => ({ type: q.type, text: q.text?.substring(0, 50) + '...', optionsCount: q.options?.length || 0 }))
              });

              const res = await (await import('../../api/quizzes')).createQuiz(body);
              const created = res?.data?.data || res?.data || null;

              logInfo('Quiz.jsx', 'Quiz creado', {
                id: created?.id,
                titulo: created?.titulo,
                respuesta: res?.data
              });

              if (created?.id) {
                // Verificar que las preguntas se guardaron correctamente
                try {
                  const { getQuizFull } = await import('../../api/quizzes');
                  const verifyRes = await getQuizFull(created.id);
                  const preguntasGuardadas = verifyRes?.data?.data?.preguntas || [];
                  logInfo('Quiz.jsx', 'Verificación de preguntas guardadas', {
                    quizId: created.id,
                    cantidadEsperada: iaQuestions.length,
                    cantidadGuardada: preguntasGuardadas.length,
                    preguntas: preguntasGuardadas.map(p => ({ tipo: p.tipo, enunciado: p.enunciado?.substring(0, 50) + '...' }))
                  });

                  if (preguntasGuardadas.length === 0) {
                    logError('Quiz.jsx', 'ERROR: Las preguntas no se guardaron correctamente', {
                      quizId: created.id,
                      cantidadEsperada: iaQuestions.length
                    });
                    alert('Advertencia: El quiz se creó pero las preguntas no se guardaron. Por favor, verifica en el builder.');
                  }
                } catch (verifyError) {
                  logError('Quiz.jsx', 'Error al verificar preguntas', verifyError);
                }

                setData(prev => [
                  {
                    id: created.id,
                    name: created.titulo || body.titulo,
                    type: currentAreaTitle,
                    questions: iaQuestions.length,
                    attempts: body.max_intentos ?? '∞',
                    status: 'Borrador',
                    updatedAt: new Date().toISOString().slice(0, 10),
                    createdBy: created.creado_por_nombre || null,
                    id_area: currentAreaId,
                    total_intentos_global: 0,
                  },
                  ...prev
                ]);
                setIaDraft(null);
                setIaQuestions(null);

                // Mostrar mensaje de éxito y quedarse en la lista
                logInfo('Quiz.jsx', 'Quiz creado con IA exitosamente', {
                  quizId: created.id,
                  titulo: created.titulo,
                  cantidadPreguntas: iaQuestions.length
                });

                // Mostrar modal de éxito
                setSuccessModal({
                  open: true,
                  message: `Quiz creado exitosamente con ${iaQuestions.length} pregunta(s)`,
                  count: iaQuestions.length
                });
                // Cerrar automáticamente después de 4 segundos
                setTimeout(() => setSuccessModal(prev => ({ ...prev, open: false })), 4000);

                // NO navegar al builder, quedarse en la lista
                return;
              } else {
                logError('Quiz.jsx', 'ERROR: No se recibió ID del quiz creado', { respuesta: res?.data });
                alert('Error: No se pudo crear el quiz. Por favor, intenta de nuevo.');
                return;
              }
            } catch (e) {
              logError('Quiz.jsx', 'Error al crear quiz con IA', e);
              alert(e?.response?.data?.message || e?.message || 'No se pudo crear el quiz con IA');
              return;
            }
          }
          // Flujo normal (sin IA): navegar al constructor de nuevo con el borrador
          // Asegurar que id_area se pase al builder
          const currentAreaId = selectedAreaId ?? null;
          navigate('/asesor/quizt/nuevo', {
            state: {
              title: areaTitle,
              draft: form,
              id_area: currentAreaId,
              areaId: currentAreaId
            },
            replace: true
          });
        }}
      />

      {/* Modal de éxito */}
      {successModal.open && (
        <SuccessModal
          message={successModal.message}
          count={successModal.count}
          onClose={() => setSuccessModal(prev => ({ ...prev, open: false }))}
        />
      )}

      {/* Modal de confirmación genérico */}
      {confirmModal.open && (
        <ConfirmationModal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          loading={deleteLoading} // Reusing deleteLoading for generic loading state if needed
        />
      )}
    </div>
  );
}

// Componente de modal de confirmación
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirmar', cancelText = 'Cancelar', loading = false }) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-300',
      icon: AlertTriangle
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
      icon: UploadCloud
    },
    info: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      button: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300',
      icon: Sparkles
    }
  }[type] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    button: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-300',
    icon: Sparkles
  };

  const Icon = colors.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-none rounded-full p-3 ${colors.bg} ${colors.text}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 leading-6">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${colors.button}`}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de modal de éxito estético
function SuccessModal({ message, count = 0, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="relative w-full max-w-md pointer-events-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-5 text-white">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-white animate-in zoom-in duration-500" />
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center">¡Éxito!</h3>
          </div>

          {/* Contenido */}
          <div className="px-6 py-5 text-center">
            <p className="text-lg font-semibold text-slate-900 mb-2">{message}</p>
            {count > 0 && (
              <p className="text-sm text-slate-600">
                Puedes editarlo haciendo clic en el botón "Editar" en la lista.
              </p>
            )}
          </div>

          {/* Barra de progreso temporal */}
          <div className="h-1 bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{
                animation: 'shrink 4s linear forwards'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
