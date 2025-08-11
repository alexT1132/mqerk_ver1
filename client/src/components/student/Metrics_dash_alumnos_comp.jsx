import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCourse } from '../../context/CourseContext.jsx';
// Importaciones de Recharts para gráficos
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// Importaciones de Material UI Charts
import { BarChart as MUIBarChart } from '@mui/x-charts/BarChart';



// Importa la imagen de perfil (reemplazada con un placeholder)
// Nota: Las importaciones de archivos locales como './assets/reese.jfif' no son compatibles directamente en este entorno.
// Se ha reemplazado con una URL de placeholder.
const reeseProfilePic = "https://placehold.co/128x128/A0AEC0/FFFFFF?text=Foto";

// --- CONSTANTES ---
// Datos de usuario por defecto
const DEFAULT_USER_DATA = {
  name: "Mari Lu Rodríguez Marquez",
  email: "XXXXXXXXXXXXX@gmail.com",
  telefono: "",
  comunidad: "",
  telTutor: "",
  nombreTutor: "",
  activeCourse: "XXXXXXXXX",
  currentBachillerato: "XXXXXXXXXXXXX",
  academy: "MQerK Academy",
  universityOption: "XXXXXXXXX",
  licenciaturaOption: "XXXXXXXXX",
  advisor: "L.C.Q Kelvin Valentin Gomez Ramirez",
  group: "xXXXX",
  folio: "MEEAU25-0001",
  profilePic: reeseProfilePic,
};

// Datos de métricas por defecto - Más realistas y variados
const DEFAULT_METRICS_DATA = {
  // Métricas de la fila superior - Datos más realistas
  attendance: 78,
  activities: { current: 18, total: 24 },
  quiz: { current: 14, total: 18 },
  monthlyAverage: 82,
  academicStatus: { level: 'A', color: 'yellow', description: 'Activo' },

  // Datos para el gráfico de Material UI - Promedio mensual de los últimos 12 meses
  monthlyAverageData: [
    { month: 'Ene', promedio: 75 },
    { month: 'Feb', promedio: 78 },
    { month: 'Mar', promedio: 72 },
    { month: 'Abr', promedio: 80 },
    { month: 'May', promedio: 85 },
    { month: 'Jun', promedio: 88 },
    { month: 'Jul', promedio: 82 },
    { month: 'Ago', promedio: 79 },
    { month: 'Sep', promedio: 83 },
    { month: 'Oct', promedio: 86 },
    { month: 'Nov', promedio: 90 },
    { month: 'Dic', promedio: 87 }
  ],

  // Datos para gráficos y otras métricas de la fila inferior
  // Datos extendidos a 8 meses para el gráfico de Actividades/Quizts
  activityProgress: [
    { period: 'Ene', activities: 65, quizts: 58 },
    { period: 'Feb', activities: 72, quizts: 68 },
    { period: 'Mar', activities: 78, quizts: 71 },
    { period: 'Abr', activities: 85, quizts: 79 },
    { period: 'May', activities: 88, quizts: 82 },
    { period: 'Jun', activities: 91, quizts: 85 },
    { period: 'Jul', activities: 89, quizts: 87 },
    { period: 'Ago', activities: 93, quizts: 89 },
  ],
  subjectResults: {
    total: 70, // Puntuación total del simulador como en la imagen
    subjects: [
      { code: 'E/R', percent: 18, color: '#8B5CF6', fullName: 'Español y redacción indirecta' },
      { code: 'M/A', percent: 12, color: '#EC4899', fullName: 'Matemáticas y pensamiento analítico' },
      { code: 'HT', percent: 15, color: '#F59E0B', fullName: 'Habilidades transversales' },
      { code: 'LE', percent: 15, color: '#6366F1', fullName: 'Lengua extranjera' },
      { code: 'ME', percent: 10, color: '#7C3AED', fullName: 'Módulos específicos' },
    ]
  },
  // Datos más realistas para las barras horizontales de resultados del simulador
  simulatorGrades: [
    { label: '1ero', score: 70, color: '#EC4899' }, // Rosa/Magenta
    { label: '2do', score: 60, color: '#8B5CF6' }, // Púrpura
    { label: '3ero', score: 40, color: '#6366F1' }, // Azul
    { label: '4to', score: 30, color: '#A855F7' }, // Púrpura claro
  ],
  feedbackScore: 82,
  // Mensajes motivacionales más variados y realistas
  motivationalMessages: [
    "¡EXCELENTE PROGRESO!",
    "¡VAS MUY BIEN!",
    "¡SIGUE MEJORANDO!",
    "¡ESTÁS EN EL CAMINO CORRECTO!",
    "¡TU ESFUERZO SE NOTA!",
    "¡CADA DÍA MEJOR!",
    "¡NO TE RINDAS!"
  ]
};

/**
 * Función para obtener mensaje motivacional basado en el puntaje de feedback.
 * @param {number} score - Puntaje del feedback (0-100).
 * @returns {object} - Objeto con mensaje, emoji y estilo.
 */
