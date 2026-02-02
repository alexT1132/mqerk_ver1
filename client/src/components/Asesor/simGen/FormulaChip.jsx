import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Asegurar estilos

/**
 * Chip de fórmula renderizada directamente con KaTeX
 * Muestra la fórmula y permite editar (click) o eliminar (hover + click en X)
 */
export default function FormulaChip({ latex, onEdit, onDelete }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            // --- Lógica de Limpieza y Normalización (Espejo de InlineMath) ---
            let cleanFormula = latex || '';

            // 1. Remover delimitadores $ si están presentes (incluso internos malformados)
            cleanFormula = cleanFormula.replace(/(?<!\\)\$/g, '').trim();

            // 2. Reemplazar símbolos Unicode problemáticos
            cleanFormula = cleanFormula.replace(/×/g, '\\times').replace(/÷/g, '\\div');
            cleanFormula = cleanFormula.replace(/¿/g, '').replace(/¡/g, '');

            // 3. Normalizar saltos de línea y espacios
            cleanFormula = cleanFormula
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/\r\n?/g, '\n')
                .replace(/\n+/g, ' ')
                .replace(/[ \t]+/g, ' ')
                .trim();

            const originalForContext = cleanFormula;

            // 4. HEURÍSTICA DE FRASES: Detectar texto plano (palabras con espacios)
            // Ejemplo: "120 por kg" -> "120 \text{ por kg}"
            cleanFormula = cleanFormula.replace(/(^|[^\\{a-zA-Z])([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{1,})+)/g, (match, prefix, phrase, offset) => {
                const chunkStart = offset + prefix.length;
                const beforeText = originalForContext.substring(0, chunkStart);
                const openText = (beforeText.match(/\\text\{/g) || []).length;
                const closeText = (beforeText.match(/\}/g) || []).length;
                if (openText > closeText) return match; // Ya protegido
                return `${prefix}\\text{${phrase}}`;
            });

            // 5. HEURÍSTICA DE ACENTOS: Palabras sueltas con acentos
            if (cleanFormula && /[áéíóúÁÉÍÓÚñÑüÜ]/.test(cleanFormula)) {
                cleanFormula = cleanFormula.replace(/(^|[^\\a-zA-Z0-9])([a-zA-Z0-9]*[áéíóúÁÉÍÓÚñÑüÜ][a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]*)/g, (match, prefix, word, offset) => {
                    if (prefix.includes('text{')) return match;
                    const wordStart = offset + prefix.length;
                    const beforeText = cleanFormula.substring(0, wordStart);
                    const openText = (beforeText.match(/\\text\{/g) || []).length;
                    const closeText = (beforeText.match(/\}/g) || []).length;
                    if (openText > closeText) return match;
                    return `${prefix}\\text{${word}}`;
                });
            }

            // --- Renderizado KaTeX ---
            try {
                katex.render(cleanFormula, containerRef.current, {
                    throwOnError: false,
                    displayMode: false,
                    strict: 'ignore',
                    trust: true
                });
            } catch (e) {
                console.warn('Error renderizando KaTeX:', e);
                containerRef.current.innerText = latex;
            }
        }
    }, [latex]);

    return (
        <span
            className="inline-flex items-center justify-center mx-1 px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-900 cursor-pointer hover:bg-violet-100 hover:border-violet-300 transition-all align-baseline relative group select-none"
            onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
            }}
            title="Clic para editar fórmula"
        >
            <span ref={containerRef} />

            {/* Botón flotante para eliminar */}
            {onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm z-20"
                    title="Eliminar fórmula"
                >
                    <X size={10} strokeWidth={3} />
                </button>
            )}
        </span>
    );
}
