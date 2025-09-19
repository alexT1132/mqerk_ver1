import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SimulatorModal({ open, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Estado del formulario (ambos pasos)
  const [form, setForm] = useState({
    titulo: "",
    instrucciones: "",
    nombre: "",
    fechaLimite: "",
    publico: true,
    horas: 0,
    minutos: 0
  });

  const firstFocusable = useRef(null);

  // Reset cuando se abra/cierre
  useEffect(() => {
    if (open) {
      setStep(1);
      // foco inicial
      setTimeout(() => firstFocusable.current?.focus(), 50);
    }
  }, [open]);

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

  const canCreate =
    form.nombre.trim().length >= 3 && form.horas > 0 && form.minutos >= 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      await Promise.resolve(); // simula petición
      onCreate?.(form);
      onClose?.();
      navigate("/asesor/nuevo_quizt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="sim-modal-title"
      onMouseDown={(e) => {
        // clic fuera cierra
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative mx-2 w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/5 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Stepper step={step} />
            <div>
              <h2
                id="sim-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                {step === 1 ? "Crear instrucciones" : "Información del quizt"}
              </h2>
              <p className="text-xs text-slate-500">
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
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          {step === 1 ? (
            <StepOne form={form} setForm={setForm} />
          ) : (
            <StepTwo form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-6">
          <button
            onClick={() => (step === 1 ? onClose?.() : setStep(1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {step === 1 ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.707 14.707a1 1 0 0 1-1.414 0L3.586 10l4.707-4.707a1 1 0 1 1 1.414 1.414L6.414 10l3.293 3.293a1 1 0 0 1 0 1.414Z"/><path d="M16 10a1 1 0 0 1-1 1H6a1 1 0 1 1 0-2h9a1 1 0 0 1 1 1Z"/></svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.293 5.293a1 1 0 0 1 1.414 0L16.414 10l-4.707 4.707a1 1 0 1 1-1.414-1.414L13.586 10 10.293 6.707a1 1 0 0 1 0-1.414Z"/><path d="M4 10a1 1 0 0 0 1 1h9a1 1 0 1 0 0-2H5a1 1 0 0 0-1 1Z"/></svg>
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
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {loading ? "Creando..." : "Crear quizt"}
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
              "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
              step >= n ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500",
            ].join(" ")}
          >
            {n}
          </div>
          {n === 1 && (
            <div className="h-0.5 w-8 rounded bg-slate-200">
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
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Describe brevemente qué debe hacer el alumno antes de iniciar el quizt.
      </p>

      <label className="block text-sm font-medium text-slate-700">
        Titulo
      </label>
      <input
        value={form.titulo}
        onChange={(e) =>
          setForm((f) => ({ ...f, titulo: e.target.value.slice(0) }))
        }
        placeholder="Escribe el titulo del quizt"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <label className="block text-sm font-medium text-slate-700">
        Instrucciones
      </label>
      <textarea
        value={form.instrucciones}
        onChange={(e) =>
          setForm((f) => ({ ...f, instrucciones: e.target.value.slice(0) }))
        }
        rows={6}
        placeholder="Ej. Lee cada pregunta y selecciona la respuesta correcta. Tienes 30 minutos para completar el quizt…"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
function StepTwo({ form, setForm }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Nombre del quizt
        </label>
        <input
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Ej. Quizt II – Razonamiento"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Fecha límite
        </label>
        <input
          type="date"
          value={form.fechaLimite}
          onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
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
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Visibilidad
        </label>
        <label className="inline-flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.publico}
            onChange={(e) =>
              setForm((f) => ({ ...f, publico: e.target.checked }))
            }
            className="peer sr-only"
          />
          <span className="rounded-full bg-slate-200 p-1 peer-checked:hidden">
            <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3c-4 0-7.333 2.667-9 7 1.667 4.333 5 7 9 7s7.333-2.667 9-7c-1.667-4.333-5-7-9-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
          </span>
          <span className="hidden rounded-full bg-emerald-100 p-1 text-emerald-600 peer-checked:inline">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.5 10s3-4.5 7.5-4.5S17.5 10 17.5 10s-3 4.5-7.5 4.5S2.5 10 2.5 10Zm7.5 2.5A2.5 2.5 0 1 0 7.5 10 2.5 2.5 0 0 0 10 12.5Z"/></svg>
          </span>
          <span className="text-sm text-slate-700">
            {form.publico ? "Público" : "Privado"}
          </span>
        </label>
      </div>
    </div>
  );
}
