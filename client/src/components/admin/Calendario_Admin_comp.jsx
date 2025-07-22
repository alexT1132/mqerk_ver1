// src\components\Calendario_Admin_comp.jsx
import React, { useState, useEffect } from 'react';

export function Calendario_Admin_comp() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [recordatorios, setRecordatorios] = useState([]);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [recordatorioSeleccionado, setRecordatorioSeleccionado] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  
  // Estado para el formulario de nuevo recordatorio
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'personal',
    prioridad: 'media',
    recordarMinutos: 15
  });

  // Cargar recordatorios de ejemplo y configurar notificaciones
  useEffect(() => {
    const recordatoriosEjemplo = [
      {
        id: 1,
        titulo: 'Reunión con Directivos',
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
        titulo: 'Llamar al proveedor de libros',
        descripcion: 'Confirmar entrega de material didáctico',
        fecha: '2025-07-08',
        hora: '14:30',
        tipo: 'trabajo',
        prioridad: 'media',
        recordarMinutos: 15,
        completado: false
      },
      {
        id: 3,
        titulo: 'Revisar expedientes de nuevos alumnos',
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
        descripcion: 'Chequeo rutinario',
        fecha: '2025-07-12',
        hora: '16:00',
        tipo: 'personal',
        prioridad: 'media',
        recordarMinutos: 120,
        completado: false
      }
    ];
    
    setRecordatorios(recordatoriosEjemplo);
  }, []);

  // Verificar recordatorios próximos cada minuto
  useEffect(() => {
    const verificarRecordatorios = () => {
      const ahora = new Date();
      const notificacionesPendientes = [];

      recordatorios.forEach(recordatorio => {
        if (!recordatorio.completado) {
          const fechaRecordatorio = new Date(`${recordatorio.fecha}T${recordatorio.hora}`);
          const tiempoRecordatorio = new Date(fechaRecordatorio.getTime() - (recordatorio.recordarMinutos * 60000));
          
          // Si es hora de mostrar el recordatorio
          if (ahora >= tiempoRecordatorio && ahora < fechaRecordatorio) {
            notificacionesPendientes.push(recordatorio);
          }
        }
      });

      if (notificacionesPendientes.length > 0) {
        setNotificaciones(notificacionesPendientes);
        setMostrarNotificacion(true);
      }
    };

    const interval = setInterval(verificarRecordatorios, 60000); // Cada minuto
    verificarRecordatorios(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [recordatorios]);

  // Obtener días del mes actual
  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];
    
    // Días del mes anterior
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      dias.push({
        fecha: fecha.getDate(),
        esMesActual: false,
        fechaCompleta: fecha
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia);
      dias.push({
        fecha: dia,
        esMesActual: true,
        fechaCompleta: fecha
      });
    }

    // Días del siguiente mes
    const diasRestantes = 42 - dias.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia);
      dias.push({
        fecha: dia,
        esMesActual: false,
        fechaCompleta: fecha
      });
    }

    return dias;
  };

  // Obtener recordatorios para una fecha específica
  const obtenerRecordatoriosPorFecha = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return recordatorios.filter(recordatorio => recordatorio.fecha === fechaStr);
  };

  // Manejar creación de nuevo recordatorio
  const manejarNuevoRecordatorio = (e) => {
    e.preventDefault();
    const nuevoId = Math.max(...recordatorios.map(r => r.id), 0) + 1;
    const recordatorio = {
      ...nuevoRecordatorio,
      id: nuevoId,
      completado: false
    };
    
    setRecordatorios([...recordatorios, recordatorio]);
    setNuevoRecordatorio({
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      tipo: 'personal',
      prioridad: 'media',
      recordarMinutos: 15
    });
    setMostrarModalNuevo(false);
  };

  // Marcar recordatorio como completado
  const marcarCompletado = (id) => {
    setRecordatorios(recordatorios.map(r => 
      r.id === id ? { ...r, completado: !r.completado } : r
    ));
  };

  // Eliminar recordatorio
  const eliminarRecordatorio = (id) => {
    setRecordatorios(recordatorios.filter(r => r.id !== id));
    setMostrarModalEditar(false);
    setRecordatorioSeleccionado(null);
  };

  // Navegar entre meses
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
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
        {/* Header */}
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
                onClick={() => setMostrarModalNuevo(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Recordatorio
              </button>
            </div>
          </div>
        </div>

        {/* Controles del calendario */}
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
                  {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
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
                onClick={() => setFechaActual(new Date())}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Encabezados de días de la semana */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
                {diasSemana.map((dia) => (
                  <div key={dia} className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7">
                {obtenerDiasDelMes().map((dia, index) => {
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
                              setRecordatorioSeleccionado(recordatorio);
                              setMostrarModalEditar(true);
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

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Recordatorios próximos */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Próximos Recordatorios
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recordatorios
                  .filter(r => !r.completado && new Date(`${r.fecha}T${r.hora}`) >= new Date())
                  .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
                  .slice(0, 5)
                  .map((recordatorio) => (
                  <div 
                    key={recordatorio.id}
                    onClick={() => {
                      setRecordatorioSeleccionado(recordatorio);
                      setMostrarModalEditar(true);
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

            {/* Leyenda de tipos */}
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

            {/* Estadísticas */}
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {recordatorios.filter(r => !r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completados</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {recordatorios.filter(r => r.completado).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prioridad Alta</span>
                  <span className="text-sm font-semibold text-red-600">
                    {recordatorios.filter(r => r.prioridad === 'alta' && !r.completado).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para nuevo recordatorio */}
        {mostrarModalNuevo && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMostrarModalNuevo(false);
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
                    onClick={() => setMostrarModalNuevo(false)}
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
                      value={nuevoRecordatorio.titulo}
                      onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, titulo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Título del recordatorio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={nuevoRecordatorio.descripcion}
                      onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, descripcion: e.target.value})}
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
                        value={nuevoRecordatorio.fecha}
                        onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, fecha: e.target.value})}
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
                        value={nuevoRecordatorio.hora}
                        onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, hora: e.target.value})}
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
                        value={nuevoRecordatorio.tipo}
                        onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, tipo: e.target.value})}
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
                        value={nuevoRecordatorio.prioridad}
                        onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, prioridad: e.target.value})}
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
                      value={nuevoRecordatorio.recordarMinutos}
                      onChange={(e) => setNuevoRecordatorio({...nuevoRecordatorio, recordarMinutos: parseInt(e.target.value)})}
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
                      onClick={() => setMostrarModalNuevo(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Recordatorio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar recordatorio */}
        {mostrarModalEditar && recordatorioSeleccionado && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMostrarModalEditar(false);
                setRecordatorioSeleccionado(null);
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
                      setMostrarModalEditar(false);
                      setRecordatorioSeleccionado(null);
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
                    <div className={`w-4 h-4 rounded-full ${getPrioridadColor(recordatorioSeleccionado.prioridad)}`}></div>
                    <h4 className="text-lg font-medium text-gray-900">{recordatorioSeleccionado.titulo}</h4>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{recordatorioSeleccionado.descripcion || 'Sin descripción'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Fecha:</span>
                      <p className="text-gray-900">{recordatorioSeleccionado.fecha}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Hora:</span>
                      <p className="text-gray-900">{recordatorioSeleccionado.hora}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tipo:</span>
                      <p className="text-gray-900 capitalize">{recordatorioSeleccionado.tipo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Prioridad:</span>
                      <p className="text-gray-900 capitalize">{recordatorioSeleccionado.prioridad}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Recordar:</span>
                    <p className="text-gray-900">
                      {recordatorioSeleccionado.recordarMinutos >= 1440 
                        ? `${recordatorioSeleccionado.recordarMinutos / 1440} día(s) antes`
                        : recordatorioSeleccionado.recordarMinutos >= 60
                        ? `${recordatorioSeleccionado.recordarMinutos / 60} hora(s) antes`
                        : `${recordatorioSeleccionado.recordarMinutos} minutos antes`
                      }
                    </p>
                  </div>
                  
                  <div className="flex justify-between space-x-2 pt-4">
                    <button 
                      onClick={() => eliminarRecordatorio(recordatorioSeleccionado.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => marcarCompletado(recordatorioSeleccionado.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          recordatorioSeleccionado.completado 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {recordatorioSeleccionado.completado ? 'Desmarcar' : 'Completar'}
                      </button>
                      <button 
                        onClick={() => {
                          setMostrarModalEditar(false);
                          setRecordatorioSeleccionado(null);
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
        {mostrarNotificacion && notificaciones.length > 0 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMostrarNotificacion(false);
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
                    onClick={() => setMostrarNotificacion(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notificaciones.map((notificacion) => (
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
                    onClick={() => setMostrarNotificacion(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      // Marcar todos los recordatorios de la notificación como vistos
                      setMostrarNotificacion(false);
                      setNotificaciones([]);
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
