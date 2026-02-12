import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from "react-dom";
import { Modal, FormulaEditModal, PlaceholderModal } from './MathPalette.jsx';
import InlineMath from './InlineMath.jsx';
import { useCooldown } from './useCooldown';
import { useFormulaAI } from './useFormulaAI';

/** Modal para generar fórmulas usando IA */
export function AIFormulaModal({ open, onClose, onInsert }) {
  const [query, setQuery] = useState('');
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false); // Nuevo estado para feedback de copia

  // Usar hooks personalizados
  const { cooldownMs, isActive: isCooldownActive, formattedTime, refreshCooldown } = useCooldown(open);
  const {
    loading,
    error,
    generatedFormula,
    usage,
    generateFormula: generateFormulaAI,
    clearState,
    setGeneratedFormula,
    setError
  } = useFormulaAI();

  // Ejemplos de fórmulas comunes (Memoizado)
  const formulaExamples = useMemo(() => ({
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
  }), []);

  // MEJORA: Acepta un overrideQuery para evitar hacks con setTimeout
  const handleGenerate = async (overrideQuery = null) => {
    const textToProcess = typeof overrideQuery === 'string' ? overrideQuery : query;

    if (!textToProcess.trim()) return;

    // Si se pasa un override, aseguramos que el input se actualice visualmente
    if (typeof overrideQuery === 'string') {
      setQuery(overrideQuery);
    }

    const formula = await generateFormulaAI(textToProcess, cooldownMs);

    if (formula) {
      // Agregar al historial (máximo 5)
      setHistory(prev => {
        // Evitar duplicados consecutivos
        if (prev.length > 0 && prev[0].formula === formula) return prev;
        const newHistory = [{ query: textToProcess.trim(), formula, timestamp: Date.now() }, ...prev];
        return newHistory.slice(0, 5);
      });
      refreshCooldown();
      setCopied(false);
    }
  };

  // MEJORA: Eliminado setTimeout, ahora es síncrono y seguro
  const handleExampleClick = (example) => {
    setQuery(example);
    setError('');
    handleGenerate(example);
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
      // Si la fórmula tiene placeholders, abrir el modal de placeholders
      if (generatedFormula.includes('\\square')) {
        setShowPlaceholderModal(true);
      } else {
        // Insertar directamente
        const formulaWithDelimiters = generatedFormula.startsWith('$')
          ? generatedFormula
          : `$${generatedFormula}$`;
        onInsert(formulaWithDelimiters);
        handleClose();
      }
    }
  };

  // Función para copiar al portapapeles
  const handleCopy = () => {
    if (generatedFormula) {
      navigator.clipboard.writeText(generatedFormula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Abrir modal de edición manual
  const handleOpenEdit = () => {
    setShowEditModal(true);
  };

  const handleEditModalSave = (formulaWithDelimiters) => {
    onInsert(formulaWithDelimiters);
    setShowEditModal(false);
    handleClose();
  };

  const handlePlaceholderConfirm = (completedFormula) => {
    const formulaWithDelimiters = completedFormula.startsWith('$')
      ? completedFormula
      : `$${completedFormula}$`;
    onInsert(formulaWithDelimiters);
    setShowPlaceholderModal(false);
    clearState();
    setQuery('');
    setHistory([]);
    onClose();
  };

  // Limpiar todo al cerrar
  const handleClose = () => {
    setQuery('');
    clearState();
    setHistory([]); // Opcional: limpiar historial al cerrar
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay centrado correctamente */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >

        {/* Contenedor principal  */}
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] h-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-600 text-white shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
                Asistente de Fórmulas
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="rounded-xl p-2 text-slate-500 hover:text-slate-700 transition-all hover:bg-white hover:scale-110 active:scale-95 border border-transparent hover:border-slate-200"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido Scrollable con ocultamiento de barra nativo */}
          <div className="overflow-y-auto flex-1 min-h-0 p-4 bg-gradient-to-b from-white to-slate-50/30 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="space-y-5">

              {/* Input Area */}
              <div>
                <label className="block text-sm font-extrabold text-violet-700 mb-2 px-1">
                  Describe tu fórmula <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative group">
                  <textarea
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: Fórmula cuadrática, Teorema de Pitágoras, Integral de x..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-28 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all duration-200 resize-none bg-slate-50 focus:bg-white h-16 sm:h-20 md:h-24"
                    style={{ whiteSpace: 'pre-wrap' }}
                    disabled={loading}
                    autoFocus
                  />

                  {/* Botón Flotante Generar dentro del Textarea */}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading || !query.trim() || isCooldownActive}
                    className="absolute right-2 bottom-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-10"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creando...</span>
                      </>
                    ) : isCooldownActive ? (
                      <>
                        <span className="tabular-nums">{formattedTime}</span>
                      </>
                    ) : (
                      <>
                        <span>Generar</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mensajes de Error / Cooldown */}
              {error && (
                <div className={`rounded-2xl border-2 p-4 shadow-md animate-in slide-in-from-top-2 ${error.includes('espera') || error.includes('límite') || error.includes('503')
                  ? 'border-amber-300 bg-amber-50 ring-amber-200/50'
                  : 'border-rose-300 bg-rose-50 ring-rose-200/50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {(error.includes('espera') || error.includes('límite')) ? '⏳' : '⚠️'}
                    </span>
                    <div>
                      <p className={`font-bold text-sm ${error.includes('espera') ? 'text-amber-800' : 'text-rose-700'
                        }`}>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RESULTADO GENERADO */}
              {generatedFormula && (
                <div className="group relative rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[10px] font-extrabold text-violet-700 uppercase tracking-widest">Resultado</p>
                    </div>

                    {/* Botón Copiar Rápido */}
                    <button
                      onClick={handleCopy}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-violet-600 transition-colors"
                      title="Copiar LaTeX"
                    >
                      {copied ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Copiado
                        </span>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          <span className="font-semibold">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Visualización de la Fórmula */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 min-h-[80px] flex items-center justify-center mb-4">
                      <div className={`w-full text-center ${generatedFormula.length > 150 ? 'text-base' : generatedFormula.length > 80 ? 'text-lg' : 'text-2xl'} text-slate-900`}>
                        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                          <InlineMath math={generatedFormula} display={generatedFormula.length > 50 || generatedFormula.includes('\\frac') || generatedFormula.includes('\\int')} />
                        </div>
                      </div>
                    </div>

                    {/* Advertencia de Placeholders */}
                    {generatedFormula.includes('\\square') && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                        <span className="text-lg">✍️</span>
                        <p className="text-xs font-bold">La fórmula contiene campos vacíos para rellenar.</p>
                      </div>
                    )}

                    {/* BARRA DE ACCIONES */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-100 pt-3 mt-3">
                      {/* Botón Regenerar */}
                      <button
                        onClick={handleRegenerate}
                        disabled={loading || isCooldownActive}
                        className="col-span-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-50"
                        title="Generar otra variante"
                      >
                        <span>🔄</span> <span className="truncate">Regenerar</span>
                      </button>

                      {/* Botón Editar */}
                      <button
                        onClick={handleOpenEdit}
                        className="col-span-1 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                        title="Editar manualmente"
                      >
                        <span>✏️</span> <span className="truncate">Editar</span>
                      </button>

                      {/* Botón Insertar */}
                      <button
                        onClick={handleInsert}
                        className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all active:scale-95"
                      >
                        <span>Insertar</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sugerencias Rápidas */}
              {!generatedFormula && !loading && (
                <div className="space-y-4 animate-in fade-in duration-500 delay-100">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">💡</span>
                      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                        Sugerencias rápidas
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(formulaExamples).map(([category, examples]) => (
                        <div key={category}>
                          <p className="text-[10px] font-bold text-violet-500 mb-2 uppercase ml-1">{category}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {examples.map((example, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleExampleClick(example)}
                                className="text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-violet-400 hover:text-violet-700 hover:shadow-md transition-all text-left truncate text-slate-600 font-medium"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Historial Reciente */}
              {history.length > 0 && !generatedFormula && (
                <div className="border-t-2 border-slate-100 pt-4">
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🕒</span> Recientes
                  </p>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div key={idx} className="group flex items-center justify-between gap-3 p-2 hover:bg-violet-50 rounded-xl border border-transparent hover:border-violet-100 transition-all cursor-pointer" onClick={() => handleUseHistory(item)}>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-violet-500 mb-0.5">{item.query}</p>
                          <div className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                            <InlineMath math={item.formula} />
                          </div>
                        </div>
                        <button className="text-violet-400 group-hover:text-violet-600 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para completar placeholders (si la IA devuelve \square) */}
      <PlaceholderModal
        open={showPlaceholderModal}
        onClose={() => setShowPlaceholderModal(false)}
        formula={generatedFormula}
        onConfirm={handlePlaceholderConfirm}
      />

      {/* Modal para editar fórmula manualmente */}
      <FormulaEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        formula={generatedFormula ? (generatedFormula.startsWith('$') ? generatedFormula : `$${generatedFormula}$`) : ''}
        onSave={handleEditModalSave}
      />
    </>,
    document.body
  );
}