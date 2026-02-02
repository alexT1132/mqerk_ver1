// Componente reutilizable para generar contenido con IA (simuladores, quizzes, exámenes)
// Este componente puede ser usado en cualquier parte de la aplicación que necesite generar contenido con IA

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getCooldownRemainingMs } from '../../../service/simuladoresAI';
import { useAlert } from '../../../components/shared/AlertModal.jsx';

/**
 * Modal reutilizable para generar contenido con IA
 * @param {Object} props
 * @param {boolean} props.open - Si la modal está abierta
 * @param {Function} props.onClose - Función para cerrar la modal
 * @param {Function} props.onGenerate - Callback cuando se genera el contenido. Recibe: { modo, temasText, nivel, idioma, distribucion, temperature, topP, topK, maxOutputTokens, cantidad }
 * @param {string} props.tipo - Tipo de contenido: 'simulador' | 'quiz' | 'examen' (para personalizar textos)
 * @param {string} props.areaTitle - Título del área (opcional)
 * @param {number} props.areaId - ID del área (opcional)
 * @param {string} props.generalTopic - Tema general cuando no hay área (opcional)
 * @param {boolean} props.loading - Estado de carga externo (opcional)
 * @param {number} props.maxQuestions - Máximo de preguntas permitidas (default: 50)
 * @param {Object} props.initialValues - Valores iniciales para los campos (opcional)
 */
