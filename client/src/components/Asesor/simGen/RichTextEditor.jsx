import { useState, useEffect, useRef } from 'react';
import { Sparkles, Calculator, Code, X } from 'lucide-react';
import FormulaChip from './FormulaChip.jsx';
import MathPalette from './MathPalette.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import 'katex/dist/katex.min.css'; // Mismo origen (npm), evita bloqueo por Tracking Prevention

/**
 * Editor de texto enriquecido con soporte para fórmulas matemáticas
 * Version Pro: Vista previa renderizada como principal + Editor de código LaTeX
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
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    // Estado para saber si KaTeX está listo (soluciona la vista previa vacía)
    const [isKatexReady, setIsKatexReady] = useState(false);
    const textareaRef = useRef(null);

    // KaTeX viene del paquete npm (mismo origen); no usar CDN para evitar Tracking Prevention
    useEffect(() => {
        setIsKatexReady(true);
    }, []);

    // Utilidades: detectar rangos de LaTeX ($...$ o $$...$$) con soporte escape y heurística
    const getLatexRanges = (text) => {
        const ranges = [];
        if (!text) return ranges;

        let i = 0;
        let lastEnd = 0;

        // 1. Detectar rangos explícitos ($...$)
        while (i < text.length) {
            const char = text[i];

            // Saltar escapes
            if (char === '\\') {
                i += 2;
                continue;
            }

            // Detectar inicio ($)
            if (char === '$') {
                const start = i;
                const isBlock = (i + 1 < text.length && text[i + 1] === '$');
                const delimiter = isBlock ? '$$' : '$';
                i += delimiter.length;

                let content = '';
                let closed = false;

                // Buscar cierre
                while (i < text.length) {
                    const c = text[i];
                    if (c === '\\') {
                        content += c;
                        if (i + 1 < text.length) content += text[i + 1];
                        i += 2;
                        continue;
                    }
                    if (c === '$') {
                        let isClosing = false;
                        if (isBlock) {
                            if (i + 1 < text.length && text[i + 1] === '$') isClosing = true;
                        } else {
                            isClosing = true;
                        }

                        if (isClosing) {
                            closed = true;
                            break;
                        }
                    }
                    content += c;
                    i++;
                }

                if (closed) {
                    const formulaRaw = content;
                    const fullMatchEnd = i + delimiter.length;
                    const fullMatch = text.substring(start, fullMatchEnd);

                    // Validar heurística para inline ($)
                    let isValidMath = true;
                    if (!isBlock) {
                        const formulaTrimmed = formulaRaw.trim();
                        // Heurística de moneda
                        const beginsWithNumber = /^\d+/.test(formulaTrimmed);
                        const hasTextWords = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}/.test(formulaTrimmed);
                        const hasMathOperators = /[=\+\-\^_{}\\]/.test(formulaTrimmed);
                        if (beginsWithNumber && hasTextWords && !hasMathOperators) isValidMath = false;
                    }

                    if (isValidMath) {
                        ranges.push({
                            fullMatch,
                            formula: formulaRaw,
                            start,
                            end: fullMatchEnd,
                            isExplicit: true
                        });
                        lastEnd = fullMatchEnd; // Actualizar último fin conocido
                        i += delimiter.length;
                        continue;
                    } else {
                        i = start + 1;
                        continue;
                    }
                } else {
                    break;
                }
            }
            i++;
        }

        // 2. Detectar rangos IMPLÍCITOS en los huecos (texto plano)
        // Patrones: exponenciales (x^2), comandos (\int), funciones (f(x)=)
        const implicitMathRe = /(?:[a-zA-Z_]\w*\^\{?[a-zA-Z0-9\-\+\.]+\}?)|(?:\\[a-zA-Z]+)|(?:\b[fgh]\w*\([\w,]+\)\s*=)/g;

        const explicitRanges = [...ranges]; // Copia de explícitos para iterar huecos
        explicitRanges.sort((a, b) => a.start - b.start);

        let currentIdx = 0;

        // Función helper para buscar en un segmento de texto
        const findImplicitInSegment = (segmentText, offsetBase) => {
            let m;
            while ((m = implicitMathRe.exec(segmentText)) !== null) {
                // Filtrar rutas de windows simples (ej C:\Windows) - heurística básica
                // Si empieza con \ y la letra anterior es :, es ruta
                if (m.index > 0 && segmentText[m.index - 1] === ':') continue;

                ranges.push({
                    fullMatch: m[0],
                    formula: m[0], // La fórmula es el contenido mismo
                    start: offsetBase + m.index,
                    end: offsetBase + m.index + m[0].length,
                    isImplicit: true
                });
            }
        };

        // Buscar en huecos
        for (const r of explicitRanges) {
            if (r.start > currentIdx) {
                findImplicitInSegment(text.substring(currentIdx, r.start), currentIdx);
            }
            currentIdx = r.end;
        }
        if (currentIdx < text.length) {
            findImplicitInSegment(text.substring(currentIdx), currentIdx);
        }

        // Reordenar todo
        return ranges.sort((a, b) => a.start - b.start);
    };

    const findRangeAtPos = (ranges, pos) => {
        if (pos == null) return null;
        return ranges.find(r => pos > r.start && pos < r.end) || null;
    };

    // Insertar fórmula en la posición del cursor
    const insertAtCursor = (latex) => {
        const textarea = textareaRef.current;
        let newText = value;
        const formulaWithDelimiters = latex.startsWith('$') ? latex : `$${latex}$`;

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBefore = value.substring(0, start);
            const textAfter = value.substring(end);
            newText = textBefore + formulaWithDelimiters + textAfter;
        } else {
            // Si el textarea no está montado, añadir al final con un espacio si es necesario
            newText = value + (value && !value.endsWith(' ') ? ' ' : '') + formulaWithDelimiters;
        }

        onChange(newText);

        // Intentar recuperar el foco si el editor está visible
        if (textarea) {
            setTimeout(() => {
                const start = textarea.selectionStart;
                const newCursorPos = start + formulaWithDelimiters.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    };

    // Insertar fórmula desde MathPalette o AIFormulaModal
    const handleInsertFormula = (latex) => {
        if (editingFormula) {
            const { fullMatch, start, end } = editingFormula;
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

    // Detectar click en fórmula para editar
    const handleFormulaClick = ({ formula, fullMatch, start, end }) => {
        setEditingFormula({ formula, fullMatch, start, end });
        setMathPaletteOpen(true);
    };

    // Proteger edición directa dentro de $...$
    const handleTextareaKeyDown = (e) => {
        const textarea = textareaRef.current;
        // Si no está el textarea (modo visual solo), no hacemos nada
        if (!textarea) return;

        const text = value || '';
        const ranges = getLatexRanges(text);
        if (ranges.length === 0) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;

        const touched = ranges.filter(r => !(end <= r.start || start >= r.end));
        const inside = findRangeAtPos(ranges, start);

        const isDeletionKey = e.key === 'Backspace' || e.key === 'Delete';
        const isTypingKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

        if (inside && isTypingKey) {
            e.preventDefault();
            handleFormulaClick(inside);
            return;
        }

        if (inside && isDeletionKey) {
            e.preventDefault();
            const newText = text.slice(0, inside.start) + text.slice(inside.end);
            onChange(newText);
            // Reubicar cursor
            setTimeout(() => {
                const t = textareaRef.current;
                if (t) {
                    t.focus();
                    t.setSelectionRange(inside.start, inside.start);
                }
            }, 0);
            return;
        }

        if (touched.length > 0 && isDeletionKey) {
            const expandedStart = Math.min(start, ...touched.map(r => r.start));
            const expandedEnd = Math.max(end, ...touched.map(r => r.end));
            e.preventDefault();
            const newText = text.slice(0, expandedStart) + text.slice(expandedEnd);
            onChange(newText);
            // Reubicar cursor
            setTimeout(() => {
                const t = textareaRef.current;
                if (t) {
                    t.focus();
                    t.setSelectionRange(expandedStart, expandedStart);
                }
            }, 0);
        }
    };

    const hasMath = value && /\$[^$]+\$/.test(value);

    // Procesar Markdown básico
    const processMarkdown = (text) => {
        if (!text) return '';
        const latexPlaceholder = '___LATEX_PLACEHOLDER___';
        const latexMatches = [];
        let processedText = text;
        let placeholderIndex = 0;

        // Usamos nuestro parser robusto en lugar del regex simple
        const ranges = getLatexRanges(text);
        // Procesamos de atrás hacia adelante para no alterar índices
        for (let i = ranges.length - 1; i >= 0; i--) {
            const { start, end, fullMatch } = ranges[i];
            const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
            latexMatches.push(fullMatch); // Guardamos el match original

            // Reemplazo manual
            processedText = processedText.slice(0, start) + placeholder + processedText.slice(end);
            placeholderIndex++;
        }

        // Invertimos el array de matches porque los fuimos agregando (push) pero procesamos de atrás adelante

        // --- NUEVO: Soporte para Bloques de Código (```...```) y Código en Línea (`...`) ---
        // Procesamos esto ANTES de bold/italic para evitar conflictos

        // Bloques de código (triple backtick)
        // Ejemplo: ```javascript ... ```
        processedText = processedText.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="bg-slate-800 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 shadow-sm border border-slate-700"><div class="opacity-50 text-[10px] uppercase mb-1 border-b border-slate-600 pb-1">${lang || 'code'}</div><code>${code}</code></pre>`;
        });

        // Código en línea (backtick simple)
        // Ejemplo: `variable`
        processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-violet-50 px-1.5 py-0.5 rounded-md font-mono text-sm text-violet-700 border border-violet-100 font-semibold">$1</code>');

        // -----------------------------------------------------------------------------------


        // Negrita
        processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        // Cursiva
        processedText = processedText.replace(/\*([^*]+?)\*/g, '<em>$1</em>');

        latexMatches.forEach((match, idx) => {
            processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
        });

        return processedText;
    };

    const sanitizeHtmlLite = (html) => {
        const s = String(html || '');
        let out = s
            .replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
            .replace(/<\s*style[\s\S]*?>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
        const allowed = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'span', 'div', 'pre', 'code']);
        out = out.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (m, tagName) => {
            const t = String(tagName || '').toLowerCase();
            return allowed.has(t) ? m : m.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        });
        return out;
    };

    // Parsear texto para mostrar fórmulas
    const renderTextWithFormulas = () => {
        if (!value) return null;

        // USA OTRA VEZ LA LÓGICA UNIFICADA
        const latexRanges = getLatexRanges(value);

        if (latexRanges.length === 0) {
            return (
                <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processMarkdown(value)) }} />
            );
        }

        const parts = [];
        let lastIndex = 0;

        for (let i = 0; i < latexRanges.length; i++) {
            const range = latexRanges[i];

            if (range.start > lastIndex) {
                const textBefore = value.substring(lastIndex, range.start);
                const textWithMarkdown = processMarkdown(textBefore);
                parts.push(
                    <span
                        key={`text-${i}`}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(textWithMarkdown) }}
                    />
                );
            }

            parts.push(
                <FormulaChip
                    // CLAVE: Añadir el estado de carga a la key fuerza el re-renderizado
                    key={`formula-${i}-${isKatexReady}`}
                    latex={range.formula}
                    onEdit={() => handleFormulaClick({ formula: range.formula, fullMatch: range.fullMatch, start: range.start, end: range.end })}
                    onDelete={(e) => {
                        e.stopPropagation(); // Prevenir abrir el modal al borrar
                        const newText = value.slice(0, range.start) + value.slice(range.end);
                        onChange(newText);
                    }}
                />
            );

            lastIndex = range.end;
        }

        if (lastIndex < value.length) {
            const textAfter = value.substring(lastIndex);
            const textWithMarkdown = processMarkdown(textAfter);
            parts.push(
                <span
                    key={`text-end`}
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(textWithMarkdown) }}
                />
            );
        }

        return parts.length > 0 ? parts : null;
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-rose-500 font-bold ml-1">*</span>}
                </label>
            )}

            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setAiFormulaOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
                        title="Generar fórmula con IA"
                    >
                        <Sparkles className="h-4 w-4" />
                        IA
                    </button>
                    <button
                        type="button"
                        onClick={() => setMathPaletteOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:border-violet-400 hover:bg-violet-100 transition-all shadow-sm active:scale-95"
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
                        className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${showCodeEditor ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Code size={14} />
                        {showCodeEditor ? 'Ocultar código' : 'Ver código'}
                    </button>
                </div>
            </div>

            {/* Vista Previa Renderizada (Siempre visible) */}
            <div className="rounded-xl border-2 border-violet-100 bg-white shadow-sm p-4 relative min-h-[120px] transition-all hover:border-violet-200">
                {!hasMath && !value && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none">
                        <span className="text-sm">{placeholder}</span>
                    </div>
                )}
                <div className="text-base text-slate-800 leading-relaxed font-medium">
                    {value ? (hasMath ? renderTextWithFormulas() : (
                        <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processMarkdown(value)) }} />
                    )) : null}
                </div>
            </div>

            {/* Editor de Código (Colapsable) */}
            {showCodeEditor && (
                <div className="mt-3 animate-fade-in">
                    <div className="relative">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-slate-100 text-[10px] text-slate-400 font-mono rounded-bl-lg border-l border-b border-slate-200 z-10">
                            LaTeX / Markdown Source
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleTextareaKeyDown}
                            rows={6}
                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all font-mono leading-relaxed text-slate-600"
                        />
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