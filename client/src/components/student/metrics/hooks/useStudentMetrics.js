import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useCourse } from '../../../context/CourseContext.jsx';
import { resumenQuizzesEstudiante } from '../../../api/quizzes.js';
import { resumenActividadesEstudiante } from '../../../api/actividades.js';
import { resumenSimulacionesEstudiante } from '../../../api/simulaciones.js';
import { getResumenAsistenciaEstudiante } from '../../../api/asistencias.js';


/**
 * Function to get motivational feedback based on feedback score.
 * @param {number} score - Feedback score (0-100).
 * @returns {object} - Object with message, emoji, and style.
 */
export const getMotivationalFeedback = (score) => {
  if (score >= 90) {
    return {
      message: "EXCELLENT WORK!",
      emoji: "🏆",
      style: "text-green-600 bg-green-50 border-green-200",
      description: "Your performance is outstanding, keep it up!",
      topMessage: "YOU'RE DOING IT!"
    };
  } else if (score >= 80) {
    return {
      message: "YOU'RE DOING IT!",
      emoji: "😊",
      style: "text-green-600 bg-green-50 border-green-200",
      description: "Very good progress, you're on the right track",
      topMessage: "YOU'RE DOING IT!"
    };
  } else if (score >= 70) {
    return {
      message: "YOU'RE DOING GREAT!",
      emoji: "🙂",
      style: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Good work, keep pushing",
      topMessage: "YOU'RE DOING IT!"
    };
  } else if (score >= 60) {
    return {
      message: "KEEP GOING!",
      emoji: "💪",
      style: "text-orange-600 bg-orange-50 border-orange-200",
      description: "You're improving, don't give up",
      topMessage: "YOU'RE DOING IT!"
    };
  } else if (score >= 50) {
    return {
      message: "YOU CAN IMPROVE!",
      emoji: "⚠️",
      style: "text-red-600 bg-red-50 border-red-200",
      description: "You need a little more effort",
      topMessage: "YOU'RE DOING IT!"
    };
  } else {
    return {
      message: "DON'T GIVE UP!",
      emoji: "📚",
      style: "text-red-600 bg-red-50 border-red-200",
      description: "It's time to push harder",
      topMessage: "YOU'RE DOING IT!"
    };
  }
};

/**
 * Helper function to get a random motivational message (legacy).
 * @param {string[]} messages - Array of motivational messages.
 * @returns {string} A randomly selected motivational message.
 */
export const getRandomMotivationalMessage = (messages) => {
  if (!messages || messages.length === 0) {
    return "Keep going!"; // Fallback message
  }
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Generates dynamic recommendation messages and subjects to reinforce
 * based on simulator score and subject data.
 * @param {number} score - The simulator score (0-100).
 * @param {Object[]} allSubjectsData - Array of simulator subject objects.
 * @returns {{subjects: string[], message: string}} An object with subjects to reinforce and a recommendation message.
 */
export const getSimulatorRecommendation = (score, allSubjectsData) => {
  let subjectsToReinforce = [];
  let message = '';

  // Sort subjects by percentage in ascending order to identify lowest performing ones
  const sortedSubjects = [...allSubjectsData].sort((a, b) => a.percent - b.percent);

  if (score < 50) {
    // If score is low, reinforce the 2-3 subjects with lowest percentage
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 3)).map(s => s.fullName || s.code);
    message = 'It is crucial that you dedicate more time to daily study. Seek additional support and don\'t hesitate to ask.';
  } else if (score >= 50 && score < 70) {
    // If score is medium, reinforce the subject with lowest percentage
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 2)).map(s => s.fullName || s.code);
    message = 'You are progressing, but there are key areas that need more attention. Consistency is your best ally.';
  } else if (score >= 70 && score < 90) {
    // If score is good, maybe just one subject or general advice
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 1)).map(s => s.fullName || s.code);
    message = 'Excellent progress! Keep maintaining your study pace and focus on your areas of opportunity.';
  } else { // score >= 90
    // If score is outstanding, no specific subjects to reinforce
    subjectsToReinforce = [];
    message = 'Congratulations, your performance is outstanding! Continue challenging yourself and exploring new topics.';
  }

  // If no specific subjects identified, but score is not perfect, give general advice.
  if (subjectsToReinforce.length === 0 && score < 100) {
    subjectsToReinforce.push('Review your areas of opportunity');
  } else if (subjectsToReinforce.length === 0 && score === 100) {
    subjectsToReinforce.push('Maintain your excellent level');
  }

  return { subjects: subjectsToReinforce, message };
};

/**
 * Function to determine academic status based on metrics
 * @param {Object} metrics - Object with student metrics
 * @returns {Object} Academic status with level and description
 */
