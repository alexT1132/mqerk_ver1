import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import SimuladorModalGen from "./SimulatorModal";
import { generarPreguntasIA, getCooldownRemainingMs } from "../../service/simuladoresAI";
import { listSimulaciones, deleteSimulacion, createSimulacion, updateSimulacion, getSimulacion } from "../../api/simulaciones";


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

/* Tarjeta compacta para móvil */
function MobileRow({ item, onView, onEdit, onDelete }) {
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

function ConfirmModal({ open, title, subtitle, message, onClose, onConfirm, loading }) {
  // Cerrar con Escape / Confirmar con Enter
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') onConfirm?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={() => !loading && onClose?.()}
      />

      {/* Card */}
  <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Decor */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="truncate text-xs text-slate-600">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !loading && onClose?.()}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="relative px-5 pb-3 pt-4 text-sm text-slate-700">
          <p className="leading-relaxed">
            {message}
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
            Esta acción es permanente y no se puede deshacer.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-2">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-sm font-semibold text-white shadow hover:from-rose-700 hover:to-rose-800 disabled:opacity-70"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar definitivamente
          </button>
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
  // Confirmación de borrado
  const [confirm, setConfirm] = useState({ open: false, item: null, loading: false, error: "" });
  const MAX_IA = Number(import.meta.env?.VITE_AI_MAX_QUESTIONS || 50);
  const COUNT_OPTIONS = [5,10,30,50].filter(n => n <= MAX_IA);
  const [iaQuickCount, setIaQuickCount] = useState(COUNT_OPTIONS[0] || 5);
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

  const navigate = useNavigate();
  const headerTitle = useMemo(() => {
    if (areaId) {
      const name = areaTitle || 'SIMULADORES ESPECÍFICOS';
      return typeof name === 'string' ? name : 'SIMULADORES ESPECÍFICOS';
    }
    return title;
  }, [areaId, areaTitle, title]);

  // Cargar simulaciones desde backend
  const [debugInfo, setDebugInfo] = useState(null);
  const load = async () => {
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
        } catch {}
        // Si sigue vacío, intentar hidratar desde el último creado
        if (rows.length === 0) {
          try {
            const lastIdRaw = localStorage.getItem('last_sim_id');
            const lastId = lastIdRaw ? Number(lastIdRaw) : null;
            if (lastId) {
              const r = await getSimulacion(lastId).catch(err => {
                if (err?.response?.status === 404) {
                  try { localStorage.removeItem('last_sim_id'); } catch {}
                }
                return null;
              });
              const sim = r?.data?.data || r?.data || null;
              if (sim) rows = [sim];
            }
          } catch {}
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
  };
  // Evitar doble carga en modo Strict de React
  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    load();
  }, []);

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
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);
  useEffect(() => {
    if (!areaId) {
      try { localStorage.setItem('simuladores_general_topic', generalTopic || ''); } catch {}
    }
  }, [generalTopic, areaId]);

  /* handlers */
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
    setConfirm({ open: true, item, loading: false, error: "" });
  };

  const confirmDelete = async () => {
    if (!confirm.item || confirm.loading) return;
    setConfirm((c) => ({ ...c, loading: true, error: "" }));
    try {
      await deleteSimulacion(confirm.item.id);
      setItems((prev) => prev.filter((x) => x.id !== confirm.item.id));
      setConfirm({ open: false, item: null, loading: false, error: "" });
    } catch (e) {
      console.error(e);
      setConfirm((c) => ({ ...c, loading: false, error: e?.response?.data?.message || "No se pudo eliminar" }));
    }
  };

  const handleCreate = async (form) => {
    // Mapear campos del modal al backend
    const payload = {
      titulo: form.nombre || form.titulo,
      descripcion: form.instrucciones || null,
      fecha_limite: form.fechaLimite || null,
  // No fijar tiempo por defecto; el asesor lo define explícitamente
  time_limit_min: (Number(form.horas || 0) * 60 + Number(form.minutos || 0)),
      publico: !!form.publico,
      grupos: form.grupos ? String(form.grupos).split(',').map(s=>s.trim()).filter(Boolean) : null,
      ...(areaId ? { id_area: areaId } : {})
    };
    try {
      // Si tenemos un banco IA pendiente, crear con preguntas incluidas
      const withQuestions = iaPreguntas && Array.isArray(iaPreguntas) && iaPreguntas.length > 0
        ? { ...payload, preguntas: iaPreguntas }
        : payload;
      const res = await createSimulacion(withQuestions);
      const s = res.data?.data || res.data;
  try { localStorage.setItem('last_sim_id', String(s.id)); } catch {}
      const newItem = {
        id: s.id, name: s.titulo, type: areaId ? (areaTitle || `Área ${s.id_area}`) : 'General',
        questions: 0, attempts: 0, status: s.publico ? 'Publicado' : 'Borrador', updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleDateString('es-MX') : ''
      };
      setItems(prev => [newItem, ...prev]);
      setOpen(false);
      // Limpiar estado IA temporal
      setIaPreguntas(null);
      setIaPrefill(null);
      // Redirigir al constructor unificado (builder) con simId y bandera de nuevo
      navigate(`/asesor/quizt/builder?simId=${s.id}&new=1`);
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
      grupos: form.grupos ? String(form.grupos).split(',').map(s=>s.trim()).filter(Boolean) : null,
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
      const cantidad = Number(iaQuickCount) || 5;
      if (cantidad > MAX_IA) {
        setError(`Máximo ${MAX_IA} preguntas por generación con IA.`);
        return;
      }
      const preguntasIA = await generarPreguntasIA({ tema, cantidad, area: areaId ? (areaTitle || undefined) : undefined, nivel: 'intermedio' });
      // Mapear al contrato del backend (crear con preguntas)
      const preguntas = preguntasIA.map((q, idx) => {
        if (q.type === 'multi') {
          const opciones = (q.options || []).map(o => ({ text: o.text, correct: !!o.correct }));
          if (opciones.length && !opciones.some(o=>o.correct)) opciones[0].correct = true;
          return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
        }
        if (q.type === 'tf') {
          const esTrue = (String(q.answer).toLowerCase() !== 'false');
          const opciones = [
            { text: 'Verdadero', correct: esTrue },
            { text: 'Falso', correct: !esTrue }
          ];
          return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
        }
        // short
        const ans = String(q.answer || '').trim() || 'Respuesta libre';
        const opciones = [
          { text: ans, correct: true },
          { text: '—', correct: false },
        ];
        return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
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
        grupos: ''
      });
      setOpen(true);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setError('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
        setCooldownMs(getCooldownRemainingMs());
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento')) {
        const secs = Math.ceil((e?.remainingMs || getCooldownRemainingMs())/1000);
        setError(`Debes esperar ${secs}s antes de volver a generar con IA.`);
        setCooldownMs(getCooldownRemainingMs());
      } else {
        setError(e?.message || e?.response?.data?.message || 'No se pudo crear el simulador con IA');
      }
      if (!(e?.code === 'COOLDOWN')) alert('No se pudo crear el simulador con IA');
    } finally {
      setLoading(false);
    }
  };

  // Crear simulador con IA eligiendo modo/temas (para vista de área)
  const crearSimuladorConIAOpciones = async ({ modo = 'general', temasText = '' } = {}) => {
    if (!areaId) {
      // si no es vista de área, delega al rápido tradicional (usa generalTopic)
      return crearSimuladorRapido();
    }
    if (loading) return;
    setLoading(true); setError('');
    try {
      const tema = areaTitle || 'Simulador de área';
      const cantidad = Number(iaQuickCount) || 5;
      if (cantidad > MAX_IA) {
        setError(`Máximo ${MAX_IA} preguntas por generación con IA.`);
        return;
      }
      const opts = { tema, cantidad, area: areaTitle || undefined, nivel: 'intermedio' };
      const temasList = String(temasText || '').split(',').map(s=>s.trim()).filter(Boolean);
      if (modo === 'temas' && temasList.length) {
        opts.modo = 'temas';
        opts.temas = temasList;
      } else {
        opts.modo = 'general';
      }
      const preguntasIA = await generarPreguntasIA(opts);
      const preguntas = preguntasIA.map((q, idx) => {
        if (q.type === 'multi') {
          const opciones = (q.options || []).map(o => ({ text: o.text, correct: !!o.correct }));
          if (opciones.length && !opciones.some(o=>o.correct)) opciones[0].correct = true;
          return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
        }
        if (q.type === 'tf') {
          const esTrue = (String(q.answer).toLowerCase() !== 'false');
          const opciones = [
            { text: 'Verdadero', correct: esTrue },
            { text: 'Falso', correct: !esTrue }
          ];
          return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
        }
        const ans = String(q.answer || '').trim() || 'Respuesta libre';
        const opciones = [
          { text: ans, correct: true },
          { text: '—', correct: false },
        ];
        return { orden: idx + 1, text: q.text, puntos: Number(q.points||1), opciones };
      });
      setIaPreguntas(preguntas);
      const tituloSugerido = `${tema} (IA · ${cantidad} preguntas${opts.modo==='temas' ? ' · por temas' : ''})`;
  const instrucciones = `Lee cada pregunta y selecciona la respuesta correcta. ${opts.modo==='temas' ? 'Este simulador incluye preguntas por temas específicos.' : 'Este simulador cubre contenido general del área.'}`;
      setIaPrefill({
        titulo: tituloSugerido,
        instrucciones,
        nombre: tituloSugerido,
        fechaLimite: '',
        publico: false,
  horas: 0,
  minutos: 0,
        grupos: ''
      });
      setOpen(true);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setError('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
        setCooldownMs(getCooldownRemainingMs());
      } else if (e?.code === 'COOLDOWN' || msg.includes('enfriamiento')) {
        const secs = Math.ceil((e?.remainingMs || getCooldownRemainingMs())/1000);
        setError(`Debes esperar ${secs}s antes de volver a generar con IA.`);
        setCooldownMs(getCooldownRemainingMs());
      } else {
        setError(e?.message || e?.response?.data?.message || 'No se pudo crear el simulador con IA');
      }
      if (!(e?.code === 'COOLDOWN')) alert('No se pudo crear el simulador con IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-8xl px-4 pb-8 pt-0 sm:pt-0 sm:px-6 lg:px-8">
      {/* Encabezado breve */}
  <div className="relative -mt-3 sm:-mt-5 md:-mt-6 overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 p-2.5 sm:p-3.5 shadow-sm mb-3 sm:mb-4">
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
              {['all','Publicado','Borrador'].map(v => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={[
                    'px-3 py-1.5 text-sm rounded-lg transition',
                    statusFilter===v ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-800'
                  ].join(' ')}
                >
                  {v==='all' ? 'Todos' : v}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e)=> setSearch(e.target.value)}
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
                  onChange={(e)=> setIaQuickCount(Number(e.target.value))}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                  disabled={loading}
                  aria-label="Cantidad de preguntas IA"
                >
                  {COUNT_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  onClick={()=> setIaChoiceOpen(true)}
                  disabled={loading || cooldownMs > 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs/1000)}s` : 'Genera con IA'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ListFilter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input
                    type="text"
                    value={generalTopic}
                    onChange={(e)=> setGeneralTopic(e.target.value)}
                    placeholder="Tema para IA (p. ej., Álgebra básica)"
                    className="w-72 rounded-lg border border-emerald-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    aria-label="Tema para IA"
                    disabled={loading}
                  />
                </div>
                <label className="hidden sm:block text-xs text-slate-500">Preguntas</label>
                <select
                  value={iaQuickCount}
                  onChange={(e)=> setIaQuickCount(Number(e.target.value))}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                  disabled={loading}
                  aria-label="Cantidad de preguntas IA"
                >
                  {COUNT_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  onClick={crearSimuladorRapido}
                  disabled={loading || !generalTopic.trim() || cooldownMs > 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs/1000)}s` : 'Genera con IA'}
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
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
      {loading && items.length===0 && (
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
                          title="Ver"
                          aria-label="Ver"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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

      {/* Modal: elección de IA (solo para vista de área) */}
      {areaId && iaChoiceOpen && (
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
                  <div className="mt-1 text-xs text-slate-600">Indica ramas como "álgebra, ecuaciones, fracciones" y distribuiremos las preguntas.</div>
                </button>
              </div>
              {iaChoiceMode === 'temas' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Temas (separados por comas)</label>
                  <input value={iaChoiceTopics} onChange={e=> setIaChoiceTopics(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="álgebra, ecuaciones lineales, fracciones" />
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
              <button onClick={async ()=> {
                // Confirmar generación según elección
                await crearSimuladorConIAOpciones({ modo: iaChoiceMode, temasText: iaChoiceTopics });
                setIaChoiceOpen(false);
              }} disabled={loading || cooldownMs>0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                <Sparkles className="h-4 w-4" /> {cooldownMs>0? `Espera ${Math.ceil(cooldownMs/1000)}s` : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado (versión mejorada) */}
      <ConfirmModal
        open={confirm.open}
        title="Eliminar simulador"
        subtitle="Acción permanente"
        message={
          <span>
            ¿Deseas eliminar el simulador <span className="font-semibold text-slate-900">“{confirm.item?.name}”</span>?
          </span>
        }
        loading={confirm.loading}
        onClose={() => setConfirm({ open:false, item:null, loading:false, error:"" })}
        onConfirm={confirmDelete}
      />
      </div>
  );
}
