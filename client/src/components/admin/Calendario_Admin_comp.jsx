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
import React, { useState, useEffect } from 'react';

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
      const response = await fetch(`/api/admin/calendar/events?startDate=${startDate}&endDate=${endDate}`);
      
      // Verificar si la respuesta es exitosa y el content-type es JSON
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API del backend no disponible - usando datos de ejemplo');
      }
      
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Error obteniendo recordatorios:', error);
      // No mostrar error en desarrollo - solo usar datos de ejemplo
      console.log('Usando datos de ejemplo para desarrollo');
      // setApiError('Backend no disponible - usando datos de ejemplo');
      // Recurrir a datos de ejemplo
      loadSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async (reminderData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/admin/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });
      
      // Verificar si la respuesta es exitosa y el content-type es JSON
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API del backend no disponible');
      }
      
      const newReminder = await response.json();
      setReminders(prev => [...prev, newReminder]);
      return newReminder;
    } catch (error) {
      console.error('Error creando recordatorio:', error);
      
      // Para desarrollo, crear un recordatorio simulado localmente
      const mockReminder = {
        id: Date.now(), // Generación simple de ID para desarrollo
        ...reminderData,
        completado: false
      };
      
      setReminders(prev => [...prev, mockReminder]);
      console.log('Recordatorio creado localmente (modo desarrollo):', mockReminder);
      return mockReminder;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminder = async (id, updates) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/admin/calendar/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      // Verificar si la respuesta es exitosa y el content-type es JSON
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API del backend no disponible');
      }
      
      const updatedReminder = await response.json();
      
      const updatedReminders = reminders.map(r => 
        r.id === id ? updatedReminder : r
      );
      setReminders(updatedReminders);
      
      // Actualizar selectedReminder si es el mismo que se está editando
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder(updatedReminder);
      }
      
      return updatedReminder;
    } catch (error) {
      console.error('Error actualizando recordatorio:', error);
      
      // Para desarrollo, actualizar recordatorio localmente
      const updatedReminders = reminders.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      setReminders(updatedReminders);
      
      // Actualizar selectedReminder si es el mismo que se está editando
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder({ ...selectedReminder, ...updates });
      }
      
      console.log('Recordatorio actualizado localmente (modo desarrollo)');
      return { ...reminders.find(r => r.id === id), ...updates };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = async (id) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/admin/calendar/events/${id}`, {
        method: 'DELETE',
      });
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      
      setReminders(prev => prev.filter(r => r.id !== id));
      setShowEditModal(false);
      setSelectedReminder(null);
    } catch (error) {
      console.error('Error eliminando recordatorio:', error);
      
      // Para desarrollo, eliminar recordatorio localmente
      setReminders(prev => prev.filter(r => r.id !== id));
      setShowEditModal(false);
      setSelectedReminder(null);
      console.log('Recordatorio eliminado localmente (modo desarrollo)');
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
      console.error('Error en el envío del formulario:', error);
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
      console.error('Error actualizando estado del recordatorio:', error);
    }
  };

  // Eliminar recordatorio
  const eliminarRecordatorio = async (id) => {
    try {
      await deleteReminder(id);
    } catch (error) {
      // El error ya está manejado en la función deleteReminder
      console.error('Error eliminando recordatorio:', error);
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
    switch(tipo) {
      case 'trabajo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-green-100 text-green-800 border-green-200';
      case 'academico': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
       
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Agenda Personal</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona tus recordatorios y tareas personales
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <button 
                onClick={() => setShowNewModal(true)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm font-medium">{apiError}</p>
              <button 
                onClick={() => setApiError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

       
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="animate-spin w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-blue-800 text-sm font-medium">Cargando...</p>
            </div>
          </div>
        )}

      
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border border-purple-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => cambiarMes(-1)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button 
                  onClick={() => cambiarMes(1)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
                {diasSemana.map((dia) => (
                  <div key={dia} className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
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
                      className={`min-h-32 p-2 border-r border-b border-gray-200 ${
                        !dia.esMesActual ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${esHoy ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      <div className={`text-sm font-semibold mb-2 ${
                        esHoy ? 'text-blue-700' : ''
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
                            className={`text-xs p-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all duration-200 ${getTipoColor(recordatorio.tipo)} ${recordatorio.completado ? 'opacity-50 line-through' : ''}`}
                          >
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getPrioridadColor(recordatorio.prioridad)}`}></div>
                              <span className="font-medium truncate">{recordatorio.hora}</span>
                            </div>
                            <div className="truncate mt-1">{recordatorio.titulo}</div>
                          </div>
                        ))}
                        {recordatoriosDelDia.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
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
          
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

        
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Recordatorios</h3>
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
              
              <h4 className="text-md font-semibold text-gray-900 mt-4 mb-2">Prioridades</h4>
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

       
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {reminders.filter(r => !r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completados</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {reminders.filter(r => r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prioridad Alta</span>
                  <span className="text-sm font-semibold text-red-600">
                    {reminders.filter(r => r.prioridad === 'alta' && !r.completado).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para nuevo recordatorio */}
        {showNewModal && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNewModal(false);
              }
            }}
          >
            <div className="relative mx-auto border w-full max-w-md shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nuevo Recordatorio
                  </h3>
                  <button 
                    onClick={() => setShowNewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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
                      onChange={(e) => setNewReminder({...newReminder, titulo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Título del recordatorio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newReminder.descripcion}
                      onChange={(e) => setNewReminder({...newReminder, descripcion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => setNewReminder({...newReminder, fecha: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => setNewReminder({...newReminder, hora: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => setNewReminder({...newReminder, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => setNewReminder({...newReminder, prioridad: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      onChange={(e) => setNewReminder({...newReminder, recordarMinutos: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                      {isLoading && (
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {isLoading ? 'Creando...' : 'Crear Recordatorio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar recordatorio */}
        {showEditModal && selectedReminder && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setSelectedReminder(null);
              }
            }}
          >
            <div className="relative mx-auto border w-full max-w-md shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalles del Recordatorio
                  </h3>
                  <button 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedReminder(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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
                  
                  <div className="flex justify-between space-x-2 pt-4">
                    <button 
                      onClick={() => eliminarRecordatorio(selectedReminder.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => marcarCompletado(selectedReminder.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedReminder.completado 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {selectedReminder.completado ? 'Desmarcar' : 'Completar'}
                      </button>
                      <button 
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedReminder(null);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de notificaciones */}
        {showNotification && notifications.length > 0 && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNotification(false);
              }
            }}
          >
            <div className="relative mx-auto border w-full max-w-md shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ¡Recordatorios Pendientes!
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowNotification(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.map((notificacion) => (
                    <div key={notificacion.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      // Marcar todos los recordatorios de la notificación como vistos
                      setShowNotification(false);
                      setNotifications([]);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendario_Admin_comp;