export const calculateAcademicStatus = (metrics) => {
  const { attendance, monthlyAverage, activities, quiz } = metrics;

  // Calculate weighted average
  const activityProgress = activities?.total ? (activities.current / activities.total) * 100 : 0;
  const quizProgress = quiz?.total ? (quiz.current / quiz.total) * 100 : 0;

  // Overall average considering all metrics
  const overallScore = (attendance * 0.2 + monthlyAverage * 0.4 + activityProgress * 0.2 + quizProgress * 0.2);

  if (overallScore >= 85) {
    return { level: 'D', color: 'green', description: 'Outstanding', score: overallScore };
  } else if (overallScore >= 65) {
    return { level: 'A', color: 'yellow', description: 'Active', score: overallScore };
  } else {
    return { level: 'R', color: 'red', description: 'Risk', score: overallScore };
  }
};

/**
 * Function to calculate performance level (E, D, C, B, A) based on score
 * @param {number} score - Feedback score (0-100)
 * @returns {Object} Object with level, color, angle and description
 */
export const calculatePerformanceLevel = (score) => {
  if (score >= 90) {
    return { level: 'A', color: '#10B981', angle: 162, name: 'Level A', description: 'Excellent' };
  } else if (score >= 75) {
    return { level: 'B', color: '#F59E0B', angle: 108, name: 'Level B', description: 'Good' };
  } else if (score >= 60) {
    return { level: 'C', color: '#FCD34D', angle: 54, name: 'Level C', description: 'Regular' };
  } else if (score >= 40) {
    return { level: 'D', color: '#F97316', angle: 18, name: 'Level D', description: 'Low' };
  } else {
    return { level: 'E', color: '#DC2626', angle: 0, name: 'Level E', description: 'Very low' };
  }
};

/**
 * Function to get motivational phrases based on academic status
 * @param {Object} academicStatus - Student's academic status
 * @returns {string} Personalized motivational phrase
 */
export const getAcademicMotivationalPhrase = (academicStatus) => {
  const riskPhrases = [
    "Every day is a new opportunity to improve. Don't give up, your effort is worth it!",
    "Great achievements require time and dedication. You're building your future step by step.",
    "Remember: it doesn't matter how slow you go, as long as you don't stop.",
    "Your potential is unlimited. You just need to find the study strategy that works for you.",
    "Study a little every day, not everything in one day: consistency beats fatigue.",
    "Every question you solve brings you closer to your goals. Keep going!",
    "There are no failures, only opportunities to learn and grow. You can do it!",
    "Success is not the absence of failure, but persistence through it."
  ];

  const activePhrases = [
    "You're on the right track! Your dedication is bearing fruit. Keep that pace.",
    "The knowledge you acquire today will be your strength tomorrow. Keep building!",
    "Your consistency is admirable. Every day of study brings you closer to your goals.",
    "You're demonstrating that discipline and effort always yield positive results.",
    "Excellent progress! Your future self will thank you for all the effort you're putting in now.",
    "Education is the most powerful weapon to change the world. You have it in your hands!",
    "Every topic you master is a personal victory. Celebrate your achievements and keep moving forward!",
    "Your growth mindset will take you far. Success is getting closer!"
  ];

  const outstandingPhrases = [
    "You're an inspiration! Your academic dedication is an example to others.",
    "Excellence is not an act, but a habit. And you've developed it perfectly.",
    "Your exceptional performance shows that when there's passion, there are no limits.",
    "Congratulations! You're writing a success story with every academic achievement.",
    "Your discipline and consistency have taken you to the top. Keep shining!",
    "You're living proof that hard work and dedication always triumph.",
    "Your academic excellence is a reflection of your exceptional character. Admirable!",
    "You're not just learning, you're mastering. Your future is extraordinary!"
  ];

  let phrases = [];

  switch (academicStatus.level) {
    case 'R': // Risk
      phrases = riskPhrases;
      break;
    case 'A': // Active
      phrases = activePhrases;
      break;
    case 'D': // Outstanding
      phrases = outstandingPhrases;
      break;
    default:
      phrases = activePhrases;
  }

  // Select a random phrase from the corresponding array
  return phrases[Math.floor(Math.random() * phrases.length)];
};

/**
 * Transforms API data to the format expected by the dashboard
 */
