import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listActividades as apiListActividades, createActividad as apiCreateActividad, updateActividad as apiUpdateActividad, areaIdFromName, listEntregasActividad } from "../../api/actividades.js";
import { listAreas } from "../../api/areas.js";
import { Eye, FileText, Save, Pencil, Trash2, CalendarDays, Plus, Filter, ArrowLeft, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import dayjs from "dayjs";
import "dayjs/locale/es";
import ConfirmModal from "../shared/ConfirmModal.jsx";

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
  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-2 ${className}`}>
    {children}
  </span>
);
const badgeDelivered = (ok) =>
  ok ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-emerald-300 shadow-md" : "bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-amber-300 shadow-md";
const badgeGroup = "bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-indigo-300 shadow-md";

/* ====== MODAL ====== */
function NewActivityModal({ open, onClose, onSave }) {
  const { user } = useAuth();
  // Obtener grupos del asesor desde el contexto
  const asesorGroups = user?.grupo_asesor ? (Array.isArray(user.grupo_asesor) ? user.grupo_asesor : [user.grupo_asesor]) : [];
  const GROUPS = asesorGroups.length > 0 ? asesorGroups : ["m1", "m2", "m3", "v1", "v2", "v3", "s1", "s2"]; // Fallback si no hay grupos asignados

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
    if (!pdfFile) return setErr("Debes cargar un archivo PDF.");
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 transform transition-all">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Nueva actividad</h3>
                  <p className="text-xs text-white/80">Completa los campos para crear la actividad</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {err && (
              <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-800">{err}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Actividad <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Ej. Entregar reporte semanal"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grupo</label>
              <select
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={group} onChange={(e) => setGroup(e.target.value)}
              >
                {GROUPS.map(g => <option key={g} value={g}>Grupo {g.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Recurso (PDF)</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={triggerFile}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  {pdfName ? 'Reemplazar PDF' : 'Cargar archivo PDF'}
                </button>
                {pdfName ? (
                  <div className="flex items-center justify-between rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate" title={pdfName}>{pdfName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Ver</a>
                      <button onClick={clearFile} className="text-sm font-medium text-rose-600 hover:text-rose-700">Quitar</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center">Ningún archivo seleccionado</p>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha límite <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={due} onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Guardar actividad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditActivityModal({ open, onClose, row, onSave }) {
  const { user } = useAuth();
  // Obtener grupos del asesor desde el contexto
  const asesorGroups = user?.grupo_asesor ? (Array.isArray(user.grupo_asesor) ? user.grupo_asesor : [user.grupo_asesor]) : [];
  const GROUPS = asesorGroups.length > 0 ? asesorGroups : ["m1", "m2", "m3", "v1", "v2", "v3", "s1", "s2"]; // Fallback si no hay grupos asignados

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
    if (!due) return setErr("La fecha límite es obligatoria.");
    // Validar que haya un PDF (ya sea el original o uno nuevo)
    if (!pdfFile && !row?.pdfUrl) return setErr("Debes cargar un archivo PDF.");
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 transform transition-all">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Editar actividad</h3>
                  <p className="text-xs text-white/80">Modifica los campos necesarios</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {err && (
              <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-800">{err}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Actividad <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Ej. Entregar reporte semanal"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grupo</label>
              <select
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={group} onChange={(e) => setGroup(e.target.value)}
              >
                {GROUPS.map(g => <option key={g} value={g}>Grupo {g.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Recurso (PDF)</label>
              <div className="space-y-2">
                {row?.pdfUrl && !pdfFile && (
                  <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-700">Recurso actual</span>
                      </div>
                      <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        Ver PDF
                      </a>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={triggerFile}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  {pdfFile ? 'Reemplazar PDF' : 'Subir/Reemplazar PDF'}
                </button>
                {pdfName ? (
                  <div className="flex items-center justify-between rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate" title={pdfName}>{pdfName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Ver</a>
                      <button onClick={clearFile} className="text-sm font-medium text-rose-600 hover:text-rose-700">Quitar</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center">{row?.pdfUrl ? 'Usando recurso actual' : 'Ningún archivo seleccionado'}</p>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha límite</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={due} onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Guardar cambios
            </button>
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
  onSaveRow = (row) => alert(`Guardado: ${row.title} (grupo: ${(row.group || "").toUpperCase()})`),
  onDeleteExternal,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Obtener grupos del asesor desde el contexto para el filtro
  const asesorGroups = user?.grupo_asesor ? (Array.isArray(user.grupo_asesor) ? user.grupo_asesor : [user.grupo_asesor]) : [];
  const GROUPS = asesorGroups.length > 0 ? asesorGroups : ["m1", "m2", "m3", "v1", "v2", "v3", "s1", "s2"]; // Fallback si no hay grupos asignados

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
  // Stats reales desde entregas (deriva estado y calificación promedio)
  // actividadId -> { entregasCount, calificadasCount, promedio10 }
  const [activityStats, setActivityStats] = useState({});

  const [groupFilter, setGroupFilter] = useState("todos");
  // Modal de recurso no disponible
  const [resModal, setResModal] = useState({ open: false, title: '', message: '', row: null });
  // Modal de confirmación para eliminar
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    row: null,
    message: '',
    onConfirm: null,
  });
  // Modal de error (para reemplazar alert)
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: '',
  });

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

        let id_area = areaIdFromName(areaTitle);

        // Si no lo encontramos en el mapa estático, buscarlo dinámicamente
        if (!id_area && areaTitle) {
          try {
            const { data: areasList } = await listAreas();
            const found = (Array.isArray(areasList) ? areasList : []).find(
              a => (a.nombre || a.titulo || '').toLowerCase().trim() === areaTitle.toLowerCase().trim()
            );
            if (found) id_area = found.id;
          } catch (errArea) {
            console.warn("No se pudo cargar la lista dinámica de áreas", errArea);
          }
        }

        const params = { tipo: 'actividad', limit: 200, activo: 1 };
        if (id_area) params.id_area = id_area;
        // Si no hay id_area, es posible que queramos evitar cargar TODAS las actividades si estamos en un contexto de módulo específico.
        // Pero el backend suele devolver todo si falta id_area.
        // Si el usuario espera ver vacío en lugar de todo cuando falla el ID:
        // if (!id_area) { setRows([]); return; } 

        const { data: acts } = await apiListActividades(params);
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
        if (alive) setError(e.message || 'No se pudieron cargar las actividades');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [areaTitle]);

  // Cargar calificaciones promedio de cada actividad
  useEffect(() => {
    if (rows.length === 0) return;
    let alive = true;
    (async () => {
      const nextStats = {};
      for (const row of rows) {
        try {
          const { data: entregas } = await listEntregasActividad(row.id, { limit: 500 });
          const entregasArray = Array.isArray(entregas) ? entregas : [];
          const calificadas = entregasArray.filter(e => e.calificacion !== null && e.calificacion !== undefined);
          const entregasCount = entregasArray.length;
          const calificadasCount = calificadas.length;
          if (calificadas.length > 0) {
            // Las calificaciones en BD están en escala 0-100 (nuevas) o 0-10 (antiguas)
            // Detectar la escala: si alguna calificación es > 10, están en escala 0-100
            const tieneEscala100 = calificadas.some(e => Number(e.calificacion || 0) > 10);

            let promedio10;
            if (tieneEscala100) {
              // Calificaciones en escala 0-100: calcular promedio y convertir a 0-10
              const suma = calificadas.reduce((acc, e) => acc + Number(e.calificacion || 0), 0);
              const promedio100 = suma / calificadas.length;
              promedio10 = promedio100 / 10;
            } else {
              // Calificaciones en escala 0-10: calcular promedio directamente
              const suma = calificadas.reduce((acc, e) => acc + Number(e.calificacion || 0), 0);
              promedio10 = suma / calificadas.length;
            }
            nextStats[row.id] = {
              entregasCount,
              calificadasCount,
              promedio10: Math.round(promedio10 * 10) / 10, // 1 decimal
            };
          } else {
            nextStats[row.id] = { entregasCount, calificadasCount, promedio10: undefined };
          }
        } catch (e) {
          // Silencioso, no afecta la carga principal
          // Mantener undefined si falla; no asumimos "pendiente" por error de red.
        }
      }
      if (alive) setActivityStats(nextStats);
    })();
    return () => { alive = false; };
  }, [rows]);

  const getEstadoActividad = (actividadId) => {
    const st = activityStats?.[actividadId];
    const entregasCount = Number(st?.entregasCount || 0);
    const calificadasCount = Number(st?.calificadasCount || 0);
    if (calificadasCount > 0) return { key: 'calificada', label: '✓ Calificada' };
    if (entregasCount > 0) return { key: 'entregada', label: '⏳ Entregada' };
    return { key: 'pendiente', label: '○ Pendiente' };
  };

  const badgeEstadoActividad = (key) => {
    if (key === 'calificada') return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-emerald-300 shadow-md";
    if (key === 'entregada') return "bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-indigo-300 shadow-md";
    return "bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-amber-300 shadow-md";
  };

  const data = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.due.localeCompare(b.due));
    return groupFilter === "todos"
      ? sorted
      : sorted.filter(r => (r.group || "").toLowerCase() === groupFilter.toLowerCase());
  }, [rows, groupFilter]);

  const summaryCounts = useMemo(() => {
    const entregadas = data.filter(r => Number(activityStats?.[r.id]?.entregasCount || 0) > 0).length;
    const pendientes = data.length - entregadas;
    return { entregadas, pendientes };
  }, [data, activityStats]);

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
  const onDelete = (row) => {
    setConfirmModal({
      isOpen: true,
      row,
      message: `¿Eliminar (desactivar) "${row.title}"?`,
      onConfirm: async () => {
        try {
          await apiUpdateActividad(row.id, { activo: 0 }); // soft-delete vía activo=0
          setRows((prev) => prev.filter((x) => x.id !== row.id));
          onDeleteExternal?.(row);
          setConfirmModal({ isOpen: false, row: null, message: '', onConfirm: null });
        } catch (e) {
          setConfirmModal({ isOpen: false, row: null, message: '', onConfirm: null });
          setErrorModal({
            isOpen: true,
            message: e.message || 'No se pudo eliminar',
          });
        }
      },
    });
  };

  // Nota: El “estado” aquí debe ser derivado de entregas/calificaciones reales,
  // no editable localmente (si no, al refrescar se revierte).

  const IconButton = ({ onClick, variant = "default", label, children, disabled }) => {
    const base = "inline-grid place-items-center w-11 h-11 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg";
    const look = {
      default: "border-slate-200 bg-slate-100 hover:bg-gradient-to-br hover:from-slate-200 hover:to-slate-300 hover:border-slate-300 text-slate-700 focus:ring-slate-300",
      danger: "border-rose-300 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:border-rose-400 text-white focus:ring-rose-300",
      primary: "border-indigo-300 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:border-indigo-400 text-white focus:ring-indigo-300",
    }[variant];
    return (
      <button onClick={onClick} title={label} aria-label={label} disabled={disabled}
        className={`${base} ${look} ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}`}>
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
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {error && (
        <div className="mb-4 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-3 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      {/* Header mejorado */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">{areaTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                title="Filtrar por grupo"
              >
                <option value="todos">Todos los grupos</option>
                {GROUPS.map(g => (
                  <option key={g} value={g}>Grupo {g.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold px-5 py-2.5 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Nueva actividad
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-lg ring-2 ring-slate-100/50 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total</div>
            <div className="text-3xl font-extrabold text-slate-900">{data.length}</div>
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white p-5 shadow-lg ring-2 ring-emerald-100/50 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Entregadas</div>
            <div className="text-3xl font-extrabold text-emerald-700">{summaryCounts.entregadas}</div>
          </div>
          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100/50 to-white p-5 shadow-lg ring-2 ring-amber-100/50 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Pendientes</div>
            <div className="text-3xl font-extrabold text-amber-700">{summaryCounts.pendientes}</div>
          </div>
          <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-100/50 to-white p-5 shadow-lg ring-2 ring-indigo-100/50 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Con recurso</div>
            <div className="text-3xl font-extrabold text-indigo-700">{data.filter(r => r.pdfUrl).length}</div>
          </div>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl ring-2 ring-slate-100/50">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0">
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">No.</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Actividad</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Recurso</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Fecha límite</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Estado</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Calificación</th>
              <th className="px-6 py-5 text-slate-700 text-xs font-extrabold uppercase tracking-widest">Visualizar</th>
              <th className="px-6 py-5 text-right text-slate-700 text-xs font-extrabold uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-48 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-200/70 rounded-xl animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-9 w-28 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-7 w-24 bg-slate-200/70 rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200/70 rounded-lg animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-200/70 rounded-xl animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-10 w-36 ml-auto bg-slate-200/70 rounded-xl animate-pulse" /></td>
                </tr>
              ))
            )}
            {!loading && data.map((r, idx) => (
              <tr key={r.id} className="border-b border-slate-200 last:border-0 bg-white hover:bg-gradient-to-r hover:from-violet-50/30 hover:via-indigo-50/30 hover:to-purple-50/30 transition-all duration-200 group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-500">#{idx + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors text-sm">{r.title}</div>
                    </div>
                    {r.group && (
                      <Badge className={`${badgeGroup} shrink-0`}>{r.group.toUpperCase()}</Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <IconButton onClick={() => openPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl} variant={r.pdfUrl ? "primary" : "default"}>
                    <FileText className="w-5 h-5" />
                  </IconButton>
                </td>
                <td className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 ring-1 ring-blue-100">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-700 text-sm">{formatDate(r.due)}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {(() => {
                    const st = getEstadoActividad(r.id);
                    return (
                      <Badge className={badgeEstadoActividad(st.key)}>
                        {st.label}
                      </Badge>
                    );
                  })()}
                </td>
                <td className="px-6 py-5">
                  {activityStats?.[r.id]?.promedio10 !== undefined ? (
                    <div className={`inline-flex items-center justify-center px-3 py-2 rounded-xl font-bold text-sm ring-2 ${activityStats[r.id].promedio10 < 6
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white ring-rose-300 shadow-md'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-emerald-300 shadow-md'
                      }`}>
                      {Number(activityStats[r.id].promedio10).toFixed(1)}/10
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium">—</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <IconButton onClick={() => goToEntregas(r)} label="Visualizar entregas" variant="primary">
                    <Eye className="w-5 h-5" />
                  </IconButton>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <IconButton onClick={() => onSaveRow(r)} label="Guardar" variant="primary">
                      <Save className="w-4 h-4" />
                    </IconButton>
                    <IconButton onClick={() => openEdit(r)} label="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 ring-4 ring-violet-200 flex items-center justify-center shadow-lg">
                      <FileText className="w-10 h-10 text-violet-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-700">No hay actividades</p>
                      <p className="text-sm text-slate-500">
                        Crea tu primera actividad con el botón
                        <span className="mx-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 font-bold text-white shadow-md">
                          Nueva actividad
                        </span>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards móvil mejoradas */}
      <div className="md:hidden space-y-4">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`m-skeleton-${i}`} className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-5 w-32 bg-slate-200/70 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-48 bg-slate-200/70 rounded-lg animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-slate-200/70 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-200/70 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
        {!loading && data.map((r, idx) => (
          <div key={r.id} className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">#{idx + 1}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="font-medium">{formatDate(r.due)}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-2 leading-tight">{r.title}</h3>
                {r.group && (
                  <Badge className={`${badgeGroup} inline-block`}>{r.group.toUpperCase()}</Badge>
                )}
              </div>
              {(() => {
                const st = getEstadoActividad(r.id);
                return (
                  <Badge className={badgeEstadoActividad(st.key)}>
                    {st.label}
                  </Badge>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
                <div className="text-xs font-medium text-slate-500 mb-2">Recurso</div>
                <div className="flex justify-start">
                  <IconButton onClick={() => openPdf(r)} label="Abrir PDF" disabled={!r.pdfUrl} variant={r.pdfUrl ? "primary" : "default"}>
                    <FileText className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
              <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
                <div className="text-xs font-medium text-slate-500 mb-2">Calificación</div>
                <div className="flex justify-start">
                  {activityStats?.[r.id]?.promedio10 !== undefined ? (
                    <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${activityStats[r.id].promedio10 < 6
                      ? 'bg-rose-50 text-rose-700 border-2 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      }`}>
                      {Number(activityStats[r.id].promedio10).toFixed(1)}/10
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium text-sm">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200">
              <IconButton onClick={() => onSaveRow(r)} label="Guardar" variant="primary">
                <Save className="w-4 h-4" />
              </IconButton>
              <IconButton onClick={() => goToEntregas(r)} label="Visualizar" variant="primary">
                <Eye className="w-4 h-4" />
              </IconButton>
              <IconButton onClick={() => openEdit(r)} label="Editar">
                <Pencil className="w-4 h-4" />
              </IconButton>
              <IconButton onClick={() => onDelete(r)} label="Eliminar" variant="danger">
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700">No hay actividades</p>
                <p className="text-sm text-slate-500 mt-1">Crea tu primera actividad para comenzar</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL crear */}
      <NewActivityModal open={open} onClose={() => setOpen(false)} onSave={addRow} />
      <EditActivityModal open={editOpen} onClose={() => { setEditOpen(false); setEditRow(null); }} row={editRow} onSave={saveEdit} />

      {/* Modal: Recurso no disponible */}
      {resModal.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setResModal({ open: false, title: '', message: '', row: null })} />
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
                <button onClick={() => setResModal({ open: false, title: '', message: '', row: null })} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">✕</button>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-slate-700">{resModal.message}</p>
              </div>
              <div className="flex justify-end gap-2 border-t px-3 py-2.5">
                {resModal.row && (
                  <button
                    onClick={() => { const r = resModal.row; setResModal({ open: false, title: '', message: '', row: null }); if (r) openEdit(r); }}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Editar actividad
                  </button>
                )}
                <button
                  onClick={() => setResModal({ open: false, title: '', message: '', row: null })}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        variant="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, row: null, message: '', onConfirm: null })}
      />

      {/* Modal de error */}
      <ConfirmModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        variant="default"
        confirmText="Aceptar"
        cancelText={null}
        onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
        onCancel={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </section>
  );
}
