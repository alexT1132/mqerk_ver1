// src/components/MisCursos_Alumno_comp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext.jsx';
import { useStudent } from '../../context/StudentContext.jsx';

// Iconos básicos en formato SVG para la metadata de los cursos
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
 * Componente de tarjeta individual para mostrar un curso.
 * Es altamente reutilizable para cursos activos y nuevos.
 */
function CourseCard({ course, onAction, isDashboardButton, isCurrentCourse }) {
  const { title, instructor, image, metadata, category, type } = course;

  // Clase de color basada en la categoría para el badge superior
  const categoryColors = {
    'programacion': 'bg-red-500',
    'tecnologico': 'bg-blue-500',
    'psicoeducativo': 'bg-purple-500',
    'idiomas': 'bg-green-500',
    'exactas': 'bg-orange-500',
    'admision': 'bg-indigo-500', // Nueva categoría para "admisión a la preparatoria"
    'universidad': 'bg-pink-500', // Usado para el curso de universidad
  };

  const typeColors = {
    'curso': 'bg-pink-500',
    'desarrollo': 'bg-teal-500',
    // 'universidad': 'bg-yellow-500', // Ya está en categoryColors
  };

  // Determinar el color del badge superior
  const badgeColor = categoryColors[category] || typeColors[type] || 'bg-gray-500';

  // Estilos especiales para el curso actual
  const currentCourseStyles = isCurrentCourse ? {
    border: 'border-2 border-blue-300',
    shadow: 'shadow-2xl shadow-blue-500/20',
    background: 'bg-white',
    glow: 'ring-2 ring-blue-200/50'
  } : {
    border: 'border border-gray-100',
    shadow: 'shadow-xl',
    background: 'bg-white',
    glow: ''
  };

  return (
    <div className={`${currentCourseStyles.background} rounded-xl sm:rounded-2xl ${currentCourseStyles.shadow} hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${currentCourseStyles.border} ${currentCourseStyles.glow} h-full ${isCurrentCourse ? 'transform scale-105' : 'hover:scale-105'}`}>
      {/* Imagen del curso con overlay de categoría/tipo */}
      <div className="relative w-full h-32 sm:h-36 lg:h-40 bg-gray-200 flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/e0e0e0/555555?text=Curso"; }} // Placeholder en caso de error
        />
        <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeColor} shadow-md z-10 ${isCurrentCourse ? 'ring-1 ring-white/70' : ''}`}>
          {category || type} {/* Muestra categoría o tipo */}
        </div>
        {/* Efecto de resplandor muy sutil para curso actual */}
        {isCurrentCourse && (
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex-1">
          <h3 className={`text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 leading-tight truncate ${isCurrentCourse ? 'text-blue-900' : 'text-gray-800'}`} title={title}>
            {title}
          </h3>
          <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${isCurrentCourse ? 'text-blue-700' : 'text-gray-600'}`}>
            Por <span className="font-semibold">{instructor}</span>
          </p>

          {/* Metadatos del curso (duración, lecciones, etc.) */}
          <div className={`flex flex-col gap-1 text-xs mb-3 sm:mb-4 ${isCurrentCourse ? 'text-blue-600' : 'text-gray-700'}`}>
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
            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200
              ${isDashboardButton
                ? isCurrentCourse 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-green-500/30 animate-pulse' // Estilo verde con animación para curso actual
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600' // Estilo normal para "IR AL DASHBOARD"
                : 'bg-gradient-to-r from-blue-600 to-purple-600' // Estilo para "EMPIEZA TU TRANSFORMACIÓN"
              }`}
          >
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
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Función simulada para obtener datos de cursos.
 * En una aplicación real, esto sería una llamada a tu API.
 */
async function fetchCourseData() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simula un retardo de red
  return {
    activeCourses: [
      {
        id: 'active1',
        image: 'https://placehold.co/400x200/c7a2ff/333333?text=Curso+Universidad',
        title: 'Entrenamiento para el examen de admisión a la universidad',
        instructor: 'Kelvin Ramirez',
        category: 'universidad',
        metadata: [
          { icon: 'reloj', text: '8 Semanas' },
          { icon: 'libro', text: '12 Módulos' },
          { icon: 'estudiante', text: 'En curso' },
        ],
      },
      {
        id: 'active2',
        image: 'https://placehold.co/400x200/a2d4ff/333333?text=Curso+Prepa',
        title: 'Entrenamiento para el examen de admisión a la preparatoria',
        instructor: 'Kelvin Ramirez',
        category: 'admision',
        metadata: [
          { icon: 'reloj', text: '5 Semanas' },
          { icon: 'libro', text: '8 Lecciones' },
          { icon: 'estudiante', text: '25 Alumnos' },
        ],
      },
       {
        id: 'active3',
        image: 'https://placehold.co/400x200/ffd8b5/333333?text=Desbloquea+Tecno',
        title: 'DIGI-START: desbloquea tu potencial tecnológico',
        instructor: 'Alejandra Tellez',
        category: 'tecnologico',
        metadata: [
          { icon: 'reloj', text: '10 horas' },
          { icon: 'libro', text: '7 proyectos' },
          { icon: 'estudiante', text: 'Nivel: Principiante a superior' },
        ],
      },
    ],
    // 'recommendedCourses' ha sido removido
    newCourses: [], // Se mantiene vacío ya que la sección de "nuevos cursos" fue removida
  };
}

/**
 * Componente principal para la página "Mis Cursos" del alumno.
 * Muestra los cursos activos y un llamado a la acción para explorar más.
 */
export function MisCursos_Alumno_comp({ isLoading: propIsLoading, error: propError }) {
  const { selectedCourse, courses, changeCourse } = useCourse();
  const { availableCourses, currentCourse, selectCourse, forceCompleteReset, goToStart, isVerified, hasPaid } = useStudent();
  const navigate = useNavigate();

  // Debug para MisCursos
  console.log('MisCursos_Alumno_comp Debug:', {
    currentCourse: currentCourse ? currentCourse.title : 'None',
    isVerified,
    hasPaid,
    availableCoursesCount: availableCourses.length
  });

  // Usar los cursos del contexto de estudiante y ordenar para que el curso actual aparezca primero
  const activeCourses = availableCourses.filter(course => course.isActive);
  
  // Ordenar cursos: curso actual primero, luego el resto
  const sortedActiveCourses = activeCourses.sort((a, b) => {
    const aIsCurrent = currentCourse && currentCourse.id === a.id;
    const bIsCurrent = currentCourse && currentCourse.id === b.id;
    
    if (aIsCurrent && !bIsCurrent) return -1; // a va primero
    if (!aIsCurrent && bIsCurrent) return 1;  // b va primero
    return 0; // mantener orden original para el resto
  });

  // Manejador de acción para los botones de las tarjetas
  const handleCourseAction = (course) => {
    selectCourse(course.id);
    console.log('Curso seleccionado:', course.title);
    // Navegar al dashboard principal (inicio) con el curso seleccionado
    navigate('/estudiante/');
  };

  // Renderizado condicional para el estado de carga
  if (propIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  // Renderizado condicional para el estado de error
  if (propError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg font-medium text-red-600">Error al cargar los cursos: {propError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 p-3 sm:p-4 lg:p-6 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Sección de MIS CURSOS ACTIVOS */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MIS CURSOS ACTIVOS
            </h2>
          </div>
          {/* Grid responsivo inteligente */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {sortedActiveCourses && sortedActiveCourses.length > 0 ? (
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
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-lg font-medium text-gray-600">No tienes cursos activos</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MisCursos_Alumno_comp;