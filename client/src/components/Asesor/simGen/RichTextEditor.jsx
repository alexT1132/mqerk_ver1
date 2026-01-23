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
    const [showCodeEditor, setShowCodeEditor] = useState(false); // “código/textarea” colapsable
    const textareaRef = useRef(null);

    // Utilidades: detectar rangos de $...$ para protegerlos del "borrado por accidente"
    const getLatexRanges = (text) => {
        const ranges = [];
        if (!text) return ranges;
        const regex = /\$([^$]+)\$/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            ranges.push({
                fullMatch: match[0],
                formula: match[1],
                start: match.index,
                end: regex.lastIndex,
            });
        }
        return ranges;
    };

    const findRangeAtPos = (ranges, pos) => {
        if (pos == null) return null;
        return ranges.find(r => pos > r.start && pos < r.end) || null;
    };

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

    // Proteger edición directa dentro de $...$ (evita fórmulas rotas por borrar un símbolo)
    const handleTextareaKeyDown = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const text = value || '';
        const ranges = getLatexRanges(text);
        if (ranges.length === 0) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;

        // Si hay selección, y toca una fórmula parcialmente, la protegemos
        const touched = ranges.filter(r => !(end <= r.start || start >= r.end));
        const inside = findRangeAtPos(ranges, start);

        const isDeletionKey = e.key === 'Backspace' || e.key === 'Delete';
        const isTypingKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

        // Caso 1: el cursor está dentro de una fórmula y el usuario intenta escribir
        if (inside && isTypingKey) {
            e.preventDefault();
            handleFormulaClick(inside);
            return;
        }

        // Caso 2: Backspace/Delete dentro de fórmula => borrar fórmula completa (no un caracter)
        if (inside && isDeletionKey) {
            e.preventDefault();
            const newText = text.slice(0, inside.start) + text.slice(inside.end);
            onChange(newText);
            setTimeout(() => {
                const t = textareaRef.current;
                if (!t) return;
                t.focus();
                t.setSelectionRange(inside.start, inside.start);
            }, 0);
            return;
        }

        // Caso 3: selección que intersecta fórmula(s) y se intenta borrar => borrar selección,
        // pero expandiendo para no dejar una fórmula "a medias"
        if (touched.length > 0 && isDeletionKey) {
            const expandedStart = Math.min(start, ...touched.map(r => r.start));
            const expandedEnd = Math.max(end, ...touched.map(r => r.end));
            e.preventDefault();
            const newText = text.slice(0, expandedStart) + text.slice(expandedEnd);
            onChange(newText);
            setTimeout(() => {
                const t = textareaRef.current;
                if (!t) return;
                t.focus();
                t.setSelectionRange(expandedStart, expandedStart);
            }, 0);
        }
    };

    // Detectar si hay fórmulas LaTeX
    const hasMath = value && /\$[^$]+\$/.test(value);

    // Sanitizador ligero: permite tags básicos de formato y elimina scripts/handlers.
    // Nota: esto es para el contenido que escribe el asesor; evitamos XSS obvio.
    const sanitizeHtmlLite = (html) => {
        const s = String(html || '');
        // eliminar scripts y estilos
        let out = s
            .replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
            .replace(/<\s*style[\s\S]*?>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
        // eliminar handlers on* y javascript: en href/src
        out = out
            .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
            .replace(/\s(href|src)\s*=\s*("|\')\s*javascript:[\s\S]*?\2/gi, '');
        // permitir solo un set de tags; el resto lo escapamos
        const allowed = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'span', 'sub', 'sup', 'div']);
        out = out.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (m, tagName) => {
            const t = String(tagName || '').toLowerCase();
            if (allowed.has(t)) {
                // quitar atributos (dejamos solo el tag)
                return m.startsWith('</') ? `</${t}>` : (t === 'br' ? '<br>' : `<${t}>`);
            }
            // escapar tags no permitidos
            return m.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        });
        return out;
    };

    // Parsear texto para mostrar fórmulas
    const renderTextWithFormulas = () => {
        if (!value) return null;

        // ✅ Usar regex simple y robusto: busca $...$ de forma no-greedy
        const re = /\$([^$]+?)\$/g;
        const parts = [];
        let lastIndex = 0;
        let matchIndex = 0;
        let match;
        
        // Resetear el regex para evitar problemas con múltiples llamadas
        re.lastIndex = 0;
        
        while ((match = re.exec(value)) !== null) {
            // Texto antes de la fórmula
            if (match.index > lastIndex) {
                const rawHtml = value.substring(lastIndex, match.index);
                parts.push(
                    <span
                        key={`text-${matchIndex}`}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(rawHtml) }}
                    />
                );
                matchIndex++;
            }
            
            // Fórmula encontrada
            const formulaLatex = match[1].trim();
            if (formulaLatex) {
                const fullMatch = match[0];
                const start = match.index;
                const end = match.index + fullMatch.length;
                
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
                matchIndex++;
            }
            
            lastIndex = match.index + match[0].length;
        }
        
        // Texto restante después de la última fórmula
        if (lastIndex < value.length) {
            const rawHtml = value.substring(lastIndex);
            parts.push(
                <span
                    key={`text-${matchIndex}`}
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(rawHtml) }}
                />
            );
        }
        
        return parts.length > 0 ? parts : null;
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

            {/* Barra de acciones (visible siempre) */}
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setAiFormulaOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        title="Generar fórmula con IA"
                    >
                        <Sparkles className="h-4 w-4" />
                        IA
                    </button>
                    <button
                        type="button"
                        onClick={() => setMathPaletteOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 px-3 py-2 text-xs font-bold text-violet-700 hover:border-violet-500 hover:bg-gradient-to-br hover:from-violet-100 hover:to-indigo-100 hover:text-violet-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        title="Insertar fórmula matemática"
                    >
                        <Calculator className="h-4 w-4" />
                        Fórmula
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setShowCodeEditor((v) => !v);
                            setTimeout(() => textareaRef.current?.focus?.(), 0);
                        }}
                        className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
                    >
                        {showCodeEditor ? 'Ocultar código' : 'Ver/editar código'}
                    </button>
                </div>
            </div>

            {/* Modo visual (por defecto): muestra render, no LaTeX crudo */}
            <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vista previa renderizada</p>
                </div>
                <div className="text-base font-medium text-slate-900 bg-white/70 rounded-xl p-4 border border-violet-200/50 min-h-[50px] leading-relaxed">
                    {value
                        ? (hasMath ? renderTextWithFormulas() : (
                            <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(value) }} />
                        ))
                        : <span className="text-slate-400">{placeholder}</span>}
                </div>
                <p className="mt-3 text-[11px] text-slate-600 font-medium">
                    Consejo: haz clic en una **ficha de fórmula** para editarla. Así nunca se rompe por borrar un símbolo.
                </p>
            </div>

            {/* Editor de código (colapsable): aquí sí se ve el LaTeX */}
            {showCodeEditor && (
                <div className="mt-3 relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder={placeholder}
                        rows={5}
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 resize-y hover:border-violet-400 bg-white font-mono leading-relaxed"
                        style={{ whiteSpace: 'pre-wrap' }}
                    />
                </div>
            )}

            {/* Nota: el render ahora es la UI principal; el LaTeX queda en el editor colapsable */}

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
