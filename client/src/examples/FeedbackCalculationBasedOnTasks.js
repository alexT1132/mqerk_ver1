// examples/FeedbackCalculationBasedOnTasks.js
// Ejemplo de cálculo de feedback basado en el sistema de tareas del componente Feedback_Alumno_Comp

/**
 * FUNCIÓN PARA CALCULAR FEEDBACK BASADO EN TAREAS
 * Simula el mismo sistema de puntos que usa Feedback_Alumno_Comp.jsx
 */
export const calculateFeedbackFromTasks = (tasks) => {
  // Cada tarea entregada vale 10 puntos
  const POINTS_PER_TASK = 10;
  
  // Calcular puntos totales (igual que en Feedback_Alumno_Comp)
  const totalPoints = tasks.reduce((sum, task) => sum + (task.score || 0), 0);
  
  // Calcular estadísticas
  const submittedTasks = tasks.filter(task => task.isSubmitted);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (submittedTasks.length / totalTasks) * 100 : 0;
  
  // Calcular puntaje de feedback (0-100) basado en múltiples factores
  let feedbackScore = 0;
  
  // Factor 1: Tasa de completación (50% del puntaje)
  const completionScore = completionRate * 0.5;
  
  // Factor 2: Puntos totales obtenidos vs máximo posible (30% del puntaje)
  const maxPossiblePoints = totalTasks * POINTS_PER_TASK;
  const pointsScore = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 * 0.3 : 0;
  
  // Factor 3: Consistencia en entregas (20% del puntaje)
  // Si ha entregado al menos 3 tareas, obtiene puntos extra por consistencia
  const consistencyScore = submittedTasks.length >= 3 ? 20 : (submittedTasks.length / 3) * 20;
  
  feedbackScore = Math.round(completionScore + pointsScore + consistencyScore);
  
  // Asegurar que esté en el rango 0-100
  feedbackScore = Math.max(0, Math.min(100, feedbackScore));
  
  return {
    feedbackScore,
    totalPoints,
    submittedTasks: submittedTasks.length,
    totalTasks,
    completionRate: Math.round(completionRate),
    pointsPerTask: POINTS_PER_TASK,
    maxPossiblePoints
  };
};

/**
 * DATOS DE EJEMPLO COMPATIBLE CON EL COMPONENTE EXISTENTE
 */
export const exampleTasksData = [
  {
    id: 1,
    name: 'Operaciones fundamentales',
    dueDate: '2025-12-02T23:59:59',
    submittedPdf: null,
    isSubmitted: true,
    score: 10, // 10 puntos por completar
  },
  {
    id: 2,
    name: 'Expresiones Algebraicas',
    dueDate: '2025-12-02T23:59:59',
    submittedPdf: null,
    isSubmitted: true,
    score: 10,
  },
  {
    id: 3,
    name: 'Geometría Básica',
    dueDate: '2025-07-15T23:59:59',
    submittedPdf: null,
    isSubmitted: false,
    score: null,
  },
  {
    id: 4,
    name: 'Cálculo Diferencial',
    dueDate: '2025-08-01T23:59:59',
    submittedPdf: null,
    isSubmitted: false,
    score: null,
  },
];

/**
 * MENSAJES MOTIVACIONALES EXACTOS DEL COMPONENTE ORIGINAL
 */
export const motivationalWords = [
  "¡Genial, sigue así!",
  "¡Excelente trabajo!",
  "¡Imparable, lo lograste!",
  "¡Muy bien hecho!",
  "¡Orgulloso de ti!",
  "¡Brillante desempeño!",
  "¡Increíble esfuerzo!",
  "¡Vas por buen camino!",
  "¡Sigue brillando!",
  "¡Tu dedicación inspira!",
  "¡Aprender es crecer!",
  "¡Nunca te rindas!",
  "¡Eres un ejemplo!",
  "¡Cada día mejoras más!",
  "¡Tu constancia da frutos!"
];

/**
 * FUNCIÓN PARA OBTENER MENSAJE MOTIVACIONAL ESPECÍFICO BASADO EN RENDIMIENTO
 */
