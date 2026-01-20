import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisEstudiantes } from "../../api/asesores.js";

export default function SimulatorModal({ open, onClose, onCreate, areaTitle, areaId, initialForm = null, onFormChange = null }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gruposAsesor, setGruposAsesor] = useState([]);
  const [gruposLoading, setGruposLoading] = useState(false);

  // Estado del formulario (ambos pasos)
  const [form, setForm] = useState({
    titulo: "",
    instrucciones: "",
    nombre: "",
    fechaLimite: "",
    publico: false, // Borrador por defecto (no publicado)
    horas: 0,
    minutos: 0,
    intentosMode: 'unlimited', // 'unlimited' | 'limited'
    maxIntentos: 3,
    grupos: [], // Array de grupos seleccionados
    id_area: areaId || null, // Agregar área al formulario
  });

  const firstFocusable = useRef(null);
  const prevFormRef = useRef(null); // Para evitar loops infinitos en onFormChange
  const onFormChangeRef = useRef(onFormChange); // Almacenar referencia estable de onFormChange
  const isUpdatingFromInitialForm = useRef(false); // Bandera para evitar loops cuando viene de initialForm
  const prevOpenRef = useRef(false); // Para rastrear cuando el modal se abre por primera vez

  // Actualizar la referencia cuando cambie
  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);

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

  // Reset cuando se abra el modal (solo cuando open cambia de false a true)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // El modal acaba de abrirse
      setStep(1);
      isUpdatingFromInitialForm.current = true;
      // Prefill si viene initialForm (solo al abrir)
      if (initialForm) {
        const gruposInicial = initialForm.grupos
          ? (Array.isArray(initialForm.grupos) ? initialForm.grupos : String(initialForm.grupos).split(',').map(s => s.trim()).filter(Boolean))
          : [];
        setForm((prev) => {
          const newForm = {
            ...prev,
            titulo: initialForm.titulo || initialForm.nombre || prev.titulo,
            instrucciones: initialForm.instrucciones || prev.instrucciones,
            nombre: initialForm.nombre || initialForm.titulo || prev.nombre,
            fechaLimite: initialForm.fechaLimite || prev.fechaLimite,
            publico: initialForm.publico ?? prev.publico,
            horas: Number(initialForm.horas ?? prev.horas ?? 0),
            minutos: Number(initialForm.minutos ?? prev.minutos ?? 0),
            intentosMode: initialForm.intentosMode || prev.intentosMode,
            maxIntentos: Number(initialForm.maxIntentos ?? prev.maxIntentos ?? 3),
            grupos: gruposInicial,
          };
          // Actualizar prevFormRef para evitar que el useEffect de abajo notifique
          prevFormRef.current = JSON.stringify({
            nombre: newForm.nombre,
            instrucciones: newForm.instrucciones,
            horas: newForm.horas,
            minutos: newForm.minutos,
            intentosMode: newForm.intentosMode,
            maxIntentos: newForm.maxIntentos,
            grupos: newForm.grupos,
          });
          return newForm;
        });
      } else {
        // Reset grupos al abrir sin initialForm
        setForm((prev) => {
          const resetForm = { ...prev, grupos: [] };
          // Actualizar prevFormRef
          prevFormRef.current = JSON.stringify({
            nombre: resetForm.nombre,
            instrucciones: resetForm.instrucciones,
            horas: resetForm.horas,
            minutos: resetForm.minutos,
            intentosMode: resetForm.intentosMode,
            maxIntentos: resetForm.maxIntentos,
            grupos: resetForm.grupos,
          });
          return resetForm;
        });
      }
      // Resetear la bandera después de un breve delay
      setTimeout(() => {
        isUpdatingFromInitialForm.current = false;
      }, 200);
      // foco inicial
      setTimeout(() => firstFocusable.current?.focus(), 50);
    }
    prevOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Solo dependemos de 'open', no de 'initialForm' para evitar resetear el paso

  // Notificar cambios del formulario al padre cada vez que cambia (para preservar configuración al generar con IA)
  // Usar un pequeño delay para evitar loops infinitos y solo notificar cuando realmente cambia
  useEffect(() => {
    if (!open || !onFormChangeRef.current || isUpdatingFromInitialForm.current) return;

    // Solo notificar si realmente cambió algo relevante
    const formStr = JSON.stringify({
      nombre: form.nombre,
      instrucciones: form.instrucciones,
      horas: form.horas,
      minutos: form.minutos,
      intentosMode: form.intentosMode,
      maxIntentos: form.maxIntentos,
      grupos: form.grupos,
    });

    if (prevFormRef.current !== formStr) {
      prevFormRef.current = formStr;
      const timeoutId = setTimeout(() => {
        if (onFormChangeRef.current && !isUpdatingFromInitialForm.current) {
          onFormChangeRef.current(form);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nombre, form.instrucciones, form.horas, form.minutos, form.intentosMode, form.maxIntentos, form.grupos, open]);

  // Sincronizar id_area cuando cambia el prop areaId
  useEffect(() => {
    if (areaId !== undefined && areaId !== null) {
      setForm(prev => ({ ...prev, id_area: areaId }));
    }
  }, [areaId]);

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

  const canNext = step === 1 ? form.instrucciones.trim().length >= 10 : true;

  // Validaciones para crear quiz
  const totalMinutes = Math.max(0, Math.trunc(Number(form.horas || 0)) * 60) + Math.max(0, Math.trunc(Number(form.minutos || 0)));
  const hasFecha = form.fechaLimite && form.fechaLimite.trim() !== '';
  const fechaValida = hasFecha ? (new Date(form.fechaLimite + 'T00:00:00') >= new Date(new Date().setHours(0, 0, 0, 0))) : false;
  const hasGrupos = Array.isArray(form.grupos) && form.grupos.length > 0;
  const hasTiempo = totalMinutes > 0;

  const canCreate = form.nombre.trim().length >= 3 && hasFecha && fechaValida && hasGrupos && hasTiempo;

  const handleCreate = async () => {
    // Validaciones adicionales con mensajes
    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      alert('El nombre del quiz debe tener al menos 3 caracteres.');
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
      // Normalizar tiempo (convertir minutos >= 60 a horas)
      const normH = Math.max(0, parseInt(form.horas ?? 0, 10) || 0);
      const normMraw = Math.max(0, parseInt(form.minutos ?? 0, 10) || 0);
      const addH = Math.floor(normMraw / 60);
      const normM = normMraw % 60;
      // Enviar grupos como array JSON (no como string separado por comas)
      const gruposFinal = Array.isArray(form.grupos) && form.grupos.length > 0
        ? form.grupos  // Enviar el array directamente
        : [];
      const finalForm = {
        titulo: form.titulo || form.nombre,  // Backend espera 'titulo'
        descripcion: form.instrucciones,     // Backend espera 'descripcion', no 'instrucciones'
        nombre: form.nombre,
        fechaLimite: form.fechaLimite,
        horas: normH + addH,
        minutos: normM,
        grupos: gruposFinal,
        id_area: form.id_area,
        publico: form.publico,
        intentosMode: form.intentosMode,
        maxIntentos: form.maxIntentos
      };
      await Promise.resolve(); // simula petición
      onCreate?.(finalForm);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const contentMaxW = step === 2 ? "max-w-md sm:max-w-lg" : "max-w-sm sm:max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="sim-modal-title"
      onMouseDown={(e) => {
        if (!e.target.closest("[data-modal]")) onClose?.();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] -z-10" aria-hidden="true" />

      {/* Envuelve para centrar verticalmente en viewport; en pantallas bajas el overlay hace scroll */}
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center py-2">
        {/* Content: max-height para pantallas con poca altura (ej. 15.6" alto reducido) */}
        <div
          data-modal
          className={`relative w-full ${contentMaxW} rounded-2xl bg-white shadow-xl ring-1 ring-black/5 max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col`}
        >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Stepper step={step} />
            <div>
              <h2
                id="sim-modal-title"
                className="text-sm font-semibold text-slate-900 sm:text-base"
              >
                {step === 1 ? "Crear instrucciones" : "Información del quizt"}
              </h2>
              <p className="text-[11px] text-slate-500">Paso {step} de 2</p>
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

        {/* Body: flex-1 min-h-0 para que haga scroll en pantallas bajas */}
        <div className="flex-1 min-h-0 px-5 py-3 sm:px-6 sm:py-4 overflow-y-auto">
          {step === 1 ? (
            <StepOne form={form} setForm={setForm} />
          ) : (
            <StepTwo form={form} setForm={setForm} gruposAsesor={gruposAsesor} gruposLoading={gruposLoading} hasGrupos={hasGrupos} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 bg-white/90">
          <button
            onClick={() => (step === 1 ? onClose?.() : setStep(1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {step === 1 ? <>Cancelar</> : <>Atrás</>}
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
    <div className="space-y-2.5">
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
        rows={3}
        placeholder="Ej. Lee cada pregunta y selecciona la respuesta correcta. Tienes 30 minutos para completar el quizt…"
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

/* Paso 2 – Información del quizt */
function StepTwo({ form, setForm, gruposAsesor, gruposLoading, hasGrupos = false }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Nombre del quizt</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Ej. Quizt II – Razonamiento"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="min-w-0">
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

      <div className="min-w-0">
        <label className="block text-sm font-medium text-slate-700">Duración (hrs)</label>
        <input
          type="number"
          min={0}
          value={Math.max(0, Number(form.horas || 0))}
          onChange={(e) => setForm((f) => ({ ...f, horas: Math.max(0, Number(e.target.value || 0)) }))}
          onBlur={(e) => {
            const hr = Math.max(0, parseInt(e.target.value || 0, 10) || 0);
            const mr = Math.max(0, parseInt(form.minutos || 0, 10) || 0);
            const addH = Math.floor(mr / 60);
            const nm = mr % 60;
            setForm((f) => ({ ...f, horas: hr + addH, minutos: nm }));
          }}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="min-w-0">
        <label className="block text-sm font-medium text-slate-700">Duración (min)</label>
        <input
          type="number"
          min={0}
          max={599}
          value={Math.max(0, Number(form.minutos || 0))}
          onChange={(e) => setForm((f) => ({ ...f, minutos: Math.max(0, Number(e.target.value || 0)) }))}
          onBlur={(e) => {
            const hr = Math.max(0, parseInt(form.horas || 0, 10) || 0);
            const mr = Math.max(0, parseInt(e.target.value || 0, 10) || 0);
            const addH = Math.floor(mr / 60);
            const nm = mr % 60;
            setForm((f) => ({ ...f, horas: hr + addH, minutos: nm }));
          }}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <p className="mt-1 text-[11px] leading-snug text-slate-500">Si ingresas 60 o más minutos, se sumarán a las horas automáticamente.</p>
      </div>

      {/* Intentos permitidos */}
      <div className="min-w-0">
        <label className="block text-sm font-medium text-slate-700">Intentos permitidos</label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
            <input
              type="radio"
              name="intentosMode"
              checked={form.intentosMode === 'unlimited'}
              onChange={() => setForm((f) => ({ ...f, intentosMode: 'unlimited' }))}
            />
            Sin límite
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
            <input
              type="radio"
              name="intentosMode"
              checked={form.intentosMode === 'limited'}
              onChange={() => setForm((f) => ({ ...f, intentosMode: 'limited' }))}
            />
            Límite:
          </label>
          <input
            type="number"
            min={1}
            value={form.maxIntentos}
            disabled={form.intentosMode !== 'limited'}
            onChange={(e) => setForm((f) => ({ ...f, maxIntentos: Math.max(1, Number(e.target.value || 1)) }))}
            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none"
          />
        </div>
        <p className="mt-1 text-xs leading-snug text-slate-500">Si eliges "Sin límite", el alumno podrá intentar hasta la fecha límite.</p>
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
          Selecciona los grupos a los que quieres asignar este quiz.
        </p>
      </div>
    </div>
  );
}
