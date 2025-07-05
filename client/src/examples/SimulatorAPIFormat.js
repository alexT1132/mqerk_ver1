// Formato esperado de datos de la API para el simulador

// GET /api/students/{studentId}/simulator-results
{
  "success": true,
  "data": {
    "studentId": "12345",
    "totalSimulators": 4,
    "averageScore": 55,
    "lastUpdated": "2025-01-15T10:30:00Z",
    "simulators": [
      {
        "id": "sim_001",
        "simulatorNumber": 1,
        "totalScore": 70,
        "completedAt": "2025-01-10T14:30:00Z",
        "timeSpent": "02:30:00",
        "questionsTotal": 120,
        "questionsCorrect": 84,
        "status": "completed",
        "subjects": [
          {
            "code": "E/R",
            "name": "Español y redacción indirecta",
            "score": 75,
            "questionsTotal": 30,
            "questionsCorrect": 22
          },
          {
            "code": "M/A", 
            "name": "Matemáticas y pensamiento analítico",
            "score": 65,
            "questionsTotal": 25,
            "questionsCorrect": 16
          }
          // ... más materias
        ]
      },
      {
        "id": "sim_002",
        "simulatorNumber": 2,
        "totalScore": 60,
        "completedAt": "2025-01-12T16:45:00Z",
        "timeSpent": "02:15:00",
        "questionsTotal": 120,
        "questionsCorrect": 72,
        "status": "completed",
        "subjects": [
          // ... datos de materias del segundo simulador
        ]
      },
      {
        "id": "sim_003",
        "simulatorNumber": 3,
        "totalScore": 40,
        "completedAt": "2025-01-14T11:20:00Z",
        "timeSpent": "01:55:00",
        "questionsTotal": 120,
        "questionsCorrect": 48,
        "status": "completed",
        "subjects": [
          // ... datos de materias del tercer simulador
        ]
      },
      {
        "id": "sim_004",
        "simulatorNumber": 4,
        "totalScore": 30,
        "completedAt": "2025-01-15T09:10:00Z",
        "timeSpent": "01:40:00",
        "questionsTotal": 120,
        "questionsCorrect": 36,
        "status": "completed",
        "subjects": [
          // ... datos de materias del cuarto simulador
        ]
      }
    ]
  }
}

// Ejemplo de transformación de datos
const transformApiDataToChart = (apiResponse) => {
  return apiResponse.data.simulators.map((sim, index) => ({
    label: `${index + 1}${getOrdinalSuffix(index + 1)}`,
    score: sim.totalScore,
    color: getScoreColor(sim.totalScore),
    metadata: {
      id: sim.id,
      date: sim.completedAt,
      timeSpent: sim.timeSpent,
      accuracy: Math.round((sim.questionsCorrect / sim.questionsTotal) * 100),
      subjects: sim.subjects
    }
  }));
};

// Ejemplo de uso en el componente
const loadSimulatorData = async (studentId) => {
  const response = await fetch(`/api/students/${studentId}/simulator-results`);
  const apiData = await response.json();
  
  if (apiData.success) {
    return transformApiDataToChart(apiData);
  } else {
    throw new Error('Failed to load simulator data');
  }
};