const transformApiDataToMetrics = (quizzesData, actividadesData, simulacionesData, asistenciaResumen) => {
  // Calculate quiz metrics
  const quizzesArray = Array.isArray(quizzesData) ? quizzesData : [];
  const quizzesAprobados = quizzesArray.filter(q => {
    const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
    return puntaje != null && Number(puntaje) >= 70;
  }).length;
  const totalQuizzes = quizzesArray.length;
  const quizProgress = totalQuizzes > 0 ? Math.round((quizzesAprobados / totalQuizzes) * 100) : 0;

  // Calculate activity metrics
  const actividadesArray = Array.isArray(actividadesData) ? actividadesData : [];
  const actividadesCompletadas = actividadesArray.filter(a => {
    const estado = a.entrega_estado;
    return estado === 'revisada' || estado === 'entregada';
  }).length;
  const totalActividades = actividadesArray.length;
  const activitiesProgress = totalActividades > 0 ? Math.round((actividadesCompletadas / totalActividades) * 100) : 0;

  // Calculate monthly average of quizzes (last attempt or best score)
  // Convert from 0-100 scale to 0-10 for calculation
  const quizScores = quizzesArray
    .map(q => {
      const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
      if (puntaje == null) return null;
      const score = Number(puntaje);
      // If score is greater than 10, assume it's on 0-100 scale and convert
      return score > 10 ? score / 10 : score;
    })
    .filter(p => p != null && p >= 0 && p <= 10);
  const monthlyAverage = quizScores.length > 0
    ? Math.round((quizScores.reduce((sum, p) => sum + p, 0) / quizScores.length) * 10) // Convert back to 0-100
    : 0;

  // Calculate activity average (grades)
  // Convert from 0-100 scale to 0-10 for calculation
  const actividadScores = actividadesArray
    .map(a => {
      const calif = a.calificacion;
      if (calif == null || isNaN(Number(calif))) return null;
      const score = Number(calif);
      // If grade is greater than 10, assume it's on 0-100 scale and convert
      return score > 10 ? score / 10 : score;
    })
    .filter(c => c != null && c >= 0 && c <= 10);
  const actividadAverage = actividadScores.length > 0
    ? Math.round((actividadScores.reduce((sum, c) => sum + c, 0) / actividadScores.length) * 10) // Convert back to 0-100
    : 0;

  // Overall average (weighted: 60% quizzes, 40% activities)
  // Only calculate if there is at least one type of data
  let overallAverage = 0;
  if (quizScores.length > 0 && actividadScores.length > 0) {
    overallAverage = Math.round((monthlyAverage * 0.6) + (actividadAverage * 0.4));
  } else if (quizScores.length > 0) {
    overallAverage = monthlyAverage;
  } else if (actividadScores.length > 0) {
    overallAverage = actividadAverage;
  }

  // Generate data for monthly progress chart (real history)
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getDate = (d) => d ? new Date(d) : null;

  // Helper to calculate cumulative averages by month
  const monthlyAverageData = months.map((month, idx) => {
    const limitDate = new Date(currentYear, idx + 1, 0, 23, 59, 59); // End of month

    // Filter quizzes up to that date
    const relevantQuizzes = quizzesArray.filter(q => {
      const fecha = getDate(q.fecha_oficial_intento ?? q.fecha_ultimo_intento ?? q.created_at);
      return fecha && fecha <= limitDate;
    }).map(q => {
      const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
      const val = Number(puntaje);
      return val > 10 ? val / 10 : val;
    }).filter(p => p != null && p >= 0 && p <= 10);

    // Filter activities up to that date
    const relevantActivities = actividadesArray.filter(a => {
      const fecha = getDate(a.fecha_entrega ?? a.created_at);
      return fecha && fecha <= limitDate;
    }).map(a => {
      const calif = a.calificacion;
      if (calif == null || isNaN(Number(calif))) return null;
      const val = Number(calif);
      return val > 10 ? val / 10 : val;
    }).filter(c => c != null && c >= 0 && c <= 10);

    // Calculate monthly average
    let promedio = 0;
    if (relevantQuizzes.length > 0 && relevantActivities.length > 0) {
      const quizAvg = relevantQuizzes.reduce((sum, p) => sum + p, 0) / relevantQuizzes.length;
      const actAvg = relevantActivities.reduce((sum, c) => sum + c, 0) / relevantActivities.length;
      promedio = Math.round(((quizAvg * 0.6 + actAvg * 0.4) * 10));
    } else if (relevantQuizzes.length > 0) {
      const quizAvg = relevantQuizzes.reduce((sum, p) => sum + p, 0) / relevantQuizzes.length;
      promedio = Math.round(quizAvg * 10);
    } else if (relevantActivities.length > 0) {
      const actAvg = relevantActivities.reduce((sum, c) => sum + c, 0) / relevantActivities.length;
      promedio = Math.round(actAvg * 10);
    }

    return {
      mes: month,
      promedio: promedio,
      quizzes: relevantQuizzes.length,
      actividades: relevantActivities.length
    };
  });

  // Calculate attendance percentage
  const attendancePercentage = asistenciaResumen?.porcentaje_asistencia || 0;

  // Calculate simulator metrics
  const simulacionesArray = Array.isArray(simulacionesData) ? simulacionesData : [];
  const simulacionesCompletadas = simulacionesArray.filter(s => s.estado === 'completada').length;
  const totalSimulaciones = simulacionesArray.length;
  const simulatorProgress = totalSimulaciones > 0 ? Math.round((simulacionesCompletadas / totalSimulaciones) * 100) : 0;

  // Calculate simulator average score
  const simulatorScores = simulacionesArray
    .map(s => {
      const puntaje = s.puntaje_total ?? s.puntaje;
      if (puntaje == null || isNaN(Number(puntaje))) return null;
      return Number(puntaje);
    })
    .filter(p => p != null && p >= 0 && p <= 100);
  const simulatorAverage = simulatorScores.length > 0
    ? Math.round(simulatorScores.reduce((sum, p) => sum + p, 0) / simulatorScores.length)
    : 0;

  // Return transformed metrics
  return {
    // Basic metrics
    attendance: attendancePercentage,
    monthlyAverage: overallAverage,
    activities: {
      current: actividadesCompletadas,
      total: totalActividades,
      progress: activitiesProgress
    },
    quiz: {
      current: quizzesAprobados,
      total: totalQuizzes,
      progress: quizProgress
    },
    simulator: {
      current: simulacionesCompletadas,
      total: totalSimulaciones,
      progress: simulatorProgress,
      average: simulatorAverage
    },
    
    // Detailed data for charts
    monthlyAverageData: monthlyAverageData.filter(m => m.promedio > 0),
    quizScores: quizScores.map(p => p * 10), // Convert back to 0-100 scale
    actividadScores: actividadScores.map(c => c * 10), // Convert back to 0-100 scale
    
    // Raw data for reference
    rawQuizzes: quizzesArray,
    rawActivities: actividadesArray,
    rawSimulaciones: simulacionesArray,
    rawAsistencia: asistenciaResumen
  };
};

