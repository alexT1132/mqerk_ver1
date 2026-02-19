// Agenda.jsx (calendario) - (ajuste responsive)
import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, X, Clock, Tag, AlertCircle, CheckCircle2, Search, Filter, Users, User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  listRemindersPersonal,
  createReminderPersonal,
  updateReminderPersonal,
  deleteReminderPersonal,
  createReminderForStudents,
  listRemindersForStudents,
  deleteReminderForStudents,
} from "../../api/asesores.js";
import { getMisEstudiantes } from "../../api/asesores.js";

/* ---------- categorías/leyenda ---------- */
const CATEGORIES = {
  tareas: { name: "Actividades / Tareas", dot: "bg-amber-500", color: "bg-amber-100 text-amber-800 border-amber-200" },
  simuladores: { name: "Simuladores", dot: "bg-fuchsia-500", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
  conferencias: { name: "Conferencias / talleres", dot: "bg-green-500", color: "bg-green-100 text-green-800 border-green-200" },
  pago: { name: "Fecha de pago", dot: "bg-violet-500", color: "bg-violet-100 text-violet-800 border-violet-200" },
  examenes: { name: "Exámenes / Evaluaciones", dot: "bg-blue-500", color: "bg-blue-100 text-blue-800 border-blue-200" },
  asesorias: { name: "Asesorías", dot: "bg-rose-500", color: "bg-rose-100 text-rose-800 border-rose-200" },
  recordatorio: { name: "Recordatorio", dot: "bg-teal-500", color: "bg-teal-100 text-teal-800 border-teal-200" },
};

const monthNames = "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_");

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
// Función para convertir Date a YYYY-MM-DD usando fecha local (no UTC) para evitar problemas de zona horaria
function toISO(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
// Función helper para parsear fechas YYYY-MM-DD sin problemas de zona horaria
function parseLocalDate(dateStr) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}
// Función helper para parsear fecha y hora sin problemas de zona horaria
function parseLocalDateTime(dateStr, timeStr = null) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month, day, hours, minutes || 0, 0);
  }
  return new Date(year, month, day, 0, 0, 0);
}

