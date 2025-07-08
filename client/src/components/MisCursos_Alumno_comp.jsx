// src/components/MisCursos_Alumno_comp.jsx
// BACKEND: Este componente necesita datos del contexto StudentContext y CourseContext
// que deben ser poblados con información de la API del backend
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext.jsx';
import { useStudent } from '../context/StudentContext.jsx';

// Iconos para metadata de cursos
const IconoReloj = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconoLibro = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
  </svg>
);
const IconoEstudiante = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-6-3h2m-2 0h-2M6 9H3V6m3 3h3m-3 0V6m0 6h3m-3 0V9m0 6h3m-3 0v-3m6-3h3m-3 0V9m0 6h3m-3 0v-3m0 6h3m-3 0v-3" />
  </svg>
);

/**
 * INTEGRACIÓN BACKEND: Tarjeta individual para mostrar información de un curso
 * 
 * Esta tarjeta recibe un objeto 'course' que debe venir desde la API con la estructura:
 * {
 *   id: string,
 *   title: string,
 *   instructor: string,
 *   image: string, // URL de la imagen del curso
 *   category: string, // 'programacion', 'tecnologico', 'psicoeducativo', 'idiomas', 'exactas', 'admision', 'universidad'
 *   type: string, // 'curso', 'desarrollo'
 *   metadata: [
 *     { icon: 'reloj', text: 'Duración del curso' },
 *     { icon: 'libro', text: 'Número de lecciones' },
 *     { icon: 'estudiante', text: 'Número de estudiantes inscritos' }
 *   ]
 * }
 */