/**
 * Main hook for fetching and managing student metrics
 */
const useStudentMetrics = () => {
  const { user } = useAuth();
  const { currentCourse } = useCourse();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const studentId = user?.id;
  const courseId = currentCourse?.id;

  const fetchMetrics = useCallback(async () => {
    if (!studentId || !courseId) {
      setError('Student ID or Course ID not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      if (!refreshing) {
        setLoading(true);
      }

      // Fetch all data in parallel
      const [quizzesData, actividadesData, simulacionesData, asistenciaResumen] = await Promise.all([
        resumenQuizzesEstudiante(studentId, courseId),
        resumenActividadesEstudiante(studentId, courseId),
        resumenSimulacionesEstudiante(studentId, courseId),
        getResumenAsistenciaEstudiante(studentId, courseId)
      ]);

      // Transform API data to metrics format
      const transformedMetrics = transformApiDataToMetrics(
        quizzesData,
        actividadesData,
        simulacionesData,
        asistenciaResumen
      );

      setMetrics(transformedMetrics);
    } catch (err) {
      console.error('Error fetching student metrics:', err);
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, courseId, refreshing]);

  // Initial fetch
  useEffect(() => {
    if (studentId && courseId) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [studentId, courseId, fetchMetrics]);

  // Refresh function
  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchMetrics();
  }, [fetchMetrics]);

  // Calculate academic status
  const academicStatus = useMemo(() => {
    if (!metrics) return null;
    return calculateAcademicStatus(metrics);
  }, [metrics]);

  // Get motivational phrase
  const motivationalPhrase = useMemo(() => {
    if (!academicStatus) return '';
    return getAcademicMotivationalPhrase(academicStatus);
  }, [academicStatus]);

  // Get performance level
  const performanceLevel = useMemo(() => {
    if (!metrics) return null;
    return calculatePerformanceLevel(metrics.monthlyAverage);
  }, [metrics]);

  // Get simulator recommendation
  const simulatorRecommendation = useMemo(() => {
    if (!metrics?.rawSimulaciones || metrics.rawSimulaciones.length === 0) {
      return { subjects: [], message: 'No simulator data available' };
    }
    
    const latestSimulation = metrics.rawSimulaciones[metrics.rawSimulaciones.length - 1];
    const subjectsData = latestSimulation?.materias_detalle || [];
    const score = latestSimulation?.puntaje_total || 0;
    
    return getSimulatorRecommendation(score, subjectsData);
  }, [metrics]);

  return {
    // State
    loading,
    error,
    metrics,
    refreshing,
    
    // Calculated values
    academicStatus,
    motivationalPhrase,
    performanceLevel,
    simulatorRecommendation,
    
    // Actions
    refresh,
    
    // Helper functions (exported for use in components)
    getMotivationalFeedback,
    getRandomMotivationalMessage,
    calculateAcademicStatus,
    calculatePerformanceLevel,
    getAcademicMotivationalPhrase,
    getSimulatorRecommendation
  };
};

export default useStudentMetrics;