const getMotivationalFeedback = (score) => {
  if (score >= 90) {
    return {
      message: "¡EXCELENTE TRABAJO!",
      emoji: "🏆",
      style: "text-green-600 bg-green-50 border-green-200",
      description: "Tu rendimiento es sobresaliente, ¡sigue así!",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 80) {
    return {
      message: "¡LO ESTÁS LOGRANDO!",
      emoji: "😊",
      style: "text-green-600 bg-green-50 border-green-200",
      description: "Muy buen progreso, estás en el camino correcto",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 70) {
    return {
      message: "¡VAS MUY BIEN!",
      emoji: "�",
      style: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Buen trabajo, continúa esforzándote",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 60) {
    return {
      message: "¡SIGUE ADELANTE!",
      emoji: "�",
      style: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Estás mejorando, no te rindas",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 50) {
    return {
      message: "¡PUEDES MEJORAR!",
      emoji: "�",
      style: "text-red-600 bg-red-50 border-red-200",
      description: "Necesitas un poco más de esfuerzo",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else {
    return {
      message: "¡NO TE RINDAS!",
      emoji: "�",
      style: "text-red-600 bg-red-50 border-red-200",
      description: "Es momento de esforzarse más",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  }
};

/**
 * Función auxiliar para obtener un mensaje motivacional aleatorio (legacy).
 * @param {string[]} messages - Array de mensajes motivacionales.
 * @returns {string} Un mensaje motivacional seleccionado aleatoriamente.
 */
const getRandomMotivationalMessage = (messages) => {
  if (!messages || messages.length === 0) {
    return "¡Sigue adelante!"; // Mensaje de reserva
  }
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Genera mensajes de recomendación dinámicos y materias a reforzar
 * basados en la puntuación del simulador y los datos de las materias.
 * @param {number} score - La puntuación del simulador (0-100).
 * @param {Object[]} allSubjectsData - Array de objetos de materias del simulador.
 * @returns {{subjects: string[], message: string}} Un objeto con las materias a reforzar y un mensaje de recomendación.
 */
const getSimulatorRecommendation = (score, allSubjectsData) => {
  let subjectsToReinforce = [];
  let message = '';

  // Ordenar materias por porcentaje en orden ascendente para identificar las de menor rendimiento
  const sortedSubjects = [...allSubjectsData].sort((a, b) => a.percent - b.percent);

  if (score < 50) {
    // Si la puntuación es baja, reforzar las 2-3 materias con menor porcentaje
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 3)).map(s => s.fullName || s.code);
    message = 'Es crucial que dediques más tiempo al estudio diario. Busca apoyo adicional y no dudes en preguntar.';
  } else if (score >= 50 && score < 70) {
    // Si la puntuación es media, reforzar la materia con menor porcentaje
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 2)).map(s => s.fullName || s.code);
    message = 'Estás progresando, pero hay áreas clave que necesitan más atención. La constancia es tu mejor aliada.';
  } else if (score >= 70 && score < 90) {
    // Si la puntuación es buena, quizás solo una materia o un consejo general
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 1)).map(s => s.fullName || s.code);
    message = '¡Excelente progreso! Sigue manteniendo tu ritmo de estudio y enfócate en tus áreas de oportunidad.';
  } else { // score >= 90
    // Si la puntuación es sobresaliente, no hay materias específicas a reforzar
    subjectsToReinforce = [];
    message = '¡Felicidades, tu desempeño es sobresaliente! Continúa desafiándote y explorando nuevos temas.';
  }

  // Si no se identificaron materias específicas, pero el score no es perfecto, dar un consejo general.
  if (subjectsToReinforce.length === 0 && score < 100) {
    subjectsToReinforce.push('Revisa tus áreas de oportunidad');
  } else if (subjectsToReinforce.length === 0 && score === 100) {
    subjectsToReinforce.push('Mantén tu excelente nivel');
  }

  return { subjects: subjectsToReinforce, message };
};

/**
 * Función para determinar el estado académico basado en métricas
 * @param {Object} metrics - Objeto con las métricas del estudiante
 * @returns {Object} Estado académico con nivel y descripción
 */
const calculateAcademicStatus = (metrics) => {
  const { attendance, monthlyAverage, activities, quiz } = metrics;
  
  // Calcular promedio ponderado
  const activityProgress = (activities.current / activities.total) * 100;
  const quizProgress = (quiz.current / quiz.total) * 100;
  
  // Promedio general considerando todas las métricas
  const overallScore = (attendance * 0.2 + monthlyAverage * 0.4 + activityProgress * 0.2 + quizProgress * 0.2);
  
  if (overallScore >= 85) {
    return { level: 'D', color: 'green', description: 'Destacado', score: overallScore };
  } else if (overallScore >= 65) {
    return { level: 'A', color: 'yellow', description: 'Activo', score: overallScore };
  } else {
    return { level: 'R', color: 'red', description: 'Riesgo', score: overallScore };
  }
};

/**
 * Función para obtener frases motivacionales basadas en el estado académico
 * @param {Object} academicStatus - Estado académico del estudiante
 * @returns {string} Frase motivacional personalizada
 */
const getAcademicMotivationalPhrase = (academicStatus) => {
  const riesgoFrases = [
    "Cada día es una nueva oportunidad para mejorar. ¡No te rindas, tu esfuerzo vale la pena!",
    "Los grandes logros requieren tiempo y dedicación. Estás construyendo tu futuro paso a paso.",
    "Recuerda: no importa qué tan lento vayas, siempre que no te detengas.",
    "Tu potencial es ilimitado. Solo necesitas encontrar la estrategia de estudio que funcione para ti.",
    "Estudia todos los días un poco, no todo en un solo día: la constancia vence al cansancio.",
    "Cada pregunta que resuelves te acerca más a tus metas. ¡Sigue adelante!",
    "No hay fracasos, solo oportunidades para aprender y crecer. ¡Tú puedes lograrlo!",
    "El éxito no es la ausencia de fracaso, sino la persistencia a través de él."
  ];

  const activoFrases = [
    "¡Vas por buen camino! Tu dedicación está dando frutos. Mantén ese ritmo.",
    "El conocimiento que adquieres hoy será tu fortaleza mañana. ¡Sigue construyendo!",
    "Tu consistencia es admirable. Cada día de estudio te acerca más a tus objetivos.",
    "Estás demostrando que la disciplina y el esfuerzo siempre dan resultados positivos.",
    "¡Excelente progreso! Tu futuro yo te agradecerá todo el esfuerzo que estás poniendo ahora.",
    "La educación es el arma más poderosa para cambiar el mundo. ¡Tú la tienes en tus manos!",
    "Cada tema que dominas es una victoria personal. ¡Celebra tus logros y sigue avanzando!",
    "Tu mentalidad de crecimiento te llevará lejos. ¡El éxito está cada vez más cerca!"
  ];

  const destacadoFrases = [
    "¡Eres una inspiración! Tu dedicación académica es un ejemplo para otros.",
    "La excelencia no es un acto, sino un hábito. Y tú lo has desarrollado perfectamente.",
    "Tu rendimiento excepcional demuestra que cuando hay pasión, no hay límites.",
    "¡Felicidades! Estás escribiendo una historia de éxito con cada logro académico.",
    "Tu disciplina y constancia te han llevado a la cima. ¡Sigue brillando!",
    "Eres la prueba viviente de que el trabajo arduo y la dedicación siempre triunfan.",
    "Tu excelencia académica es el reflejo de tu carácter excepcional. ¡Admirable!",
    "No solo estás aprendiendo, estás dominando. ¡Tu futuro es extraordinario!"
  ];

  let frases = [];
  
  switch (academicStatus.level) {
    case 'R': // Riesgo
      frases = riesgoFrases;
      break;
    case 'A': // Activo
      frases = activoFrases;
      break;
    case 'D': // Destacado
      frases = destacadoFrases;
      break;
    default:
      frases = activoFrases;
  }

  // Seleccionar una frase aleatoria del array correspondiente
  return frases[Math.floor(Math.random() * frases.length)];
};

/**
 * Componente Modal para mostrar gráficos en una vista más grande.
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla la visibilidad de la modal.
 * @param {function} props.onClose - Función a llamar cuando se cierra la modal.
 * @param {string} props.title - Título de la modal.
 * @param {React.ReactNode} props.children - Contenido a mostrar dentro de la modal.
 */
const ChartModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] relative flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200"
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente AlumnoDashboardMetrics
 * Muestra las métricas y el resumen del dashboard del alumno.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} [props.userData] - Datos de usuario opcionales para sobrescribir los valores por defecto.
 * @param {Object} [props.metricsData] - Datos de métricas opcionales para sobrescribir los valores por defecto.
 * @param {boolean} [props.isLoading=false] - Bandera para mostrar un estado de carga.
 * @param {string|null} [props.error=null] - Mensaje de error a mostrar si la carga de datos falla.
 */
