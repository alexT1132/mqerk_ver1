import React from 'react';
import { createPortal } from 'react-dom';

export default function LoadingOverlay({ message = 'Cargando...', subMessage = 'Por favor espera...', transparent = false }) {
  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto" role="status" aria-live="polite" aria-busy="true">
      {!transparent && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      )}
      <div className="relative bg-white/95 rounded-2xl shadow-2xl p-6 sm:p-7 border border-gray-100 text-center">
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-purple-200 opacity-60"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-600 animate-spin"></div>
        </div>
        <p className="text-base sm:text-lg font-semibold text-gray-800">{message}</p>
        {subMessage ? (
          <p className="mt-1 text-xs sm:text-sm text-gray-500">{subMessage}</p>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.getElementById('modal-root'));
}

