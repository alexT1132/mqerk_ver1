import React from 'react';

/**
 * Componente Modal para mostrar gráficos en una vista más grande.
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla la visibilidad de la modal.
 * @param {function} props.onClose - Función a llamar cuando se cierra la modal.
 * @param {string} props.title - Título de la modal.
 * @param {React.ReactNode} props.children - Contenido a mostrar dentro de la modal.
 * @param {string} props.maxWidth - Ancho máximo de la modal (por defecto "max-w-5xl").
 */
const ChartModal = ({ isOpen, onClose, title, children, maxWidth = "max-w-5xl" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto ${maxWidth} sm:max-h-[95vh] relative flex flex-col overflow-hidden`}>
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 relative shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white text-center pr-8 sm:pr-10 leading-tight">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Contenido con scroll si es necesario */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;