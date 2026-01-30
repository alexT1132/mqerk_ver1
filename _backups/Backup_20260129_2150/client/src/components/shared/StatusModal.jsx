import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const StatusModal = ({ type = 'info', title, message, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Bloquear scroll si está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Configuración de estilos según el tipo de alerta
  const styles = {
    error: { 
      bg: 'bg-red-50', 
      iconBg: 'bg-red-100',
      icon: 'text-red-600', 
      title: 'text-red-900', 
      btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    },
    warning: { 
      bg: 'bg-amber-50', 
      iconBg: 'bg-amber-100',
      icon: 'text-amber-600', 
      title: 'text-amber-900', 
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
    },
    success: { 
      bg: 'bg-green-50', 
      iconBg: 'bg-green-100',
      icon: 'text-green-600', 
      title: 'text-green-900', 
      btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
    },
    info: { 
      bg: 'bg-indigo-50', 
      iconBg: 'bg-indigo-100',
      icon: 'text-indigo-600', 
      title: 'text-slate-900', 
      btn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
    }
  };

  const currentStyle = styles[type] || styles.info;

  const content = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full ${currentStyle.iconBg} flex items-center justify-center mb-4 mx-auto`}>
            {/* Icono Error */}
            {type === 'error' && (
              <svg className={`w-6 h-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {/* Icono Warning */}
            {type === 'warning' && (
              <svg className={`w-6 h-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {/* Icono Success / Info */}
            {(type === 'success' || type === 'info') && (
              <svg className={`w-6 h-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h3 className={`text-lg font-bold text-center mb-2 ${currentStyle.title}`}>
            {title}
          </h3>
          <p className="text-slate-600 text-center text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-center border-t border-slate-100">
          <button
            onClick={onClose}
            className={`w-full max-w-xs text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentStyle.btn}`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default StatusModal;