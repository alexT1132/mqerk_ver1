import { useEffect, useMemo, useState } from "react";

export default function CourseWizardModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: "",
    subtitulo: "",
    modalidad: "PRESENCIAL",
    turno: "MATUTINO",
    horario: "",
    grupos: "",
  });

  useEffect(() => { if (!open) setStep(0); }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const steps = [
    { id: 0, title: "Información" },
    { id: 1, title: "Modalidad" },
    { id: 2, title: "Grupos" },
    { id: 3, title: "Confirmar" },
  ];

  const isValid = useMemo(() => {
    if (step === 0) return form.nombre.trim().length > 0;
    if (step === 1) return form.modalidad && form.turno && form.horario.trim().length > 0;
    if (step === 2) return form.grupos.trim().length > 0;
    return true;
  }, [step, form]);

  const next = () => isValid && setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="mx-auto mt-10 w-[92vw] max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-lg font-semibold">Nuevo curso</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-gray-100" aria-label="Cerrar">
            <svg viewBox="0 0 20 20" className="size-5" fill="currentColor">
              <path fillRule="evenodd" d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            {steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className={`grid place-items-center size-6 rounded-full border
                  ${i <= step ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"}`}>
                  {i + 1}
                </span>
                <span className={`${i === step ? "font-medium text-gray-900" : ""} hidden sm:inline`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-gray-200" />}
              </li>
            ))}
          </ol>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {step === 0 && (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre del curso *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. DIGI-START"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Subtítulo</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.subtitulo}
                  onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
                  placeholder="desbloquea tu potencial tecnológico"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Modalidad *</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.modalidad}
                  onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                >
                  <option>PRESENCIAL</option>
                  <option>ONLINE</option>
                  <option>HÍBRIDA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Turno *</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.turno}
                  onChange={(e) => setForm({ ...form, turno: e.target.value })}
                >
                  <option>MATUTINO</option>
                  <option>VESPERTINO</option>
                  <option>NOCTURNO</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Horario *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  placeholder="Ej. 4PM-6PM"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Grupos *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.grupos}
                  onChange={(e) => setForm({ ...form, grupos: e.target.value })}
                  placeholder="Ej. MG1, MG2"
                />
                <p className="mt-1 text-xs text-gray-500">Separa por comas.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="font-medium text-gray-900">{form.nombre}</div>
                <div className="text-gray-600">{form.subtitulo}</div>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div><dt className="text-gray-500">Modalidad</dt><dd className="text-gray-900">{form.modalidad}</dd></div>
                  <div><dt className="text-gray-500">Turno</dt><dd className="text-gray-900">{form.turno}</dd></div>
                  <div className="col-span-2"><dt className="text-gray-500">Horario</dt><dd className="text-gray-900">{form.horario}</dd></div>
                  <div className="col-span-2"><dt className="text-gray-500">Grupos</dt><dd className="text-gray-900">{form.grupos}</dd></div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Atrás
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!isValid}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSubmit?.(form)}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Guardar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
