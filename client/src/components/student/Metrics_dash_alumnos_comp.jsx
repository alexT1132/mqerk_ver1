// imoprtaciones de React y hooks
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCourse } from '../../context/CourseContext.jsx';
// Importaciones de Recharts para gráficos
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// Importaciones de Material UI Charts
import { BarChart as MUIBarChart } from '@mui/x-charts/BarChart';
// APIs para cargar datos reales
import { resumenQuizzesEstudiante } from '../../api/quizzes.js';
import { resumenActividadesEstudiante } from '../../api/actividades.js';
import { resumenSimulacionesEstudiante } from '../../api/simulaciones.js';
import { getResumenAsistenciaEstudiante } from '../../api/asistencias.js';



// Importa la imagen de perfil (reemplazada con un placeholder)
// Nota: Las importaciones de archivos locales como './assets/reese.jfif' no son compatibles directamente en este entorno.
// Se ha reemplazado con una URL de placeholder.
const reeseProfilePic = "https://placehold.co/128x128/A0AEC0/FFFFFF?text=Foto";

// --- CONSTANTES ---
// NOTA: Los datos mock ya no se usan - el componente ahora usa solo datos reales de las APIs
// Se mantienen aquí solo como referencia/documentación
// Datos de usuario por defecto (NO SE USAN - solo referencia)
// eslint-disable-next-line no-unused-vars
// const DEFAULT_USER_DATA = {
//   name: "Mari Lu Rodríguez Marquez",
//   email: "XXXXXXXXXXXXX@gmail.com",
//   telefono: "",
//   comunidad: "",
//   telTutor: "",
//   nombreTutor: "",
//   activeCourse: "XXXXXXXXX",
//   currentBachillerato: "XXXXXXXXXXXXX",
//   academy: "MQerK Academy",
//   universityOption: "XXXXXXXXX",
//   licenciaturaOption: "XXXXXXXXX",
//   advisor: "L.C.Q Kelvin Valentin Gomez Ramirez",
//   group: "xXXXX",
//   folio: "MEEAU25-0001",
//   profilePic: reeseProfilePic,
// };

