import { useState, useEffect, useRef } from 'react';
import { Sparkles, Calculator } from 'lucide-react';
import MathPalette from './MathPalette.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import InlineMath from './InlineMath.jsx';

/**
 * Editor WYSIWYG que SIEMPRE muestra fórmulas renderizadas
 * Usa un textarea transparente para edición + overlay renderizado para visualización
 */
export default function WYSIWYGMathEditor({
    value = '',
    onChange,
    placeholder = 'Escribe aquí...',
    label,
    required = false,
    className = ''
}) {
    const [mathPaletteOpen, setMathPaletteOpen] = useState(false);
    const [aiFormulaOpen, setAiFormulaOpen] = useState(false);
    const [editingFormula, setEditingFormula] = useState(null);
    const textareaRef = useRef(null);
    const overlayRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Parsear texto y renderizar fórmulas
    const renderContent = () => {
        if (!value) return null;

        const parts = [];
        const regex = /\$([^$]+)\$/g;
        let lastIndex = 0;
        let match;
        let matchIndex = 0;

        while ((match = regex.exec(value)) !== null) {
            // Texto antes de la fórmula
            if (match.index > lastIndex) {
                const textBefore = value.substring(lastIndex, match.index);
                if (textBefore) {
                    const lines = textBefore.split('\n');
                    lines.forEach((line, lineIdx) => {
                        if (line) {
                            parts.push(
                                <span key={`text-${matchIndex}-${lineIdx}`} className="whitespace-pre-wrap text-slate-900">
                                    {line}
                                </span>
                            );
                        }
                        if (lineIdx < lines.length - 1) {
                            parts.push(<br key={`br-${matchIndex}-${lineIdx}`} />);
                        }
                    });
                }
            }

            // Fórmula renderizada
            const formulaLatex = match[1];
            const start = match.index;
            const end = regex.lastIndex;

            parts.push(
                <span
                    key={`formula-${matchIndex}`}
                    className="math-formula-rendered inline-flex items-center px-2 py-0.5 mx-0.5 rounded bg-indigo-50 border border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all"
                    style={{ 
                        pointerEvents: 'auto', 
                        zIndex: 3,
                        position: 'relative'
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (textareaRef.current) {
                            textareaRef.current.focus();
                            textareaRef.current.setSelectionRange(start, end);
                        }
                        setEditingFormula({
                            formula: formulaLatex,
                            fullMatch: match[0],
                            start,
                            end
                        });
                        setMathPaletteOpen(true);
                    }}
                    title="Haz clic para editar"
                >
                    <InlineMath math={formulaLatex} />
                </span>
            );

            lastIndex = regex.lastIndex;
            matchIndex++;
        }

        // Texto después de la última fórmula
        if (lastIndex < value.length) {
            const textAfter = value.substring(lastIndex);
            if (textAfter) {
                const lines = textAfter.split('\n');
                lines.forEach((line, lineIdx) => {
                    if (line) {
                        parts.push(
                            <span key={`text-end-${lineIdx}`} className="whitespace-pre-wrap text-slate-900">
                                {line}
                            </span>
                        );
                    }
                    if (lineIdx < lines.length - 1) {
                        parts.push(<br key={`br-end-${lineIdx}`} />);
                    }
                });
            }
        }

        return parts.length > 0 ? parts : null;
    };

    // Sincronizar scroll entre textarea y overlay
    useEffect(() => {
        const textarea = textareaRef.current;
        const overlay = overlayRef.current;
        if (textarea && overlay) {
            const syncScroll = () => {
                overlay.scrollTop = textarea.scrollTop;
                overlay.scrollLeft = textarea.scrollLeft;
            };
            textarea.addEventListener('scroll', syncScroll);
            return () => textarea.removeEventListener('scroll', syncScroll);
        }
    }, []);

    // Sincronizar tamaño del overlay con el textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        const overlay = overlayRef.current;
        if (textarea && overlay) {
            const syncSize = () => {
                overlay.style.height = `${textarea.scrollHeight}px`;
                overlay.style.width = `${textarea.offsetWidth}px`;
            };
            syncSize();
            const observer = new ResizeObserver(syncSize);
            observer.observe(textarea);
            return () => observer.disconnect();
        }
    }, [value]);

    // Insertar fórmula en la posición del cursor
    const insertAtCursor = (latex) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = value.substring(0, start);
        const textAfter = value.substring(end);

        const formulaWithDelimiters = latex.startsWith('$') ? latex : `$${latex}$`;
        const newValue = textBefore + formulaWithDelimiters + textAfter;

        onChange(newValue);

        setTimeout(() => {
            const newCursorPos = start + formulaWithDelimiters.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    // Insertar fórmula desde MathPalette o AIFormulaModal
    const handleInsertFormula = (latex) => {
        if (editingFormula) {
            const { start, end } = editingFormula;
            const formulaToInsert = latex.startsWith('$') ? latex : `$${latex}$`;
            const newText = value.slice(0, start) + formulaToInsert + value.slice(end);
            onChange(newText);
            setEditingFormula(null);
        } else {
            insertAtCursor(latex);
        }

        setMathPaletteOpen(false);
        setAiFormulaOpen(false);
    };

    // Detectar si una posición está dentro de una fórmula LaTeX
    const isInsideFormula = (text, position) => {
        const regex = /\$([^$]+)\$/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = regex.lastIndex;
            if (position >= start && position <= end) {
                return { start, end, formula: match[1], fullMatch: match[0] };
            }
        }
        return null;
    };

    // Manejar cambios en el textarea - proteger fórmulas
    const handleTextareaChange = (e) => {
        const newValue = e.target.value;
        const textarea = e.target;
        const cursorPos = textarea.selectionStart;
        
        // Si el valor cambió (no es solo movimiento del cursor)
        if (newValue !== value) {
            // Verificar si el cursor está dentro de una fórmula en el nuevo valor
            const formulaInfo = isInsideFormula(newValue, cursorPos);
            
            if (formulaInfo) {
                // El usuario está editando dentro de una fórmula
                // Proteger la fórmula: si se borró parte de ella, restaurar o borrar toda
                const beforeFormula = newValue.substring(0, formulaInfo.start);
                const afterFormula = newValue.substring(formulaInfo.end);
                const currentFormulaText = newValue.substring(formulaInfo.start, formulaInfo.end);
                
                // Si la fórmula está incompleta o rota, borrarla completamente
                if (!currentFormulaText.match(/^\$[^$]+\$$/)) {
                    // Fórmula rota - borrar toda la fórmula
                    const cleanedValue = beforeFormula + afterFormula;
                    onChange(cleanedValue);
                    
                    // Posicionar cursor donde estaba la fórmula
                    setTimeout(() => {
                        textarea.setSelectionRange(formulaInfo.start, formulaInfo.start);
                        textarea.focus();
                    }, 0);
                    return;
                }
            }
        }
        
        onChange(newValue);
    };

    // Manejar teclas para proteger fórmulas
    const handleKeyDown = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const formulaInfo = isInsideFormula(value, cursorPos);

        if (formulaInfo) {
            // El cursor está dentro de una fórmula
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // Si está borrando dentro de una fórmula, borrar toda la fórmula
                e.preventDefault();
                const beforeFormula = value.substring(0, formulaInfo.start);
                const afterFormula = value.substring(formulaInfo.end);
                const newValue = beforeFormula + afterFormula;
                onChange(newValue);
                
                setTimeout(() => {
                    textarea.setSelectionRange(formulaInfo.start, formulaInfo.start);
                    textarea.focus();
                }, 0);
                return;
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                // Si está escribiendo dentro de una fórmula, abrir el editor
                e.preventDefault();
                setEditingFormula({
                    formula: formulaInfo.formula,
                    fullMatch: formulaInfo.fullMatch,
                    start: formulaInfo.start,
                    end: formulaInfo.end
                });
                setMathPaletteOpen(true);
                return;
            }
        }
    };

    return (
        <div className={`wysiwyg-math-editor ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-rose-500 font-bold ml-1">*</span>}
                </label>
            )}

            {/* Contenedor: overlay renderizado + textarea transparente */}
            <div className="relative">
                {/* Overlay renderizado - SIEMPRE visible con fórmulas renderizadas */}
                <div
                    ref={overlayRef}
                    className={`absolute inset-0 w-full rounded-xl border-2 px-4 py-3 pr-28 text-sm leading-relaxed overflow-hidden ${
                        isFocused ? 'border-violet-500 focus:ring-4 focus:ring-violet-200/50 bg-white/95' : 'border-slate-300 bg-white'
                    }`}
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        zIndex: 1,
                        pointerEvents: 'none',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        minHeight: '100%'
                    }}
                >
                    {value ? (
                        <div style={{ pointerEvents: 'none' }}>
                            {renderContent()}
                        </div>
                    ) : (
                        <span className="text-gray-400" style={{ pointerEvents: 'none' }}>{placeholder}</span>
                    )}
                </div>

                {/* Textarea completamente invisible para edición - debajo del overlay */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder=""
                    rows={5}
                    className="wysiwyg-textarea w-full rounded-xl border-2 border-transparent px-4 py-3 pr-28 text-sm focus:outline-none transition-all duration-200 resize-y font-mono leading-relaxed"
                    style={{ 
                        whiteSpace: 'pre-wrap',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        textShadow: 'none',
                        caretColor: isFocused ? '#1e293b' : 'transparent',
                        zIndex: 2,
                        position: 'relative',
                        backgroundColor: 'transparent',
                        background: 'transparent',
                        caretWidth: '2px'
                    }}
                />
                
                {/* Estilos adicionales para ocultar completamente el texto del textarea pero mantener el cursor visible */}
                <style>{`
                    .wysiwyg-textarea {
                        -webkit-text-fill-color: transparent !important;
                        color: transparent !important;
                    }
                    .wysiwyg-textarea:focus {
                        caret-color: #1e293b !important;
                        caret-width: 2px !important;
                        -webkit-text-fill-color: transparent !important;
                        color: transparent !important;
                    }
                    .wysiwyg-textarea::selection {
                        background: rgba(139, 92, 246, 0.2) !important;
                        color: transparent !important;
                    }
                    .wysiwyg-textarea::-moz-selection {
                        background: rgba(139, 92, 246, 0.2) !important;
                        color: transparent !important;
                    }
                    /* Asegurar que el cursor sea visible */
                    .wysiwyg-textarea:focus {
                        outline: none !important;
                    }
                `}</style>

                {/* Botones de herramientas */}
                <div className="absolute right-3 top-3 flex gap-2 z-20">
                    <button
                        type="button"
                        onClick={() => setAiFormulaOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                        title="Generar fórmula con IA"
                    >
                        <Sparkles className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setMathPaletteOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 hover:border-violet-500 hover:bg-gradient-to-br hover:from-violet-100 hover:to-indigo-100 hover:text-violet-800 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                        title="Insertar fórmula matemática"
                    >
                        <Calculator className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Modales */}
            <MathPalette
                open={mathPaletteOpen}
                onClose={() => {
                    setMathPaletteOpen(false);
                    setEditingFormula(null);
                }}
                onPick={handleInsertFormula}
                initialFormula={editingFormula?.formula || ''}
            />

            <AIFormulaModal
                open={aiFormulaOpen}
                onClose={() => {
                    setAiFormulaOpen(false);
                    setEditingFormula(null);
                }}
                onInsert={handleInsertFormula}
            />
        </div>
    );
}
