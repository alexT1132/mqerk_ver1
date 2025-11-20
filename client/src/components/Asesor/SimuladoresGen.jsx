import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Loader2,
  UploadCloud
} from "lucide-react";
import SimuladorModalGen from "./SimulatorModal";
import { generarPreguntasIA, getCooldownRemainingMs } from "../../service/simuladoresAI";
import { listSimulaciones, deleteSimulacion, createSimulacion, updateSimulacion, getSimulacion, getSimulacionFull } from "../../api/simulaciones";
import InlineMath from "./simGen/InlineMath.jsx";


/* ------------------- helpers ------------------- */

// Componente para renderizar texto con fórmulas LaTeX
function MathText({ text = "" }) {
  if (!text) return null;

  const re = /\$(.+?)\$/g;
  const parts = [];
  let lastIndex = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'math', content: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <InlineMath key={idx} math={part.content} />
        ) : (
          <span key={idx}>{part.content}</span>
        )
      )}
    </span>
  );
}

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

/* Tarjeta compacta para móvil */
function MobileRow({ item, onView, onEdit, onDelete, onPublish }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
          <p className="text-sm text-slate-500">{item.type}</p>
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
  const [iaError, setIaError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', count: 0 });
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
      const baseParams = { visible: 'false' };
      const params = areaId ? { ...baseParams, id_area: areaId } : baseParams;
      const res = await listSimulaciones(params);
      let rows = res.data?.data || res.data || [];
      if (!Array.isArray(rows)) rows = [];
      // Fallback: si viene vacío, intenta sin el flag visible
      if (rows.length === 0) {
        try {
          const res2 = await listSimulaciones(areaId ? { id_area: areaId } : undefined);
          const rows2 = res2.data?.data || res2.data || [];
          if (Array.isArray(rows2) && rows2.length) rows = rows2;
        } catch { }
        // Si sigue vacío, intentar hidratar desde el último creado
        if (rows.length === 0) {
          try {
            const lastIdRaw = localStorage.getItem('last_sim_id');
            const lastId = lastIdRaw ? Number(lastIdRaw) : null;
            if (lastId) {
              const r = await getSimulacion(lastId).catch(err => {
                if (err?.response?.status === 404) {
                  try { localStorage.removeItem('last_sim_id'); } catch { }
                }
                return null;
              });
              const sim = r?.data?.data || r?.data || null;
              if (sim) rows = [sim];
            }
          } catch { }
        }
      }
      // Filtro fuerte por área en cliente (si areaId -> solo de esa área; si no -> solo generales sin área)
      const filtered = Array.isArray(rows) ? rows.filter(r => {
        const rid = Number(r?.id_area ?? 0);
        if (areaId) return Number(areaId) === rid;
        // generales: id_area nulo / 0 / undefined
        return !r?.id_area || Number(r.id_area) === 0;
      }) : [];

      setDebugInfo({ fetched: filtered.length, raw: Array.isArray(rows) ? rows.length : -1 });
      const mapped = filtered.map(r => ({
        id: r.id,
        name: r.titulo,
        type: areaId ? (areaTitle || `Área ${r.id_area}`) : "General",
        questions: Number(r.total_preguntas || 0),
        attempts: Number(r.total_intentos_global || 0),
        status: r.publico ? "Publicado" : "Borrador",
        updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString('es-MX') : ""
      }));
      setItems(mapped);
    } catch (e) { console.error(e); setError(e?.response?.data?.message || "No se pudieron cargar simulaciones"); }
    finally { setLoading(false); }
  }, [areaId, areaTitle]);
  // Evitar doble carga en modo Strict de React
  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    load();
  }, [areaId]);

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
    const updateCd = () => setCooldownMs(getCooldownRemainingMs());
    updateCd();
    const id = setInterval(updateCd, 1000);
    return () => clearInterval(id);
  }, []);

  // Lista derivada para la vista (búsqueda + filtro)
  const viewItems = useMemo(() => {
    const s = (search || '').toLowerCase().trim();
    return items.filter((it) => {
      const okStatus = statusFilter === 'all' ? true : it.status === statusFilter;
      const okSearch = s ? (String(it.name || '').toLowerCase().includes(s)) : true;
      return okStatus && okSearch;
    });
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
  // Vista previa: cargar y mostrar el simulador completo
  const handlePreview = async (item) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewSim(null);
    try {
      const { data } = await getSimulacionFull(item.id);
      setPreviewSim(data?.data || null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'No se pudo cargar la vista previa');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleView = (item) => {
    // Propagar contexto de área al builder para que al guardar/regresar no se pierda y no parezca "general"
    const navState = areaId ? { simId: item.id, areaId, areaTitle } : { simId: item.id };
    navigate(`/asesor/quizt/builder?simId=${item.id}`, { state: navState });
  };
  const handleEdit = (item) => {
    setEditing(item);
    setOpen(true);
  };
  const handleDelete = (item) => {
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
        try {
          await deleteSimulacion(item.id);
          setConfirmModal(prev => ({ ...prev, open: false }));
        } catch (e) {
          console.error(e);
          // Revertir en error
          setItems(prev);
          alert(e?.response?.data?.message || "No se pudo eliminar");
        }
      }
    });
  };

  const handleCreate = async (form) => {
    // Usar el área preservada en iaPrefill si está disponible (para flujo IA), sino usar el actual
    const currentAreaId = iaPrefill?.areaId ?? areaId ?? null;
    const currentAreaTitle = iaPrefill?.areaTitle ?? areaTitle ?? null;

    // Mapear campos del modal al backend
    const payload = {
      titulo: form.nombre || form.titulo,
      descripcion: form.instrucciones || null,
      fecha_limite: form.fechaLimite || null,
      // No fijar tiempo por defecto; el asesor lo define explícitamente
      time_limit_min: (Number(form.horas || 0) * 60 + Number(form.minutos || 0)),
      publico: false, // Crear como borrador para que pueda editarlo antes de publicar (cuando tiene preguntas IA)
      grupos: form.grupos ? String(form.grupos).split(',').map(s => s.trim()).filter(Boolean) : null,
      ...(currentAreaId ? { id_area: currentAreaId } : {})
    };
    try {
      const hasIaQuestions = iaPreguntas && Array.isArray(iaPreguntas) && iaPreguntas.length > 0;
      // Si tenemos un banco IA pendiente, crear con preguntas incluidas
      const withQuestions = hasIaQuestions
        ? { ...payload, preguntas: iaPreguntas }
        : { ...payload, publico: !!form.publico }; // Solo usar form.publico si no tiene preguntas IA

      const res = await createSimulacion(withQuestions);
      const s = res.data?.data || res.data;
      try { localStorage.setItem('last_sim_id', String(s.id)); } catch { }
      const newItem = {
        id: s.id,
        name: s.titulo,
        type: currentAreaId ? (currentAreaTitle || `Área ${s.id_area}`) : 'General',
        questions: hasIaQuestions ? iaPreguntas.length : 0,
        attempts: 0,
        status: hasIaQuestions ? 'Borrador' : (s.publico ? 'Publicado' : 'Borrador'), // Borrador si tiene preguntas IA para que pueda editarlo
        updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleDateString('es-MX') : ''
      };
      setItems(prev => [newItem, ...prev]);
      setOpen(false);
      // Limpiar estado IA temporal
      setIaPreguntas(null);
      setIaPrefill(null);
      // Si tiene preguntas IA, mostrar modal de éxito antes de navegar
      if (hasIaQuestions) {
        setSuccessModal({
          open: true,
          message: `Simulador creado exitosamente con ${iaPreguntas.length} pregunta(s)`,
          count: iaPreguntas.length
        });
        // Cerrar automáticamente después de 4 segundos y navegar
        setTimeout(() => {
          setSuccessModal(prev => ({ ...prev, open: false }));
          const navState = currentAreaId ? { simId: s.id, areaId: currentAreaId, areaTitle: currentAreaTitle } : { simId: s.id };
          navigate(`/asesor/quizt/builder?simId=${s.id}&new=1`, { state: navState });
        }, 4000);
      } else {
        // Si no tiene preguntas IA, navegar inmediatamente
        const navState = currentAreaId ? { simId: s.id, areaId: currentAreaId, areaTitle: currentAreaTitle } : { simId: s.id };
        navigate(`/asesor/quizt/builder?simId=${s.id}&new=1`, { state: navState });
      }
    } catch (e) { console.error(e); alert('No se pudo crear'); }
  };

  const handleUpdate = async (form) => {
    if (!editing) return;
    const payload = {
      titulo: form.nombre || form.titulo,
      descripcion: form.instrucciones || null,
      fecha_limite: form.fechaLimite || null,
      time_limit_min: Number(form.horas || 0) * 60 + Number(form.minutos || 0),
      publico: !!form.publico,
      grupos: form.grupos ? String(form.grupos).split(',').map(s => s.trim()).filter(Boolean) : null,
      // Asegurar que no se pierda la asociación con el área al actualizar
      ...(areaId ? { id_area: areaId } : {})
    };
    try {
      const res = await updateSimulacion(editing.id, payload);
      const s = res.data?.data || res.data;
      setItems(prev => prev.map(x => x.id === editing.id ? ({
        id: s.id, name: s.titulo, type: areaId ? (areaTitle || `Área ${s.id_area}`) : 'General',
        questions: Number(x.questions || 0), attempts: Number(x.attempts || 0), status: s.publico ? 'Publicado' : 'Borrador', updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleDateString('es-MX') : ''
      }) : x));
      setEditing(null);
      setOpen(false);
    } catch (e) { console.error(e); alert('No se pudo guardar'); }
  };

  const handlePublish = async (item) => {
    setConfirmModal({
      open: true,
      title: 'Publicar Simulador',
      message: `¿Publicar el simulador "${item.name}"? Esto lo hará visible para los estudiantes.`,
      type: 'success',
      confirmText: 'Publicar',
      onConfirm: async () => {
        // Optimista
        const prev = [...items];
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'Publicado' } : x));

        try {
          await updateSimulacion(item.id, { publico: true });
          setConfirmModal(prev => ({ ...prev, open: false }));
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
      const tema = areaId ? (areaTitle || 'Simulador de área') : generalTopic.trim();
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
      // Preparar parámetros avanzados de IA
      const aiParams = {
        tema,
        cantidad,
        area: areaId ? (areaTitle || undefined) : undefined,
        nivel: iaNivel || 'intermedio',
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
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas)`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. Responde con calma y revisa tus opciones antes de continuar.`;
      setIaPrefill({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: '',
        publico: false,
        horas: 0,
        minutos: 0,
        grupos: '',
        areaId: areaId || null, // Preservar el área actual
        areaTitle: areaTitle || null, // Preservar el título del área
      });
      setOpen(true);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      // Manejar error 429 (Too Many Requests) o errores de límite de cuota
      if (e?.code === 'RATE_LIMIT' || e?.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('límite de solicitudes') || msg.includes('error de cuota')) {
        const cooldownTime = e?.remainingMs || rem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        setError(`⚠️ Límite de solicitudes alcanzado (Error 429)\n\nSe alcanzó el límite de solicitudes a la API de Google. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente.\n\nEl botón de generar quedará deshabilitado durante el tiempo de espera.`);
        setCooldownMs(cooldownTime);
        // Asegurar que el cooldown se actualice inmediatamente
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento') || msg.includes('cooldown')) {
        const cooldownTime = e?.remainingMs || rem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        setError(`⏳ Espera requerida\n\nDebes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.`);
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

      const tema = areaId ? (areaTitle || 'Simulador de área') : generalTopic.trim();
      // Distribución personalizada
      const distribucion = {
        multi: iaCountMultiple,
        tf: iaCountVerdaderoFalso,
        short: iaCountCorta
      };
      const opts = {
        tema,
        cantidad,
        area: areaId ? (areaTitle || undefined) : undefined,
        nivel: iaNivel,
        distribucion,
        temperature: iaTemperature,
        ...(iaTopP !== '' && { topP: Number(iaTopP) }),
        ...(iaTopK !== '' && { topK: Number(iaTopK) }),
        ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
      };
      const temasList = String(temasText || '').split(',').map(s => s.trim()).filter(Boolean);
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
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas${opts.modo === 'temas' ? ' · por temas' : ''})`;
      const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. ${opts.modo === 'temas' ? 'Este simulador incluye preguntas por temas específicos.' : 'Este simulador cubre contenido general del área.'}`;
      setIaPrefill({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: '',
        publico: false,
        horas: 0,
        minutos: 0,
        grupos: '',
        areaId: areaId || null, // Preservar el área actual
        areaTitle: areaTitle || null, // Preservar el título del área
      });
      // Cerrar modal de IA y abrir modal de creación
      setIaChoiceOpen(false);
      setIaError('');
      setOpen(true);
    } catch (e) {
      console.error('Error generando preguntas con IA:', e);
      const msg = String(e?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      // Manejar error 429 (Too Many Requests) o errores de límite de cuota
      if (e?.code === 'RATE_LIMIT' || e?.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('límite de solicitudes') || msg.includes('error de cuota')) {
        const cooldownTime = e?.remainingMs || rem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        setIaError(`⚠️ Límite de solicitudes alcanzado (Error 429)\n\nSe alcanzó el límite de solicitudes a la API de Google. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente.\n\nEl botón de generar quedará deshabilitado durante el tiempo de espera.`);
        setCooldownMs(cooldownTime);
        // Asegurar que el cooldown se actualice inmediatamente
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento') || msg.includes('cooldown')) {
        const cooldownTime = e?.remainingMs || rem || 45000; // 45 segundos por defecto
        const secs = Math.ceil(cooldownTime / 1000);
        setIaError(`⏳ Espera requerida\n\nDebes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.`);
        setCooldownMs(cooldownTime);
        // Asegurar que el cooldown se actualice inmediatamente
        setTimeout(() => setCooldownMs(getCooldownRemainingMs()), 100);
      } else {
        setIaError(e?.response?.data?.message || e?.message || 'No se pudieron generar las preguntas con IA. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-8xl px-4 pb-8 pt-4 sm:pt-6 sm:px-6 lg:px-8">
      {/* Encabezado breve */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 p-2.5 sm:p-3.5 shadow-sm mb-3 sm:mb-4">
        {/* blobs suaves al fondo */}
        <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          {/* Volver atrás */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Volver"
            aria-label="Volver"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {/* ícono con badge */}
          <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg sm:size-14">
            <Icon className="size-6 sm:size-7" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-white">
              <Sparkles className="size-3 text-white" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700">
              {headerTitle}
            </h1>

            {/* subrayado doble */}
            <div className="mt-1 flex gap-2">
              <span className="h-1 w-14 sm:w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
              <span className="h-1 w-8 sm:w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar superior rediseñada */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-3 py-3 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Lado izquierdo: acciones y filtros */}
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              title="Refrescar"
              aria-label="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar
            </button>

            {/* Segmentado por estado */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              {['all', 'Publicado', 'Borrador'].map(v => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={[
                    'px-3 py-1.5 text-sm rounded-lg transition',
                    statusFilter === v ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-800'
                  ].join(' ')}
                >
                  {v === 'all' ? 'Todos' : v}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar simulador..."
                className="w-52 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            {/* Generación IA (depende del modo) */}
            {areaId ? (
              <div className="flex items-center gap-2">
                <label className="hidden sm:block text-xs text-slate-500">Preguntas</label>
                <select
                  value={iaQuickCount}
                  onChange={(e) => setIaQuickCount(Number(e.target.value))}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
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
                <button
                  onClick={() => setIaChoiceOpen(true)}
                  disabled={loading || !generalTopic.trim() || cooldownMs > 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
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
      {loading && items.length === 0 && (
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
          />
        ))}
        {viewItems.length === 0 && !loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Sin simuladores.
          </div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-50/60">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-slate-50/60 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Simulador
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Preguntas
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Intentos
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                  >
                    Actualizado
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {viewItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={(idx % 2 === 0 ? "bg-white" : "bg-slate-50/30") + " hover:bg-slate-50"}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-5 py-4">
                      <div className="max-w-xs truncate font-medium text-slate-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.type}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.questions}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.attempts}
                    </td>
                    <td className="px-5 py-4">
                      {item.status === "Publicado" ? (
                        <Badge type="success">Publicado</Badge>
                      ) : (
                        <Badge type="draft">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.updatedAt}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status === "Borrador" && (
                          <button
                            onClick={() => handlePublish(item)}
                            title="Publicar"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            <UploadCloud className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Editar"
                          aria-label="Editar"
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Eliminar"
                          aria-label="Eliminar"
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center text-slate-500"
                    >
                      Aún no hay simuladores. Crea el primero con el botón
                      <span className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
                        Nuevo simulador
                      </span>
                      .
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
        onClose={() => { setOpen(false); setEditing(null); setIaPreguntas(null); setIaPrefill(null); }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        mode={editing ? 'edit' : 'create'}
        initialForm={editing ? {
          titulo: editing.name,
          nombre: editing.name,
          instrucciones: '',
          fechaLimite: '',
          publico: editing.status === 'Publicado',
          horas: 0,
          minutos: 0,
          grupos: ''
        } : (iaPrefill || null)}
      />

      {/* Modal: elección de IA (para vista de área y simuladores generales) */}
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
                  <p className="text-xs text-rose-700 flex-1 leading-relaxed whitespace-pre-line">{iaError}</p>
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
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-0.5 mt-16">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-lg bg-white shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50">
              <h3 className="text-base font-semibold text-slate-900">Vista previa</h3>
              <button onClick={() => setPreviewOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="overflow-y-auto px-4 py-3">
              {previewLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                </div>
              )}
              {!previewLoading && previewSim && (
                <div className="space-y-2.5">
                  <header className="border-b pb-2">
                    <h4 className="text-base font-semibold text-slate-900">{previewSim.simulador?.titulo || 'Simulador'}</h4>
                    <p className="text-xs text-slate-500">Preguntas: {Array.isArray(previewSim.preguntas) ? previewSim.preguntas.length : 0}</p>
                  </header>
                  <ol className="space-y-1.5">
                    {previewSim.preguntas?.map((p, idx) => (
                      <li key={p.id} className="rounded border border-slate-200 p-1.5">
                        <div className="mb-0.5 text-xs text-slate-500">
                          {idx + 1}. {p.tipo === 'opcion_multiple' ? 'Opción múltiple' : p.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Respuesta corta'} • {p.puntos || 1} pt{(p.puntos || 1) > 1 ? 's' : ''}
                        </div>
                        <div className="font-medium text-slate-900 mb-0.5 text-sm">
                          <MathText text={p.enunciado} />
                        </div>
                        {p.tipo === 'opcion_multiple' && (
                          <ul className="mt-0.5 space-y-1">
                            {p.opciones?.map((o) => (
                              <li key={o.id} className={`rounded border px-1.5 py-1 text-xs ${o.es_correcta ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                <MathText text={o.texto || '—'} />
                              </li>
                            ))}
                          </ul>
                        )}
                        {p.tipo === 'verdadero_falso' && (
                          <p className="mt-0.5 text-xs text-slate-700">Correcta: <strong><MathText text={p.opciones?.find(x => x.es_correcta)?.texto || '—'} /></strong></p>
                        )}
                        {p.tipo === 'respuesta_corta' && (
                          <p className="mt-0.5 text-xs text-slate-700">Respuesta esperada: <strong><MathText text={p.opciones?.find(x => x.es_correcta)?.texto || '—'} /></strong></p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-2 bg-slate-50">
              <button onClick={() => setPreviewOpen(false)} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación genérico */}
      {confirmModal.open && (
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
      )}

      {/* Modal de éxito */}
      {successModal.open && (
        <SuccessModal
          message={successModal.message}
          count={successModal.count}
          onClose={() => setSuccessModal(prev => ({ ...prev, open: false }))}
        />
      )}
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
