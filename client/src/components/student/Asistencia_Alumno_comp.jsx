// src/components/Asistencia_Alumno_comp.jsx
import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAsistenciasEstudiante, getResumenAsistenciaEstudiante } from '../../api/asistencias.js';
import { toDisplayTitle } from '../../utils/text.js';

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

/**
/**
 * Normalizar fecha a formato YYYY-MM-DD
 * Maneja diferentes formatos incluyendo: "2025-11-18T06:00:00.000Z - 19:07", ISO strings, Date objects, etc.
 */
function normalizeDateToYYYYMMDD(dateInput) {
  if (!dateInput) return null;

  let dateStr = dateInput;

  // Si es un Date object, convertir a string ISO
  if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString();
  } else if (typeof dateInput !== 'string') {
    dateStr = String(dateInput);
  }

  // Manejar formato extraño como "2025-11-18T06:00:00.000Z - 19:07"
  // Tomar solo la parte antes del guion si existe
  if (dateStr.includes(' - ')) {
    dateStr = dateStr.split(' - ')[0].trim();
  }

  // Si contiene 'T', tomar solo la parte de la fecha
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // Si es más largo que 10 caracteres, tomar solo los primeros 10 (YYYY-MM-DD)
  if (dateStr.length > 10) {
    dateStr = dateStr.substring(0, 10);
  }

  // Validar que tenga el formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Si no tiene el formato correcto, intentar parsear como Date
  try {
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }
  } catch (e) {
    console.warn('Error normalizando fecha:', dateInput, e);
  }

  return null;
}
/**
 * Transformar datos de la API al formato esperado por el componente
 */
function transformApiDataToAttendanceData(apiData) {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  // Agrupar por fecha
  const groupedByDate = {};
  apiData.forEach(item => {
    // Normalizar la fecha al formato YYYY-MM-DD
    const fecha = normalizeDateToYYYYMMDD(item.fecha) || item.fecha;
    if (!groupedByDate[fecha]) {
      groupedByDate[fecha] = [];
    }
    groupedByDate[fecha].push(item);
  });

  // Convertir a formato esperado
  const result = Object.entries(groupedByDate).map(([fecha, items]) => {
    const date = new Date(fecha);
    const day = date.getDate();
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });

    const activities = items.map(item => ({
      id: item.id,
      type: item.tipo, // clase, tarea, simulacion
      title: item.tipo === 'clase' ? 'Clase' : item.tipo === 'tarea' ? 'Tarea' : 'Simulación',
      time: item.created_at ? new Date(item.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
      attended: item.asistio === 1 || item.asistio === true,
      status: item.asistio ? 'asistio' : 'falto',
      observaciones: item.observaciones || null
    }));

    const attendedCount = activities.filter(a => a.attended).length;
    const attendanceRate = activities.length > 0 ? (attendedCount / activities.length) * 100 : 0;

    return {
      date: fecha,
      day,
      dayName,
      activities,
      hasActivities: activities.length > 0,
      attendanceRate,
      total: activities.length,
      attended: attendedCount
    };
  });

  // Ordenar por fecha (más reciente primero)
  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Componente de resumen de estadísticas
