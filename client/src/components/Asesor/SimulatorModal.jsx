import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisEstudiantes } from "../../api/asesores.js";
import { XCircle, X, Loader2, CheckCircle2, FileText, Calendar, Clock, Users, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function SimulatorModal({ open, onClose, onCreate, onUpdate, mode = 'create', initialForm = null, onEditQuestions = null }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gruposAsesor, setGruposAsesor] = useState([]);
  const [gruposLoading, setGruposLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  // Estado del formulario (ambos pasos)
  const [form, setForm] = useState({
    titulo: "",
    instrucciones: "",
    descripcion: "", // ✅ Campo para preservar descripción generada por IA
    nombre: "",
    fechaLimite: "",
    publico: false, // Borrador por defecto (no publicado)
    horas: 0,
    minutos: 0,
    grupos: [],
    // ✅ CRÍTICO: Preservar areaId y areaTitle cuando se genera con IA
    areaId: null,
    areaTitle: null
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
          instrucciones: initialForm.instrucciones || initialForm.descripcion || "", // Instrucciones para el usuario
          descripcion: initialForm.descripcion || initialForm.instrucciones || "", // ✅ Preservar descripción generada por IA
          nombre: initialForm.nombre || initialForm.titulo || "",
          fechaLimite: initialForm.fechaLimite || "",
          publico: initialForm.publico ?? true,
          horas: Number(initialForm.horas || 0),
          minutos: Number(initialForm.minutos || 0),
          grupos: gruposInicial,
          // ✅ CRÍTICO: Preservar areaId y areaTitle del initialForm (viene de iaPrefill cuando se genera con IA)
          areaId: initialForm.areaId !== undefined ? initialForm.areaId : null,
          areaTitle: initialForm.areaTitle !== undefined ? initialForm.areaTitle : null
        });
        
        // Log para debugging
        if (initialForm.areaId !== undefined || initialForm.areaTitle !== undefined) {
          console.log('[SimulatorModal] initialForm con área preservada:', {
            areaId: initialForm.areaId,
            areaTitle: initialForm.areaTitle
          });
        }
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

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleSubmit = async (skipClose = false) => {
    // ✅ IMPORTANTE: Validar que al menos uno de los campos (titulo o nombre) tenga valor
    // También verificar si viene del initialForm (iaPrefill) como respaldo
    // ✅ CRÍTICO: Si viene de IA (initialForm tiene titulo/nombre), preservarlo siempre
    const tituloDelInitialForm = initialForm?.titulo || initialForm?.nombre || '';
    const descripcionDelInitialForm = initialForm?.descripcion || initialForm?.instrucciones || '';
    
    // ✅ CRÍTICO: Si el usuario borró el título/nombre pero viene de IA, usar el de IA
    // Prioridad: 1) Lo que el usuario escribió, 2) Lo que viene de initialForm (IA), 3) Fallback
    const tituloFinal = (form.titulo?.trim() || form.nombre?.trim() || tituloDelInitialForm?.trim() || '').trim();
    if (!tituloFinal || tituloFinal.length < 3) {
      showError('El nombre/título del simulador debe tener al menos 3 caracteres.');
      return;
    }
    
    // ✅ Sincronizar título y nombre antes de enviar (usar el que tenga valor, con fallback a initialForm)
    // ✅ CRÍTICO: Si el usuario no escribió nada, usar el valor de initialForm (generado por IA)
    const nombreFinal = (form.nombre?.trim() || form.titulo?.trim() || tituloDelInitialForm?.trim() || tituloFinal).trim();
    const tituloFinalizado = (form.titulo?.trim() || form.nombre?.trim() || tituloDelInitialForm?.trim() || tituloFinal).trim();
    
    // ✅ CRÍTICO: Si la descripción está vacía pero viene de IA, usar la de IA
    // Prioridad: 1) form.descripcion, 2) form.instrucciones, 3) initialForm.descripcion, 4) initialForm.instrucciones
    const descripcionFinal = (
      form.descripcion?.trim() || 
      form.instrucciones?.trim() || 
      descripcionDelInitialForm?.trim() || 
      ''
    ).trim();
    
    // ✅ Log para debugging si la descripción está vacía
    if (!descripcionFinal || descripcionFinal.length === 0) {
      console.warn('[SimulatorModal] ⚠️ DESCRIPCIÓN VACÍA al enviar:', {
        formDescripcion: form.descripcion,
        formInstrucciones: form.instrucciones,
        initialFormDescripcion: initialForm?.descripcion,
        initialFormInstrucciones: initialForm?.instrucciones,
        descripcionFinal
      });
    }
    
    // ✅ Log para debugging
    console.log('[SimulatorModal] handleSubmit - Validación de título:', {
      formTitulo: form.titulo,
      formNombre: form.nombre,
      initialFormTitulo: initialForm?.titulo,
      initialFormNombre: initialForm?.nombre,
      tituloFinal,
      nombreFinal,
      tituloFinalizado
    });
    
    // Validaciones adicionales con mensajes
    if (!nombreFinal || nombreFinal.length < 3) {
      showError('El nombre del simulador debe tener al menos 3 caracteres.');
      return;
    }
    if (!form.fechaLimite || form.fechaLimite.trim() === '') {
      showError('Debes seleccionar una fecha límite.');
      return;
    }
    const fechaLimiteDate = new Date(form.fechaLimite + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaLimiteDate < hoy) {
      showError('La fecha límite no puede ser menor a la fecha actual.');
      return;
    }
    if (!Array.isArray(form.grupos) || form.grupos.length === 0) {
      showError('Debes seleccionar al menos un grupo.');
      return;
    }
    if (totalMinutes <= 0) {
      showError('Debes especificar una duración mayor a 0 (horas o minutos).');
      return;
    }

    if (!canCreate) return;
    setLoading(true);
    try {
      // Normalizar grupos: convertir array a string separado por comas para el backend
      const gruposFinal = Array.isArray(form.grupos) && form.grupos.length > 0
        ? form.grupos.join(',')
        : '';
      // ✅ Asegurar que título y nombre estén sincronizados antes de enviar
      // ✅ IMPORTANTE: Preservar la descripción del form (que puede venir de iaPrefill)
      // ✅ CRÍTICO: Preservar areaId y areaTitle del form (vienen de iaPrefill cuando se genera con IA)
      const finalForm = {
        ...form,
        nombre: nombreFinal, // Usar el nombre final validado (con fallback a initialForm si viene de IA)
        titulo: tituloFinalizado, // Usar el título final validado (con fallback a initialForm si viene de IA)
        descripcion: descripcionFinal || '', // ✅ Preservar descripción (con fallback a initialForm si viene de IA)
        grupos: gruposFinal,
        // ✅ CRÍTICO: Incluir areaId y areaTitle en el finalForm para que handleCreate los use
        areaId: form.areaId !== undefined ? form.areaId : null,
        areaTitle: form.areaTitle !== undefined ? form.areaTitle : null
      };
      
      // ✅ Log detallado para debugging (siempre mostrar, incluso si es null)
      console.log('[SimulatorModal] Enviando finalForm a handleCreate:', {
        areaId: finalForm.areaId,
        areaTitle: finalForm.areaTitle,
        titulo: finalForm.titulo,
        nombre: finalForm.nombre,
        formAreaId: form.areaId,
        formAreaTitle: form.areaTitle,
        tieneAreaId: finalForm.areaId !== null && finalForm.areaId !== undefined,
        modo: mode
      });
      if (mode === 'edit') {
        await onUpdate?.(finalForm);
      } else {
        // Deja que el caller (SimuladoresGen) haga la navegación al builder con el ID creado
        await onCreate?.(finalForm);
      }
      if (!skipClose) {
        onClose?.();
      }
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3 flex-shrink-0">
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
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-xs flex-shrink-0">
            <XCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto p-0.5 hover:bg-red-100 rounded transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 overflow-y-auto flex-1">
          {step === 1 ? (
            <StepOne form={form} setForm={setForm} />
          ) : (
            <StepTwo form={form} setForm={setForm} gruposAsesor={gruposAsesor} gruposLoading={gruposLoading} hasGrupos={hasGrupos} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            
            {step === 1 ? (
              <button
                disabled={!canNext}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                {mode === 'edit' && onEditQuestions && (
                  <button
                    disabled={!canCreate || loading}
                    onClick={async () => {
                      await handleSubmit(true); // No cerrar el modal todavía
                      onClose?.(); // Cerrar después de guardar
                      // Pequeño delay para asegurar que el guardado se complete
                      setTimeout(() => {
                        onEditQuestions?.();
                      }, 100);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    title="Guardar cambios y editar preguntas"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar y editar preguntas
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
                <button
                  disabled={!canCreate || loading}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === 'edit' ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {mode === 'edit' ? 'Guardar cambios' : 'Crear simulador'}
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-1.5">
          <div
            className={[
              "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold shadow-sm ring-1 transition-all",
              step >= n 
                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-violet-300" 
                : "bg-slate-200 text-slate-500 ring-slate-300",
            ].join(" ")}
          >
            {step > n ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              n
            )}
          </div>
          {n === 1 && (
            <div className="h-0.5 w-6 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={[
                  "h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300",
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
      <p className="text-xs text-slate-600 leading-relaxed">
        Describe brevemente qué debe hacer el alumno antes de iniciar la simulación.
      </p>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-violet-600" />
          Título
        </label>
        <input
          value={form.titulo}
          onChange={(e) => {
            const nuevoTitulo = e.target.value.slice(0);
            // ✅ Sincronizar título con nombre automáticamente
            setForm((f) => ({ 
              ...f, 
              titulo: nuevoTitulo,
              nombre: f.nombre || nuevoTitulo // Si nombre está vacío, usar título
            }));
          }}
          placeholder="Escribe el título del simulador"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-violet-600" />
          Instrucciones
        </label>
        <textarea
          value={form.instrucciones}
          onChange={(e) =>
            setForm((f) => ({ ...f, instrucciones: e.target.value.slice(0) }))
          }
          rows={4}
          placeholder="Ej. Lee cada pregunta y selecciona la respuesta correcta. Tienes 30 minutos para completar el simulador…"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
        />
        <div className="flex items-center justify-between text-[11px] mt-1.5">
          <span
            className={[
              "font-semibold",
              count >= 10 ? "text-emerald-600" : "text-rose-600",
            ].join(" ")}
          >
            {count >= 10 ? "✓ Mínimo cumplido" : `Mínimo ${10 - count} caracteres`}
          </span>
          <span className="text-slate-500 font-medium">
            {count} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}

/* Paso 2 – Información del simulador */
function StepTwo({ form, setForm, gruposAsesor = [], gruposLoading = false, hasGrupos = false }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-violet-600" />
          Nombre del simulador
        </label>
        <input
          value={form.nombre}
          onChange={(e) => {
            const nuevoNombre = e.target.value;
            // ✅ Sincronizar nombre con título si título está vacío
            setForm((f) => ({ 
              ...f, 
              nombre: nuevoNombre,
              titulo: f.titulo || nuevoNombre // Si título está vacío, usar nombre
            }));
          }}
          placeholder="Ej. Simulador EXANI II – Razonamiento"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-violet-600" />
          Fecha límite <span className="text-rose-600">*</span>
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.fechaLimite}
          onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${form.fechaLimite && new Date(form.fechaLimite + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200'
            : form.fechaLimite
              ? 'border-emerald-300 focus:border-violet-500 focus:ring-violet-200'
              : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'
            }`}
        />
        {form.fechaLimite && new Date(form.fechaLimite + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0)) && (
          <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            La fecha no puede ser menor a la fecha actual.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-violet-600" />
          Duración (hrs)
        </label>
        <input
          type="number"
          min="0"
          value={form.horas}
          onChange={(e) =>
            setForm((f) => ({ ...f, horas: Number(e.target.value) }))
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-violet-600" />
          Duración (min)
        </label>
        <input
          type="number"
          min="0"
          value={form.minutos}
          onChange={(e) =>
            setForm((f) => ({ ...f, minutos: Number(e.target.value) }))
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
        />
      </div>

      {/* Selección de grupos */}
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-violet-600" />
          Grupos asignados <span className="text-rose-600">*</span>
        </label>
        {gruposLoading ? (
          <div className="text-xs text-slate-500 py-2 flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Cargando grupos...
          </div>
        ) : gruposAsesor.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
            No tienes grupos asignados. Contacta al administrador.
          </p>
        ) : (
          <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 max-h-40 overflow-y-auto">
            {gruposAsesor.map((grupo) => {
              const isSelected = Array.isArray(form.grupos) && form.grupos.includes(grupo);
              return (
                <label
                  key={grupo}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white rounded-lg px-2.5 py-1.5 transition-all border border-transparent hover:border-violet-200"
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
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-semibold flex-1">{grupo.toUpperCase()}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-violet-600" />
                  )}
                </label>
              );
            })}
          </div>
        )}
        {!hasGrupos && gruposAsesor.length > 0 && (
          <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Debes seleccionar al menos un grupo.
          </p>
        )}
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
          Selecciona los grupos a los que quieres asignar este simulador.
        </p>
      </div>
    </div>
  );
}