// Datos de métricas por defecto (NO SE USAN - solo referencia)
// eslint-disable-next-line no-unused-vars
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
      emoji: "🙂",
      style: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Buen trabajo, continúa esforzándote",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 60) {
    return {
      message: "¡SIGUE ADELANTE!",
      emoji: "💪",
      style: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Estás mejorando, no te rindas",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else if (score >= 50) {
    return {
      message: "¡PUEDES MEJORAR!",
      emoji: "⚠️",
      style: "text-red-600 bg-red-50 border-red-200",
      description: "Necesitas un poco más de esfuerzo",
      topMessage: "¡LO ESTÁS LOGRANDO!"
    };
  } else {
    return {
      message: "¡NO TE RINDAS!",
      emoji: "📚",
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
  const activityProgress = activities?.total ? (activities.current / activities.total) * 100 : 0;
  const quizProgress = quiz?.total ? (quiz.current / quiz.total) * 100 : 0;

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
 * Función para calcular el nivel de rendimiento (E, D, C, B, A) basado en el score
 * @param {number} score - Puntaje del feedback (0-100)
 * @returns {Object} Objeto con nivel, color, ángulo y descripción
 */
const calculatePerformanceLevel = (score) => {
  if (score >= 90) {
    return { level: 'A', color: '#10B981', angle: 162, name: 'Nível A', description: 'Excelente' };
  } else if (score >= 75) {
    return { level: 'B', color: '#F59E0B', angle: 108, name: 'Nível B', description: 'Bueno' };
  } else if (score >= 60) {
    return { level: 'C', color: '#FCD34D', angle: 54, name: 'Nível C', description: 'Regular' };
  } else if (score >= 40) {
    return { level: 'D', color: '#F97316', angle: 18, name: 'Nível D', description: 'Bajo' };
  } else {
    return { level: 'E', color: '#DC2626', angle: 0, name: 'Nível E', description: 'Muy bajo' };
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] relative flex flex-col overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative">
          <h2 className="text-2xl font-bold text-white text-center pr-10">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Contenido con scroll si es necesario */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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

  // Estados para datos reales de las APIs
  const [realMetricsData, setRealMetricsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  // Helper to build absolute URL for stored photos
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const apiUrl = (import.meta?.env?.VITE_API_URL) || `http://${host}:1002/api`;
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
  const buildStaticUrl = (p) => {
    if (!p) return reeseProfilePic;
    if (/^https?:\/\//i.test(p)) return p;
    return `${apiOrigin}${p.startsWith('/') ? '' : '/'}${p}`;
  };

  // Función para transformar datos de APIs al formato esperado
  const transformApiDataToMetrics = useMemo(() => {
    return (quizzesData, actividadesData, simulacionesData, asistenciaResumen) => {
      // Calcular métricas de quizzes
      const quizzesArray = Array.isArray(quizzesData) ? quizzesData : [];
      const quizzesAprobados = quizzesArray.filter(q => {
        const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
        return puntaje != null && Number(puntaje) >= 70;
      }).length;
      const totalQuizzes = quizzesArray.length;
      const quizProgress = totalQuizzes > 0 ? Math.round((quizzesAprobados / totalQuizzes) * 100) : 0;

      // Calcular métricas de actividades
      const actividadesArray = Array.isArray(actividadesData) ? actividadesData : [];
      const actividadesCompletadas = actividadesArray.filter(a => {
        const estado = a.entrega_estado;
        return estado === 'revisada' || estado === 'entregada';
      }).length;
      const totalActividades = actividadesArray.length;
      const activitiesProgress = totalActividades > 0 ? Math.round((actividadesCompletadas / totalActividades) * 100) : 0;

      // Calcular promedio mensual de quizzes (último intento o mejor puntaje)
      // Convertir de escala 0-100 a 0-10 para el cálculo
      const quizScores = quizzesArray
        .map(q => {
          const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
          if (puntaje == null) return null;
          const score = Number(puntaje);
          // Si el puntaje es mayor a 10, asumimos que está en escala 0-100 y lo convertimos
          return score > 10 ? score / 10 : score;
        })
        .filter(p => p != null && p >= 0 && p <= 10);
      const monthlyAverage = quizScores.length > 0
        ? Math.round((quizScores.reduce((sum, p) => sum + p, 0) / quizScores.length) * 10) // Convertir de vuelta a 0-100
        : 0;

      // Calcular promedio de actividades (calificaciones)
      // Convertir de escala 0-100 a 0-10 para el cálculo
      const actividadScores = actividadesArray
        .map(a => {
          const calif = a.calificacion;
          if (calif == null || isNaN(Number(calif))) return null;
          const score = Number(calif);
          // Si la calificación es mayor a 10, asumimos que está en escala 0-100 y la convertimos
          return score > 10 ? score / 10 : score;
        })
        .filter(c => c != null && c >= 0 && c <= 10);
      const actividadAverage = actividadScores.length > 0
        ? Math.round((actividadScores.reduce((sum, c) => sum + c, 0) / actividadScores.length) * 10) // Convertir de vuelta a 0-100
        : 0;

      // Promedio general (ponderado: 60% quizzes, 40% actividades)
      // Solo calcular si hay al menos un tipo de datos
      let overallAverage = 0;
      if (quizScores.length > 0 && actividadScores.length > 0) {
        overallAverage = Math.round((monthlyAverage * 0.6) + (actividadAverage * 0.4));
      } else if (quizScores.length > 0) {
        overallAverage = monthlyAverage;
      } else if (actividadScores.length > 0) {
        overallAverage = actividadAverage;
      }

      // Generar datos para gráfico de progreso mensual (últimos 12 meses)
      // Crear datos históricos básicos con el promedio actual en el último mes
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyAverageData = months.map((month, idx) => ({
        month,
        promedio: idx === 11 ? overallAverage : (overallAverage > 0 ? Math.max(0, overallAverage - (11 - idx) * 2) : 0)
      }));

      // Generar datos para gráfico de actividades/quiz (últimos 8 meses)
      const last8Months = months.slice(-8);
      const activityProgress = last8Months.map((period, idx) => ({
        period,
        activities: idx === 7 ? activitiesProgress : Math.max(0, activitiesProgress - (7 - idx) * 3),
        quizts: idx === 7 ? quizProgress : Math.max(0, quizProgress - (7 - idx) * 3)
      }));

      // Calcular feedback score (promedio de calificaciones de actividades o quizzes)
      const feedbackScore = actividadAverage || monthlyAverage || 0;

      // Obtener porcentaje de asistencia del resumen
      // El backend devuelve el porcentaje ya calculado, pero también tenemos total y asistidas
      const attendanceGeneral = asistenciaResumen?.general;
      let attendancePercentage = null;
      let attendanceData = null;
      if (attendanceGeneral) {
        // Usar el porcentaje calculado por el backend, o calcularlo si no está disponible
        attendancePercentage = attendanceGeneral.porcentaje != null
          ? Number(attendanceGeneral.porcentaje)
          : (attendanceGeneral.total > 0
            ? Math.round((attendanceGeneral.asistidas / attendanceGeneral.total) * 100)
            : null);
        // Guardar también los datos de total y asistidas para mostrar información más precisa
        attendanceData = {
          total: attendanceGeneral.total || 0,
          asistidas: attendanceGeneral.asistidas || 0,
          faltas: attendanceGeneral.faltas || 0
        };
      }

      return {
        attendance: attendancePercentage, // Porcentaje de asistencia desde la API
        attendanceData, // Datos adicionales de asistencia (total, asistidas, faltas)
        activities: {
          current: actividadesCompletadas,
          total: totalActividades || 0
        },
        quiz: {
          current: quizzesAprobados,
          total: totalQuizzes || 0
        },
        monthlyAverage: overallAverage,
        monthlyAverageData,
        activityProgress,
        feedbackScore,

        // Procesar simuladores - separar generales de específicos
        simulatorGrades: (() => {
          const simulacionesArray = Array.isArray(simulacionesData) ? simulacionesData : [];

          if (simulacionesArray.length === 0) {
            return { generales: [], especificos: [] };
          }

          // Separar por tipo:
          // - GENERALES: id_area null (sin categoría) o id_area 1-5 (áreas fundamentales)
          // - ESPECÍFICOS: id_area >= 100 (módulos universitarios: UNAM, IPN, etc.)
          const simuladoresGenerales = simulacionesArray.filter(sim => {
            const area = sim.id_area;
            // Considerar como general si:
            // 1. No tiene id_area (null/undefined) - simuladores sin categoría específica
            // 2. Tiene id_area entre 1-5 - áreas fundamentales
            if (area === null || area === undefined) return true;
            const areaNum = Number(area);
            return areaNum >= 1 && areaNum <= 5;
          });

          const simuladoresEspecificos = simulacionesArray.filter(sim => {
            const area = sim.id_area;
            // Solo considerar como específico si tiene id_area >= 100
            if (area === null || area === undefined) return false;
            const areaNum = Number(area);
            return areaNum >= 100;
          });

          // console.log('🔍 Simuladores generales filtrados:', simuladoresGenerales);
          // console.log('🔍 Simuladores específicos filtrados:', simuladoresEspecificos);

          // Calcular puntajes por área general (mejor puntaje de cada área)
          const puntajesPorArea = {};

          // Primero, calcular puntajes para áreas 1-5
          [1, 2, 3, 4, 5].forEach(areaId => {
            const simsArea = simuladoresGenerales.filter(s => Number(s.id_area) === areaId);
            if (simsArea.length > 0) {
              const puntajes = simsArea.map(sim => {
                const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
                return Number(puntaje) || 0;
              });
              puntajesPorArea[areaId] = Math.max(...puntajes, 0);
            } else {
              puntajesPorArea[areaId] = 0;
            }
          });

          // Luego, calcular puntaje para simuladores sin categoría (id_area null)
          const simsSinCategoria = simuladoresGenerales.filter(s => s.id_area === null || s.id_area === undefined);
          if (simsSinCategoria.length > 0) {
            const puntajes = simsSinCategoria.map(sim => {
              const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
              return Number(puntaje) || 0;
            });
            puntajesPorArea[0] = Math.max(...puntajes, 0); // Usar área 0 para "General"
          } else {
            puntajesPorArea[0] = 0;
          }

          // Calcular puntajes por módulo específico (solo id_area >= 100)
          const puntajesPorModulo = {};

          simuladoresEspecificos.forEach(sim => {
            const area = sim.id_area;
            const key = `modulo_${area}`;

            if (!puntajesPorModulo[key]) {
              puntajesPorModulo[key] = {
                puntajes: [],
                nombre: `Módulo ${area}`,
                id_area: area
              };
            }

            const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
            puntajesPorModulo[key].puntajes.push(Number(puntaje) || 0);
          });

          // console.log('🔍 Puntajes por área (incluyendo área 0 para generales):', puntajesPorArea);
          // console.log('🔍 Puntajes por módulo:', puntajesPorModulo);

          return {
            generales: [
              { area: 'General', id_area: 0, puntaje: puntajesPorArea[0] || 0, color: '#A855F7' },
              { area: 'Español', id_area: 1, puntaje: puntajesPorArea[1] || 0, color: '#8B5CF6' },
              { area: 'Matemáticas', id_area: 2, puntaje: puntajesPorArea[2] || 0, color: '#EC4899' },
              { area: 'Hab. Trans.', id_area: 3, puntaje: puntajesPorArea[3] || 0, color: '#F59E0B' },
              { area: 'L. Extranjera', id_area: 4, puntaje: puntajesPorArea[4] || 0, color: '#6366F1' }
            ],
            especificos: Object.entries(puntajesPorModulo).map(([key, data]) => ({
              modulo: data.nombre,
              id_area: data.id_area,
              puntaje: Math.max(...data.puntajes, 0),
              color: '#10B981'
            }))
          };
        })(),

        // Datos de materias - se mantendrán vacíos hasta que haya datos reales
        subjectResults: {
          total: 0,
          subjects: []
        },
      };
    };
  }, []);

  // Cargar datos reales de las APIs
  useEffect(() => {
    if (!alumno?.id || !showMetrics) return;

    let alive = true;
    setLoadingMetrics(true);
    setMetricsError(null);

    const loadMetrics = async () => {
      try {
        // Obtener rango de fechas del último mes para el resumen de asistencia
        const fechaHasta = new Date().toISOString().split('T')[0];
        const fechaDesde = new Date();
        fechaDesde.setMonth(fechaDesde.getMonth() - 1);
        const fechaDesdeStr = fechaDesde.toISOString().split('T')[0];

        const [quizzesRes, actividadesRes, simulacionesRes, asistenciaRes] = await Promise.allSettled([
          resumenQuizzesEstudiante(alumno.id),
          resumenActividadesEstudiante(alumno.id),
          resumenSimulacionesEstudiante(alumno.id),
          getResumenAsistenciaEstudiante(alumno.id, {
            desde: fechaDesdeStr,
            hasta: fechaHasta
          })
        ]);

        if (!alive) return;

        const quizzesData = quizzesRes.status === 'fulfilled'
          ? (quizzesRes.value?.data?.data || quizzesRes.value?.data || [])
          : [];
        const actividadesData = actividadesRes.status === 'fulfilled'
          ? (actividadesRes.value?.data || actividadesRes.value || [])
          : [];
        const simulacionesData = simulacionesRes.status === 'fulfilled'
          ? (simulacionesRes.value?.data?.data || simulacionesRes.value?.data || [])
          : [];
        const asistenciaResumen = asistenciaRes.status === 'fulfilled'
          ? (asistenciaRes.value?.data || asistenciaRes.value || null)
          : null;

        // DEBUG TEMPORAL: Ver estructura de simuladores
        // console.log('🎯 DEBUG SIMULADORES - Datos completos:', simulacionesData);
        // console.log('🎯 DEBUG SIMULADORES - Total:', simulacionesData.length);
        // if (simulacionesData.length > 0) {
        //   console.log('🎯 DEBUG SIMULADORES - Primer elemento:', simulacionesData[0]);
        // }

        const transformed = transformApiDataToMetrics(quizzesData, actividadesData, simulacionesData, asistenciaResumen);
        setRealMetricsData(transformed);
      } catch (err) {
        if (!alive) return;
        console.error('Error cargando métricas:', err);
        setMetricsError(err?.message || 'Error al cargar métricas');
        // Mantener datos por defecto en caso de error
        setRealMetricsData(null);
      } finally {
        if (alive) setLoadingMetrics(false);
      }
    };

    loadMetrics();
    return () => { alive = false; };
  }, [alumno?.id, showMetrics, transformApiDataToMetrics]);

  // Map alumno from AuthContext into userData shape (sin datos mock)
  const alumnoUserData = alumno ? {
    name: `${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || '',
    email: alumno.email || '',
    telefono: alumno.telefono || '',
    comunidad: alumno.comunidad1 || '',
    telTutor: alumno.tel_tutor || '',
    nombreTutor: alumno.nombre_tutor || '',
    folio: alumno.folio || '',
    profilePic: buildStaticUrl(alumno.foto) || reeseProfilePic,
  } : {};

  // Fusionar los datos: solo usar datos reales o props, sin datos mock por defecto
  const mergedMetricsData = useMemo(() => {
    // Si hay datos reales de API, usarlos como base
    if (realMetricsData) {
      return { ...realMetricsData, ...metricsData };
    }
    // Si hay datos de props, usarlos
    if (metricsData) {
      return metricsData;
    }
    // Si no hay datos, retornar estructura vacía (no mock)
    return {
      attendance: null,
      activities: { current: 0, total: 0 },
      quiz: { current: 0, total: 0 },
      monthlyAverage: 0,
      monthlyAverageData: [],
      activityProgress: [],
      feedbackScore: 0,
      subjectResults: { total: 0, subjects: [] },
      simulatorGrades: [],
    };
  }, [realMetricsData, metricsData]);

  // Determinar si estamos cargando (combinar props y estado interno)
  const isActuallyLoading = isLoading || loadingMetrics;
  const actualError = error || metricsError;

  // Si hay un curso seleccionado, usar sus datos simulados para métricas (solo si no hay datos reales)
  const currentMetricsData = useMemo(() => {
    if (selectedCourse?.metricas && !realMetricsData) {
      return {
        ...mergedMetricsData,
        monthlyAverage: selectedCourse.metricas.promedio || mergedMetricsData.monthlyAverage,
        // Calcular progreso de actividades basado en el avance del curso
        activities: {
          ...mergedMetricsData.activities,
          current: (() => {
            const avanceNum = Number.parseInt(selectedCourse.metricas.avance, 10);
            const avance = Number.isFinite(avanceNum) ? avanceNum : 0;
            return Math.floor((avance / 100) * mergedMetricsData.activities.total);
          })()
        }
      };
    }
    return mergedMetricsData;
  }, [selectedCourse, mergedMetricsData, realMetricsData]);

  // Calcular el estado académico dinámicamente (sin mutar objetos)
  const calculatedAcademicStatus = useMemo(() => calculateAcademicStatus(currentMetricsData), [
    currentMetricsData.attendance,
    currentMetricsData.monthlyAverage,
    currentMetricsData.activities?.current,
    currentMetricsData.activities?.total,
    currentMetricsData.quiz?.current,
    currentMetricsData.quiz?.total,
  ]);
  const currentMetricsWithStatus = useMemo(() => ({
    ...currentMetricsData,
    academicStatus: calculatedAcademicStatus,
  }), [currentMetricsData, calculatedAcademicStatus]);

  // Fusiona: alumno (Auth) <- props (override) - sin datos mock
  const currentUserData = {
    name: '',
    email: '',
    telefono: '',
    comunidad: '',
    telTutor: '',
    nombreTutor: '',
    folio: '',
    profilePic: reeseProfilePic,
    ...alumnoUserData,
    ...userData
  };

  const buildCourseCode = () => 'MEEAU';
  const onlyDigits = (v) => typeof v === 'string' ? /^\d+$/.test(v) : (typeof v === 'number' && Number.isFinite(v));
  const seqNum = onlyDigits(currentUserData.folio) ? parseInt(currentUserData.folio, 10) : null;
  const yy = String((alumno?.anio && Number(alumno?.anio)) ? Number(alumno.anio) : new Date().getFullYear()).slice(-2);
  const displayFolio = seqNum != null
    ? `${buildCourseCode()}${yy}-${String(seqNum).padStart(4, '0')}`
    : currentUserData.folio;

  // Estados para modales de gráficos (todos los hooks deben estar antes de returns condicionales)
  const [isActivitiesChartModalOpen, setIsActivitiesChartModalOpen] = useState(false);
  const [isMonthlyAverageModalOpen, setIsMonthlyAverageModalOpen] = useState(false);
  const [isSubjectResultsModalOpen, setIsSubjectResultsModalOpen] = useState(false);

  // Usar directamente los datos reales sin perfiles de testing
  const finalMetricsData = useMemo(() => currentMetricsWithStatus, [currentMetricsWithStatus]);

  // Recalcular el estado académico con el perfil actual (sin mutar)
  const finalAcademicStatus = useMemo(() => calculateAcademicStatus(finalMetricsData), [
    finalMetricsData.attendance,
    finalMetricsData.monthlyAverage,
    finalMetricsData.activities?.current,
    finalMetricsData.activities?.total,
    finalMetricsData.quiz?.current,
    finalMetricsData.quiz?.total,
  ]);

  // Prepara los datos para el PieChart de Recharts
  const pieChartData = useMemo(() => {
    const subjects = finalMetricsData?.subjectResults?.subjects || currentMetricsData?.subjectResults?.subjects || [];
    const totalPercent = subjects.reduce((sum, subject) => sum + subject.percent, 0);

    return subjects.map((subject, index) => {
      const normalizedPercent = (subject.percent / totalPercent) * 100;
      return {
        name: subject.fullName,
        value: normalizedPercent,
        originalPercent: subject.percent,
        code: subject.code,
        color: subject.color,
      };
    });
  }, [finalMetricsData?.subjectResults?.subjects, currentMetricsData?.subjectResults?.subjects]);

  // Obtiene recomendaciones dinámicas basadas en la puntuación total del simulador
  const { subjects: recommendedSubjects, message: recommendationMessage } = useMemo(() => {
    const subjectResults = finalMetricsData?.subjectResults || currentMetricsData?.subjectResults;
    return getSimulatorRecommendation(
      subjectResults?.total || 0,
      subjectResults?.subjects || []
    );
  }, [finalMetricsData?.subjectResults, currentMetricsData?.subjectResults]);

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

  // Custom Label para el PieChart (muestra la abreviación)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8px"
        fontWeight="bold"
      >
        {pieChartData[index].code}
      </text>
    );
  };

  // --- Renderizado Condicional: Estado de Carga ---
  if (isActuallyLoading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

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
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  // Eliminar contenedor principal para mejor integración - solo contenido directo
  return (
    <div className="w-full font-inter text-gray-800 pt-4 sm:pt-6">

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
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                    <p className="text-sm font-bold text-gray-800">{currentUserData.telefono || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Municipio o Comunidad */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                    <p className="text-sm font-bold text-gray-800">{currentUserData.comunidad || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Número de Teléfono del Tutor */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">{currentUserData.telTutor || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Nombre del Tutor */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

      {/* Sección "TU STATUS MENSUAL" */}
      <div className="text-center mb-6 mt-8">
        <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
          <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TU STATUS MENSUAL
          </h2>
        </div>
      </div>

      {/* Primera fila de métricas (5 columnas) - Diseño MÁS GRANDE y premium */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-16 max-w-8xl mx-auto">

        {/* Métrica de Asistencia - Diseño Moderno con Gradientes Vibrantes */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Porcentaje de días asistidos en el mes actual">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Tarjeta principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(6,182,212,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">

              {/* Icono animado con efecto de brillo */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>

              {/* Información principal - Porcentaje grande */}
              <div className="text-center mb-3">
                {(() => {
                  const attendance = finalMetricsData.attendance ?? null;

                  // Intentar obtener datos reales del resumen de asistencia si están disponibles
                  const attendanceData = finalMetricsData.attendanceData;
                  const totalDays = attendanceData?.total ?? null;
                  const attendedDays = attendanceData?.asistidas ?? null;

                  if (attendance === null || attendance === undefined) {
                    return (
                      <>
                        <div className="text-2xl font-black text-gray-400 mb-1">
                          —
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin datos
                        </div>
                      </>
                    );
                  }

                  // Si tenemos datos reales de días, usarlos; si no, calcular basado en el mes actual
                  let displayDays = null;
                  let displayTotal = null;

                  if (totalDays != null && attendedDays != null) {
                    displayDays = attendedDays;
                    displayTotal = totalDays;
                  } else {
                    // Fallback: calcular basado en días del mes actual
                    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                    displayDays = Math.round((attendance / 100) * daysInMonth);
                    displayTotal = daysInMonth;
                  }

                  return (
                    <>
                      <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {Math.round(attendance)}%
                      </div>
                      <div className="text-sm text-white/90 font-bold drop-shadow-md">
                        {displayDays} de {displayTotal} días
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Barra de progreso con efecto glassmorphism */}
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                <div
                  className="h-full bg-gradient-to-r from-white via-cyan-100 to-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(0, finalMetricsData.attendance ?? 0))}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Asistencia
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Este mes
          </p>
        </div>

        {/* Métrica de Actividades - Diseño Moderno con Gradiente Naranja */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Progreso en actividades del curso actual">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Card principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(251,146,60,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">
              {/* Header con icono animado */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>

              {/* Progreso principal */}
              <div className="text-center mb-3">
                {(() => {
                  const current = finalMetricsData.activities?.current ?? 0;
                  const total = finalMetricsData.activities?.total ?? 0;
                  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

                  if (total === 0) {
                    return (
                      <>
                        <div className="text-xl font-black text-gray-400 mb-1">
                          0/0
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin actividades
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="text-2xl sm:text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {current}/{total}
                      </div>
                      <div className="text-xs sm:text-sm text-white/90 font-bold drop-shadow-md">
                        {percentage}%
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Barra de progreso con glassmorphism */}
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                {(() => {
                  const current = finalMetricsData.activities?.current ?? 0;
                  const total = finalMetricsData.activities?.total ?? 0;
                  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
                  return (
                    <div
                      className="h-full bg-gradient-to-r from-white via-amber-100 to-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Actividades
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Curso actual
          </p>
        </div>

        {/* Métrica de Quiz - Diseño Moderno con Gradiente Verde */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Porcentaje de quizzes aprobados">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Card principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">

              {/* Icono animado */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>

              {/* Datos principales */}
              <div className="text-white text-center">
                {(() => {
                  const current = finalMetricsData.quiz?.current ?? 0;
                  const total = finalMetricsData.quiz?.total ?? 0;
                  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

                  if (total === 0) {
                    return (
                      <>
                        <div className="text-2xl font-black text-gray-400 mb-1">
                          —
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin quizzes
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="text-2xl sm:text-3xl font-black mb-1 drop-shadow-lg">
                        {percentage}%
                      </div>
                      <div className="text-xs sm:text-sm font-bold drop-shadow-md">
                        {current} de {total}
                      </div>
                      <div className="text-xs mt-1 text-white/90">
                        aprobados
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quiz
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Evaluaciones
          </p>
        </div>

        {/* Métrica de Promedio Mensual - Con clic para abrir modal de Material UI */}
        {(() => {
          const monthlyAverage = finalMetricsData.monthlyAverage ?? 0;
          const hasMonthlyData = finalMetricsData.monthlyAverageData &&
            finalMetricsData.monthlyAverageData.length > 0 &&
            finalMetricsData.monthlyAverageData.some(item => item.promedio > 0);

          // Mostrar siempre, incluso si no hay datos (mostrará 0%)
          // if (!hasMonthlyData || monthlyAverage === 0) return null;

          return (
            <div
              className="flex flex-col items-center group cursor-pointer transition-all duration-150"
              title="Haz clic para ver el gráfico detallado de tu promedio mensual"
              onClick={() => setIsMonthlyAverageModalOpen(true)}
            >
              <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                {/* Contenedor del gráfico visual con gradiente oscuro para mejor legibilidad */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(139,92,246,0.5)] border border-white/20 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-500">

                  {/* Header del gráfico con icono animado */}
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-1 sm:mr-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                        <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                      </svg>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                      {monthlyAverage > 0 ? `${Math.round(monthlyAverage)}%` : '—'}
                    </span>
                  </div>

                  {/* Gráfico de barras simplificado */}
                  {hasMonthlyData ? (
                    <div className="flex items-end justify-center space-x-1 h-12 mb-2">
                      {finalMetricsData.monthlyAverageData.slice(-5).map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-3 bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-sm"
                            style={{ height: `${Math.max(4, (item.promedio / 100) * 40)}px` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-12 mb-2">
                      <span className="text-xs text-white/80">Sin datos históricos</span>
                    </div>
                  )}

                  {/* Indicador de clic */}
                  {hasMonthlyData && (
                    <div className="text-center">
                      <span className="text-xs text-white font-bold drop-shadow-md">Clic para ver detalle</span>
                    </div>
                  )}

                  {/* Icono de expansión */}
                  <div className="absolute top-2 right-2 w-5 h-5 text-white/70 opacity-90">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Título con gradiente */}
              <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Promedio mensual
              </h3>
              <p className="text-sm text-gray-600 text-center font-semibold">
                Tendencia histórica
              </p>
            </div>
          );
        })()}

        {/* Métrica de Estado Académico - Diseño original con colores corregidos */}
        <div className="flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-200">
          <div className="relative mb-10">
            {/* Contenedor principal rediseñado MÁS GRANDE */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200 rounded-3xl shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-200 border-2 border-gray-300 p-6 sm:p-8 backdrop-blur-sm bg-white/25 border border-white/20 hover:scale-105 hover:-translate-y-1">

              {/* Estado actual destacado MÁS GRANDE */}
              <div className="text-center mb-4 sm:mb-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center shadow-xl ring-4 sm:ring-6 lg:ring-8 mb-3 sm:mb-4 transition-all duration-200 animate-pulse drop-shadow-lg ${finalMetricsData.academicStatus.level === 'R' ? 'bg-gradient-to-br from-red-600 to-red-700 ring-red-200 group-hover:ring-red-300' :
                  finalMetricsData.academicStatus.level === 'A' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-yellow-200 group-hover:ring-yellow-300' :
                    'bg-gradient-to-br from-green-600 to-green-700 ring-green-200 group-hover:ring-green-300'
                  } group-hover:ring-8 sm:group-hover:ring-10 lg:group-hover:ring-12 group-hover:shadow-2xl`}>
                  <span className="text-white font-black text-xl sm:text-2xl lg:text-3xl drop-shadow-sm">
                    {finalMetricsData.academicStatus.level}
                  </span>
                </div>
                <div className={`text-base sm:text-lg font-black ${finalMetricsData.academicStatus.level === 'R' ? 'text-red-700' :
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
                    className={`w-6 h-6 rounded-full cursor-help transition-all duration-150 ${finalMetricsData.academicStatus.level === status.level ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
                      } ${status.level === 'R' ? 'bg-red-600' :
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
          <h3 className="text-gray-700 font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors duration-200">
            Estado académico
          </h3>
          <p className="text-base text-gray-500 text-center leading-relaxed">
            Evaluación actual
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

        {/* Gráfico de Actividades / Quiz - Diseño Moderno Premium */}
        {(() => {
          const hasActivityData = currentMetricsData.activityProgress &&
            currentMetricsData.activityProgress.length > 0 &&
            currentMetricsData.activityProgress.some(item => (item.activities > 0 || item.quizts > 0));

          if (!hasActivityData) return null;

          return (
            <div
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => setIsActivitiesChartModalOpen(true)}
            >
              {/* Contenedor con gradiente moderno */}
              <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">

                {/* Efectos de fondo decorativos */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-xl"></div>

                {/* Contenido relativo */}
                <div className="relative z-10">

                  {/* Título con icono */}
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-4 py-2 mb-3 shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v9h2v-9zm4-4h-2v13h2V7zm4-3h-2v16h2V4z" />
                      </svg>
                      <h3 className="text-base font-black">Actividades / Quiz</h3>
                    </div>
                  </div>

                  {/* Línea de tendencia mejorada */}
                  <div className="mb-4">
                    <svg className="w-full h-8" viewBox="0 0 200 32">
                      <defs>
                        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#trendGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="20,20 60,18 100,15 140,12 180,8"
                      />
                      <polygon
                        fill="#8b5cf6"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        points="180,5 188,8 180,11"
                      />
                    </svg>
                  </div>

                  {/* Gráfico de barras mejorado con gradientes */}
                  <div className="flex items-end justify-center space-x-4 h-24 mb-5">
                    {currentMetricsData.activityProgress.slice(-4).map((item, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="flex items-end space-x-1">
                          {/* Barra de Actividades con gradiente */}
                          <div className="relative group/bar">
                            <div
                              className="w-4 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                              style={{ height: `${Math.max(8, (item.activities / 100) * 80)}px` }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-blue-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                              {item.activities}%
                            </div>
                          </div>
                          {/* Barra de Quizzes con gradiente */}
                          <div className="relative group/bar">
                            <div
                              className="w-4 rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                              style={{ height: `${Math.max(8, (item.quizts / 100) * 80)}px` }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-purple-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                              {item.quizts}%
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{item.period}</span>
                      </div>
                    ))}
                  </div>

                  {/* Leyenda mejorada */}
                  <div className="flex justify-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-600 to-blue-400 shadow-md"></div>
                      <span className="text-sm font-semibold text-gray-700">Actividades</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-purple-600 to-purple-400 shadow-md"></div>
                      <span className="text-sm font-semibold text-gray-700">Quizzes</span>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center text-blue-600 font-bold text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-blue-200 shadow-md hover:shadow-lg transition-all group-hover:scale-105">
                      <span>Clic para ver detalle</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Números finales con diseño mejorado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-4 border-2 border-blue-200 shadow-md">
                      <div className="text-3xl font-black text-blue-600 mb-1">
                        {currentMetricsData.activities.current}
                      </div>
                      <div className="text-xs font-bold text-blue-700 mb-1">Actividades</div>
                      <div className="text-xs text-blue-500">de {currentMetricsData.activities.total}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-4 border-2 border-purple-200 shadow-md">
                      <div className="text-3xl font-black text-purple-600 mb-1">
                        {currentMetricsData.quiz.current}
                      </div>
                      <div className="text-xs font-bold text-purple-700 mb-1">Quizzes</div>
                      <div className="text-xs text-purple-500">de {currentMetricsData.quiz.total}</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* Resultados por materia - Representación Visual Exacta */}
        {(() => {
          const hasSubjectData = currentMetricsData.subjectResults &&
            currentMetricsData.subjectResults.subjects &&
            currentMetricsData.subjectResults.subjects.length > 0 &&
            currentMetricsData.subjectResults.total > 0;

          if (!hasSubjectData) return null;

          return (
            <div
              className="cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => setIsSubjectResultsModalOpen(true)}
            >
              {/* Título simple */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8z" />
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
          );
        })()}

        {/* Gráfica 1: Simuladores Generales */}
        {(() => {
          // Mostrar siempre que haya datos, incluso si todos tienen 0%
          const hasGeneralData = currentMetricsData.simulatorGrades?.generales?.length > 0;

          if (!hasGeneralData) return null;

          return (
            <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
              {/* Contenedor con gradiente azul-índigo */}
              <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">

                {/* Efectos decorativos */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-xl"></div>

                {/* Contenido */}
                <div className="relative z-10">

                  {/* Título */}
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-4 py-2 mb-3 shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <h3 className="text-base font-black">Simuladores Generales</h3>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Áreas Fundamentales</p>
                  </div>

                  {/* Barras horizontales */}
                  <div className="space-y-3">
                    {currentMetricsData.simulatorGrades.generales.map((item, index) => (
                      <div key={index} className="group/bar">
                        {/* Etiqueta arriba de la barra */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold" style={{ color: item.color }}>
                            {item.area}
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {item.puntaje}%
                          </span>
                        </div>
                        {/* Barra */}
                        <div className="w-full bg-white/60 backdrop-blur-sm h-3 relative flex items-center overflow-hidden rounded-full border border-gray-200 shadow-sm">
                          <div
                            className="h-full transition-all duration-500 ease-out rounded-full shadow-inner"
                            style={{
                              width: `${Math.max(item.puntaje, 2)}%`,
                              background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* Gráfica 2: Módulos Específicos */}
        {(() => {
          const hasSpecificData = currentMetricsData.simulatorGrades?.especificos?.length > 0 &&
            currentMetricsData.simulatorGrades.especificos.some(item => item.puntaje > 0);

          if (!hasSpecificData) return null;

          return (
            <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
              {/* Contenedor con gradiente púrpura-rosa */}
              <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-xl border-2 border-purple-200/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">

                {/* Efectos decorativos */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100/40 to-purple-100/40 rounded-full blur-xl"></div>

                {/* Contenido */}
                <div className="relative z-10">

                  {/* Título */}
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 mb-3 shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <h3 className="text-base font-black">Módulos Específicos</h3>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Simuladores por Universidad</p>
                  </div>

                  {/* Barras */}
                  <div className="space-y-4">
                    {currentMetricsData.simulatorGrades.especificos.map((item, index) => {
                      // Truncar nombre si es muy largo
                      const nombreCompleto = item.modulo || 'Sin nombre';
                      const nombreTruncado = nombreCompleto.length > 25
                        ? nombreCompleto.substring(0, 22) + '...'
                        : nombreCompleto;

                      return (
                        <div key={index} className="group/bar">
                          {/* Etiqueta arriba de la barra */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-xs font-bold text-purple-600 truncate max-w-[70%]"
                              title={nombreCompleto}
                            >
                              {nombreTruncado}
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {item.puntaje}%
                            </span>
                          </div>
                          {/* Barra */}
                          <div className="w-full bg-white/60 backdrop-blur-sm h-3 relative flex items-center overflow-hidden rounded-full border border-gray-200 shadow-sm">
                            <div
                              className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-inner"
                              style={{ width: `${Math.max(item.puntaje, 2)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })()}


        {/* Feedback - Velocímetro Mejorado y Más Grande */}
        <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
          {/* Contenedor con gradiente moderno */}
          <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-xl border-2 border-purple-200/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">

            {/* Efectos de fondo decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-100/40 to-purple-100/40 rounded-full blur-xl"></div>

            {/* Contenido relativo */}
            <div className="relative z-10">

              {/* Título con icono */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 mb-3 shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <h3 className="text-base font-black">Feedback</h3>
                </div>
              </div>

              {/* Gráfica de Velocímetro Mejorada y Más Grande */}
              {(() => {
                const score = currentMetricsData.feedbackScore || 0;
                const performanceLevel = calculatePerformanceLevel(score);
                const feedback = getMotivationalFeedback(score);

                // Calcular el ángulo de la aguja basado en el score (0-100 -> 0-180 grados)
                // El velocímetro va de 0° (izquierda) a 180° (derecha)
                const needleAngle = (score / 100) * 180;

                // Definir los niveles con emojis, colores y posiciones
                const levels = [
                  { level: 'E', emoji: '😟', color: '#DC2626', startAngle: 0, endAngle: 36, name: 'Nível E', gradient: 'from-red-600 to-red-700' },
                  { level: 'D', emoji: '😐', color: '#F97316', startAngle: 36, endAngle: 72, name: 'Nível D', gradient: 'from-orange-500 to-orange-600' },
                  { level: 'C', emoji: '🙂', color: '#FCD34D', startAngle: 72, endAngle: 108, name: 'Nível C', gradient: 'from-yellow-400 to-yellow-500' },
                  { level: 'B', emoji: '😊', color: '#F59E0B', startAngle: 108, endAngle: 144, name: 'Nível B', gradient: 'from-amber-500 to-amber-600' },
                  { level: 'A', emoji: '🎉', color: '#10B981', startAngle: 144, endAngle: 180, name: 'Nível A', gradient: 'from-green-500 to-green-600' }
                ];

                const centerX = 150;
                const centerY = 150;
                const radius = 110;
                const innerRadius = 70;

                // Función para convertir ángulo a coordenadas (0° = izquierda, 180° = derecha)
                const angleToCoord = (angle, r = radius) => {
                  // Convertir ángulo del velocímetro (0-180) a ángulo matemático (180-0)
                  const mathAngle = 180 - angle;
                  const rad = mathAngle * (Math.PI / 180);
                  return {
                    x: centerX + r * Math.cos(rad),
                    y: centerY - r * Math.sin(rad) // Negativo porque Y aumenta hacia abajo
                  };
                };

                return (
                  <div className="flex flex-col items-center">
                    {/* SVG del velocímetro mejorado */}
                    <svg width="320" height="200" viewBox="0 0 320 200" className="mb-4 drop-shadow-lg">
                      {/* Fondo del semicírculo (gris claro) */}
                      <path
                        d={`M ${centerX} ${centerY} L ${angleToCoord(0, radius).x} ${angleToCoord(0, radius).y} A ${radius} ${radius} 0 0 1 ${angleToCoord(180, radius).x} ${angleToCoord(180, radius).y} Z`}
                        fill="#f3f4f6"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />

                      {/* Arcos de los niveles con gradiente */}
                      {levels.map((level) => {
                        const start = angleToCoord(level.startAngle, radius);
                        const end = angleToCoord(level.endAngle, radius);
                        const largeArc = level.endAngle - level.startAngle > 180 ? 1 : 0;

                        return (
                          <g key={level.level}>
                            {/* Sombra del arco */}
                            <path
                              d={`M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
                              fill="rgba(0,0,0,0.1)"
                              transform={`translate(2, 2)`}
                            />
                            {/* Arco principal */}
                            <path
                              d={`M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
                              fill={level.color}
                              stroke="#fff"
                              strokeWidth="3"
                              opacity={performanceLevel.level === level.level ? 1 : 0.5}
                              className="transition-opacity duration-300"
                            />
                            {/* Borde interno para profundidad */}
                            <path
                              d={`M ${centerX} ${centerY} L ${angleToCoord(level.startAngle, innerRadius).x} ${angleToCoord(level.startAngle, innerRadius).y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${angleToCoord(level.endAngle, innerRadius).x} ${angleToCoord(level.endAngle, innerRadius).y} Z`}
                              fill="rgba(255,255,255,0.3)"
                            />
                          </g>
                        );
                      })}

                      {/* Líneas divisorias entre niveles con sombra */}
                      {levels.slice(0, -1).map((level) => {
                        const coord = angleToCoord(level.endAngle, radius);
                        const innerCoord = angleToCoord(level.endAngle, innerRadius);
                        return (
                          <g key={`divider-${level.level}`}>
                            <line
                              x1={innerCoord.x}
                              y1={innerCoord.y}
                              x2={coord.x}
                              y2={coord.y}
                              stroke="rgba(0,0,0,0.1)"
                              strokeWidth="2"
                              transform="translate(1, 1)"
                            />
                            <line
                              x1={innerCoord.x}
                              y1={innerCoord.y}
                              x2={coord.x}
                              y2={coord.y}
                              stroke="#fff"
                              strokeWidth="2.5"
                            />
                          </g>
                        );
                      })}

                      {/* Aguja mejorada con sombra y punta */}
                      {(() => {
                        const needleCoord = angleToCoord(needleAngle, radius - 5);
                        const needleBase = angleToCoord(needleAngle, 15);

                        return (
                          <g>
                            {/* Sombra de la aguja */}
                            <line
                              x1={centerX + 1}
                              y1={centerY + 1}
                              x2={needleCoord.x + 1}
                              y2={needleCoord.y + 1}
                              stroke="rgba(0,0,0,0.2)"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            {/* Aguja principal */}
                            <line
                              x1={centerX}
                              y1={centerY}
                              x2={needleCoord.x}
                              y2={needleCoord.y}
                              stroke="#1f2937"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            {/* Base de la aguja (triángulo) */}
                            <polygon
                              points={`${centerX},${centerY} ${needleBase.x - 8},${needleBase.y} ${needleBase.x + 8},${needleBase.y}`}
                              fill="#1f2937"
                            />
                            {/* Círculo central con gradiente */}
                            <circle
                              cx={centerX}
                              cy={centerY}
                              r="12"
                              fill="#1f2937"
                              stroke="#fff"
                              strokeWidth="3"
                            />
                            <circle
                              cx={centerX}
                              cy={centerY}
                              r="6"
                              fill="#fff"
                            />
                          </g>
                        );
                      })()}

                      {/* Etiquetas de niveles con emojis - Emojis arriba, textos abajo */}
                      {levels.map((level) => {
                        const midAngle = (level.startAngle + level.endAngle) / 2;
                        const isActive = performanceLevel.level === level.level;

                        // Emoji en la parte superior del arco (más cerca del borde)
                        const emojiRadius = radius * 0.95;
                        const emojiCoord = angleToCoord(midAngle, emojiRadius);

                        // Texto en la parte inferior, cerca del centro del velocímetro
                        const textRadius = radius * 0.50;
                        const textCoord = angleToCoord(midAngle, textRadius);

                        return (
                          <g key={`label-${level.level}`}>
                            {/* Fondo circular para el emoji - en la parte superior */}
                            <circle
                              cx={emojiCoord.x}
                              cy={emojiCoord.y}
                              r="20"
                              fill={isActive ? level.color : "#f3f4f6"}
                              stroke={isActive ? "#fff" : "#e5e7eb"}
                              strokeWidth={isActive ? "3" : "2"}
                              className="transition-all duration-300"
                            />
                            {/* Emoji - centrado en el círculo superior */}
                            <text
                              x={emojiCoord.x}
                              y={emojiCoord.y + 6}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="22"
                              className="select-none pointer-events-none"
                            >
                              {level.emoji}
                            </text>
                            {/* Nombre del nivel en la parte inferior, cerca del centro */}
                            <text
                              x={textCoord.x}
                              y={textCoord.y + 5}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fontWeight="bold"
                              fill={isActive ? level.color : "#6b7280"}
                              className="transition-all duration-300"
                            >
                              {level.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Mensaje motivacional mejorado */}
                    <div className="text-center mt-2 px-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl">{feedback.emoji}</span>
                        <div className="text-3xl font-black text-gray-800">{score}%</div>
                      </div>
                      <div className={`text-xl font-bold mb-2 px-4 py-2 rounded-lg ${performanceLevel.level === 'A' ? 'bg-green-50 text-green-700' :
                        performanceLevel.level === 'B' ? 'bg-amber-50 text-amber-700' :
                          performanceLevel.level === 'C' ? 'bg-yellow-50 text-yellow-700' :
                            performanceLevel.level === 'D' ? 'bg-orange-50 text-orange-700' :
                              'bg-red-50 text-red-700'
                        }`}>
                        {feedback.message}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{feedback.description}</div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>

      </div> {/* Close grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 */}

      {/* Modal para el Gráfico de Actividades / Quizt */}
      <ChartModal
        isOpen={isActivitiesChartModalOpen}
        onClose={() => setIsActivitiesChartModalOpen(false)}
        title="Avance Mensual de Actividades y Quizts"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-semibold mb-1">Total Actividades</div>
                <div className="text-2xl font-bold text-blue-700">
                  {currentMetricsData.activities.current} / {currentMetricsData.activities.total}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {currentMetricsData.activities.total > 0
                    ? Math.round((currentMetricsData.activities.current / currentMetricsData.activities.total) * 100)
                    : 0}% completadas
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-semibold mb-1">Total Quizts</div>
                <div className="text-2xl font-bold text-purple-700">
                  {currentMetricsData.quiz.current} / {currentMetricsData.quiz.total}
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  {currentMetricsData.quiz.total > 0
                    ? Math.round((currentMetricsData.quiz.current / currentMetricsData.quiz.total) * 100)
                    : 0}% aprobados
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentMetricsData.activityProgress}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Meses', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar dataKey="activities" name="Actividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="quizts" name="Quizts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartModal>

      {/* Modal para el Gráfico de Promedio Mensual con Material UI */}
      <ChartModal
        isOpen={isMonthlyAverageModalOpen}
        onClose={() => setIsMonthlyAverageModalOpen(false)}
        title="Evolución del Promedio Mensual - Últimos 12 Meses"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold mb-1">Promedio General</div>
              <div className="text-3xl font-bold text-blue-700">
                {finalMetricsData.monthlyAverage}%
              </div>
              <div className="text-xs text-blue-500 mt-1">
                Basado en {finalMetricsData.monthlyAverageData?.length || 0} meses de datos
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center bg-white rounded-lg p-4">
            <MUIBarChart
              width={typeof window !== 'undefined' ? Math.min(800, window.innerWidth - 100) : 800}
              height={450}
              dataset={finalMetricsData.monthlyAverageData || []}
              xAxis={[{
                scaleType: 'band',
                dataKey: 'month',
                label: 'Meses',
                labelStyle: { fontSize: 14, fill: '#6b7280' }
              }]}
              yAxis={[{
                label: 'Promedio (%)',
                min: 0,
                max: 100,
                labelStyle: { fontSize: 14, fill: '#6b7280' }
              }]}
              series={[
                {
                  dataKey: 'promedio',
                  label: 'Promedio Mensual',
                  color: '#3b82f6'
                }
              ]}
              margin={{ left: 80, right: 30, top: 30, bottom: 80 }}
              sx={{
                '& .MuiChartsAxis-line': {
                  stroke: '#6b7280',
                  strokeWidth: 2,
                },
                '& .MuiChartsAxis-tick': {
                  stroke: '#6b7280',
                },
                '& .MuiChartsAxis-tickLabel': {
                  fill: '#374151',
                  fontSize: '12px',
                  fontWeight: 500,
                },
                '& .MuiChartsLegend-label': {
                  fill: '#374151',
                  fontSize: '14px',
                  fontWeight: 600,
                },
                '& .MuiChartsBar-root': {
                  rx: 8,
                }
              }}
            />
          </div>
        </div>
      </ChartModal>

      {/* Modal para el Gráfico de Resultados por Materia */}
      <ChartModal
        isOpen={isSubjectResultsModalOpen}
        onClose={() => setIsSubjectResultsModalOpen(false)}
        title="Resultados Detallados por Materia - 1er Simulador"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {/* Resumen general */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 text-center">
              <div className="text-sm text-purple-600 font-semibold mb-1">Puntuación General del Simulador</div>
              <div className="text-4xl font-bold text-purple-700">
                {currentMetricsData.subjectResults.total}%
              </div>
            </div>
          </div>

          {/* Gráfico de pastel */}
          <div style={{ width: '100%', height: '400px', marginBottom: '24px' }}>
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
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Información adicional en el modal */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Desglose por Materia
                </h4>
                <div className="space-y-2">
                  {currentMetricsData.subjectResults.subjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-sm shadow-sm"
                          style={{ backgroundColor: subject.color }}
                        ></div>
                        <span className="font-semibold text-gray-700">{subject.code}</span>
                        <span className="text-xs text-gray-500">({subject.fullName})</span>
                      </div>
                      <span className="text-gray-700 font-bold">{subject.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Recomendaciones
                </h4>
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm font-semibold text-red-700 mb-1">
                      Materias por reforzar:
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      {recommendedSubjects.length > 0 ? recommendedSubjects.join(', ') : 'Ninguna'}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {recommendationMessage}
                    </p>
                  </div>
                </div>
              </div>
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
                      <path d="M4 4v18l6-3 6 3 6-3V4l-6 3-6-3-6 3z" />
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
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// NOTA: STUDENT_PROFILES ya no se usa - se eliminó la funcionalidad de testing
// Se mantiene aquí solo como referencia/documentación
// eslint-disable-next-line no-unused-vars
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