/**
 * Helpers puros (sin estado / sin dependencias de React) para métricas del alumno.
 * Mantenerlos separados ayuda a reducir `Metrics_dash_alumnos_comp.jsx`.
 */

export const getMotivationalFeedback = (score) => {
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
  }

  return {
    message: "¡NO TE RINDAS!",
    emoji: "📚",
    style: "text-red-600 bg-red-50 border-red-200",
    description: "Es momento de esforzarse más",
    topMessage: "¡LO ESTÁS LOGRANDO!"
  };
};

export const getRandomMotivationalMessage = (messages) => {
  if (!messages || messages.length === 0) return "¡Sigue adelante!";
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getSimulatorRecommendation = (score, allSubjectsData) => {
  let subjectsToReinforce = [];
  let message = '';

  const sortedSubjects = [...allSubjectsData].sort((a, b) => a.percent - b.percent);

  if (score < 50) {
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 3)).map(s => s.fullName || s.code);
    message = 'Es crucial que dediques más tiempo al estudio diario. Busca apoyo adicional y no dudes en preguntar.';
  } else if (score >= 50 && score < 70) {
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 2)).map(s => s.fullName || s.code);
    message = 'Estás progresando, pero hay áreas clave que necesitan más atención. La constancia es tu mejor aliada.';
  } else if (score >= 70 && score < 90) {
    subjectsToReinforce = sortedSubjects.slice(0, Math.min(sortedSubjects.length, 1)).map(s => s.fullName || s.code);
    message = '¡Excelente progreso! Sigue manteniendo tu ritmo de estudio y enfócate en tus áreas de oportunidad.';
  } else {
    subjectsToReinforce = [];
    message = '¡Felicidades, tu desempeño es sobresaliente! Continúa desafiándote y explorando nuevos temas.';
  }

  if (subjectsToReinforce.length === 0 && score < 100) {
    subjectsToReinforce.push('Revisa tus áreas de oportunidad');
  } else if (subjectsToReinforce.length === 0 && score === 100) {
    subjectsToReinforce.push('Mantén tu excelente nivel');
  }

  return { subjects: subjectsToReinforce, message };
};

export const calculateAcademicStatus = (metrics) => {
  const { attendance, monthlyAverage, activities, quiz } = metrics;

  const activityProgress = activities?.total ? (activities.current / activities.total) * 100 : 0;
  const quizProgress = quiz?.total ? (quiz.current / quiz.total) * 100 : 0;

  const overallScore = (attendance * 0.2 + monthlyAverage * 0.4 + activityProgress * 0.2 + quizProgress * 0.2);

  if (overallScore >= 85) {
    return { level: 'D', color: 'green', description: 'Destacado', score: overallScore };
  } else if (overallScore >= 65) {
    return { level: 'A', color: 'yellow', description: 'Activo', score: overallScore };
  }
  return { level: 'R', color: 'red', description: 'Riesgo', score: overallScore };
};

export const calculatePerformanceLevel = (score) => {
  if (score >= 90) {
    return { level: 'A', color: '#10B981', angle: 162, name: 'Nível A', description: 'Excelente' };
  } else if (score >= 75) {
    return { level: 'B', color: '#F59E0B', angle: 108, name: 'Nível B', description: 'Bueno' };
  } else if (score >= 60) {
    return { level: 'C', color: '#FCD34D', angle: 54, name: 'Nível C', description: 'Regular' };
  } else if (score >= 40) {
    return { level: 'D', color: '#F97316', angle: 18, name: 'Nível D', description: 'Bajo' };
  }
  return { level: 'E', color: '#DC2626', angle: 0, name: 'Nível E', description: 'Muy bajo' };
};

export const getAcademicMotivationalPhrase = (academicStatus) => {
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

  let frases = activoFrases;
  switch (academicStatus.level) {
    case 'R':
      frases = riesgoFrases;
      break;
    case 'A':
      frases = activoFrases;
      break;
    case 'D':
      frases = destacadoFrases;
      break;
    default:
      frases = activoFrases;
  }

  return frases[Math.floor(Math.random() * frases.length)];
};

