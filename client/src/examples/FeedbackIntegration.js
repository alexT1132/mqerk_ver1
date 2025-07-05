// Ejemplo de integración entre Feedback_Alumno_Comp.jsx y Metrics_dash_alumnos_comp.jsx

// 1. En Feedback_Alumno_Comp.jsx - Calcular puntaje dinámico
const calculateFeedbackScore = (tasks) => {
  const completedTasks = tasks.filter(task => task.isSubmitted && task.score !== null);
  const totalTasks = tasks.length;
  const totalPoints = completedTasks.reduce((sum, task) => sum + task.score, 0);
  const maxPossiblePoints = totalTasks * 10; // Asumiendo 10 puntos por tarea
  
  return Math.round((totalPoints / maxPossiblePoints) * 100);
};

// 2. Hook personalizado para obtener datos de feedback
import { useState, useEffect } from 'react';

const useFeedbackScore = (studentId) => {
  const [feedbackData, setFeedbackData] = useState({
    score: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalPoints: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        // Opción 1: Cargar desde API
        const response = await fetch(`/api/students/${studentId}/feedback`);
        const data = await response.json();
        
        setFeedbackData({
          score: data.feedbackScore,
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          totalPoints: data.totalPoints
        });

        // Opción 2: Calcular desde tareas locales
        // const score = calculateFeedbackScore(tasks);
        // setFeedbackData(prev => ({ ...prev, score }));

      } catch (error) {
        console.error('Error loading feedback data:', error);
        // Usar datos por defecto
        setFeedbackData({
          score: 82, // Valor por defecto
          totalTasks: 4,
          completedTasks: 2,
          totalPoints: 20
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      loadFeedbackData();
    }
  }, [studentId]);

  return { feedbackData, isLoading };
};

// 3. Contexto compartido para datos de feedback
import { createContext, useContext, useState, useEffect } from 'react';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedbackScore, setFeedbackScore] = useState(82);
  const [tasks, setTasks] = useState([]);
  
  // Actualizar puntaje cuando cambian las tareas
  useEffect(() => {
    const newScore = calculateFeedbackScore(tasks);
    setFeedbackScore(newScore);
  }, [tasks]);

  const updateTask = (taskId, updates) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const value = {
    feedbackScore,
    tasks,
    setTasks,
    updateTask
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

// 4. Uso en el dashboard principal
const AlumnoDashboardMetrics = () => {
  const { feedbackScore } = useFeedback(); // Obtener del contexto
  // O usar el hook personalizado:
  // const { feedbackData } = useFeedbackScore(studentId);

  const finalMetricsData = {
    ...DEFAULT_METRICS_DATA,
    feedbackScore: feedbackScore, // Usar datos reales
  };

  // El resto del componente...
};

// 5. Estructura de datos esperada de la API
/*
GET /api/students/{studentId}/feedback

{
  "success": true,
  "data": {
    "studentId": "12345",
    "feedbackScore": 82,
    "totalTasks": 4,
    "completedTasks": 3,
    "totalPoints": 30,
    "maxPossiblePoints": 40,
    "lastUpdated": "2025-01-15T10:30:00Z",
    "tasks": [
      {
        "id": 1,
        "name": "Operaciones fundamentales",
        "isCompleted": true,
        "score": 10,
        "submittedAt": "2025-01-10T14:30:00Z"
      },
      {
        "id": 2,
        "name": "Expresiones Algebraicas", 
        "isCompleted": true,
        "score": 10,
        "submittedAt": "2025-01-12T16:45:00Z"
      },
      {
        "id": 3,
        "name": "Geometría Básica",
        "isCompleted": true,
        "score": 10,
        "submittedAt": "2025-01-14T11:20:00Z"
      },
      {
        "id": 4,
        "name": "Cálculo Diferencial",
        "isCompleted": false,
        "score": null,
        "submittedAt": null
      }
    ]
  }
}
*/

export { 
  calculateFeedbackScore, 
  useFeedbackScore, 
  FeedbackProvider, 
  useFeedback 
};
