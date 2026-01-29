import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Importa createPortal
import { useAuth } from '../../context/AuthContext.jsx';
import { useStudent } from '../../context/StudentContext.jsx';
import { resumenActividadesEstudiante } from '../../api/actividades.js';
import { resumenQuizzesEstudiante } from '../../api/quizzes.js';
import { resolvePlanType, getActivationDate, generatePaymentSchedule } from '../../utils/payments.js';
import { listReminders, createReminder } from '../../api/reminders.js';

/**
 * Componente de la Modal para mostrar información del pago (sin redirección).
 */
function PaymentModal({ isOpen, onClose, paymentDetails }) {
  const { hasContentAccess } = useStudent?.() || { hasContentAccess: true };

  // Si la modal no está abierta, no renderizamos nada
  if (!isOpen) return null;

  const target = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!target) return null;

  // Renderizamos la modal usando createPortal para que esté directamente bajo #modal-root
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-1 sm:p-4 z-[999]">
      <style dangerouslySetInnerHTML={{ __html: `
        .payment-modal-content::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
        .payment-modal-content::-webkit-scrollbar-thumb { background-color: transparent; }
        .payment-modal-content { scrollbar-width: none; }
      `}} />
      <div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-2xl p-1 sm:p-4 lg:p-6 w-full max-w-[95vw] sm:max-w-sm lg:max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto border border-gray-100 flex-shrink-0 my-auto payment-modal-content">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-md sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-5 mb-2 sm:mb-4 lg:mb-6 -mx-2 sm:-mx-4 lg:-mx-6 -mt-2 sm:-mt-4 lg:-mt-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white text-center">Pago pendiente</h2>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-5 text-gray-700">
          {/* Información del pago - más compacta */}
          <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 border border-blue-200 text-center">
            <p className="font-bold text-sm sm:text-base lg:text-lg text-blue-800 mb-1">{paymentDetails.description}</p>
            <p className="text-xs sm:text-sm lg:text-base text-blue-600">Monto: <span className="font-bold text-base sm:text-lg lg:text-2xl text-blue-800">{paymentDetails.amount}</span></p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-700">
              Para ver métodos de pago y subir tu comprobante, dirígete a la sección <span className="font-semibold">Mis Pagos</span>.
            </p>
          </div>
        </div>

        {/* Botón de cierre únicamente */}
        <div className="flex justify-center mt-3 sm:mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
  target
  );
}

/**
 * Componente de la Modal de confirmación de pago compacto.
 */
// Modal de confirmación eliminada (ya no se usa)

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
  const target = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!target) return null;

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
  target
  );
}

/**
 * Componente de la Modal para notificar un recordatorio.
 */
function ReminderNotificationModal({ isOpen, onClose, reminder, onDismissReminder }) {
  if (!isOpen || !reminder) return null;
  const target = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!target) return null;

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
  target
  );
}

/**
 * Componente de Modal para mostrar eventos del día en dispositivos móviles
 */
function MobileEventsModal({ isOpen, onClose, dayData, legendDotColors }) {
  if (!isOpen || !dayData) return null;
  const target = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!target) return null;

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
                      {/* Origen */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.isPayment ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Sistema
                          </span>
                        ) : event.isReminder && event.createdBy === 'student' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Alumno
                          </span>
                        ) : (event.type === 'Actividades / Tareas' || event.type === 'Exámenes / Evaluaciones' || event.type === 'Asesorías') ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v10H6l-2 2V6z M8 10h8m-8 4h6" />
                            </svg>
                            Asesor
                          </span>
                        ) : event.isReminder && event.createdBy === 'admin' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                            </svg>
                            Admin
                          </span>
                        ) : null}
                      </div>

                      {/* Importe para pagos */}
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
  target
  );
}

/**
 * Componente para mostrar la Agenda/Calendario del alumno.
 * Muestra eventos, fechas de pago y una leyenda.
 */
