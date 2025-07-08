import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal para mostrar opciones de pago
 */
function PaymentModal({ isOpen, onClose, paymentDetails, onConfirmPayment }) {
  const [copiedMessage, setCopiedMessage] = useState({ visible: false, target: '' });

  if (!isOpen) return null;

  // Maneja la copia de texto al portapapeles
  const handleCopy = (text, targetId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessage({ visible: true, target: targetId });
      setTimeout(() => setCopiedMessage({ visible: false, target: '' }), 3000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedMessage({ visible: true, target: targetId });
        setTimeout(() => setCopiedMessage({ visible: false, target: '' }), 3000);
      } catch (err) {
        console.error('Error al copiar con execCommand:', err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  };

  // Renderizamos la modal usando createPortal para que esté directamente bajo #modal-root
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-1 sm:p-4 z-[999]">
      <style dangerouslySetInnerHTML={{ __html: `
        .payment-modal-content::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
        .payment-modal-content::-webkit-scrollbar-thumb { background-color: transparent; }
        .payment-modal-content { scrollbar-width: none; }
      `}} />
      <div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-2xl p-1 sm:p-4 lg:p-6 w-full max-w-[95vw] sm:max-w-sm lg:max-w-md max-h-[60vh] sm:max-h-[85vh] lg:max-h-[500px] overflow-y-auto border border-gray-100 flex-shrink-0 my-auto payment-modal-content">
        {/* Header mejorado - más compacto */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-md sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-5 mb-2 sm:mb-4 lg:mb-6 -mx-2 sm:-mx-4 lg:-mx-6 -mt-2 sm:-mt-4 lg:-mt-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white text-center flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Detalles de Pago
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-5 text-gray-700">
          {/* Información del pago - más compacta */}
          <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 border border-blue-200 text-center">
            <p className="font-bold text-sm sm:text-base lg:text-lg text-blue-800 mb-1">{paymentDetails.description}</p>
            <p className="text-xs sm:text-sm lg:text-base text-blue-600">Monto: <span className="font-bold text-base sm:text-lg lg:text-2xl text-blue-800">{paymentDetails.amount}</span></p>
          </div>

          {/* Transferencia Bancaria - más compacta */}
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-lg border border-gray-100">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-purple-700 mb-2 lg:mb-3 flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Transferencia Bancaria
            </h3>
            <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-md sm:rounded-lg lg:rounded-xl text-xs lg:text-sm space-y-2 lg:space-y-3">
              <div className="grid grid-cols-1 gap-1 sm:gap-2 lg:gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Banco:</span>
                  <span className="font-bold text-gray-800">XXXX</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Beneficiario:</span>
                  <span className="font-bold text-gray-800 text-right text-xs sm:text-sm">XXXX</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2 lg:pt-3 space-y-2 lg:space-y-3">
                {/* Contenedor de Número de Cuenta - más compacto */}
                <div className="flex flex-col gap-2 bg-white rounded-md sm:rounded-lg lg:rounded-xl p-2 lg:p-3 border border-gray-200 shadow-sm relative">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-600 text-xs mb-1">Número de Cuenta:</p>
                    <p className="font-mono font-bold text-gray-900 text-xs sm:text-sm break-all">XXXX</p>
                  </div>
                  <div className="relative w-full">
                    <button
                      onClick={() => handleCopy('XXXX', 'account')}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Copiar
                    </button>
                    {copiedMessage.visible && copiedMessage.target === 'account' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-green-600 text-white px-3 py-1 rounded-md shadow-lg text-xs animate-bounce border border-green-500 whitespace-nowrap z-10">
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copiado!</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contenedor de CLABE Interbancaria - más compacto */}
                <div className="flex flex-col gap-2 bg-white rounded-md sm:rounded-lg lg:rounded-xl p-2 lg:p-3 border border-gray-200 shadow-sm relative">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-600 text-xs mb-1">CLABE Interbancaria:</p>
                    <p className="font-mono font-bold text-gray-900 text-xs sm:text-sm break-all">XXXX</p>
                  </div>
                  <div className="relative w-full">
                    <button
                      onClick={() => handleCopy('XXXX', 'clabe')}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Copiar
                    </button>
                    {copiedMessage.visible && copiedMessage.target === 'clabe' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-green-600 text-white px-3 py-1 rounded-md shadow-lg text-xs animate-bounce border border-green-500 whitespace-nowrap z-10">
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copiado!</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pago en Efectivo - más compacto */}
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-lg border border-gray-100">
            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-purple-700 mb-2 lg:mb-3 flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Pago en Efectivo
            </h3>
            <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-md sm:rounded-lg lg:rounded-xl text-xs lg:text-sm space-y-2 lg:space-y-3">
              <div>
                <p className="font-semibold mb-1 lg:mb-2 text-gray-700 flex items-center">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Dirección:
                </p>
                <p className="text-gray-800 ml-4 lg:ml-5 text-xs">XXXX</p>
              </div>
              <div>
                <p className="font-semibold mb-1 lg:mb-2 text-gray-700 flex items-center">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Horario:
                </p>
                <p className="text-gray-800 ml-4 lg:ml-5 text-xs">XXXX</p>
              </div>
            </div>
          </div>

          {/* Instrucciones adicionales - más compactas */}
          <div className="bg-amber-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 border border-amber-200 text-center">
            <p className="text-xs lg:text-sm text-amber-800 flex items-center justify-center flex-wrap">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span>Envía tu comprobante a:</span>
              <span className="font-bold ml-1 break-all text-xs">XXXX</span>
            </p>
          </div>
        </div>

        {/* Botones de acción - más compactos y tipo botón real en móviles */}
        <div className="flex flex-row justify-center sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="min-w-fit px-3 py-1 text-xs rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200 sm:flex-1 sm:px-3 sm:py-2 sm:rounded-lg lg:rounded-xl sm:border-2 sm:text-sm order-2 sm:order-1"
            style={{maxWidth: '120px'}}
          >
            Cerrar
          </button>
          <button
            onClick={onConfirmPayment}
            className="min-w-fit px-3 py-1 text-xs rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl sm:flex-1 sm:px-3 sm:py-2 sm:rounded-lg lg:rounded-xl order-1 sm:order-2 sm:text-sm"
            style={{maxWidth: '120px'}}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Ya pagué
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

/**
 * Componente de la Modal de confirmación de pago compacto.
 */
function PaymentConfirmationModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">¡Gracias!</h3>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          Cerrar
        </button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

/**
 * Componente de la Modal para crear un nuevo recordatorio.
 */
function ReminderCreationModal({ isOpen, onClose, onSaveReminder }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [priorityColor, setPriorityColor] = useState('bg-blue-500');

  const colors = [
    { name: 'Rojo', class: 'bg-red-500', dot: 'bg-red-500' },
    { name: 'Naranja', class: 'bg-orange-500', dot: 'bg-orange-500' },
    { name: 'Amarillo', class: 'bg-yellow-500', dot: 'bg-yellow-500' },
    { name: 'Verde', class: 'bg-green-500', dot: 'bg-green-500' },
    { name: 'Azul', class: 'bg-blue-500', dot: 'bg-blue-500' },
    { name: 'Púrpura', class: 'bg-purple-500', dot: 'bg-purple-500' },
  ];

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setDate('');
      setPriorityColor('bg-blue-500');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date) {
      console.warn('Nombre y fecha son obligatorios para el recordatorio.');
      return;
    }
    onSaveReminder({ name, description, date, priorityColor });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden border border-gray-100 flex flex-col">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-2xl p-4 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <h2 className="text-lg font-bold text-white text-center flex items-center justify-center relative z-10">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            Crear Recordatorio
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reminderName" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reminderName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Ej. Entrega de proyecto"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reminderDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="reminderDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Detalles del recordatorio..."
              />
            </div>
            
            <div>
              <label htmlFor="reminderDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="reminderDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Prioridad
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setPriorityColor(color.class)}
                    className={`w-8 h-8 rounded-full border-2 ${color.dot} ${
                      priorityColor === color.class 
                        ? 'border-gray-800 ring-2 ring-gray-300 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    } transition-all duration-200 shadow-md hover:shadow-lg`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

/**
 * Componente de la Modal para notificar un recordatorio.
 */
function ReminderNotificationModal({ isOpen, onClose, reminder, onDismissReminder }) {
  if (!isOpen || !reminder) return null;

  const getTextColorForBackground = (bgColorClass) => {
    if (bgColorClass.includes('yellow') || bgColorClass.includes('green') || bgColorClass.includes('orange') || bgColorClass.includes('teal')) {
      return 'text-gray-900';
    }
    return 'text-white';
  };

  const textColor = getTextColorForBackground(reminder.priorityColor);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-[1000]">
      <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border-2 border-white/20 transform scale-100 relative overflow-hidden ${reminder.priorityColor}`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/30">
            <svg className={`w-8 h-8 ${reminder.priorityColor.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className={`text-xl font-bold mb-3 ${textColor}`}>¡Recordatorio!</h3>
          <p className={`text-lg font-semibold mb-2 ${textColor}`}>{reminder.name}</p>
          {reminder.description && (
            <p className={`text-sm leading-relaxed mb-4 ${textColor} opacity-90`}>{reminder.description}</p>
          )}
          <p className={`text-xs font-medium mb-6 ${textColor} opacity-80`}>
            {new Date(reminder.date + 'T00:00:00').toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/90 backdrop-blur-sm text-gray-700 font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 hover:bg-white transition-all duration-200 border border-white/30"
            >
              Cerrar
            </button>
            <button
              onClick={() => onDismissReminder(reminder.id)}
              className="px-6 py-2 bg-gray-800/80 backdrop-blur-sm text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-900/80 transition-all duration-200 text-sm border border-gray-700/50"
            >
              No volver a mostrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

/**
 * Componente de Modal para mostrar eventos del día en dispositivos móviles
 */
function MobileEventsModal({ isOpen, onClose, dayData, legendDotColors }) {
  if (!isOpen || !dayData) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl p-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white text-center flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            {new Date(dayData.date + 'T00:00:00').toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h2>
        </div>

        {/* Contenido con eventos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {dayData.events.map((event, eventIdx) => (
              <div key={eventIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  {/* Icono del evento */}
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${event.isReminder ? event.priorityColor : legendDotColors[event.type]}`}></div>
                  
                  {/* Contenido del evento */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">
                      {event.description || event.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {event.type}
                      </span>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="space-y-1">
                      {event.isReminder && event.createdBy === 'admin' && (
                        <div className="flex items-center text-xs text-yellow-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                          </svg>
                          Recordatorio de Administración
                        </div>
                      )}
                      {event.isPayment && (
                        <div className="text-sm text-green-600 font-medium">
                          💰 Monto: {event.amount}
                        </div>
                      )}
                      {event.description && event.name && event.description !== event.name && (
                        <div className="text-xs text-gray-500 mt-1">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

/**
 * Componente para mostrar la Agenda/Calendario del alumno.
 * Muestra eventos académicos, fechas de pago y recordatorios personales.
 * 
 * @param {Array} eventsData - Array de eventos desde el backend
 * @param {boolean} isLoading - Estado de carga
 * @param {string} error - Mensaje de error si hay algún problema
 */
export function Calendar_Alumno_comp({ eventsData, isLoading = false, error = null }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventTypeColors = {
    "Actividades / Tareas": "bg-yellow-200 border-yellow-400 text-yellow-900",
    "Simuladores": "bg-pink-200 border-pink-400 text-pink-900",
    "Conferencias / talleres": "bg-green-200 border-green-400 text-green-900",
    "Fecha de pago": "bg-purple-200 border-purple-400 text-purple-900",
    "Exámenes / Evaluaciones": "bg-blue-200 border-blue-400 text-blue-900",
    "Asesorías": "bg-red-200 border-red-400 text-red-900",
    "Recordatorio": "bg-teal-200 border-teal-400 text-teal-900",
  };

  const legendDotColors = {
    "Actividades / Tareas": "bg-yellow-500",
    "Simuladores": "bg-pink-500",
    "Conferencias / talleres": "bg-green-500",
    "Fecha de pago": "bg-purple-500",
    "Exámenes / Evaluaciones": "bg-blue-500",
    "Asesorías": "bg-red-500",
    "Recordatorio": "bg-teal-500",
  };

  // TODO: Los datos de eventos serán proporcionados por el backend
  // Estructura esperada: { id, date, description, type, isPayment, paid, amount, isReminder, dismissed, priorityColor, createdBy }
  const initialMockEvents = [];

  const [currentEvents, setCurrentEvents] = useState(eventsData || initialMockEvents);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentEvent, setSelectedPaymentEvent] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModal] = useState(false);

  const [isReminderCreationModalOpen, setIsReminderCreationModalOpen] = useState(false);
  const [isReminderNotificationModalOpen, setIsReminderNotificationModalOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);
  const [dismissedReminderIds, setDismissedReminderIds] = useState(new Set());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [isMobileEventsModalOpen, setIsMobileEventsModalOpen] = useState(false);

  useEffect(() => {
    if (eventsData) {
      setCurrentEvents(eventsData);
    }
  }, [eventsData]);

  useEffect(() => {
    if (isPaymentModalOpen || isConfirmationModalOpen || isReminderCreationModalOpen || isReminderNotificationModalOpen || isMobileEventsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPaymentModalOpen, isConfirmationModalOpen, isReminderCreationModalOpen, isReminderNotificationModalOpen, isMobileEventsModalOpen]);

  // Obtener fecha actual en formato local para comparaciones
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayString = getLocalDateString();

  useEffect(() => {
    // Buscar recordatorios que deben mostrarse al alumno
    const dueReminders = currentEvents.filter(event => {
      if (!event.isReminder || event.dismissed || dismissedReminderIds.has(event.id)) {
        return false;
      }
      return event.date <= todayString;
    });

    // Mostrar el primer recordatorio pendiente
    if (dueReminders.length > 0 && !isReminderNotificationModalOpen) {
      const reminderToShow = dueReminders[0];
      setActiveReminder(reminderToShow);
      setIsReminderNotificationModalOpen(true);
    }
  }, [currentEvents, dismissedReminderIds, todayString]);

  // Filtrar eventos del mes actual para mostrar en calendario
  const currentMonthEvents = currentEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    return eventDate.getMonth() === currentDate.getMonth() &&
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Obtener eventos importantes para sidebar (pagos pendientes, recordatorios, etc.)
  const importantEvents = currentEvents
    .filter(event => (event.isPayment && !event.paid) || (event.isReminder && !event.dismissed) || event.date >= todayString)
    .sort((a, b) => {
        // Priorizar pagos pendientes
        if (a.isPayment && !a.paid && (!b.isPayment || b.paid)) return -1;
        if ((!a.isPayment || a.paid) && b.isPayment && !b.paid) return 1;
        
        // Luego recordatorios vencidos
        const isADueReminder = a.isReminder && !a.dismissed && a.date <= todayString;
        const isBDueReminder = b.isReminder && !b.dismissed && b.date <= todayString;

        if (isADueReminder && !isBDueReminder) return -1;
        if (!isADueReminder && isBDueReminder) return 1;
        
        // Finalmente por fecha
        return a.date.localeCompare(b.date);
    })
    .slice(0, 5);

  // Función para generar los días del calendario mensual
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    const days = [];
    const startDay = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    // Días del mes anterior
    for (let i = adjustedStartDay; i > 0; i--) {
      days.push({ date: prevMonthLastDay - i + 1, currentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= numDays; i++) {
      days.push({ date: i, currentMonth: true });
    }

    // Días del mes siguiente para completar la cuadrícula
    const totalCells = 42;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({ date: nextMonthDay, currentMonth: false });
      nextMonthDay++;
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Nombres de meses y configuración del calendario
  const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
                      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Funciones de navegación del calendario
  const goToPrevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  // Función para procesar pagos - integración con backend pendiente
  const handleMarkAsPaid = (eventId) => {
    setIsPaymentModalOpen(false);
    setIsConfirmationModal(true);
    // TODO: Enviar información de pago al backend
  };

  // Función para abrir modal de opciones de pago
  const handleOpenPaymentModal = (event) => {
    setSelectedPaymentEvent(event);
    setIsPaymentModalOpen(true);
  };

  // Función para crear recordatorios personales (funcionalidad local del alumno)
  const handleSaveReminder = ({ name, description, date, priorityColor }) => {
    const newReminder = {
      id: `r${Date.now()}`,
      date: date,
      description: description,
      name: name,
      type: 'Recordatorio',
      isPayment: false,
      isReminder: true,
      dismissed: false,
      priorityColor: priorityColor,
      createdBy: 'student',
    };
    setCurrentEvents(prevEvents => [...prevEvents, newReminder]);
    // TODO: Enviar al backend para persistir el recordatorio del alumno
  };

  // Función para marcar recordatorios como leídos/descartados
  const handleDismissReminder = (reminderId) => {
    setDismissedReminderIds(prevIds => new Set(prevIds).add(reminderId));
    setCurrentEvents(prevEvents => prevEvents.map(event =>
      event.id === reminderId ? { ...event, dismissed: true } : event
    ));
    setActiveReminder(null);
    setIsReminderNotificationModalOpen(false);
    // TODO: Enviar al backend para marcar recordatorio como leído
  };

  // Función para manejar clic en días del calendario (solo móviles)
  const handleDayClick = (eventsOnDay, cellDateString) => {
    if (eventsOnDay.length > 0) {
      setSelectedDayEvents({
        events: eventsOnDay,
        date: cellDateString
      });
      setIsMobileEventsModalOpen(true);
    }
  };

  // Detectar si es dispositivo móvil para mostrar interfaz adaptada
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  };

  // Loading state handling

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200 text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-lg font-medium text-red-600">Error al cargar el calendario: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 font-inter text-gray-800">
      <div id="modal-root"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AGENDA / CALENDARIO
            </h2>
            
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-visible">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h4 className="text-lg font-bold">{currentMonthName} {currentYear}</h4>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-bold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 relative">
                {days.map((day, index) => {
                  let cellDateString;
                  if (day.currentMonth) {
                    cellDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                  } else if (index < 7 && !day.currentMonth) {
                    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                    cellDateString = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                  } else {
                    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                    cellDateString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                  }

                  const eventsOnDay = currentEvents.filter(event => event.date === cellDateString);
                  const isToday = cellDateString === todayString;

                  let dayClasses = `p-3 h-12 flex items-center justify-center border border-gray-100 relative group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:z-10`;
                  let hasEventColor = false;
                  
                  const paymentEventOnDay = eventsOnDay.find(event => event.type === "Fecha de pago");
                  const reminderEventOnDay = eventsOnDay.find(event => event.type === "Recordatorio");

                  if (!day.currentMonth) {
                    dayClasses += ' bg-gray-50 text-gray-400';
                  } else {
                    if (paymentEventOnDay) {
                      dayClasses += ` ${eventTypeColors[paymentEventOnDay.type]}`;
                      hasEventColor = true;
                    } else if (reminderEventOnDay) {
                      dayClasses += ` ${reminderEventOnDay.priorityColor}`;
                      
                      if (reminderEventOnDay.createdBy === 'student') {
                        dayClasses += ' border-2 border-dashed border-gray-800';
                      }
                      
                      if (reminderEventOnDay.priorityColor.includes('yellow') || reminderEventOnDay.priorityColor.includes('green') || reminderEventOnDay.priorityColor.includes('orange')) {
                        dayClasses += ' text-black';
                      } else {
                        dayClasses += ' text-white';
                      }
                      hasEventColor = true;
                    } else if (eventsOnDay.length > 0) {
                      dayClasses += ` ${eventTypeColors[eventsOnDay[0].type]}`;
                      hasEventColor = true;
                    }

                    if (isToday && !hasEventColor) {
                      dayClasses += ' bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white';
                    } else if (isToday && hasEventColor) {
                      dayClasses += ' font-bold';
                    } else if (!hasEventColor) {
                      dayClasses += ' text-gray-900';
                    }
                  }

                  return (
                    <div
                      key={index}
                      className={dayClasses}
                      onClick={() => isMobile() ? handleDayClick(eventsOnDay, cellDateString) : null}
                    >
                      <span className="font-medium relative">
                        {day.date}
                        {/* Estrella para recordatorios de admin - Posicionada en esquina superior izquierda */}
                        {eventsOnDay.some(event => event.isReminder && event.createdBy === 'admin') && (
                          <span className="absolute top-0 left-0 z-20 transform -translate-x-1/2 -translate-y-1/2" title="Recordatorio de administración">
                            <svg className="w-3 h-3 text-yellow-400 drop-shadow-lg filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                            </svg>
                          </span>
                        )}
                      </span>
                      
                      {/* Tooltip Premium con diseño mejorado - SOLO para desktop */}
                      {eventsOnDay.length > 0 && !isMobile() && (
                        <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[99999]" 
                             style={{
                               bottom: '100%',
                               left: '50%',
                               transform: 'translateX(-50%) translateY(-8px)',
                               ...(index % 7 === 0 && { left: '0', transform: 'translateY(-8px)' }),
                               ...(index % 7 === 6 && { right: '0', left: 'auto', transform: 'translateY(-8px)' })
                             }}>
                          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white text-xs rounded-xl shadow-2xl border border-gray-600 backdrop-blur-sm max-w-xs min-w-max">
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2" 
                                 style={{
                                   ...(index % 7 === 0 && { left: '16px', transform: 'none' }),
                                   ...(index % 7 === 6 && { right: '16px', left: 'auto', transform: 'none' })
                                 }}>
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <div className="text-center border-b border-gray-600 pb-2">
                                <div className="text-xs font-bold text-blue-300">
                                  {new Date(cellDateString + 'T00:00:00').toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long' 
                                  })}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {eventsOnDay.map((event, eventIdx) => (
                                  <div key={eventIdx} className="flex items-start space-x-3 p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${event.isReminder ? event.priorityColor : legendDotColors[event.type]} shadow-sm`}></div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-white truncate">
                                        {event.description || event.name}
                                      </div>
                                      <div className="text-xs text-gray-300 mt-1 flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                                          {event.type}
                                        </span>
                                        {event.isReminder && event.createdBy === 'admin' && (
                                          <span className="flex items-center space-x-1 text-yellow-300">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                                            </svg>
                                            <span className="text-xs">Admin</span>
                                          </span>
                                        )}
                                        {event.isPayment && (
                                          <span className="text-green-300 text-xs">
                                            💰 {event.amount}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {eventsOnDay.length > 1 && (
                                <div className="text-center pt-2 border-t border-gray-600">
                                  <span className="text-xs text-gray-400">
                                    {eventsOnDay.length} evento{eventsOnDay.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Indicador para móviles - pequeño punto que indica que hay eventos */}
                      {eventsOnDay.length > 0 && isMobile() && (
                        <div className="absolute bottom-1 right-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
                <button
                  onClick={() => setIsReminderCreationModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:from-teal-500 hover:to-cyan-600 transition-all duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Crear Recordatorio
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-fit hover:shadow-2xl transition-shadow duration-300">
              <h4 className="text-sm font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Leyenda de Eventos
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                {Object.entries(legendDotColors).map(([type, colorClass]) => (
                  <li key={type} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${colorClass} mr-3 flex-shrink-0`}></span>
                    <span className="font-medium">{type}</span>
                  </li>
                ))}
              </ul>
              
              {isMobile() && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-blue-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Toca los días con eventos para ver detalles
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Título con layout responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                EVENTOS Y ACTIVIDADES IMPORTANTES
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full w-fit">
                {importantEvents.length} pendiente{importantEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Lista de eventos con scroll y más color */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow duration-300">
              {/* Estilos personalizados para el scroll */}
              <style dangerouslySetInnerHTML={{ __html: `
                .events-scroll-container::-webkit-scrollbar {
                  width: 6px;
                }
                .events-scroll-container::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 10px;
                }
                .events-scroll-container::-webkit-scrollbar-thumb {
                  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
                  border-radius: 10px;
                }
                .events-scroll-container::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(to bottom, #1d4ed8, #1e40af);
                }
                @media (max-width: 768px) {
                  .events-scroll-container::-webkit-scrollbar {
                    width: 4px;
                  }
                }
              `}} />
              
              {importantEvents.length > 0 ? (
                <div className="max-h-[400px] sm:max-h-[450px] overflow-y-auto divide-y divide-gray-100 events-scroll-container">
                  {importantEvents.map((event, index) => (
                    <div key={event.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Fecha con color - responsive */}
                        <div className="flex-shrink-0">
                          <div className={`text-center min-w-[60px] sm:min-w-[70px] p-2 sm:p-3 rounded-lg ${
                            event.isPayment && !event.paid 
                              ? 'bg-red-50 border border-red-200' 
                              : event.isReminder 
                                ? `${event.priorityColor.replace('bg-', 'bg-')}-50 border border-${event.priorityColor.replace('bg-', '')}-200`
                                : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className={`text-xs font-medium uppercase ${
                              event.isPayment && !event.paid 
                                ? 'text-red-600' 
                                : event.isReminder 
                                  ? `text-${event.priorityColor.replace('bg-', '')}-700`
                                  : 'text-blue-600'
                            }`}>
                              {new Date(event.date + 'T00:00:00').toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                            </div>
                            <div className={`text-xl sm:text-2xl font-bold ${
                              event.isPayment && !event.paid 
                                ? 'text-red-700' 
                                : event.isReminder 
                                  ? `text-${event.priorityColor.replace('bg-', '')}-800`
                                  : 'text-blue-700'
                            }`}>
                              {new Date(event.date + 'T00:00:00').getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.date + 'T00:00:00').toLocaleString('es-ES', { year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Contenido principal - responsive */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-1">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                  {event.description || event.name}
                                </h3>
                              {/* Etiquetas de identificación de origen */}
                                {(event.isReminder && event.createdBy === 'admin') || (!event.isReminder) ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                                    </svg>
                                    Admin
                                  </span>
                                ) : event.isReminder && event.createdBy === 'student' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    Alumno
                                  </span>
                                ) : null}
                              </div>
                              
                              {/* Tipo de evento con color - responsive */}
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                  event.type === 'Fecha de pago' 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : event.type === 'Recordatorio'
                                      ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                      : event.type === 'Actividades / Tareas'
                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        : event.type === 'Exámenes / Evaluaciones'
                                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                          : event.type === 'Asesorías'
                                            ? 'bg-red-100 text-red-700 border border-red-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {event.type}
                                </span>
                              </div>

                              {/* Información adicional con estados coloridos */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {event.isPayment && !event.paid && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-md border border-red-200">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-red-700">
                                      Pago pendiente
                                    </span>
                                    {event.amount && (
                                      <span className="text-xs text-red-600 font-semibold">
                                        • {event.amount}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {event.isPayment && event.paid && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md border border-green-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-green-700">
                                      Pagado
                                    </span>
                                  </div>
                                )}
                                
                                {event.isReminder && !event.dismissed && (
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
                                    event.priorityColor.includes('red') ? 'bg-red-50 border-red-200' :
                                    event.priorityColor.includes('yellow') ? 'bg-yellow-50 border-yellow-200' :
                                    event.priorityColor.includes('green') ? 'bg-green-50 border-green-200' :
                                    event.priorityColor.includes('blue') ? 'bg-blue-50 border-blue-200' :
                                    event.priorityColor.includes('purple') ? 'bg-purple-50 border-purple-200' :
                                    'bg-gray-50 border-gray-200'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full ${event.priorityColor}`}></div>
                                    <span className={`text-xs font-medium ${
                                      event.priorityColor.includes('red') ? 'text-red-700' :
                                      event.priorityColor.includes('yellow') ? 'text-yellow-700' :
                                      event.priorityColor.includes('green') ? 'text-green-700' :
                                      event.priorityColor.includes('blue') ? 'text-blue-700' :
                                      event.priorityColor.includes('purple') ? 'text-purple-700' :
                                      'text-gray-700'
                                    }`}>
                                      Recordatorio
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Botones de acción para pagos */}
                            <div className="flex-shrink-0 mt-2 sm:mt-0">
                              {event.isPayment && !event.paid && (
                                <button
                                  onClick={() => handleOpenPaymentModal(event)}
                                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                  💳 Pagar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No hay eventos pendientes</h3>
                  <p className="text-xs text-gray-500">Todos los eventos están al día</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentDetails={selectedPaymentEvent ? { description: selectedPaymentEvent.description, amount: selectedPaymentEvent.amount || 'N/A' } : {}}
        onConfirmPayment={() => handleMarkAsPaid(selectedPaymentEvent.id)}
      />

      <PaymentConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModal(false)}
        message="Su pago ha sido registrado. Los administradores revisarán su situación lo más pronto posible. ¡Su enseñanza es importante para nosotros!"
      />

      <ReminderCreationModal
        isOpen={isReminderCreationModalOpen}
        onClose={() => setIsReminderCreationModalOpen(false)}
        onSaveReminder={handleSaveReminder}
      />

      <ReminderNotificationModal
        isOpen={isReminderNotificationModalOpen}
        onClose={() => setIsReminderNotificationModalOpen(false)}
        reminder={activeReminder}
        onDismissReminder={handleDismissReminder}
      />

      <MobileEventsModal
        isOpen={isMobileEventsModalOpen}
        onClose={() => setIsMobileEventsModalOpen(false)}
        dayData={selectedDayEvents}
        legendDotColors={legendDotColors}
      />
    </div>
  );
}