function AttendanceStats({ resumenData, attendanceData }) {
  // Usar resumen de API si está disponible, sino calcular desde attendanceData
  let overallRate = 0;
  let totalActivities = 0;
  let attendedActivities = 0;
  let typeStats = {
    clase: { total: 0, attended: 0 },
    tarea: { total: 0, attended: 0 },
    simulacion: { total: 0, attended: 0 }
  };

  if (resumenData) {
    // Usar datos del resumen de la API
    overallRate = resumenData.general?.porcentaje || 0;
    totalActivities = resumenData.general?.total || 0;
    attendedActivities = resumenData.general?.asistidas || 0;

    // Mapear datos de porTipo
    if (resumenData.porTipo && Array.isArray(resumenData.porTipo)) {
      resumenData.porTipo.forEach(item => {
        if (item.tipo === 'clase') {
          typeStats.clase = {
            total: item.total || 0,
            attended: item.asistidas || 0
          };
        } else if (item.tipo === 'tarea') {
          typeStats.tarea = {
            total: item.total || 0,
            attended: item.asistidas || 0
          };
        } else if (item.tipo === 'simulacion') {
          typeStats.simulacion = {
            total: item.total || 0,
            attended: item.asistidas || 0
          };
        }
      });
    }
  } else {
    // Calcular desde attendanceData (fallback)
    totalActivities = attendanceData.reduce((acc, day) => acc + day.activities.length, 0);
    attendedActivities = attendanceData.reduce((acc, day) =>
      acc + day.activities.filter(a => a.attended).length, 0
    );
    overallRate = totalActivities > 0 ? (attendedActivities / totalActivities) * 100 : 0;

    attendanceData.forEach(day => {
      day.activities.forEach(activity => {
        typeStats[activity.type].total++;
        if (activity.attended) {
          typeStats[activity.type].attended++;
        }
      });
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Asistencia General */}
      <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border-2 border-blue-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-200/50">
            <IconoAsistencia className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{Math.round(overallRate)}%</span>
        </div>
        <h3 className="text-xs sm:text-sm font-extrabold text-blue-800 mb-0.5 sm:mb-1">Asistencia General</h3>
        <p className="text-[10px] sm:text-xs text-blue-600 font-semibold">{attendedActivities} de {totalActivities} actividades</p>
      </div>

      {/* Clases */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border-2 border-green-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-green-200/50">
            <IconoClase className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            {typeStats.clase.total > 0 ? Math.round((typeStats.clase.attended / typeStats.clase.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-xs sm:text-sm font-extrabold text-green-800 mb-0.5 sm:mb-1">Clases</h3>
        <p className="text-[10px] sm:text-xs text-green-600 font-semibold">{typeStats.clase.attended} de {typeStats.clase.total}</p>
      </div>

      {/* Tareas */}
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border-2 border-purple-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-purple-200/50">
            <IconoTarea className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
            {typeStats.tarea.total > 0 ? Math.round((typeStats.tarea.attended / typeStats.tarea.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-xs sm:text-sm font-extrabold text-purple-800 mb-0.5 sm:mb-1">Tareas</h3>
        <p className="text-[10px] sm:text-xs text-purple-600 font-semibold">{typeStats.tarea.attended} de {typeStats.tarea.total}</p>
      </div>

      {/* Simulaciones */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border-2 border-orange-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-orange-200/50">
            <IconoSimulacion className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
            {typeStats.simulacion.total > 0 ? Math.round((typeStats.simulacion.attended / typeStats.simulacion.total) * 100) : 0}%
          </span>
        </div>
        <h3 className="text-xs sm:text-sm font-extrabold text-orange-800 mb-0.5 sm:mb-1">Simulaciones</h3>
        <p className="text-[10px] sm:text-xs text-orange-600 font-semibold">{typeStats.simulacion.attended} de {typeStats.simulacion.total}</p>
      </div>
    </div>
  );
}

// Componente del calendario de asistencia
function AttendanceCalendar({ attendanceData, selectedFilter }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Obtener el primer día del mes y cuántos días tiene
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  // Crear array de días del mes con datos de asistencia
  const calendarDays = [];

  // Días vacíos al inicio del mes
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ day: null, isPlaceholder: true });
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = attendanceData.find(d => {
      // Normalizar la fecha usando la función auxiliar
      const normalizedDate = normalizeDateToYYYYMMDD(d.date);
      return normalizedDate === dateStr;
    });

    const isToday = day === currentDate.getDate() && currentMonth === currentDate.getMonth();
    const isFutureDay = new Date(currentYear, currentMonth, day) > currentDate;

    calendarDays.push({
      day,
      dateStr,
      dayData,
      isToday,
      isFutureDay
    });
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-violet-200/50 overflow-hidden ring-2 ring-violet-100/50">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-3 sm:p-4 md:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white capitalize">
          Calendario de Asistencia - {monthName}
        </h3>
      </div>

      <div className="p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-[10px] sm:text-xs md:text-sm font-extrabold text-violet-700 py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((item, index) => {
            if (item.isPlaceholder) {
              return <div key={`placeholder-${index}`} className="aspect-square" />;
            }

            const { day, dayData, isToday, isFutureDay } = item;

            // Filtrar actividades según el filtro seleccionado
            const filteredActivities = dayData?.activities?.filter(activity => {
              if (selectedFilter === 'todos') return true;
              if (selectedFilter === 'clases') return activity.type === 'clase';
              if (selectedFilter === 'tareas') return activity.type === 'tarea';
              if (selectedFilter === 'simulaciones') return activity.type === 'simulacion';
              return true;
            }) || [];

            const hasFilteredActivities = filteredActivities.length > 0;
            const allAttended = hasFilteredActivities && filteredActivities.every(a => a.attended);
            const someAttended = hasFilteredActivities && filteredActivities.some(a => a.attended);

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center text-[10px] sm:text-xs md:text-sm rounded-lg sm:rounded-xl border-2 transition-all duration-200 touch-manipulation ${isToday
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-300'
                    : hasFilteredActivities
                      ? allAttended
                        ? 'border-green-300 bg-green-50 hover:bg-green-100 shadow-md'
                        : someAttended
                          ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 shadow-md'
                          : 'border-red-300 bg-red-50 hover:bg-red-100 shadow-md'
                      : isFutureDay
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <span className={`font-extrabold ${isToday ? 'text-blue-700' : ''}`}>{day}</span>
                {hasFilteredActivities && (
                  <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 max-w-full">
                    {filteredActivities.slice(0, 3).map((activity, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm ${activity.attended ? 'bg-green-500 ring-1 ring-green-300' : 'bg-red-500 ring-1 ring-red-300'
                          }`}
                        title={`${activity.title}: ${activity.attended ? 'Asistió' : 'Faltó'}`}
                      />
                    ))}
                    {filteredActivities.length > 3 && (
                      <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold">+{filteredActivities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda - Mejorada */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-green-200">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full ring-1 ring-green-300"></div>
            <span className="font-extrabold text-green-700">Asistió/Completó</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-red-200">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full ring-1 ring-red-300"></div>
            <span className="font-extrabold text-red-700">Faltó/No completó</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-200">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
            <span className="font-extrabold text-blue-700">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal de Asistencia
export function Asistencia_Alumno_comp() {
  const { currentCourse } = useStudent();
  const { alumno } = useAuth();
  const alumnoId = alumno?.id;

  const [attendanceData, setAttendanceData] = useState([]);
  const [resumenData, setResumenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos'); // todos, clases, tareas, simulaciones

  // Cargar datos de asistencia desde la API
  useEffect(() => {
    if (!alumnoId) {
      setIsLoading(false);
      return;
    }

    let alive = true;
    const loadAttendanceData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Obtener asistencias del último mes
        const fechaHasta = new Date().toISOString().split('T')[0];
        const fechaDesde = new Date();
        fechaDesde.setMonth(fechaDesde.getMonth() - 1);
        const fechaDesdeStr = fechaDesde.toISOString().split('T')[0];

        const [asistenciasRes, resumenRes] = await Promise.all([
          getAsistenciasEstudiante(alumnoId, {
            desde: fechaDesdeStr,
            hasta: fechaHasta
          }).catch(() => ({ data: [] })),
          getResumenAsistenciaEstudiante(alumnoId, {
            desde: fechaDesdeStr,
            hasta: fechaHasta
          }).catch(() => ({ data: null }))
        ]);

        if (!alive) return;

        const asistencias = Array.isArray(asistenciasRes?.data) ? asistenciasRes.data : [];
        const transformedData = transformApiDataToAttendanceData(asistencias);
        setAttendanceData(transformedData);
        setResumenData(resumenRes?.data || null);
      } catch (e) {
        if (!alive) return;
        console.error('Error cargando asistencias:', e);
        setError('No se pudieron cargar las asistencias');
        setAttendanceData([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    };

    loadAttendanceData();
    return () => { alive = false; };
  }, [alumnoId, currentCourse]);

  // Filtrar datos según el filtro seleccionado
  const filteredAttendanceData = attendanceData.map(day => ({
    ...day,
    activities: day.activities.filter(activity => {
      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'clases') return activity.type === 'clase';
      if (selectedFilter === 'tareas') return activity.type === 'tarea';
      if (selectedFilter === 'simulaciones') return activity.type === 'simulacion';
      return true;
    })
  })).filter(day => day.activities.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-violet-200/50 text-center ring-2 ring-violet-100/50">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-violet-700">Cargando asistencia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-red-200 text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-gray-700 mb-2">{error}</p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 lg:py-8 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">

        {/* Header - Mejorado */}
        <div className="text-center lg:text-left mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 mb-2 sm:mb-3 tracking-tight">
            CONTROL DE ASISTENCIA
          </h1>
          {currentCourse && (
            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
              {toDisplayTitle(currentCourse?.title)}
            </p>
          )}
        </div>

        {/* Estadísticas */}
        <AttendanceStats resumenData={resumenData} attendanceData={attendanceData} />

        {/* Filtros - Mejorados */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {[
            { key: 'todos', label: 'Todas', color: 'blue', gradient: 'from-blue-500 to-indigo-600' },
            { key: 'clases', label: 'Clases', color: 'green', gradient: 'from-green-500 to-emerald-600' },
            { key: 'tareas', label: 'Tareas', color: 'purple', gradient: 'from-purple-500 to-violet-600' },
            { key: 'simulaciones', label: 'Simulaciones', color: 'orange', gradient: 'from-orange-500 to-amber-600' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm md:text-base transition-all duration-200 active:scale-95 touch-manipulation border-2 shadow-md hover:shadow-lg ${selectedFilter === filter.key
                  ? `bg-gradient-to-r ${filter.gradient} text-white border-transparent shadow-lg`
                  : `bg-white text-${filter.color}-600 border-${filter.color}-300 hover:bg-${filter.color}-50 hover:border-${filter.color}-400`
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Calendario */}
        <AttendanceCalendar attendanceData={attendanceData} selectedFilter={selectedFilter} />

        {/* Lista detallada de actividades recientes - Mejorada */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-violet-200/50 overflow-hidden ring-2 ring-violet-100/50">
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-3 sm:p-4 md:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actividades Recientes
            </h3>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="space-y-2 sm:space-y-3">
              {filteredAttendanceData.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-semibold">No hay registros de asistencia aún.</p>
                  <p className="text-xs sm:text-sm mt-2 text-gray-400">Las asistencias aparecerán aquí cuando tu asesor las registre.</p>
                </div>
              ) : (
                filteredAttendanceData
                  .slice(0, 10) // Últimos 10 días con actividades
                  .map(day =>
                    day.activities.map(activity => (
                      <div
                        key={activity.id}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${activity.attended
                            ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                            : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                          }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50 flex-shrink-0 ${activity.type === 'clase' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                              activity.type === 'tarea' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                                'bg-gradient-to-br from-orange-500 to-amber-600'
                            }`}>
                            {activity.type === 'clase' && <IconoClase className="text-white w-5 h-5 sm:w-6 sm:h-6" />}
                            {activity.type === 'tarea' && <IconoTarea className="text-white w-5 h-5 sm:w-6 sm:h-6" />}
                            {activity.type === 'simulacion' && <IconoSimulacion className="text-white w-5 h-5 sm:w-6 sm:h-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-xs sm:text-sm md:text-base text-gray-800 truncate">
                              {activity.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium truncate">
                              {day.date} - {activity.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                          {activity.attended ? (
                            <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                              <IconoAsistencia className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          ) : (
                            <div className="p-1.5 sm:p-2 bg-red-100 rounded-full">
                              <IconoFalta className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          )}
                          <span className={`text-[10px] sm:text-xs md:text-sm font-extrabold px-2 sm:px-2.5 py-1 rounded-lg border ${activity.attended
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-red-700 bg-red-50 border-red-200'
                            }`}>
                            {activity.attended ? 'Asistió' : 'Faltó'}
                          </span>
                        </div>
                      </div>
                    ))
                  ).flat()
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Asistencia_Alumno_comp;