export default function GeneradorIAModal({
  open,
  onClose,
  onGenerate,
  tipo = 'simulador',
  areaTitle = '',
  areaId = null,
  generalTopic = '',
  loading = false,
  maxQuestions = 50,
  initialValues = {}
}) {
  const { showAlert, showConfirm, AlertComponent } = useAlert();

  const MAX_IA = maxQuestions;

  // Estados internos
  const [iaChoiceMode, setIaChoiceMode] = useState(initialValues.mode || 'general'); // 'general' | 'temas'
  const [iaChoiceTopics, setIaChoiceTopics] = useState(initialValues.topics || '');
  const [iaNivel, setIaNivel] = useState(initialValues.nivel || 'intermedio');
  const [iaIdioma, setIaIdioma] = useState(initialValues.idioma || 'auto');
  const [iaError, setIaError] = useState('');
  const [cooldownMs, setCooldownMs] = useState(0);
  const [iaCountMultiple, setIaCountMultiple] = useState(initialValues.countMultiple || 3);
  const [iaCountVerdaderoFalso, setIaCountVerdaderoFalso] = useState(initialValues.countVerdaderoFalso || 1);
  const [iaCountCorta, setIaCountCorta] = useState(initialValues.countCorta || 1);
  const [iaShowAdvanced, setIaShowAdvanced] = useState(false);
  const [iaTemperature, setIaTemperature] = useState(initialValues.temperature || 0.6);
  const [iaTopP, setIaTopP] = useState(initialValues.topP || '');
  const [iaTopK, setIaTopK] = useState(initialValues.topK || '');
  const [iaMaxTokens, setIaMaxTokens] = useState(initialValues.maxTokens || '');
  const [showSummary, setShowSummary] = useState(false);

  // Lock page scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    try {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    } catch { }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Cooldown effect
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const remaining = getCooldownRemainingMs();
      setCooldownMs(remaining);
      if (remaining === 0) {
        setIaError(prev => {
          if (!prev) return prev;
          const msg = prev.toLowerCase();
          if (msg.includes('límite') || msg.includes('espera') || msg.includes('cooldown')) return '';
          return prev;
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, [open]);

  // Templates de temas según el área
  const temasPlantillas = useMemo(() => {
    const areaLower = (areaTitle || '').toLowerCase();
    if (areaLower.includes('español') || areaLower.includes('redacción')) {
      return ['sinónimos y antónimos', 'ortografía', 'lectura comprensiva', 'acentuación', 'gramática'];
    } else if (areaLower.includes('matemática') || areaLower.includes('matemáticas') || areaLower.includes('pensamiento') || areaLower.includes('analítico')) {
      return ['ecuaciones y sistemas', 'geometría y trigonometría', 'fracciones y porcentajes', 'funciones y gráficas', 'razonamiento numérico'];
    } else if (areaLower.includes('física') || areaLower.includes('fisica')) {
      return ['cinemática', 'dinámica y fuerzas', 'energía y trabajo', 'termodinámica', 'electricidad'];
    } else if (areaLower.includes('química') || areaLower.includes('quimica')) {
      return ['estequiometría', 'soluciones y molaridad', 'balanceo de ecuaciones', 'tabla periódica', 'reacciones químicas'];
    } else if (areaLower.includes('ciencia') || areaLower.includes('social')) {
      return ['mecánica', 'termodinámica', 'óptica', 'electricidad', 'ondas'];
    }
    return ['conceptos básicos', 'aplicaciones', 'análisis', 'síntesis', 'evaluación'];
  }, [areaTitle]);

  if (!open) return null;

  // Títulos según el tipo
  const getTitulo = () => {
    switch (tipo) {
      case 'quiz':
        return 'Generar quiz con IA';
      case 'examen':
        return 'Generar examen con IA';
      default:
        return 'Generar simulador con IA';
    }
  };

  const getSubtitulo = () => {
    return 'Configuración personalizada. Puedes editarlo después.';
  };

  const handleGenerate = async () => {
    if (loading) return;

    // Verificar cooldown
    const rem = getCooldownRemainingMs();
    if (rem > 0) {
      const secs = Math.ceil(rem / 1000);
      const mins = Math.floor(secs / 60);
      const secsRem = secs % 60;
      const timeStr = mins > 0
        ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}`
        : `${secs} segundo${secs > 1 ? 's' : ''}`;
      setIaError(`⏳ Espera requerida\n\nDebes esperar ${timeStr} antes de volver a generar con IA. El botón quedará deshabilitado durante este tiempo.\n\nPuedes cerrar este modal y volver a intentarlo cuando termine el tiempo de espera.`);
      setCooldownMs(rem);
      return;
    }

    // Validaciones
    if (!areaId && !generalTopic.trim()) {
      setIaError(`Escribe un tema para generar con IA en ${tipo === 'quiz' ? 'quizzes' : tipo === 'examen' ? 'exámenes' : 'simulaciones'} generales.`);
      return;
    }

    setIaError('');

    if (iaChoiceMode === 'temas') {
      const temasList = String(iaChoiceTopics || '').split(',').map(s => s.trim()).filter(Boolean);
      if (temasList.length === 0) {
        setIaError('Ingresa al menos un tema separado por comas (ej: sinónimos, ortografía, lectura)');
        return;
      }
    }

    const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
    if (cantidad > MAX_IA) {
      setIaError(`Máximo ${MAX_IA} preguntas por generación con IA`);
      return;
    }
    if (cantidad < 1) {
      setIaError('Se requiere al menos 1 pregunta (configura la distribución)');
      return;
    }
    if (iaCountMultiple < 0 || iaCountVerdaderoFalso < 0 || iaCountCorta < 0) {
      setIaError('Las cantidades no pueden ser negativas');
      return;
    }

    // Preparar datos para el callback
    const distribucion = {
      multi: iaCountMultiple,
      tf: iaCountVerdaderoFalso,
      short: iaCountCorta
    };

    const temasList = String(iaChoiceTopics || '').split(',').map(s => s.trim()).filter(Boolean);

    // Validación: advertencia si hay más temas que preguntas
    if (iaChoiceMode === 'temas' && temasList.length > cantidad) {
      const advertencia = `Has especificado ${temasList.length} temas (${temasList.join(', ')}), pero solo se generarán ${cantidad} preguntas. Algunos temas no tendrán preguntas. ¿Deseas continuar?`;

      const continuar = await showConfirm(advertencia, 'Advertencia');
      if (!continuar) {
        return;
      }
    }

    try {
      // Llamar al callback con toda la configuración
      await onGenerate({
        modo: iaChoiceMode,
        temasText: iaChoiceTopics,
        temas: iaChoiceMode === 'temas' ? temasList : undefined,
        nivel: iaNivel,
        idioma: iaIdioma,
        distribucion,
        cantidad,
        temperature: iaTemperature,
        topP: iaTopP !== '' ? Number(iaTopP) : undefined,
        topK: iaTopK !== '' ? Number(iaTopK) : undefined,
        maxOutputTokens: iaMaxTokens !== '' ? Number(iaMaxTokens) : undefined
      });
    } catch (error) {
      // Manejar errores del callback
      const msg = String(error?.message || '').toLowerCase();
      const rem = getCooldownRemainingMs();

      if (error?.code === 'API_KEY_LEAKED' || msg.includes('leaked')) {
        setIaError('⚠️ API Key bloqueada por seguridad. Contacta al administrador.');
      } else if (error?.code === 'RATE_LIMIT' || error?.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
        const cooldownTime = error?.remainingMs || rem || 45000;
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const secsRem = secs % 60;
        const timeStr = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setIaError(`⚠️ Límite de solicitudes alcanzado (Error 429)\n\nSe alcanzó el límite de solicitudes a la API de Google Gemini.\n\n⏱️ Tiempo de espera: ${timeStr}\n\nEl botón quedará deshabilitado durante este tiempo.`);
        setCooldownMs(cooldownTime);
      } else if (error?.code === 'COOLDOWN' || msg.includes('cooldown')) {
        const cooldownTime = error?.remainingMs || rem || 45000;
        const secs = Math.ceil(cooldownTime / 1000);
        const mins = Math.floor(secs / 60);
        const secsRem = secs % 60;
        const timeStr = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''} y ${secsRem} segundo${secsRem > 1 ? 's' : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        setIaError(`⏳ Espera requerida\n\nDebes esperar ${timeStr} antes de volver a generar con IA.`);
        setCooldownMs(cooldownTime);
      } else {
        setIaError(error?.message || error?.response?.data?.message || 'Error al generar. Intenta nuevamente.');
      }
    }
  };

  const handleClose = () => {
    setIaError('');
    setShowSummary(false);
    onClose();
  };

  return (
    <>
      <AlertComponent />
      <div className="mqerk-sim-ia-overlay fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24 pb-6">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          onClick={handleClose}
        />
        <div className="mqerk-sim-ia-dialog relative z-10 w-full max-w-2xl max-h-[75vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-2 ring-emerald-200/40 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-indigo-50 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 p-1.5 shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900">{getTitulo()}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{getSubtitulo()}</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body con scroll */}
          <div className="mqerk-hide-scrollbar flex-1 min-h-0 px-4 py-3 space-y-3 overflow-y-auto">
            {/* Opciones de modo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Tipo de generación</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setIaChoiceMode('general'); setIaError(''); }}
                  className={["relative text-left rounded-lg border-2 p-2.5 transition-all",
                    iaChoiceMode === 'general'
                      ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  ].join(' ')}
                >
                  {iaChoiceMode === 'general' && (
                    <div className="absolute top-1.5 right-1.5">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">
                    {areaId ? 'General del área' : 'General del tema'}
                  </div>
                  <div className="text-xs text-slate-600 leading-snug">
                    {areaId
                      ? `Preguntas variadas de "${areaTitle || 'esta área'}". Ideal para conocimientos generales.`
                      : `Preguntas variadas sobre "${generalTopic || 'el tema'}". Ideal para conocimientos generales.`
                    }
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setIaChoiceMode('temas'); setIaError(''); }}
                  className={["relative text-left rounded-lg border-2 p-2.5 transition-all",
                    iaChoiceMode === 'temas'
                      ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  ].join(' ')}
                >
                  {iaChoiceMode === 'temas' && (
                    <div className="absolute top-1.5 right-1.5">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">Por temas específicos</div>
                  <div className="text-xs text-slate-600 leading-snug">
                    Enfocado en temas concretos. Ej: "sinónimos, ortografía". Distribución equitativa.
                  </div>
                </button>
              </div>
            </div>

            {/* Input de temas (solo si modo = temas) */}
            {iaChoiceMode === 'temas' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Temas específicos <span className="text-rose-500">*</span>
                  </label>
                  {iaChoiceTopics && (
                    <span className="text-[10px] text-slate-500">
                      {iaChoiceTopics.split(',').filter(t => t.trim()).length} tema{iaChoiceTopics.split(',').filter(t => t.trim()).length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    value={iaChoiceTopics}
                    onChange={e => {
                      const value = e.target.value;
                      // Limpiar duplicados automáticamente
                      const temas = value.split(',').map(s => s.trim()).filter(Boolean);
                      const unique = [...new Set(temas)];
                      setIaChoiceTopics(unique.join(', '));
                      setIaError('');
                    }}
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors"
                    placeholder="Ej: sinónimos, ortografía, lectura"
                  />
                  {iaChoiceTopics && (
                    <button
                      type="button"
                      onClick={() => setIaChoiceTopics('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                      title="Limpiar"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {temasPlantillas.slice(0, 3).map((tema, idx) => {
                      const current = iaChoiceTopics.split(',').map(s => s.trim()).filter(Boolean);
                      const isAdded = current.includes(tema);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!isAdded) {
                              setIaChoiceTopics([...current, tema].join(', '));
                              setIaError('');
                            } else {
                              setIaChoiceTopics(current.filter(t => t !== tema).join(', '));
                            }
                          }}
                          className={[
                            "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                            isAdded
                              ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                              : "border-slate-300 bg-white text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                          ].join(' ')}
                        >
                          {isAdded ? '✓' : '+'} {tema}
                        </button>
                      );
                    })}
                  </div>
                  {iaChoiceTopics && (
                    <button
                      type="button"
                      onClick={() => setIaChoiceTopics('')}
                      className="text-[10px] text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Separa con comas. Mínimo 1, máximo 5 recomendado.
                </p>
              </div>
            )}

            {/* Selector de nivel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nivel de dificultad</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'básico', label: 'Básico', desc: 'Conceptos fundamentales' },
                  { value: 'intermedio', label: 'Intermedio', desc: 'Aplicación' },
                  { value: 'avanzado', label: 'Avanzado', desc: 'Análisis' }
                ].map((nivel) => {
                  const isSelected = iaNivel === nivel.value;
                  return (
                    <button
                      key={nivel.value}
                      type="button"
                      onClick={() => setIaNivel(nivel.value)}
                      className={[
                        "text-left rounded-lg border-2 p-2 transition-all",
                        isSelected
                          ? nivel.value === 'básico'
                            ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                            : nivel.value === 'intermedio'
                              ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                              : 'border-purple-400 bg-purple-50 ring-1 ring-purple-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      ].join(' ')}
                    >
                      <div className="text-xs font-semibold text-slate-800">{nivel.label}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{nivel.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de idioma */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Idioma de salida</label>
              <select
                value={iaIdioma}
                onChange={(e) => setIaIdioma(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
              >
                <option value="auto">Auto (según área/tema)</option>
                <option value="es">Español (es-MX)</option>
                <option value="en">Inglés (en-US)</option>
                <option value="mix">Mixto (mitad ES, mitad EN)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Consejo: si mezclas materias (ej. "matemáticas, español, inglés…"), usa "Español" o "Auto". Para practicar inglés, elige "Inglés" o "Mixto".
              </p>
            </div>

            {/* Distribución de tipos de preguntas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Distribución de preguntas <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-3">
                {/* Opción múltiple */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 w-32 flex-shrink-0">Opción múltiple:</label>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIaCountMultiple(Math.max(0, iaCountMultiple - 1))}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={iaCountMultiple <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={MAX_IA}
                      value={iaCountMultiple}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                        setIaCountMultiple(val);
                        setIaError('');
                      }}
                      className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                        if (total < MAX_IA) setIaCountMultiple(Math.min(MAX_IA, iaCountMultiple + 1));
                      }}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-500">preguntas</span>
                  </div>
                </div>

                {/* Verdadero/Falso */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 w-32 flex-shrink-0">Verdadero/Falso:</label>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIaCountVerdaderoFalso(Math.max(0, iaCountVerdaderoFalso - 1))}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={iaCountVerdaderoFalso <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={MAX_IA}
                      value={iaCountVerdaderoFalso}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                        setIaCountVerdaderoFalso(val);
                        setIaError('');
                      }}
                      className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                        if (total < MAX_IA) setIaCountVerdaderoFalso(Math.min(MAX_IA, iaCountVerdaderoFalso + 1));
                      }}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-500">preguntas</span>
                  </div>
                </div>

                {/* Respuesta corta */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 w-32 flex-shrink-0">Respuesta corta:</label>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIaCountCorta(Math.max(0, iaCountCorta - 1))}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={iaCountCorta <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={MAX_IA}
                      value={iaCountCorta}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(MAX_IA, Number(e.target.value) || 0));
                        setIaCountCorta(val);
                        setIaError('');
                      }}
                      className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-xs font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const total = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
                        if (total < MAX_IA) setIaCountCorta(Math.min(MAX_IA, iaCountCorta + 1));
                      }}
                      className="w-7 h-7 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm font-bold"
                      disabled={(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) >= MAX_IA}
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-500">preguntas</span>
                  </div>
                </div>

                {/* Resumen total */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total:</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parámetros avanzados de configuración de IA */}
            <div>
              <button
                type="button"
                onClick={() => setIaShowAdvanced(!iaShowAdvanced)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5" />
                  <span>Parámetros avanzados de IA</span>
                </div>
                <div className="flex items-center gap-1">
                  {iaShowAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>

              {iaShowAdvanced && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                  {/* Temperatura / Creatividad */}
                  <div className="text-xs">
                    <div className="flex justify-between mb-1">
                      <label className="font-semibold text-slate-700">Creatividad (Temperatura)</label>
                      <span className="text-slate-500">{Number(iaTemperature).toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={iaTemperature}
                      onChange={e => setIaTemperature(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Preciso</span>
                      <span>Creativo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Top‑P</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="1"
                        step="0.05"
                        value={iaTopP}
                        onChange={(e) => setIaTopP(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                        placeholder="(vacío)"
                      />
                      <p className="mt-1 text-[10px] text-slate-500">0–1 (vacío = default)</p>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Top‑K</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={iaTopK}
                        onChange={(e) => setIaTopK(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                        placeholder="(vacío)"
                      />
                      <p className="mt-1 text-[10px] text-slate-500">Entero (vacío = default)</p>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max tokens</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="64"
                        step="64"
                        value={iaMaxTokens}
                        onChange={(e) => setIaMaxTokens(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                        placeholder="(vacío)"
                      />
                      <p className="mt-1 text-[10px] text-slate-500">Más alto = respuestas más largas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mensaje de error */}
            {iaError && (
              <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-amber-800 font-semibold mb-1 leading-relaxed whitespace-pre-line">{iaError}</p>
                  {cooldownMs > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                          style={{ width: `${Math.min(100, (cooldownMs / 45000) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 whitespace-nowrap">
                        {Math.ceil(cooldownMs / 1000)}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resumen de configuración */}
            {showSummary && (
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">Resumen de configuración</span>
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="text-emerald-600 hover:text-emerald-800 text-[10px]"
                  >
                    Ocultar
                  </button>
                </div>
                <div className="space-y-1 text-[11px] text-emerald-800">
                  {!areaId && generalTopic && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Tema:</span>
                      <span className="flex-1">{generalTopic}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Modo:</span>
                    <span>{iaChoiceMode === 'general' ? (areaId ? 'General del área' : 'General del tema') : 'Por temas específicos'}</span>
                  </div>
                  {iaChoiceMode === 'temas' && iaChoiceTopics && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Temas:</span>
                      <span className="flex-1">{iaChoiceTopics}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Nivel:</span>
                    <span className="capitalize">{iaNivel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Idioma:</span>
                    <span>
                      {iaIdioma === 'auto' ? 'Auto' : iaIdioma === 'es' ? 'Español' : iaIdioma === 'en' ? 'Inglés' : 'Mixto'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Cantidad:</span>
                    <span>{iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''} ({iaCountMultiple} múltiple, {iaCountVerdaderoFalso} V/F, {iaCountCorta} corta)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Área:</span>
                    <span>{areaTitle || 'No especificada'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Info adicional */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-slate-600 leading-relaxed flex-1">
                  <strong className="text-slate-700">Nota:</strong> Puedes editar las preguntas después. Proceso: 10-30 segundos.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSummary(!showSummary)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                >
                  {showSummary ? 'Ocultar' : 'Ver'} resumen
                </button>
              </div>
            </div>
          </div>

          {/* Footer con botones - siempre visible */}
          <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 bg-slate-50">
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              {cooldownMs > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  Espera {Math.ceil(cooldownMs / 1000)}s
                </span>
              )}
              {!loading && !cooldownMs && (
                <span className="text-slate-400">
                  Tiempo estimado: {(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 10 ? '10-15s' : (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) <= 30 ? '15-25s' : '25-35s'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || cooldownMs > 0 || (!areaId && !generalTopic.trim()) || (iaChoiceMode === 'temas' && !iaChoiceTopics.trim()) || (iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) < 1}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generando {iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} pregunta{(iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta) !== 1 ? 's' : ''}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s` : 'Generar'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CSS local: ocultar barra de scroll manteniendo scroll */}
          <style>{`
            .mqerk-hide-scrollbar {
              -ms-overflow-style: none; /* IE/Edge legacy */
              scrollbar-width: none; /* Firefox */
              scrollbar-color: transparent transparent; /* Firefox */
            }
            .mqerk-hide-scrollbar::-webkit-scrollbar {
              width: 0 !important;
              height: 0 !important;
              display: none !important;
            }
            .mqerk-hide-scrollbar::-webkit-scrollbar-thumb {
              background: transparent !important;
            }
            .mqerk-hide-scrollbar::-webkit-scrollbar-track {
              background: transparent !important;
            }

            /* Pantallas con poca altura: modal más compacto */
            @media (max-height: 720px) {
              .mqerk-sim-ia-dialog {
                max-height: 70vh;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
