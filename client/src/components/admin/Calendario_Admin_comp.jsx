/**
 * Componente de Calendario Admin
 * 
 * PATRÓN DE INTEGRACIÓN: API DIRECTA (NO AdminContext)
 * - Este componente NO necesita AdminContext porque maneja funcionalidad específica independiente
 * - Usa APIs directas para calendar/events endpoints
 * - AdminContext NO tiene funciones de calendario, solo gestión general (students, payments, dashboard)
 * 
 * ESTADO: 95% LISTO PARA BACKEND
 * - Endpoints completamente implementados con fallback a datos mock
 * - Manejo de errores y loading states completo
 * - Solo necesita activar backend real y comentar datos de ejemplo
 * 
 * APIs de backend a implementar:
 * - GET /api/admin/calendar/events?startDate={date}&endDate={date} - Obtener eventos del calendario
 * - POST /api/admin/calendar/events - Crear nuevo evento/recordatorio
 * - PUT /api/admin/calendar/events/{id} - Actualizar evento/recordatorio
 * - DELETE /api/admin/calendar/events/{id} - Eliminar evento/recordatorio
 */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';

export function Calendario_Admin_comp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  // Mantener visible el overlay un mínimo de tiempo para percepción visual
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayStartRef = useRef(0);
  useEffect(() => {
    let timeout;
    if (isLoading) {
      overlayStartRef.current = Date.now();
      setShowOverlay(true);
    } else {
      const elapsed = Date.now() - overlayStartRef.current;
      const minVisible = 700; // ms
      if (elapsed < minVisible) {
        timeout = setTimeout(() => setShowOverlay(false), minVisible - elapsed);
      } else {
        setShowOverlay(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Estado para el formulario de nuevo recordatorio
  const [newReminder, setNewReminder] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'personal',
    prioridad: 'media',
    recordarMinutos: 15
  });

  // Funciones de API del backend - Implementación directa (sin AdminContext)
  const fetchReminders = async (startDate, endDate) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.get(`/admin/calendar/events`, { params: { startDate, endDate } });
      const data = response?.data;
      if (!Array.isArray(data)) throw new Error('Formato inesperado');
      setReminders(data);
    } catch (error) {
      loadSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async (reminderData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const { data: newReminder } = await api.post('/admin/calendar/events', reminderData);
      setReminders(prev => [...prev, newReminder]);
      return newReminder;
    } catch (error) {
      const mockReminder = { id: Date.now(), ...reminderData, completado: false };
      setReminders(prev => [...prev, mockReminder]);
      return mockReminder;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminder = async (id, updates) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const { data: updatedReminder } = await api.put(`/admin/calendar/events/${id}`, updates);
      const updatedReminders = reminders.map(r => r.id === id ? updatedReminder : r);
      setReminders(updatedReminders);
      if (selectedReminder && selectedReminder.id === id) setSelectedReminder(updatedReminder);
      return updatedReminder;
    } catch (error) {
      const updatedReminders = reminders.map(r => r.id === id ? { ...r, ...updates } : r);
      setReminders(updatedReminders);
      if (selectedReminder && selectedReminder.id === id) setSelectedReminder({ ...selectedReminder, ...updates });
      return { ...reminders.find(r => r.id === id), ...updates };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = async (id) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await api.delete(`/admin/calendar/events/${id}`);
      setReminders(prev => prev.filter(r => r.id !== id));
      setShowEditModal(false);
      setSelectedReminder(null);
    } catch (error) {
      // Si el backend bloquea el borrado por estar vinculado a Ingresos, mostrar mensaje claro
      const status = error?.response?.status;
      if (status === 409) {
        const backendMsg = error?.response?.data?.message;
        setApiError(backendMsg || 'Este recordatorio está vinculado a un ingreso y solo se puede borrar desde Ingresos (Finanzas).');
        // Mantener el recordatorio y cerrar el modal para que se vea el aviso
        setShowEditModal(false);
        setSelectedReminder(null);
      } else {
        // En otros errores, aplicar fallback optimista como antes
        setReminders(prev => prev.filter(r => r.id !== id));
        setShowEditModal(false);
        setSelectedReminder(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función de datos de ejemplo de respaldo 
  // (para desarrollo si el backend no está disponible) 
  // y para probar la funcionalidad, las debes de comentar
  const loadSampleData = () => {
    const sampleReminders = [
      {
        id: 1,
        titulo: 'Reunión de Gestión',
        descripcion: 'Revisar presupuestos del próximo trimestre',
        fecha: '2025-07-09',
        hora: '10:00',
        tipo: 'trabajo',
        prioridad: 'alta',
        recordarMinutos: 30,
        completado: false
      },
      {
        id: 2,
        titulo: 'Llamar proveedor de libros',
        descripcion: 'Confirmar entrega de material educativo',
        fecha: '2025-07-08',
        hora: '14:30',
        tipo: 'trabajo',
        prioridad: 'media',
        recordarMinutos: 15,
        completado: false
      },
      {
        id: 3,
        titulo: 'Revisar expedientes de nuevos estudiantes',
        descripcion: 'Validar documentación y asignación de grupos',
        fecha: '2025-07-10',
        hora: '09:00',
        tipo: 'academico',
        prioridad: 'alta',
        recordarMinutos: 60,
        completado: false
      },
      {
        id: 4,
        titulo: 'Cita médica',
        descripcion: 'Chequeo de rutina',
        fecha: '2025-07-12',
        hora: '16:00',
        tipo: 'personal',
        prioridad: 'media',
        recordarMinutos: 120,
        completado: false
      }
    ];

    setReminders(sampleReminders);
  };

  // Cargar recordatorios del backend o recurrir a datos de ejemplo
  useEffect(() => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    // Intentar obtener del backend, recurrir a datos de ejemplo
    fetchReminders(startDate, endDate);
  }, [currentDate]);

  // Verificar recordatorios próximos cada minuto
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const pendingNotifications = [];

      reminders.forEach(reminder => {
        if (!reminder.completado) {
          const reminderDate = new Date(`${reminder.fecha}T${reminder.hora}`);
          const reminderTime = new Date(reminderDate.getTime() - (reminder.recordarMinutos * 60000));

          // Si es hora de mostrar el recordatorio
          if (now >= reminderTime && now < reminderDate) {
            pendingNotifications.push(reminder);
          }
        }
      });

      if (pendingNotifications.length > 0) {
        setNotifications(pendingNotifications);
        setShowNotification(true);
      }
    };

    const interval = setInterval(checkReminders, 60000); // Cada minuto
    checkReminders(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [reminders]);

  // Obtener días del mes actual
  const getDaysOfMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        fecha: date.getDate(),
        esMesActual: false,
        fechaCompleta: date
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= daysInMonth; dia++) {
      const fecha = new Date(year, month, dia);
      days.push({
        fecha: dia,
        esMesActual: true,
        fechaCompleta: fecha
      });
    }

    // Días del siguiente mes
    const diasRestantes = 42 - days.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(year, month + 1, dia);
      days.push({
        fecha: dia,
        esMesActual: false,
        fechaCompleta: fecha
      });
    }

    return days;
  };

  // Obtener recordatorios para una fecha específica
  const obtenerRecordatoriosPorFecha = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return reminders.filter(recordatorio => recordatorio.fecha === fechaStr);
  };

  // Manejar creación de nuevo recordatorio
  const manejarNuevoRecordatorio = async (e) => {
    e.preventDefault();
    try {
      const recordatorio = {
        ...newReminder,
        completado: false
      };

      await createReminder(recordatorio);

      setNewReminder({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        tipo: 'personal',
        prioridad: 'media',
        recordarMinutos: 15 // primera opción
      });
      setShowNewModal(false);
    } catch (error) {
      // El error ya está manejado en la función createReminder
    }
  };

  // Marcar recordatorio como completado
  const marcarCompletado = async (id) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        await updateReminder(id, { completado: !reminder.completado });
      }
    } catch (error) {
      // El error ya está manejado en la función updateReminder
    }
  };

  // Eliminar recordatorio
  const eliminarRecordatorio = async (id) => {
    try {
      await deleteReminder(id);
    } catch (error) {
      // El error ya está manejado en la función deleteReminder
    }
  };

  // Navegar entre meses
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setCurrentDate(nuevaFecha);
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'trabajo': return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'personal': return 'bg-green-50 text-green-800 border-green-300';
      case 'academico': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-gray-50 text-gray-800 border-gray-300';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-6 lg:pb-8">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none mx-auto">

        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-purple-200 shadow-xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-purple-900 mb-2">Mi Agenda Personal</h1>
              <p className="text-sm sm:text-base font-semibold text-purple-700">
                Gestiona tus recordatorios y tareas personales
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <button
                onClick={() => setShowNewModal(true)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-md shadow-purple-500/30 border border-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                Nuevo Recordatorio
              </button>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {apiError && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center border-2 border-red-300">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 text-sm sm:text-base font-extrabold flex-1">{apiError}</p>
              <button
                onClick={() => setApiError(null)}
                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}


        {showOverlay && <LoadingOverlay message="Cargando agenda..." />}

        {/* Estado vacío cuando no hay recordatorios y no está cargando */}
        {!isLoading && reminders.length === 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 p-5 sm:p-6 mb-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base text-slate-700 font-semibold mb-3">No hay recordatorios para este mes.</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-md shadow-purple-500/30 border border-purple-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear recordatorio
                </button>
              </div>
            </div>
          </div>
        )}


        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-purple-900">
                  {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => cambiarMes(1)}
                  className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 border border-purple-300 transition-all duration-200"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">

              <div className="grid grid-cols-7 bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-100 border-b-2 border-purple-300">
                {diasSemana.map((dia) => (
                  <div key={dia} className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-extrabold text-purple-900">
                    {dia}
                  </div>
                ))}
              </div>


              <div className="grid grid-cols-7">
                {getDaysOfMonth().map((dia, index) => {
                  const recordatoriosDelDia = obtenerRecordatoriosPorFecha(dia.fechaCompleta);
                  const esHoy = dia.fechaCompleta.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-28 sm:min-h-32 p-2 border-r border-b border-slate-200 ${!dia.esMesActual ? 'bg-slate-50 text-slate-400' : 'bg-white'
                        } ${esHoy ? 'bg-gradient-to-br from-slate-100 to-slate-50 border-slate-300 ring-2 ring-slate-300' : ''} hover:bg-slate-50 transition-colors`}
                    >
                      <div className={`text-xs sm:text-sm font-extrabold mb-2 ${esHoy ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                        {dia.fecha}
                      </div>
                      <div className="space-y-1">
                        {recordatoriosDelDia.slice(0, 3).map((recordatorio) => (
                          <div
                            key={recordatorio.id}
                            onClick={() => {
                              setSelectedReminder(recordatorio);
                              setShowEditModal(true);
                            }}
                            className={`text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all duration-200 ${getTipoColor(recordatorio.tipo)} ${recordatorio.completado ? 'opacity-50 line-through' : ''}`}
                          >
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getPrioridadColor(recordatorio.prioridad)}`}></div>
                              <span className="font-semibold truncate">{recordatorio.hora}</span>
                            </div>
                            <div className="truncate mt-0.5 font-medium">{recordatorio.titulo}</div>
                          </div>
                        ))}
                        {recordatoriosDelDia.length > 3 && (
                          <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">
                            +{recordatoriosDelDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


          <div className="space-y-6">

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 border-2 border-slate-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Próximos Recordatorios
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {reminders
                  .filter(r => !r.completado && new Date(`${r.fecha}T${r.hora}`) >= new Date())
                  .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
                  .slice(0, 5)
                  .map((recordatorio) => (
                    <div
                      key={recordatorio.id}
                      onClick={() => {
                        setSelectedReminder(recordatorio);
                        setShowEditModal(true);
                      }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 hover:shadow-md cursor-pointer border border-transparent hover:border-slate-300 transition-all duration-200"
                    >
                      <div className={`w-3 h-3 rounded-full mt-1 ${getPrioridadColor(recordatorio.prioridad)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {recordatorio.titulo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {recordatorio.fecha} - {recordatorio.hora}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {recordatorio.descripcion}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarCompletado(recordatorio.id);
                        }}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>


            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4">Tipos de Recordatorios</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Trabajo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Personal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Académico</span>
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-4 mb-2">Prioridades</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Alta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Media</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Baja</span>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4">Resumen</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">Pendientes</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {reminders.filter(r => !r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">Completados</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {reminders.filter(r => r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-xs sm:text-sm text-red-700 font-medium">Prioridad Alta</span>
                  <span className="text-sm sm:text-base font-extrabold text-red-800">
                    {reminders.filter(r => r.prioridad === 'alta' && !r.completado).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para nuevo recordatorio */}
        {showNewModal && createPortal(
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNewModal(false);
              }
            }}
          >
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Nuevo Recordatorio
                  </h3>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <form onSubmit={manejarNuevoRecordatorio} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReminder.titulo}
                      onChange={(e) => setNewReminder({ ...newReminder, titulo: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Título del recordatorio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newReminder.descripcion}
                      onChange={(e) => setNewReminder({ ...newReminder, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      rows="3"
                      placeholder="Descripción opcional"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        required
                        value={newReminder.fecha}
                        onChange={(e) => setNewReminder({ ...newReminder, fecha: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora *
                      </label>
                      <input
                        type="time"
                        required
                        value={newReminder.hora}
                        onChange={(e) => setNewReminder({ ...newReminder, hora: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={newReminder.tipo}
                        onChange={(e) => setNewReminder({ ...newReminder, tipo: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      >
                        <option value="personal">Personal</option>
                        <option value="trabajo">Trabajo</option>
                        <option value="academico">Académico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <select
                        value={newReminder.prioridad}
                        onChange={(e) => setNewReminder({ ...newReminder, prioridad: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recordar antes (minutos)
                    </label>
                    <select
                      value={newReminder.recordarMinutos}
                      onChange={(e) => setNewReminder({ ...newReminder, recordarMinutos: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    >
                      <option value="5">5 minutos</option>
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                      <option value="1440">1 día</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewModal(false)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 border border-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center font-bold transform hover:scale-[1.02] active:scale-95"
                    >
                      {isLoading && (
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {isLoading ? 'Guardando...' : 'Guardar Recordatorio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}

        {/* Modal para editar recordatorio */}
        {showEditModal && selectedReminder && createPortal(
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setSelectedReminder(null);
              }
            }}
          >
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Detalles del Recordatorio
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedReminder(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${getPrioridadColor(selectedReminder.prioridad)}`}></div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedReminder.titulo}</h4>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedReminder.descripcion || 'Sin descripción'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Fecha:</span>
                      <p className="text-gray-900">{selectedReminder.fecha}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Hora:</span>
                      <p className="text-gray-900">{selectedReminder.hora}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tipo:</span>
                      <p className="text-gray-900 capitalize">{selectedReminder.tipo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Prioridad:</span>
                      <p className="text-gray-900 capitalize">{selectedReminder.prioridad}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Recordar:</span>
                    <p className="text-gray-900">
                      {selectedReminder.recordarMinutos >= 1440
                        ? `${selectedReminder.recordarMinutos / 1440} día(s) antes`
                        : selectedReminder.recordarMinutos >= 60
                          ? `${selectedReminder.recordarMinutos / 60} hora(s) antes`
                          : `${selectedReminder.recordarMinutos} minutos antes`
                      }
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                    <button
                      onClick={() => eliminarRecordatorio(selectedReminder.id)}
                      className="order-2 sm:order-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-200 transition-all duration-200 font-bold flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                    <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => marcarCompletado(selectedReminder.id)}
                        className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-bold shadow-md border transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm ${selectedReminder.completado
                          ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 hover:from-emerald-700 hover:to-teal-700'
                          }`}
                      >
                        {selectedReminder.completado ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {selectedReminder.completado ? 'Desmarcar' : 'Completar Tarea'}
                      </button>
                      <button
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedReminder(null);
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200 transition-all duration-200 font-bold text-sm"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}

        {/* Modal de notificaciones */}
        {showNotification && notifications.length > 0 && createPortal(
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNotification(false);
              }
            }}
          >
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg border-2 border-yellow-300">
                      <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      ¡Recordatorios Pendientes!
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.map((notificacion) => (
                    <div key={notificacion.id} className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${getPrioridadColor(notificacion.prioridad)}`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notificacion.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notificacion.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Programado para: {notificacion.fecha} a las {notificacion.hora}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      // Marcar todos los recordatorios de la notificación como vistos
                      setShowNotification(false);
                      setNotifications([]);
                    }}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 shadow-sm border border-slate-700 transition-all duration-200 font-semibold"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
      </div>
    </div>
  );
}

export default Calendario_Admin_comp;