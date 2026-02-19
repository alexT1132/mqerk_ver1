import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Sparkles,
  Search,
  ListFilter,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  X,
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  UploadCloud,
  Layers,
  GraduationCap,
  Atom,
  Users,
  Feather,
  Dna,
  Cpu,
  TrendingUp,
  Trophy,
  Sprout,
  Map,
  Landmark,
  Ship,
  BrainCircuit,
  FileQuestion,
  ChevronLeft,
  FileText,
  Activity
} from "lucide-react";

import SimuladorModalGen from "./SimulatorModal";
import ReviewModal from "./ReviewModal";
import { generarPreguntasIA, getCooldownRemainingMs } from "../../service/simuladoresAI";
import { listSimulaciones, deleteSimulacion, createSimulacion, updateSimulacion, getSimulacion, getSimulacionFull, estudiantesEstadoSimulacion, getSimulacionIntentoReview } from "../../api/simulaciones";
import { buildStaticUrl } from "../../utils/url.js";
import InlineMath from "./simGen/InlineMath.jsx";


/* ------------------- helpers ------------------- */

// Componente para renderizar texto con fórmulas LaTeX
function MathText({ text = "" }) {
  if (!text) return null;

  // ✅ Función para sanitizar HTML
  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br', 'pre', 'code', 'div', 'span'];
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
      while (n.firstChild) parent.insertBefore(n.firstChild, n);
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  // ✅ Procesador de Markdown simple
  const processMarkdown = (txt) => {
    if (!txt) return '';
    let processed = txt;

    // Bloques de código (triple backtick)
    processed = processed.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-slate-800 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 shadow-sm border border-slate-700"><div class="opacity-50 text-[10px] uppercase mb-1 border-b border-slate-600 pb-1">${lang || 'code'}</div><code>${code}</code></pre>`;
    });

    // Código en línea (backtick simple)
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-violet-50 px-1.5 py-0.5 rounded-md font-mono text-sm text-violet-700 border border-violet-100 font-semibold">$1</code>');

    // Negrita
    processed = processed.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

    return processed;
  };

  const getParts = (txt) => {
    const ranges = [];
    let i = 0;

    // 1. Detectar rangos explícitos ($...$)
    while (i < txt.length) {
      const char = txt[i];
      if (char === '\\') { i += 2; continue; }
      if (char === '$') {
        const start = i;
        const isBlock = (i + 1 < txt.length && txt[i + 1] === '$');
        const delimiter = isBlock ? '$$' : '$';
        i += delimiter.length;
        let content = '';
        let closed = false;
        while (i < txt.length) {
          const c = txt[i];
          if (c === '\\') { content += c + (txt[i + 1] || ''); i += 2; continue; }
          if (c === '$') {
            if (isBlock) { if (i + 1 < txt.length && txt[i + 1] === '$') closed = true; }
            else { closed = true; }
            if (closed) break;
          }
          content += c;
          i++;
        }
        if (closed) {
          const fullMatch = txt.substring(start, i + delimiter.length);
          let isValid = true;
          if (!isBlock) {
            const trimmed = content.trim();
            if (/^\d+/.test(trimmed) && /[a-zA-Z]{2,}/.test(trimmed) && !/[=\+\-\^_{}\\]/.test(trimmed)) isValid = false;
          }

          if (isValid) {
            ranges.push({ start, end: i + delimiter.length, content, fullMatch, isBlock });
            i += delimiter.length;
            continue;
          }
        }
      }
      i++;
    }

    // 2. Detectar implícitos (x^2, \int, f(x)=)
    const implicitRe = /(?:[a-zA-Z_]\w*\^\{?[a-zA-Z0-9\-\+\.]+\}?)|(?:\\[a-zA-Z]+)|(?:\b[fgh]\w*\([\w,]+\)\s*=)/g;
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
    let currentIdx = 0;
    const implicitRanges = [];

    const findInSegment = (seg, offset) => {
      let m;
      while ((m = implicitRe.exec(seg)) !== null) {
        if (m.index > 0 && seg[m.index - 1] === ':') continue;
        implicitRanges.push({ start: offset + m.index, end: offset + m.index + m[0].length, content: m[0], fullMatch: m[0], isBlock: false, isImplicit: true });
      }
    }

    for (const r of sortedRanges) {
      if (r.start > currentIdx) findInSegment(txt.substring(currentIdx, r.start), currentIdx);
      currentIdx = r.end;
    }
    if (currentIdx < txt.length) findInSegment(txt.substring(currentIdx), currentIdx);

    const allRanges = [...ranges, ...implicitRanges].sort((a, b) => a.start - b.start);

    // 3. Construir partes
    const parts = [];
    let cursor = 0;
    for (const r of allRanges) {
      if (r.start > cursor) {
        parts.push({ type: 'text', content: processMarkdown(txt.substring(cursor, r.start)) });
      }
      parts.push({ type: 'math', content: r.content, full: r.fullMatch, start: r.start, end: r.end, isBlock: r.isBlock });
      cursor = r.end;
    }
    if (cursor < txt.length) {
      parts.push({ type: 'text', content: processMarkdown(txt.substring(cursor)) });
    }
    return parts;
  };

  const parts = getParts(text);

  return (
    <span className="block w-full break-words overflow-x-auto whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <InlineMath key={`math-${idx}`} math={part.content} display={part.isBlock} />
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

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm",
    draft: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 ring-2 ring-amber-200 shadow-sm",
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

/* --- SectionBadge: Réplica exacta del header de ModulosEspecificos.jsx --- */
function SectionBadge({ title, subtitle, onBack, total, icon: IconProp }) {
  return (
    <div className="relative mx-auto max-w-8xl overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-6 sm:p-8 shadow-xl ring-2 ring-slate-100/50 mb-8">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative z-10 flex items-center gap-5">
        {/* Botón Volver Sutil */}
        <button
          onClick={onBack}
          className="group/back flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/30 backdrop-blur-md text-violet-700 hover:bg-white hover:border-white transition-all duration-200 shadow-sm active:scale-90"
          aria-label="Volver"
        >
          <ChevronLeft className="size-6 transition-transform group-hover/back:-translate-x-0.5" strokeWidth={3} />
        </button>

        {/* ícono */}
        <div className="relative hidden xs:grid size-16 sm:size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-white/50">
          <IconProp className="size-8 sm:size-10 text-white" />
          <div className="absolute -top-1 -right-1 inline-grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-white shadow-md">
            <span className="text-[10px] font-bold">★</span>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 uppercase">
            {title || "Módulos específicos"}
          </h2>
          <div className="mt-2 flex gap-2">
            <span className="h-1.5 w-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
            <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
          </div>
        </div>

        {/* Contador de Módulos (Réplica estilo Actividades con badge sutil) */}
        {total > 0 && (
          <div className="hidden md:flex ml-auto items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md px-5 py-3 border border-white/50 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white shadow-lg ring-2 ring-white/50">
              <Activity className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-800 leading-none">{total}</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Simuladores</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Tarjeta compacta para móvil */
function MobileRow({ item, onView, onEdit, onDelete, onPublish, onResultados }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
          {item.instrucciones && item.instrucciones.trim() && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {item.instrucciones}
            </p>
          )}
          <p className="text-sm text-slate-500 mt-1">{item.type}</p>
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
          <dd className="font-semibold text-slate-900">{item.attempts}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Actualizado</dt>
          <dd className="font-semibold text-slate-900">{item.updatedAt}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Vista previa
        </button>
        <button
          onClick={() => onResultados(item)}
          className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-all active:scale-95"
        >
          <Trophy className="mr-2 h-4 w-4 text-amber-500" />
          Resultados
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

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirmar', cancelText = 'Cancelar', loading = false }) {
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

export default function SimuladoresAdmin({ Icon = PlaySquare, title = "SIMULACIONES GENERALES", areaId = null, areaTitle = null }) {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  // UI filtros
  const [statusFilter, setStatusFilter] = useState('all'); // all | Publicado | Borrador
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // item being edited
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
  const MAX_IA = Number(import.meta.env?.VITE_AI_MAX_QUESTIONS || 50);
  // Tema para la vista General (sin área)
  const [generalTopic, setGeneralTopic] = useState("");
  // Cooldown restante para IA (ms)
  const [cooldownMs, setCooldownMs] = useState(0);
  // El tiempo se ajusta luego en el builder; aquí usamos default 10 min
  // Estado temporal cuando se usa flujo IA -> prellenar modal y adjuntar preguntas
  const [iaPrefill, setIaPrefill] = useState(null);
  const [iaPreguntas, setIaPreguntas] = useState(null);
  // Modal de elección IA (general vs por temas)
  const [iaChoiceOpen, setIaChoiceOpen] = useState(false);
  const [iaChoiceMode, setIaChoiceMode] = useState('general'); // 'general' | 'temas'
  const [iaChoiceTopics, setIaChoiceTopics] = useState(''); // coma-separado
  const [iaNivel, setIaNivel] = useState('intermedio'); // 'básico' | 'intermedio' | 'avanzado'
  const [iaIdioma, setIaIdioma] = useState('auto'); // auto | es | en | mix
  const [iaError, setIaError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', count: 0, willRedirect: false });
  // Distribución personalizada de tipos de preguntas
  const [iaCountMultiple, setIaCountMultiple] = useState(3);
  const [iaCountVerdaderoFalso, setIaCountVerdaderoFalso] = useState(1);
  const [iaCountCorta, setIaCountCorta] = useState(1);
  // Cantidad rápida de preguntas para modo específico (con área)
  const [iaQuickCount, setIaQuickCount] = useState(5);
  const COUNT_OPTIONS = [3, 5, 10, 15, 20, 25, 30];
  // Parámetros avanzados de configuración de IA
  const [iaShowAdvanced, setIaShowAdvanced] = useState(false);
  const [iaTemperature, setIaTemperature] = useState(0.6);
  const [iaTopP, setIaTopP] = useState('');
  const [iaTopK, setIaTopK] = useState('');
  const [iaMaxTokens, setIaMaxTokens] = useState('');

  // Vista previa
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSim, setPreviewSim] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsRows, setResultsRows] = useState([]);
  const [resultsSimMeta, setResultsSimMeta] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewHeader, setReviewHeader] = useState({ simulacion: null, estudiante: null });
  const [selectedIntentoReview, setSelectedIntentoReview] = useState(1); // Intentar oficial por defecto



  const navigate = useNavigate();
  const headerTitle = useMemo(() => {
    if (areaId) {
      const name = areaTitle || 'SIMULADORES ESPECÍFICOS';
      return typeof name === 'string' ? name : 'SIMULADORES ESPECÍFICOS';
    }
    return title;
  }, [areaId, areaTitle, title]);

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

  // Cargar simulaciones desde backend
  const [debugInfo, setDebugInfo] = useState(null);
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname); // Para detectar cuando se regresa del builder

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // ✅ IMPORTANTE: Para asesores, NO filtrar por fecha límite (visible)
      // Los asesores deben ver TODOS sus simuladores (tanto borradores como publicados, con o sin fecha límite)
      // Enviar visible: false para desactivar el filtro de fecha límite
      const baseParams = { visible: 'false' }; // Desactivar filtro de fecha límite para asesores
      // ✅ CRÍTICO: Para vista general (sin areaId), enviar id_area: 0 para que el backend filtre solo generales
      // Si no se envía id_area, el backend devuelve TODOS los simuladores (de todas las áreas)
      const params = areaId ? { ...baseParams, id_area: areaId } : { ...baseParams, id_area: 0 };

      const res = await listSimulaciones(params);
      let rows = res.data?.data || res.data || [];
      if (!Array.isArray(rows)) rows = [];
      // ✅ IMPORTANTE: NO hacer fallback sin filtro de área
      // Si estamos en vista general y no hay resultados, está bien (no hay simuladores generales)
      // Si estamos en área específica y no hay resultados, está bien (no hay simuladores en esa área)
      // El fallback anterior estaba cargando simuladores de otras áreas, lo cual es incorrecto

      // Solo intentar hidratar desde el último creado si realmente no hay resultados
      // y el último creado coincide con la vista actual
      if (rows.length === 0) {
        try {
          const lastIdRaw = localStorage.getItem('last_sim_id');
          const lastId = lastIdRaw ? Number(lastIdRaw) : null;
          if (lastId) {
            const r = await getSimulacion(lastId).catch(err => {
              // ✅ Si el simulador no existe (404), limpiar localStorage silenciosamente
              if (err?.response?.status === 404) {
                try { localStorage.removeItem('last_sim_id'); } catch { }
                if (process.env.NODE_ENV === 'development') {
                  console.log(`[SimuladoresGen] Simulador id=${lastId} no encontrado, limpiando localStorage`);
                }
              } else {
                console.error('[SimuladoresGen] Error al cargar simulador desde localStorage:', err);
              }
              return null;
            });
            const sim = r?.data?.data || r?.data || null;

            // ✅ CRÍTICO: Solo agregar si coincide con la vista actual
            if (sim) {
              const simIdArea = sim.id_area !== null && sim.id_area !== undefined ? Number(sim.id_area) : null;
              const isGeneralView = !areaId || areaId === null || areaId === undefined;
              const isGeneralSim = simIdArea === null || simIdArea === undefined || Number(simIdArea) === 0;

              // Solo agregar si:
              // - Estamos en vista general Y el simulador es general, O
              // - Estamos en área específica Y el simulador tiene ese id_area
              const coincide = (isGeneralView && isGeneralSim) ||
                (!isGeneralView && Number(areaId) === simIdArea);

              if (coincide) {
                rows = [sim];
                console.log('[SimuladoresGen] Hidratando desde localStorage (coincide con vista):', {
                  id: sim.id,
                  id_area: sim.id_area,
                  areaIdVista: areaId
                });
              } else {
                console.log('[SimuladoresGen] Último simulador no coincide con vista actual, no hidratando:', {
                  id: sim.id,
                  simIdArea,
                  areaIdVista: areaId,
                  isGeneralView,
                  isGeneralSim
                });
                // Limpiar localStorage si no coincide
                try { localStorage.removeItem('last_sim_id'); } catch { }
              }
            } else if (lastId) {
              // Si el simulador no existe, limpiar localStorage
              try { localStorage.removeItem('last_sim_id'); } catch { }
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[SimuladoresGen] Error al intentar cargar desde localStorage:', err);
          }
        }
      }

      // Filtro fuerte por área en cliente (si areaId -> solo de esa área; si no -> solo generales sin área)
      const filtered = Array.isArray(rows) ? rows.filter(r => {
        if (areaId) {
          // Para área específica: debe coincidir exactamente
          const rid = r?.id_area;
          const ridNum = rid !== null && rid !== undefined ? Number(rid) : null;
          const areaIdNum = Number(areaId);
          const matches = ridNum !== null && ridNum === areaIdNum;

          return matches;
        }
        // generales: id_area nulo / 0 / undefined / string "0"
        // ✅ CRÍTICO: Verificar explícitamente null, undefined, 0 numérico y string "0"
        const ridGeneral = r?.id_area;
        const isNull = ridGeneral === null;
        const isUndefined = ridGeneral === undefined;
        const isZero = Number(ridGeneral) === 0;
        const isStringZero = String(ridGeneral) === '0';
        const isGeneral = isNull || isUndefined || isZero || isStringZero;


        return isGeneral;
      }) : [];

      setDebugInfo({ fetched: filtered.length, raw: Array.isArray(rows) ? rows.length : -1 });

      const mapped = filtered.map(r => {
        // ✅ CRÍTICO: Usar múltiples fallbacks para el nombre/título
        const nombreFinal = r.titulo || r.nombre || r.name || `Simulador ${r.id}` || 'Sin título';

        // ✅ Verificar que el nombre no esté vacío
        if (!nombreFinal || nombreFinal.trim() === '') {
          console.warn('[SimuladoresGen] ⚠️ Simulador sin título/nombre:', {
            id: r.id,
            titulo: r.titulo,
            nombre: r.nombre,
            name: r.name,
            todosLosCampos: Object.keys(r || {})
          });
        }

        // ✅ CRÍTICO: Obtener instrucciones/descripción con múltiples fallbacks
        const instruccionesFinal = r.descripcion || r.instrucciones || r.instructions || '';

        // ✅ Log si no hay instrucciones para debugging
        if (!instruccionesFinal || instruccionesFinal.trim() === '') {
          console.warn('[SimuladoresGen] ⚠️ Simulador sin instrucciones/descripción:', {
            id: r.id,
            titulo: r.titulo,
            descripcion: r.descripcion,
            instrucciones: r.instrucciones,
            instructions: r.instructions,
            todosLosCampos: Object.keys(r || {})
          });
        }

        return {
          id: r.id,
          name: nombreFinal,
          instrucciones: instruccionesFinal,
          type: areaId ? (areaTitle || `Área ${r.id_area}`) : "General",
          questions: Number(r.total_preguntas || r.preguntas || 0),
          attempts: Number(r.total_intentos_global || r.intentos || 0),
          status: r.publico ? "Publicado" : "Borrador",
          updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString('es-MX') : ""
        };
      });

      setItems(mapped);
    } catch (e) { console.error(e); setError(e?.response?.data?.message || "No se pudieron cargar simulaciones"); }
    finally { setLoading(false); }
  }, [areaId, areaTitle]);

  // Bloquear scroll del body cuando hay modales abiertas
  useEffect(() => {
    if (previewOpen || resultsOpen || reviewOpen || confirmModal.open || open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewOpen, resultsOpen, reviewOpen, confirmModal.open, open]);
  // Evitar doble carga en modo Strict de React
  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    load();
  }, [areaId]);

  // ✅ Verificar y limpiar localStorage de simuladores eliminados al cargar
  useEffect(() => {
    const checkAndCleanLastSimId = async () => {
      try {
        const lastIdRaw = localStorage.getItem('last_sim_id');
        const lastId = lastIdRaw ? Number(lastIdRaw) : null;
        if (lastId) {
          // Verificar si el simulador existe
          try {
            const r = await getSimulacion(lastId);
            const sim = r?.data?.data || r?.data || null;
            // Si el simulador no existe, limpiar localStorage
            if (!sim) {
              localStorage.removeItem('last_sim_id');
              if (process.env.NODE_ENV === 'development') {
                console.log(`[SimuladoresGen] Limpiando last_sim_id (id=${lastId} no existe)`);
              }
            }
          } catch (err) {
            // Si hay un error 404, el simulador no existe, limpiar localStorage
            if (err?.response?.status === 404) {
              localStorage.removeItem('last_sim_id');
              if (process.env.NODE_ENV === 'development') {
                console.log(`[SimuladoresGen] Limpiando last_sim_id (id=${lastId} eliminado)`);
              }
            }
          }
        }
      } catch (err) {
        // Ignorar errores al verificar
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SimuladoresGen] Error al verificar last_sim_id:', err);
        }
      }
    };

    // Verificar solo una vez al montar el componente
    checkAndCleanLastSimId();
  }, []); // Solo ejecutar una vez al montar

  // Recargar cuando se regresa de editar (detectar cuando se navega desde el builder)
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathnameRef.current;

    // Si venimos del builder (ruta contiene 'builder') y ahora estamos en la lista de simuladores, recargar
    const wasInBuilder = prevPath && prevPath.includes('/builder');
    const isInSimList = (currentPath.includes('/simuladores/generales') ||
      currentPath.includes('/simuladores/modulo')) &&
      !currentPath.includes('/builder');

    if (wasInBuilder && isInSimList) {
      // Pequeño delay para asegurar que la navegación se completó
      const timer = setTimeout(() => {
        load();
      }, 300);
      return () => clearTimeout(timer);
    }

    prevPathnameRef.current = currentPath;
  }, [location.pathname, load]);

  // Inicializar y actualizar cooldown cada segundo
  useEffect(() => {
    const updateCd = () => {
      const remaining = getCooldownRemainingMs();
      setCooldownMs(remaining);
      // Limpiar el error cuando el cooldown termine
      if (remaining === 0 && iaError) {
        const errorMsg = iaError.toLowerCase();
        if (errorMsg.includes('límite de solicitudes') ||
          errorMsg.includes('espera') ||
          errorMsg.includes('cooldown') ||
          errorMsg.includes('demasiadas peticiones') ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('429') ||
          errorMsg.includes('503') ||
          errorMsg.includes('espera requerida')) {
          setIaError('');
        }
      }
    };
    updateCd();
    const id = setInterval(updateCd, 1000);
    return () => clearInterval(id);
  }, [iaError]);

  // Lista derivada para la vista (búsqueda + filtro)
  const viewItems = useMemo(() => {
    const s = (search || '').toLowerCase().trim();
    const filtered = items.filter((it) => {
      const okStatus = statusFilter === 'all' ? true : it.status === statusFilter;
      const okSearch = s ? (String(it.name || '').toLowerCase().includes(s)) : true;
      return okStatus && okSearch;
    });

    return filtered;
  }, [items, statusFilter, search]);

  // Persistir tema de la vista general y precargar
  useEffect(() => {
    if (!areaId) {
      try {
        const v = localStorage.getItem('simuladores_general_topic') || '';
        if (v && !generalTopic) setGeneralTopic(v);
      } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);
  useEffect(() => {
    if (!areaId) {
      try { localStorage.setItem('simuladores_general_topic', generalTopic || ''); } catch { }
    }
  }, [generalTopic, areaId]);

  /* handlers */
  // Vista previa: cargar y mostrar el simulador completo (igual que en Quiz.jsx)
  const handleView = async (item) => {
    if (!item || !item.id) {
      alert('Error: No se puede cargar la vista previa de un simulador sin ID');
      return;
    }

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewSim(null);
    try {
      const { data } = await getSimulacionFull(item.id);
      const sim = data?.data || null;
      if (!sim) {
        throw new Error('Simulador no encontrado');
      }
      setPreviewSim(sim);
    } catch (e) {
      // ✅ Manejar error 404 de forma más amigable
      if (e?.response?.status === 404) {
        alert(`El simulador "${item.name || 'seleccionado'}" ya no existe. Será removido de la lista.`);
        // Remover el simulador de la lista y recargar
        setItems(prev => prev.filter(x => x.id !== item.id));
        load();
      } else {
        console.error('[SimuladoresGen] Error al cargar vista previa:', e);
        alert(e?.response?.data?.message || 'No se pudo cargar la vista previa');
      }
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };
  const handleEdit = async (item) => {
    if (!item || !item.id) {
      alert('Error: No se puede editar un simulador sin ID');
      return;
    }

    try {
      // Cargar los datos completos del simulador (usar getSimulacionFull para obtener todos los campos)
      const { data: fullData } = await getSimulacionFull(item.id).catch(async () => {
        // Fallback a getSimulacion si getSimulacionFull falla
        const { data } = await getSimulacion(item.id);
        return { data };
      });

      const simData = fullData?.data?.simulacion || fullData?.data || fullData || {};

      // Log completo de lo que viene del backend para debugging
      console.log('[SimuladoresGen] handleEdit - Datos RAW del backend:', {
        simDataCompleto: simData,
        fecha_limite: simData.fecha_limite,
        grupos: simData.grupos,
        descripcion: simData.descripcion,
        instrucciones: simData.instrucciones,
        time_limit_min: simData.time_limit_min
      });

      // Mapear los datos del simulador al formato del initialForm
      // Grupos: puede venir como string separado por comas, array, o null
      let gruposArray = [];
      if (simData.grupos) {
        if (typeof simData.grupos === 'string') {
          gruposArray = simData.grupos.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(simData.grupos)) {
          gruposArray = simData.grupos;
        }
      }

      // Calcular horas y minutos desde time_limit_min
      const timeLimitMin = Number(simData.time_limit_min || 0);
      const horas = Math.floor(timeLimitMin / 60);
      const minutos = timeLimitMin % 60;

      // Formatear fecha_limite para el input type="date" (YYYY-MM-DD)
      let fechaLimiteFormatted = '';
      const fechaLimiteRaw = simData.fecha_limite || simData.fechaLimite;
      if (fechaLimiteRaw) {
        try {
          // Si viene como string de MySQL (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss)
          const fecha = new Date(fechaLimiteRaw);
          if (!isNaN(fecha.getTime())) {
            fechaLimiteFormatted = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
          }
        } catch (e) {
          console.warn('[SimuladoresGen] Error al formatear fecha_limite:', e, 'Valor recibido:', fechaLimiteRaw);
        }
      }

      // Intentos: simulaciones no tienen max_intentos en BD; si en el futuro se añade, usarlo
      const maxIntentosSim = Number(simData.max_intentos ?? simData.maxIntentos ?? 3);
      const intentosModeSim = (maxIntentosSim && maxIntentosSim > 0) ? 'limited' : 'unlimited';

      // Preparar el objeto de edición con todos los datos
      const editData = {
        ...item,
        // Datos del simulador completo
        titulo: simData.titulo || simData.nombre || item.name || '',
        nombre: simData.nombre || simData.titulo || item.name || '',
        // ✅ CRÍTICO: Buscar instrucciones/descripción en múltiples lugares
        instrucciones: simData.instrucciones || simData.descripcion || item.instrucciones || item.descripcion || '',
        descripcion: simData.descripcion || simData.instrucciones || item.descripcion || item.instrucciones || '',
        fechaLimite: fechaLimiteFormatted || (simData.fechaLimite && String(simData.fechaLimite).slice(0, 10)) || '',
        publico: simData.publico !== undefined ? Boolean(simData.publico) : (simData.status === 'Publicado' || item.status === 'Publicado'),
        horas: horas,
        minutos: minutos,
        intentosMode: intentosModeSim,
        maxIntentos: maxIntentosSim,
        grupos: gruposArray, // ✅ Ya procesado como array
        areaId: simData.id_area !== undefined && simData.id_area !== null ? Number(simData.id_area) : null,
        areaTitle: simData.materia || simData.titulo_area || simData.areaTitle || null
      };

      console.log('[SimuladoresGen] handleEdit - Datos procesados para editar:', {
        id: item.id,
        titulo: editData.titulo,
        nombre: editData.nombre,
        instrucciones: editData.instrucciones,
        descripcion: editData.descripcion,
        fechaLimite: editData.fechaLimite,
        fechaLimiteRaw,
        horas: editData.horas,
        minutos: editData.minutos,
        grupos: editData.grupos,
        gruposCount: editData.grupos.length,
        areaId: editData.areaId,
        timeLimitMin
      });

      setEditing(editData);
      setOpen(true);
    } catch (error) {
      console.error('[SimuladoresGen] Error al cargar datos del simulador para editar:', error);
      alert('No se pudieron cargar los datos del simulador. Intenta de nuevo.');
    }
  };
  const handleDelete = (item) => {
    if (!item || !item.id) {
      alert('Error: No se puede eliminar un simulador sin ID');
      return;
    }

    setConfirmModal({
      open: true,
      title: 'Eliminar simulador',
      message: `¿Estás seguro de eliminar el simulador "${item.name}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        // Optimista: quitar de UI
        const prev = items;
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        // ✅ Limpiar localStorage si es el último creado
        try {
          const lastIdRaw = localStorage.getItem('last_sim_id');
          const lastId = lastIdRaw ? Number(lastIdRaw) : null;
          if (lastId === item.id) {
            localStorage.removeItem('last_sim_id');
          }
        } catch { }

        try {
          await deleteSimulacion(item.id);
          setConfirmModal(prev => ({ ...prev, open: false }));
          // Recargar la lista después de eliminar
          setTimeout(() => load(), 300);
        } catch (e) {
          // ✅ Si el simulador ya no existe (404), no revertir (ya se eliminó de la UI)
          if (e?.response?.status === 404) {
            console.log(`[SimuladoresGen] Simulador id=${item.id} ya no existe, manteniendo eliminación de la UI`);
            setConfirmModal(prev => ({ ...prev, open: false }));
            // Recargar la lista para asegurar sincronización
            setTimeout(() => load(), 300);
          } else {
            console.error('[SimuladoresGen] Error al eliminar simulador:', e);
            // Revertir en error inesperado
            setItems(prev);
            alert(e?.response?.data?.message || "No se pudo eliminar");
          }
        }
      }
    });
  };

  const handleCreate = async (form) => {
    // ✅ CRÍTICO: Prioridad para determinar el areaId:
    // 1. Si el form tiene areaId/areaTitle (viene del modal que preservó iaPrefill) → usarlo
    // 2. Si hay iaPrefill con areaId → usarlo
    // 3. Si no, usar el área actual del componente

    const hasFormArea = form && (form.areaId !== undefined || form.areaTitle !== undefined);
    const hasIaPrefill = iaPrefill && iaPrefill !== null;

    let currentAreaId = null;
    let currentAreaTitle = null;

    if (hasFormArea) {
      // ✅ PRIORIDAD 1: El form del modal tiene areaId/areaTitle (preservados desde iaPrefill)
      currentAreaId = form.areaId !== undefined ? form.areaId : null;
      currentAreaTitle = form.areaTitle !== undefined ? form.areaTitle : null;
      console.log('[SimuladoresGen] Usando areaId del form (preservado en modal):', {
        areaId: currentAreaId,
        areaTitle: currentAreaTitle,
        desdeForm: true
      });
    } else if (hasIaPrefill) {
      // ✅ PRIORIDAD 2: Usar iaPrefill (preservado cuando se generó con IA)
      currentAreaId = iaPrefill.areaId !== undefined ? iaPrefill.areaId : null;
      currentAreaTitle = iaPrefill.areaTitle !== undefined ? iaPrefill.areaTitle : null;
      console.log('[SimuladoresGen] Usando areaId de iaPrefill:', {
        areaId: currentAreaId,
        areaTitle: currentAreaTitle,
        desdeIaPrefill: true
      });
    } else {
      // ✅ PRIORIDAD 3: Usar el área actual del componente
      const isGeneralView = !areaId || areaId === null || areaId === undefined;
      currentAreaId = isGeneralView ? null : (areaId ?? null);
      currentAreaTitle = isGeneralView ? null : (areaTitle ?? null);
      console.log('[SimuladoresGen] Usando areaId del componente:', {
        areaId: currentAreaId,
        areaTitle: currentAreaTitle,
        desdeComponente: true
      });
    }

    // ✅ IMPORTANTE: Validar que el título no esté vacío antes de crear
    // También verificar si viene del iaPrefill como respaldo
    const tituloDelIaPrefill = iaPrefill?.titulo || iaPrefill?.nombre || '';
    const tituloFinal = (form.nombre || form.titulo || tituloDelIaPrefill || '').trim();
    if (!tituloFinal || tituloFinal.length < 3) {
      alert('Error: El título del simulador es requerido y debe tener al menos 3 caracteres. Por favor, ingresa un nombre.');
      return;
    }

    // ✅ Log para debugging
    console.log('[SimuladoresGen] handleCreate - Validación de título:', {
      formNombre: form.nombre,
      formTitulo: form.titulo,
      iaPrefillTitulo: iaPrefill?.titulo,
      iaPrefillNombre: iaPrefill?.nombre,
      tituloFinal,
      tituloFinalLength: tituloFinal.length
    });

    // Mapear campos del modal al backend
    // ✅ IMPORTANTE: Priorizar descripción del form (si viene de iaPrefill), luego instrucciones
    // ✅ CRÍTICO: También buscar en iaPrefill si no hay descripción en el form
    // Esto es especialmente importante cuando se crea con IA, ya que la descripción viene en iaPrefill
    const descripcionDelIaPrefill = iaPrefill?.descripcion || iaPrefill?.instrucciones || '';
    // ✅ CRÍTICO: No hacer .trim() aquí porque puede eliminar espacios válidos
    // Usar el valor directamente y solo hacer trim al final si es necesario
    const descripcionFinal = form.descripcion || form.instrucciones || descripcionDelIaPrefill || '';

    // ✅ Log crítico solo si la descripción está vacía
    if (!descripcionFinal || descripcionFinal.length === 0) {
      console.warn('[SimuladoresGen] ⚠️ DESCRIPCIÓN VACÍA al crear:', {
        formDescripcion: form.descripcion?.substring(0, 50),
        iaPrefillDescripcion: iaPrefill?.descripcion?.substring(0, 50)
      });
    }
    const payload = {
      titulo: tituloFinal, // ✅ Usar título validado (no puede estar vacío)
      // ✅ CRÍTICO: Siempre enviar descripcion como string (incluso si está vacío) para forzar que se guarde
      // Si está vacío, enviar string vacío en lugar de null
      descripcion: descripcionFinal !== null && descripcionFinal !== undefined ? String(descripcionFinal) : '',
      fecha_limite: form.fechaLimite || null,
      // ✅ Calcular tiempo límite igual que en Quiz.jsx
      time_limit_min: Number(form.horas || 0) * 60 + Number(form.minutos || 0),
      publico: false, // Crear como borrador para que pueda editarlo antes de publicar (cuando tiene preguntas IA)
      activo: true, // ✅ IMPORTANTE: Siempre crear como activo para que aparezca en la lista del asesor
      grupos: form.grupos ? String(form.grupos).split(',').map(s => s.trim()).filter(Boolean) : null,
      // ✅ CRÍTICO: Incluir id_area siempre (null para generales, el valor numérico para áreas específicas)
      // Si currentAreaId es un número válido, usarlo; si es null/undefined, usar null explícitamente
      id_area: (currentAreaId !== null && currentAreaId !== undefined && Number(currentAreaId) > 0)
        ? Number(currentAreaId)
        : null
    };

    try {
      const hasIaQuestions = iaPreguntas && Array.isArray(iaPreguntas) && iaPreguntas.length > 0;
      // Si tenemos un banco IA pendiente, crear con preguntas incluidas
      const withQuestions = hasIaQuestions
        ? { ...payload, preguntas: iaPreguntas }
        : { ...payload, publico: !!form.publico }; // Solo usar form.publico si no tiene preguntas IA

      // ✅ Log crítico: verificar descripción antes de enviar
      console.log('[SimuladoresGen] Enviando al backend - descripcion:', {
        descripcion: withQuestions.descripcion?.substring(0, 100),
        descripcionLength: withQuestions.descripcion?.length || 0
      });

      const res = await createSimulacion(withQuestions);
      const s = res.data?.data || res.data;

      console.log('[SimuladoresGen] Respuesta del backend:', {
        id: s?.id,
        titulo: s?.titulo,
        tituloTipo: typeof s?.titulo,
        tituloVacio: !s?.titulo || s?.titulo.trim() === '',
        nombre: s?.nombre,
        descripcion: s?.descripcion,
        descripcionTipo: typeof s?.descripcion,
        descripcionVacia: !s?.descripcion || s?.descripcion.trim() === '',
        id_area: s?.id_area,
        id_areaEsperado: currentAreaId,
        coincide: s?.id_area === currentAreaId,
        payloadTitulo: withQuestions.titulo,
        payloadDescripcion: withQuestions.descripcion,
        payloadTituloVacio: !withQuestions.titulo || withQuestions.titulo.trim() === '',
        payloadDescripcionVacia: !withQuestions.descripcion || withQuestions.descripcion.trim() === '',
        todosLosCampos: Object.keys(s || {})
      });

      // ✅ IMPORTANTE: Verificar que el simulador se guardó correctamente con el id_area correcto
      if (hasIaQuestions && s?.id) {
        try {
          const { getSimulacion } = await import('../../api/simulaciones');
          const verifyRes = await getSimulacion(s.id);
          const simuladorVerificado = verifyRes?.data?.data || verifyRes?.data;

          // ✅ Verificar también las preguntas guardadas
          const { getSimulacionFull } = await import('../../api/simulaciones');
          const fullRes = await getSimulacionFull(s.id);
          const simuladorCompleto = fullRes?.data?.data || fullRes?.data;

          // ✅ Log crítico: solo si descripción no se guardó
          if (!simuladorVerificado?.descripcion || simuladorVerificado.descripcion.length === 0) {
            console.warn('[SimuladoresGen] ⚠️ Descripción NO se guardó después de crear:', {
              id: simuladorVerificado?.id,
              descripcionEnviada: payload.descripcion?.substring(0, 50)
            });
          }

          if (simuladorVerificado) {
            const idAreaGuardado = simuladorVerificado.id_area;
            const idAreaEsperado = currentAreaId;

            // Comparar como números para evitar problemas de tipo
            const guardadoNum = idAreaGuardado !== null && idAreaGuardado !== undefined ? Number(idAreaGuardado) : null;
            const esperadoNum = idAreaEsperado !== null && idAreaEsperado !== undefined ? Number(idAreaEsperado) : null;

            if (guardadoNum !== esperadoNum) {
              console.error('[SimuladoresGen] ❌ ERROR: id_area no se guardó correctamente', {
                esperado: esperadoNum,
                guardado: guardadoNum,
                simuladorId: s.id,
                payloadEnviado: withQuestions.id_area
              });
              alert(`⚠️ Advertencia: El simulador se creó pero el área no se guardó correctamente.\n\nEsperado: ${esperadoNum || 'null'} (${currentAreaTitle || 'General'})\nGuardado: ${guardadoNum || 'null'}\n\nPor favor, verifica en la lista y edita el simulador si es necesario.`);
            }
          }
        } catch (verifyError) {
          console.error('[SimuladoresGen] Error al verificar simulador creado:', verifyError);
        }
      }

      try { localStorage.setItem('last_sim_id', String(s.id)); } catch { }

      // ✅ CRÍTICO: Usar el id_area del simulador guardado (s.id_area), no el currentAreaId del componente
      // Esto asegura que el tipo se muestre correctamente según donde realmente se guardó
      const idAreaGuardado = s.id_area !== null && s.id_area !== undefined ? Number(s.id_area) : null;
      const tipoItem = idAreaGuardado
        ? (currentAreaTitle || `Área ${idAreaGuardado}`)
        : 'General';

      console.log('[SimuladoresGen] Creando newItem para la lista:', {
        id: s.id,
        id_area: idAreaGuardado,
        tipo: tipoItem,
        currentAreaId: currentAreaId,
        s_id_area: s.id_area
      });

      // ✅ CRÍTICO: Usar el título del simulador guardado, con fallback a nombre si titulo está vacío
      const tituloFinal = s.titulo || s.nombre || payload.titulo || 'Sin título';


      const newItem = {
        id: s.id,
        name: tituloFinal, // ✅ Usar título con fallback
        type: tipoItem, // ✅ Usar tipo basado en id_area guardado, no en currentAreaId
        questions: hasIaQuestions ? iaPreguntas.length : 0,
        attempts: 0,
        status: hasIaQuestions ? 'Borrador' : (s.publico ? 'Publicado' : 'Borrador'), // Borrador si tiene preguntas IA para que pueda editarlo
        updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleDateString('es-MX') : ''
      };

      // ✅ IMPORTANTE: Solo agregar a la lista si el id_area coincide con la vista actual
      // Si se guardó en área 101 pero estamos en vista general, no agregarlo aquí (aparecerá cuando recargues)
      // ✅ CRÍTICO: Considerar tanto null como undefined como vista general
      const isGeneralView = !areaId || areaId === null || areaId === undefined;
      const isGeneralSaved = !idAreaGuardado || idAreaGuardado === null || idAreaGuardado === undefined || Number(idAreaGuardado) === 0;

      const coincideConVista = (isGeneralView && isGeneralSaved) ||
        (!isGeneralView && !isGeneralSaved && Number(areaId) === idAreaGuardado);


      setOpen(false);
      // Limpiar estado IA temporal
      setIaPreguntas(null);
      setIaPrefill(null);

      // ✅ IMPORTANTE: Si tiene preguntas IA, NO navegar al builder, quedarse en la lista (igual que Quiz.jsx)
      // Esto permite que el simulador aparezca en la lista del asesor y pueda ser editado/publicado desde allí
      if (hasIaQuestions) {
        // Recargar la lista inmediatamente para que el simulador aparezca desde el backend
        // Esto asegura que los datos estén sincronizados y no haya problemas de duplicación
        await load();

        // Mostrar modal de éxito después de recargar
        setSuccessModal({
          open: true,
          message: `Simulador creado exitosamente con ${iaPreguntas.length} pregunta(s)${currentAreaId ? ` en el área ${currentAreaTitle || ''}` : ''}`,
          count: iaPreguntas.length,
          willRedirect: true
        });
        // ✅ Volver a redirigir al editor, pero SIN marcarlo como temporal ni usar new=1
        // (eso evita el bug donde se borraba / “se perdía” el contenido generado con IA).
        const navState = currentAreaId
          ? { simId: s.id, areaId: currentAreaId, areaTitle: currentAreaTitle }
          : { simId: s.id };
        setTimeout(() => {
          navigate(`/asesor/quizt/builder?simId=${s.id}`, { state: navState });
        }, 1200);
        return;
      } else {
        // Si no tiene preguntas IA, navegar inmediatamente al builder para agregarlas
        // Marcar como "temporal" para que el builder pueda eliminarlo si el usuario cancela
        const navState = currentAreaId
          ? { simId: s.id, areaId: currentAreaId, areaTitle: currentAreaTitle, tempCreated: true }
          : { simId: s.id, tempCreated: true };
        navigate(`/asesor/quizt/builder?simId=${s.id}&new=1`, { state: navState });
      }
    } catch (e) {
      console.error('[SimuladoresGen] Error al crear simulador:', e);
      alert(e?.response?.data?.message || e?.message || 'No se pudo crear el simulador. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdate = async (form) => {
    if (!editing) return;

    // ✅ CRÍTICO: Obtener el id_area actual del simulador antes de actualizar
    // para preservarlo si no se está cambiando explícitamente
    let currentIdArea = null;
    try {
      const currentSim = await getSimulacion(editing.id);
      const simData = currentSim?.data?.data || currentSim?.data || null;
      if (simData && (simData.id_area !== null && simData.id_area !== undefined)) {
        currentIdArea = Number(simData.id_area);
      }
    } catch (err) {
      // Silencioso
    }

    // ✅ CRÍTICO: Preservar id_area
    let finalIdArea = null;
    if (form && (form.areaId !== undefined && form.areaId !== null)) {
      finalIdArea = Number(form.areaId);
    } else if (areaId && areaId !== null && areaId !== undefined) {
      finalIdArea = Number(areaId);
    } else if (currentIdArea !== null && currentIdArea !== undefined) {
      finalIdArea = currentIdArea;
    } else {
      finalIdArea = null;
    }

    // ✅ CRÍTICO: El form usa "instrucciones" como descripción (ya que el modal mapea descripcion->instrucciones)
    // IMPORTANTE: No hacer .trim() aquí porque puede eliminar espacios válidos, y siempre enviar el valor aunque esté vacío
    const descripcionFinal = form.descripcion || form.instrucciones || '';

    // ✅ Log para debugging

    // ✅ IMPORTANTE: Validar título antes de enviarlo (no enviar si está vacío para preservar el existente)
    const tituloDelForm = (form.nombre || form.titulo || '').trim();
    const tituloParaEnviar = tituloDelForm && tituloDelForm.length >= 3 ? tituloDelForm : undefined;

    // ✅ CRÍTICO: Normalizar grupos - el backend espera JSON válido o NULL
    // El campo grupos tiene un CHECK constraint que requiere JSON válido: CHECK (json_valid(`grupos`))
    let gruposFinal = null;
    if (form.grupos) {
      if (Array.isArray(form.grupos) && form.grupos.length > 0) {
        // Si es array, convertir a JSON string
        gruposFinal = JSON.stringify(form.grupos);
      } else if (typeof form.grupos === 'string' && form.grupos.trim()) {
        // Si es string, puede ser:
        // 1. JSON string ya válido (ej: '["V1","M1"]')
        // 2. String separado por comas (ej: 'V1,M1')
        try {
          // Intentar parsear como JSON primero
          JSON.parse(form.grupos);
          // Si se puede parsear, es JSON válido, usarlo tal cual
          gruposFinal = form.grupos;
        } catch {
          // Si no es JSON, asumir que es string separado por comas y convertir a JSON array
          const gruposNormalizados = form.grupos.split(',').map(s => s.trim()).filter(Boolean);
          gruposFinal = gruposNormalizados.length > 0 ? JSON.stringify(gruposNormalizados) : null;
        }
      }
    }
    // ✅ Asegurar que si gruposFinal es string vacío, se convierta a null
    if (gruposFinal === '' || gruposFinal === undefined) {
      gruposFinal = null;
    }

    // ✅ CRÍTICO: Normalizar fecha_limite - debe ser null si está vacío, o una fecha válida en formato ISO
    let fechaLimiteFinal = null;
    if (form.fechaLimite) {
      const fechaStr = String(form.fechaLimite).trim();
      if (fechaStr && fechaStr !== '') {
        try {
          // Intentar parsear la fecha y convertirla a formato ISO (YYYY-MM-DD)
          const fecha = new Date(fechaStr);
          if (!isNaN(fecha.getTime())) {
            // Formato ISO para MySQL: YYYY-MM-DD
            fechaLimiteFinal = fecha.toISOString().split('T')[0];
          } else {
            console.warn('[SimuladoresGen] handleUpdate - fecha inválida, usando null:', fechaStr);
          }
        } catch (err) {
          console.warn('[SimuladoresGen] handleUpdate - error al parsear fecha, usando null:', err);
        }
      }
    }

    const payload = {
      ...(tituloParaEnviar !== undefined ? { titulo: tituloParaEnviar } : {}), // Solo incluir si es válido
      // ✅ CRÍTICO: Siempre incluir descripcion, incluso si está vacío (usar string vacío en lugar de null para forzar actualización)
      descripcion: descripcionFinal !== null && descripcionFinal !== undefined ? String(descripcionFinal) : '',
      fecha_limite: fechaLimiteFinal, // ✅ CRÍTICO: null si está vacío, o fecha en formato YYYY-MM-DD
      time_limit_min: (() => {
        const horas = Number(form.horas || 0);
        const minutos = Number(form.minutos || 0);
        const totalMin = horas * 60 + minutos;
        // Solo usar 30 minutos por defecto si realmente no se especificó tiempo (ambos son 0)
        return totalMin > 0 ? totalMin : 30;
      })(),
      publico: !!form.publico,
      activo: true, // ✅ IMPORTANTE: Siempre mantener activo al actualizar
      grupos: gruposFinal, // ✅ Ya normalizado como string separado por comas o null
      // ✅ CRÍTICO: Incluir id_area siempre para preservarlo (null para generales, número para áreas específicas)
      id_area: (finalIdArea !== null && finalIdArea !== undefined && Number(finalIdArea) > 0)
        ? Number(finalIdArea)
        : null
    };

    // ✅ Log crítico: solo si descripción está vacía
    if (!payload.descripcion || payload.descripcion.length === 0) {
      console.warn('[SimuladoresGen] handleUpdate - ⚠️ Descripción vacía en payload');
    }

    try {
      const res = await updateSimulacion(editing.id, payload);
      const s = res.data?.data || res.data;

      // ✅ CRÍTICO: Usar el valor del payload directamente (más confiable que la respuesta del backend)
      const instruccionesActualizadas = payload.descripcion || s?.descripcion || s?.instrucciones || '';

      // ✅ Log crítico: solo si hay problema
      if (!instruccionesActualizadas || instruccionesActualizadas.length === 0) {
        console.warn('[SimuladoresGen] handleUpdate - ⚠️ Descripción vacía después de actualizar');
      }

      // ✅ Actualizar el estado inmediatamente con los datos del payload (más confiable)
      setItems(prev => prev.map(x => {
        if (x.id === editing.id) {
          const itemActualizado = {
            id: s?.id || editing.id,
            name: s?.titulo || x.name,
            instrucciones: instruccionesActualizadas, // ✅ CRÍTICO: Usar las instrucciones del payload
            type: (s?.id_area && Number(s.id_area) > 0) ? (areaTitle || `Área ${s.id_area}`) : 'General',
            questions: Number(x.questions || 0),
            attempts: Number(x.attempts || 0),
            status: s?.publico ? 'Publicado' : 'Borrador',
            updatedAt: s?.updated_at ? new Date(s.updated_at).toLocaleDateString('es-MX') : x.updatedAt
          };
          return itemActualizado;
        }
        return x;
      }));

      setEditing(null);
      setOpen(false);

      // ✅ Recargar la lista inmediatamente para sincronizar con el backend
      // El estado ya se actualizó arriba con el valor del payload, pero recargamos para asegurar consistencia
      await load();
    } catch (e) {
      console.error('[SimuladoresGen] handleUpdate - Error completo:', e);
      console.error('[SimuladoresGen] handleUpdate - Response data:', e?.response?.data);
      console.error('[SimuladoresGen] handleUpdate - Response status:', e?.response?.status);
      const errorMessage = e?.response?.data?.message || e?.message || 'No se pudo guardar';
      alert(`Error al guardar: ${errorMessage}`);
    }
  };

  const handleResultados = async (item) => {
    if (!item || !item.id) {
      alert('Error: No se puede cargar los resultados de un simulador sin ID');
      return;
    }
    setResultsOpen(true);
    setResultsLoading(true);
    setResultsRows([]);
    setResultsSimMeta({ id: item.id, titulo: item.name || item.titulo || 'Simulación' });
    try {
      const { data } = await estudiantesEstadoSimulacion(item.id);
      const rows = data?.data || [];
      setResultsRows(rows);
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo cargar el estado de estudiantes');
      setResultsOpen(false);
    } finally {
      setResultsLoading(false);
    }
  };
  const openReview = async (row) => {
    if (!resultsSimMeta?.id || !row?.id_estudiante) return;
    setReviewOpen(true);
    setReviewLoading(true);
    setReviewData(null);
    setSelectedIntentoReview(1); // Resetear al intento oficial
    setReviewHeader({
      simulacion: resultsSimMeta,
      estudiante: {
        id: row.id_estudiante,
        nombre: `${row.apellidos || ''} ${row.nombre || ''}`.trim(),
        totalIntentos: row.total_intentos || 0
      }
    });
    try {
      // Cargar intento oficial por defecto
      const { data } = await getSimulacionIntentoReview(resultsSimMeta.id, row.id_estudiante, 1);
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
    if (!resultsSimMeta?.id || !reviewHeader.estudiante?.id) return;
    setSelectedIntentoReview(intentoNum);
    setReviewLoading(true);
    try {
      const { data } = await getSimulacionIntentoReview(resultsSimMeta.id, reviewHeader.estudiante.id, intentoNum);
      setReviewData(data?.data || null);
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo cargar el detalle del intento');
    } finally {
      setReviewLoading(false);
    }
  };
  const handlePublish = async (item) => {
    setConfirmModal({
      open: true,
      title: 'Publicar Simulador',
      message: `¿Publicar el simulador "${item.name}"? Esto lo hará visible para los estudiantes.`,
      type: 'success',
      confirmText: 'Publicar',
      onConfirm: async () => {
        // ✅ CRÍTICO: Obtener los datos actuales del simulador antes de publicar
        // para preservar título, descripción e id_area
        let currentSimData = null;
        let currentIdArea = null;
        try {
          const currentSim = await getSimulacion(item.id);
          currentSimData = currentSim?.data?.data || currentSim?.data || null;
          if (currentSimData) {
            if (currentSimData.id_area !== null && currentSimData.id_area !== undefined) {
              currentIdArea = Number(currentSimData.id_area);
            }
            console.log('[SimuladoresGen] handlePublish - datos actuales del simulador:', {
              id: currentSimData.id,
              titulo: currentSimData.titulo,
              descripcion: currentSimData.descripcion ? 'presente' : 'ausente',
              id_area: currentIdArea
            });
          }
        } catch (err) {
          console.warn('[SimuladoresGen] No se pudo obtener datos actuales del simulador:', err);
        }

        // Optimista
        const prev = [...items];
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'Publicado' } : x));

        try {
          // ✅ CRÍTICO: Al publicar, preservar TODOS los datos importantes del simulador
          // Incluir título, descripción, id_area y time_limit_min para evitar que se borren
          const publishPayload = {
            publico: true,
            activo: true
          };

          // ✅ Preservar título si existe
          if (currentSimData && currentSimData.titulo) {
            publishPayload.titulo = currentSimData.titulo;
            console.log('[SimuladoresGen] handlePublish - preservando título:', publishPayload.titulo);
          }

          // ✅ Preservar descripción si existe
          if (currentSimData && currentSimData.descripcion) {
            publishPayload.descripcion = currentSimData.descripcion;
            console.log('[SimuladoresGen] handlePublish - preservando descripción');
          }

          // ✅ Preservar id_area
          if (currentIdArea !== null && currentIdArea !== undefined && Number(currentIdArea) > 0) {
            publishPayload.id_area = Number(currentIdArea);
          } else {
            publishPayload.id_area = null;
          }

          await updateSimulacion(item.id, publishPayload);

          // ✅ Verificar que el id_area se preservó después de publicar
          try {
            const verifyRes = await getSimulacion(item.id);
            const simuladorVerificado = verifyRes?.data?.data || verifyRes?.data;
            console.log('[SimuladoresGen] handlePublish - verificación post-publicación:', {
              id: simuladorVerificado?.id,
              id_area: simuladorVerificado?.id_area,
              id_areaEsperado: currentIdArea,
              publico: simuladorVerificado?.publico,
              coincide: simuladorVerificado?.id_area === currentIdArea
            });

            if (simuladorVerificado && simuladorVerificado.id_area !== currentIdArea) {
              console.error('[SimuladoresGen] ❌ ERROR: id_area se perdió después de publicar', {
                esperado: currentIdArea,
                guardado: simuladorVerificado.id_area,
                simuladorId: item.id
              });
            }
          } catch (verifyErr) {
            console.warn('[SimuladoresGen] No se pudo verificar id_area después de publicar:', verifyErr);
          }

          setConfirmModal(prev => ({ ...prev, open: false }));
          // Recargar la lista para reflejar los cambios
          setTimeout(() => load(), 500);
        } catch (e) {
          // Revertir
          setItems(prev);
          alert(e?.response?.data?.message || 'No se pudo publicar el simulador');
        }
      }
    });
  };

  // Crear un simulador rápido con IA (cantidad seleccionada)
  const crearSimuladorRapido = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      // Validar tema en vista General
      if (!areaId && !generalTopic.trim()) {
        setError('Escribe un tema para generar con IA en simulaciones generales.');
        setLoading(false);
        return;
      }
      // ✅ IMPORTANTE: Validar que el tema no esté vacío (ya hay validación arriba, pero aseguramos un valor válido)
      const temaRaw = areaId ? (areaTitle || 'Simulador de área') : generalTopic.trim();
      const tema = temaRaw || 'Simulador General'; // Fallback si está vacío
      if (!tema || !tema.trim()) {
        setError('Error: Debes ingresar un tema para generar el simulador con IA.');
        setLoading(false);
        return;
      }

      // Calcular cantidad total desde distribución personalizada
      const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
      if (cantidad > MAX_IA) {
        setError(`Máximo ${MAX_IA} preguntas por generación con IA.`);
        return;
      }
      if (cantidad < 1) {
        setError('Se requiere al menos 1 pregunta (configura la distribución)');
        return;
      }
      // Distribución personalizada
      const distribucion = {
        multi: iaCountMultiple,
        tf: iaCountVerdaderoFalso,
        short: iaCountCorta
      };
      // ✅ Validación: Detectar múltiples materias en el tema (separadas por comas)
      const temaConComas = tema.includes(',');
      const materiasDelTema = temaConComas ? tema.split(',').map(s => s.trim()).filter(Boolean) : [];
      const numMaterias = materiasDelTema.length >= 2 ? materiasDelTema.length : 0;

      // ✅ Advertencia si hay más materias que preguntas
      if (numMaterias > cantidad) {
        const materiasTexto = materiasDelTema.join(', ');
        const advertencia = `⚠️ Advertencia: Has especificado ${numMaterias} materia${numMaterias > 1 ? 's' : ''} (${materiasTexto}), ` +
          `pero solo se generarán ${cantidad} pregunta${cantidad > 1 ? 's' : ''}. ` +
          `Algunas materias no tendrán preguntas. ¿Deseas continuar de todas formas?`;

        const continuar = window.confirm(advertencia);
        if (!continuar) {
          setLoading(false);
          return;
        }
      }

      // Preparar parámetros avanzados de IA
      const aiParams = {
        tema: tema.trim(), // ✅ Asegurar que el tema tenga un valor válido
        cantidad,
        area: areaId ? (areaTitle || undefined) : undefined,
        nivel: iaNivel || 'intermedio',
        idioma: iaIdioma,
        distribucion,
        temperature: iaTemperature,
        ...(iaTopP !== '' && { topP: Number(iaTopP) }),
        ...(iaTopK !== '' && { topK: Number(iaTopK) }),
        ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
      };
      const preguntasIA = await generarPreguntasIA(aiParams);
      // Mapear al contrato del backend (mismo formato que SimuladorBuilder)
      const preguntas = preguntasIA.map((q, idx) => {
        if (q.type === 'multi') {
          const opciones = (q.options || []).map(o => ({ texto: o.text, es_correcta: !!o.correct }));
          // Si ninguna marcada, marcar la primera
          if (opciones.length && !opciones.some(o => o.es_correcta)) opciones[0].es_correcta = true;
          return { orden: idx + 1, text: q.text, tipo: 'opcion_multiple', puntos: Number(q.points || 1), opciones };
        }
        if (q.type === 'tf') {
          return { orden: idx + 1, text: q.text, type: 'tf', puntos: Number(q.points || 1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        // short
        return { orden: idx + 1, text: q.text, type: 'short', puntos: Number(q.points || 1), answer: String(q.answer || '') };
      });
      // Guardar banco IA en estado y abrir modal prellenado
      setIaPreguntas(preguntas);
      // ✅ IMPORTANTE: Generar título y descripción basados en el tema
      // Asegurar que el título tenga un valor válido y descriptivo
      const tituloSugerido = `${tema} (IA - ${cantidad} pregunta${cantidad > 1 ? 's' : ''})`.trim();
      // ✅ IMPORTANTE: Generar descripción más completa, natural y fluida basada en el tema y tipo (funciona tanto para generales como por área)
      const esPorArea = areaId && areaTitle;
      const contextoSimulador = esPorArea
        ? `Simulación de práctica sobre ${tema} enfocada en el área de ${areaTitle}. Contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} de contenido específico del área, generadas con inteligencia artificial para ayudarte a prepararte para tu examen de ingreso universitario.`
        : `Simulación de práctica general sobre ${tema} para examen de ingreso universitario. Contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} de contenido general, generadas con inteligencia artificial para reforzar tus conocimientos.`;
      const descripcionGenerada = `${contextoSimulador} Lee cada pregunta cuidadosamente y selecciona la respuesta correcta.`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. Responde con calma y revisa tus opciones antes de continuar.`;
      // ✅ IMPORTANTE: Preservar siempre el areaId y areaTitle cuando se genera con IA
      // Esto asegura que el simulador se guarde en el área correcta incluso si el componente cambia de vista
      const isGeneralView = !areaId || areaId === null || areaId === undefined;
      // ✅ IMPORTANTE: Asegurar que todos los datos necesarios estén presentes en iaPrefill
      // Validar que el título no esté vacío antes de establecerlo
      const tituloFinal = tituloSugerido && tituloSugerido.length >= 3
        ? tituloSugerido
        : `Simulador ${tema || 'General'} (IA)`;
      setIaPrefill({
        titulo: tituloFinal, // ✅ Asegurar que siempre tenga un valor válido (mínimo 3 caracteres)
        instrucciones: instrucciones || 'Lee cada pregunta y selecciona la respuesta correcta. Responde con calma y revisa tus opciones antes de continuar.',
        descripcion: descripcionGenerada || `Simulación de práctica sobre ${tema || 'temas generales'}. Contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} para ayudarte a prepararte para tu examen.`, // ✅ Agregar descripción generada (IMPORTANTE: debe tener contenido)
        nombre: tituloFinal, // ✅ Asegurar que siempre tenga un valor válido (mínimo 3 caracteres)
        fechaLimite: '', // El usuario debe completar esto en el modal
        publico: false, // Siempre crear como borrador cuando tiene preguntas IA
        horas: 0, // El usuario debe completar esto en el modal
        minutos: 0, // El usuario debe completar esto en el modal
        grupos: '', // El usuario debe completar esto en el modal
        // ✅ CRÍTICO: Preservar areaId y areaTitle siempre cuando se genera con IA
        // Si estamos en un área específica (areaId es un número válido), preservarlo
        // Si estamos en vista general (areaId es null/undefined), preservar null
        areaId: isGeneralView ? null : (areaId !== null && areaId !== undefined ? Number(areaId) : null),
        areaTitle: isGeneralView ? null : (areaTitle || null),
      });

      // Log para debugging
      console.log('[SimuladoresGen] IA generada - iaPrefill establecido:', {
        areaId: isGeneralView ? null : (areaId !== null && areaId !== undefined ? Number(areaId) : null),
        areaTitle: isGeneralView ? null : (areaTitle || null),
        isGeneralView,
        areaIdOriginal: areaId
      });

      setOpen(true);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      // Detectar error de API key bloqueada (leaked)
      if (e?.code === 'API_KEY_LEAKED' || msg.includes('leaked') || msg.includes('reported as leaked') || msg.includes('bloqueada porque fue expuesta')) {
        setError(
          '⚠️ La API key de Gemini fue bloqueada por Google porque fue expuesta públicamente.\n\n' +
          'Por favor, contacta al administrador del sistema para obtener una nueva API key. ' +
          'El administrador debe obtener una nueva clave desde Google AI Studio y actualizarla en el servidor.'
        );
        if (e?.helpUrl) {
          console.error('🔗 Obtén una nueva API key en:', e.helpUrl);
        }
      } else if (e?.code === 'TOO_MANY_REQUESTS' || msg.includes('demasiadas peticiones') || msg.includes('saturar')) {
        const cooldownTime = e?.remainingMs || rem || 60000; // 1 minuto por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        const timeDisplay = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setError(`⚠️ Demasiadas peticiones en poco tiempo\n\nHas realizado múltiples peticiones seguidas. Por favor, espera ${timeDisplay} antes de intentar nuevamente para evitar saturar el servicio de IA.\n\nEl botón de generar quedará deshabilitado durante el tiempo de espera.`);
        setCooldownMs(cooldownTime);
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else if (e?.code === 'RATE_LIMIT' || e?.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('límite de solicitudes') || msg.includes('error de cuota') || msg.includes('503')) {
        const cooldownTime = e?.remainingMs || rem || 120000; // 2 minutos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        const timeDisplay = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setError(`⚠️ Límite de solicitudes alcanzado (Error ${e?.status || 429})\n\nSe alcanzó el límite de solicitudes a la API de Google. Por favor, espera ${timeDisplay} antes de intentar nuevamente.\n\nEl botón de generar quedará deshabilitado durante el tiempo de espera.`);
        setCooldownMs(cooldownTime);
        // Asegurar que el cooldown se actualice inmediatamente
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento') || msg.includes('cooldown')) {
        const cooldownTime = e?.remainingMs || rem || 120000; // 2 minutos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        const timeDisplay = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setError(`⏳ Espera requerida\n\nDebes esperar ${timeDisplay} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.`);
        setCooldownMs(cooldownTime);
        // Asegurar que el cooldown se actualice inmediatamente
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else {
        setError(e?.message || e?.response?.data?.message || 'No se pudo crear el simulador con IA. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Crear simulador con IA eligiendo modo/temas (para vista de área)
  const crearSimuladorConIAOpciones = async ({ modo = 'general', temasText = '' } = {}) => {
    // Verificar cooldown ANTES de cualquier otra validación
    const rem = getCooldownRemainingMs();
    if (rem > 0) {
      const secs = Math.ceil(rem / 1000);
      const mins = Math.floor(secs / 60);
      const secsRem = secs % 60;
      const timeStr = mins > 0 ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}` : `${secs} segundo${secs > 1 ? 's' : ''}`;
      setIaError(`⏳ Espera requerida\n\nDebes esperar ${timeStr} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.\n\nPuedes cerrar este modal y volver a intentarlo cuando termine el tiempo de espera.`);
      setCooldownMs(rem);
      return;
    }

    if (!areaId) {
      // Para simuladores generales, usar generalTopic y la misma lógica
      if (!generalTopic.trim()) {
        setIaError('Escribe un tema para generar con IA en simulaciones generales.');
        return;
      }
    }
    if (loading) return;
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
    setLoading(true);
    setError('');
    setIaError('');
    try {
      // Calcular cantidad total desde distribución personalizada
      const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
      if (cantidad > MAX_IA) {
        setIaError(`Máximo ${MAX_IA} preguntas por generación con IA.`);
        setLoading(false);
        return;
      }
      if (cantidad < 1) {
        setIaError('Se requiere al menos 1 pregunta (configura la distribución)');
        setLoading(false);
        return;
      }

      // ✅ IMPORTANTE: Validar que el tema no esté vacío para simuladores generales
      const temaRaw = areaId ? (areaTitle || 'Simulador de área') : generalTopic.trim();
      const tema = temaRaw || 'Simulador General'; // Fallback si está vacío
      if (!tema || !tema.trim()) {
        setIaError('Error: Debes ingresar un tema para generar el simulador con IA.');
        setLoading(false);
        return;
      }

      // Distribución personalizada
      const distribucion = {
        multi: iaCountMultiple,
        tf: iaCountVerdaderoFalso,
        short: iaCountCorta
      };
      const opts = {
        tema: tema.trim(), // ✅ Asegurar que el tema tenga un valor válido
        cantidad,
        area: areaId ? (areaTitle || undefined) : undefined,
        nivel: iaNivel,
        idioma: iaIdioma,
        distribucion,
        temperature: iaTemperature,
        ...(iaTopP !== '' && { topP: Number(iaTopP) }),
        ...(iaTopK !== '' && { topK: Number(iaTopK) }),
        ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
      };
      const temasList = String(temasText || '').split(',').map(s => s.trim()).filter(Boolean);

      // ✅ Validación: Detectar múltiples materias en el tema (separadas por comas)
      const temaConComas = tema.includes(',');
      const materiasDelTema = temaConComas ? tema.split(',').map(s => s.trim()).filter(Boolean) : [];
      // En modo 'temas', usar temasList; en modo 'general' con comas en tema, usar materiasDelTema
      const numMaterias = modo === 'temas' && temasList.length
        ? temasList.length
        : (materiasDelTema.length >= 2 ? materiasDelTema.length : 0);

      // ✅ Advertencia si hay más materias que preguntas
      if (numMaterias > cantidad) {
        const materiasTexto = modo === 'temas' && temasList.length
          ? temasList.join(', ')
          : (materiasDelTema.length >= 2 ? materiasDelTema.join(', ') : '');
        const advertencia = `⚠️ Advertencia: Has especificado ${numMaterias} materia${numMaterias > 1 ? 's' : ''} (${materiasTexto}), ` +
          `pero solo se generarán ${cantidad} pregunta${cantidad > 1 ? 's' : ''}. ` +
          `Algunas materias no tendrán preguntas. ¿Deseas continuar de todas formas?`;

        const continuar = window.confirm(advertencia);
        if (!continuar) {
          setLoading(false);
          return;
        }
      }

      if (modo === 'temas' && temasList.length) {
        opts.modo = 'temas';
        opts.temas = temasList;
      } else {
        opts.modo = 'general';
      }
      const preguntasIA = await generarPreguntasIA(opts);
      // Mapear al contrato del backend (mismo formato que SimuladorBuilder)
      const preguntas = preguntasIA.map((q, idx) => {
        if (q.type === 'multi') {
          const opciones = (q.options || []).map(o => ({ texto: o.text, es_correcta: !!o.correct }));
          // Si ninguna marcada, marcar la primera
          if (opciones.length && !opciones.some(o => o.es_correcta)) opciones[0].es_correcta = true;
          return { orden: idx + 1, text: q.text, tipo: 'opcion_multiple', puntos: Number(q.points || 1), opciones };
        }
        if (q.type === 'tf') {
          return { orden: idx + 1, text: q.text, type: 'tf', puntos: Number(q.points || 1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
        }
        // short
        return { orden: idx + 1, text: q.text, type: 'short', puntos: Number(q.points || 1), answer: String(q.answer || '') };
      });
      setIaPreguntas(preguntas);
      // ✅ IMPORTANTE: Generar título y descripción basados en el tema y modo
      // Asegurar que el título tenga un valor válido y descriptivo
      const tituloSugerido = `${tema} (IA - ${cantidad} pregunta${cantidad > 1 ? 's' : ''}${opts.modo === 'temas' ? ' - por temas' : ''})`.trim();
      // ✅ IMPORTANTE: Generar descripción más completa, natural y fluida basada en el tema, modo y área
      const esPorArea = areaId && areaTitle;
      let descripcionGenerada = '';
      if (opts.modo === 'temas') {
        // Modo por temas específicos
        const temasList = opts.temasText ? opts.temasText.split(',').map(t => t.trim()).filter(Boolean).join(', ') : 'varios temas';
        descripcionGenerada = `Simulación de práctica sobre ${tema}${esPorArea ? ` del área de ${areaTitle}` : ''} organizada por temas específicos: ${temasList}. Contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} generadas con inteligencia artificial para ayudarte a prepararte para tu examen de ingreso universitario.`;
      } else {
        // Modo general
        descripcionGenerada = `Simulación de práctica sobre ${tema}${esPorArea ? ` del área de ${areaTitle}` : ''}. Cubre contenido general${esPorArea ? ' del área' : ''} y contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} generadas con inteligencia artificial para ayudarte a prepararte para tu examen de ingreso universitario.`;
      }
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. ${opts.modo === 'temas' ? 'Este simulador incluye preguntas por temas específicos.' : 'Este simulador cubre contenido general del área.'}`;
      // ✅ IMPORTANTE: Preservar siempre el areaId y areaTitle cuando se genera con IA
      // Esto asegura que el simulador se guarde en el área correcta incluso si el componente cambia de vista
      const isGeneralView = !areaId || areaId === null || areaId === undefined;
      // ✅ IMPORTANTE: Asegurar que todos los datos necesarios estén presentes en iaPrefill
      // Validar que el título no esté vacío antes de establecerlo
      const tituloFinal = tituloSugerido && tituloSugerido.length >= 3
        ? tituloSugerido
        : `Simulador ${tema || 'General'} (IA${opts.modo === 'temas' ? ' - por temas' : ''})`;
      setIaPrefill({
        titulo: tituloFinal, // ✅ Asegurar que siempre tenga un valor válido (mínimo 3 caracteres)
        instrucciones: instrucciones || 'Lee cada pregunta y selecciona la respuesta correcta. Este simulador cubre contenido general del área.',
        descripcion: descripcionGenerada || `Simulación de práctica sobre ${tema || 'temas generales'}. Contiene ${cantidad} pregunta${cantidad > 1 ? 's' : ''} para ayudarte a prepararte para tu examen.`, // ✅ Agregar descripción generada
        nombre: tituloFinal, // ✅ Asegurar que siempre tenga un valor válido (mínimo 3 caracteres)
        fechaLimite: '', // El usuario debe completar esto en el modal
        publico: false, // Siempre crear como borrador cuando tiene preguntas IA
        horas: 0, // El usuario debe completar esto en el modal
        minutos: 0, // El usuario debe completar esto en el modal
        grupos: '', // El usuario debe completar esto en el modal
        // ✅ CRÍTICO: Preservar areaId y areaTitle siempre cuando se genera con IA
        // Si estamos en un área específica (areaId es un número válido), preservarlo
        // Si estamos en vista general (areaId es null/undefined), preservar null
        areaId: isGeneralView ? null : (areaId !== null && areaId !== undefined ? Number(areaId) : null),
        areaTitle: isGeneralView ? null : (areaTitle || null),
      });

      // Log para debugging
      console.log('[SimuladoresGen] IA generada (con opciones) - iaPrefill establecido:', {
        areaId: isGeneralView ? null : (areaId !== null && areaId !== undefined ? Number(areaId) : null),
        areaTitle: isGeneralView ? null : (areaTitle || null),
        isGeneralView,
        areaIdOriginal: areaId,
        modo: opts.modo
      });

      // Cerrar modal de IA y abrir modal de creación
      setIaChoiceOpen(false);
      setIaError('');
      setOpen(true);
    } catch (e) {
      console.error('Error generando preguntas con IA:', e);
      const msg = String(e?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      // Detectar error de API key bloqueada (leaked)
      if (e?.code === 'API_KEY_LEAKED' || msg.includes('leaked') || msg.includes('reported as leaked') || msg.includes('bloqueada porque fue expuesta')) {
        setIaError(
          '⚠️ La API key de Gemini fue bloqueada por Google porque fue expuesta públicamente.\n\n' +
          'Por favor, contacta al administrador del sistema para obtener una nueva API key. ' +
          'El administrador debe obtener una nueva clave desde Google AI Studio y actualizarla en el servidor.'
        );
        if (e?.helpUrl) {
          console.error('🔗 Obtén una nueva API key en:', e.helpUrl);
        }
      } else if (e?.code === 'RATE_LIMIT' || e?.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('límite de solicitudes') || msg.includes('error de cuota')) {
        // Obtener el cooldown actualizado del servicio
        const currentRem = getCooldownRemainingMs();
        const cooldownTime = e?.remainingMs || currentRem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const secsRem = secs % 60;
        const timeStr = mins > 0 ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}` : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setIaError(`⚠️ Límite de solicitudes alcanzado (Error 429)\n\nSe alcanzó el límite de solicitudes a la API de Google Gemini. Esto ocurre cuando se hacen demasiadas solicitudes en poco tiempo.\n\n⏱️ Tiempo de espera: ${timeStr}\n\nEl botón de generar quedará deshabilitado automáticamente durante este tiempo. Puedes cerrar este modal y volver a intentarlo cuando termine el tiempo de espera.`);
        // Actualizar el cooldown inmediatamente
        setCooldownMs(cooldownTime);
        // Forzar actualización inmediata del cooldown
        setTimeout(() => {
          const updatedRem = getCooldownRemainingMs();
          setCooldownMs(updatedRem);
        }, 50);
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento') || msg.includes('cooldown')) {
        // Obtener el cooldown actualizado del servicio
        const currentRem = getCooldownRemainingMs();
        const cooldownTime = e?.remainingMs || currentRem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const secsRem = secs % 60;
        const timeStr = mins > 0 ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}` : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setIaError(`⏳ Espera requerida\n\nDebes esperar ${timeStr} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.\n\nPuedes cerrar este modal y volver a intentarlo cuando termine el tiempo de espera.`);
        // Actualizar el cooldown inmediatamente
        setCooldownMs(cooldownTime);
        // Forzar actualización inmediata del cooldown
        setTimeout(() => {
          const updatedRem = getCooldownRemainingMs();
          setCooldownMs(updatedRem);
        }, 50);
      } else {
        setIaError(e?.response?.data?.message || e?.message || 'No se pudieron generar las preguntas con IA. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  // Bloquear el scroll de la página cuando CUALQUIER modal esté abierto
  useEffect(() => {
    const isAnyModalOpen = iaChoiceOpen || open || confirmModal.open || successModal.open || previewOpen || resultsOpen || reviewOpen;

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
  }, [iaChoiceOpen, open, confirmModal.open, successModal.open, previewOpen, resultsOpen, reviewOpen]);


  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="mx-auto max-w-8xl w-full 2xl:max-w-none 2xl:px-4 px-4 pb-8 pt-4 sm:pt-6 sm:px-6 lg:px-8">
        {/* Header Premium Replicado */}
        <SectionBadge
          title={headerTitle}
          subtitle="Gestiona y crea simuladores para tus estudiantes."
          total={viewItems.length}
          icon={(() => {
            // Lógica para seleccionar icono basado en el título del área
            const t = (areaTitle || '').toLowerCase();
            if (t.includes('exactas')) return Atom;
            if (t.includes('sociales')) return Users;
            if (t.includes('humanidades') || t.includes('artes')) return Feather;
            if (t.includes('salud') || t.includes('naturales') || t.includes('biología')) return Dna;
            if (t.includes('ingeniería') || t.includes('tecnología')) return Cpu;
            if (t.includes('económico') || t.includes('administrativas')) return TrendingUp;
            if (t.includes('educación') || t.includes('deportes')) return Trophy;
            if (t.includes('agropecuarias')) return Sprout;
            if (t.includes('turismo')) return Map;
            if (t.includes('unam') || t.includes('ipn') || t.includes('núcleo')) return Landmark;
            if (t.includes('militar') || t.includes('naval')) return Ship;
            if (t.includes('psicométrico') || t.includes('transversal')) return BrainCircuit;
            return Icon; // Fallback al icono pasado por prop (PlaySquare por defecto)
          })()}
          onBack={() => navigate(-1)}
        />

        {/* Toolbar superior rediseñada */}
        <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-4 shadow-lg ring-2 ring-slate-100/50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Lado izquierdo: acciones y filtros */}
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50"
                title="Refrescar"
                aria-label="Refrescar"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                Recargar
              </button>

              {/* Segmentado por estado */}
              <div className="inline-flex items-center rounded-xl border-2 border-slate-200 bg-slate-50 p-1 shadow-sm">
                {['all', 'Publicado', 'Borrador'].map(v => (
                  <button
                    key={v}
                    onClick={() => setStatusFilter(v)}
                    className={[
                      'px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200',
                      statusFilter === v
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md scale-105'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                    ].join(' ')}
                  >
                    {v === 'all' ? 'Todos' : v}
                  </button>
                ))}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar simulador..."
                  className="w-56 rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Generación IA (depende del modo) */}
              {areaId ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="hidden sm:block text-xs text-slate-500 whitespace-nowrap">Preguntas</label>
                  <select
                    value={iaQuickCount}
                    onChange={(e) => setIaQuickCount(Number(e.target.value))}
                    className="rounded-lg border-2 border-emerald-200 bg-white px-3 py-2 text-sm sm:text-base text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all min-w-[80px] sm:min-w-[100px]"
                    disabled={loading}
                    aria-label="Cantidad de preguntas IA"
                  >
                    {COUNT_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIaChoiceOpen(true)}
                    disabled={loading || cooldownMs > 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s` : 'Genera con IA'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <ListFilter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      <input
                        type="text"
                        value={generalTopic}
                        onChange={(e) => setGeneralTopic(e.target.value)}
                        placeholder="Tema para IA (p. ej., Álgebra básica)"
                        className="w-72 rounded-lg border border-emerald-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        aria-label="Tema para IA"
                        disabled={loading}
                      />
                    </div>
                    {generalTopic.trim().length > 0 && generalTopic.trim().length < 10 && (
                      <p className="text-xs text-amber-600 font-medium ml-1">
                        {generalTopic.trim().length}/10 caracteres mínimos
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIaChoiceOpen(true)}
                    disabled={loading || !generalTopic.trim() || generalTopic.trim().length < 10 || cooldownMs > 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={generalTopic.trim().length < 10 ? 'Escribe al menos 10 caracteres para generar con IA' : 'Generar simulador con IA'}
                  >
                    <Sparkles className="h-4 w-4" />
                    {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s` : 'Genera con IA'}
                  </button>
                </div>
              )}
            </div>

            {/* Lado derecho: CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Nuevo simulador
              </button>
            </div>
          </div>
        </div>

        {/* Móvil: tarjetas */}
        {debugInfo && (
          <div className="mb-2 text-xs text-slate-400">Depuración: {debugInfo.fetched} elementos</div>
        )}
        {error && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-line">{error}</div>
        )}
        {loading && viewItems.length === 0 && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">Cargando…</div>
        )}
        <div className="grid gap-3 md:hidden">
          {viewItems.map((item) => (
            <MobileRow
              key={item.id}
              item={item}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onResultados={handleResultados}
            />
          ))}
          {viewItems.length === 0 && !loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Sin simuladores.
            </div>
          )}
        </div>

        {/* Desktop: tabla — 2xl: más altura y texto para 1920×1080 */}
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-20 bg-indigo-600 px-4 py-3 2xl:py-4 text-left text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[220px]"
                    >
                      Simulador
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 text-left text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[100px]">
                      Tipo
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 text-center text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[95px]">
                      Preguntas
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 text-center text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[90px]">
                      Intentos
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 text-center text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[110px]">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 text-left text-[11px] 2xl:text-xs font-bold uppercase tracking-wider border-r border-white/30 min-w-[100px]">
                      Actualizado
                    </th>
                    <th scope="col" className="px-4 py-3 2xl:py-4 min-w-[190px]">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {viewItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-slate-50/50 transition-colors duration-150 group border-b border-slate-100 last:border-0 2xl:[&_td]:py-4"
                    >
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 2xl:py-4 border-r border-slate-200">
                        <div className="max-w-[200px] lg:max-w-xs xl:max-w-md 2xl:max-w-lg">
                          <div className="font-semibold text-slate-900 truncate text-sm 2xl:text-base" title={item.name}>
                            {item.name}
                          </div>
                          {item.instrucciones && item.instrucciones.trim() && (
                            <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                              {item.instrucciones}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium text-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">{item.type}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600 uppercase">
                          {item.questions}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600 uppercase">
                          {item.attempts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {item.status === "Publicado" ? (
                          <Badge type="success">Publicado</Badge>
                        ) : (
                          <Badge type="draft">Borrador</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] font-medium">
                        {item.updatedAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          <button
                            onClick={() => handleView(item)}
                            title="Vista previa"
                            className="p-1.5 rounded-md border border-slate-100 bg-white text-sky-600 hover:bg-sky-50 hover:shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResultados(item)}
                            title="Resultados"
                            className="p-1.5 rounded-md border border-slate-100 bg-white text-amber-600 hover:bg-amber-50 hover:shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Trophy className="h-4 w-4" />
                          </button>
                          {item.status === "Borrador" && (
                            <button
                              onClick={() => handlePublish(item)}
                              title="Publicar"
                              className="p-1.5 rounded-md border border-slate-100 bg-white text-emerald-600 hover:bg-emerald-50 hover:shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              <UploadCloud className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            title="Editar"
                            className="p-1.5 rounded-md border border-slate-100 bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Eliminar"
                            className="p-1.5 rounded-md border border-slate-100 bg-white text-rose-600 hover:bg-rose-50 hover:shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {viewItems.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 2xl:py-28 text-center">
                        <div className="flex flex-col items-center gap-4 2xl:gap-6">
                          <div className="w-20 h-20 2xl:w-28 2xl:h-28 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 ring-4 ring-violet-200 flex items-center justify-center shadow-lg">
                            <PlaySquare className="w-10 h-10 2xl:w-14 2xl:h-14 text-violet-600" />
                          </div>
                          <div className="space-y-2 2xl:space-y-3">
                            <p className="text-lg 2xl:text-xl font-bold text-slate-700">No hay simuladores</p>
                            <p className="text-sm 2xl:text-base text-slate-500">
                              Crea tu primer simulador con el botón
                              <span className="mx-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 2xl:px-4 2xl:py-2 font-bold text-white shadow-md">
                                Nuevo simulador
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
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
        <SimuladorModalGen
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
            setIaPreguntas(null);
            setIaPrefill(null);
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          mode={editing ? 'edit' : 'create'}
          initialForm={editing ? (() => {
            const formData = {
              titulo: editing.titulo || editing.nombre || editing.name || '',
              nombre: editing.nombre || editing.titulo || editing.name || '',
              instrucciones: editing.instrucciones || editing.descripcion || '',
              descripcion: editing.descripcion || editing.instrucciones || '',
              fechaLimite: editing.fechaLimite || (editing.fecha_limite && String(editing.fecha_limite).slice(0, 10)) || '',
              publico: editing.publico ?? (editing.status === 'Publicado'),
              horas: editing.horas ?? 0,
              minutos: editing.minutos ?? 0,
              intentosMode: editing.intentosMode || 'unlimited',
              maxIntentos: Number(editing.maxIntentos ?? 3),
              grupos: Array.isArray(editing.grupos) ? editing.grupos : (editing.grupos ? (typeof editing.grupos === 'string' ? editing.grupos.split(',').map(s => s.trim()).filter(Boolean) : [editing.grupos]) : []),
              areaId: editing.areaId !== undefined ? editing.areaId : null,
              areaTitle: editing.areaTitle || null
            };
            // Log para debugging
            console.log('[SimuladoresGen] initialForm para modal (modo edición):', {
              id: editing.id,
              titulo: formData.titulo,
              nombre: formData.nombre,
              instrucciones: formData.instrucciones,
              descripcion: formData.descripcion,
              fechaLimite: formData.fechaLimite,
              horas: formData.horas,
              minutos: formData.minutos,
              grupos: formData.grupos,
              gruposCount: formData.grupos.length,
              editingGrupos: editing.grupos,
              editingFechaLimite: editing.fechaLimite
            });
            return formData;
          })() : (iaPrefill || null)}
          onEditQuestions={editing ? () => {
            // Navegar al builder después de guardar
            const finalIdArea = editing.areaId !== undefined && editing.areaId !== null ? Number(editing.areaId) : (areaId || null);
            const navState = finalIdArea ? {
              simId: editing.id,
              areaId: finalIdArea,
              areaTitle: editing.areaTitle || areaTitle
            } : { simId: editing.id };
            navigate(`/asesor/quizt/builder?simId=${editing.id}`, { state: navState });
          } : null}
        />

        {/* Modal: elección de IA (para vista de área y simuladores generales) */}
        {
          iaChoiceOpen && createPortal(
            <div className="mqerk-sim-ia-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={() => { setIaChoiceOpen(false); setIaError(''); }} />
              <div className="mqerk-sim-ia-dialog relative z-10 w-full max-w-xl max-h-[75vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-2 ring-emerald-200/40 border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-indigo-50 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 p-1.5 shadow-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900">Generar simulador con IA</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Configuración personalizada. Puedes editarlo después.</p>
                    </div>
                    <button
                      onClick={() => { setIaChoiceOpen(false); setIaError(''); }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Body con scroll */}
                <div className="mqerk-hide-scrollbar flex-1 min-h-0 px-4 py-3 space-y-3 overflow-y-auto">
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
                        <div className="text-sm font-semibold text-slate-800 mb-0.5">
                          {areaId ? 'General del área' : 'General del tema'}
                        </div>
                        <div className="text-xs text-slate-600 leading-snug">
                          {areaId
                            ? `Preguntas variadas de "${areaTitle || 'esta área'}". Ideal para conocimientos generales.`
                            : `Preguntas variadas sobre "${generalTopic || 'el tema'}". Ideal para conocimientos generales.`
                          }
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                            title="Limpiar"
                          >
                            ✕
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

                  {/* Selector de idioma */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Idioma de salida</label>
                    <select
                      value={iaIdioma}
                      onChange={(e) => setIaIdioma(e.target.value)}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-base font-semibold text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all"
                    >
                      <option value="auto">Auto (según área/tema)</option>
                      <option value="es">Español (es-MX)</option>
                      <option value="en">Inglés (en-US)</option>
                      <option value="mix">Mixto (mitad ES, mitad EN)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      Consejo: si mezclas materias (ej. “matemáticas, español, inglés…”), usa “Español” o “Auto”. Para practicar inglés, elige “Inglés” o “Mixto”.
                    </p>
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
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5" />
                        <span>Parámetros avanzados de IA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {iaShowAdvanced ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </button>

                    {iaShowAdvanced && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                        {/* Temperatura / Creatividad */}
                        <div className="text-xs">
                          <div className="flex justify-between mb-1">
                            <label className="font-semibold text-slate-700">Creatividad (Temperatura)</label>
                            <span className="text-slate-500">{Number(iaTemperature).toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={iaTemperature}
                            onChange={e => setIaTemperature(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>Preciso</span>
                            <span>Creativo</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Top‑P</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              max="1"
                              step="0.05"
                              value={iaTopP}
                              onChange={(e) => setIaTopP(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                              placeholder="(vacío)"
                            />
                            <p className="mt-1 text-[10px] text-slate-500">0–1 (vacío = default)</p>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Top‑K</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              step="1"
                              value={iaTopK}
                              onChange={(e) => setIaTopK(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                              placeholder="(vacío)"
                            />
                            <p className="mt-1 text-[10px] text-slate-500">Entero (vacío = default)</p>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Max tokens</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="64"
                              step="64"
                              value={iaMaxTokens}
                              onChange={(e) => setIaMaxTokens(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                              placeholder="(vacío)"
                            />
                            <p className="mt-1 text-[10px] text-slate-500">Más alto = respuestas más largas</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mensaje de error */}
                  {iaError && (
                    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3 shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-amber-800 font-semibold mb-1 leading-relaxed whitespace-pre-line">{iaError}</p>
                        {cooldownMs > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                                style={{ width: `${Math.min(100, (cooldownMs / 45000) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 whitespace-nowrap">
                              {Math.ceil(cooldownMs / 1000)}s
                            </span>
                          </div>
                        )}
                      </div>
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
                        {!areaId && generalTopic && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">Tema:</span>
                            <span className="flex-1">{generalTopic}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Modo:</span>
                          <span>{iaChoiceMode === 'general' ? (areaId ? 'General del área' : 'General del tema') : 'Por temas específicos'}</span>
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
                          <span className="font-medium">Idioma:</span>
                          <span>
                            {iaIdioma === 'auto' ? 'Auto' : iaIdioma === 'es' ? 'Español' : iaIdioma === 'en' ? 'Inglés' : 'Mixto'}
                          </span>
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

                {/* Footer con botones - siempre visible */}
                <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    {cooldownMs > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Espera {Math.ceil(cooldownMs / 1000)}s
                      </span>
                    )}
                    {!loading && !cooldownMs && (
                      <span className="text-slate-400">
                        Tiempo estimado: {(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 10 ? '10-15s' : (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 30 ? '15-25s' : '25-35s'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIaChoiceOpen(false); setIaError(''); setShowSummary(false); }}
                      disabled={loading}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await crearSimuladorConIAOpciones({ modo: iaChoiceMode, temasText: iaChoiceTopics });
                      }}
                      disabled={loading || cooldownMs > 0 || (!areaId && !generalTopic.trim()) || (iaChoiceMode === 'temas' && !iaChoiceTopics.trim()) || (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) < 1}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      {loading ? (
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

                {/* CSS local: ocultar barra de scroll manteniendo scroll */}
                <style>{`
              .mqerk-hide-scrollbar {
                -ms-overflow-style: none; /* IE/Edge legacy */
                scrollbar-width: none; /* Firefox */
                scrollbar-color: transparent transparent; /* Firefox */
              }
              .mqerk-hide-scrollbar::-webkit-scrollbar {
                width: 0 !important;
                height: 0 !important;
                display: none !important;
              }
              .mqerk-hide-scrollbar::-webkit-scrollbar-thumb {
                background: transparent !important;
              }
              .mqerk-hide-scrollbar::-webkit-scrollbar-track {
                background: transparent !important;
              }

              /* Pantallas con poca altura: modal más compacto */
              @media (max-height: 720px) {
                .mqerk-sim-ia-dialog {
                  max-height: 70vh;
                }
              }
            `}</style>
              </div>
            </div>,
            document.body
          )
        }

        {/* Modal de vista previa */}
        {previewOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setPreviewOpen(false)}>
            <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Vista previa</h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {previewSim?.preguntas?.length || 0} {(previewSim?.preguntas?.length === 1) ? 'pregunta' : 'preguntas'}
                    </p>
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
                {!previewLoading && previewSim && (
                  <div className="space-y-4">
                    <header className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900">
                        {previewSim.simulador?.titulo || 'Simulador'}
                      </h4>
                      {/* Removed the old count span here */}
                    </header>

                    <ol className="space-y-3">
                      {previewSim.preguntas?.map((p, idx) => (
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
                          {(p.imagen || p.image) && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 max-w-md">
                              <img
                                src={buildStaticUrl(p.imagen || p.image) || (p.imagen || p.image)}
                                alt="Imagen de la pregunta"
                                className="w-full h-auto object-contain max-h-48"
                              />
                            </div>
                          )}
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
                                  {(o.imagen || o.image) && (
                                    <img
                                      src={buildStaticUrl(o.imagen || o.image) || (o.imagen || o.image)}
                                      alt=""
                                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                                    />
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
        )}

        {/* Resultados modal */}
        {
          resultsOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header mejorado */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                      <span className="text-white font-bold text-lg">%</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Resultados del Simulador</h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {resultsSimMeta?.titulo || 'Simulador'} • {resultsRows.length} {resultsRows.length === 1 ? 'estudiante' : 'estudiantes'}
                      </p>
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
                        Aún no hay estudiantes que hayan completado esta simulación.
                      </p>
                    </div>
                  )}
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
          tipo="simulacion"
          idEvaluacion={resultsSimMeta?.id}
          estudiante={reviewHeader.estudiante ? {
            id: reviewHeader.estudiante.id,
            nombre: reviewHeader.estudiante.nombre,
            totalIntentos: reviewHeader.estudiante.totalIntentos
          } : null}
          titulo={reviewHeader.simulacion?.titulo}
        />

        {/* Modal de confirmación genérico */}
        {
          confirmModal.open && (
            <ConfirmModal
              isOpen={confirmModal.open}
              onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              onConfirm={confirmModal.onConfirm}
              title={confirmModal.title}
              message={confirmModal.message}
              type={confirmModal.type}
              confirmText={confirmModal.confirmText}
              cancelText={confirmModal.cancelText}
              loading={loading} // Reusing generic loading state if needed, or we could add specific loading state
            />
          )
        }

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
      </div>
    </div>
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
            {willRedirect && (
              <p className="text-sm text-slate-600">
                Serás redirigido al editor en unos momentos...
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


