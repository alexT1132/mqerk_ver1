/**
 * Servicio para manejar datos del simulador - SOLO DATOS SIMULADOS
 */

// Datos simulados para desarrollo
const SIMULATED_SIMULATOR_DATA = [
  { exam: 'Examen 1', label: '1ero', score: 70, date: '2024-01-15', color: '#e91e63' },
  { exam: 'Examen 2', label: '2do', score: 60, date: '2024-02-15', color: '#9c27b0' },
  { exam: 'Examen 3', label: '3ero', score: 40, date: '2024-03-15', color: '#673ab7' },
  { exam: 'Examen 4', label: '4to', score: 30, date: '2024-04-15', color: '#3f51b5' }
];

/**
 * Obtiene los resultados del simulador para un estudiante
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Object>} - Promesa que resuelve con los datos del simulador
 */
export const getSimulatorResults = async (studentId) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: SIMULATED_SIMULATOR_DATA,
      message: 'Resultados del simulador obtenidos exitosamente'
    };
  } catch (error) {
    console.error('Error al obtener resultados del simulador:', error);
    return {
      success: false,
      data: [],
      message: 'Error al cargar los resultados del simulador'
    };
  }
};

/**
 * Obtiene el promedio general del simulador
 * @param {Array} simulatorData - Datos del simulador
 * @returns {number} - Promedio general
 */
export const calculateSimulatorAverage = (simulatorData) => {
  if (!simulatorData || simulatorData.length === 0) return 0;
  
  const total = simulatorData.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / simulatorData.length);
};

/**
 * Obtiene el mejor resultado del simulador
 * @param {Array} simulatorData - Datos del simulador
 * @returns {Object} - Mejor resultado
 */
export const getBestSimulatorResult = (simulatorData) => {
  if (!simulatorData || simulatorData.length === 0) return null;
  
  return simulatorData.reduce((best, current) => 
    current.score > best.score ? current : best
  );
};

/**
 * Obtiene estadísticas del simulador
 * @param {Array} simulatorData - Datos del simulador
 * @returns {Object} - Estadísticas calculadas
 */
export const getSimulatorStats = (simulatorData) => {
  if (!simulatorData || simulatorData.length === 0) {
    return {
      average: 0,
      best: null,
      worst: null,
      total: 0
    };
  }

  const scores = simulatorData.map(item => item.score);
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const best = getBestSimulatorResult(simulatorData);
  const worst = simulatorData.reduce((worst, current) => 
    current.score < worst.score ? current : worst
  );

  return {
    average,
    best,
    worst,
    total: simulatorData.length
  };
};

export default {
  getSimulatorResults,
  calculateSimulatorAverage,
  getBestSimulatorResult,
  getSimulatorStats
};