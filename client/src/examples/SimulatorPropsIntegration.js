// Ejemplo de cómo modificar el componente actual para datos dinámicos

// 1. Agregar props para datos externos
const AlumnoDashboardMetrics = ({ 
  userData = null, 
  metricsData = null,
  simulatorResults = null, // Nueva prop para datos del simulador
  onDataUpdate = null 
}) => {
  
  // 2. Función para procesar datos del simulador desde la API
  const processSimulatorData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) {
      return DEFAULT_METRICS_DATA.simulatorGrades;
    }

    return apiData.map((simulator, index) => ({
      label: `${index + 1}${getOrdinalSuffix(index + 1)}`,
      score: simulator.totalScore || simulator.score,
      color: getScoreColor(simulator.totalScore || simulator.score),
      id: simulator.id,
      date: simulator.completedAt,
      details: {
        subjects: simulator.subjectScores,
        timeSpent: simulator.timeSpent,
        questionsTotal: simulator.questionsTotal,
        questionsCorrect: simulator.questionsCorrect
      }
    }));
  };

  // 3. Usar datos reales si están disponibles
  const finalMetricsData = useMemo(() => {
    const baseData = metricsData || DEFAULT_METRICS_DATA;
    
    return {
      ...baseData,
      simulatorGrades: simulatorResults 
        ? processSimulatorData(simulatorResults)
        : baseData.simulatorGrades
    };
  }, [metricsData, simulatorResults]);

  // 4. El resto del componente permanece igual
  // ...existing code...
};

// 5. Ejemplo de uso con datos reales
const ParentComponent = () => {
  const [simulatorData, setSimulatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del simulador
    const loadData = async () => {
      try {
        const response = await fetch('/api/simulator-results/student/123');
        const data = await response.json();
        setSimulatorData(data.results);
      } catch (error) {
        console.error('Error loading simulator data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Cargando datos del simulador...</div>;
  }

  return (
    <AlumnoDashboardMetrics 
      simulatorResults={simulatorData}
      onDataUpdate={(newData) => {
        // Callback para actualizar datos si es necesario
        setSimulatorData(newData);
      }}
    />
  );
};

export default ParentComponent;
