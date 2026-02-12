import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom"; // Portal para modales
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
import SimulatorModal from "./SimulatorModal"; // ✅ Para edición (tiene soporte para onUpdate y onEditQuestions)
import AnalizadorFallosRepetidos from "./AnalizadorFallosRepetidos";
import QuizIAModal from "./simGen/QuizIAModal";
import ManualReviewShortAnswer from "./ManualReviewShortAnswer";
import ReviewModal from "./ReviewModal";
import { getCooldownRemainingMs } from "../../service/simuladoresAI";
import { logInfo, logError, logDebug } from "../../utils/logger";
import { listQuizzes, deleteQuiz as apiDeleteQuiz, getQuizFull, getQuizEstudiantesEstado, getQuizIntentoReview, updateQuiz } from "../../api/quizzes";
import { getAreasCatalog, listAreas } from "../../api/areas";
import InlineMath from "./simGen/InlineMath";

// Componente para renderizar texto con fórmulas LaTeX (igual que en Quizz_Review.jsx)
function MathText({ text = "" }) {
  if (!text) return null;

  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }
    nodesToRemove.forEach(n => {
      const parent = n.parentNode;
      while (n.firstChild) {
        parent.insertBefore(n.firstChild, n);
      }
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  // ✅ Normalizar saltos de línea y espacios primero
  let processedText = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ✅ Reemplazar símbolos Unicode de multiplicación y división por comandos LaTeX
  // Esto debe hacerse ANTES de proteger las fórmulas
  processedText = processedText.replace(/×/g, '\\times').replace(/÷/g, '\\div');

  // ✅ Procesar Markdown primero (convertir **texto** a <strong>texto</strong>)
  // Pero proteger las fórmulas LaTeX para no procesarlas
  const latexPlaceholder = '___LATEX_PLACEHOLDER___';
  const latexMatches = [];
  let placeholderIndex = 0;

  // Regex para detectar $...$ y $$...$$
  const fullLatexRe = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;

  // Reemplazar fórmulas LaTeX con placeholders antes de procesar Markdown
  processedText = processedText.replace(fullLatexRe, (match) => {
    const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
    latexMatches.push(match);
    placeholderIndex++;
    return placeholder;
  });

  // Procesar Markdown: **texto** -> <strong>texto</strong>
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

  // Restaurar fórmulas LaTeX
  latexMatches.forEach((match, idx) => {
    processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
  });

  const parts = [];
  let lastIndex = 0;
  let m;
  let matchFound = false;

  fullLatexRe.lastIndex = 0;

  while ((m = fullLatexRe.exec(processedText)) !== null) {
    matchFound = true;
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: processedText.slice(lastIndex, m.index) });
    }

    // m[1] es para $$...$$, m[2] es para $...$
    const formula = (m[1] || m[2] || "").trim();
    const isBlock = !!m[1];

    if (formula) {
      parts.push({ type: 'math', content: formula, display: isBlock });
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < processedText.length) {
    parts.push({ type: 'text', content: processedText.slice(lastIndex) });
  }

  if (!matchFound || parts.length === 0) {
    return (
      <span
        className="block w-full break-words overflow-x-auto whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }}
      />
    );
  }

  return (
    <span className="block w-full break-words overflow-x-auto whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <InlineMath key={`math-${idx}`} math={part.content} display={part.display} />
        ) : (
          <span
            key={`text-${idx}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }}
          />
        )
      )}
    </span>
  );
}

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
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
          {/* ✅ Mostrar instrucciones debajo del nombre (igual que en simuladores) */}
          {item.instrucciones && item.instrucciones.trim() && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {item.instrucciones}
            </p>
          )}
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
  const [successModal, setSuccessModal] = useState({ open: false, message: '', count: 0, willRedirect: false });

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
  const [editing, setEditing] = useState(null); // ✅ Estado para el quiz que se está editando
  const [editModalOpen, setEditModalOpen] = useState(false); // ✅ Estado para el modal de edición
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

  // Bloquear scroll del body cuando hay modales abiertas
  useEffect(() => {
    if (previewOpen || resultsOpen || reviewOpen || confirmModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewOpen, resultsOpen, reviewOpen, confirmModal.open]);


  // Función para cargar quizzes (extraída para reutilizar)
  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let currentAreas = areas; // Usar el valor actual de areas

      // cargar catálogo de áreas para filtrar (solo si no hay áreas cargadas)
      if (!currentAreas || currentAreas.length === 0) {
        try {
          // ✅ Usar listAreas para traer TODAS las áreas activas (incluyendo generales/contenedores)
          const { data: res } = await listAreas();
          const options = Array.isArray(res?.data) ? res.data : [];
          setAreas(options);
          currentAreas = options; // Actualizar la referencia local
          // Resolver id inicial por título si aún no hay uno seleccionado
          if (selectedAreaId == null) {
            const norm = (s) => (s || '').toString().trim().toLowerCase();
            const findMatch = (list, title) => {
              if (!list || !title) return null;
              const nTitle = norm(title);
              let m = list.find(a => norm(a.nombre || a.title) === nTitle);
              if (m) return m;
              // Fallback para títulos con prefijos "Transversal: X"
              if (title.includes(':')) {
                const parts = title.split(':');
                const suffix = parts[parts.length - 1];
                if (suffix) m = list.find(a => norm(a.nombre || a.title) === norm(suffix));
              }
              return m;
            };

            const match = findMatch(options, areaTitle);
            if (match?.id) {
              setSelectedAreaId(match.id);
            }
          }
        } catch { }
      }

      // Usar el id seleccionado (o el derivado) para la primera carga
      const effectiveId = selectedAreaId ?? (function () {
        const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

        console.log('[Quiz] Trying to match area:', areaTitle);
        console.log('[Quiz] Available areas count:', currentAreas?.length);
        if (currentAreas?.length > 0) {
          console.log('[Quiz] First 3 areas in list:', currentAreas.slice(0, 3).map(a => a.nombre));
          const exactMatch = currentAreas.find(a => norm(a.nombre) === norm(areaTitle));
          console.log('[Quiz] Exact match attempt:', exactMatch ? 'FOUND' : 'NOT FOUND', 'Comparing:', norm(areaTitle), 'with DB names');
        }

        const findMatch = (list, title) => {
          if (!list || !title) return null;
          const nTitle = norm(title);

          // 1. Exact match
          let m = list.find(a => norm(a.nombre) === nTitle);
          if (m) return m;

          // Prepare search parts
          const hasColon = title.includes(':');
          const searchSuffix = hasColon ? norm(title.split(':').pop()) : null;

          return list.find(a => {
            const nDb = norm(a.nombre);
            // Bidirectional inclusion
            if (nDb.includes(nTitle)) return true;
            if (nTitle.includes(nDb)) return true;

            // Suffix checks
            if (searchSuffix) {
              if (nDb.endsWith(searchSuffix)) return true;
              if (nDb.includes(searchSuffix)) return true;
            }

            // DB colon check
            if (a.nombre && a.nombre.includes(':')) {
              const dbSuffix = norm(a.nombre.split(':').pop());
              if (dbSuffix === nTitle) return true;
              if (searchSuffix && dbSuffix === searchSuffix) return true;
            }
            return false;
          });
        };
        const match = findMatch(currentAreas, areaTitle);
        if (match?.id) {
          console.log(`[Quiz] Resolved match for "${areaTitle}": ${match.nombre} (ID: ${match.id})`);
        } else {
          console.log('[Quiz] FAILED to match. Normalized title:', norm(areaTitle));
        }
        return match?.id || null;
      })();

      // Si estamos buscando por área pero no encontramos ID, mostrar vacío en lugar de todos
      if (areaTitle && !effectiveId) {
        console.warn("[Quiz] No match found for area:", areaTitle);
        setData([]);
        setLoading(false);
        return;
      }

      // Mostrar tanto borradores como publicados (visible: false)
      const params = effectiveId ? { id_area: effectiveId, visible: false } : { visible: false };
      const { data } = await listQuizzes(params); // ... resto del código
      const rows = Array.isArray(data?.data) ? data.data : [];
      const mapped = rows.map((r) => {
        const now = new Date();
        const vd = r.visible_desde ? new Date(r.visible_desde) : null;
        const vh = r.visible_hasta ? new Date(r.visible_hasta) : null;
        const publicado = (r.publicado === 1 || r.publicado === true) && r.activo && (!vd || vd <= now) && (!vh || vh >= now);
        // ✅ CRÍTICO: Obtener instrucciones/descripción con múltiples fallbacks (igual que en simuladores)
        const instruccionesFinal = r.descripcion || r.instrucciones || r.instructions || '';
        return {
          id: r.id,
          name: r.titulo || r.nombre || `Quiz ${r.id}`,
          type: r.materia || "Áreas generales",
          instrucciones: instruccionesFinal, // ✅ Agregar instrucciones al objeto mapeado
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

      alert(e?.response?.data?.message || 'No se pudo cargar la vista previa');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };
  // ✅ Edición: cargar datos completos del quiz y abrir modal de edición (igual que en simuladores)
  const handleEdit = async (item) => {
    if (!item || !item.id) {
      alert('Error: No se puede editar un quiz sin ID');
      return;
    }

    try {
      // Cargar los datos completos del quiz
      const { data: fullData } = await getQuizFull(item.id);
      const quizData = fullData?.data?.quiz || fullData?.data || fullData || {};

      // Calcular horas y minutos desde time_limit_min
      const timeLimitMin = Number(quizData.time_limit_min || 0);
      const horas = Math.floor(timeLimitMin / 60);
      const minutos = timeLimitMin % 60;

      // Formatear fecha_limite para el input type="date" (YYYY-MM-DD)
      let fechaLimiteFormatted = '';
      const fechaLimiteRaw = quizData.fecha_limite || quizData.fechaLimite;
      if (fechaLimiteRaw) {
        try {
          const fecha = new Date(fechaLimiteRaw);
          if (!isNaN(fecha.getTime())) {
            fechaLimiteFormatted = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
          }
        } catch (e) {
          console.warn('[Quiz] Error al formatear fecha_limite:', e);
        }
      }

      // Determinar intentosMode y maxIntentos
      const maxIntentos = quizData.max_intentos;
      const intentosMode = maxIntentos && maxIntentos > 0 ? 'limited' : 'unlimited';

      // Preparar el objeto de edición con todos los datos
      const editData = {
        ...item,
        // Datos del quiz completo
        titulo: quizData.titulo || quizData.nombre || item.name || '',
        nombre: quizData.nombre || quizData.titulo || item.name || '',
        // ✅ CRÍTICO: Buscar instrucciones/descripción en múltiples lugares
        instrucciones: quizData.descripcion || quizData.instrucciones || item.instrucciones || item.descripcion || '',
        descripcion: quizData.descripcion || quizData.instrucciones || item.descripcion || item.instrucciones || '',
        fechaLimite: fechaLimiteFormatted,
        publico: quizData.publico !== undefined ? Boolean(quizData.publico) : (quizData.status === 'Publicado' || item.status === 'Publicado'),
        horas: horas,
        minutos: minutos,
        intentosMode: intentosMode,
        maxIntentos: maxIntentos && maxIntentos > 0 ? Number(maxIntentos) : 3,
        grupos: [], // Los grupos se cargarán desde el backend si es necesario
        areaId: quizData.id_area !== undefined && quizData.id_area !== null ? Number(quizData.id_area) : null,
        areaTitle: quizData.materia || areaTitle || null
      };

      setEditing(editData);
      setEditModalOpen(true);
    } catch (e) {
      console.error('[Quiz] Error al cargar datos para editar:', e);
      alert(e?.response?.data?.message || 'No se pudo cargar el quiz para editar');
    }
  };

  // ✅ Función para actualizar el quiz (igual que handleUpdate en simuladores)
  const handleUpdate = async (form) => {
    if (!editing || !editing.id) {
      alert('Error: No hay quiz seleccionado para actualizar');
      return;
    }

    try {
      // ✅ CRÍTICO: El form usa "instrucciones" como descripción (ya que el modal mapea descripcion->instrucciones)
      const descripcionFinal = form.descripcion || form.instrucciones || '';

      // Formatear fecha_limite
      let fechaLimiteFinal = null;
      if (form.fechaLimite && form.fechaLimite.trim() !== '') {
        fechaLimiteFinal = form.fechaLimite; // Ya viene en formato YYYY-MM-DD
      }

      const payload = {
        titulo: form.nombre || form.titulo,
        // ✅ CRÍTICO: Siempre incluir descripcion, incluso si está vacío (usar string vacío en lugar de null para forzar actualización)
        descripcion: descripcionFinal !== null && descripcionFinal !== undefined ? String(descripcionFinal) : '',
        fecha_limite: fechaLimiteFinal,
        time_limit_min: Number(form.horas || 0) * 60 + Number(form.minutos || 0),
        publico: !!form.publico,
        ...(form.intentosMode === 'limited' ? { max_intentos: Math.max(1, Number(form.maxIntentos || 1)) } : { max_intentos: null }),
      };

      await updateQuiz(editing.id, payload);

      // Actualizar el item en la lista local
      setData(prev => prev.map(q => {
        if (q.id === editing.id) {
          const instruccionesActualizadas = payload.descripcion || '';
          return {
            ...q,
            name: payload.titulo || q.name,
            instrucciones: instruccionesActualizadas,
            status: payload.publico ? 'Publicado' : 'Borrador',
            attempts: payload.max_intentos && payload.max_intentos > 0 ? payload.max_intentos : '∞',
          };
        }
        return q;
      }));

      setEditModalOpen(false);
      setEditing(null);

      // Recargar para asegurar que los datos estén actualizados
      await loadQuizzes();
    } catch (e) {
      console.error('[Quiz] Error al actualizar:', e);
      alert(e?.response?.data?.message || 'No se pudo actualizar el quiz');
    }
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



  // Bloquear el scroll de la página cuando CUALQUIER modal esté abierto
  useEffect(() => {
    const isAnyModalOpen = open || iaChoiceOpen || successModal.open || editModalOpen || previewOpen || resultsOpen || reviewOpen || confirmModal.open;

    if (!isAnyModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // Bloquear scroll
    document.body.style.overflow = 'hidden';

    // Compensar el ancho del scrollbar para evitar saltos de layout
    try {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } catch (e) {
      console.error("Error compensando scrollbar:", e);
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, iaChoiceOpen, successModal.open, editModalOpen, previewOpen, resultsOpen, reviewOpen, confirmModal.open]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-20 bg-slate-50 px-6 py-4 text-left text-xs font-extrabold uppercase tracking-widest text-slate-700 min-w-[280px] border-r-2 border-slate-200"
                    >
                      Quizt
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 min-w-[100px]">
                      Preguntas
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 min-w-[120px]">
                      Intentos
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-700 min-w-[120px]">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-widest text-slate-700 min-w-[120px]">
                      Actualizado
                    </th>
                    <th scope="col" className="px-6 py-4 min-w-[220px]"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {!loading && data.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-gradient-to-r hover:from-violet-50/30 hover:via-indigo-50/30 hover:to-purple-50/30 transition-all duration-200"
                    >
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-6 py-5 border-r-2 border-slate-200">
                        <div className="max-w-xs xl:max-w-md">
                          <div className="font-semibold text-slate-900 truncate" title={item.name}>
                            {item.name}
                          </div>
                          {item.instrucciones && (
                            <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                              {item.instrucciones}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-2 ring-blue-200 uppercase tracking-tighter">
                          {item.questions}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        {item.total_intentos_global != null ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-700">{item.total_intentos_global}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Límite: {item.attempts}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">{item.attempts}</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        {item.status === "Publicado" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[10px] font-black text-emerald-700 uppercase tracking-widest ring-1 ring-emerald-200">
                            <CheckCircle2 className="size-3" /> Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-[10px] font-black text-amber-700 uppercase tracking-widest ring-1 ring-amber-200">
                            <CircleDashed className="size-3" /> Borrador
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-slate-600 text-sm font-medium whitespace-nowrap">
                        {item.updatedAt}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
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
                          <button
                            onClick={() => handleEdit(item)}
                            title="Editar"
                            className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:from-indigo-100 hover:to-violet-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Eliminar"
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
                      <td colSpan={6} className="px-5 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center ring-8 ring-slate-100/50">
                            <PlaySquare className="size-10 text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-black text-slate-900">Sin quizzes registrados</p>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Comienza creando uno nuevo para esta área</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-8 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando datos...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Preview modal */}
        {
          previewOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setPreviewOpen(false)}>
              <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Vista previa</h3>
                      <p className="text-sm text-slate-600 mt-0.5">Previsualización del contenido</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Contenido con scroll */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/30">
                  {previewLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="size-12 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin" />
                      <p className="text-sm font-semibold text-slate-500">Cargando contenido...</p>
                    </div>
                  )}
                  {!previewLoading && previewQuiz && (
                    <div className="space-y-4">
                      <header className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900">
                          {previewQuiz.quiz?.titulo || 'Quiz'}
                        </h4>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs leading-5 font-bold rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                            {Array.isArray(previewQuiz.preguntas) ? previewQuiz.preguntas.length : 0} Preguntas
                          </span>
                        </div>
                      </header>

                      <ol className="space-y-3">
                        {previewQuiz.preguntas?.map((p, idx) => (
                          <li key={p.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-500 uppercase">
                                Pregunta {idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                {p.tipo === 'opcion_multiple' ? 'Opción múltiple' : p.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Respuesta corta'} • {p.puntos || 1} pt{(p.puntos || 1) > 1 ? 's' : ''}
                              </span>
                            </div>

                            <div className="text-sm font-semibold text-slate-900 leading-relaxed mb-3">
                              <MathText text={p.enunciado || ''} />
                            </div>

                            {p.tipo === 'opcion_multiple' && (
                              <ul className="grid gap-2">
                                {p.opciones?.map((o) => (
                                  <li key={o.id} className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-normal ${o.es_correcta ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
                                    {o.es_correcta ? (
                                      <div className="size-5 rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-500">
                                        <CheckCircle2 className="size-4 text-white" />
                                      </div>
                                    ) : (
                                      <div className="size-5 rounded-full flex-shrink-0 border-2 border-slate-300" />
                                    )}
                                    <MathText text={o.texto || '—'} />
                                  </li>
                                ))}
                              </ul>
                            )}

                            {p.tipo === 'verdadero_falso' && (
                              <div className="flex gap-3">
                                {['Verdadero', 'Falso'].map(val => {
                                  const isCorrect = p.opciones?.find(x => x.es_correcta)?.texto === val;
                                  return (
                                    <div key={val} className={`flex-1 rounded-lg border p-3 text-center text-sm font-semibold ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                                      {val} {isCorrect && '✓'}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {p.tipo === 'respuesta_corta' && (
                              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">Respuesta correcta</span>
                                <div className="text-sm font-medium text-indigo-800">
                                  <MathText text={p.opciones?.find(x => x.es_correcta)?.texto || '—'} />
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>


              </div>
            </div>,
            document.body
          )
        }

        {/* Resultados modal */}
        {
          resultsOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
            </div>,
            document.body
          )
        }

        {/* Review modal - Usando componente reutilizable */}
        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          tipo="quiz"
          idEvaluacion={resultsQuizMeta?.id}
          estudiante={reviewHeader.estudiante ? {
            id: reviewHeader.estudiante.id,
            nombre: reviewHeader.estudiante.nombre,
            totalIntentos: reviewHeader.estudiante.totalIntentos
          } : null}
          titulo={reviewHeader.quiz?.titulo}
        />
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
                    count: iaQuestions.length,
                    willRedirect: true
                  });
                  // ✅ Volver a redirigir al editor, sin flags “temporales”.
                  setTimeout(() => {
                    navigate(
                      `/asesor/quizt/builder?id=${encodeURIComponent(created.id)}`,
                      { state: { quizId: created.id, areaId: currentAreaId, areaTitle: currentAreaTitle } }
                    );
                  }, 1200);
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

        {/* ✅ Modal de edición (igual que en simuladores) */}
        <SimulatorModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditing(null); }}
          onUpdate={handleUpdate}
          mode={editing ? 'edit' : 'create'}
          initialForm={editing ? (() => {
            const formData = {
              titulo: editing.titulo || editing.nombre || editing.name || '',
              nombre: editing.nombre || editing.titulo || editing.name || '',
              instrucciones: editing.instrucciones || editing.descripcion || '',
              descripcion: editing.descripcion || editing.instrucciones || '',
              fechaLimite: editing.fechaLimite || editing.fecha_limite || '',
              publico: editing.publico ?? (editing.status === 'Publicado'),
              horas: editing.horas ?? 0,
              minutos: editing.minutos ?? 0,
              intentosMode: editing.intentosMode || 'unlimited',
              maxIntentos: editing.maxIntentos ?? 3,
              grupos: Array.isArray(editing.grupos) ? editing.grupos : (editing.grupos ? [editing.grupos] : []),
              areaId: editing.areaId !== undefined ? editing.areaId : null,
              areaTitle: editing.areaTitle || areaTitle || null
            };
            return formData;
          })() : null}
          onEditQuestions={editing ? () => {
            // Navegar al builder después de guardar
            const finalIdArea = editing.areaId !== undefined && editing.areaId !== null ? Number(editing.areaId) : (selectedAreaId || null);
            const navState = finalIdArea ? {
              quizId: editing.id,
              areaId: finalIdArea,
              areaTitle: editing.areaTitle || areaTitle
            } : { quizId: editing.id };
            navigate(`/asesor/quizt/builder?id=${editing.id}`, { state: navState });
          } : null}
        />

        {/* Modal de éxito */}
        {
          successModal.open && (
            <SuccessModal
              message={successModal.message}
              count={successModal.count}
              willRedirect={successModal.willRedirect}
              onClose={() => setSuccessModal(prev => ({ ...prev, open: false }))}
            />
          )
        }

        {/* Modal de confirmación genérico */}
        {
          confirmModal.open && (
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
          )
        }
      </div>
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
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
    </div>,
    document.body
  );
}

// Componente de modal de éxito estético
function SuccessModal({ message, count = 0, willRedirect = false, onClose }) {
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
            {willRedirect ? (
              <p className="text-sm text-slate-600">
                Serás redirigido al editor en unos momentos...
              </p>
            ) : count > 0 ? (
              <p className="text-sm text-slate-600">
                Puedes editarlo haciendo clic en el botón "Editar" en la lista.
              </p>
            ) : null}
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
