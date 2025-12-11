import React, { useMemo, useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, X, Clock, Tag, AlertCircle, CheckCircle2, Search, Filter, Users, User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  listRemindersPersonal,
  createReminderPersonal,
  updateReminderPersonal,
  deleteReminderPersonal,
  createReminderForStudents,
  listRemindersForStudents,
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
function toISO(d) { return d.toISOString().slice(0, 10); }

/* =========================================================
   MODAL: Crear/Editar Recordatorio
========================================================= */
function ReminderModal({ open, onClose, onSave, defaultDate, eventToEdit, grupos, estudiantes, onLoadEstudiantes }) {
  const PRIORITIES = [
    { key: "red",    ring: "ring-red-300",    bg: "bg-red-500", name: "Alta" },
    { key: "orange", ring: "ring-orange-300", bg: "bg-orange-500", name: "Media-Alta" },
    { key: "amber",  ring: "ring-amber-300",  bg: "bg-amber-400", name: "Media" },
    { key: "green",  ring: "ring-green-300",  bg: "bg-green-500", name: "Baja" },
    { key: "blue",   ring: "ring-blue-300",   bg: "bg-blue-600", name: "Normal" },
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

  // Cargar estudiantes cuando se selecciona un grupo
  useEffect(() => {
    if (type === "estudiantes" && targetType === "estudiante" && selectedGrupo && onLoadEstudiantes) {
      setLoadingEstudiantes(true);
      onLoadEstudiantes(selectedGrupo)
        .then(loaded => {
          const filtrados = (loaded || []).filter(e => e.grupo === selectedGrupo);
          setEstudiantesFiltrados(filtrados);
        })
        .catch(err => {
          console.error("Error cargando estudiantes:", err);
          setEstudiantesFiltrados([]);
        })
        .finally(() => {
          setLoadingEstudiantes(false);
        });
    } else if (type === "estudiantes" && selectedGrupo && estudiantes) {
      // Usar estudiantes ya cargados
      const filtrados = estudiantes.filter(e => e.grupo === selectedGrupo);
      setEstudiantesFiltrados(filtrados);
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
      const reminderData = {
        title: name.trim(),
        description: desc.trim() || null,
        date,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* modal - Más compacto y responsive - Altura fija para evitar cambios de tamaño */}
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white z-[101] h-[85vh] sm:h-[75vh] max-h-[85vh] sm:max-h-[75vh] flex flex-col border-2 border-slate-200 ring-4 ring-violet-100">
        {/* header compacto */}
        <div className="px-4 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 ring-2 ring-white/30">
                <CalendarIcon className="size-5" />
              </div>
              <h3 className="font-extrabold text-base">
                {eventToEdit ? "Editar Recordatorio" : "Crear Recordatorio"}
              </h3>
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

        {/* body compacto - Altura fija con scroll */}
        <div className="px-3 py-2 space-y-2 overflow-y-auto flex-1 min-h-0 text-sm">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl px-4 py-2.5 font-bold shadow-md ring-2 ring-red-100">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de recordatorio compacto */}
          {!eventToEdit && (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setType("personal")}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                    type === "personal"
                      ? "border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 shadow-md ring-2 ring-violet-200"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <User className="size-4 mx-auto mb-1" />
                  <div className="font-extrabold text-xs">Personal</div>
                  <div className="text-[10px] text-slate-500 font-medium">Solo para ti</div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("estudiantes")}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                    type === "estudiantes"
                      ? "border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 shadow-md ring-2 ring-violet-200"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <Users className="size-4 mx-auto mb-1" />
                  <div className="font-extrabold text-xs">Estudiantes</div>
                  <div className="text-[10px] text-slate-500 font-medium">Grupo o individual</div>
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
              className="w-full text-sm rounded-xl border-2 border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">Descripción</label>
            <textarea
              rows={2}
              placeholder="Detalles del recordatorio…"
              className="w-full text-sm rounded-xl border-2 border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 resize-none transition-all shadow-sm hover:shadow-md font-medium"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full text-sm rounded-xl border-2 border-slate-200 px-3 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-0.5 block">Hora</label>
              <input
                type="time"
                className="w-full text-sm rounded-xl border-2 border-slate-200 px-3 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-0.5 block">Categoría</label>
            <select
              className="w-full text-sm rounded-xl border-2 border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all bg-white shadow-sm hover:shadow-md font-medium"
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
                    "relative w-8 h-8 rounded-full ring-2 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg",
                    p.bg,
                    priority === p.key ? `${p.ring} scale-110 ring-4` : "ring-transparent hover:ring-slate-300"
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
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetType("grupo")}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                      targetType === "grupo"
                        ? "border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 shadow-md ring-2 ring-violet-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-extrabold text-xs">Grupo completo</div>
                    <div className="text-[10px] text-slate-500 font-medium">Todos los estudiantes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("estudiante")}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                      targetType === "estudiante"
                        ? "border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 shadow-md ring-2 ring-violet-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-extrabold text-xs">Específico(s)</div>
                    <div className="text-[10px] text-slate-500 font-medium">Seleccionar uno o más</div>
                  </button>
                </div>
              </div>

              {targetType === "grupo" && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                    Grupo <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full text-sm rounded-xl border-2 border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all bg-white shadow-sm hover:shadow-md font-medium"
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
                <div className="space-y-1.5">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                      Grupo <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full text-sm rounded-lg border-2 border-slate-200 px-2.5 py-1 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all bg-white"
                      value={selectedGrupo}
                      onChange={(e) => {
                        setSelectedGrupo(e.target.value);
                        setSelectedEstudiantes([]);
                      }}
                    >
                      <option value="">Selecciona un grupo</option>
                      {grupos.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  {selectedGrupo && (
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                        Estudiante(s) <span className="text-red-500">*</span>
                      </label>
                      <div className="max-h-20 sm:max-h-24 overflow-y-auto border-2 border-slate-200 rounded-lg p-1 space-y-1">
                        {loadingEstudiantes ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="size-4 animate-spin text-violet-600" />
                          </div>
                        ) : estudiantesFiltrados.length === 0 ? (
                          <div className="text-center text-slate-500 text-xs py-2">
                            No hay estudiantes en este grupo
                          </div>
                        ) : (
                          estudiantesFiltrados.map(est => (
                            <label
                              key={est.id}
                              className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-50 cursor-pointer"
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
                                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs text-slate-900 truncate">
                                  {est.nombres || est.nombre} {est.apellidos || est.apellido}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {est.folio_formateado || est.folio || ""}
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      {selectedEstudiantes.length > 0 && (
                        <div className="mt-0.5 text-[10px] text-slate-600">
                          {selectedEstudiantes.length} estudiante(s) seleccionado(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer compacto */}
        <div className="px-4 py-3 flex items-center justify-end gap-3 bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white hover:border-slate-400 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-100"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 active:scale-100 ring-2 ring-violet-200 hover:ring-violet-300"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span className="hidden sm:inline">Guardando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              eventToEdit ? "Actualizar" : "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
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
  const d = new Date(date);
  const m = d.toLocaleString("es-MX", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const y = d.getFullYear();
  return (
    <div className="w-20 shrink-0 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white text-center py-4 shadow-lg ring-2 ring-violet-200">
      <div className="text-xs font-extrabold opacity-95 tracking-wide">{m}</div>
      <div className="text-3xl font-extrabold -mt-1">{day}</div>
      <div className="text-[10px] font-bold opacity-80">{y}</div>
    </div>
  );
}

function EventItem({ ev, onEdit, onDelete }) {
  const category = CATEGORIES[ev.category || ev.cat] || CATEGORIES.recordatorio;
  const isPast = new Date(ev.date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className={`group flex items-start gap-4 p-5 sm:p-6 border-b-2 last:border-0 border-slate-200 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 transition-all duration-200 ${isPast ? "opacity-75" : ""}`}>
      <DatePill date={ev.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-extrabold text-slate-900 text-lg">{ev.title}</h4>
              {isPast && (
                <Chip className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-2 border-slate-300 font-bold">
                  <Clock className="size-3.5" /> Pasado
                </Chip>
              )}
            </div>
            {ev.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2 font-medium">{ev.description}</p>
            )}
            {ev.time && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 font-semibold">
                <Clock className="size-4 text-violet-600" />
                <span>{ev.time}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(ev)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-violet-500 hover:to-indigo-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 shadow-md hover:shadow-lg ring-2 ring-transparent hover:ring-violet-300"
                title="Editar"
              >
                <Edit2 className="size-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(ev.id)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-rose-500 hover:to-red-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 shadow-md hover:shadow-lg ring-2 ring-transparent hover:ring-rose-300"
                title="Eliminar"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <Chip className={`${category.color} border-2 font-bold shadow-sm`}>
            <span className={`w-2.5 h-2.5 rounded-full ${category.dot} ring-2 ring-white`}></span>
            {category.name}
          </Chip>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const entries = Object.entries(CATEGORIES);
  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-xl ring-2 ring-slate-100/50">
      <h5 className="font-extrabold text-slate-900 mb-4 flex items-center gap-3 text-lg">
        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200">
          <Tag className="size-5" />
        </div>
        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Leyenda de Eventos
        </span>
      </h5>
      <ul className="space-y-3">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3 text-sm group">
            <span className={`w-4 h-4 rounded-full ${v.dot} shrink-0 ring-2 ring-white shadow-md group-hover:scale-110 transition-transform duration-200`} />
            <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{v.name}</span>
          </li>
        ))}
      </ul>
    </div>
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
    <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-xl ring-2 ring-slate-100/50 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <button
          onClick={() => go(-1)}
          className="p-2.5 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95 ring-2 ring-white/20 hover:ring-white/40"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-lg sm:text-xl font-extrabold uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon className="size-5 sm:size-6" />
          <span>{monthNames[monthDate.getMonth()].toUpperCase()} {monthDate.getFullYear()}</span>
        </div>
        <button
          onClick={() => go(1)}
          className="p-2.5 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95 ring-2 ring-white/20 hover:ring-white/40"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* labels */}
      <div className="grid grid-cols-7 text-center text-xs font-extrabold text-slate-700 px-2 sm:px-3 py-4 bg-gradient-to-b from-slate-50 to-white border-b-2 border-slate-200">
        {dayLabel.map((d) => (
          <div key={d} className="py-1 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* celdas */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {meta.cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="bg-white h-20 sm:h-24" />;
          const iso = toISO(date);
          const evs = meta.map[iso] || [];
          const today = toISO(new Date()) === iso;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          return (
            <button
              key={iso}
              onClick={() => {
                if (onDayClick) onDayClick(iso);
                else if (onCreate) onCreate(iso);
              }}
              className={`relative bg-white h-20 sm:h-24 p-2 hover:bg-gradient-to-br hover:from-violet-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer border-r-2 border-b-2 border-slate-200 hover:border-violet-300 ${
                today ? "ring-4 ring-violet-500 ring-inset bg-violet-50/30" : ""
              } ${isPast ? "opacity-60" : ""}`}
            >
              <div
                className={`text-xs font-bold w-8 h-8 grid place-items-center rounded-full transition-all duration-200 ${
                  today
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg ring-2 ring-violet-300 scale-110"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {date.getDate()}
              </div>
              {/* puntos de eventos */}
              {evs.length > 0 && (
                <div className="absolute left-2 bottom-2 right-2 flex gap-1 flex-wrap">
                  {evs.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-3 h-3 rounded-full ${CATEGORIES[e.category || e.cat]?.dot || "bg-slate-400"} ring-2 ring-white shadow-sm`}
                      title={e.title}
                    />
                  ))}
                  {evs.length > 3 && (
                    <span className="text-[10px] text-slate-600 font-bold bg-white/80 px-1.5 py-0.5 rounded-full">+{evs.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* footer */}
      <div className="p-5 bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200">
        <button
          onClick={() => onCreate?.(toISO(new Date()))}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white text-sm px-5 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-100 ring-2 ring-violet-200 hover:ring-violet-300"
        >
          <Plus className="size-5" />
          Crear recordatorio
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
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-6 max-w-md w-full z-[201] ring-4 ring-violet-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg ring-2 ring-rose-200">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6 font-medium">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all duration-200 hover:scale-105 active:scale-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-100 ring-2 ring-rose-200 hover:ring-rose-300"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationModal({ open, onClose, type, title, message }) {
  if (!open) return null;
  const isError = type === "error";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-6 max-w-md w-full z-[201] ring-4 ring-violet-100">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl text-white shadow-lg ring-2 ${
            isError 
              ? "bg-gradient-to-br from-rose-500 to-red-600 ring-rose-200"
              : "bg-gradient-to-br from-emerald-500 to-teal-600 ring-emerald-200"
          }`}>
            {isError ? <AlertCircle className="size-6" /> : <CheckCircle2 className="size-6" />}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6 font-medium">{message}</p>
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-100 ring-2 ${
              isError
                ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white ring-rose-200 hover:ring-rose-300"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ring-emerald-200 hover:ring-emerald-300"
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
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

  // Cargar recordatorios personales
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [personalRes, estudiantesRes] = await Promise.all([
          listRemindersPersonal().catch(() => ({ data: { data: [] } })),
          getMisEstudiantes().catch(() => ({ data: { data: [], grupos_asesor: [] } })),
        ]);
        
        if (!alive) return;
        
        const personalEvents = (personalRes.data?.data || []).map(e => ({
          ...e,
          type: "personal",
        }));
        
        const gruposList = estudiantesRes.data?.grupos_asesor || [];
        setGrupos(Array.isArray(gruposList) ? gruposList : []);
        setEstudiantes(estudiantesRes.data?.data || []);
        
        setEvents(personalEvents);
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
      const dateA = new Date(a.date + (a.time ? `T${a.time}` : "T00:00"));
      const dateB = new Date(b.date + (b.time ? `T${b.time}` : "T00:00"));
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

  const handleSave = async (data, type, eventId) => {
    try {
      if (type === "personal") {
        if (eventId) {
          // Actualizar
          await updateReminderPersonal(eventId, data);
          setEvents(prev => prev.map(e => e.id === eventId ? { ...data, id: eventId, type: "personal" } : e));
        } else {
          // Crear
          const response = await createReminderPersonal(data);
          setEvents(prev => [...prev, { ...response.data.data, type: "personal" }]);
        }
      } else {
        // Para estudiantes
        await createReminderForStudents(data);
        // Recargar eventos personales (los de estudiantes no se muestran aquí)
        const response = await listRemindersPersonal();
        const personalEvents = (response.data?.data || []).map(e => ({
          ...e,
          type: "personal",
        }));
        setEvents(personalEvents);
      }
      setOpenModal(false);
      setEventToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({ open: true, eventId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.eventId) return;
    
    try {
      await deleteReminderPersonal(confirmModal.eventId);
      setEvents(prev => prev.filter(e => e.id !== confirmModal.eventId));
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

  const upcomingEvents = filteredEvents.filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 shadow-xl ring-4 ring-violet-200">
              <CalendarIcon className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight text-slate-900">
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block">
                  Agenda / Calendario
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Gestiona tus recordatorios personales y asigna recordatorios a tus estudiantes
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Calendario */}
          <section className="space-y-4">
            <Calendar
              monthDate={monthDate}
              setMonthDate={setMonthDate}
              events={events}
              onCreate={openCreate}
              onDayClick={openCreate}
            />
            <Legend />
          </section>

          {/* Eventos */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 tracking-tight">
                Recordatorios Personales
              </h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm px-4 py-2 border-2 border-violet-300 font-extrabold shadow-md ring-2 ring-violet-200">
                  {upcomingEvents.length} próximos
                </span>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar recordatorios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all shadow-sm hover:shadow-md font-medium"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                  <Filter className="size-4" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all bg-white shadow-sm hover:shadow-md font-medium"
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

            {/* Lista de eventos */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-xl ring-2 ring-slate-100/50 overflow-hidden">
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
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

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
    </div>
  );
}
