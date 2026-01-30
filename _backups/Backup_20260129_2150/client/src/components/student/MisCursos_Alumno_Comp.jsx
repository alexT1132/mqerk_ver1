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
    programacion: 'bg-red-500',
    preparacion: 'bg-red-500',
    tecnologico: 'bg-blue-500',
    psicoeducativo: 'bg-purple-500',
    idiomas: 'bg-green-500',
    exactas: 'bg-orange-500',
    admision: 'bg-indigo-500',
    universidad: 'bg-pink-500',
  };

  // BACKEND: Colores alternativos por tipo de curso
  const typeColors = {
    'curso': 'bg-pink-500',
    'desarrollo': 'bg-teal-500',
  };

  const badgeColor = categoryColors[category] || typeColors[type] || 'bg-gray-500';

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
        {(() => {
          // Validar que la imagen sea una URL válida antes de intentar cargarla
          const isValidImage = image && (
            image.startsWith('http://') ||
            image.startsWith('https://') ||
            image.startsWith('/') ||
            image.startsWith('data:')
          );
          const defaultImage = "https://placehold.co/400x250/e0e0e0/555555?text=Curso";
          const imageSrc = isValidImage ? image : defaultImage;

          return (
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              loading={isCurrentCourse ? "eager" : "lazy"}
              decoding="async"
              width={640}
              height={360}
              fetchPriority={isCurrentCourse ? "high" : "low"}
              onError={(e) => {
                // Evitar loops infinitos de errores
                if (e.target.src !== defaultImage) {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }
              }}
            />
          );
        })()}
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
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 mr-2 sm:mr-2 md:mr-2 lg:mr-2.5 xl:mr-3 flex-shrink-0">
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
    selectCourse = () => { }
  } = useStudent() || {};

  // Fallback inmediato para resaltar el curso seleccionado incluso tras un refresh
  const currentCourseId = React.useMemo(() => {
    if (currentCourse?.id) return currentCourse.id;
    try {
      const raw = localStorage.getItem('currentCourse');
      if (!raw || raw === 'null' || raw === 'undefined') return null;
      const obj = JSON.parse(raw);
      return obj?.id || null;
    } catch { return null; }
  }, [currentCourse?.id]);

  const navigate = useNavigate();

  // BACKEND: Filtrar cursos activos de los matriculados
  const activeCourses = enrolledCourses.filter(course => course?.isActive && course?.status === 'active');

  // BACKEND: Ordenar cursos para mostrar el curso currentCourse primero
  const sortedActiveCourses = React.useMemo(() => {
    return [...activeCourses].sort((a, b) => {
      const aIsCurrent = currentCourseId === a.id;
      const bIsCurrent = currentCourseId === b.id;

      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      return 0;
    });
  }, [activeCourses, currentCourseId]);

  // Paginación simple para grandes cantidades (hasta 20+)
  const PAGE_SIZE = 8; // 2x4 o 4x2 en md+
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedActiveCourses.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sortedActiveCourses.slice(start, start + PAGE_SIZE);
  React.useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  // Estado local para forzar re-render cuando cambia el curso
  const [selectedCourseId, setSelectedCourseId] = React.useState(currentCourseId);

  // Sincronizar estado local con el contexto
  React.useEffect(() => {
    setSelectedCourseId(currentCourseId);
  }, [currentCourseId]);

  // BACKEND: Función para seleccionar/cambiar un curso matriculado
  // Si ya hay un curso seleccionado, solo lo cambiamos sin navegar
  // Si no hay curso, seleccionamos y navegamos al dashboard
  const handleCourseAction = (course) => {
    try {
      // Actualizar el contexto local (cambiar curso si ya hay uno, o seleccionar si no hay)
      if (selectCourse && course?.id) {
        selectCourse(course.id);
        // Actualizar estado local inmediatamente para feedback visual
        setSelectedCourseId(course.id);
        // Guardar en localStorage para persistencia
        try {
          localStorage.setItem('currentCourse', JSON.stringify({ id: course.id, title: course.title }));
        } catch (e) {
          console.warn('No se pudo guardar en localStorage:', e);
        }
        console.log('✅ Curso seleccionado/cambiado:', course.title);
      }

      // BACKEND: Aquí se debería hacer una llamada para actualizar el curso actual
      // Ejemplo: await updateCurrentCourse(course.id);

      // Solo navegar al dashboard si no hay curso seleccionado actualmente
      // Si ya hay un curso, solo lo cambiamos sin redirigir
      if (!currentCourse) {
        navigate('/alumno/');
      }
      // Si ya había un curso seleccionado, solo lo cambiamos (permanecemos en /alumno/cursos)
    } catch (error) {
      console.error('Error al seleccionar/cambiar curso:', error);
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
    <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 pt-9 pb-6 sm:py-4 md:py-6 lg:py-8 font-inter text-gray-800">

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">

        {/* Sección de Encabezado - Consistente con Dashboard */}
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-8 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight text-center md:text-left font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
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
          {(() => {
            const count = pageItems?.length || 0;
            // Columnas dinámicas según la cantidad para evitar columnas vacías y centrar mejor
            // Si hay muchos elementos (>=8) usamos más columnas en md para densidad
            let gridCols = count >= 8
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4';
            if (count <= 1) gridCols = 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1';
            else if (count === 2) gridCols = 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2';
            else if (count === 3) gridCols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3';
            // Usar grid normal en móvil para mejor layout, inline-grid en desktop
            const base = `grid ${gridCols} gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 auto-rows-min`;
            return (
              <div className={`${base} w-full justify-items-center sm:justify-items-start`}>
                {pageItems && pageItems.length > 0 ? (
                  // BACKEND: Mapear los cursos matriculados obtenidos de la API
                  pageItems.map(course => {
                    // Usar estado local para feedback visual inmediato
                    const isCurrentCourse = selectedCourseId === course.id || currentCourseId === course.id;
                    return (
                      <div key={course.id} className="relative flex justify-center w-full">
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
                  <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
                    <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto border border-gray-200 shadow-lg">
                      {/* Icono simple */}
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path>
                        </svg>
                      </div>

                      {/* Texto simple */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-3">
                        No tienes cursos matriculados
                      </h3>

                      <p className="text-gray-500 mb-6">
                        Una vez que te matricules en un curso, aparecerá aquí para que puedas acceder fácilmente.
                      </p>

                      {/* Botón para ir al dashboard/inicio */}
                      <button
                        onClick={() => navigate('/alumno/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        Ir al Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="text-sm font-medium text-gray-600">
                Página <span className="text-gray-900">{page}</span> de <span className="text-gray-900">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}

export default MisCursos_Alumno_comp;