// examples/FeedbackIntegrationComplete.js
// Ejemplo completo de integración del feedback con backend usando los datos de tareas del sistema

/**
 * EJEMPLO 1: Hook personalizado para obtener datos de feedback desde el backend
 */
import { useState, useEffect } from 'react';

export const useFeedbackData = (studentId) => {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de tareas completadas y calificaciones
        const tasksResponse = await fetch(`/api/students/${studentId}/tasks`);
        const tasksData = await tasksResponse.json();
        
        // Obtener datos de quiz y actividades
        const activitiesResponse = await fetch(`/api/students/${studentId}/activities`);
        const activitiesData = await activitiesResponse.json();
        
        // Obtener datos del simulador
        const simulatorResponse = await fetch(`/api/students/${studentId}/simulator-results`);
        const simulatorData = await simulatorResponse.json();
        
        // Calcular puntaje de feedback basado en múltiples factores
        const feedbackScore = calculateFeedbackScore({
          tasks: tasksData,
          activities: activitiesData,
          simulator: simulatorData
        });
        
        setFeedbackData({
          score: feedbackScore,
          tasksCompleted: tasksData.completed,
          totalTasks: tasksData.total,
          averageGrade: tasksData.averageGrade,
          activitiesCompleted: activitiesData.completed,
          quizAverage: activitiesData.quizAverage,
          simulatorAverage: simulatorData.average,
          lastUpdated: new Date().toISOString()
        });
        
      } catch (err) {
        setError('Error al cargar datos de feedback');
        console.error('Feedback data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchFeedbackData();
    }
  }, [studentId]);

  return { feedbackData, loading, error };
};

/**
 * EJEMPLO 2: Función para calcular el puntaje de feedback basado en múltiples factores
 */
export const calculateFeedbackScore = ({ tasks, activities, simulator }) => {
  // Peso de cada factor en el cálculo final
  const weights = {
    taskCompletion: 0.3,    // 30% - Completar tareas
    taskGrades: 0.25,       // 25% - Calificaciones de tareas
    activityProgress: 0.2,  // 20% - Progreso en actividades/quiz
    simulatorResults: 0.25  // 25% - Resultados del simulador
  };
  
  // Calcular puntaje de completar tareas (0-100)
  const taskCompletionScore = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;
  
  // Puntaje de calificaciones promedio (0-100)
  const taskGradesScore = tasks.averageGrade || 0;
  
  // Puntaje de actividades y quiz (0-100)
  const activityScore = (
    (activities.completed / activities.total) * 50 + // 50% por completar
    (activities.quizAverage || 0) * 0.5 // 50% por promedio de quiz
  );
  
  // Puntaje del simulador (0-100)
  const simulatorScore = simulator.average || 0;
  
  // Calcular puntaje final ponderado
  const finalScore = Math.round(
    (taskCompletionScore * weights.taskCompletion) +
    (taskGradesScore * weights.taskGrades) +
    (activityScore * weights.activityProgress) +
    (simulatorScore * weights.simulatorResults)
  );
  
  // Asegurar que esté en el rango 0-100
  return Math.max(0, Math.min(100, finalScore));
};

/**
 * EJEMPLO 3: Componente de feedback integrado con backend
 */
export const FeedbackComponentWithBackend = ({ studentId }) => {
  const { feedbackData, loading, error } = useFeedbackData(studentId);
  
  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Cargando feedback...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  if (!feedbackData) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600">No hay datos de feedback disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="feedback-component">
      {/* Aquí iría el componente de feedback visual con feedbackData.score */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-purple-600 mb-4">Feedback</h3>
        <div className="text-3xl font-bold text-gray-800 mb-2">
          {feedbackData.score}%
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Basado en {feedbackData.tasksCompleted}/{feedbackData.totalTasks} tareas completadas
        </div>
        {/* Aquí iría el medidor semicircular */}
      </div>
    </div>
  );
};

/**
 * EJEMPLO 4: Formato de datos que el backend debe proporcionar
 */
export const exampleBackendResponse = {
  // GET /api/students/{id}/tasks
  tasks: {
    completed: 8,
    total: 10,
    averageGrade: 85,
    recent: [
      { id: 1, name: "Operaciones fundamentales", score: 90, completed: true },
      { id: 2, name: "Expresiones Algebraicas", score: 80, completed: true },
      { id: 3, name: "Geometría Básica", score: 88, completed: true }
    ]
  },
  
  // GET /api/students/{id}/activities
  activities: {
    completed: 20,
    total: 24,
    quizAverage: 87,
    recent: [
      { type: "quiz", subject: "Matemáticas", score: 85 },
      { type: "activity", subject: "Física", score: 90 }
    ]
  },
  
  // GET /api/students/{id}/simulator-results
  simulator: {
    average: 78,
    recent: [
      { exam: "PAA", score: 80 },
      { exam: "College Board", score: 75 },
      { exam: "EXANI-II", score: 82 }
    ]
  }
};

/**
 * EJEMPLO 5: Integración con Context API
 */
export const FeedbackContext = createContext();

export const FeedbackProvider = ({ children, studentId }) => {
  const feedbackData = useFeedbackData(studentId);
  
  return (
    <FeedbackContext.Provider value={feedbackData}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Hook para usar el contexto
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  }
  return context;
};

/**
 * EJEMPLO 6: Actualización en tiempo real del feedback
 */
export const useRealtimeFeedback = (studentId) => {
  const [feedbackScore, setFeedbackScore] = useState(0);
  
  useEffect(() => {
    // Configurar WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket(`ws://localhost:3001/feedback/${studentId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'FEEDBACK_UPDATE') {
        setFeedbackScore(data.score);
      }
    };
    
    return () => ws.close();
  }, [studentId]);
  
  return feedbackScore;
};

/**
 * EJEMPLO 7: Como usar en el componente principal
 */
/*
// En tu componente Metrics_dash_alumnos_comp.jsx

import { useFeedbackData } from './examples/FeedbackIntegrationComplete';

const AlumnoDashboardMetrics = ({ studentId }) => {
  const { feedbackData, loading, error } = useFeedbackData(studentId);
  
  // Usar feedbackData.score en lugar de currentMetricsData.feedbackScore
  const feedbackScore = feedbackData?.score || 0;
  
  return (
    <div>
      // ... resto del componente
      {feedbackScore}% // En lugar de currentMetricsData.feedbackScore
    </div>
  );
};
*/
