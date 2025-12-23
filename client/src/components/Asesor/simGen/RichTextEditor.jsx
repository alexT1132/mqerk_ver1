import { useState, useEffect, useRef } from 'react';
import { Sparkles, Calculator } from 'lucide-react';
import FormulaChip from './FormulaChip.jsx';
import MathPalette from './MathPalette.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import InlineMath from './InlineMath.jsx';

/**
 * Editor de texto enriquecido con soporte para fórmulas matemáticas
 * Las fórmulas se muestran renderizadas debajo del textarea
 */
export default function RichTextEditor({
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

    // Insertar fórmula en la posición del cursor
    const insertAtCursor = (latex) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = value.substring(0, start);
        const textAfter = value.substring(end);

        // Insertar fórmula con delimitadores
        const formulaWithDelimiters = latex.startsWith('$') ? latex : `$${latex}$`;
        const newValue = textBefore + formulaWithDelimiters + textAfter;

        onChange(newValue);

        // Mover cursor después de la fórmula insertada
        setTimeout(() => {
            const newCursorPos = start + formulaWithDelimiters.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    // Insertar fórmula desde MathPalette o AIFormulaModal
    const handleInsertFormula = (latex) => {
        if (editingFormula) {
            // Estamos editando una fórmula existente
            const { fullMatch, start, end } = editingFormula;
            const formulaToInsert = latex.startsWith('$') ? latex : `$${latex}$`;

            const newText = value.slice(0, start) + formulaToInsert + value.slice(end);
            onChange(newText);
            setEditingFormula(null);
        } else {
            // Insertar nueva fórmula en el cursor
            insertAtCursor(latex);
        }

        // Cerrar modales
        setMathPaletteOpen(false);
        setAiFormulaOpen(false);
    };

    // Detectar click en fórmula para editar
    const handleFormulaClick = ({ formula, fullMatch, start, end }) => {
        setEditingFormula({ formula, fullMatch, start, end });
        setMathPaletteOpen(true);
    };

    // Detectar si hay fórmulas LaTeX
    const hasMath = value && /\$[^$]+\$/.test(value);

    // Parsear texto para mostrar fórmulas
    const renderTextWithFormulas = () => {
        if (!value) return null;

        const parts = [];
        const regex = /\$([^$]+)\$/g;
        let lastIndex = 0;
        let match;
        let matchIndex = 0;

        while ((match = regex.exec(value)) !== null) {
            // Texto antes de la fórmula
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${matchIndex}`} className="whitespace-pre-wrap">
                        {value.substring(lastIndex, match.index)}
                    </span>
                );
            }

            // Fórmula como chip
            const formulaLatex = match[1];
            const fullMatch = match[0];
            const start = match.index;
            const end = regex.lastIndex;

            parts.push(
                <FormulaChip
                    key={`formula-${matchIndex}`}
                    latex={formulaLatex}
                    onEdit={() => handleFormulaClick({ formula: formulaLatex, fullMatch, start, end })}
                    onDelete={() => {
                        const newText = value.slice(0, start) + value.slice(end);
                        onChange(newText);
                    }}
                />
            );

            lastIndex = regex.lastIndex;
            matchIndex++;
        }

        // Texto después de la última fórmula
        if (lastIndex < value.length) {
            parts.push(
                <span key={`text-${matchIndex}`} className="whitespace-pre-wrap">
                    {value.substring(lastIndex)}
                </span>
            );
        }

        return parts;
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-rose-500 font-bold ml-1">*</span>}
                </label>
            )}

            {/* Textarea para escribir */}
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={5}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 pr-28 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 resize-y hover:border-violet-400 bg-white font-mono leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap' }}
                />

                {/* Botones de herramientas */}
                <div className="absolute right-3 top-3 flex gap-2">
                    {/* Botón IA */}
                    <button
                        type="button"
                        onClick={() => setAiFormulaOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                        title="Generar fórmula con IA"
                    >
                        <Sparkles className="h-5 w-5" />
                    </button>

                    {/* Botón calculadora */}
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

            {/* Vista previa con fórmulas renderizadas */}
            {hasMath && value && (
                <div className="mt-3 rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vista previa renderizada</p>
                    </div>
                    <div className="text-base font-medium text-slate-900 bg-white/70 rounded-xl p-4 border border-violet-200/50 min-h-[50px] leading-relaxed">
                        {renderTextWithFormulas()}
                    </div>
                </div>
            )}

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
