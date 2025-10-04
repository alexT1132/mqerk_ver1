import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/* ===== Datos de ejemplo ===== */
const SEED = [
  { id: "A-001", title: "Revisar guión del video", pdfUrl: "", due: "2025-09-29", delivered: true,  grade: 9, group: "m1" },
  { id: "A-002", title: "Enviar factura a cliente", pdfUrl: "", due: "2025-09-30", delivered: false, grade: null, group: "v2" },
];

const STORAGE_KEY = "selectedAreaTitle";

function getSafeStoredTitle() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const val = String(raw).trim();
  if (!val || val.toLowerCase() === "null" || val.toLowerCase() === "undefined") return null;
  return val;
}

/* ===== Iconos (SVG inline) ===== */
const Icon = {
  edit:   (cls="w-5 h-5") => (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16.862 4.487 19.5 7.125m-2.638-2.638L9.75 11.6V15h3.4l7.112-7.112a1.875 1.875 0 0 0-2.65-2.65Z"/>
      <path d="M19.5 13.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V6A1.5 1.5 0 0 1 6 4.5h5.5"/>
    </svg>
  ),
  trash:  (cls="w-5 h-5") => (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M18 7l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7"/>
      <path d="M10 11v6M14 11v6"/>
    </svg>
  ),
  save:   (cls="w-5 h-5") => (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7a2 2 0 0 1 2-2h7l5 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z"/>
      <path d="M7 7h7v6H7zM16 17h2"/>
    </svg>
  ),
  eye:    (cls="w-5 h-5") => (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3.5"/>
    </svg>
  ),
  pdf:    (cls="w-5 h-5") => (
    <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <text x="8" y="17" fontSize="7" fill="#fff" fontFamily="Arial" fontWeight="700">PDF</text>
    </svg>
  ),
};

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
    setPdfName(f.name); setPdfUrl(url); setErr("");
  };
  const clearFile = () => { setPdfName(""); if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const save = () => {
    if (!title.trim()) return setErr("La actividad es obligatoria.");
    if (!due) return setErr("La fecha límite es obligatoria.");
    onSave({ id: crypto.randomUUID(), title: title.trim(), group, pdfUrl, due, delivered: false, grade: null });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-xl">
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <h3 className="font-semibold">Nueva actividad</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}

            <div>
              <label className="text-sm font-medium">Actividad *</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Entregar reporte semanal"
                value={title} onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Grupo</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={group} onChange={(e)=>setGroup(e.target.value)}
              >
                {GROUPS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Recurso (PDF)</label>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={triggerFile}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  {Icon.pdf("w-4 h-4")} Cargar PDF
                </button>
                {pdfName ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-700 truncate max-w-[180px]" title={pdfName}>{pdfName}</span>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Ver</a>
                    <button onClick={clearFile} className="text-slate-500 hover:text-rose-600">Quitar</button>
                  </div>
                ) : <span className="text-sm text-slate-500">Ningún archivo seleccionado</span>}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange}/>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha límite *</label>
              <input type="date"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={due} onChange={(e)=>setDue(e.target.value)}
              />
            </div>
          </div>
          <div className="px-5 py-4 bg-slate-50 flex items-center justify-end gap-3">
            <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-white">Cancelar</button>
            <button onClick={save} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">Guardar</button>
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
  onOpenPdf = (row) => row.pdfUrl ? window.open(row.pdfUrl, "_blank", "noopener") : alert("Sin PDF"),
  onSaveRow = (row) => alert(`Guardado: ${row.title} (grupo: ${(row.group||"").toUpperCase()})`),
  onDeleteExternal,
}) {
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

  const headerTitle = `${title} — ${areaTitle}`;

  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);

  const [groupFilter, setGroupFilter] = useState("todos");

  const data = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.due.localeCompare(b.due));
    return groupFilter === "todos"
      ? sorted
      : sorted.filter(r => (r.group || "").toLowerCase() === groupFilter.toLowerCase());
  }, [rows, groupFilter]);

  const addRow = (r) => setRows((prev) => [...prev, r]);

  const onEdit = (row) => alert(`Editar: ${row.title}`);
  const onDelete = (row) => {
    if (!confirm(`¿Eliminar "${row.title}"?`)) return;
    setRows((prev) => prev.filter((x) => x.id !== row.id));
    onDeleteExternal?.(row);
  };

  const updateGrade = (id, val) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, grade: val === "" ? null : Number(val) } : r)));

  const IconButton = ({ onClick, variant="default", label, children, disabled }) => {
    const base = "inline-grid place-items-center w-9 h-9 rounded-lg border transition";
    const look = {
      default: "border-slate-300 hover:bg-slate-50 text-slate-700",
      danger:  "border-rose-300 text-rose-700 hover:bg-rose-50",
      primary: "border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    }[variant];
    return (
      <button onClick={onClick} title={label} aria-label={label} disabled={disabled}
              className={`${base} ${look} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        {children}
      </button>
    );
  };

  return (
    <section className="w-full">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* Título dinámico */}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{headerTitle}</h2>
          <p className="text-sm text-slate-600">Listado de actividades.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            title="Filtrar por grupo"
          >
            <option value="todos">Todos</option>
            {GROUPS.map(g => (
              <option key={g} value={g}>{g.toUpperCase()}</option>
            ))}
          </select>

          <button onClick={() => setOpen(true)} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2">
            + Nueva actividad
          </button>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr className="border-b">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Actividad</th>
              <th className="px-4 py-3">Recurso</th>
              <th className="px-4 py-3">Fecha límite</th>
              <th className="px-4 py-3">Entregado</th>
              <th className="px-4 py-3">Visualizar</th>
              <th className="px-4 py-3">Calificación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{r.title}</span>
                    {r.group && <Badge className={badgeGroup}>{r.group.toUpperCase()}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <IconButton onClick={() => onOpenPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl}>
                    {Icon.pdf()}
                  </IconButton>
                </td>
                <td className="px-4 py-3">{r.due}</td>
                <td className="px-4 py-3">
                  <Badge className={badgeDelivered(r.delivered)}>{r.delivered ? "Sí" : "No"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <IconButton onClick={() => onView(r)} label="Visualizar">
                    {Icon.eye()}
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
                      {Icon.save()}
                    </IconButton>
                    <IconButton onClick={() => onEdit(r)} label="Editar">
                      {Icon.edit()}
                    </IconButton>
                    <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                      {Icon.trash()}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Sin actividades.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="md:hidden space-y-3">
        {data.map((r, idx) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">No. {idx + 1} • {r.due}</div>
                <div className="font-medium flex items-center gap-2">
                  <span>{r.title}</span>
                  {r.group && <Badge className={badgeGroup}>{r.group.toUpperCase()}</Badge>}
                </div>
              </div>
              <Badge className={badgeDelivered(r.delivered)}>{r.delivered ? "Entregado" : "Pendiente"}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Recurso</div>
              <div className="text-right">
                <IconButton onClick={() => onOpenPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl}>
                  {Icon.pdf()}
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
                {Icon.save()}
              </IconButton>
              <IconButton onClick={() => onView(r)} label="Visualizar">
                {Icon.eye()}
              </IconButton>
              <IconButton onClick={() => onEdit(r)} label="Editar">
                {Icon.edit()}
              </IconButton>
              <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                {Icon.trash()}
              </IconButton>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">Sin actividades.</div>}
      </div>

      {/* MODAL crear */}
      <NewActivityModal open={open} onClose={() => setOpen(false)} onSave={addRow} />
    </section>
  );
}
