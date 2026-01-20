import { useState, useEffect } from 'react';
import { Modal, FormulaEditModal } from './MathPalette.jsx';
import { PlaceholderModal } from './MathPalette.jsx';
import InlineMath from './InlineMath.jsx';

// Configuración de cooldown para evitar errores 429
const COOLDOWN_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_MS || 45000); // 45 segundos por defecto
// Cooldown más largo para errores 503 (Service Unavailable) - 2 minutos
const COOLDOWN_503_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_503_MS || 120000); // 120 segundos (2 minutos) por defecto
const COOLDOWN_KEY = 'ia_formula_cooldown_until';

// Helpers para cooldown
const getCooldownRemainingMs = () => {
  try {
    const v = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    const rem = v - Date.now();
    return rem > 0 ? rem : 0;
  } catch {
    return 0;
  }
};

const startCooldown = (is503 = false) => {
  try {
    const cooldownTime = is503 ? COOLDOWN_503_MS : COOLDOWN_MS;
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + cooldownTime));
  } catch { }
};

// Sistema de tracking de uso diario (separado de preguntas y análisis)
const USAGE_KEY = 'ai_formulas_usage';
const DAILY_LIMIT_ASESOR = 20; // Asesores pueden generar más fórmulas

const getFormulaUsageToday = () => {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
    }
    return {
      count: data.count || 0,
      limit: DAILY_LIMIT_ASESOR,
      remaining: Math.max(0, DAILY_LIMIT_ASESOR - (data.count || 0))
    };
  } catch {
    return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
  }
};

const incrementFormulaUsage = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    if (data.date !== today) {
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT_ASESOR }));
    } else {
      data.count = (data.count || 0) + 1;
      localStorage.setItem(USAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error incrementando uso de fórmulas IA:', e);
  }
};