/* =========================================================
   MODAL: Crear/Editar Recordatorio
========================================================= */
function ReminderModal({ open, onClose, onSave, defaultDate, eventToEdit, grupos, estudiantes, onLoadEstudiantes }) {
  const PRIORITIES = [
    { key: "red", ring: "ring-red-300", bg: "bg-red-500", name: "Alta" },
    { key: "orange", ring: "ring-orange-300", bg: "bg-orange-500", name: "Media-Alta" },
    { key: "amber", ring: "ring-amber-300", bg: "bg-amber-400", name: "Media" },
    { key: "green", ring: "ring-green-300", bg: "bg-green-500", name: "Baja" },
    { key: "blue", ring: "ring-blue-300", bg: "bg-blue-600", name: "Normal" },
    { key: "violet", ring: "ring-violet-300", bg: "bg-violet-500", name: "Personal" },
  ];

  const [type, setType] = useState("personal"); // "personal" o "estudiantes"
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("recordatorio");
  const [priority, setPriority] = useState("blue");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Opciones para estudiantes
  const [targetType, setTargetType] = useState("grupo"); // "grupo" o "estudiante"
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  useEffect(() => {
    if (open) {
      if (eventToEdit) {
        setName(eventToEdit.title || "");
        setDesc(eventToEdit.description || "");
        setDate(eventToEdit.date || "");
        setTime(eventToEdit.time || "");
        setCategory(eventToEdit.category || eventToEdit.cat || "recordatorio");
        setPriority(eventToEdit.priority || "blue");
        setType(eventToEdit.type || "personal");
      } else {
        setName("");
        setDesc("");
        setTime("");
        setCategory("recordatorio");
        setPriority("blue");
        setType("personal");
        setDate(defaultDate || "");
        setTargetType("grupo");
        setSelectedGrupo("");
        setSelectedEstudiantes([]);
      }
      setError("");
    }
  }, [open, defaultDate, eventToEdit]);

  // Cargar estudiantes cuando se selecciona un grupo o mostrar todos
  useEffect(() => {
    if (type !== "estudiantes") {
      setEstudiantesFiltrados([]);
      return;
    }

    if (targetType === "estudiante") {
      if (selectedGrupo) {
        if (onLoadEstudiantes) {
          setLoadingEstudiantes(true);
          onLoadEstudiantes(selectedGrupo)
            .then(loaded => {
              setEstudiantesFiltrados(loaded || []);
            })
            .catch(err => {
              console.error("Error cargando estudiantes:", err);
              setEstudiantesFiltrados([]);
            })
            .finally(() => {
              setLoadingEstudiantes(false);
            });
        } else {
          setEstudiantesFiltrados(estudiantes.filter(e => e.grupo === selectedGrupo));
        }
      } else {
        // Mostrar TODOS los estudiantes si no hay grupo seleccionado
        setEstudiantesFiltrados(estudiantes || []);
      }
    } else {
      setEstudiantesFiltrados([]);
    }

    if (targetType === "grupo") {
      setSelectedEstudiantes([]);
    }
  }, [type, targetType, selectedGrupo, estudiantes, onLoadEstudiantes]);

  const save = async () => {
    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (!date) return setError("La fecha es obligatoria.");

    if (type === "estudiantes") {
      if (targetType === "grupo" && !selectedGrupo) {
        return setError("Debes seleccionar un grupo.");
      }
      if (targetType === "estudiante" && selectedEstudiantes.length === 0) {
        return setError("Debes seleccionar al menos un estudiante.");
      }
    }

    setSaving(true);
    setError("");

    try {
      // Normalizar fecha para evitar problemas de zona horaria
      // El input type="date" devuelve YYYY-MM-DD, lo usamos directamente
      const normalizedDate = date; // Ya viene en formato YYYY-MM-DD

      const reminderData = {
        title: name.trim(),
        description: desc.trim() || null,
        date: normalizedDate,
        time: time || null,
        category: category || "recordatorio",
        priority,
      };

      if (type === "personal") {
        await onSave(reminderData, "personal", eventToEdit?.id);
      } else {
        // Para estudiantes
        if (targetType === "grupo") {
          await onSave({ ...reminderData, grupo: selectedGrupo }, "estudiantes", null);
        } else {
          await onSave({ ...reminderData, studentIds: selectedEstudiantes }, "estudiantes", null);
        }
      }
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Error al guardar el recordatorio");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* modal - Más amplio y responsive */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-white z-[101] flex flex-col border border-slate-200 max-h-[90vh]">
        {/* header - Más sobrio */}
        <div className="px-5 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                <CalendarIcon className="size-5" />
              </div>
              <h3 className="font-bold text-lg">
                {eventToEdit ? "Editar Recordatorio" : "Crear Recordatorio"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-95 text-white/70 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* body compacto - Altura fija con scroll */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0 text-sm">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold shadow-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de recordatorio compacto */}
          {!eventToEdit && (
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType("personal")}
                  className={`p-4 rounded-xl border transition-all duration-200 ${type === "personal"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                >
                  <User className="size-5 mx-auto mb-2" />
                  <div className="font-bold text-sm">Personal</div>
                  <div className="text-[10px] opacity-70">Para uso propio</div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("estudiantes")}
                  className={`p-4 rounded-xl border transition-all duration-200 ${type === "estudiantes"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                >
                  <Users className="size-5 mx-auto mb-2" />
                  <div className="font-bold text-sm">Estudiantes</div>
                  <div className="text-[10px] opacity-70">Grupal o individual</div>
                </button>
              </div>
            </div>
          )}

          {/* Campos comunes compactos */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Entrega de proyecto"
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">Descripción</label>
            <textarea
              rows={2}
              placeholder="Detalles del recordatorio…"
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all font-medium"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">Hora</label>
              <input
                type="time"
                className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">Categoría</label>
            <select
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">Prioridad</label>
            <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={[
                    "relative w-8 h-8 rounded-full border transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm",
                    p.bg,
                    priority === p.key ? "ring-2 ring-indigo-500 border-white" : "border-transparent"
                  ].join(" ")}
                  title={p.name}
                  aria-label={p.name}
                >
                  {priority === p.key && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                      <CheckCircle2 className="size-2 text-violet-600" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Opciones para estudiantes compactas */}
          {type === "estudiantes" && !eventToEdit && (
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                  Asignar a <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType("grupo")}
                    className={`p-3 rounded-xl border transition-all duration-200 ${targetType === "grupo"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    <div className="font-bold text-sm">Grupo completo</div>
                    <div className="text-[10px] opacity-70">Todos los estudiantes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("estudiante")}
                    className={`p-3 rounded-xl border transition-all duration-200 ${targetType === "estudiante"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    <div className="font-bold text-sm">Específico(s)</div>
                    <div className="text-[10px] opacity-70">Seleccionar uno o más</div>
                  </button>
                </div>
              </div>

              {targetType === "grupo" && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                    Grupo <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium"
                    value={selectedGrupo}
                    onChange={(e) => setSelectedGrupo(e.target.value)}
                  >
                    <option value="">Selecciona un grupo</option>
                    {grupos.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === "estudiante" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Filtrar por Grupo (opcional)
                    </label>
                    <select
                      className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium"
                      value={selectedGrupo}
                      onChange={(e) => {
                        setSelectedGrupo(e.target.value);
                      }}
                    >
                      <option value="">Todos los grupos / estudiantes</option>
                      {grupos.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Seleccionar Estudiante(s) <span className="text-red-500">*</span>
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50">
                      {loadingEstudiantes ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-5 animate-spin text-indigo-600" />
                        </div>
                      ) : estudiantesFiltrados.length === 0 ? (
                        <div className="text-center text-slate-500 text-xs py-6 font-medium">
                          No se encontraron estudiantes
                        </div>
                      ) : (
                        estudiantesFiltrados.map(est => (
                          <label
                            key={est.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedEstudiantes.includes(est.id)
                              ? "bg-indigo-50 border-indigo-200 shadow-sm"
                              : "bg-white border-transparent hover:border-slate-200"}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEstudiantes.includes(est.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEstudiantes([...selectedEstudiantes, est.id]);
                                } else {
                                  setSelectedEstudiantes(selectedEstudiantes.filter(id => id !== est.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-slate-900 truncate uppercase tracking-tight">
                                {est.nombres || est.nombre} {est.apellidos || est.apellido}
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold">
                                {est.folio_formateado || est.folio || ""} {est.grupo ? `• GRUPO ${est.grupo}` : ""}
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedEstudiantes.length > 0 && (
                      <div className="mt-2 text-xs font-bold text-indigo-600 flex items-center gap-1.5 px-1">
                        <CheckCircle2 className="size-3.5" />
                        {selectedEstudiantes.length} estudiante(s) seleccionado(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-white hover:border-slate-300 transition-all font-bold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              eventToEdit ? "Actualizar" : "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   LISTA EVENTOS / LEYENDA / CALENDARIO
========================================================= */
function Chip({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}

function DatePill({ date }) {
  // Usar función helper para parsear fecha local sin problemas de zona horaria
  const d = parseLocalDate(date);
  const m = d.toLocaleString("es-MX", { month: "short" }).toUpperCase().replace('.', '');
  const day = d.getDate();

  return (
    <div className="w-11 shrink-0 grid place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white text-center py-1.5 shadow-sm ring-1 ring-violet-200">
      <div className="text-[7px] font-extrabold opacity-95 tracking-tight leading-none mb-0.5">{m}</div>
      <div className="text-base font-extrabold leading-none">{day}</div>
    </div>
  );
}

function EventItem({ ev, onEdit, onDelete, onToggleCompleted, onViewDetails }) {
  const category = CATEGORIES[ev.category || ev.cat] || CATEGORIES.recordatorio;

  // Usar estado local para forzar actualización cada minuto, o confiar en el padre
  // Aquí usamos Date() directo, asumiendo que el padre fuerza re-render
  const now = new Date();
  const eventDateTime = parseLocalDateTime(ev.date, ev.time);
  const isPast = eventDateTime < now;
  const isCompleted = ev.completed === true || ev.completed === 1;

  return (
    <div
      className={`group flex items-start gap-2.5 p-2 sm:p-2.5 border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-all duration-150 cursor-pointer ${isPast && !isCompleted ? "opacity-75" : ""} ${isCompleted ? "bg-emerald-50/10" : ""}`}
      onClick={() => onViewDetails && onViewDetails(ev)}
    >
      <DatePill date={ev.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap -mt-0.5">
              <h4 className={`font-bold text-sm leading-snug ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>{ev.title}</h4>
              {isPast && !isCompleted && (
                <Chip className="bg-slate-50 text-slate-600 border-slate-200 py-0 px-1.5 text-[9px] font-bold">
                  Pasado
                </Chip>
              )}
              {isCompleted && (
                <Chip className="bg-emerald-50 text-emerald-600 border-emerald-100 py-0 px-1.5 text-[9px] font-bold">
                  Listo
                </Chip>
              )}
            </div>
            {ev.description && (
              <p className="text-[10px] text-slate-400 line-clamp-1 italic mb-0.5">{ev.description}</p>
            )}
            {ev.time && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                <Clock className="size-2.5 text-violet-500/70" />
                <span>{ev.time}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleCompleted && ev.type !== 'estudiantes' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompleted(ev.id, !isCompleted);
                }}
                className={`p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm border ${isCompleted
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white"
                  : "bg-white text-slate-400 hover:bg-emerald-500 hover:text-white border-slate-100"
                  }`}
                title={isCompleted ? "Marcar como pendiente" : "Marcar como realizado"}
              >
                <CheckCircle2 className="size-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ev);
                }}
                disabled={isCompleted}
                className="p-1.5 rounded-md bg-white text-slate-400 hover:bg-violet-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100 disabled:opacity-30"
              >
                <Edit2 className="size-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ev.id);
                }}
                className="p-1.5 rounded-md bg-white text-slate-400 hover:bg-rose-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Chip className={`${category.color} py-0 px-1 text-[8px] font-extrabold border-none bg-transparent opacity-80 uppercase tracking-tighter`}>
            <span className={`w-1 h-1 rounded-full ${category.dot} mr-1`}></span>
            {category.name}
          </Chip>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const [isOpen, setIsOpen] = useState(false);
  const entries = Object.entries(CATEGORIES);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 2xl:p-5 shadow-lg ring-1 ring-slate-100/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none"
      >
        <div className="flex items-center gap-3 2xl:gap-4">
          <div className="p-1.5 2xl:p-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            <Tag className="size-4 2xl:size-5" />
          </div>
          <span className="font-bold text-sm 2xl:text-base text-slate-700">
            Leyenda de Eventos
          </span>
        </div>
        <ChevronRight
          className={`size-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-90" : ""
            }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2">
            {entries.map(([k, v]) => (
              <li key={k} className="flex items-center gap-2.5 text-xs 2xl:text-sm group">
                <span className={`w-3 h-3 2xl:w-4 2xl:h-4 rounded-full ${v.dot} shrink-0 ring-1 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-slate-600 font-bold group-hover:text-slate-900 transition-colors uppercase tracking-tight">{v.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL: Detalles del Día
   ========================================================= */
function DayDetailsModal({ open, onClose, date, events, onCreateNew, onViewEvent }) {
  if (!open) return null;

  const displayDate = date ? parseLocalDate(date).toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long' }) : "";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-lg capitalize tracking-tight">{displayDate}</h3>
            <p className="text-slate-400 text-xs font-medium">{events.length} evento{events.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No hay eventos para este día.</div>
          ) : (
            events.map(ev => {
              const cat = CATEGORIES[ev.category || ev.cat] || CATEGORIES.recordatorio;
              const isCompleted = ev.completed === true || ev.completed === 1;
              return (
                <button
                  key={ev.id}
                  onClick={() => onViewEvent(ev)}
                  className={`w-full text-left p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group relative overflow-hidden ${isCompleted ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${cat.dot.replace('bg-', 'bg-')}`} />
                  <div className="pl-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{ev.title}</span>
                      {ev.time && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock className="size-3" /> {ev.time}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">{cat.name}</span>
                      {isCompleted && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle2 className="size-3" /> Listo</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={onCreateNew}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="size-4" /> Agregar evento aquí
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Calendar({ monthDate, setMonthDate, events, onCreate, onDayClick }) {
  const meta = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const startWeekday = (start.getDay() + 6) % 7; // L(0) a D(6)
    const daysInMonth = end.getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      cells.push(date);
    }
    const map = events.reduce((acc, e) => {
      (acc[e.date] ||= []).push(e);
      return acc;
    }, {});
    return { start, cells, map };
  }, [monthDate, events]);

  const go = (n) => setMonthDate(addMonths(monthDate, n));
  const dayLabel = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-5 2xl:py-7 bg-slate-900 text-white shadow-md">
        <button
          onClick={() => go(-1)}
          className="p-2.5 2xl:p-3.5 rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95 text-slate-400 hover:text-white border border-white/10"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-5 2xl:size-7" />
        </button>
        <div className="text-lg sm:text-xl 2xl:text-3xl font-extrabold uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon className="size-5 sm:size-6 2xl:size-8" />
          <span>{monthNames[monthDate.getMonth()].toUpperCase()} {monthDate.getFullYear()}</span>
        </div>
        <button
          onClick={() => go(1)}
          className="p-2.5 2xl:p-3.5 rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95 text-slate-400 hover:text-white border border-white/10"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-5 2xl:size-7" />
        </button>
      </div>

      {/* labels */}
      <div className="grid grid-cols-7 text-center text-[10px] 2xl:text-sm font-bold text-slate-400 px-2 sm:px-3 py-3 2xl:py-5 bg-slate-50 border-b border-slate-200">
        {dayLabel.map((d) => (
          <div key={d} className="py-1 tracking-widest uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* celdas */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {meta.cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="bg-white h-12 sm:h-14 lg:h-16 2xl:h-28 min-[2200px]:h-32" />;
          const iso = toISO(date);
          const evs = meta.map[iso] || [];
          const today = toISO(new Date()) === iso;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          return (
            <button
              key={iso}
              onClick={(e) => {
                e.stopPropagation();
                // Si hay eventos y se pasa la función para ver detalles, usarla
                if (evs.length > 0 && onDayClick) {
                  onDayClick(iso, evs);
                } else if (onCreate) {
                  // Si no hay eventos, abrir crear
                  onCreate(iso);
                }
              }}
              className={`relative bg-white h-12 sm:h-14 lg:h-16 2xl:h-28 min-[2200px]:h-32 p-1 2xl:p-2 hover:bg-slate-50 transition-all duration-200 cursor-pointer border-r border-b border-slate-100 ${today ? "bg-indigo-50/30" : ""
                } ${isPast ? "opacity-60" : ""}`}
            >
              <div
                className={`text-xs 2xl:text-base font-bold w-7 h-7 2xl:w-10 2xl:h-10 grid place-items-center rounded-full transition-all duration-200 ${today
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {date.getDate()}
              </div>

              {/* Indicadores de eventos */}
              <div className="absolute left-1 bottom-1 right-1 flex flex-col justify-end gap-0.5">
                {evs.length > 3 ? (
                  // Si hay muchos eventos, mostrar solo un badge resumen
                  <div className="text-[10px] font-bold text-slate-500 text-right">
                    +{evs.length}
                  </div>
                ) : (
                  // Si hay pocos eventos, mostrar puntos
                  <div className="flex gap-0.5 flex-wrap justify-end content-end">
                    {evs.map((e) => (
                      <span
                        key={e.id}
                        className={`w-2 h-2 rounded-full ${CATEGORIES[e.category || e.cat]?.dot || "bg-slate-400"} ring-1 ring-white shadow-sm`}
                        title={e.title}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* footer */}
      <div className="p-4 2xl:p-6 bg-slate-50 border-t border-slate-200 flex justify-center">
        <button
          onClick={() => onCreate?.(toISO(new Date()))}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm 2xl:text-lg px-6 py-2.5 2xl:py-4 2xl:px-8 font-bold shadow-sm transition-all duration-200 active:scale-95"
        >
          <Plus className="size-4 2xl:size-6" />
          Nuevo recordatorio
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MODALES PERSONALIZADOS
========================================================= */
function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full z-[201]">
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="size-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-slate-500 text-sm font-medium">{message}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md transition-all duration-200 active:scale-95"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function NotificationModal({ open, onClose, type, title, message }) {
  if (!open) return null;
  const isError = type === "error";
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full z-[201]">
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className={`p-3 rounded-full border ${isError
            ? "bg-rose-50 text-rose-600 border-rose-100"
            : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
            {isError ? <AlertCircle className="size-8" /> : <CheckCircle2 className="size-8" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-slate-500 text-sm font-medium">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`w-full px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 active:scale-95 ${isError
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
        >
          Cerrar
        </button>
      </div>
    </div>,
    document.body
  );
}

/* Modal de Detalles del Recordatorio */
function ReminderDetailsModal({ open, onClose, reminder, onEdit, onDelete, onToggleCompleted }) {
  if (!open || !reminder) return null;

  const category = CATEGORIES[reminder.category || reminder.cat] || CATEGORIES.recordatorio;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = parseLocalDate(reminder.date);
  eventDate.setHours(0, 0, 0, 0);
  const isPast = eventDate < today;
  const isCompleted = reminder.completed === true || reminder.completed === 1;

  // Formatear fecha para mostrar
  const d = parseLocalDate(reminder.date);
  const fechaFormateada = d.toLocaleDateString("es-MX", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const PRIORITIES = {
    red: { name: "Alta", color: "bg-red-100 text-red-800 border-red-200" },
    orange: { name: "Media-Alta", color: "bg-orange-100 text-orange-800 border-orange-200" },
    amber: { name: "Media", color: "bg-amber-100 text-amber-800 border-amber-200" },
    green: { name: "Baja", color: "bg-green-100 text-green-800 border-green-200" },
    blue: { name: "Normal", color: "bg-blue-100 text-blue-800 border-blue-200" },
    violet: { name: "Personal", color: "bg-violet-100 text-violet-800 border-violet-200" },
  };

  const priority = PRIORITIES[reminder.priority] || PRIORITIES.blue;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md sm:max-w-lg md:max-w-2xl w-full z-[201] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Sobrio */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 ring-2 ring-white/30">
                <CalendarIcon className="size-6" />
              </div>
              <h3 className="text-xl font-extrabold">Detalles del Recordatorio</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95 ring-2 ring-white/20 hover:ring-white/40"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Body con scroll */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-5">
            {/* Fecha destacada */}
            <div className="flex items-center gap-4">
              <DatePill date={reminder.date} />
              <div className="flex-1">
                <div className="text-sm text-slate-500 font-medium mb-1">Fecha</div>
                <div className="text-lg font-extrabold text-slate-900 capitalize">{fechaFormateada}</div>
                {reminder.time && (
                  <div className="flex items-center gap-2 mt-2 text-base text-slate-700 font-semibold">
                    <Clock className="size-5 text-violet-600" />
                    <span>{reminder.time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Título */}
            <div>
              <div className="text-sm text-slate-500 font-medium mb-2">Título</div>
              <h2 className={`text-2xl font-extrabold ${isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}>
                {reminder.title}
              </h2>
            </div>

            {/* Descripción */}
            {reminder.description && (
              <div>
                <div className="text-sm text-slate-500 font-medium mb-2">Descripción</div>
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {reminder.description}
                </p>
              </div>
            )}

            {/* Estado y categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500 font-medium mb-2">Estado</div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <Chip className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-2 border-emerald-300 font-bold">
                      <CheckCircle2 className="size-4" /> Realizado
                    </Chip>
                  ) : isPast ? (
                    <Chip className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-2 border-slate-300 font-bold">
                      <Clock className="size-4" /> Pasado
                    </Chip>
                  ) : (
                    <Chip className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-2 border-violet-300 font-bold">
                      <Clock className="size-4" /> Pendiente
                    </Chip>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium mb-2">Categoría</div>
                <Chip className={`${category.color} border-2 font-bold`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${category.dot} ring-2 ring-white`}></span>
                  {category.name}
                </Chip>
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <div className="text-sm text-slate-500 font-medium mb-2">Prioridad</div>
              <Chip className={`${priority.color} border-2 font-bold`}>
                {priority.name}
              </Chip>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleCompleted && (
              <button
                onClick={() => {
                  onToggleCompleted(reminder.id, !isCompleted);
                  onClose();
                }}
                className={`px-4 py-2.5 rounded-xl font-bold shadow-md transition-all duration-200 active:scale-95 ${isCompleted
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
              >
                <CheckCircle2 className="size-4 inline mr-2" />
                {isCompleted ? "Pendiente" : "Realizado"}
              </button>
            )}
            {onEdit && !isCompleted && (
              <button
                onClick={() => {
                  onEdit(reminder);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all duration-200 active:scale-95"
              >
                <Edit2 className="size-4 inline mr-2" />
                Editar
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(reminder.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all duration-200 active:scale-95"
              >
                <Trash2 className="size-4 inline mr-2" />
                Eliminar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white font-bold transition-all duration-200 active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */
export default function AgendaDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesPorGrupo, setEstudiantesPorGrupo] = useState({});
  const [monthDate, setMonthDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [eventToEdit, setEventToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [confirmModal, setConfirmModal] = useState({ open: false, eventId: null });
  const [notificationModal, setNotificationModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [detailsModal, setDetailsModal] = useState({ open: false, reminder: null });
  const [dayDetails, setDayDetails] = useState({ open: false, date: null, events: [] });
  // Estado simple para forzar re-render cada 30s y actualizar visualmente el estatus "Pasado"
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // Cargar recordatorios (personales y para estudiantes)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [personalRes, studentsRes, estudiantesRes] = await Promise.all([
          listRemindersPersonal().catch(() => ({ data: { data: [] } })),
          listRemindersForStudents().catch(() => ({ data: { data: [] } })),
          getMisEstudiantes().catch(() => ({ data: { data: [], grupos_asesor: [] } })),
        ]);

        if (!alive) return;

        // Procesar eventos personales
        const personalEvents = (personalRes.data?.data || []).map(e => {
          let normalizedDate = e.date;
          if (normalizedDate && normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
          }
          return {
            ...e,
            date: normalizedDate,
            type: "personal",
            completed: e.completed === 1 || e.completed === true,
          };
        });

        // Procesar eventos para estudiantes
        const studentRemindersRaw = (studentsRes.data?.data || []).map(e => {
          let normalizedDate = e.date;
          if (normalizedDate && normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
          }
          return {
            ...e,
            date: normalizedDate,
            type: "estudiantes",
            completed: false
          };
        });

        // Agrupar recordatorios de estudiantes para no repetir en la agenda del asesor
        const studentMap = new Map();
        studentRemindersRaw.forEach(r => {
          const key = `${r.title}-${r.date}-${r.description || ''}`;
          if (!studentMap.has(key)) {
            studentMap.set(key, { ...r, isMultiple: true });
          }
        });

        const studentEvents = Array.from(studentMap.values());

        // Actualizar estados auxiliares
        const gruposList = estudiantesRes.data?.grupos_asesor || [];
        setGrupos(Array.isArray(gruposList) ? gruposList : []);
        setEstudiantes(estudiantesRes.data?.data || []);

        setEvents([...personalEvents, ...studentEvents]);
      } catch (e) {
        console.error("Error cargando recordatorios:", e);
        setError(e?.response?.data?.message || "Error al cargar los recordatorios");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Ordenar por fecha (asc)
  const ordered = useMemo(
    () => [...events].sort((a, b) => {
      const dateA = parseLocalDateTime(a.date, a.time);
      const dateB = parseLocalDateTime(b.date, b.time);
      return dateA - dateB;
    }),
    [events]
  );

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    let filtered = ordered;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          (e.description && e.description.toLowerCase().includes(query))
      );
    }
    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => (e.category || e.cat) === filterCategory);
    }
    return filtered;
  }, [ordered, searchQuery, filterCategory]);

  const openCreate = (dateISO) => {
    setEventToEdit(null);
    setModalDate(dateISO || "");
    setOpenModal(true);
  };

  const openEdit = (event) => {
    setEventToEdit(event);
    setModalDate(event.date);
    setOpenModal(true);
  };

  const handleViewDetails = (reminder) => {
    setDetailsModal({ open: true, reminder });
  };

  const handleSave = async (data, type, eventId) => {
    try {
      if (type === "personal") {
        // Normalizar fecha para evitar problemas de zona horaria
        const normalizedData = {
          ...data,
          date: data.date, // Ya viene en formato YYYY-MM-DD del input
        };

        if (eventId) {
          // Actualizar
          await updateReminderPersonal(eventId, normalizedData);
          setEvents(prev => prev.map(e => e.id === eventId ? { ...normalizedData, id: eventId, type: "personal", completed: e.completed || false } : e));
        } else {
          // Crear
          const response = await createReminderPersonal(normalizedData);
          const newEvent = response.data.data;
          // Normalizar fecha del response
          let normalizedDate = newEvent.date;
          if (normalizedDate && normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
          }
          setEvents(prev => [...prev, { ...newEvent, date: normalizedDate, type: "personal", completed: false }]);
        }
      } else {
        // Para estudiantes
        await createReminderForStudents(data);
        // Recargar TODO para tener la lista actualizada (personales y estudiantes)
        const [pRes, sRes] = await Promise.all([
          listRemindersPersonal(),
          listRemindersForStudents()
        ]);

        const pEvs = (pRes.data?.data || []).map(e => {
          let normalizedDate = e.date;
          if (normalizedDate && normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
          }
          return { ...e, date: normalizedDate, type: "personal", completed: e.completed === 1 || e.completed === true };
        });

        const sRemRaw = (sRes.data?.data || []).map(e => {
          let normalizedDate = e.date;
          if (normalizedDate && normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
          }
          return { ...e, date: normalizedDate, type: "estudiantes", completed: false };
        });

        const sMap = new Map();
        sRemRaw.forEach(r => {
          const key = `${r.title}-${r.date}-${r.description || ''}`;
          if (!sMap.has(key)) sMap.set(key, { ...r, isMultiple: true });
        });

        const sEvs = Array.from(sMap.values());
        setEvents([...pEvs, ...sEvs]);
      }
      setOpenModal(false);
      setEventToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleToggleCompleted = async (id, completed) => {
    // Buscar el evento para saber su tipo
    const event = events.find(e => e.id === id);
    if (!event || event.type === 'estudiantes') {
      // Los de estudiantes no se completan desde aquí (cada estudiante lo hace)
      return;
    }

    try {
      await updateReminderPersonal(id, { completed });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, completed } : e));
      setNotificationModal({
        open: true,
        type: "success",
        title: completed ? "Recordatorio marcado como realizado" : "Recordatorio marcado como pendiente",
        message: completed ? "El recordatorio ha sido marcado como realizado" : "El recordatorio ha sido marcado como pendiente"
      });
    } catch (err) {
      setNotificationModal({
        open: true,
        type: "error",
        title: "Error",
        message: err?.response?.data?.message || "Error al actualizar el recordatorio"
      });
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({ open: true, eventId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.eventId) return;
    const event = events.find(e => e.id === confirmModal.eventId);
    if (!event) return;

    try {
      if (event.type === 'estudiantes') {
        await deleteReminderForStudents(confirmModal.eventId);
      } else {
        await deleteReminderPersonal(confirmModal.eventId);
      }

      // Recargar para limpiar posibles duplicados del mismo broadcast
      const [pRes, sRes] = await Promise.all([
        listRemindersPersonal().catch(() => ({ data: { data: [] } })),
        listRemindersForStudents().catch(() => ({ data: { data: [] } }))
      ]);

      const pEvs = (pRes.data?.data || []).map(e => ({ ...e, type: "personal", completed: e.completed === 1 || e.completed === true }));
      const sRemRaw = (sRes.data?.data || []).map(e => ({ ...e, type: "estudiantes", completed: false }));

      const sMap = new Map();
      sRemRaw.forEach(r => {
        const key = `${r.title}-${r.date}-${r.description || ''}`;
        if (!sMap.has(key)) sMap.set(key, { ...r, isMultiple: true });
      });

      setEvents([...pEvs, ...Array.from(sMap.values())]);

      setNotificationModal({
        open: true,
        type: "success",
        title: "Recordatorio eliminado",
        message: "El recordatorio se ha eliminado correctamente"
      });
    } catch (err) {
      setNotificationModal({
        open: true,
        type: "error",
        title: "Error al eliminar",
        message: err?.response?.data?.message || "Error al eliminar el recordatorio"
      });
    }
  };

  // Marcar automáticamente como realizado los recordatorios pasados
  // Verificar y marcar como completados cada vez que el reloj avanza (tick)
  useEffect(() => {
    if (loading || events.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const toMarkAsCompleted = events.filter(e => {
      // Si ya está completado, ignorar
      if (e.completed) return false;

      const eventDate = parseLocalDate(e.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        // Fecha pasada (ayer o antes), marcar como realizado
        return true;
      } else if (eventDate.getTime() === today.getTime() && e.time) {
        // Misma fecha (hoy), verificar si la hora ya pasó
        const eventDateTime = parseLocalDateTime(e.date, e.time);
        return eventDateTime < now;
      }

      return false;
    });

    // Marcar como realizado en lote (solo si hay recordatorios para marcar)
    if (toMarkAsCompleted.length > 0) {
      const idsToMark = toMarkAsCompleted.map(e => e.id);

      // Actualizar visualmente DE INMEDIATO para feedback instantáneo
      setEvents(prev => prev.map(e => {
        if (idsToMark.includes(e.id)) {
          return { ...e, completed: true };
        }
        return e;
      }));

      // Luego sincronizar con BD
      Promise.all(
        toMarkAsCompleted.map(e =>
          updateReminderPersonal(e.id, { completed: true }).catch(err => {
            console.error('Error marcando recordatorio como realizado:', err);
            return null;
          })
        )
      );
    }
  }, [tick, loading, events]); // Se ejecuta en cada tick (5s)

  const upcomingEvents = filteredEvents.filter((e) => {
    const eventDate = parseLocalDate(e.date);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today && !e.completed;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* Fondo fijo independiente del scroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-[1920px] w-full 2xl:max-w-none px-4 sm:px-6 lg:px-8 2xl:px-4 py-6 sm:py-8 2xl:py-10">
          {/* Header */}
          <div className="mb-8 sm:mb-10 2xl:mb-12">
            <div className="flex items-center gap-4 mb-4 2xl:gap-6 2xl:mb-6">
              <div className="p-4 2xl:p-5 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 shadow-xl ring-4 ring-violet-200">
                <CalendarIcon className="size-8 sm:size-10 2xl:size-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold mb-2 tracking-tight leading-normal text-slate-900">
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block pb-4">
                    Agenda y Calendario
                  </span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base 2xl:text-lg font-medium">
                  Organiza tus actividades y mantén al día a tus estudiantes
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 2xl:gap-10 items-start">
            {/* Calendario */}
            <section className="space-y-4 2xl:space-y-6">
              <Calendar
                monthDate={monthDate}
                setMonthDate={setMonthDate}
                events={events}
                onCreate={openCreate}
                onDayClick={(date, dayEvents) => {
                  setDayDetails({
                    open: true,
                    date: date,
                    events: dayEvents || []
                  });
                }}
              />
              <Legend />
            </section>

            {/* Eventos */}
            <section className="space-y-4 2xl:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 2xl:mb-6">
                <div className="flex items-center gap-3 2xl:gap-4">
                  <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Recordatorios
                  </h2>
                  {upcomingEvents.length > 0 && (
                    <span className="inline-flex items-center justify-center bg-violet-100 text-violet-700 text-xs 2xl:text-sm font-bold px-2.5 py-0.5 2xl:px-3 2xl:py-1 rounded-full border border-violet-200">
                      {upcomingEvents.length} pendientes
                    </span>
                  )}
                </div>
              </div>

              {/* Filtros y búsqueda */}
              <div className="space-y-3 2xl:space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 2xl:p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                    <Search className="size-4 2xl:size-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar recordatorios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 2xl:py-4 2xl:text-base rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 2xl:p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                    <Filter className="size-4 2xl:size-5" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 px-4 py-3 2xl:py-4 2xl:text-base rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all bg-white shadow-sm hover:shadow-md font-medium"
                  >
                    <option value="all">Todas las categorías</option>
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de eventos con Scroll */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="max-h-[380px] 2xl:max-h-[500px] overflow-y-auto custom-scrollbar px-1 2xl:px-2">
                  {filteredEvents.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-violet-200 mb-4">
                        <CalendarIcon className="size-12" />
                      </div>
                      <p className="text-slate-600 font-bold text-lg mb-2">
                        {searchQuery || filterCategory !== "all"
                          ? "No se encontraron recordatorios"
                          : "No hay recordatorios personales"}
                      </p>
                      {!searchQuery && filterCategory === "all" && (
                        <button
                          onClick={() => openCreate(toISO(new Date()))}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white text-sm px-5 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-100 ring-2 ring-violet-200 hover:ring-violet-300"
                        >
                          <Plus className="size-5" />
                          Crear primer recordatorio
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <EventItem
                        key={ev.id}
                        ev={ev}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onToggleCompleted={handleToggleCompleted}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* MODAL: Detalles del Día */}
        <DayDetailsModal
          open={dayDetails.open}
          onClose={() => setDayDetails({ open: false, date: null, events: [] })}
          date={dayDetails.date}
          events={dayDetails.events}
          onCreateNew={() => {
            const d = dayDetails.date;
            setDayDetails({ open: false, date: null, events: [] });
            openCreate(d);
          }}
          onViewEvent={(ev) => {
            setDayDetails({ open: false, date: null, events: [] });
            handleViewDetails(ev);
          }}
        />

        {/* MODAL */}
        <ReminderModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEventToEdit(null);
          }}
          onSave={handleSave}
          defaultDate={modalDate}
          eventToEdit={eventToEdit}
          grupos={grupos}
          estudiantes={estudiantes}
          onLoadEstudiantes={async (grupo) => {
            if (estudiantesPorGrupo[grupo]) {
              return estudiantesPorGrupo[grupo];
            }
            try {
              const response = await getMisEstudiantes({ grupo });
              const loaded = response.data?.data || [];
              setEstudiantesPorGrupo(prev => ({ ...prev, [grupo]: loaded }));
              return loaded;
            } catch (err) {
              console.error("Error cargando estudiantes:", err);
              return [];
            }
          }}
        />

        {/* MODAL DE CONFIRMACIÓN */}
        <ConfirmModal
          open={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, eventId: null })}
          onConfirm={confirmDelete}
          title="Eliminar recordatorio"
          message="¿Estás seguro de que deseas eliminar este recordatorio? Esta acción no se puede deshacer."
        />

        {/* MODAL DE NOTIFICACIÓN */}
        <NotificationModal
          open={notificationModal.open}
          onClose={() => setNotificationModal({ open: false, type: "success", title: "", message: "" })}
          type={notificationModal.type}
          title={notificationModal.title}
          message={notificationModal.message}
        />

        {/* MODAL DE DETALLES */}
        <ReminderDetailsModal
          open={detailsModal.open}
          onClose={() => setDetailsModal({ open: false, reminder: null })}
          reminder={detailsModal.reminder}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleCompleted={handleToggleCompleted}
        />
      </div>
    </div>
  );
}
