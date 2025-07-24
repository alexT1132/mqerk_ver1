// src/components/MisCursos_Alumno_comp.jsx
// BACKEND: Este componente maneja SOLO los cursos matriculados del estudiante
// Los datos vienen del contexto StudentContext (NO CourseContext)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext.jsx';

// Iconos para metadata de cursos - MEJORADOS PARA MÓVIL
const IconoReloj = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconoLibro = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
  </svg>
);
const IconoEstudiante = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    shadow: 'shadow-xl shadow-blue-500/20',
    background: 'bg-white',
    glow: 'ring-2 ring-blue-200/50'
  } : {
    border: 'border border-gray-200',
    shadow: 'shadow-lg',
    background: 'bg-white',
    glow: ''
  };

  return (
    <div className={`${currentCourseStyles.background} rounded-lg md:rounded-xl lg:rounded-2xl ${currentCourseStyles.shadow} hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${currentCourseStyles.border} ${currentCourseStyles.glow} 
      w-full max-w-[180px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] 2xl:max-w-[360px] 
      h-auto max-h-[300px] sm:max-h-[320px] md:max-h-[340px] lg:max-h-[420px] xl:max-h-[460px] 2xl:max-h-[500px]
      mx-auto ${isCurrentCourse ? 'transform scale-[1.01]' : 'hover:scale-[1.01]'}`}>
      {/* BACKEND: Imagen del curso - debe venir como URL desde la API */}
      <div className="relative w-full h-16 sm:h-18 md:h-20 lg:h-32 xl:h-36 2xl:h-40 bg-gray-200 flex-shrink-0">
        <img
          src={image || "https://placehold.co/400x250/e0e0e0/555555?text=Curso"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/e0e0e0/555555?text=Curso"; }}
        />
        {/* BACKEND: Badge con la categoría o tipo del curso */}
        <div className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 lg:top-3 lg:left-3 px-1.5 py-0.5 sm:px-2 lg:px-2.5 sm:py-1 rounded-full text-xs font-semibold text-white ${badgeColor} shadow-md z-10 ${isCurrentCourse ? 'ring-1 ring-white/70' : ''}`}>
          {category || type}
        </div>
        {isCurrentCourse && (
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 2xl:p-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex-1">
          {/* BACKEND: Título del curso */}
          <h3 className={`text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-xl font-bold mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2.5 leading-tight line-clamp-2 ${isCurrentCourse ? 'text-blue-900' : 'text-gray-800'}`} title={title}>
            {title}
          </h3>
          {/* BACKEND: Nombre del instructor */}
          <p className={`text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg mb-2 sm:mb-2 md:mb-2 lg:mb-3 xl:mb-3 ${isCurrentCourse ? 'text-blue-700' : 'text-gray-600'}`}>
            Por <span className="font-semibold">{instructor}</span>
          </p>

          {/* BACKEND: Metadatos del curso (duración, lecciones, estudiantes, etc.) */}
          {/* Los iconos se mapean según el campo 'icon' en cada metadata */}
          <div className={`flex flex-col gap-0.5 sm:gap-1 md:gap-1 lg:gap-1 xl:gap-1.5 text-xs sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg mb-2 sm:mb-2 md:mb-2 lg:mb-3 xl:mb-3 ${isCurrentCourse ? 'text-blue-600' : 'text-gray-700'}`}>
            {metadata.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 mr-1 sm:mr-1.5 md:mr-1.5 lg:mr-2 xl:mr-2 flex-shrink-0">
                  {item.icon === 'reloj' && <IconoReloj />}
                  {item.icon === 'libro' && <IconoLibro />}
                  {item.icon === 'estudiante' && <IconoEstudiante />}
                </div>
                <span className="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onAction(course)}
            className={`relative w-full py-1.5 sm:py-2 md:py-2.5 lg:py-2.5 xl:py-3 2xl:py-3 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 overflow-hidden
              ${isDashboardButton
                ? isCurrentCourse 
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-green-500/30 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 ring-2 ring-green-300/50' // Estilo verde mejorado para curso actual
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' // Estilo normal para "IR AL DASHBOARD"
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' // Estilo para "EMPIEZA TU TRANSFORMACIÓN"
              }`}
          >
            {/* Efecto de brillo para curso actual */}
            {isDashboardButton && isCurrentCourse && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            )}
            <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-2 xl:gap-2">
              {isDashboardButton && isCurrentCourse && (
                <svg className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              <span className="font-bold text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg leading-tight">
                {isDashboardButton 
                  ? isCurrentCourse 
                    ? 'CURSO ACTUAL' 
                    : 'IR AL DASHBOARD'
                  : 'EMPIEZA TU TRANSFORMACIÓN'
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
 * INTEGRACIÓN BACKEND: Función para obtener los cursos matriculados del estudiante
 * 
 * Esta función debe conectarse con el endpoint del backend que retorne:
 * - Lista de cursos en los que el estudiante está inscrito
 * - Información del curso actual en progreso
 * - Progreso y calificaciones de cada curso
 * 
 * Estructura esperada de respuesta:
 * {
 *   enrolledCourses: [
 *     {
 *       id: string,
 *       title: string,
 *       instructor: string,
 *       image: string (URL),
 *       category: string,
 *       type: string,
 *       isActive: boolean,
 *       enrollmentDate: string,
 *       progress: number, // 0-100
 *       lastAccessed: string,
 *       status: 'active' | 'completed' | 'paused',
 *       metadata: [
 *         { icon: 'reloj', text: 'Tiempo restante' },
 *         { icon: 'libro', text: 'Lecciones completadas' },
 *         { icon: 'estudiante', text: 'Progreso actual' }
 *       ]
 *     }
 *   ],
 *   currentCourseId: string
 * }
 */
async function fetchEnrolledCourses(studentId) {
  try {
    // BACKEND: Reemplazar con la llamada real a la API de cursos matriculados
    // Ejemplo: const response = await fetch(`/api/students/${studentId}/enrolled-courses`, {
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
      enrolledCourses: [],
      currentCourseId: null
    };
  } catch (error) {
    console.error('Error al obtener cursos matriculados:', error);
    throw error;
  }
}

/**
 * Componente principal de Mis Cursos
 * Muestra SOLO los cursos en los que el estudiante está matriculado
 * 
 * INTEGRACIÓN BACKEND REQUERIDA:
 * 1. Los datos vienen del contexto StudentContext (enrolledCourses, currentCourse)
 * 2. El contexto debe poblarse con datos del backend al cargar la aplicación
 * 3. Se necesita endpoint para obtener cursos matriculados por estudiante ID
 * 4. Se necesita endpoint para marcar curso como "actual/en progreso"
 */
function MisCursos_Alumno_comp({ isLoading: propIsLoading, error: propError }) {
  // BACKEND: Estos datos vienen del contexto StudentContext (NO CourseContext)
  // Solo se usan los cursos matriculados del estudiante
  const { 
    enrolledCourses = [], 
    currentCourse = null, 
    selectCourse = () => {}, 
    goToStart = () => {}, 
    isVerified = false, 
    hasPaid = false 
  } = useStudent() || {};
  
  const navigate = useNavigate();

  // BACKEND: Función para navegar al inicio forzadamente
  const handleGoToStart = () => {
    goToStart(); // Marcar como primer acceso para evitar redirección
    navigate('/alumno/?direct=true');
  };

  // BACKEND: Filtrar cursos activos de los matriculados
  const activeCourses = enrolledCourses.filter(course => course?.isActive && course?.status === 'active');
  
  // BACKEND: Ordenar cursos para mostrar el curso currentCourse primero
  const sortedActiveCourses = activeCourses.sort((a, b) => {
    const aIsCurrent = currentCourse?.id === a.id;
    const bIsCurrent = currentCourse?.id === b.id;
    
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;
    return 0;
  });

  // BACKEND: Función para seleccionar un curso matriculado y navegar al dashboard
  const handleCourseAction = (course) => {
    try {
      // Actualizar el contexto local
      if (selectCourse && course?.id) {
        selectCourse(course.id);
      }
      
      // BACKEND: Aquí se debería hacer una llamada para actualizar el curso actual
      // Ejemplo: await updateCurrentCourse(course.id);
      
      // Navegar al dashboard del estudiante
      navigate('/alumno/');
    } catch (error) {
      console.error('Error al seleccionar curso:', error);
    }
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
        
        {/* Sección de Encabezado - Consistente con Dashboard */}
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
            MIS CURSOS ACTIVOS
          </h2>
          <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
            <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
              Total: <span className="text-blue-600">{sortedActiveCourses?.length || 0}</span>
            </span>
          </div>
        </div>

        {/* Sección de cursos matriculados */}
        <section>
          {/* BACKEND: Renderizar cursos matriculados si existen, sino mostrar estado vacío */}
          {/* Diseño responsivo: móvil intacto, mejorado para PC */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 max-w-none auto-rows-min">
            {sortedActiveCourses && sortedActiveCourses.length > 0 ? (
              // BACKEND: Mapear los cursos matriculados obtenidos de la API
              sortedActiveCourses.map(course => {
                const isCurrentCourse = currentCourse && currentCourse.id === course.id;
                return (
                  <div key={course.id} className="relative flex justify-center">
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
              // Estado vacío: se muestra cuando el estudiante no tiene cursos matriculados
              // BACKEND: Esto se mostrará cuando enrolledCourses.length === 0
              <div className="col-span-2 sm:col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-4 2xl:col-span-4 flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24">
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
                      ¡Inscríbete en tu primer curso!
                    </h3>
                    
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2 font-medium">
                      No tienes cursos matriculados aún
                    </p>
                    
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto">
                      Explora nuestro catálogo de cursos y comienza tu transformación educativa.
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
                          {!isVerified || !hasPaid ? 'Completa tu verificación de pago para inscribirte en cursos' : ''}
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
                        <p className="text-xs sm:text-sm font-semibold text-blue-800">Cursos flexibles</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 md:p-5 border border-purple-200">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-purple-800">Instructores expertos</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 md:p-5 border border-pink-200">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-pink-800">Certificaciones</p>
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