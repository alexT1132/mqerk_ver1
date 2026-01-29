import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types'; // Opcional: para validar las props si lo deseas

export const ChartModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-5xl',
  headerClassName = "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  // 1. Manejo de SSR para evitar errores con document
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // 2. Manejo de tecla ESC y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Bloquear el scroll del body
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      // Restaurar scroll y limpiar eventos
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isBrowser) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Fondo oscuro (Overlay) */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div className={`
        relative flex flex-col w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] 
        bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden 
        ${maxWidth}
      `}>
        
        {/* Header */}
        <div className={`p-4 sm:p-6 relative shrink-0 ${headerClassName}`}>
          <h2 
            id="modal-title" 
            className="text-lg sm:text-2xl font-bold text-white text-center pr-8 leading-tight truncate"
          >
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar modal"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Área de contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );

  // Usamos Portal para renderizar fuera del flujo normal (al final del body)
  return createPortal(modalContent, document.body);
};

// Validación de tipos (opcional pero recomendada en JS)
ChartModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  headerClassName: PropTypes.string,
};