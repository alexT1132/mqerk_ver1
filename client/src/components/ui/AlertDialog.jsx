import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function AlertDialog({
  open,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'warning', 'success', 'error'
  confirmText = 'Entendido',
  onConfirm,
}) {
  if (!open) return null;

  const typeConfig = {
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
    error: {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-xl ${config.bgColor} shadow-2xl ring-1 ${config.borderColor} overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 px-4 py-3 border-b ${config.borderColor} bg-white/95 backdrop-blur`}>
          <div className="min-w-0 flex items-center gap-3">
            <span className={`grid h-8 w-8 place-items-center rounded-md ${config.bgColor} ${config.textColor}`}>
              {config.icon}
            </span>
            <h2 className={`text-base font-semibold truncate ${config.textColor}`} style={{ fontFamily: 'Silo, sans-serif' }}>
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <p className={`text-sm ${config.textColor} mb-6`} style={{ fontFamily: 'Silo, sans-serif' }}>
            {message}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onConfirm || onClose}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${config.buttonBg}`}
              style={{ fontFamily: 'Silo, sans-serif' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
