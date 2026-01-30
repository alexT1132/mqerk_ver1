import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente que muestra el progreso de compresión de archivos
 * @param {Object} props
 * @param {number} props.progress - Progreso de 0 a 1 (ej: 0.5) o 0 a 100 (ej: 50)
 * @param {string} [props.message='Procesando...'] - Mensaje de estado
 * @param {string} props.fileName - Nombre del archivo
 * @param {boolean} [props.isOpen=true] - Si el indicador está visible
 * @param {Function} [props.onCancel] - Función para cancelar la operación
 */
const FileCompressionIndicator = ({ 
  progress, 
  message = 'Procesando...', 
  fileName,
  isOpen = true,
  onCancel
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Bloquear scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Normalizar el progreso a porcentaje (0-100)
  // Detecta si viene como 0.5 o como 50 automágicamente
  const normalizedProgress = progress <= 1 ? progress * 100 : progress;
  const percentage = Math.min(100, Math.max(0, Math.round(normalizedProgress)));

  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header / Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icono animado */}
            <div className="shrink-0 relative w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full text-indigo-600">
               <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 id="modal-title" className="text-lg font-semibold text-slate-900 leading-tight">
                Comprimiendo archivo
              </h3>
              <p className="text-sm text-slate-500 truncate mt-1" title={fileName}>
                {fileName}
              </p>
            </div>
            
            {/* Porcentaje numérico */}
            <span className="text-sm font-bold text-indigo-600 tabular-nums">
              {percentage}%
            </span>
          </div>

          {/* Barra de Progreso */}
          <div 
            className="mt-6 h-3 w-full bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Footer / Estado */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="animate-pulse">{message}</span>
            {/* Estimación de tiempo o tamaño podría ir aquí */}
          </div>
        </div>

        {/* Botón de Cancelar (Opcional) */}
        {onCancel && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onCancel}
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              Cancelar operación
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar en el body usando Portal para evitar problemas de CSS (overflow, z-index)
  return createPortal(content, document.body);
};

export default FileCompressionIndicator;