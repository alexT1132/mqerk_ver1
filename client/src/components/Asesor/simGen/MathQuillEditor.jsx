import { useState, useEffect, useRef } from 'react';
import { Sparkles, Calculator } from 'lucide-react';
import MathPalette from './MathPalette.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import InlineMath from './InlineMath.jsx';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Editor que muestra fórmulas renderizadas directamente en el campo de edición
 * Usa contentEditable con KaTeX para renderizar fórmulas visualmente
 */
export default function MathQuillEditor({
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
    const editorRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const isUpdatingRef = useRef(false);

    // Convertir texto con LaTeX a HTML con fórmulas renderizadas
    const textToHTML = (text) => {
        if (!text) return '';
        
        const parts = [];
        const regex = /\$([^$]+)\$/g;
        let lastIndex = 0;
        let match;
        let matchIndex = 0;

        while ((match = regex.exec(text)) !== null) {
            // Texto antes de la fórmula
            if (match.index > lastIndex) {
                const textBefore = text.substring(lastIndex, match.index);
                if (textBefore) {
                    const escaped = textBefore
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\n/g, '<br>');
                    parts.push(escaped);
                }
            }

            // Fórmula como elemento protegido
            const formulaLatex = match[1];
            const start = match.index;
            const end = regex.lastIndex;
            
            parts.push(
                `<span 
                    class="math-formula-chip" 
                    data-latex="${formulaLatex.replace(/"/g, '&quot;')}"
                    data-start="${start}"
                    data-end="${end}"
                    contenteditable="false"
                    style="display: inline-flex; align-items: center; padding: 2px 6px; margin: 0 2px; background: #e0e7ff; border: 1px solid #a5b4fc; border-radius: 6px; cursor: pointer; vertical-align: middle;"
                ></span>`
            );

            lastIndex = regex.lastIndex;
            matchIndex++;
        }

        // Texto después de la última fórmula
        if (lastIndex < text.length) {
            const textAfter = text.substring(lastIndex);
            if (textAfter) {
                const escaped = textAfter
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>');
                parts.push(escaped);
            }
        }

        return parts.join('');
    };

    // Convertir HTML de vuelta a texto con LaTeX
    const htmlToText = (html) => {
        if (!html) return '';
        
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Reemplazar <br> con saltos de línea
        const brs = temp.querySelectorAll('br');
        brs.forEach(br => {
            br.replaceWith('\n');
        });

        // Reemplazar fórmulas con su LaTeX
        const formulas = temp.querySelectorAll('.math-formula-chip');
        formulas.forEach(formula => {
            const latex = formula.getAttribute('data-latex');
            if (latex) {
                const textNode = document.createTextNode(`$${latex}$`);
                formula.replaceWith(textNode);
            }
        });

        // Obtener texto y decodificar entidades HTML
        let text = temp.textContent || temp.innerText || '';
        text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return text;
    };

    // Renderizar fórmulas con KaTeX
    const renderFormulas = (container) => {
        if (!container) return;
        
        const formulaSpans = container.querySelectorAll('.math-formula-chip');
        formulaSpans.forEach(span => {
            const latex = span.getAttribute('data-latex');
            if (latex && !span.hasAttribute('data-rendered')) {
                try {
                    // Usar KaTeX para renderizar
                    const katexContainer = document.createElement('span');
                    katexContainer.style.display = 'inline-block';
                    katexContainer.style.verticalAlign = 'middle';
                    
                    katex.render(latex, katexContainer, {
                        throwOnError: false,
                        displayMode: false,
                        errorColor: '#cc0000'
                    });
                    
                    span.innerHTML = '';
                    span.appendChild(katexContainer);
                    span.setAttribute('data-rendered', 'true');
                } catch (error) {
                    console.error('Error renderizando fórmula:', error, latex);
                    // Fallback: mostrar LaTeX como texto
                    span.textContent = `$${latex}$`;
                    span.setAttribute('data-rendered', 'true');
                }
            }
        });
    };

    // Actualizar contenido del editor
    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            const currentHTML = editorRef.current.innerHTML;
            const expectedHTML = textToHTML(value);
            
            if (currentHTML !== expectedHTML) {
                isUpdatingRef.current = true;
                editorRef.current.innerHTML = expectedHTML || '<br>';

                // Renderizar fórmulas después de un pequeño delay
                setTimeout(() => {
                    renderFormulas(editorRef.current);
                    isUpdatingRef.current = false;
                }, 10);
            }
        }
    }, [value]);

    // Manejar cambios en el editor
    const handleInput = () => {
        if (isUpdatingRef.current) return;
        
        const html = editorRef.current.innerHTML;
        const newText = htmlToText(html);
        
        if (newText !== value) {
            isUpdatingRef.current = true;
            onChange(newText);
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    };

    // Manejar clicks en fórmulas
    const handleClick = (e) => {
        const formulaSpan = e.target.closest('.math-formula-chip');
        if (formulaSpan) {
            e.preventDefault();
            e.stopPropagation();
            
            const latex = formulaSpan.getAttribute('data-latex');
            const start = parseInt(formulaSpan.getAttribute('data-start') || '0');
            const end = parseInt(formulaSpan.getAttribute('data-end') || '0');
            
            setEditingFormula({
                latex,
                fullMatch: `$${latex}$`,
                start,
                end
            });
            setMathPaletteOpen(true);
        }
    };

    // Insertar fórmula en la posición del cursor
    const insertAtCursor = (latex) => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            // Insertar al final
            const formulaWithDelimiters = latex.startsWith('$') ? latex : `$${latex}$`;
            onChange(value + formulaWithDelimiters);
            return;
        }

        const range = selection.getRangeAt(0);
        const formulaWithDelimiters = latex.startsWith('$') ? latex : `$${latex}$`;
        
        // Insertar como texto
        const textNode = document.createTextNode(formulaWithDelimiters);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Mover cursor
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // Actualizar valor
        handleInput();
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

    // Prevenir edición directa de fórmulas
    const handleKeyDown = (e) => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const formulaSpan = range.startContainer.parentElement?.closest('.math-formula-chip');
        
        if (formulaSpan && (e.key === 'Backspace' || e.key === 'Delete' || e.key.length === 1)) {
            e.preventDefault();
            // Borrar toda la fórmula
            const latex = formulaSpan.getAttribute('data-latex');
            const start = parseInt(formulaSpan.getAttribute('data-start') || '0');
            const end = parseInt(formulaSpan.getAttribute('data-end') || '0');
            
            const newValue = value.slice(0, start) + value.slice(end);
            onChange(newValue);
        }
    };

    return (
        <div className={`mathquill-editor ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-rose-500 font-bold ml-1">*</span>}
                </label>
            )}

            {/* Editor contentEditable */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full min-h-[120px] rounded-xl border-2 border-slate-300 px-4 py-3 pr-28 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 resize-y hover:border-violet-400 bg-white leading-relaxed"
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                    data-placeholder={placeholder}
                />
                
                {/* Estilos para placeholder y fórmulas */}
                <style>{`
                    .mathquill-editor [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                    }
                    .mathquill-editor .math-formula-chip:hover {
                        background: #c7d2fe !important;
                        border-color: #6366f1 !important;
                    }
                `}</style>

                {/* Botones de herramientas */}
                <div className="absolute right-3 top-3 flex gap-2 z-10">
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
                initialFormula={editingFormula?.latex || ''}
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
