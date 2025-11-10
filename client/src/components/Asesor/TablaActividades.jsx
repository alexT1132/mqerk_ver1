import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listActividades as apiListActividades, createActividad as apiCreateActividad, updateActividad as apiUpdateActividad, areaIdFromName } from "../../api/actividades.js";
import { Eye, FileText, Save, Pencil, Trash2, CalendarDays, Plus, Filter, ArrowLeft, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

/* ===== Datos de ejemplo ===== */
const SEED = [];

const STORAGE_KEY = "selectedAreaTitle";

function getSafeStoredTitle() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const val = String(raw).trim();
  if (!val || val.toLowerCase() === "null" || val.toLowerCase() === "undefined") return null;
  return val;
}

/* ===== Iconos via lucide-react ===== */

/* ===== UI helpers ===== */
const Badge = ({ className = "", children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${className}`}>
    {children}
  </span>
);
const badgeDelivered = (ok) =>
  ok ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-700 ring-slate-200";
const badgeGroup = "bg-indigo-50 text-indigo-700 ring-indigo-200";

/* ====== MODAL (sin cambios) ====== */
const GROUPS = ["m1","m2","m3","v1","v2","v3","s1","s2"];
function NewActivityModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(GROUPS[0]);
  const [due, setDue] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [err, setErr] = useState("");
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (open) { setTitle(""); setGroup(GROUPS[0]); setDue(""); setPdfName(""); setPdfUrl(""); setErr(""); }
  }, [open]);

  const triggerFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setErr("El recurso debe ser un archivo PDF."); e.target.value = ""; return; }
    const url = URL.createObjectURL(f);
    setPdfName(f.name); setPdfUrl(url); setPdfFile(f); setErr("");
  };
  const clearFile = () => { setPdfName(""); if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const save = () => {
    if (!title.trim()) return setErr("La actividad es obligatoria.");
    if (!due) return setErr("La fecha límite es obligatoria.");
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      group,
      pdfUrl,
      pdfFile, // devolver el file real para el API
      due,
      delivered: false,
      grade: null,
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-3">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-xl mt-10 sm:mt-14">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <h3 className="text-sm font-semibold">Nueva actividad</h3>
          </div>
          <div className="px-4 py-3 space-y-3">
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">{err}</div>}

            <div>
              <label className="text-sm font-medium">Actividad *</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Entregar reporte semanal"
                value={title} onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Grupo</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={group} onChange={(e)=>setGroup(e.target.value)}
              >
                {GROUPS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Recurso (PDF)</label>
              <div className="mt-1.5 flex items-center gap-2">
                <button type="button" onClick={triggerFile}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50">
                  <FileText className="w-4 h-4" /> Cargar PDF
                </button>
                {pdfName ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-700 truncate max-w-[180px]" title={pdfName}>{pdfName}</span>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Ver</a>
                    <button onClick={clearFile} className="text-slate-500 hover:text-rose-600">Quitar</button>
                  </div>
                ) : <span className="text-xs text-slate-500">Ningún archivo seleccionado</span>}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange}/>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha límite *</label>
              <input type="date"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={due} onChange={(e)=>setDue(e.target.value)}
              />
            </div>
          </div>
          <div className="px-4 py-3 bg-slate-50 flex items-center justify-end gap-2.5">
            <button onClick={onClose} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-white">Cancelar</button>
            <button onClick={save} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditActivityModal({ open, onClose, row, onSave }) {
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(GROUPS[0]);
  const [due, setDue] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [err, setErr] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && row) {
      setTitle(row.title || "");
      setGroup(row.group || GROUPS[0]);
      setDue(row.due || "");
      setPdfName("");
      setPdfUrl(row.pdfUrl || "");
      setPdfFile(null);
      setErr("");
    }
  }, [open, row]);

  const triggerFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setErr("El recurso debe ser un archivo PDF."); e.target.value = ""; return; }
    const url = URL.createObjectURL(f);
    setPdfName(f.name); setPdfUrl(url); setPdfFile(f); setErr("");
  };
  const clearFile = () => { setPdfName(""); if (pdfUrl?.startsWith("blob:")) URL.revokeObjectURL(pdfUrl); setPdfUrl(row?.pdfUrl || ""); if (fileInputRef.current) fileInputRef.current.value = ""; setPdfFile(null); };

  const save = () => {
    if (!title.trim()) return setErr("La actividad es obligatoria.");
    const payload = {
      id: row.id,
      title: title.trim(),
      group,
      due,
      pdfFile,
    };
    onSave?.(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-3">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-xl mt-10 sm:mt-14">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <h3 className="text-sm font-semibold">Editar actividad</h3>
          </div>
          <div className="px-4 py-3 space-y-3">
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">{err}</div>}

            <div>
              <label className="text-sm font-medium">Actividad *</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Entregar reporte semanal"
                value={title} onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Grupo</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={group} onChange={(e)=>setGroup(e.target.value)}
              >
                {GROUPS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Recurso (PDF)</label>
              <div className="mt-1.5 space-y-1.5">
                {row?.pdfUrl && !pdfFile && (
                  <div className="text-xs text-slate-600">Recurso actual: <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Ver</a></div>
                )}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={triggerFile}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50">
                    <FileText className="w-4 h-4" /> {pdfFile ? 'Reemplazar PDF' : 'Subir/Reemplazar PDF'}
                  </button>
                  {pdfName ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-700 truncate max-w-[180px]" title={pdfName}>{pdfName}</span>
                      <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Ver</a>
                      <button onClick={clearFile} className="text-slate-500 hover:text-rose-600">Quitar</button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">{row?.pdfUrl ? 'Usando recurso actual' : 'Ningún archivo seleccionado'}</span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange}/>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha límite</label>
              <input type="date"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={due} onChange={(e)=>setDue(e.target.value)}
              />
            </div>
          </div>
          <div className="px-4 py-3 bg-slate-50 flex items-center justify-end gap-2.5">
            <button onClick={onClose} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-white">Cancelar</button>
            <button onClick={save} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   TABLA
=================================================================== */
export default function ActivitiesTable({
  initial = SEED,
  title = "Actividades",
  onView = (row) => alert(`Visualizar: ${row.title}`),
  onOpenPdf,
  onSaveRow = (row) => alert(`Guardado: ${row.title} (grupo: ${(row.group||"").toUpperCase()})`),
  onDeleteExternal,
}) {
  const location = useLocation();
  const navigate = useNavigate();

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

  const headerTitle = `${title} — ${areaTitle}`;

  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [groupFilter, setGroupFilter] = useState("todos");
  // Modal de recurso no disponible
  const [resModal, setResModal] = useState({ open: false, title: '', message: '', row: null });

  // Configurar locale para fechas (español)
  dayjs.locale("es");

  const formatDate = (val) => {
    if (!val) return "—";
    const d = dayjs(val);
    if (!d.isValid()) return String(val);
    return d.format("DD/MM/YYYY");
  };

  // Cargar desde API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const id_area = areaIdFromName(areaTitle) || undefined;
  const { data: acts } = await apiListActividades({ id_area, tipo: 'actividad', limit: 200, activo: 1 });
        if (!alive) return;
        const mapped = (Array.isArray(acts) ? acts : []).map(a => ({
          id: a.id,
          title: a.titulo || `Actividad ${a.id}`,
          pdfUrl: Array.isArray(a.recursos_json) && a.recursos_json[0]?.archivo ? a.recursos_json[0].archivo : '',
          due: a.fecha_limite || '',
          delivered: false,
          grade: null,
          group: Array.isArray(a.grupos) && a.grupos[0] ? a.grupos[0] : null,
        }));
        setRows(mapped);
      } catch (e) {
        setError(e.message || 'No se pudieron cargar las actividades');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [areaTitle]);

  const data = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.due.localeCompare(b.due));
    return groupFilter === "todos"
      ? sorted
      : sorted.filter(r => (r.group || "").toLowerCase() === groupFilter.toLowerCase());
  }, [rows, groupFilter]);

  const addRow = async (r) => {
    try {
      setError(null);
      setLoading(true);
      // Mapear título de área → id_area conocido
  const id_area = areaIdFromName(areaTitle) || null;
      const grupos = r.group ? [r.group] : [];
      const recursos = r.pdfFile ? [r.pdfFile] : [];
      const created = await apiCreateActividad({
        titulo: r.title,
        fecha_limite: r.due,
        grupos,
        id_area,
        recursosFiles: recursos,
      });
      // Normalizar a la estructura de la tabla
      const act = created?.data || {};
      const row = {
        id: act.id ?? r.id,
        title: act.titulo || r.title,
        pdfUrl: (Array.isArray(act.recursos_json) && act.recursos_json[0]?.archivo) || r.pdfUrl,
        due: act.fecha_limite || r.due,
        delivered: false,
        grade: null,
        group: Array.isArray(act.grupos) && act.grupos[0] ? act.grupos[0] : r.group,
      };
      setRows((prev) => [...prev, row]);
    } catch (e) {
      setError(e.message || 'No se pudo crear la actividad');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (row) => { setEditRow(row); setEditOpen(true); };
  const saveEdit = async (payload) => {
    const { id, title, group, due, pdfFile } = payload;
    try {
      setLoading(true);
      const data = { titulo: title };
      if (due) data.fecha_limite = due;
      if (group) data.grupos = [group];
      const resp = await apiUpdateActividad(id, data, { nuevosRecursos: pdfFile ? [pdfFile] : [] });
      const updated = resp?.data || {};
      setRows(prev => prev.map(r => r.id === id ? {
        ...r,
        title: updated.titulo || title || r.title,
        due: updated.fecha_limite || due || r.due,
        group: Array.isArray(updated.grupos) && updated.grupos[0] ? updated.grupos[0] : (group || r.group),
        pdfUrl: (Array.isArray(updated.recursos_json) && updated.recursos_json[0]?.archivo) || r.pdfUrl,
      } : r));
      setEditOpen(false); setEditRow(null);
    } catch (e) {
      setError(e.message || 'No se pudo actualizar la actividad');
    } finally {
      setLoading(false);
    }
  };
  const goToEntregas = (row) => {
    navigate(`/asesor/actividades/${row.id}/entregas`, { state: { title: areaTitle } });
  };
  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar (desactivar) "${row.title}"?`)) return;
    try {
      await apiUpdateActividad(row.id, { activo: 0 }); // soft-delete vía activo=0
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      onDeleteExternal?.(row);
    } catch (e) {
      alert(e.message || 'No se pudo eliminar');
    }
  };

  const updateGrade = (id, val) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, grade: val === "" ? null : Number(val) } : r)));

  const toggleDelivered = (id) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, delivered: !r.delivered } : r)));

  const IconButton = ({ onClick, variant="default", label, children, disabled }) => {
    const base = "inline-grid place-items-center w-9 h-9 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1";
    const look = {
      default: "border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-200",
      danger:  "border-rose-300 text-rose-700 hover:bg-rose-50 focus:ring-rose-200",
      primary: "border-indigo-300 text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-200",
    }[variant];
    return (
      <button onClick={onClick} title={label} aria-label={label} disabled={disabled}
              className={`${base} ${look} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        {children}
      </button>
    );
  };

  // Abrir PDF verificando previamente que el recurso exista para evitar "Cannot GET /public/..."
  const openPdfSafe = async (row) => {
    const url = row?.pdfUrl;
    if (!url) {
      setResModal({
        open: true,
        title: 'Recurso no disponible',
        message: 'Esta actividad no tiene un archivo PDF adjunto. Sube un archivo PDF o agrega el enlace del recurso desde la edición de la actividad.',
        row,
      });
      return;
    }
    try {
      // Intento HEAD primero
      let res = await fetch(url, { method: 'HEAD', credentials: 'include' }).catch(() => null);
      // Algunos servidores no permiten HEAD; si es 405 o null, probar GET ligero
      if (!res || res.status === 405) {
        res = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' });
      }
      if (res && res.ok) {
        window.open(url, '_blank', 'noopener');
      } else {
        setResModal({
          open: true,
          title: 'Recurso no disponible',
          message: 'El recurso no está disponible o fue movido. Sube el archivo nuevamente o actualiza el enlace del recurso.',
          row,
        });
      }
    } catch (e) {
      setResModal({ open: true, title: 'No se pudo abrir el recurso', message: 'Ocurrió un problema al verificar el archivo. Inténtalo más tarde.', row });
    }
  };

  const openPdf = onOpenPdf || openPdfSafe;

  return (
    <section className="w-full">
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}
      <div className="mb-4 sm:mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="pl-8 pr-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                title="Filtrar por grupo"
              >
                <option value="todos">Todos</option>
                {GROUPS.map(g => (
                  <option key={g} value={g}>{g.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 shadow-sm">
              <Plus className="w-4 h-4" /> Nueva actividad
            </button>
          </div>
        </div>
        <div>
          {/* Título dinámico */}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {headerTitle}
            <span className="ml-2 align-middle text-xs rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">{data.length}</span>
          </h2>
          <p className="text-sm text-slate-600">Gestiona las actividades del área seleccionada.</p>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b bg-slate-50/60 backdrop-blur supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0">
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">No.</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Actividad</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Recurso</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Fecha límite</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Entregado</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Visualizar</th>
              <th className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wide">Calificación</th>
              <th className="px-4 py-3 text-right text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b last:border-0">
                  <td className="px-4 py-3"><div className="h-3 w-6 bg-slate-200/70 rounded animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-3 w-40 bg-slate-200/70 rounded animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-8 w-9 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-3 w-24 bg-slate-200/70 rounded animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-6 w-16 bg-slate-200/70 rounded-full animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-8 w-9 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-8 w-24 bg-slate-200/70 rounded-lg animate-pulse"/></td>
                  <td className="px-4 py-3"><div className="h-8 w-32 ml-auto bg-slate-200/70 rounded-lg animate-pulse"/></td>
                </tr>
              ))
            )}
            {!loading && data.map((r, idx) => (
              <tr key={r.id} className="border-b last:border-0 odd:bg-slate-50/30 hover:bg-indigo-50/30 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{r.title}</span>
                    {r.group && <Badge className={badgeGroup}>{r.group.toUpperCase()}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <IconButton onClick={() => openPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl}>
                    <FileText className="w-5 h-5" />
                  </IconButton>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 text-slate-700">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(r.due)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleDelivered(r.id)} className="cursor-pointer">
                    <Badge className={badgeDelivered(r.delivered)}>{r.delivered ? "Sí" : "No"}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <IconButton onClick={() => goToEntregas(r)} label="Visualizar">
                    <Eye className="w-5 h-5" />
                  </IconButton>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={r.grade ?? ""}
                    onChange={(e) => updateGrade(r.id, e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">—</option>
                    {[...Array(11)].map((_, n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <IconButton onClick={() => onSaveRow(r)} label="Guardar" variant="primary">
                      <Save className="w-5 h-5" />
                    </IconButton>
                    <IconButton onClick={() => openEdit(r)} label="Editar">
                      <Pencil className="w-5 h-5" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                      <Trash2 className="w-5 h-5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Sin actividades.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="md:hidden space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`m-skeleton-${i}`} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-4 w-24 bg-slate-200/70 rounded animate-pulse" />
            <div className="mt-3 h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-9 bg-slate-200/70 rounded-lg animate-pulse" />
              <div className="h-9 bg-slate-200/70 rounded-lg animate-pulse" />
              <div className="h-9 bg-slate-200/70 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
        {!loading && data.map((r, idx) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>No. {idx + 1}</span>
                  <span>•</span>
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(r.due)}</span>
                </div>
                <div className="font-medium flex items-center gap-2">
                  <span>{r.title}</span>
                  {r.group && <Badge className={badgeGroup}>{r.group.toUpperCase()}</Badge>}
                </div>
              </div>
              <button onClick={() => toggleDelivered(r.id)}>
                <Badge className={badgeDelivered(r.delivered)}>{r.delivered ? "Entregado" : "Pendiente"}</Badge>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Recurso</div>
              <div className="text-right">
                <IconButton onClick={() => openPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl}>
                  <FileText className="w-5 h-5" />
                </IconButton>
              </div>
              <div className="text-slate-500">Calificación</div>
              <div className="text-right">
                <select
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={r.grade ?? ""}
                  onChange={(e) => updateGrade(r.id, e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">—</option>
                  {[...Array(11)].map((_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <IconButton onClick={() => onSaveRow(r)} label="Guardar" variant="primary">
                <Save className="w-5 h-5" />
              </IconButton>
              <IconButton onClick={() => goToEntregas(r)} label="Visualizar">
                <Eye className="w-5 h-5" />
              </IconButton>
              <IconButton onClick={() => openEdit(r)} label="Editar">
                <Pencil className="w-5 h-5" />
              </IconButton>
              <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                <Trash2 className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">Sin actividades.</div>}
      </div>

      {/* MODAL crear */}
  <NewActivityModal open={open} onClose={() => setOpen(false)} onSave={addRow} />
  <EditActivityModal open={editOpen} onClose={() => { setEditOpen(false); setEditRow(null); }} row={editRow} onSave={saveEdit} />

      {/* Modal: Recurso no disponible */}
      {resModal.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setResModal({ open:false, title:'', message:'', row:null })} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3 border-b bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-sm">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{resModal.title || 'Recurso no disponible'}</h3>
                    <p className="text-[11px] text-slate-500">Verificación de recurso</p>
                  </div>
                </div>
                <button onClick={() => setResModal({ open:false, title:'', message:'', row:null })} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-slate-700">{resModal.message}</p>
              </div>
              <div className="flex justify-end gap-2 border-t px-3 py-2.5">
                {resModal.row && (
                  <button
                    onClick={() => { const r = resModal.row; setResModal({ open:false, title:'', message:'', row:null }); if (r) openEdit(r); }}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Editar actividad
                  </button>
                )}
                <button
                  onClick={() => setResModal({ open:false, title:'', message:'', row:null })}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
