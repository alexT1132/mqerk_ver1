// src/components/Asistencia_Alumno_comp.jsx
import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext.jsx';
import { useCourse } from '../context/CourseContext.jsx';

// Iconos SVG
const IconoAsistencia = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconoFalta = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconoClase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
  </svg>
);

const IconoTarea = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const IconoSimulacion = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// TODO: Los datos de asistencia serán proporcionados por el backend
// Estructura esperada: { date, day, dayName, activities: [{ id, type, title, time, attended, status }] }
function generateAttendanceData() {
  return []; // Array vacío - datos vendrán del backend
}

// Componente de resumen de estadísticas
function AttendanceStats({ attendanceData }) {
  const totalActivities = attendanceData.reduce((acc, day) => acc + day.activities.length, 0);
  const attendedActivities = attendanceData.reduce((acc, day) => 
    acc + day.activities.filter(a => a.attended).length, 0
  );
  
  const overallRate = totalActivities > 0 ? (attendedActivities / totalActivities) * 100 : 0;
  
  const typeStats = {
    clase: { total: 0, attended: 0 },
    tarea: { total: 0, attended: 0 },
    simulacion: { total: 0, attended: 0 }
  };
  
  attendanceData.forEach(day => {
    day.activities.forEach(activity => {
      typeStats[activity.type].total++;
      if (activity.attended) {
        typeStats[activity.type].attended++;
      }
    });
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Asistencia General */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <IconoAsistencia className="text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-600">{Math.round(overallRate)}%</span>
        </div>
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Asistencia General</h3>
        <p className="text-xs text-blue-600">{attendedActivities} de {totalActivities} actividades</p>
      </div>
      
      {/* Clases */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <IconoClase className="text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-green-600">
            {typeStats.clase.total > 0 ? Math.round((typeStats.clase.attended / typeStats.clase.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-sm font-semibold text-green-800 mb-1">Clases</h3>
        <p className="text-xs text-green-600">{typeStats.clase.attended} de {typeStats.clase.total}</p>
      </div>
      
      {/* Tareas */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <IconoTarea className="text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-purple-600">
            {typeStats.tarea.total > 0 ? Math.round((typeStats.tarea.attended / typeStats.tarea.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-sm font-semibold text-purple-800 mb-1">Tareas</h3>
        <p className="text-xs text-purple-600">{typeStats.tarea.attended} de {typeStats.tarea.total}</p>
      </div>
      
      {/* Simulaciones */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <IconoSimulacion className="text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-orange-600">
            {typeStats.simulacion.total > 0 ? Math.round((typeStats.simulacion.attended / typeStats.simulacion.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-sm font-semibold text-orange-800 mb-1">Simulaciones</h3>
        <p className="text-xs text-orange-600">{typeStats.simulacion.attended} de {typeStats.simulacion.total}</p>
      </div>
    </div>
  );
}

// Componente del calendario de asistencia
function AttendanceCalendar({ attendanceData }) {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white capitalize">
          Calendario de Asistencia - {monthName}
        </h3>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Generar días del mes */}
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const dayData = attendanceData.find(d => d.day === day);
            const isToday = day === currentDate.getDate();
            const isFutureDay = day > currentDate.getDate();
            
            if (!dayData && !isFutureDay) return null;
            
            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg border-2 transition-all duration-200 ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : dayData?.hasActivities
                      ? dayData.attendanceRate === 100
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : dayData.attendanceRate >= 50
                          ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                          : 'border-red-300 bg-red-50 hover:bg-red-100'
                      : isFutureDay
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="font-semibold">{day}</span>
                {dayData?.hasActivities && (
                  <div className="flex space-x-1 mt-1">
                    {dayData.activities.map((activity, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          activity.attended ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Asistió/Completó</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Faltó/No completó</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-blue-500 rounded-full"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal de Asistencia
export function Asistencia_Alumno_comp() {
  const { currentCourse } = useStudent();
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('todos'); // todos, clases, tareas, simulaciones
  
  useEffect(() => {
    // Simular carga de datos
    const loadAttendanceData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateAttendanceData();
      setAttendanceData(data);
      setIsLoading(false);
    };
    
    loadAttendanceData();
  }, [currentCourse]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando asistencia...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 lg:p-6 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            CONTROL DE ASISTENCIA
          </h1>
          {currentCourse && (
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {currentCourse.title}
            </p>
          )}
        </div>
        
        {/* Estadísticas */}
        <AttendanceStats attendanceData={attendanceData} />
        
        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
          {[
            { key: 'todos', label: 'Todas', color: 'blue' },
            { key: 'clases', label: 'Clases', color: 'green' },
            { key: 'tareas', label: 'Tareas', color: 'purple' },
            { key: 'simulaciones', label: 'Simulaciones', color: 'orange' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                selectedFilter === filter.key
                  ? `bg-${filter.color}-500 text-white shadow-lg`
                  : `bg-white text-${filter.color}-600 border border-${filter.color}-200 hover:bg-${filter.color}-50`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Calendario */}
        <AttendanceCalendar attendanceData={attendanceData} />
        
        {/* Lista detallada de actividades recientes */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Actividades Recientes
            </h3>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {attendanceData
                .slice(-7) // Últimos 7 días
                .reverse()
                .map(day => 
                  day.activities
                    .filter(activity => 
                      selectedFilter === 'todos' || 
                      (selectedFilter === 'clases' && activity.type === 'clase') ||
                      (selectedFilter === 'tareas' && activity.type === 'tarea') ||
                      (selectedFilter === 'simulaciones' && activity.type === 'simulacion')
                    )
                    .map(activity => (
                      <div 
                        key={activity.id}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border ${
                          activity.attended 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'clase' ? 'bg-green-500' :
                            activity.type === 'tarea' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}>
                            {activity.type === 'clase' && <IconoClase className="text-white" />}
                            {activity.type === 'tarea' && <IconoTarea className="text-white" />}
                            {activity.type === 'simulacion' && <IconoSimulacion className="text-white" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base text-gray-800">
                              {activity.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {day.date} - {activity.time}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {activity.attended ? (
                            <IconoAsistencia className="text-green-600" />
                          ) : (
                            <IconoFalta className="text-red-600" />
                          )}
                          <span className={`text-xs sm:text-sm font-semibold ${
                            activity.attended ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {activity.attended ? 'Asistió' : 'Faltó'}
                          </span>
                        </div>
                      </div>
                    ))
                ).flat()}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Asistencia_Alumno_comp;
