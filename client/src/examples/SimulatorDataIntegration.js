// Ejemplo de cómo conectar con datos reales

// 1. Función para obtener datos del simulador desde la API
const fetchSimulatorResults = async (studentId) => {
  try {
    const response = await fetch(`/api/students/${studentId}/simulator-results`);
    const data = await response.json();
    
    return {
      simulatorGrades: data.simulators.map((sim, index) => ({
        label: `${index + 1}${getOrdinalSuffix(index + 1)}`, // 1ero, 2do, 3ero, 4to
        score: sim.score,
        color: getSimulatorColor(sim.score), // Función para asignar color basado en score
        simulatorId: sim.id,
        date: sim.date,
        subjects: sim.subjects // Para detalles adicionales
      }))
    };
  } catch (error) {
    console.error('Error fetching simulator results:', error);
    // Fallback a datos mock en caso de error
    return DEFAULT_METRICS_DATA.simulatorGrades;
  }
};

// 2. Función auxiliar para obtener sufijo ordinal
const getOrdinalSuffix = (num) => {
  if (num === 1) return 'ero';
  if (num === 2) return 'do';
  if (num === 3) return 'ero';
  if (num === 4) return 'to';
  return 'to'; // Para 5to, 6to, etc.
};

// 3. Función para asignar colores basados en el puntaje
const getSimulatorColor = (score) => {
  if (score >= 80) return '#10B981'; // Verde - Excelente
  if (score >= 70) return '#EC4899'; // Rosa - Bueno
  if (score >= 60) return '#8B5CF6'; // Púrpura - Regular
  if (score >= 50) return '#6366F1'; // Azul - Bajo
  return '#EF4444'; // Rojo - Muy bajo
};

// 4. Hook personalizado para usar datos reales
import { useState, useEffect } from 'react';

const useSimulatorData = (studentId) => {
  const [simulatorData, setSimulatorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSimulatorData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSimulatorResults(studentId);
        setSimulatorData(data.simulatorGrades);
      } catch (err) {
        setError(err.message);
        // Usar datos mock como fallback
        setSimulatorData(DEFAULT_METRICS_DATA.simulatorGrades);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      loadSimulatorData();
    }
  }, [studentId]);

  return { simulatorData, isLoading, error };
};

// 5. Uso en el componente principal
const AlumnoDashboardMetrics = () => {
  const { student } = useStudent(); // Contexto del estudiante
  const { simulatorData, isLoading } = useSimulatorData(student?.id);

  // Combinar con otros datos
  const finalMetricsData = {
    ...DEFAULT_METRICS_DATA,
    simulatorGrades: simulatorData, // Usar datos reales
  };

  // El resto del componente usa finalMetricsData.simulatorGrades
  // que ahora contiene datos reales
};

export default AlumnoDashboardMetrics;
