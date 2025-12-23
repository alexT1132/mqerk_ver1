import { X, Edit2 } from 'lucide-react';
import InlineMath from './InlineMath.jsx';

/**
 * Chip de fórmula renderizada con botones de edición y eliminación
 * Este componente muestra una fórmula LaTeX renderizada como un bloque protegido
 */
export default function FormulaChip({ latex, onEdit, onDelete, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 mx-1 rounded-lg bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 transition-all group ${className}`}
            contentEditable={false}
            suppressContentEditableWarning
        >
            {/* Fórmula renderizada */}
            <span className="inline-flex items-center">
                <InlineMath math={latex} />
            </span>

            {/* Botones de acción (se muestran al hover) */}
            <span className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botón de editar */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="p-0.5 rounded hover:bg-indigo-200 transition-colors"
                    title="Editar fórmula"
                >
                    <Edit2 className="w-3 h-3 text-indigo-600" />
                </button>

                {/* Botón de eliminar */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-0.5 rounded hover:bg-red-200 transition-colors"
                    title="Eliminar fórmula"
                >
                    <X className="w-3 h-3 text-red-600" />
                </button>
            </span>
        </span>
    );
}
