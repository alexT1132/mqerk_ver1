import { useState, useEffect } from 'react';
import { Modal, FormulaEditModal } from './MathPalette.jsx';
import { PlaceholderModal } from './MathPalette.jsx';
import InlineMath from './InlineMath.jsx';

// Configuración de cooldown para evitar errores 429
const COOLDOWN_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_MS || 45000); // 45 segundos por defecto
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

const startCooldown = () => {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
  } catch {}
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
      setError(`Debes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA. Esto ayuda a evitar límites de la API.`);
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

Fórmula solicitada: ${query.trim()}`;

      const response = await fetch('/api/ai/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3, // Baja temperatura para respuestas más determinísticas
            maxOutputTokens: 500,
          },
          model: 'gemini-2.0-flash'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejo especial para error 429 (Too Many Requests)
        if (response.status === 429) {
          startCooldown();
          setCooldownMs(COOLDOWN_MS);
          const secs = Math.ceil(COOLDOWN_MS / 1000);
          throw new Error(`Se alcanzó el límite de solicitudes a la API. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente.`);
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
      
      setGeneratedFormula(formula);
      // Agregar al historial (máximo 5)
      setHistory(prev => {
        const newHistory = [{ query: query.trim(), formula, timestamp: Date.now() }, ...prev];
        return newHistory.slice(0, 5);
      });
    } catch (err) {
      console.error('Error generando fórmula:', err);
      const errorMsg = err.message || 'Error al generar la fórmula. Por favor intenta de nuevo.';
      setError(errorMsg);
      
      // Si el error menciona cooldown, actualizar el estado
      if (errorMsg.includes('espera') || errorMsg.includes('límite')) {
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/50 h-[600px] max-h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 p-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-slate-900">Generar fórmula con IA</h3>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto flex-1 min-h-0 p-4 bg-gradient-to-b from-white to-slate-50/30">
            <div className="space-y-4">
              {/* Input para la solicitud */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                    className="w-full rounded-lg border-2 border-slate-300 px-3 py-2 pr-24 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200/50 transition-all duration-200 resize-none hover:border-violet-400 bg-white h-24 font-mono"
                    style={{ whiteSpace: 'pre-wrap' }}
                    disabled={loading}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !query.trim() || cooldownMs > 0}
                    className="absolute right-2 bottom-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1.5"
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
                <p className="mt-1.5 text-xs text-slate-500">
                  💡 Presiona Enter para generar
                </p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className={`rounded-lg border-2 p-3 shadow-sm ${
                  error.includes('espera') || error.includes('límite') 
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50' 
                    : 'border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100/50'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">
                      {(error.includes('espera') || error.includes('límite')) ? '⏱️' : '⚠️'}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-rose-700 leading-relaxed">{error}</p>
                      {(error.includes('espera') || error.includes('límite')) && cooldownMs > 0 && (
                        <p className="text-[10px] text-amber-700 mt-1.5">
                          Esto ayuda a evitar límites de la API de Google. El temporizador se actualiza automáticamente.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa de la fórmula generada */}
              {generatedFormula && (
                <div className="rounded-lg border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fórmula generada</p>
                    </div>
                    <button
                      onClick={handleRegenerate}
                      disabled={loading || cooldownMs > 0}
                      className="text-xs text-violet-600 hover:text-violet-700 font-semibold px-2 py-1 rounded-lg hover:bg-white/60 transition-colors flex items-center gap-1 disabled:opacity-50"
                      title={cooldownMs > 0 ? `Espera ${Math.ceil(cooldownMs / 1000)}s para regenerar` : 'Regenerar fórmula'}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerar
                    </button>
                  </div>
                  <div className="text-2xl font-medium text-slate-900 bg-white/70 rounded-lg p-4 border border-violet-200/50 min-h-[60px] flex items-center justify-center leading-relaxed">
                    <InlineMath math={generatedFormula} />
                  </div>
                  {generatedFormula.includes('\\square') && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100/80 border border-amber-300/50 px-3 py-2">
                      <span className="text-sm">⚙</span>
                      <p className="text-xs text-amber-800 font-semibold flex-1">
                        Requiere completar parámetros antes de insertar
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Ejemplos de uso organizados por categoría */}
              {!generatedFormula && !loading && (
                <div className="space-y-3">
                  <div className="rounded-lg border-2 border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/50 p-3 shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      💡 Ejemplos rápidos
                    </p>
                    <div className="space-y-3">
                      {Object.entries(formulaExamples).map(([category, examples]) => (
                        <div key={category}>
                          <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">{category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {examples.map((example, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleExampleClick(example)}
                                className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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
                    <div className="rounded-lg border-2 border-violet-200/80 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 p-3 shadow-sm">
                      <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        📝 Recientes
                      </p>
                      <div className="space-y-2">
                        {history.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 bg-white/70 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-slate-500 truncate mb-1">{item.query}</p>
                              <div className="text-sm font-medium text-slate-900">
                                <InlineMath math={item.formula} />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUseHistory(item)}
                              className="flex-shrink-0 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg p-1.5 transition-colors"
                              title="Usar esta fórmula"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 p-3 bg-white flex-shrink-0">
        <button
          onClick={handleClose}
          className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 active:scale-95"
        >
          Cancelar
        </button>
            {generatedFormula && (
              <button
                onClick={handleInsert}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Insertar fórmula</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

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