/** Modal para generar fórmulas usando IA */
export function AIFormulaModal({ open, onClose, onInsert }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedFormula, setGeneratedFormula] = useState('');
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Modal de edición para fórmulas con valores
  const [history, setHistory] = useState([]); // Historial de fórmulas generadas recientemente
  const [cooldownMs, setCooldownMs] = useState(0); // Tiempo restante de cooldown



  // Verificar cooldown periódicamente
  useEffect(() => {
    if (!open) return;

    const checkCooldown = () => {
      setCooldownMs(getCooldownRemainingMs());
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [open]);

  // Ejemplos de fórmulas comunes organizadas por categoría
  const formulaExamples = {
    'Álgebra': [
      'Fórmula cuadrática',
      'Producto notable (a+b)²',
      'Factorización x²+5x+6',
      'Ecuación de primer grado',
    ],
    'Geometría': [
      'Teorema de Pitágoras',
      'Área de un círculo',
      'Volumen de un cilindro',
      'Perímetro de un triángulo',
    ],
    'Física': [
      'Ley de Ohm',
      'Energía cinética',
      'Velocidad promedio',
      'Segunda ley de Newton',
    ],
    'Química': [
      'pH de una solución',
      'Concentración molar',
      'Ecuación de estado de gases',
      'Balanceo de ecuaciones',
    ],
    'Calculus': [
      'Derivada de x²',
      'Integral de x',
      'Límite cuando x tiende a infinito',
      'Regla de la cadena',
    ],
  };

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError('Por favor, ingresa una descripción de la fórmula que necesitas');
      return;
    }

    // Verificar cooldown antes de generar
    const rem = getCooldownRemainingMs();
    if (rem > 0) {
      const secs = Math.ceil(rem / 1000);
      setError(`Debes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA.`);
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedFormula('');

    try {
      const prompt = `Genera SOLO el código LaTeX de una fórmula matemática para: "${query.trim()}".

IMPORTANTE:
- Responde ÚNICAMENTE con el código LaTeX de la fórmula, sin texto adicional, sin explicaciones, sin comillas.
- Si la fórmula tiene parámetros variables (como coeficientes, variables, constantes), usa \\square como placeholder para cada parámetro que deba ser completado.
- Si la fórmula es específica y completa (sin parámetros), NO uses \\square.
- Ejemplo: Si pides "ecuación cuadrática", responde: x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
- Ejemplo: Si pides "raíz cuadrada de un número", responde: \\sqrt{\\square}
- Ejemplo: Si pides "ecuación de Dirac", responde: (i\\gamma^\\mu \\partial_\\mu - m)\\psi = 0
- Si pides una fórmula con valores específicos, usa esos valores.
- NO agregues delimitadores $ al inicio o final.
- NO agregues texto adicional como "La fórmula es:" o similares.
- Para fórmulas más complejas (ejemplo: Transformada de Fourier en 3D, ecuación de Schrödinger, Navier-Stokes), genera la versión más detallada y formal posible, evitando expresiones demasiado generales.

Fórmula solicitada: ${query.trim()}`;

      const response = await fetch('/api/ai/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3, // Baja temperatura para respuestas más determinísticas
            maxOutputTokens: 2000, // Aumentado para fórmulas complejas como Transformada de Fourier
          },
          model: 'gemini-2.5-flash',
          purpose: 'formulas' // Usar API keys específicas para generación de fórmulas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Manejo especial para errores de rate limit (429 y 503)
        if (response.status === 429 || response.status === 503) {
          const is503 = response.status === 503;
          const cooldownTime = is503 ? COOLDOWN_503_MS : COOLDOWN_MS;
          startCooldown(is503);
          setCooldownMs(cooldownTime);
          const secs = Math.ceil(cooldownTime / 1000);
          const mins = Math.floor(secs / 60);
          const remainingSecs = secs % 60;
          const timeDisplay = mins > 0
            ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
            : `${secs} segundo${secs > 1 ? 's' : ''}`;

          const errorMsg = is503
            ? `El servicio de IA está temporalmente no disponible (saturado). Por favor, espera ${timeDisplay}.`
            : `Se alcanzó el límite de solicitudes a la API. Por favor, espera ${timeDisplay}.`;
          throw new Error(errorMsg);
        }

        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();



      // Extraer el texto de la respuesta de Gemini
      let formula = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts || [];
        formula = parts.map(p => p.text || '').join('').trim();
      }

      if (!formula) {
        throw new Error('No se pudo generar la fórmula. Por favor intenta con otra descripción.');
      }

      // Limpiar la fórmula: remover delimitadores $ si los hay, y espacios extras
      formula = formula.replace(/^\$+|\$+$/g, '').trim();
      formula = formula.replace(/^La fórmula es[:]?\s*/i, '').trim();
      formula = formula.replace(/^Fórmula[:]?\s*/i, '').trim();

      // Remover texto adicional común que puede aparecer al final
      formula = formula.replace(/\s*\.\s*$/, '').trim(); // Remover punto final si existe

      // Log en desarrollo para ver la fórmula completa generada
      if (process.env.NODE_ENV === 'development') {
        console.log('[AIFormulaModal] Fórmula generada (longitud:', formula.length, '):', formula.substring(0, 200) + (formula.length > 200 ? '...' : ''));
      }

      setGeneratedFormula(formula);

      // Incrementar contador de uso exitoso
      incrementFormulaUsage();

      // Agregar al historial (máximo 5)
      setHistory(prev => {
        const newHistory = [{ query: query.trim(), formula, timestamp: Date.now() }, ...prev];
        return newHistory.slice(0, 5);
      });
    } catch (err) {
      const errorMsg = err.message || 'Error al generar la fórmula. Por favor intenta de nuevo.';
      setError(errorMsg);

      // Si el error menciona cooldown, límite o no disponible, actualizar el estado
      if (errorMsg.includes('espera') || errorMsg.includes('límite') || errorMsg.includes('no disponible') || errorMsg.includes('503')) {
        setCooldownMs(getCooldownRemainingMs());
      }
    } finally {
      setLoading(false);
    }
  };

  // Usar ejemplo rápidamente
  const handleExampleClick = (example) => {
    setQuery(example);
    setError('');
    // Auto-generar después de un pequeño delay para mejor UX
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  // Regenerar la misma fórmula
  const handleRegenerate = () => {
    if (query.trim()) {
      handleGenerate();
    }
  };

  // Usar fórmula del historial
  const handleUseHistory = (historyItem) => {
    const formulaWithDelimiters = historyItem.formula.startsWith('$')
      ? historyItem.formula
      : `$${historyItem.formula}$`;
    onInsert(formulaWithDelimiters);
    handleClose();
  };

  const handleInsert = () => {
    if (generatedFormula) {
      // Si la fórmula tiene placeholders, abrir el modal de placeholders para completarlos
      if (generatedFormula.includes('\\square')) {
        setShowPlaceholderModal(true);
      } else {
        // Si no tiene placeholders, insertar directamente
        // El usuario podrá editarla después haciendo clic en la fórmula insertada
        const formulaWithDelimiters = generatedFormula.startsWith('$')
          ? generatedFormula
          : `$${generatedFormula}$`;

        onInsert(formulaWithDelimiters);
        handleClose();
      }
    }
  };

  const handleEditModalSave = (formulaWithDelimiters) => {
    // La fórmula ya viene con delimitadores del modal de edición
    onInsert(formulaWithDelimiters);
    setShowEditModal(false);
    handleClose();
  };

  const handlePlaceholderConfirm = (completedFormula) => {
    // Agregar delimitadores si no los tiene
    const formulaWithDelimiters = completedFormula.startsWith('$')
      ? completedFormula
      : `$${completedFormula}$`;

    onInsert(formulaWithDelimiters);
    setShowPlaceholderModal(false);
    setQuery('');
    setGeneratedFormula('');
    setError('');
    // Limpiar historial al cerrar
    setHistory([]);
    onClose();
  };

  // Limpiar todo al cerrar
  const handleClose = () => {
    setQuery('');
    setGeneratedFormula('');
    setError('');
    setHistory([]);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Modal compacta personalizada */}
      <div className="mqerk-ai-formula-overlay fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-24 pb-6">
        {/* Contenedor principal con altura reducida y scroll oculto */}
        <div className="mqerk-ai-formula-dialog w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-4 ring-violet-200/30 border-2 border-violet-200/50 
                        max-h-[85vh] h-auto max-w-full md:max-w-lg md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="mqerk-ai-formula-header flex items-center justify-between border-b-2 border-violet-200/50 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg ring-2 ring-violet-200/50">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mqerk-ai-formula-title text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">Generar fórmula con IA</h3>
            </div>
            <button
              onClick={handleClose}
              className="rounded-xl p-2 text-slate-500 hover:text-slate-700 transition-all hover:bg-white hover:scale-110 active:scale-95 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido con scroll oculto */}
          <div className="mqerk-ai-formula-content mqerk-hide-scrollbar overflow-y-auto flex-1 min-h-0 p-4 bg-gradient-to-b from-white to-slate-50/30">
            <div className="mqerk-ai-formula-stack space-y-4">
              {/* Input para la solicitud */}
              <div>
                <label className="block text-sm font-extrabold text-violet-700 mb-2">
                  Describe la fórmula <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: Fórmula cuadrática, Teorema de Pitágoras, Ley de Ohm..."
                    className="mqerk-ai-formula-textarea w-full rounded-xl border-2 border-slate-300 px-4 py-3 pr-28 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 resize-none hover:border-violet-400 bg-white h-20 sm:h-24 shadow-sm hover:shadow-md"
                    style={{ whiteSpace: 'pre-wrap' }}
                    disabled={loading}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !query.trim() || cooldownMs > 0}
                    className="mqerk-ai-formula-generate absolute right-2 bottom-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-violet-300/50 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1.5 ring-2 ring-violet-200/50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generando...</span>
                      </>
                    ) : cooldownMs > 0 ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Espera {Math.ceil(cooldownMs / 1000)}s</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generar</span>
                      </>
                    )}
                  </button>
                </div>
                {/* SE HA QUITADO EL TIP "Presiona Enter para generar" */}
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className={`rounded-2xl border-2 p-4 shadow-md ring-2 ${error.includes('espera') || error.includes('límite') || error.includes('no disponible') || error.includes('503')
                  ? 'border-amber-300 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 ring-amber-200/50'
                  : 'border-rose-300 bg-gradient-to-r from-rose-50 via-rose-100/50 to-rose-50 ring-rose-200/50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${error.includes('espera') || error.includes('límite') || error.includes('no disponible') || error.includes('503')
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                      : 'bg-gradient-to-br from-rose-500 to-rose-600'
                      } shadow-lg ring-2 ring-white/50`}>
                      <span className="text-base text-white">
                        {(error.includes('espera') || error.includes('límite') || error.includes('no disponible') || error.includes('503')) ? '⏱️' : '⚠️'}
                      </span>
                    </div>
                    <div className="flex-1">
                      {/* ESTE ES EL CAMBIO CLAVE: Tamaño de fuente fijo para el mensaje de error crítico */}
                      <p className={`font-bold leading-relaxed ${error.includes('espera') || error.includes('límite') || error.includes('no disponible') || error.includes('503') ? 'text-amber-800' : 'text-rose-700'
                        } ${error === 'Por favor, ingresa una descripción de la fórmula que necesitas' ? 'text-sm' : 'text-sm'}`}>{error}</p>
                      {(error.includes('espera') || error.includes('límite') || error.includes('no disponible') || error.includes('503')) && cooldownMs > 0 && (
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          Esto ayuda a evitar límites de la API de Google.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa de la fórmula generada */}
              {generatedFormula && (
                <div className="rounded-3xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-5 shadow-xl shadow-violet-200/50 ring-4 ring-violet-200/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                      <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">Fórmula generada</p>
                    </div>
                    <button
                      onClick={handleRegenerate}
                      disabled={loading || cooldownMs > 0}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold px-3 py-1.5 rounded-xl hover:bg-white/80 transition-all flex items-center gap-1.5 disabled:opacity-50 hover:scale-105 active:scale-95 border border-violet-200 hover:border-violet-300 shadow-sm hover:shadow-md"
                      title={cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s para regenerar` : 'Regenerar fórmula'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerar
                    </button>
                  </div>
                  <div className="bg-white/80 rounded-xl p-5 border-2 border-violet-200/50 min-h-[70px] flex items-center justify-center leading-relaxed shadow-sm max-w-full">
                    <div className={`w-full ${generatedFormula.length > 200 ? 'text-sm' : generatedFormula.length > 150 ? 'text-base' : generatedFormula.length > 80 ? 'text-lg' : 'text-2xl'} font-medium text-slate-900`}>
                      <div className="mqerk-hide-scrollbar overflow-x-auto overflow-y-hidden w-full" style={{ maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <div className="inline-block min-w-full">
                          <InlineMath math={generatedFormula} display={generatedFormula.length > 50 || generatedFormula.includes('\\frac') || generatedFormula.includes('\\int')} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Mostrar fórmula en texto plano si es muy larga o compleja para debugging */}
                  {process.env.NODE_ENV === 'development' && generatedFormula.length > 100 && (
                    <div className="mt-3 pt-3 border-t border-violet-200/50">
                      <p className="mqerk-hide-scrollbar text-xs text-slate-500 font-mono break-all bg-slate-50 p-2 rounded overflow-x-auto">
                        {generatedFormula}
                      </p>
                    </div>
                  )}
                  {generatedFormula.includes('\\square') && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300/50 px-4 py-2.5 shadow-sm">
                      <span className="text-base">⚙</span>
                      <p className="text-xs text-amber-800 font-bold flex-1">
                        Requiere completar parámetros antes de insertar
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Ejemplos de uso organizados por categoría */}
              {!generatedFormula && !loading && (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-5 max-[700px]:p-4 shadow-md ring-2 ring-violet-100/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-violet-200/50">
                        <span className="text-lg">💡</span>
                      </div>
                      <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">
                        Ejemplos rápidos
                      </p>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(formulaExamples).map(([category, examples]) => (
                        <div key={category}>
                          <p className="text-xs font-extrabold text-violet-600 mb-2 uppercase tracking-wide">{category}</p>
                          {/* Grid responsive para ejemplos */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {examples.map((example, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleExampleClick(example)}
                                className="text-xs px-3 py-2 bg-white border-2 border-violet-200 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 hover:border-violet-400 hover:text-violet-700 transition-all duration-200 font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 text-left"
                                title={`Generar: ${example}`}
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historial de fórmulas generadas */}
                  {history.length > 0 && (
                    <div className="rounded-2xl border-2 border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-5 shadow-md ring-2 ring-violet-100/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-violet-200/50">
                          <span className="text-lg">📝</span>
                        </div>
                        <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">
                          Recientes
                        </p>
                      </div>
                      <div className="space-y-2">
                        {history.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-3 bg-white/80 rounded-xl border-2 border-violet-200/50 hover:border-violet-400 hover:bg-white transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-violet-600 truncate mb-1.5 font-bold">{item.query}</p>
                              <div className="text-sm font-medium text-slate-900">
                                <InlineMath math={item.formula} />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUseHistory(item)}
                              className="flex-shrink-0 text-violet-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 rounded-xl p-2 transition-all border border-violet-200 hover:border-violet-400 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                              title="Usar esta fórmula"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SE HA QUITADO EL FOOTER Y EL BOTÓN CANCELAR */}
        </div>
      </div>

      {/* CSS local: ocultar barra de scroll manteniendo scroll */}
      <style>{`
        .mqerk-hide-scrollbar {
          -ms-overflow-style: none; /* IE/Edge legacy */
          scrollbar-width: none; /* Firefox */
          scrollbar-gutter: auto;
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

        /* Pantallas con poca altura: modal más compacto y un poco más abajo */
        @media (max-height: 720px) {
          .mqerk-ai-formula-overlay {
            align-items: flex-start;
            padding-top: max(8vh, 96px);
            padding-bottom: 2vh;
          }
          .mqerk-ai-formula-dialog {
            max-height: 82vh;
          }
          .mqerk-ai-formula-header {
            padding: 0.75rem;
          }
          .mqerk-ai-formula-title {
            font-size: 1rem;
            line-height: 1.25rem;
          }
          .mqerk-ai-formula-content {
            padding: 0.75rem;
          }
          .mqerk-ai-formula-stack {
            gap: 0.75rem;
          }
          .mqerk-ai-formula-textarea {
            height: 4rem; /* ~h-16 */
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .mqerk-ai-formula-generate {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
        }
      `}</style>

      {/* Modal de placeholders para fórmulas con parámetros (legacy, puede que aún se use) */}
      <PlaceholderModal
        open={showPlaceholderModal}
        onClose={() => setShowPlaceholderModal(false)}
        formula={generatedFormula}
        onConfirm={handlePlaceholderConfirm}
      />

      {/* Modal de edición de fórmula - permite editar fórmulas con valores específicos */}
      <FormulaEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        formula={generatedFormula ? `$${generatedFormula}$` : ''}
        onSave={handleEditModalSave}
      />
    </>
  );
}