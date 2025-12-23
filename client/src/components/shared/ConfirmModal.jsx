import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const ConfirmModal = ({ 
  isOpen, 
  type = 'confirm', 
  message, 
  details, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default', // 'default' | 'danger'
  requireText = false,
  expectedText = 'ELIMINAR',
  inputLabel = "Para confirmar, escribe el texto:",
  confirmDisabled = false,
  isProcessing = false,
  processingText = 'Procesando...'
}) => {
  // Hooks deben llamarse siempre, no antes de return condicional
  const [text, setText] = useState('');
  useEffect(() => {
    if (isOpen) setText('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const meetsTextRequirement = !requireText || (text.trim() === expectedText);
  const confirmIsDisabled = confirmDisabled || isProcessing || !meetsTextRequirement;

  const btnBase = 'px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const cancelCls = `${btnBase} text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200 focus:ring-gray-500`;
  const confirmCls = variant === 'danger'
    ? `${btnBase} text-white bg-rose-600 border-transparent hover:bg-rose-700 focus:ring-rose-500 disabled:opacity-60 disabled:cursor-not-allowed`
    : `${btnBase} text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed`;

  const modalContent = (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000]" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{message || 'Confirmar Acción'}</h3>
        </div>
        <div className="px-6 py-4">
          {details && (
            <p className="text-gray-600 text-sm">{details}</p>
          )}
          {requireText && (
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">{inputLabel} <span className="font-semibold">{expectedText}</span></label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={expectedText}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {!meetsTextRequirement && (
                <p className="mt-2 text-xs text-rose-600">Debes escribir exactamente "{expectedText}" para continuar.</p>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button className={cancelCls} onClick={handleCancel}>
            {cancelText}
          </button>
          <button className={confirmCls} onClick={handleConfirm} disabled={confirmIsDisabled}>
            {isProcessing ? processingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Renderizar en portal (document.body) para aislar la capa modal
  const container = typeof document !== 'undefined' ? document.body : null;
  return container ? ReactDOM.createPortal(modalContent, container) : modalContent;
};

export default ConfirmModal;