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
import { generarPreguntasIA, getCooldownRemainingMs } from "../../service/simuladoresAI";
import { logInfo, logError, logDebug } from "../../utils/logger";
import { listQuizzes, deleteQuiz as apiDeleteQuiz, getQuizFull, getQuizEstudiantesEstado, getQuizIntentoReview, updateQuiz } from "../../api/quizzes";
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
  const [iaChoiceMode, setIaChoiceMode] = useState('general'); // 'general' | 'temas'
  const [iaChoiceTopics, setIaChoiceTopics] = useState(''); // coma-separado
  const [iaNivel, setIaNivel] = useState('intermedio'); // 'básico' | 'intermedio' | 'avanzado'
  const [iaError, setIaError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', count: 0 });
  // Distribución personalizada de tipos de preguntas
  const [iaCountMultiple, setIaCountMultiple] = useState(3);
  const [iaCountVerdaderoFalso, setIaCountVerdaderoFalso] = useState(1);
  const [iaCountCorta, setIaCountCorta] = useState(1);
  // Parámetros avanzados de configuración de IA
  const [iaShowAdvanced, setIaShowAdvanced] = useState(false);
  const [iaTemperature, setIaTemperature] = useState(0.6);
  const [iaTopP, setIaTopP] = useState('');
  const [iaTopK, setIaTopK] = useState('');
  const [iaMaxTokens, setIaMaxTokens] = useState('');
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

  // Cooldown ticker
  useEffect(() => {
    const tick = () => setCooldownMs(getCooldownRemainingMs());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Sincronizar distribución con iaQuickCount cuando se abre el modal
  useEffect(() => {
    if (iaChoiceOpen) {
      const currentTotal = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
      const quickTotal = iaQuickCount || 5;
      // Si el total actual no coincide con iaQuickCount y no es cero, ajustar proporcionalmente
      if (currentTotal !== quickTotal && quickTotal > 0) {
        if (currentTotal === 0) {
          // Si no hay distribución, crear una por defecto basada en iaQuickCount
          const multi = Math.ceil(quickTotal * 0.6);
          const tf = Math.floor(quickTotal * 0.2);
          const corta = Math.max(0, quickTotal - multi - tf);
          setIaCountMultiple(multi);
          setIaCountVerdaderoFalso(tf);
          setIaCountCorta(corta);
        } else {
          // Ajustar proporcionalmente manteniendo las proporciones actuales
          const ratio = quickTotal / currentTotal;
          const newMulti = Math.max(0, Math.round(iaCountMultiple * ratio));
          const newTf = Math.max(0, Math.round(iaCountVerdaderoFalso * ratio));
          const newCorta = Math.max(0, Math.round(iaCountCorta * ratio));
          const newTotal = newMulti + newTf + newCorta;
          const diff = quickTotal - newTotal;
          // Ajustar la diferencia en opción múltiple para mantener el total exacto
          setIaCountMultiple(newMulti + diff);
          setIaCountVerdaderoFalso(newTf);
          setIaCountCorta(newCorta);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iaChoiceOpen]);

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

  const crearQuizRapidoIA = async () => {
    if (iaLoading) return;
    // Si no hay área seleccionada, exigir tema manual; si hay área, el tema puede omitirse
    if (!selectedAreaId && !iaTopic.trim()) { alert('Escribe un tema para generar con IA'); return; }
    // Calcular cantidad total desde distribución personalizada
    const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
    if (cantidad > MAX_IA) {
      alert(`Máximo ${MAX_IA} preguntas por generación con IA.`);
      return;
    }
    if (cantidad < 1) {
      alert('Se requiere al menos 1 pregunta (configura la distribución)');
      return;
    }
    setIaLoading(true);
    try {
      const tema = iaTopic.trim() || areaTitle || 'Quiz';
      // Distribución personalizada
      const distribucion = {
        multi: iaCountMultiple,
        tf: iaCountVerdaderoFalso,
        short: iaCountCorta
      };
      // Preparar parámetros avanzados de IA
      const aiParams = {
        tema,
        cantidad,
        area: areaTitle,
        nivel: iaNivel || 'intermedio',
        distribucion,
        temperature: iaTemperature,
        ...(iaTopP !== '' && { topP: Number(iaTopP) }),
        ...(iaTopK !== '' && { topK: Number(iaTopK) }),
        ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
      };
      const preguntasIA = await generarPreguntasIA(aiParams);
      // Mapear preguntas IA -> contrato de createQuiz
      const preguntas = preguntasIA.map((q) => {
        if (q.type === 'multi') {
          // Asegurar 4 opciones y una correcta
          let options = (q.options || []).map(o => ({ text: o.text || '', correct: !!o.correct }));
          if (options.length > 4) options = options.slice(0, 4);
          while (options.length < 4) options.push({ text: `Opción ${options.length + 1}`, correct: false });
          const idxC = options.findIndex(o => o.correct);
          if (idxC === -1) options[0].correct = true; else options = options.map((o, j) => ({ ...o, correct: j === idxC }));
          return { type: 'multiple', text: q.text, points: Number(q.points || 1), options };
        }
        if (q.type === 'tf') {
          return { type: 'tf', text: q.text, points: Number(q.points || 1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        return { type: 'short', text: q.text, points: Number(q.points || 1), answer: String(q.answer || '') };
      });
      // Guardar preguntas y abrir modal prellenado (no crear aún)
      setIaQuestions(preguntas);
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas)`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. Responde con calma y confirma tu elección antes de avanzar.`;
      // Preservar configuración previa si existe, sino usar valores por defecto
      setIaDraft({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: iaDraft?.fechaLimite || '',
        publico: iaDraft?.publico ?? false,
        horas: iaDraft?.horas ?? 0,
        minutos: iaDraft?.minutos ?? 0,
        intentosMode: iaDraft?.intentosMode || 'unlimited',
        maxIntentos: iaDraft?.maxIntentos ?? 3,
        grupos: iaDraft?.grupos || [], // Preservar grupos seleccionados
        // Preservar también areaTitle y selectedAreaId
        areaTitle: areaTitle,
        selectedAreaId: selectedAreaId,
      });
      setOpen(true);
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        alert('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
        setCooldownMs(getCooldownRemainingMs());
      } else if (e?.code === 'COOLDOWN') {
        const secs = Math.ceil((e?.remainingMs || getCooldownRemainingMs()) / 1000);
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
    setIaError('');
    // Validaciones mejoradas
    if (modo === 'temas') {
      const temasList = String(temasText || '').split(',').map(s => s.trim()).filter(Boolean);
      if (temasList.length === 0) {
        setIaError('Ingresa al menos un tema separado por comas (ej: sinónimos, ortografía, lectura)');
        return;
      }
    }
    // Calcular cantidad total desde distribución personalizada
    const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
    if (cantidad > MAX_IA) {
      setIaError(`Máximo ${MAX_IA} preguntas por generación con IA`);
      return;
    }
    if (cantidad < 1) {
      setIaError('Se requiere al menos 1 pregunta (configura la distribución)');
      return;
    }
    if (iaCountMultiple < 0 || iaCountVerdaderoFalso < 0 || iaCountCorta < 0) {
      setIaError('Las cantidades no pueden ser negativas');
      return;
    }
    setIaLoading(true);
    setIaError('');
    try {
      const tema = iaTopic.trim() || areaTitle || 'Quiz';
      // Distribución personalizada
      const distribucion = {
        multi: iaCountMultiple,
        tf: iaCountVerdaderoFalso,
        short: iaCountCorta
      };
      const opts = {
        tema,
        cantidad,
        area: areaTitle || undefined,
        nivel: iaNivel || 'intermedio',
        distribucion,
        temperature: iaTemperature,
        ...(iaTopP !== '' && { topP: Number(iaTopP) }),
        ...(iaTopK !== '' && { topK: Number(iaTopK) }),
        ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
      };
      const temasList = String(temasText || '').split(',').map(s => s.trim()).filter(Boolean);
      if (modo === 'temas' && temasList.length) { opts.modo = 'temas'; opts.temas = temasList; } else { opts.modo = 'general'; }
      const preguntasIA = await generarPreguntasIA(opts);
      // Mapear preguntas IA -> contrato de createQuiz
      const preguntas = preguntasIA.map((q) => {
        if (q.type === 'multi') {
          // Asegurar 4 opciones y una correcta
          let options = (q.options || []).map(o => ({ text: o.text || '', correct: !!o.correct }));
          if (options.length > 4) options = options.slice(0, 4);
          while (options.length < 4) options.push({ text: `Opción ${options.length + 1}`, correct: false });
          const idxC = options.findIndex(o => o.correct);
          if (idxC === -1) options[0].correct = true; else options = options.map((o, j) => ({ ...o, correct: j === idxC }));
          return { type: 'multiple', text: q.text, points: Number(q.points || 1), options };
        }
        if (q.type === 'tf') {
          return { type: 'tf', text: q.text, points: Number(q.points || 1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        return { type: 'short', text: q.text, points: Number(q.points || 1), answer: String(q.answer || '') };
      });
      setIaQuestions(preguntas);
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas${opts.modo === 'temas' ? ' · por temas' : ''})`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. ${opts.modo === 'temas' ? 'Este quiz incluye preguntas por temas específicos.' : 'Este quiz cubre contenido general del área.'}`;
      // Preservar configuración previa si existe, sino usar valores por defecto
      setIaDraft({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: iaDraft?.fechaLimite || '',
        publico: iaDraft?.publico ?? false,
        horas: iaDraft?.horas ?? 0,
        minutos: iaDraft?.minutos ?? 0,
        intentosMode: iaDraft?.intentosMode || 'unlimited',
        maxIntentos: iaDraft?.maxIntentos ?? 3,
        grupos: iaDraft?.grupos || [], // Preservar grupos seleccionados
        // Preservar también areaTitle y selectedAreaId
        areaTitle: areaTitle,
        selectedAreaId: selectedAreaId,
      });
      // Cerrar modal de IA y abrir modal de creación
      setIaChoiceOpen(false);
      setIaError('');
      setOpen(true);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      if (e?.code === 'RATE_LIMIT' || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('límite de solicitudes')) {
        const secs = Math.ceil((e?.remainingMs || rem || 60000) / 1000);
        setIaError(`Se alcanzó el límite de solicitudes a la API de Google. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente. Esto ayuda a evitar límites de la API.`);
        setCooldownMs(e?.remainingMs || rem || 60000);
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento') || msg.includes('cooldown')) {
        const secs = Math.ceil((e?.remainingMs || rem || 60000) / 1000);
        setIaError(`Debes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA.`);
        setCooldownMs(e?.remainingMs || rem || 60000);
      } else {
        setIaError(e?.response?.data?.message || e?.message || 'No se pudieron generar las preguntas con IA. Por favor, intenta de nuevo.');
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

      {/* Modal: elección de IA (completo como en SimuladoresGen) */}
      {iaChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={() => { setIaChoiceOpen(false); setIaError(''); }} />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-indigo-50 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 p-1.5 shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Generar con IA</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Configuración personalizada. Puedes editarlo después.</p>
                </div>
                <button
                  onClick={() => { setIaChoiceOpen(false); setIaError(''); }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Opciones de modo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tipo de generación</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setIaChoiceMode('general'); setIaError(''); }}
                    className={["relative text-left rounded-lg border-2 p-2.5 transition-all",
                      iaChoiceMode === 'general'
                        ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    ].join(' ')}
                  >
                    {iaChoiceMode === 'general' && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="text-sm font-semibold text-slate-800 mb-0.5">General del área</div>
                    <div className="text-xs text-slate-600 leading-snug">
                      Preguntas variadas de "{areaTitle || 'esta área'}". Ideal para conocimientos generales.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIaChoiceMode('temas'); setIaError(''); }}
                    className={["relative text-left rounded-lg border-2 p-2.5 transition-all",
                      iaChoiceMode === 'temas'
                        ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    ].join(' ')}
                  >
                    {iaChoiceMode === 'temas' && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="text-sm font-semibold text-slate-800 mb-0.5">Por temas específicos</div>
                    <div className="text-xs text-slate-600 leading-snug">
                      Enfocado en temas concretos. Ej: "sinónimos, ortografía". Distribución equitativa.
                    </div>
                  </button>
                </div>
              </div>

              {/* Input de temas (solo si modo = temas) */}
              {iaChoiceMode === 'temas' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Temas específicos <span className="text-rose-500">*</span>
                    </label>
                    {iaChoiceTopics && (
                      <span className="text-[10px] text-slate-500">
                        {iaChoiceTopics.split(',').filter(t => t.trim()).length} tema{iaChoiceTopics.split(',').filter(t => t.trim()).length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      value={iaChoiceTopics}
                      onChange={e => {
                        const value = e.target.value;
                        // Limpiar duplicados automáticamente
                        const temas = value.split(',').map(s => s.trim()).filter(Boolean);
                        const unique = [...new Set(temas)];
                        setIaChoiceTopics(unique.join(', '));
                        setIaError('');
                      }}
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors"
                      placeholder="Ej: sinónimos, ortografía, lectura"
                    />
                    {iaChoiceTopics && (
                      <button
                        type="button"
                        onClick={() => setIaChoiceTopics('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title="Limpiar"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {temasPlantillas.slice(0, 3).map((tema, idx) => {
                        const current = iaChoiceTopics.split(',').map(s => s.trim()).filter(Boolean);
                        const isAdded = current.includes(tema);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!isAdded) {
                                setIaChoiceTopics([...current, tema].join(', '));
                                setIaError('');
                              } else {
                                setIaChoiceTopics(current.filter(t => t !== tema).join(', '));
                              }
                            }}
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                              isAdded
                                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                            ].join(' ')}
                          >
                            {isAdded ? '✓' : '+'} {tema}
                          </button>
                        );
                      })}
                    </div>
                    {iaChoiceTopics && (
                      <button
                        type="button"
                        onClick={() => setIaChoiceTopics('')}
                        className="text-[10px] text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Separa con comas. Mínimo 1, máximo 5 recomendado.
                  </p>
                </div>
              )}

              {/* Selector de nivel */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nivel de dificultad</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'básico', label: 'Básico', desc: 'Conceptos fundamentales' },
                    { value: 'intermedio', label: 'Intermedio', desc: 'Aplicación' },
                    { value: 'avanzado', label: 'Avanzado', desc: 'Análisis' }
                  ].map((nivel) => {
                    const isSelected = iaNivel === nivel.value;
                    return (
                      <button
                        key={nivel.value}
                        type="button"
                        onClick={() => setIaNivel(nivel.value)}
                        className={[
                          "text-left rounded-lg border-2 p-2 transition-all",
                          isSelected
                            ? nivel.value === 'básico'
                              ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                              : nivel.value === 'intermedio'
                                ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                                : 'border-purple-400 bg-purple-50 ring-1 ring-purple-200'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        ].join(' ')}
                      >
                        <div className="text-xs font-semibold text-slate-800">{nivel.label}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{nivel.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de cantidad total (opcional, para ajustar automáticamente) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cantidad total de preguntas (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={iaQuickCount}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      // Distribuir automáticamente si el total es diferente
                      const currentTotal = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                      if (total !== currentTotal && total > 0) {
                        // Distribuir proporcionalmente
                        const ratio = total / (currentTotal || 5);
                        setIaCountMultiple(Math.max(0, Math.round(iaCountMultiple * ratio)));
                        setIaCountVerdaderoFalso(Math.max(0, Math.round(iaCountVerdaderoFalso * ratio)));
                        setIaCountCorta(Math.max(0, Math.round(iaCountCorta * ratio)));
                        // Ajustar si hay diferencia por redondeo
                        const newTotal = Math.round(iaCountMultiple * ratio) + Math.round(iaCountVerdaderoFalso * ratio) + Math.round(iaCountCorta * ratio);
                        if (newTotal !== total) {
                          const diff = total - newTotal;
                          if (diff > 0) setIaCountMultiple(prev => prev + diff);
                          else if (diff < 0) setIaCountMultiple(prev => Math.max(0, prev + diff));
                        }
                      }
                      setIaQuickCount(total);
                      setIaError('');
                    }}
                    className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  >
                    {COUNT_OPTIONS.map(n => (
                      <option key={n} value={n}>{n} preguntas</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500">
                    (Se ajustará automáticamente la distribución)
                  </span>
                </div>
              </div>

              {/* Distribución de tipos de preguntas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Distribución de preguntas <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* Opción múltiple */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 w-32 flex-shrink-0">Opción múltiple:</label>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => setIaCountMultiple(Math.max(0, iaCountMultiple - 1))}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={iaCountMultiple <= 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={MAX_IA}
                        value={iaCountMultiple}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                          setIaCountMultiple(val);
                          setIaError('');
                        }}
                        className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                          if (total < MAX_IA) setIaCountMultiple(Math.min(MAX_IA, iaCountMultiple + 1));
                        }}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-500">preguntas</span>
                    </div>
                  </div>

                  {/* Verdadero/Falso */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 w-32 flex-shrink-0">Verdadero/Falso:</label>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => setIaCountVerdaderoFalso(Math.max(0, iaCountVerdaderoFalso - 1))}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={iaCountVerdaderoFalso <= 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={MAX_IA}
                        value={iaCountVerdaderoFalso}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                          setIaCountVerdaderoFalso(val);
                          setIaError('');
                        }}
                        className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                          if (total < MAX_IA) setIaCountVerdaderoFalso(Math.min(MAX_IA, iaCountVerdaderoFalso + 1));
                        }}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-500">preguntas</span>
                    </div>
                  </div>

                  {/* Respuesta corta */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 w-32 flex-shrink-0">Respuesta corta:</label>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => setIaCountCorta(Math.max(0, iaCountCorta - 1))}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={iaCountCorta <= 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={MAX_IA}
                        value={iaCountCorta}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                          setIaCountCorta(val);
                          setIaError('');
                        }}
                        className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                          if (total < MAX_IA) setIaCountCorta(Math.min(MAX_IA, iaCountCorta + 1));
                        }}
                        className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                        disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-500">preguntas</span>
                    </div>
                  </div>

                  {/* Resumen total */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Total:</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parámetros avanzados de configuración de IA */}
              <div>
                <button
                  type="button"
                  onClick={() => setIaShowAdvanced(!iaShowAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <span>⚙️ Parámetros avanzados de IA</span>
                  <span className="text-slate-500">{iaShowAdvanced ? '▼' : '▶'}</span>
                </button>

                {iaShowAdvanced && (
                  <div className="mt-3 p-3 rounded-lg border-2 border-slate-200 bg-slate-50 space-y-3">
                    {/* Temperature */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Temperature <span className="text-slate-500 font-normal">(0.0 - 1.0)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={iaTemperature}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(1, Number(e.target.value) || 0.6));
                            setIaTemperature(val);
                          }}
                          className="flex-1 rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                        />
                        <span className="text-[10px] text-slate-500 w-32">
                          {iaTemperature < 0.3 ? 'Muy determinista' : iaTemperature < 0.7 ? 'Balanceado' : 'Más creativo'}
                        </span>
                      </div>
                    </div>

                    {/* Top-P */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Top-P <span className="text-slate-500 font-normal">(0.0 - 1.0, opcional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={iaTopP}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Math.min(1, Number(e.target.value) || 0));
                          setIaTopP(val === '' ? '' : String(val));
                        }}
                        placeholder="Auto (no configurado)"
                        className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Controla diversidad de tokens. Déjalo vacío para usar el valor por defecto.</p>
                    </div>

                    {/* Top-K */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Top-K <span className="text-slate-500 font-normal">(entero, opcional)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={iaTopK}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value) || 1);
                          setIaTopK(val === '' ? '' : String(val));
                        }}
                        placeholder="Auto (no configurado)"
                        className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Limita tokens candidatos. Déjalo vacío para usar el valor por defecto.</p>
                    </div>

                    {/* Max Output Tokens */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Max Output Tokens <span className="text-slate-500 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={iaMaxTokens}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(100, Number(e.target.value) || 1200);
                          setIaMaxTokens(val === '' ? '' : String(val));
                        }}
                        placeholder="Auto (calculado según cantidad)"
                        className="w-full rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Máximo de tokens en la respuesta. Se calcula automáticamente si no se especifica.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensaje de error */}
              {iaError && (
                <div className="rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-2 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 flex-1 leading-relaxed">{iaError}</p>
                </div>
              )}

              {/* Resumen de configuración */}
              {showSummary && (
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-semibold text-emerald-900">Resumen de configuración</span>
                    <button
                      type="button"
                      onClick={() => setShowSummary(false)}
                      className="text-emerald-600 hover:text-emerald-800 text-[10px]"
                    >
                      Ocultar
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] text-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Modo:</span>
                      <span>{iaChoiceMode === 'general' ? 'General del área' : 'Por temas específicos'}</span>
                    </div>
                    {iaChoiceMode === 'temas' && iaChoiceTopics && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Temas:</span>
                        <span className="flex-1">{iaChoiceTopics}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nivel:</span>
                      <span className="capitalize">{iaNivel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cantidad:</span>
                      <span>{iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''} ({iaCountMultiple} múltiple, {iaCountVerdaderoFalso} V/F, {iaCountCorta} corta)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Área:</span>
                      <span>{areaTitle || 'No especificada'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed flex-1">
                    <strong className="text-slate-700">Nota:</strong> Puedes editar las preguntas después. Proceso: 10-30 segundos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSummary(!showSummary)}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                  >
                    {showSummary ? 'Ocultar' : 'Ver'} resumen
                  </button>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 bg-slate-50">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                {cooldownMs > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Espera {Math.ceil(cooldownMs / 1000)}s
                  </span>
                )}
                {!iaLoading && !cooldownMs && (
                  <span className="text-slate-400">
                    Tiempo estimado: {(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 10 ? '10-15s' : (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 30 ? '15-25s' : '25-35s'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIaChoiceOpen(false); setIaError(''); setShowSummary(false); }}
                  disabled={iaLoading}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await crearQuizConIAOpciones({ modo: iaChoiceMode, temasText: iaChoiceTopics });
                  }}
                  disabled={iaLoading || cooldownMs > 0 || (iaChoiceMode === 'temas' && !iaChoiceTopics.trim()) || (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) < 1}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {iaLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generando {iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s` : 'Generar'}
                    </>
                  )}
                </button>
              </div>
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
              {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s` : 'Genera con IA'}
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto lg:overflow-x-visible">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 w-[22rem]"
                  >
                    Quizt
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600 w-[8rem]"
                  >
                    Preguntas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600 w-[9rem]"
                  >
                    Intentos
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600 w-[8rem]"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 w-[9rem]"
                  >
                    Actualizado
                  </th>
                  <th scope="col" className="px-6 py-4 w-[12rem]"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading && data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="bg-white hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-6 py-4 w-[22rem]">
                      <div className="truncate font-semibold text-slate-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 whitespace-nowrap font-medium">
                      {item.questions}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 whitespace-nowrap">
                      {item.total_intentos_global != null ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {item.total_intentos_global} / {item.attempts === '∞' ? '∞' : item.attempts}
                        </span>
                      ) : (
                        <span className="text-slate-500">{item.attempts}</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {item.status === "Publicado" ? (
                        <Badge type="success">Publicado</Badge>
                      ) : (
                        <Badge type="draft">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                      {item.updatedAt}
                    </td>
                    <td className="px-6 py-4 w-[12rem]">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(item)}
                          title="Vista previa"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResultados(item)}
                          title="Resultados"
                          className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          %
                        </button>
                        {item.status === "Borrador" && (
                          <button
                            onClick={() => handlePublish(item)}
                            title="Publicar"
                            className="rounded-lg p-2 text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <UploadCloud className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Editar"
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors"
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
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${(Number(r.oficial_puntaje || 0) >= 70)
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
                          <div className="text-sm font-medium text-slate-900">{p.orden || (idx + 1)}. {p.enunciado}</div>
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