export function AlumnoDashboardMetrics({ userData, metricsData, isLoading = false, error = null, showMetrics = false }) {
  const { selectedCourse } = useCourse();
  const { alumno } = useAuth();

  // Helper to build absolute URL for stored photos
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const apiUrl = (import.meta?.env?.VITE_API_URL) || `http://${host}:1002/api`;
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
  const buildStaticUrl = (p) => {
    if (!p) return reeseProfilePic;
    if (/^https?:\/\//i.test(p)) return p;
    return `${apiOrigin}${p.startsWith('/') ? '' : '/'}${p}`;
  };

  // Map alumno from AuthContext into userData shape
  const alumnoUserData = alumno ? {
    name: `${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || DEFAULT_USER_DATA.name,
    email: alumno.email || DEFAULT_USER_DATA.email,
    telefono: alumno.telefono || '',
    comunidad: alumno.comunidad1 || '',
    telTutor: alumno.tel_tutor || '',
    nombreTutor: alumno.nombre_tutor || '',
    folio: alumno.folio || DEFAULT_USER_DATA.folio,
    profilePic: buildStaticUrl(alumno.foto) || DEFAULT_USER_DATA.profilePic,
  } : {};

  // Fusionar los datos proporcionados con los datos por defecto
  const mergedMetricsData = { ...DEFAULT_METRICS_DATA, ...metricsData };

  // Si hay un curso seleccionado, usar sus datos simulados para métricas
  const currentMetricsData = selectedCourse?.metricas
    ? {
        ...mergedMetricsData,
        monthlyAverage: selectedCourse.metricas.promedio || mergedMetricsData.monthlyAverage,
        // Calcular progreso de actividades basado en el avance del curso
        activities: {
          ...mergedMetricsData.activities,
          current: Math.floor((parseInt(selectedCourse.metricas.avance) / 100) * mergedMetricsData.activities.total)
        }
      }
    : mergedMetricsData;

  // Calcular el estado académico dinámicamente
  const calculatedAcademicStatus = calculateAcademicStatus(currentMetricsData);
  currentMetricsData.academicStatus = calculatedAcademicStatus;

  // Fusiona: defaults <- alumno (Auth) <- props (override)
  const currentUserData = { ...DEFAULT_USER_DATA, ...alumnoUserData, ...userData };

  const buildCourseCode = () => 'MEEAU';
  const onlyDigits = (v) => typeof v === 'string' ? /^\d+$/.test(v) : (typeof v === 'number' && Number.isFinite(v));
  const seqNum = onlyDigits(currentUserData.folio) ? parseInt(currentUserData.folio, 10) : null;
  const yy = String((alumno?.anio && Number(alumno?.anio)) ? Number(alumno.anio) : new Date().getFullYear()).slice(-2);
  const displayFolio = seqNum != null
    ? `${buildCourseCode()}${yy}-${String(seqNum).padStart(4, '0')}`
    : currentUserData.folio;

  // Si solo queremos mostrar foto + nombre + datos personales, salimos temprano
  if (!showMetrics) {
    return (
      <div className="w-full font-inter text-gray-800">

        {/* Sección de Encabezado del Dashboard */}
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
            DASHBOARD
          </h2>
          <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
            <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
              Folio: <span className="text-blue-600">{displayFolio}</span>
            </span>
          </div>
        </div>

        {/* Sección de Información del Usuario (solo datos personales) */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 hover:shadow-3xl transition-all duration-150">

          {/* Columna izquierda: Foto de perfil y nombre */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <img
                src={currentUserData.profilePic}
                alt={currentUserData.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-150 hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = reeseProfilePic; }}
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <div className="text-center bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100">
              <p className="text-lg font-bold text-gray-900 mb-1">{currentUserData.name}</p>
              <div className="flex items-center justify-center text-xs text-green-600 font-medium">
                <div className="w-1.5 h-1.5 bg-green-40-0 rounded-full mr-2 animate-pulse"></div>
                Estudiante Activo
              </div>
            </div>
          </div>

          {/* Columnas derechas para detalles de datos personales */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-lg">
                <h3 className="text-lg font-bold text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  DATOS PERSONALES
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Correo */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Correo electrónico</p>
                      <p className="text-sm font-bold text-gray-800 break-all">{currentUserData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Teléfono estudiante */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.telefono || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Municipio / Comunidad */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.comunidad || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Teléfono tutor */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.telTutor || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Nombre tutor */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1 sm:col-span-2">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nombre de mi tutor</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.nombreTutor || '—'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado para controlar la visibilidad de la modal del gráfico de actividades
  const [isActivitiesChartModalOpen, setIsActivitiesChartModalOpen] = useState(false);
  
  // Estado para controlar la modal del gráfico de promedio mensual con Material UI
  const [isMonthlyAverageModalOpen, setIsMonthlyAverageModalOpen] = useState(false);
  
  // Estado para controlar la modal del gráfico de resultados por materia
  const [isSubjectResultsModalOpen, setIsSubjectResultsModalOpen] = useState(false);

  // Estados para tooltips personalizados
  const [tooltipData, setTooltipData] = useState({ 
    isVisible: false, 
    title: '', 
    description: '', 
    position: { x: 0, y: 0 } 
  });

  // Función para mostrar tooltip personalizado
  const showTooltip = (e, title, description) => {
    // Usar clientX/clientY para elementos SVG y convertir a coordenadas de página
    const rect = e.target.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    setTooltipData({
      isVisible: true,
      title,
      description,
      position: { 
        x: e.clientX + scrollLeft + 10, 
        y: e.clientY + scrollTop - 10 
      }
    });
  };

  // Función para ocultar tooltip
  const hideTooltip = () => {
    setTooltipData(prev => ({ ...prev, isVisible: false }));
  };

  // Prepara los datos para el PieChart de Recharts
  const pieChartData = (() => {
    const subjects = currentMetricsData.subjectResults.subjects;
    const totalPercent = subjects.reduce((sum, subject) => sum + subject.percent, 0);
    
    return subjects.map((subject, index) => {
      const normalizedPercent = (subject.percent / totalPercent) * 100;
      return {
        name: subject.fullName,
        value: normalizedPercent, // Usar porcentaje normalizado para el gráfico
        originalPercent: subject.percent, // Mantener el porcentaje original para mostrar
        code: subject.code,
        color: subject.color,
      };
    });
  })();

  // Obtiene recomendaciones dinámicas basadas en la puntuación total del simulador
  const { subjects: recommendedSubjects, message: recommendationMessage } = getSimulatorRecommendation(
    currentMetricsData.subjectResults.total,
    currentMetricsData.subjectResults.subjects // Pasa los datos completos de las materias
  );

  // Custom Tooltip mejorado para el PieChart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 relative z-[9999] backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: data.color }}
            ></div>
            <div>
              <p className="font-bold text-sm text-gray-100">{data.name}</p>
              <p className="text-xl font-black" style={{ color: data.color }}>
                {data.originalPercent}%
              </p>
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip para gráficos de barras
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-4 rounded-xl shadow-2xl border border-blue-400 relative z-[9999] backdrop-blur-sm">
          <p className="font-bold text-blue-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium text-gray-200">{entry.dataKey}:</span>
              <span className="font-bold text-lg" style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </div>
          ))}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-800"></div>
        </div>
      );
    }
    return null;
  };

  // Componente de Tooltip personalizado para usar con onMouseEnter/onMouseLeave
  const CustomHoverTooltip = ({ title, description, isVisible, position = { x: 0, y: 0 } }) => {
    if (!isVisible) return null;
    
    // Calcular posición inteligente para evitar que se salga de la pantalla
    const tooltipWidth = 280;
    const tooltipHeight = 80;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let adjustedX = position.x;
    let adjustedY = position.y;
    
    // Ajustar horizontalmente si se sale por la derecha
    if (position.x + tooltipWidth > windowWidth) {
      adjustedX = position.x - tooltipWidth - 20;
    }
    
    // Ajustar verticalmente si se sale por arriba
    if (position.y - tooltipHeight < 0) {
      adjustedY = position.y + 20;
    }
    
    return (
      <div 
        className="fixed bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 text-white p-3 rounded-xl shadow-2xl border border-purple-400 z-[10000] backdrop-blur-sm transition-all duration-200 pointer-events-none"
        style={{ 
          left: adjustedX, 
          top: adjustedY,
          maxWidth: '280px'
        }}
      >
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-1 flex-shrink-0"></div>
          <div>
            <p className="font-bold text-purple-200 mb-1 text-sm">{title}</p>
            <p className="text-xs text-gray-200 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  // Custom Label para el PieChart (muestra la abreviación)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // Mantiene las etiquetas dentro del arco
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white" // Asegura el color blanco para las etiquetas dentro de los segmentos
        textAnchor="middle" // Centra el texto dentro del segmento
        dominantBaseline="middle" // Centra el texto verticalmente
        fontSize="8px" // Tamaño de fuente ligeramente más pequeño para intentar que quepa
        fontWeight="bold" // Texto en negrita
      >
        {pieChartData[index].code} {/* Muestra la abreviación */}
      </text>
    );
  };


  // --- Renderizado Condicional: Estado de Carga ---
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Renderizado Condicional: Estado de Error ---
  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-600 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Error al cargar el dashboard: {error}</p>
        </div>
      </div>
    );
  }

  // Estado para el perfil de testing seleccionado - cambiar a 'activo' por defecto
  const [selectedProfile, setSelectedProfile] = useState('activo');

  // Aplicar el perfil seleccionado a las métricas si estamos en modo testing
  const finalMetricsData = { 
    ...currentMetricsData, 
    ...STUDENT_PROFILES[selectedProfile]
  };

  // Recalcular el estado académico con el perfil actual
  const finalAcademicStatus = calculateAcademicStatus(finalMetricsData);
  finalMetricsData.academicStatus = finalAcademicStatus;

  // Eliminar contenedor principal para mejor integración - solo contenido directo
  return (
    <div className="w-full font-inter text-gray-800">

      {/* Sección de Encabezado del Dashboard */}
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
          DASHBOARD
        </h2>
        <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
          <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
            Folio: <span className="text-blue-600">{currentUserData.folio}</span>
          </span>
        </div>
      </div>

      {/* Sección de Información del Usuario */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 hover:shadow-3xl transition-all duration-150">

        {/* Columna izquierda: Foto de perfil y nombre */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <img
              src={currentUserData.profilePic}
              alt={currentUserData.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-150 hover:scale-105"
              // Fallback para errores de carga de imagen
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/128x128/A0AEC0/FFFFFF?text=Foto"; }}
            />
            {/* Indicador de estado activo */}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          <div className="text-center bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100">
            <p className="text-lg font-bold text-gray-900 mb-1">{currentUserData.name}</p>
            <div className="flex items-center justify-center text-xs text-green-600 font-medium">
              <div className="w-1.5 h-1.5 bg-green-40-0 rounded-full mr-2 animate-pulse"></div>
              Estudiante Activo
            </div>
          </div>
        </div>

        {/* Columnas derechas para detalles de datos personales */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-lg">
              <h3 className="text-lg font-bold text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                DATOS PERSONALES
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Tarjeta de Correo Electrónico */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Correo electrónico</p>
                    <p className="text-sm font-bold text-gray-800 break-all">{currentUserData.email}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Número de Teléfono del Estudiante */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                    <p className="text-sm font-bold text-gray-800">5512345678</p> {/* Hardcoded for example */}
                  </div>
                </div>
              </div>

              {/* Tarjeta de Municipio o Comunidad */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                    <p className="text-sm font-bold text-gray-800">Ciudad de México</p> {/* Hardcoded for example */}
                  </div>
                </div>
              </div>

              {/* Tarjeta de Número de Teléfono del Tutor */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">5587654321</p> {/* Hardcoded for example */}
                  </div>
                </div>
              </div>

              {/* Tarjeta de Nombre del Tutor */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nombre de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">María Fernández</p> {/* Hardcoded for example */}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Controles de Testing - Solo para desarrollo */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Testing - Cambiar perfil:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedProfile('riesgo')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedProfile === 'riesgo' 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
              }`}
            >
              Riesgo
            </button>
            <button
              onClick={() => setSelectedProfile('activo')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedProfile === 'activo' 
                  ? 'bg-yellow-500 text-white shadow-md' 
                  : 'bg-white text-yellow-600 border border-yellow-500 hover:bg-yellow-50'
              }`}
            >
              Activo
            </button>
            <button
              onClick={() => setSelectedProfile('destacado')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedProfile === 'destacado' 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'bg-white text-green-600 border border-green-500 hover:bg-green-50'
              }`}
            >
              Destacado
            </button>
          </div>
          <span className="text-xs text-gray-500">
            Estado actual: <span className={`font-bold ${
              finalAcademicStatus.level === 'R' ? 'text-red-500' : 
              finalAcademicStatus.level === 'A' ? 'text-yellow-500' : 
              'text-green-500'
            }`}>
              {finalAcademicStatus.description} ({Math.round(finalAcademicStatus.score)}%)
            </span>
          </span>
        </div>
      </div>

      {/* Sección "TU STATUS MENSUAL" */}
      <div className="text-center mb-6 mt-8">
        <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
          <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TU STATUS MENSUAL
          </h2>
        </div>
      </div>

      {/* Primera fila de métricas (5 columnas) - Diseño MÁS GRANDE y premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-16 max-w-8xl mx-auto">

        {/* Métrica de Asistencia - Mismo estilo que las otras tarjetas */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-150" title="Porcentaje de días asistidos en el mes actual">
          <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
            {/* Tarjeta principal con mismo estilo que las demás */}
            <div className="relative w-40 h-40 bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-150 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-blue-200 p-4">
              
              {/* Icono en la parte superior */}
              <div className="w-10 h-10 text-blue-500 mb-3">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              
              {/* Información principal - Porcentaje grande */}
              <div className="text-center mb-3">
                <div className="text-2xl font-black text-blue-600 mb-1">
                  {finalMetricsData.attendance}%
                </div>
                <div className="text-sm text-blue-500 font-bold">
                  {Math.round(finalMetricsData.attendance * 0.28)} de 28 días
                </div>
              </div>
              
              {/* Barra de progreso horizontal */}
              <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${finalMetricsData.attendance}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Título */}
          <h3 className="text-gray-700 font-bold text-lg mb-2">
            Asistencia
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Este mes
          </p>
        </div>

        {/* Métrica de Actividades - Card mejorado con hover unificado */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-150" title="Progreso en actividades del curso actual">
          <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
            {/* Card principal */}
            <div className="relative w-40 h-40 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-150 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-orange-200 p-4">
              {/* Header con icono */}
              <div className="w-10 h-10 text-orange-500 mb-3">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              {/* Progreso principal */}
              <div className="text-center mb-3">
                <div className="text-xl font-black text-orange-600 mb-1">
                  {finalMetricsData.activities.current}/{finalMetricsData.activities.total}
                </div>
                <div className="text-sm text-orange-500 font-bold">
                  {Math.round((finalMetricsData.activities.current / finalMetricsData.activities.total) * 100)}%
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${(finalMetricsData.activities.current / finalMetricsData.activities.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Título */}
          <h3 className="text-gray-700 font-bold text-lg mb-2">
            Actividades
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Curso actual
          </p>
        </div>

        {/* Métrica de Quiz - Diseño mejorado y contenido visible */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-150" title="Porcentaje de quizzes aprobados">
          <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
            {/* Card principal */}
            <div className="relative w-40 h-40 bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-100 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-emerald-200 p-4">
              
              {/* Icono */}
              <div className="w-10 h-10 text-emerald-600 mb-3">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              
              {/* Datos principales */}
              <div className="text-emerald-700 text-center">
                <div className="text-2xl font-black mb-1">
                  {Math.round((finalMetricsData.quiz.current / finalMetricsData.quiz.total) * 100)}%
                </div>
                <div className="text-sm font-bold">
                  {finalMetricsData.quiz.current} de {finalMetricsData.quiz.total}
                </div>
                <div className="text-xs mt-1">
                  aprobados
                </div>
              </div>
            </div>
          </div>
          {/* Título */}
          <h3 className="text-gray-700 font-bold text-lg mb-2">
            Quiz
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Evaluaciones
          </p>
        </div>

        {/* Métrica de Promedio Mensual - Con clic para abrir modal de Material UI */}
        <div 
          className="flex flex-col items-center group cursor-pointer transition-all duration-150" 
          title="Haz clic para ver el gráfico detallado de tu promedio mensual"
          onClick={() => setIsMonthlyAverageModalOpen(true)}
        >
          <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
            {/* Contenedor del gráfico visual */}
            <div className="relative w-40 h-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 p-4 flex flex-col items-center justify-center group-hover:shadow-2xl transition-shadow duration-300">
              
              {/* Header del gráfico */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 text-blue-500 mr-2">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <span className="text-2xl font-black text-blue-600">
                  {finalMetricsData.monthlyAverage}%
                </span>
              </div>
              
              {/* Gráfico de barras simplificado */}
              <div className="flex items-end justify-center space-x-1 h-12 mb-2">
                {[65, 72, 78, 85, finalMetricsData.monthlyAverage].map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-3 bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-sm"
                      style={{ height: `${(value / 100) * 40}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Indicador de clic */}
              <div className="text-center">
                <span className="text-xs text-blue-600 font-bold">Clic para ver detalle</span>
              </div>
              
              {/* Icono de expansión */}
              <div className="absolute top-2 right-2 w-5 h-5 text-blue-400 opacity-70">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6z"/>
                </svg>
              </div>
            </div>
          </div>
          {/* Título */}
          <h3 className="text-gray-700 font-bold text-lg mb-2">
            Promedio mensual
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Tendencia histórica
          </p>
        </div>

        {/* Métrica de Estado Académico - Diseño original con colores corregidos */}
        <div className="flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-200">
          <div className="relative mb-10">
            {/* Contenedor principal rediseñado MÁS GRANDE */}
            <div className="relative w-48 h-48 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200 rounded-3xl shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-200 border-2 border-gray-300 p-8 backdrop-blur-sm bg-white/25 border border-white/20 hover:scale-105 hover:-translate-y-1">
              
              {/* Estado actual destacado MÁS GRANDE */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-xl ring-8 mb-4 transition-all duration-200 animate-pulse drop-shadow-lg ${
                  finalMetricsData.academicStatus.level === 'R' ? 'bg-gradient-to-br from-red-600 to-red-700 ring-red-200 group-hover:ring-red-300' : 
                  finalMetricsData.academicStatus.level === 'A' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-yellow-200 group-hover:ring-yellow-300' : 
                  'bg-gradient-to-br from-green-600 to-green-700 ring-green-200 group-hover:ring-green-300'
                } group-hover:ring-12 group-hover:shadow-2xl`}>
                  <span className="text-white font-black text-3xl drop-shadow-sm">
                    {finalMetricsData.academicStatus.level}
                  </span>
                </div>
                <div className={`text-lg font-black ${
                  finalMetricsData.academicStatus.level === 'R' ? 'text-red-700' : 
                  finalMetricsData.academicStatus.level === 'A' ? 'text-yellow-600' : 
                  'text-green-700'
                }`}>
                  {finalMetricsData.academicStatus.description}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Puntaje: {Math.round(finalMetricsData.academicStatus.score)}%
                </div>
              </div>
              
              {/* Indicadores pequeños de otros estados con tooltip - COLORES MÁS FUERTES */}
              <div className="flex justify-center space-x-3">
                {[
                  { level: 'R', name: 'Riesgo', desc: 'Necesita apoyo adicional' },
                  { level: 'A', name: 'Activo', desc: 'Progreso satisfactorio' },
                  { level: 'D', name: 'Destacado', desc: 'Rendimiento excepcional' }
                ].map((status) => (
                  <div 
                    key={status.level}
                    className={`w-6 h-6 rounded-full cursor-help transition-all duration-150 ${
                      finalMetricsData.academicStatus.level === status.level ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
                    } ${
                      status.level === 'R' ? 'bg-red-600' : 
                      status.level === 'A' ? 'bg-yellow-400' : 
                      'bg-green-600'
                    }`}
                    title={`${status.name}: ${status.desc}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          {/* Título */}
          <h3 className="text-gray-700 font-bold text-xl mb-3 group-hover:text-gray-800 transition-colors duration-200">
            Estado académico
          </h3>
          <p className="text-base text-gray-500 text-center leading-relaxed">
            Evaluación current
          </p>
          {/* Tooltip informativo completo */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 -mt-2 bg-gray-800 text-white text-xs rounded-lg p-3 pointer-events-none max-w-xs">
            <div className="font-bold mb-1">{finalMetricsData.academicStatus.description}</div>
            <div>Puntaje: {Math.round(finalMetricsData.academicStatus.score)}%</div>
            <div className="mt-1 text-gray-300">
              {finalMetricsData.academicStatus.level === 'R' && 'Se recomienda apoyo adicional'}
              {finalMetricsData.academicStatus.level === 'A' && 'Mantén tu ritmo de estudio'}
              {finalMetricsData.academicStatus.level === 'D' && '¡Excelente desempeño!'}
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de tarjetas de métricas (4 columnas) - MÁS GRANDES y elegantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">

        {/* Gráfico de Actividades / Quiz - Sin Contenedor, Estilo Limpio */}
        <div
          className="cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => setIsActivitiesChartModalOpen(true)}
        >
          {/* Título simple */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v9h2v-9zm4-4h-2v13h2V7zm4-3h-2v16h2V4z"/>
              </svg>
              Actividades / Quiz
            </h3>
          </div>

          {/* Línea de tendencia */}
          <div className="mb-3">
            <svg className="w-full h-6" viewBox="0 0 200 24">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="20,16 50,14 80,12 110,10 140,8 170,6"
              />
              <polygon
                fill="#3b82f6"
                stroke="#3b82f6"
                strokeWidth="1"
                points="170,3 175,6 170,9"
              />
            </svg>
          </div>

          {/* Gráfico de barras limpio */}
          <div className="flex items-end justify-center space-x-2 h-16 mb-3">
            {currentMetricsData.activityProgress.slice(-4).map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div className="flex items-end space-x-0.5">
                  <div 
                    className="w-3 rounded-t-sm hover:opacity-80 transition-opacity"
                    style={{ 
                      height: `${(item.activities / 100) * 50}px`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                  <div 
                    className="w-3 rounded-t-sm hover:opacity-80 transition-opacity"
                    style={{ 
                      height: `${(item.quizts / 100) * 50}px`,
                      backgroundColor: '#8b5cf6'
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{item.period}</span>
              </div>
            ))}
          </div>

          {/* Leyenda simple */}
          <div className="flex justify-center space-x-3 mb-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs text-gray-600">Actividades</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-xs text-gray-600">Quizzes</span>
            </div>
          </div>

          {/* Texto "Clic para ver detalle" */}
          <div className="text-center mb-3">
            <span className="text-xs text-blue-600 font-medium hover:text-blue-700">Clic para ver detalle</span>
          </div>

          {/* Números finales */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                {currentMetricsData.activities.current}
              </div>
              <div className="text-xs text-gray-600">Actividades</div>
              <div className="text-xs text-gray-400">de {currentMetricsData.activities.total}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#8b5cf6' }}>
                {currentMetricsData.quiz.current}
              </div>
              <div className="text-xs text-gray-600">Quizzes</div>
              <div className="text-xs text-gray-400">de {currentMetricsData.quiz.total}</div>
            </div>
          </div>
        </div>

        {/* Resultados por materia - Representación Visual Exacta */}
        <div
          className="cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => setIsSubjectResultsModalOpen(true)}
        >
          {/* Título simple */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8z"/>
              </svg>
              Resultados por materia
            </h3>
          </div>

          {/* Gráfico de donut exacto como en la imagen */}
          <div className="relative flex items-center justify-center mb-4">
            <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg">
              {/* Definir los datos exactos como en la imagen */}
              {(() => {
                const subjects = currentMetricsData.subjectResults.subjects;
                
                // Calcular el total de todos los porcentajes para normalizar
                const totalPercent = subjects.reduce((sum, subject) => sum + subject.percent, 0);
                
                const centerX = 110;
                const centerY = 110;
                const radius = 85;
                const innerRadius = 40;
                let currentAngle = -90; // Empezar desde arriba
                
                return subjects.map((subject, index) => {
                  // Normalizar el porcentaje para que el círculo esté completo
                  const normalizedPercent = (subject.percent / totalPercent) * 100;
                  const angle = (normalizedPercent / 100) * 360;
                  const nextAngle = currentAngle + angle;
                  
                  // Calcular las coordenadas del arco (círculo completo)
                  const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
                  const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
                  const x2 = centerX + radius * Math.cos((nextAngle * Math.PI) / 180);
                  const y2 = centerY + radius * Math.sin((nextAngle * Math.PI) / 180);
                  
                  const x3 = centerX + innerRadius * Math.cos((nextAngle * Math.PI) / 180);
                  const y3 = centerY + innerRadius * Math.sin((nextAngle * Math.PI) / 180);
                  const x4 = centerX + innerRadius * Math.cos((currentAngle * Math.PI) / 180);
                  const y4 = centerY + innerRadius * Math.sin((currentAngle * Math.PI) / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                    'Z'
                  ].join(' ');
                  
                  // Calcular posición del texto
                  const textAngle = currentAngle + angle / 2;
                  const textRadius = (radius + innerRadius) / 2;
                  const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
                  const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

                  const result = (
                    <g key={index}>
                      <path
                        d={pathData}
                        fill={subject.color}
                        stroke="white"
                        strokeWidth="3"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        title={`${subject.code}: ${subject.fullName} - ${subject.percent}%`}
                      />
                      {/* Texto con abreviación */}
                      <text
                        x={textX}
                        y={textY - 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="16"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-sm"
                      >
                        {subject.code}
                      </text>
                      {/* Texto con porcentaje */}
                      <text
                        x={textX}
                        y={textY + 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-sm"
                      >
                        {subject.percent}%
                      </text>
                    </g>
                  );
                  
                  currentAngle = nextAngle;
                  return result;
                });
              })()}
            </svg>
            
            {/* Porcentaje central exacto como en la imagen */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold text-purple-600">
                {currentMetricsData.subjectResults.total}%
              </div>
            </div>
          </div>

          {/* Texto "Clic para ver detalle" */}
          <div className="text-center mb-2">
            <span className="text-xs text-purple-600 font-medium hover:text-purple-700">Clic para ver detalle</span>
          </div>

          {/* Etiqueta "1er simulador" */}
          <div className="text-center text-sm font-bold text-purple-600 mb-2">
            1er simulador
          </div>

          {/* Materias por reforzar compacto */}
          <div className="text-center">
            <div className="text-xs text-red-600 font-medium mb-1">
              Materias por reforzar:
            </div>
            <div className="text-xs font-bold text-red-700">
              {(() => {
                // Encontrar las dos materias con menor porcentaje
                const sortedSubjects = [...currentMetricsData.subjectResults.subjects]
                  .sort((a, b) => a.percent - b.percent)
                  .slice(0, 2);
                return sortedSubjects.map(s => s.code).join(' - ');
              })()}
            </div>
          </div>
        </div>

        {/* Resultados del simulador - Sin Contenedor, Estilo Limpio */}
        <div className="cursor-pointer transition-all duration-200 hover:scale-105">
          {/* Título simple */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v9h2v-9zm4-4h-2v13h2V7zm4-3h-2v16h2V4z"/>
              </svg>
              Resultados del simulador
            </h3>
          </div>

          {/* Barras horizontales limpias */}
          <div className="space-y-4 mb-4">
            {currentMetricsData.simulatorGrades.map((item, index) => (
              <div key={index} className="flex items-center group">
                {/* Etiqueta */}
                <div className="w-12 text-right text-base font-bold pr-3 flex-shrink-0" style={{ color: item.color }}>
                  {item.label}
                </div>
                {/* Barra */}
                <div className="flex-1 bg-gray-100 h-10 relative flex items-center overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${item.score}%`, 
                      backgroundColor: item.color
                    }}
                  ></div>
                  {/* Porcentaje */}
                  <span className="absolute right-3 text-white font-bold text-base drop-shadow-sm">
                    {item.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Línea lateral izquierda como en la imagen */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-600"></div>
          </div>
        </div>

        {/* Feedback - Sin Contenedor, Estilo Limpio y Preciso */}
        <div className="cursor-pointer transition-all duration-200 hover:scale-105">
          {/* Título simple */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Feedback
            </h3>
          </div>

          {/* Mensaje dinámico central con emoji */}
          {(() => {
            const feedback = getMotivationalFeedback(currentMetricsData.feedbackScore);
            return (
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-4xl">{feedback.emoji}</span>
                  <div className="text-2xl font-bold text-gray-800">{currentMetricsData.feedbackScore}%</div>
                </div>
                <div className="text-lg font-bold text-purple-600 mb-2">{feedback.message}</div>
                <div className="text-sm text-gray-600">{feedback.description}</div>
              </div>
            );
          })()}
        </div>

      </div> {/* Close grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 */}

      {/* Modal para el Gráfico de Actividades / Quizt */}
      <ChartModal
        isOpen={isActivitiesChartModalOpen}
        onClose={() => setIsActivitiesChartModalOpen(false)}
        title="Avance Mensual de Actividades y Quizts"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentMetricsData.activityProgress}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="activities" name="Actividades" fill="#3b82f6" />
            <Bar dataKey="quizts" name="Quizts" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartModal>

      {/* Modal para el Gráfico de Promedio Mensual con Material UI */}
      <ChartModal
        isOpen={isMonthlyAverageModalOpen}
        onClose={() => setIsMonthlyAverageModalOpen(false)}
        title="Evolución del Promedio Mensual - Últimos 12 Meses"
      >
        <div className="w-full h-full flex items-center justify-center">
          <MUIBarChart
            width={700}
            height={400}
            dataset={finalMetricsData.monthlyAverageData || DEFAULT_METRICS_DATA.monthlyAverageData}
            xAxis={[{ 
              scaleType: 'band', 
              dataKey: 'month',
              label: 'Meses'
            }]}
            yAxis={[{
              label: 'Promedio (%)',
              min: 0,
              max: 100
            }]}
            series={[
              { 
                dataKey: 'promedio', 
                label: 'Promedio Mensual',
                color: '#3b82f6'
              }
            ]}
            margin={{ left:  60, right: 20, top: 20, bottom: 60 }}
            sx={{
              '& .MuiChartsAxis-line': {
                stroke: '#6b7280',
              },
              '& .MuiChartsAxis-tick': {
                stroke: '#6b7280',
              },
              '& .MuiChartsAxis-tickLabel': {
                fill: '#374151',
                fontSize: '12px',
              },
              '& .MuiChartsLegend-label': {
                fill: '#374151',
                fontSize: '14px',
              }
            }}
          />
        </div>
      </ChartModal>

      {/* Modal para el Gráfico de Resultados por Materia */}
      <ChartModal
        isOpen={isSubjectResultsModalOpen}
        onClose={() => setIsSubjectResultsModalOpen(false)}
        title="Resultados Detallados por Materia - 1er Simulador"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              fill="#8884d8"
              paddingAngle={3}
              cornerRadius={6}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Información adicional en el modal */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-purple-600">
              {currentMetricsData.subjectResults.total}%
            </span>
            <p className="text-sm text-gray-600 mt-1">Puntuación General</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Desglose por Materia:</h4>
              <div className="space-y-1">
                {currentMetricsData.subjectResults.subjects.map((subject, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <span className="font-medium">{subject.code}</span>
                    </div>
                    <span className="text-gray-600">{subject.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Recomendaciones:</h4>
              <div className="text-sm text-red-600 font-medium mb-2">
                Materias por reforzar: {recommendedSubjects.join(', ')}
              </div>
              <p className="text-sm text-gray-600">
                {recommendationMessage}
              </p>
            </div>
          </div>
        </div>
      </ChartModal>

      {/* Sección de Recomendaciones Personalizadas basadas en Estado Académico */}
      <div className="mt-16 mb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de la sección */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
              <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RECOMENDACIÓN
              </h2>
            </div>
          </div>

          {/* Tarjeta principal de la frase */}
          {(() => {
            // Calcular clases basadas en el estado académico
            const isRiesgo = finalAcademicStatus.level === 'R';
            const isActivo = finalAcademicStatus.level === 'A';
            const isDestacado = finalAcademicStatus.level === 'D';
            
            const cardBgClass = isRiesgo 
              ? 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100 border-red-200'
              : isActivo 
              ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-200'
              : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200';
            
            const iconBgClass = isRiesgo
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : isActivo
              ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
              : 'bg-gradient-to-br from-green-500 to-emerald-600';
            
            const badgeBgClass = isRiesgo
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : isActivo
              ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-600';
            
            const textClass = isRiesgo
              ? 'text-red-700'
              : isActivo
              ? 'text-amber-700'
              : 'text-green-700';
            
            const separatorClass = isRiesgo
              ? 'bg-gradient-to-r from-red-400 to-red-600'
              : isActivo
              ? 'bg-gradient-to-r from-yellow-400 to-amber-600'
              : 'bg-gradient-to-r from-green-400 to-emerald-600';

            return (
              <div className={`relative p-8 rounded-3xl shadow-2xl border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 ${cardBgClass}`}>
                
                {/* Icono de bandera en la esquina superior izquierda */}
                <div className="absolute top-4 left-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${iconBgClass}`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v18l6-3 6 3 6-3V4l-6 3-6-3-6 3z"/>
                    </svg>
                  </div>
                </div>

                {/* Estado académico en la esquina superior derecha */}
                <div className="absolute top-4 right-4">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${badgeBgClass}`}>
                    Estado: {finalAcademicStatus.description}
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="pt-8 pb-4">
                  {/* Recomendación dinámica según estado académico */}
                  <div className="text-center mb-6">
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-black leading-relaxed ${textClass} drop-shadow-sm`}>
                      {(() => {
                        if (finalAcademicStatus.level === 'R') {
                          return "Dedica más tiempo al estudio diario y busca apoyo adicional";
                        } else if (finalAcademicStatus.level === 'A') {
                          return "¡Vas por buen camino! Mantén ese ritmo de estudio constante";
                        } else {
                          return "¡Excelente desempeño! Sigue así y ayuda a tus compañeros";
                        }
                      })()}
                    </p>
                  </div>

                  {/* Separador decorativo */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`h-1 w-20 rounded-full ${separatorClass} shadow-sm`}></div>
                  </div>

                  {/* Recomendación específica de estudio */}
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-700 mb-3 tracking-wide">
                      {(() => {
                        if (finalAcademicStatus.level === 'R') {
                          return "Estudia 2-3 horas diarias en sesiones de 25 minutos";
                        } else if (finalAcademicStatus.level === 'A') {
                          return "Estudia todos los días un poco, no todo en un solo día";
                        } else {
                          return "Mantén tu rutina de estudio y comparte tus técnicas";
                        }
                      })()}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                      La constancia vence al cansancio • Pequeños pasos llevan a grandes logros
                    </p>
                  </div>
                </div>

                {/* Patrón decorativo de fondo */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="w-full h-full bg-repeat" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>
              </div>
            );
          })()}

          {/* Mensaje de recomendación académica si es necesario */}
          {finalAcademicStatus.level === 'R' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Recomendación:</h4>
                  <p className="text-sm text-blue-600 leading-relaxed">
                    Considera establecer un horario de estudio diario, buscar apoyo de tu asesor académico, 
                    y utilizar técnicas de estudio que se adapten mejor a tu estilo de aprendizaje. 
                    ¡Cada pequeño paso cuenta hacia tu éxito!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Ejemplos de diferentes perfiles de estudiantes para testing - Más realistas
const STUDENT_PROFILES = {
  riesgo: {
    attendance: 58,
    activities: { current: 12, total: 24 },
    quiz: { current: 8, total: 18 },
    monthlyAverage: 62,
    monthlyAverageData: [
      { month: 'Ene', promedio: 45 },
      { month: 'Feb', promedio: 48 },
      { month: 'Mar', promedio: 52 },
      { month: 'Abr', promedio: 55 },
      { month: 'May', promedio: 58 },
      { month: 'Jun', promedio: 60 },
      { month: 'Jul', promedio: 62 },
      { month: 'Ago', promedio: 59 },
      { month: 'Sep', promedio: 61 },
      { month: 'Oct', promedio: 63 },
      { month: 'Nov', promedio: 65 },
      { month: 'Dic', promedio: 67 }
    ]
  },
  activo: {
    attendance: 85,
    activities: { current: 20, total: 24 },
    quiz: { current: 15, total: 18 },
    monthlyAverage: 81,
    monthlyAverageData: [
      { month: 'Ene', promedio: 75 },
      { month: 'Feb', promedio: 78 },
      { month: 'Mar', promedio: 72 },
      { month: 'Abr', promedio: 80 },
      { month: 'May', promedio: 85 },
      { month: 'Jun', promedio: 88 },
      { month: 'Jul', promedio: 81 },
      { month: 'Ago', promedio: 79 },
      { month: 'Sep', promedio: 83 },
      { month: 'Oct', promedio: 86 },
      { month: 'Nov', promedio: 84 },
      { month: 'Dic', promedio: 87 }
    ]
  },
  destacado: {
    attendance: 96,
    activities: { current: 24, total: 24 },
    quiz: { current: 18, total: 18 },
    monthlyAverage: 94,
    monthlyAverageData: [
      { month: 'Ene', promedio: 88 },
      { month: 'Feb', promedio: 90 },
      { month: 'Mar', promedio: 92 },
      { month: 'Abr', promedio: 94 },
      { month: 'May', promedio: 96 },
      { month: 'Jun', promedio: 98 },
      { month: 'Jul', promedio: 94 },
      { month: 'Ago', promedio: 95 },
      { month: 'Sep', promedio: 93 },
      { month: 'Oct', promedio: 97 },
      { month: 'Nov', promedio: 99 },
      { month: 'Dic', promedio: 96 }
    ]
  }
};

export default AlumnoDashboardMetrics;