export const getSpecificMotivationalMessage = (feedbackData) => {
  const { feedbackScore, submittedTasks, totalTasks, completionRate } = feedbackData;
  
  if (feedbackScore >= 90) {
    return {
      message: "¡EXCELENTE TRABAJO!",
      emoji: "🏆",
      description: `Has completado ${submittedTasks}/${totalTasks} tareas. ¡Rendimiento excepcional!`,
      celebration: motivationalWords[Math.floor(Math.random() * motivationalWords.length)]
    };
  } else if (feedbackScore >= 80) {
    return {
      message: "¡LO ESTÁS LOGRANDO!",
      emoji: "😊",
      description: `${submittedTasks}/${totalTasks} tareas completadas. ¡Muy buen progreso!`,
      celebration: motivationalWords[Math.floor(Math.random() * motivationalWords.length)]
    };
  } else if (feedbackScore >= 70) {
    return {
      message: "¡VAS MUY BIEN!",
      emoji: "🙂",
      description: `${submittedTasks}/${totalTasks} tareas completadas. ¡Continúa así!`,
      celebration: motivationalWords[Math.floor(Math.random() * motivationalWords.length)]
    };
  } else if (feedbackScore >= 60) {
    return {
      message: "¡SIGUE ADELANTE!",
      emoji: "😐",
      description: `${submittedTasks}/${totalTasks} tareas completadas. ¡Puedes mejorar!`,
      celebration: "¡No te rindas!"
    };
  } else if (feedbackScore >= 50) {
    return {
      message: "¡PUEDES MEJORAR!",
      emoji: "🙁",
      description: `${submittedTasks}/${totalTasks} tareas completadas. ¡Esfuérzate más!`,
      celebration: "¡Tú puedes hacerlo mejor!"
    };
  } else {
    return {
      message: "¡NO TE RINDAS!",
      emoji: "😢",
      description: `${submittedTasks}/${totalTasks} tareas completadas. ¡Es momento de esforzarte!`,
      celebration: "¡Cada paso cuenta!"
    };
  }
};

/**
 * HOOK PARA USAR EN EL DASHBOARD DE MÉTRICAS
 */
import { useState, useEffect } from 'react';

export const useFeedbackFromTasks = (tasks) => {
  const [feedbackData, setFeedbackData] = useState(null);
  
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const calculatedFeedback = calculateFeedbackFromTasks(tasks);
      const motivationalData = getSpecificMotivationalMessage(calculatedFeedback);
      
      setFeedbackData({
        ...calculatedFeedback,
        ...motivationalData
      });
    }
  }, [tasks]);
  
  return feedbackData;
};

/**
 * EJEMPLO DE USO EN EL COMPONENTE DE MÉTRICAS
 */
/*
// En Metrics_dash_alumnos_comp.jsx

import { useFeedbackFromTasks, exampleTasksData } from './examples/FeedbackCalculationBasedOnTasks';

const AlumnoDashboardMetrics = () => {
  // Obtener datos de tareas (esto vendría del backend o context)
  const [tasks, setTasks] = useState(exampleTasksData);
  
  // Calcular feedback basado en tareas
  const feedbackData = useFeedbackFromTasks(tasks);
  
  return (
    <div>
      {feedbackData && (
        <div className="feedback-section">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold">
              {feedbackData.feedbackScore}%
            </div>
            <div className="text-lg font-bold text-purple-600">
              {feedbackData.message}
            </div>
            <div className="text-sm text-gray-600">
              {feedbackData.description}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Total de puntos: {feedbackData.totalPoints} pts
            </div>
          </div>
          
          // Aquí va el medidor semicircular usando feedbackData.feedbackScore
        </div>
      )}
    </div>
  );
};
*/

/**
 * SIMULACIÓN DE ACTUALIZACIÓN EN TIEMPO REAL
 */
export const simulateTaskSubmission = (tasks, taskId) => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, isSubmitted: true, score: 10, submittedPdf: "fake-url" }
      : task
  );
};

// Ejemplo de prueba
console.log("Ejemplo de cálculo:");
const result = calculateFeedbackFromTasks(exampleTasksData);
console.log(result);
console.log(getSpecificMotivationalMessage(result));