export function Calendar_Alumno_comp({ eventsData, isLoading = false, error = null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { alumno } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

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

  const [currentEvents, setCurrentEvents] = useState(eventsData || []);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentEvent, setSelectedPaymentEvent] = useState(null);
  // Modal de confirmación eliminada

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

  // Helper para YYYY-MM-DD local
  const toLocalYMD = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Cargar automáticamente: actividades, quizzes y pagos próximos si no se suministra eventsData
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (eventsData) return; // si vienen por props, no autoload
      if (!alumno?.id) return;
      try {
        setLocalLoading(true); setLocalError(null);
        // Fetch actividades y quizzes en paralelo
        const [actsRes, quizRes] = await Promise.allSettled([
          resumenActividadesEstudiante(alumno.id),
          resumenQuizzesEstudiante(alumno.id)
        ]);

        const actsRows = actsRes.status === 'fulfilled' ? (actsRes.value?.data?.data || actsRes.value?.data || []) : [];
        const quizRows = quizRes.status === 'fulfilled' ? (quizRes.value?.data?.data || quizRes.value?.data || []) : [];

        const mapActividadEvent = (r) => {
          const date = (r.fecha_limite || '').slice(0,10);
          if (!date) return null;
          const title = r.titulo || r.nombre || 'Actividad asignada';
          return {
            id: `act-${r.id}`,
            date,
            description: title,
            type: 'Actividades / Tareas',
            isPayment: false,
            isReminder: false,
            dismissed: false,
          };
        };

        const mapQuizEvent = (q) => {
          const date = (q.fecha_limite || '').slice(0,10);
          if (!date) return null;
          const title = q.titulo || q.nombre || 'Evaluación programada';
          return {
            id: `quiz-${q.id}`,
            date,
            description: title,
            type: 'Exámenes / Evaluaciones',
            isPayment: false,
            isReminder: false,
            dismissed: false,
          };
        };

        // Pagos próximos según plan
        const planType = resolvePlanType(alumno?.plan || alumno?.plan_type);
        const activationDate = getActivationDate(alumno);
        const schedule = generatePaymentSchedule({ startDate: activationDate, planType });
        const paymentEvents = schedule
          .filter(p => p.status !== 'paid')
          .map(p => ({
            id: `pay-${p.index}`,
            date: toLocalYMD(p.dueDate),
            description: planType === 'mensual' ? `Fecha de pago mensual #${p.index}` : `Pago #${p.index}`,
            type: 'Fecha de pago',
            isPayment: true,
            paid: p.status === 'paid',
            amount: `${p.amount} MXN`,
            isReminder: false,
            dismissed: false,
          }))
          .filter(Boolean);

        const actEvents = actsRows.map(mapActividadEvent).filter(Boolean);
        const quizEvents = quizRows.map(mapQuizEvent).filter(Boolean);

        // Cargar recordatorios personales desde API
        let reminderEvents = [];
        try {
          const rem = await listReminders();
          const rows = rem?.data?.data || [];
          reminderEvents = rows.map(r => ({
            id: `rem-${r.id}`,
            date: r.date,
            description: r.description || '',
            name: r.title,
            type: 'Recordatorio',
            isPayment: false,
            isReminder: true,
            dismissed: false,
            priorityColor: mapPriorityToColor(r.priority),
            createdBy: 'student',
            _serverId: r.id,
          }));
        } catch(err){ console.warn('No se pudieron cargar recordatorios', err?.message || err); }

  // Conservar SOLO recordatorios creados por el alumno (si existían)
  const existingReminders = (Array.isArray(currentEvents) ? currentEvents : []).filter(e => e.isReminder && e.createdBy === 'student');

        const merged = [...actEvents, ...quizEvents, ...paymentEvents, ...reminderEvents, ...existingReminders];
        if (!cancelled) setCurrentEvents(merged);
      } catch (e) {
        console.error('Error cargando calendario del alumno', e);
        if (!cancelled) setLocalError('No se pudo cargar el calendario');
      } finally {
        if (!cancelled) setLocalLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [alumno?.id, alumno?.plan, alumno?.plan_type, eventsData]);

  useEffect(() => {
    if (isPaymentModalOpen || isReminderCreationModalOpen || isReminderNotificationModalOpen || isMobileEventsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPaymentModalOpen, isReminderCreationModalOpen, isReminderNotificationModalOpen, isMobileEventsModalOpen]);

  // CORREGIDO: Obtener la fecha de hoy en zona horaria local de manera más precisa
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayString = getLocalDateString();

  useEffect(() => {
    const dueReminders = currentEvents.filter(event => {
      if (!event.isReminder || event.dismissed || dismissedReminderIds.has(event.id)) {
        return false;
      }
      return event.date <= todayString;
    });

    // Show the first due reminder that hasn't been shown yet in this session
    if (dueReminders.length > 0 && !isReminderNotificationModalOpen) {
      const reminderToShow = dueReminders[0];
      setActiveReminder(reminderToShow);
      setIsReminderNotificationModalOpen(true);
    }
  }, [currentEvents, dismissedReminderIds, todayString]); // Removed isReminderNotificationModalOpen from dependencies

  const currentMonthEvents = currentEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    return eventDate.getMonth() === currentDate.getMonth() &&
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  const importantEvents = currentEvents
    .filter(event => (event.isPayment && !event.paid) || (event.isReminder && !event.dismissed) || event.date >= todayString)
    .sort((a, b) => {
        if (a.isPayment && !a.paid && (!b.isPayment || b.paid)) return -1;
        if ((!a.isPayment || a.paid) && b.isPayment && !b.paid) return 1;
        
        const isADueReminder = a.isReminder && !a.dismissed && a.date <= todayString;
        const isBDueReminder = b.isReminder && !b.dismissed && b.date <= todayString;

        if (isADueReminder && !isBDueReminder) return -1;
        if (!isADueReminder && isBDueReminder) return 1;
        
        return a.date.localeCompare(b.date);
    })
    .slice(0, 5);

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
    
    for (let i = adjustedStartDay; i > 0; i--) {
      days.push({ date: prevMonthLastDay - i + 1, currentMonth: false });
    }

    for (let i = 1; i <= numDays; i++) {
      days.push({ date: i, currentMonth: true });
    }

    const totalCells = 42;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({ date: nextMonthDay, currentMonth: false });
      nextMonthDay++;
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
                      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const goToPrevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  // Sin redirección desde la modal de pago

  const handleOpenPaymentModal = (event) => {
    setSelectedPaymentEvent(event);
    setIsPaymentModalOpen(true);
  };

  const mapColorToPriority = (color) => {
    if(color.includes('red')) return 'red';
    if(color.includes('orange')) return 'orange';
    if(color.includes('yellow')) return 'yellow';
    if(color.includes('green')) return 'green';
    if(color.includes('purple')) return 'purple';
    return 'blue';
  };

  const mapPriorityToColor = (priority) => {
    switch(priority){
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const handleSaveReminder = async ({ name, description, date, priorityColor }) => {
    const payload = {
      title: name,
      description,
      date,
      priority: mapColorToPriority(priorityColor)
    };
    try {
      const res = await createReminder(payload);
      const r = res?.data?.data;
      const newReminder = {
        id: `rem-${r?.id ?? Date.now()}`,
        date,
        description: description,
        name: name,
        type: 'Recordatorio',
        isPayment: false,
        isReminder: true,
        dismissed: false,
        priorityColor: priorityColor,
        createdBy: 'student',
        _serverId: r?.id
      };
      setCurrentEvents(prevEvents => [...prevEvents, newReminder]);
    } catch(err){
      console.error('Error creando recordatorio', err);
    }
  };

  const handleDismissReminder = (reminderId) => {
    setDismissedReminderIds(prevIds => new Set(prevIds).add(reminderId));
    setCurrentEvents(prevEvents => prevEvents.map(event =>
      event.id === reminderId ? { ...event, dismissed: true } : event
    ));
    setActiveReminder(null);
    setIsReminderNotificationModalOpen(false);
  };

  const handleDayClick = (eventsOnDay, cellDateString) => {
    if (eventsOnDay.length > 0) {
      setSelectedDayEvents({
        events: eventsOnDay,
        date: cellDateString
      });
      setIsMobileEventsModalOpen(true);
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  };

  // Sin inyecciones de prueba en desarrollo

  const effectiveLoading = isLoading || localLoading;
  const effectiveError = error || localError;

  if (effectiveLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-violet-200/50 text-center ring-2 ring-violet-100/50">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-violet-700">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (effectiveError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-rose-50 to-red-50">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-red-200 text-center ring-2 ring-red-100/50">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-red-600">Error al cargar el calendario: {effectiveError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 lg:py-8 font-inter text-gray-800">
  {/* Portal root se declara en client/index.html */}
      
      <div className="max-w-7xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 tracking-tight">
              AGENDA / CALENDARIO
            </h2>
            
            <div className="w-full max-w-sm bg-white border-2 border-violet-200/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-visible ring-2 ring-violet-100/50">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg">
                <button onClick={goToPrevMonth} className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95 touch-manipulation border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h4 className="text-sm sm:text-base md:text-lg font-extrabold">{currentMonthName} {currentYear}</h4>
                <button onClick={goToNextMonth} className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95 touch-manipulation border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 bg-gradient-to-r from-violet-50/50 via-indigo-50/50 to-purple-50/50 border-b-2 border-violet-200/50">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                  <div key={day} className="p-1.5 sm:p-2 md:p-3 text-center text-[10px] sm:text-xs md:text-sm font-extrabold text-violet-700">
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

                  let dayClasses = `p-1 sm:p-2 md:p-3 h-8 sm:h-10 md:h-12 flex items-center justify-center border-2 border-gray-200 relative group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:z-10 touch-manipulation active:scale-95`;
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
          <span className="font-extrabold text-[10px] sm:text-xs md:text-sm relative">
                        {day.date}
                        {/* Estrella para recordatorios de admin - Posicionada en esquina superior izquierda */}
                        {eventsOnDay.some(event => event.isReminder && event.createdBy === 'admin') && (
                          <span className="absolute top-0 left-0 z-20 transform -translate-x-1/2 -translate-y-1/2" title="Recordatorio de administración">
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
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
                                        {/* Origen */}
                                        {event.isPayment ? (
                                          <span className="flex items-center space-x-1 text-gray-300">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <span className="text-xs">Sistema</span>
                                          </span>
                                        ) : event.isReminder && event.createdBy === 'student' ? (
                                          <span className="flex items-center space-x-1 text-green-300">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                            <span className="text-xs">Alumno</span>
                                          </span>
                                        ) : (event.type === 'Actividades / Tareas' || event.type === 'Exámenes / Evaluaciones' || event.type === 'Asesorías') ? (
                                          <span className="flex items-center space-x-1 text-indigo-300">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v10H6l-2 2V6z M8 10h8m-8 4h6"/>
                                            </svg>
                                            <span className="text-xs">Asesor</span>
                                          </span>
                                        ) : event.isReminder && event.createdBy === 'admin' ? (
                                          <span className="flex items-center space-x-1 text-yellow-300">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                                            </svg>
                                            <span className="text-xs">Admin</span>
                                          </span>
                                        ) : null}
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
              
              <div className="p-3 sm:p-4 border-t-2 border-violet-200/50 bg-gradient-to-r from-violet-50/50 via-indigo-50/50 to-purple-50/50 flex justify-center">
                <button
                  onClick={() => setIsReminderCreationModalOpen(true)}
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 active:scale-95 touch-manipulation ring-2 ring-violet-200/50"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span className="hidden xs:inline">Crear Recordatorio</span>
                  <span className="xs:hidden">Crear</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-violet-200/50 p-4 sm:p-5 w-full hover:shadow-2xl transition-all duration-300 ring-2 ring-violet-100/50">
              <h4 className="text-sm sm:text-base md:text-lg font-extrabold mb-3 sm:mb-4 flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200/50">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
                  Leyenda de Eventos
                </span>
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-700">
                {Object.entries(legendDotColors).map(([type, colorClass]) => (
                  <li key={type} className="flex items-center gap-2 sm:gap-3 group">
                    <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colorClass} ring-2 ring-white shadow-md group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}></span>
                    <span className="font-extrabold text-gray-800">{type}</span>
                  </li>
                ))}
              </ul>
              
              {isMobile() && (
                <div className="mt-4 pt-3 border-t-2 border-violet-200/50">
                  <p className="text-[10px] sm:text-xs text-violet-600 font-semibold flex items-center gap-1.5 bg-violet-50 px-2 py-1.5 rounded-lg border border-violet-200">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Toca los días con eventos para ver detalles
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Título completo y contador fijo a la derecha */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-2 sm:gap-3">
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 tracking-tight">
                EVENTOS Y ACTIVIDADES IMPORTANTES
              </h2>
              <span className="inline-flex items-center justify-self-start sm:justify-self-end px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 text-xs sm:text-sm font-extrabold rounded-full w-fit whitespace-nowrap border-2 border-violet-200 shadow-md ring-1 ring-violet-100/50">
                {importantEvents.length} pendiente{importantEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Lista de eventos con scroll y más color */}
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-violet-200/50 overflow-hidden shadow-xl ring-2 ring-violet-100/50">
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
                <div className="max-h-[360px] sm:max-h-[450px] overflow-y-auto divide-y divide-violet-100/50 events-scroll-container">
                  {importantEvents.map((event, index) => (
                    <div key={event.id} className="p-3 sm:p-4 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 transition-all duration-200">
                      <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                        {/* Fecha con color - responsive */}
                        <div className="flex-shrink-0">
                          <div className={`text-center min-w-[50px] sm:min-w-[60px] md:min-w-[70px] p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border-2 shadow-md ${
                            event.isPayment && !event.paid 
                              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300' 
                              : event.isReminder 
                                ? `${event.priorityColor.replace('bg-', 'bg-gradient-to-br from-')}-50 border-${event.priorityColor.replace('bg-', '')}-300`
                                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                          }`}>
                            <div className={`text-[10px] sm:text-[11px] md:text-xs font-extrabold uppercase ${
                              event.isPayment && !event.paid 
                                ? 'text-red-700' 
                                : event.isReminder 
                                  ? `text-${event.priorityColor.replace('bg-', '')}-700`
                                  : 'text-blue-700'
                            }`}>
                              {new Date(event.date + 'T00:00:00').toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                            </div>
                            <div className={`text-base sm:text-xl md:text-2xl font-extrabold ${
                              event.isPayment && !event.paid 
                                ? 'text-red-800' 
                                : event.isReminder 
                                  ? `text-${event.priorityColor.replace('bg-', '')}-800`
                                  : 'text-blue-800'
                            }`}>
                              {new Date(event.date + 'T00:00:00').getDate()}
                            </div>
                            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-semibold">
                              {new Date(event.date + 'T00:00:00').toLocaleString('es-ES', { year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Contenido principal - responsive */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-1">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-[13px] sm:text-sm leading-tight">
                                  {event.description || event.name}
                                </h3>
                                {/* Identificadores de origen */}
                                {event.isPayment ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Sistema
                                  </span>
                                ) : event.isReminder && event.createdBy === 'student' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    Alumno
                                  </span>
                                ) : (event.type === 'Actividades / Tareas' || event.type === 'Exámenes / Evaluaciones' || event.type === 'Asesorías') ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v10H6l-2 2V6z M8 10h8m-8 4h6" />
                                    </svg>
                                    Asesor
                                  </span>
                                ) : event.isReminder && event.createdBy === 'admin' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 w-fit">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
                                    </svg>
                                    Admin
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

                              {/* Estados y información adicional con más color - responsive */}
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

                            {/* Acciones con más color - responsive */}
                            <div className="flex-shrink-0 mt-2 sm:mt-0">
                              {event.isPayment && !event.paid && (
                                <button
                                  onClick={() => handleOpenPaymentModal(event)}
                                  className="w-full sm:w-auto px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation ring-2 ring-violet-200/50"
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
                <div className="text-center py-8 sm:py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg ring-2 ring-violet-200/50">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mb-1">No hay eventos pendientes</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Todos los eventos están al día</p>
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
      />

  {/* Modal de confirmación eliminada */}

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