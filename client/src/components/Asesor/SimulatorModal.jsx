import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisEstudiantes } from "../../api/asesores.js";

export default function SimulatorModal({ open, onClose, onCreate, onUpdate, mode = 'create', initialForm = null }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gruposAsesor, setGruposAsesor] = useState([]);
  const [gruposLoading, setGruposLoading] = useState(false);

  const navigate = useNavigate();

  // Estado del formulario (ambos pasos)
  const [form, setForm] = useState({
    titulo: "",
    instrucciones: "",
    nombre: "",
    fechaLimite: "",
    publico: false, // Borrador por defecto (no publicado)
    horas: 0,
    minutos: 0,
    grupos: []
  });

  const firstFocusable = useRef(null);

  // Cargar grupos del asesor al abrir el modal
  useEffect(() => {
    if (open && gruposAsesor.length === 0) {
      setGruposLoading(true);
      getMisEstudiantes()
        .then(({ data }) => {
          const grupos = data?.grupos_asesor || [];
          setGruposAsesor(Array.isArray(grupos) ? grupos : []);
        })
        .catch(() => {
          setGruposAsesor([]);
        })
        .finally(() => {
          setGruposLoading(false);
        });
    }
  }, [open, gruposAsesor.length]);

  // Reset cuando se abra/cierre
  useEffect(() => {
    if (open) {
      setStep(1);
      // Prefill si viene initialForm
      if (initialForm) {
        const gruposInicial = initialForm.grupos
          ? (Array.isArray(initialForm.grupos) ? initialForm.grupos : String(initialForm.grupos).split(',').map(s => s.trim()).filter(Boolean))
          : [];
        setForm({
          titulo: initialForm.titulo || initialForm.nombre || "",
          instrucciones: initialForm.instrucciones || "",
          nombre: initialForm.nombre || initialForm.titulo || "",
          fechaLimite: initialForm.fechaLimite || "",
          publico: initialForm.publico ?? true,
          horas: Number(initialForm.horas || 0),
          minutos: Number(initialForm.minutos || 0),
          grupos: gruposInicial
        });
      } else {
        // Reset grupos al abrir sin initialForm
        setForm((prev) => ({ ...prev, grupos: [] }));
      }
      // foco inicial
      setTimeout(() => firstFocusable.current?.focus(), 50);
    }
  }, [open, initialForm]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canNext =
    step === 1 ? form.instrucciones.trim().length >= 10 : true;

  // Validaciones para crear simulador
  const totalMinutes = Math.max(0, Math.trunc(Number(form.horas || 0)) * 60) + Math.max(0, Math.trunc(Number(form.minutos || 0)));
  const hasFecha = form.fechaLimite && form.fechaLimite.trim() !== '';
  const fechaValida = hasFecha ? (new Date(form.fechaLimite + 'T00:00:00') >= new Date(new Date().setHours(0, 0, 0, 0))) : false;
  const hasGrupos = Array.isArray(form.grupos) && form.grupos.length > 0;
  const hasTiempo = totalMinutes > 0;

  const canCreate = form.nombre.trim().length >= 3 && hasFecha && fechaValida && hasGrupos && hasTiempo;

  const handleSubmit = async () => {
    // Validaciones adicionales con mensajes
    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      alert('El nombre del simulador debe tener al menos 3 caracteres.');
      return;
    }
    if (!form.fechaLimite || form.fechaLimite.trim() === '') {
      alert('Debes seleccionar una fecha límite.');
      return;
    }
    const fechaLimiteDate = new Date(form.fechaLimite + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaLimiteDate < hoy) {
      alert('La fecha límite no puede ser menor a la fecha actual.');
      return;
    }
    if (!Array.isArray(form.grupos) || form.grupos.length === 0) {
      alert('Debes seleccionar al menos un grupo.');
      return;
    }
    if (totalMinutes <= 0) {
      alert('Debes especificar una duración mayor a 0 (horas o minutos).');
      return;
    }

    if (!canCreate) return;
    setLoading(true);
    try {
      // Normalizar grupos: convertir array a string separado por comas para el backend
      const gruposFinal = Array.isArray(form.grupos) && form.grupos.length > 0
        ? form.grupos.join(',')
        : '';
      const finalForm = {
        ...form,
        grupos: gruposFinal
      };
      if (mode === 'edit') {
        await onUpdate?.(finalForm);
      } else {
        // Deja que el caller (SimuladoresGen) haga la navegación al builder con el ID creado
        await onCreate?.(finalForm);
      }
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="sim-modal-title"
      onMouseDown={(e) => {
        // clic fuera cierra
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Stepper step={step} />
            <div>
              <h2
                id="sim-modal-title"
                className="text-sm font-semibold text-slate-900 sm:text-base"
              >
                {step === 1 ? (mode === 'edit' ? 'Editar instrucciones' : 'Crear instrucciones') : (mode === 'edit' ? 'Editar simulador' : 'Información del simulador')}
              </h2>
              <p className="text-[11px] text-slate-500">
                Paso {step} de 2
              </p>
            </div>
          </div>

          <button
            ref={firstFocusable}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Cerrar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 sm:px-5 sm:py-4">
          {step === 1 ? (
            <StepOne form={form} setForm={setForm} />
          ) : (
            <StepTwo form={form} setForm={setForm} gruposAsesor={gruposAsesor} gruposLoading={gruposLoading} hasGrupos={hasGrupos} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
          <button
            onClick={() => (step === 1 ? onClose?.() : setStep(1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {step === 1 ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.707 14.707a1 1 0 0 1-1.414 0L3.586 10l4.707-4.707a1 1 0 1 1 1.414 1.414L6.414 10l3.293 3.293a1 1 0 0 1 0 1.414Z" /><path d="M16 10a1 1 0 0 1-1 1H6a1 1 0 1 1 0-2h9a1 1 0 0 1 1 1Z" /></svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.293 5.293a1 1 0 0 1 1.414 0L16.414 10l-4.707 4.707a1 1 0 1 1-1.414-1.414L13.586 10 10.293 6.707a1 1 0 0 1 0-1.414Z" /><path d="M4 10a1 1 0 0 0 1 1h9a1 1 0 1 0 0-2H5a1 1 0 0 0-1 1Z" /></svg>
                Atrás
              </>
            )}
          </button>

          {step === 1 ? (
            <button
              disabled={!canNext}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              Siguiente
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414L13.414 10l-4.707 4.707a1 1 0 0 1-1.414 0Z" />
              </svg>
            </button>
          ) : (
            <button
              disabled={!canCreate || loading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {loading ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : (mode === 'edit' ? 'Guardar cambios' : 'Crear simulador')}
              {!loading && (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.707 5.293a1 1 0 0 0-1.414 0L8 12.586 4.707 9.293a1 1 0 1 0-1.414 1.414L8 15.414l8.121-8.121a1 1 0 0 0 0-1.414Z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={[
              "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold",
              step >= n ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500",
            ].join(" ")}
          >
            {n}
          </div>
          {n === 1 && (
            <div className="h-0.5 w-6 rounded bg-slate-200">
              <div
                className={[
                  "h-full rounded bg-violet-600 transition-all",
                  step === 1 ? "w-0" : "w-full",
                ].join(" ")}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* Paso 1 – Crear instrucciones */
function StepOne({ form, setForm }) {
  const count = form.instrucciones.length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Describe brevemente qué debe hacer el alumno antes de iniciar la simulación.
      </p>

      <label className="block text-sm font-medium text-slate-700">
        Titulo
      </label>
      <input
        value={form.titulo}
        onChange={(e) =>
          setForm((f) => ({ ...f, titulo: e.target.value.slice(0) }))
        }
        placeholder="Escribe el titulo del simulador"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <label className="block text-sm font-medium text-slate-700">
        Instrucciones
      </label>
      <textarea
        value={form.instrucciones}
        onChange={(e) =>
          setForm((f) => ({ ...f, instrucciones: e.target.value.slice(0) }))
        }
        rows={4}
        placeholder="Ej. Lee cada pregunta y selecciona la respuesta correcta. Tienes 30 minutos para completar el simulador…"
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <div className="flex items-center justify-between text-xs">
        <span
          className={[
            "font-medium",
            count >= 10 ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
        >
        </span>
        <span className="text-slate-400">
          {count}
        </span>
      </div>
    </div>
  );
}

/* Paso 2 – Información del simulador */
function StepTwo({ form, setForm, gruposAsesor = [], gruposLoading = false, hasGrupos = false }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Nombre del simulador
        </label>
        <input
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Ej. Simulador EXANI II – Razonamiento"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Fecha límite <span className="text-rose-600">*</span>
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.fechaLimite}
          onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${form.fechaLimite && new Date(form.fechaLimite + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : form.fechaLimite
              ? 'border-emerald-300 focus:border-violet-500 focus:ring-violet-500'
              : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500'
            }`}
        />
        {form.fechaLimite && new Date(form.fechaLimite + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0)) && (
          <p className="mt-1 text-xs text-rose-600">La fecha no puede ser menor a la fecha actual.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Duración (hrs)
        </label>
        <input
          type="number"
          value={form.horas}
          onChange={(e) =>
            setForm((f) => ({ ...f, horas: Number(e.target.value) }))
          }
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Duración (min)
        </label>
        <input
          type="number"
          value={form.minutos}
          onChange={(e) =>
            setForm((f) => ({ ...f, minutos: Number(e.target.value) }))
          }
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Selección de grupos */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Grupos asignados <span className="text-rose-600">*</span>
        </label>
        {gruposLoading ? (
          <div className="text-xs text-slate-500 py-2">Cargando grupos...</div>
        ) : gruposAsesor.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No tienes grupos asignados. Contacta al administrador.</p>
        ) : (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 max-h-40 overflow-y-auto">
            {gruposAsesor.map((grupo) => {
              const isSelected = Array.isArray(form.grupos) && form.grupos.includes(grupo);
              return (
                <label
                  key={grupo}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1.5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const gruposActuales = Array.isArray(form.grupos) ? form.grupos : [];
                      if (e.target.checked) {
                        setForm((f) => ({ ...f, grupos: [...gruposActuales, grupo] }));
                      } else {
                        setForm((f) => ({ ...f, grupos: gruposActuales.filter(g => g !== grupo) }));
                      }
                    }}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700 font-medium">{grupo.toUpperCase()}</span>
                </label>
              );
            })}
          </div>
        )}
        {!hasGrupos && gruposAsesor.length > 0 && (
          <p className="mt-1 text-xs text-rose-600">Debes seleccionar al menos un grupo.</p>
        )}
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Selecciona los grupos a los que quieres asignar este simulador.
        </p>
      </div>
    </div>
  );
}
