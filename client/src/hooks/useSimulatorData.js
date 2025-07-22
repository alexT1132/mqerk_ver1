import { useState, useEffect } from 'react';
import { getSimulatorResults, getSimulatorStats } from '../services/simulatorService';

/**
 * Hook personalizado para manejar los datos del simulador - SOLO DATOS SIMULADOS
 * @param {string} studentId - ID del estudiante
 * @returns {Object} - Estado y funciones para manejar datos del simulador
 */
export const useSimulatorData = (studentId) => {
  const [simulatorData, setSimulatorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    average: 0,
    best: null,
    worst: null,
    total: 0
  });

  // Función para cargar datos del simulador
  const loadSimulatorData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSimulatorResults(studentId);
      
      if (result.success) {
        setSimulatorData(result.data);
        setStats(getSimulatorStats(result.data));
      } else {
        setError(result.message);
        setSimulatorData([]);
      }
    } catch (err) {
      setError('Error al cargar los datos del simulador');
      setSimulatorData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos
  const refreshData = () => {
    loadSimulatorData();
  };

  // Cargar datos al montar el componente o cambiar studentId
  useEffect(() => {
    if (useSimulatedData || studentId) {
      loadSimulatorData();
    }
  }, [studentId, useSimulatedData]);

  return {
    simulatorData,
    loading,
    error,
    stats,
    refreshData
  };
};

export default useSimulatorData;