function CourseCard({ course, onAction, isDashboardButton, isCurrentCourse }) {
  // BACKEND: Extraer datos del objeto course que viene de la API
  const { title, instructor, image, metadata, category, type } = course;

  // BACKEND: Sistema de colores para categorías - estos valores deben coincidir 
  // con las categorías que manda el backend en el campo 'category' del curso
  const categoryColors = {
    'programacion': 'bg-red-500',
    'tecnologico': 'bg-blue-500', 
    'psicoeducativo': 'bg-purple-500',
    'idiomas': 'bg-green-500',
    'exactas': 'bg-orange-500',
    'admision': 'bg-indigo-500',
    'universidad': 'bg-pink-500',
  };

  // BACKEND: Colores alternativos por tipo de curso
  const typeColors = {
    'curso': 'bg-pink-500',
    'desarrollo': 'bg-teal-500',
  };

  const badgeColor = categoryColors[category] || typeColors[type] || 'bg-gray-500';

  // Estilos especiales para curso actual
  const currentCourseStyles = isCurrentCourse ? {
    border: 'border-2 border-blue-300',
    shadow: 'shadow-2xl shadow-blue-500/30',
    background: 'bg-white',
    glow: 'ring-2 ring-blue-200/50'
  } : {
    border: 'border border-gray-100',
    shadow: 'shadow-2xl',
    background: 'bg-white',
    glow: ''
  };

  return (
    <div className={`${currentCourseStyles.background} rounded-xl sm:rounded-2xl ${currentCourseStyles.shadow} hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${currentCourseStyles.border} ${currentCourseStyles.glow} h-full ${isCurrentCourse ? 'transform scale-105' : 'hover:scale-105'}`}>
      {/* BACKEND: Imagen del curso - debe venir como URL desde la API */}
      <div className="relative w-full h-28 sm:h-32 md:h-36 lg:h-40 bg-gray-200 flex-shrink-0">
        <img
          src={image || "https://placehold.co/400x200/e0e0e0/555555?text=Curso"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/e0e0e0/555555?text=Curso"; }}
        />
        {/* BACKEND: Badge con la categoría o tipo del curso */}
        <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-xs md:text-sm font-semibold text-white ${badgeColor} shadow-md z-10 ${isCurrentCourse ? 'ring-1 ring-white/70' : ''}`}>
          {category || type}
        </div>
        {isCurrentCourse && (
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex-1">
          {/* BACKEND: Título del curso */}
          <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight truncate ${isCurrentCourse ? 'text-blue-900' : 'text-gray-800'}`} title={title}>
            {title}
          </h3>
          {/* BACKEND: Nombre del instructor */}
          <p className={`text-xs sm:text-sm md:text-base mb-2 sm:mb-3 ${isCurrentCourse ? 'text-blue-700' : 'text-gray-600'}`}>
            Por <span className="font-semibold">{instructor}</span>
          </p>

          {/* BACKEND: Metadatos del curso (duración, lecciones, estudiantes, etc.) */}
          {/* Los iconos se mapean según el campo 'icon' en cada metadata */}
          <div className={`flex flex-col gap-1 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5 ${isCurrentCourse ? 'text-blue-600' : 'text-gray-700'}`}>
            {metadata.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center">
                {item.icon === 'reloj' && <IconoReloj />}
                {item.icon === 'libro' && <IconoLibro />}
                {item.icon === 'estudiante' && <IconoEstudiante />}
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onAction(course)}
            className={`relative w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden
              ${isDashboardButton
                ? isCurrentCourse 
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-green-500/40 animate-pulse hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 ring-2 ring-green-300/50' // Estilo verde mejorado para curso actual
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' // Estilo normal para "IR AL DASHBOARD"
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' // Estilo para "EMPIEZA TU TRANSFORMACIÓN"
              }`}
          >
            {/* Efecto de brillo para curso actual */}
            {isDashboardButton && isCurrentCourse && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            )}
            <div className="relative z-10 flex items-center justify-center">
              <span className="hidden sm:inline">
                {isDashboardButton 
                  ? isCurrentCourse 
                    ? 'CURSO ACTUAL' 
                    : 'IR AL DASHBOARD'
                  : 'EMPIEZA TU TRANSFORMACIÓN'
                }
              </span>
              <span className="sm:hidden">
                {isDashboardButton 
                  ? isCurrentCourse 
                    ? 'ACTUAL' 
                    : 'IR AL CURSO'
                  : 'COMENZAR'
                }
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * INTEGRACIÓN BACKEND: Función para obtener los cursos del estudiante
 * 
 * Esta función debe conectarse con el endpoint del backend que retorne:
 * - Lista de cursos activos del estudiante actual
 * - Información del curso actual en progreso
 * - Metadatos de cada curso (duración, lecciones, instructor, etc.)
 * 
 * Estructura esperada de respuesta:
 * {
 *   activeCourses: [
 *     {
 *       id: string,
 *       title: string,
 *       instructor: string,
 *       image: string (URL),
 *       category: string, // 'programacion', 'idiomas', etc.
 *       type: string, // 'curso', 'desarrollo', etc.
 *       isActive: boolean,
 *       metadata: [
 *         { icon: 'reloj', text: '6 horas' },
 *         { icon: 'libro', text: '24 lecciones' },
 *         { icon: 'estudiante', text: '1,200 estudiantes' }
 *       ]
 *     }
 *   ],
 *   currentCourseId: string // ID del curso que está estudiando actualmente
 * }
 */
async function fetchCourseData() {
  try {
    // BACKEND: Reemplazar con la llamada real a la API
    // Ejemplo: const response = await fetch('/api/student/courses', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const data = await response.json();
    // return data;
    
    // Estructura temporal para desarrollo - eliminar cuando se conecte el backend
    return {
      activeCourses: [],
      currentCourseId: null
    };
  } catch (error) {
    console.error('Error al obtener cursos del estudiante:', error);
    throw error;
  }
}

/**
 * Componente principal de Mis Cursos
 * Muestra los cursos activos del estudiante
 * 
 * INTEGRACIÓN BACKEND REQUERIDA:
 * 1. Los datos vienen del contexto StudentContext (availableCourses, currentCourse)
 * 2. El contexto debe poblarse con datos del backend al cargar la aplicación
 * 3. Se necesita endpoint para obtener cursos por estudiante ID
 * 4. Se necesita endpoint para marcar curso como "actual/en progreso"
 */
export function MisCursos_Alumno_comp({ isLoading: propIsLoading, error: propError }) {
  const { selectedCourse, courses, changeCourse } = useCourse();
  
  // BACKEND: Estos datos vienen del contexto que debe ser poblado desde la API
  // availableCourses: lista de cursos disponibles para el estudiante
  // currentCourse: curso que está estudiando actualmente
  // selectCourse: función para cambiar el curso activo
  const { availableCourses, currentCourse, selectCourse, forceCompleteReset, goToStart, isVerified, hasPaid } = useStudent();
  const navigate = useNavigate();

  // BACKEND: Función para navegar al inicio forzadamente
  const handleGoToStart = () => {
    goToStart(); // Marcar como primer acceso para evitar redirección
    navigate('/alumno/?direct=true');
  };

  // BACKEND: Filtrar cursos activos - esto debería venir ya filtrado desde la API
  // pero se mantiene como validación adicional
  const activeCourses = availableCourses.filter(course => course.isActive);
  
  // BACKEND: Ordenar cursos para mostrar el curso currentCourse primero
  // El curso currentCourse se identifica comparando IDs con currentCourse del contexto
  const sortedActiveCourses = activeCourses.sort((a, b) => {
    const aIsCurrent = currentCourse && currentCourse.id === a.id;
    const bIsCurrent = currentCourse && currentCourse.id === b.id;
    
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;
    return 0;
  });

  // BACKEND: Función para seleccionar un curso y navegar al dashboard
  // Esto debería actualizar el estado en el backend marcando el curso como "actual"
  const handleCourseAction = (course) => {
    // Actualizar el contexto local
    selectCourse(course.id);
    
    // BACKEND: Aquí se debería hacer una llamada para actualizar el curso actual
    // Ejemplo: await updateCurrentCourse(course.id);
    
    // Navegar al dashboard del estudiante
    navigate('/alumno/');
  };

  // BACKEND: Estados de carga y error que vienen como props
  // Estos deberían ser manejados por el componente padre que hace la llamada a la API
  if (propIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  // BACKEND: Mostrar errores que puedan ocurrir al cargar los cursos
  if (propError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200 text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg font-medium text-red-600">Error al cargar los cursos: {propError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        
        {/* BACKEND: Botón para volver al inicio - especialmente útil cuando no ha pagado */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
          <div></div> {/* Spacer */}
          <button
            onClick={handleGoToStart}
            className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm md:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Ir al Inicio
          </button>
        </div>

        {/* Sección de cursos activos */}
        <section>
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MIS CURSOS ACTIVOS
            </h2>
          </div>
          {/* BACKEND: Renderizar cursos si existen, sino mostrar estado vacío */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {sortedActiveCourses && sortedActiveCourses.length > 0 ? (
              // BACKEND: Mapear los cursos obtenidos de la API
              sortedActiveCourses.map(course => {
                const isCurrentCourse = currentCourse && currentCourse.id === course.id;
                return (
                  <div key={course.id} className="relative h-full">
                    <CourseCard
                      course={course}
                      onAction={handleCourseAction}
                      isDashboardButton={true}
                      isCurrentCourse={isCurrentCourse}
                    />
                  </div>
                );
              })
            ) : (
              // Estado vacío: se muestra cuando el estudiante no tiene cursos asignados
              // BACKEND: Esto se mostrará cuando availableCourses.length === 0
              <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24">
                {/* Contenedor principal con diseño mejorado */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 md:p-12 lg:p-16 max-w-2xl mx-auto text-center relative overflow-hidden">
                  {/* Elementos decorativos de fondo */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-blue-100 rounded-full opacity-50"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 bg-purple-100 rounded-full opacity-50"></div>
                    <div className="absolute bottom-6 left-12 w-20 h-20 bg-pink-100 rounded-full opacity-30"></div>
                    <div className="absolute bottom-12 right-6 w-8 h-8 bg-indigo-100 rounded-full opacity-60"></div>
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="relative z-10">
                    {/* Icono principal con animación */}
                    <div className="mb-6 sm:mb-8 md:mb-10">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path>
                          </svg>
                        </div>
                        {/* Partículas flotantes */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>

                    {/* Títulos y texto */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent mb-3 sm:mb-4">
                      ¡Comienza tu aventura educativa!
                    </h3>
                    
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2 font-medium">
                      No tienes cursos activos aún
                    </p>
                    
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto">
                      Pronto tendrás acceso a cursos increíbles que transformarán tu aprendizaje.
                    </p>

                    {/* BACKEND: Botón para volver al inicio - importante para estudiantes sin pago */}
                    {(!isVerified || !hasPaid) && (
                      <div className="mb-6 sm:mb-8">
                        <button
                          onClick={() => navigate('/alumno/')}
                          className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                          </svg>
                          Volver al Inicio
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                          {!isVerified || !hasPaid ? 'Completa tu verificación de pago para acceder a los cursos' : ''}
                        </p>
                      </div>
                    )}

                    {/* Tarjetas de beneficios */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-5 border border-blue-200">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-blue-800">Aprende a tu ritmo</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 md:p-5 border border-purple-200">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-purple-800">Contenido experto</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 md:p-5 border border-pink-200">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-pink-800">Progreso rápido</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MisCursos_Alumno_comp;
