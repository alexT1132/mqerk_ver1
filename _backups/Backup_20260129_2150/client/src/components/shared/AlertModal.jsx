import React from 'react';

/** Modal estético para alertas y confirmaciones */
export function AlertModal({ open, onClose, title, message, type = 'info', onConfirm, confirmText = 'Aceptar', cancelText = 'Cancelar', showCancel = false }) {
  if (!open) return null;

  const iconColors = {
    info: 'text-blue-600 bg-blue-100',
    success: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100',
    error: 'text-rose-600 bg-rose-100'
  };

  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    error: 'bg-rose-600 hover:bg-rose-700'
  };

  const icons = {
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={showCancel ? onClose : handleConfirm}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all overflow-hidden border border-slate-200">
        {/* Decoración de fondo */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-2xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-2xl" />

        {/* Header */}
        <div className="relative px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`${iconColors[type]} rounded-full p-2 flex-shrink-0`}>
              {icons[type]}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title || 'Aviso'}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-5">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Hook helper para usar AlertModal fácilmente */
export function useAlert() {
  const [alert, setAlert] = React.useState({ open: false, title: '', message: '', type: 'info', onConfirm: null, showCancel: false });

  const showAlert = (message, title = 'Aviso', type = 'info') => {
    return new Promise((resolve) => {
      setAlert({
        open: true,
        title,
        message,
        type,
        onConfirm: () => resolve(true),
        showCancel: false
      });
    });
  };

  const showConfirm = (message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      setAlert({
        open: true,
        title,
        message,
        type: 'warning',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        showCancel: true
      });
    });
  };

  const closeAlert = () => {
    setAlert(prev => {
      if (prev.onCancel) prev.onCancel(false);
      return { ...prev, open: false };
    });
  };

  const AlertComponent = () => (
    <AlertModal
      open={alert.open}
      onClose={closeAlert}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      onConfirm={alert.onConfirm}
      showCancel={alert.showCancel}
      confirmText={alert.type === 'warning' ? 'Confirmar' : 'Aceptar'}
      cancelText="Cancelar"
    />
  );

  return { showAlert, showConfirm, AlertComponent };
}
