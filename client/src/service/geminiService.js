// Configuración para integración con Gemini API
// Este archivo contiene las funciones necesarias para conectar con la API de Gemini

/**
 * Configuración de la API de Gemini
 * Nota: En Vite, las variables de entorno se acceden con import.meta.env
 */
const GEMINI_CONFIG = {
  // Usar la API key desde variables de entorno o fallback
  apiKey: import.meta.env?.VITE_GEMINI_API_KEY || 'AIzaSyDA_7eLeeR_BuE2iqRZSauYKYCdJzMoC4A',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 1500, // Aumentado para análisis más detallados
  timeout: 30000 // 30 segundos timeout
};

/**
 * Función para generar análisis de rendimiento usando Gemini API
 * @param {Object} datosAnalisis - Datos del rendimiento del estudiante
 * @returns {Promise<Object>} - Análisis generado por IA
 */
export const generarAnalisisConGemini = async (datosAnalisis) => {
  try {
    console.log('🚀 Iniciando análisis con Gemini API');
    console.log('📊 Datos recibidos:', datosAnalisis);
    
    // Validar datos de entrada
    if (!datosAnalisis || !datosAnalisis.simulacion) {
      throw new Error('Datos de análisis inválidos - falta simulación');
    }

    // Validar que la API key esté disponible
    if (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey === 'TU_API_KEY_AQUI') {
      throw new Error('API Key de Gemini no configurada correctamente');
    }

    // Crear prompt estructurado para Gemini
    const prompt = crearPromptAnalisis(datosAnalisis);
    console.log('📝 Prompt creado:', prompt.substring(0, 200) + '...');
    
    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeout);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('🌐 Realizando petición a Gemini API...');
    console.log('🔗 URL completa:', GEMINI_CONFIG.baseUrl + '?key=' + GEMINI_CONFIG.apiKey);
    
    // Llamada a la API de Gemini
    const response = await fetch(GEMINI_CONFIG.baseUrl + '?key=' + GEMINI_CONFIG.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 Respuesta recibida, status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta de Gemini:', errorData);
      
      // Proporcionar mensajes de error más específicos
      if (response.status === 404) {
        throw new Error(`Modelo no encontrado. Verifica que el modelo '${GEMINI_CONFIG.model}' esté disponible. Error: ${errorData.error?.message || 'Modelo no disponible'}`);
      } else if (response.status === 403) {
        throw new Error('Acceso denegado. Verifica que la API key tenga los permisos necesarios.');
      } else if (response.status === 401) {
        throw new Error('API Key inválida. Verifica la configuración.');
      } else if (response.status === 429) {
        throw new Error('Límite de peticiones excedido. Intenta en unos minutos.');
      }
      
      throw new Error(`Error en la API de Gemini: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    console.log('📄 Datos de respuesta:', data);
    
    // Verificar que la respuesta tenga el formato esperado
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Respuesta inválida de Gemini:', data);
      throw new Error('Respuesta inválida de la API de Gemini');
    }
    
    // Procesar respuesta de Gemini
    const analisisTexto = data.candidates[0].content.parts[0].text;
    console.log('📝 Texto de análisis recibido:', analisisTexto.substring(0, 200) + '...');
    
    const resultado = procesarRespuestaGemini(analisisTexto);
    console.log('✅ Análisis procesado exitosamente:', resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error completo en generarAnalisisConGemini:', error);
    
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo. Intenta nuevamente.');
    }
    
    if (error.message.includes('401')) {
      throw new Error('API Key inválida. Verifica la configuración.');
    }
    
    if (error.message.includes('429')) {
      throw new Error('Límite de peticiones excedido. Intenta en unos minutos.');
    }
    
    if (error.message.includes('403')) {
      throw new Error('Acceso denegado. Verifica que la API key tenga los permisos necesarios.');
    }
    
    throw error;
  }
};

/**
 * Generar análisis especializado según el tipo de estudiante
 * @param {Object} datosAnalisis - Datos del rendimiento
 * @param {string} tipoEstudiante - Tipo de estudiante (principiante, intermedio, avanzado)
 * @returns {Promise<Object>} - Análisis especializado
 */
export const generarAnalisisEspecializado = async (datosAnalisis, tipoEstudiante = 'intermedio') => {
  try {
    console.log('🎯 Generando análisis especializado para:', tipoEstudiante);
    
    // Crear prompt especializado según el tipo de estudiante
    const promptEspecializado = crearPromptEspecializado(datosAnalisis, tipoEstudiante);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeout);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: promptEspecializado
        }]
      }],
      generationConfig: {
        temperature: 0.8, // Más creatividad para análisis especializado
        maxOutputTokens: 2000, // Más tokens para análisis detallado
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(GEMINI_CONFIG.baseUrl + '?key=' + GEMINI_CONFIG.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const analisisTexto = data.candidates[0].content.parts[0].text;
    
    const resultado = procesarRespuestaGemini(analisisTexto);
    
    // Agregar información del tipo de estudiante
    resultado.tipoEstudiante = tipoEstudiante;
    resultado.analisisEspecializado = true;
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en análisis especializado:', error);
    throw error;
  }
};

/**
 * Crear prompt especializado según el tipo de estudiante
 * @param {Object} datos - Datos del estudiante
 * @param {string} tipo - Tipo de estudiante
 * @returns {string} - Prompt especializado
 */
const crearPromptEspecializado = (datos, tipo) => {
  const basePrompt = crearPromptAnalisis(datos);
  
  let especializacion = '';
  
  switch (tipo) {
    case 'principiante':
      especializacion = `
ENFOQUE ESPECIALIZADO PARA ESTUDIANTE PRINCIPIANTE:
• Usar lenguaje simple y claro
• Proporcionar explicaciones paso a paso
• Incluir técnicas básicas de estudio
• Enfocarse en construir confianza
• Dar recomendaciones graduales
• Incluir recursos para principiantes
• Enfatizar la importancia de la práctica regular
• Proporcionar ejemplos concretos y simples
      `;
      break;
      
    case 'intermedio':
      especializacion = `
ENFOQUE ESPECIALIZADO PARA ESTUDIANTE INTERMEDIO:
• Proporcionar análisis balanceado
• Incluir técnicas de estudio moderadamente avanzadas
• Conectar conceptos entre materias
• Sugerir métodos de auto-evaluación
• Incluir recursos variados
• Enfocarse en optimización del tiempo
• Proporcionar desafíos apropiados
• Incluir técnicas de mejora continua
      `;
      break;
      
    case 'avanzado':
      especializacion = `
ENFOQUE ESPECIALIZADO PARA ESTUDIANTE AVANZADO:
• Usar análisis sofisticado y detallado
• Incluir técnicas avanzadas de estudio
• Proporcionar estrategias metacognitivas
• Enfocarse en optimización y eficiencia
• Incluir recursos especializados
• Sugerir métodos de investigación
• Proporcionar análisis crítico
• Incluir técnicas de enseñanza a otros
      `;
      break;
  }
  
  return basePrompt + especializacion;
};

/**
 * Detectar automáticamente el tipo de estudiante basado en el rendimiento
 * @param {Object} datos - Datos del rendimiento
 * @returns {string} - Tipo de estudiante detectado
 */
export const detectarTipoEstudiante = (datos) => {
  const promedio = datos.promedio;
  const intentos = datos.intentos;
  const eficiencia = datos.promedio / datos.tiempoPromedio;
  
  // Criterios para estudiante avanzado
  if (promedio >= 85 && eficiencia >= 2 && intentos <= 2) {
    return 'avanzado';
  }
  
  // Criterios para estudiante principiante
  if (promedio < 60 || intentos > 5 || eficiencia < 1) {
    return 'principiante';
  }
  
  // Por defecto, intermedio
  return 'intermedio';
}

/**
 * Crear prompt avanzado para análisis completo de rendimiento
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Prompt avanzado para Gemini
 */
const crearPromptAnalisis = (datos) => {
  const tendenciaGeneral = calcularTendenciaGeneral(datos);
  const patronesAprendizaje = identificarPatronesAprendizaje(datos);
  const nivelDificultad = evaluarNivelDificultad(datos);
  
  return `
Actúa como un TUTOR EDUCATIVO EXPERTO con especialización en psicología educativa, análisis de datos académicos y pedagogía personalizada.

CONTEXTO EDUCATIVO:
Simulación: "${datos.simulacion}"
Tipo de evaluación: ${datos.tipoEvaluacion || 'Simulacro académico'}
Nivel educativo: ${datos.nivelEducativo || 'Preparatoria/Universidad'}

DATOS DE RENDIMIENTO DETALLADOS:
═══════════════════════════════════════

📊 MÉTRICAS GENERALES:
- Intentos realizados: ${datos.intentos}
- Promedio general: ${datos.promedio.toFixed(1)}%
- Tiempo promedio por intento: ${datos.tiempoPromedio.toFixed(1)} minutos
- Mejor tiempo registrado: ${datos.mejorTiempo} minutos
- Tendencia general: ${tendenciaGeneral}
- Patrones de aprendizaje: ${patronesAprendizaje}
- Nivel de dificultad percibido: ${nivelDificultad}

📈 ANÁLISIS POR MATERIA:
${datos.materias.map(m => `
▶ ${m.nombre}:
  • Promedio: ${m.promedio.toFixed(1)}%
  • Tendencia: ${m.tendencia}
  • Puntajes por intento: ${m.puntajes.join(' → ')}
  • Mejora: ${calcularMejora(m.puntajes)}%
  • Consistencia: ${calcularConsistencia(m.puntajes)}
  • Tiempo promedio: ${m.tiempoPromedio || 'N/A'} min
`).join('')}

🔍 ÁREAS DE DIFICULTAD IDENTIFICADAS:
${datos.areasDebiles.map(a => `
• ${a.nombre}: ${a.promedio.toFixed(1)}%
  - Tipo de dificultad: ${a.tipoDificultad || 'Comprensión conceptual'}
  - Frecuencia de errores: ${a.frecuenciaErrores || 'Alta'}
`).join('')}

🎯 ANÁLISIS TEMPORAL:
- Eficiencia temporal: ${calcularEficienciaTemporal(datos)}
- Gestión del tiempo: ${evaluarGestionTiempo(datos)}
- Curva de aprendizaje: ${datos.curvaAprendizaje || 'Ascendente'}

INSTRUCCIONES PARA ANÁLISIS AVANZADO:
═══════════════════════════════════════

1. **ANÁLISIS PSICOPEDAGÓGICO**: Evalúa el estilo de aprendizaje, motivación y confianza académica
2. **DIAGNÓSTICO COGNITIVO**: Identifica fortalezas y debilidades en diferentes tipos de pensamiento
3. **ESTRATEGIAS METACOGNITIVAS**: Proporciona técnicas de autorregulación y monitoreo
4. **PLAN DE INTERVENCIÓN**: Crea un programa estructurado de mejora académica
5. **RECURSOS ESPECÍFICOS**: Recomienda herramientas, libros, videos y ejercicios concretos
6. **SEGUIMIENTO**: Establece indicadores de progreso y metas alcanzables

FORMATO DE RESPUESTA (JSON AVANZADO):
{
  "analisisGeneral": {
    "resumen": "Análisis integral del rendimiento académico...",
    "nivelActual": "Básico/Intermedio/Avanzado",
    "potencialEstimado": "Descripción del potencial académico",
    "perfilAprendizaje": "Visual/Auditivo/Kinestésico/Mixto",
    "motivacion": "Alta/Media/Baja con justificación"
  },
  "fortalezasDetalladas": [
    {
      "materia": "Nombre de la materia",
      "nivel": "Excelente/Bueno/Regular",
      "habilidadesEspecificas": ["Habilidad 1", "Habilidad 2"],
      "comentario": "Análisis específico y constructivo",
      "comoMantener": "Estrategias para mantener el nivel"
    }
  ],
  "areasDeDesarrollo": [
    {
      "materia": "Nombre de la materia",
      "nivelDificultad": "Alta/Media/Baja",
      "tipoProblema": "Conceptual/Procedimental/Actitudinal",
      "diagnostico": "Análisis profundo del problema",
      "estrategiasPrincipales": ["Estrategia 1", "Estrategia 2", "Estrategia 3"],
      "recursosRecomendados": ["Recurso 1", "Recurso 2"],
      "tiempoEstimado": "Tiempo para ver mejoras",
      "indicadoresProgreso": ["Indicador 1", "Indicador 2"]
    }
  ],
  "planEstudioPersonalizado": {
    "faseInicial": {
      "duracion": "2-3 semanas",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "actividades": [
        {
          "materia": "Nombre",
          "tiempo": "30-45 min diarios",
          "actividad": "Descripción detallada",
          "recursos": ["Recurso 1", "Recurso 2"],
          "evaluacion": "Cómo evaluar el progreso"
        }
      ]
    },
    "faseIntermedia": {
      "duracion": "4-6 semanas",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "actividades": [...]
    },
    "faseAvanzada": {
      "duracion": "6-8 semanas",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "actividades": [...]
    }
  },
  "tecnicasEstudio": {
    "metodosRecomendados": ["Método 1", "Método 2", "Método 3"],
    "organizacionTiempo": "Sugerencias específicas de horarios",
    "ambienteEstudio": "Recomendaciones para el espacio de estudio",
    "tecnicasMemorizacion": ["Técnica 1", "Técnica 2"],
    "controlAnsiedad": "Estrategias para manejar el estrés académico"
  },
  "seguimientoEvaluacion": {
    "metasCortoplazo": ["Meta 1", "Meta 2"],
    "metasMedianoplazo": ["Meta 1", "Meta 2"],
    "metasLargoplazo": ["Meta 1", "Meta 2"],
    "indicadoresExito": ["Indicador 1", "Indicador 2"],
    "frecuenciaEvaluacion": "Semanal/Quincenal/Mensual",
    "ajustesNecesarios": "Cómo y cuándo modificar el plan"
  },
  "recursosAdicionales": {
    "librosRecomendados": ["Libro 1", "Libro 2"],
    "videosEducativos": ["Video 1", "Video 2"],
    "aplicacionesUtiles": ["App 1", "App 2"],
    "paginasWeb": ["Sitio 1", "Sitio 2"],
    "ejerciciosPracticos": ["Ejercicio 1", "Ejercicio 2"]
  },
  "mensajeMotivacional": "Mensaje personalizado inspirador y realista que reconozca los logros y motive a continuar mejorando"
}

IMPORTANTE: Proporciona un análisis profundo, específico y personalizado. Usa datos concretos y evita generalidades. El análisis debe ser constructivo, motivador y orientado a la acción.

Responde SOLO con el JSON, sin texto adicional.
`;
};

/**
 * Generar análisis específico por área académica
 * @param {Object} datosAnalisis - Datos del rendimiento
 * @param {string} area - Área específica (matematicas, ciencias, lenguaje, etc.)
 * @returns {Promise<Object>} - Análisis específico del área
 */
export const generarAnalisisPorArea = async (datosAnalisis, area) => {
  try {
    console.log('🎯 Generando análisis específico para área:', area);
    
    const promptArea = crearPromptPorArea(datosAnalisis, area);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeout);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: promptArea
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1800,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(GEMINI_CONFIG.baseUrl + '?key=' + GEMINI_CONFIG.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const analisisTexto = data.candidates[0].content.parts[0].text;
    
    const resultado = procesarRespuestaGemini(analisisTexto);
    
    // Agregar información del área específica
    resultado.areaEspecifica = area;
    resultado.analisisPorArea = true;
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en análisis por área:', error);
    throw error;
  }
};

/**
 * Crear prompt especializado para análisis por área
 * @param {Object} datos - Datos del estudiante
 * @param {string} area - Área específica
 * @returns {string} - Prompt especializado
 */
const crearPromptPorArea = (datos, area) => {
  const materiasDelArea = datos.materias.filter(m => 
    m.nombre.toLowerCase().includes(area.toLowerCase()) ||
    obtenerMateriasDeArea(area).some(ma => 
      m.nombre.toLowerCase().includes(ma.toLowerCase())
    )
  );
  
  const basePrompt = crearPromptAnalisis(datos);
  
  const especializacionArea = `
ANÁLISIS ESPECIALIZADO PARA ÁREA: ${area.toUpperCase()}
═══════════════════════════════════════

MATERIAS DEL ÁREA EVALUADAS:
${materiasDelArea.map(m => `
• ${m.nombre}: ${m.promedio.toFixed(1)}%
  - Puntajes: ${m.puntajes.join(' → ')}
  - Mejora: ${calcularMejora(m.puntajes)}%
  - Consistencia: ${calcularConsistencia(m.puntajes).toFixed(2)}
`).join('')}

COMPETENCIAS ESPECÍFICAS DEL ÁREA:
${obtenerCompetenciasDeArea(area).map(c => `• ${c}`).join('\n')}

RECURSOS ESPECIALIZADOS:
${obtenerRecursosEspecializados(area).map(r => `• ${r}`).join('\n')}

ENFOQUE ESPECIALIZADO:
${obtenerEnfoqueEspecializadoArea(area)}

INSTRUCCIONES ADICIONALES:
• Analiza patrones específicos del área ${area}
• Identifica prerrequisitos no dominados
• Proporciona estrategias específicas del área
• Incluye conexiones interdisciplinarias
• Sugiere proyectos prácticos del área
• Recomienda herramientas especializadas
`;
  
  return basePrompt + especializacionArea;
};

/**
 * Obtener materias asociadas a un área específica
 * @param {string} area - Área académica
 * @returns {Array} - Array de materias relacionadas
 */
const obtenerMateriasDeArea = (area) => {
  const areasMap = {
    'matematicas': ['matemáticas', 'álgebra', 'geometría', 'cálculo', 'trigonometría', 'estadística'],
    'ciencias': ['física', 'química', 'biología', 'ciencias naturales'],
    'lenguaje': ['español', 'literatura', 'redacción', 'comunicación', 'gramática'],
    'sociales': ['historia', 'geografía', 'civismo', 'sociología', 'antropología'],
    'ingles': ['inglés', 'english', 'idiomas', 'lengua extranjera']
  };
  
  return areasMap[area.toLowerCase()] || [];
};

/**
 * Obtener competencias específicas de un área
 * @param {string} area - Área académica
 * @returns {Array} - Array de competencias
 */
const obtenerCompetenciasDeArea = (area) => {
  const competenciasMap = {
    'matematicas': [
      'Pensamiento lógico-matemático',
      'Resolución de problemas',
      'Análisis numérico',
      'Razonamiento abstracto',
      'Modelado matemático'
    ],
    'ciencias': [
      'Método científico',
      'Análisis experimental',
      'Observación sistemática',
      'Formulación de hipótesis',
      'Interpretación de datos'
    ],
    'lenguaje': [
      'Comprensión lectora',
      'Expresión escrita',
      'Comunicación oral',
      'Análisis textual',
      'Creatividad literaria'
    ],
    'sociales': [
      'Pensamiento crítico',
      'Análisis histórico',
      'Comprensión cultural',
      'Interpretación geográfica',
      'Conciencia social'
    ],
    'ingles': [
      'Comprensión auditiva',
      'Expresión oral',
      'Comprensión lectora',
      'Expresión escrita',
      'Competencia intercultural'
    ]
  };
  
  return competenciasMap[area.toLowerCase()] || ['Competencias generales del área'];
};

/**
 * Obtener recursos especializados para un área
 * @param {string} area - Área académica
 * @returns {Array} - Array de recursos
 */
const obtenerRecursosEspecializados = (area) => {
  const recursosMap = {
    'matematicas': [
      'GeoGebra para visualización',
      'Wolfram Alpha para cálculos',
      'Khan Academy matemáticas',
      'Libros de ejercicios graduados',
      'Calculadoras especializadas'
    ],
    'ciencias': [
      'Simuladores virtuales',
      'Videos de experimentos',
      'Laboratorios virtuales',
      'Revistas científicas',
      'Documentales especializados'
    ],
    'lenguaje': [
      'Diccionarios especializados',
      'Bibliotecas digitales',
      'Talleres de escritura',
      'Plataformas de lectura',
      'Herramientas de corrección'
    ],
    'sociales': [
      'Atlas digitales',
      'Documentales históricos',
      'Museos virtuales',
      'Líneas de tiempo interactivas',
      'Mapas conceptuales'
    ],
    'ingles': [
      'Duolingo/Babbel',
      'Películas con subtítulos',
      'Podcast en inglés',
      'Intercambio de idiomas',
      'Libros graduados'
    ]
  };
  
  return recursosMap[area.toLowerCase()] || ['Recursos generales del área'];
};

/**
 * Obtener enfoque especializado para un área
 * @param {string} area - Área académica
 * @returns {string} - Enfoque especializado
 */
const obtenerEnfoqueEspecializadoArea = (area) => {
  const enfoquesMap = {
    'matematicas': 'Enfócate en construir bases sólidas, practica problemas graduales, usa visualizaciones y conecta con aplicaciones reales.',
    'ciencias': 'Desarrolla curiosidad científica, practica el método experimental, conecta teoría con práctica y mantén un diario de observaciones.',
    'lenguaje': 'Lee diversas fuentes, practica escritura diaria, desarrolla vocabulario activo y participa en discusiones literarias.',
    'sociales': 'Desarrolla pensamiento crítico, conecta eventos históricos con actualidad, analiza diferentes perspectivas y practica la argumentación.',
    'ingles': 'Practica las 4 habilidades (hablar, escuchar, leer, escribir), sumérgete en el idioma y no temas cometer errores.'
  };
  
  return enfoquesMap[area.toLowerCase()] || 'Desarrolla competencias específicas del área con práctica constante y recursos especializados.';
};

/**
 * Procesar la respuesta de Gemini y convertirla a formato utilizable
 * @param {string} respuestaTexto - Respuesta de Gemini
 * @returns {Object} - Objeto procesado
 */
/**
 * Procesar respuesta de Gemini para extraer análisis estructurado
 * @param {string} respuestaTexto - Respuesta de Gemini
 * @returns {Object} - Análisis procesado
 */
const procesarRespuestaGemini = (respuestaTexto) => {
  try {
    console.log('🔄 Procesando respuesta de Gemini...');
    
    // Limpiar el texto para extraer solo el JSON
    let jsonTexto = respuestaTexto.trim();
    
    // Buscar el JSON dentro del texto
    const inicioJson = jsonTexto.indexOf('{');
    const finJson = jsonTexto.lastIndexOf('}');
    
    if (inicioJson !== -1 && finJson !== -1) {
      jsonTexto = jsonTexto.substring(inicioJson, finJson + 1);
    }
    
    // Intentar parsear el JSON
    const analisisJson = JSON.parse(jsonTexto);
    
    // Validar estructura del JSON
    const analisisValidado = validarEstructuraAnalisis(analisisJson);
    
    console.log('✅ Análisis procesado correctamente');
    return analisisValidado;
    
  } catch (error) {
    console.error('❌ Error procesando respuesta de Gemini:', error);
    console.log('📝 Respuesta recibida:', respuestaTexto);
    
    // Fallback: crear análisis básico si el JSON falla
    return crearAnalisisFallback(respuestaTexto);
  }
};

/**
 * Validar y completar estructura del análisis
 * @param {Object} analisis - Análisis recibido
 * @returns {Object} - Análisis validado
 */
const validarEstructuraAnalisis = (analisis) => {
  const analisisCompleto = {
    analisisGeneral: analisis.analisisGeneral || {
      resumen: 'Análisis no disponible',
      nivelActual: 'Intermedio',
      potencialEstimado: 'Evaluación pendiente',
      perfilAprendizaje: 'Mixto',
      motivacion: 'Media'
    },
    fortalezasDetalladas: Array.isArray(analisis.fortalezasDetalladas) ? analisis.fortalezasDetalladas : [],
    areasDeDesarrollo: Array.isArray(analisis.areasDeDesarrollo) ? analisis.areasDeDesarrollo : [],
    planEstudioPersonalizado: analisis.planEstudioPersonalizado || {
      faseInicial: {
        duracion: '2-3 semanas',
        objetivos: ['Establecer rutina de estudio'],
        actividades: []
      },
      faseIntermedia: {
        duracion: '4-6 semanas',
        objetivos: ['Consolidar conocimientos'],
        actividades: []
      },
      faseAvanzada: {
        duracion: '6-8 semanas',
        objetivos: ['Dominar contenidos'],
        actividades: []
      }
    },
    tecnicasEstudio: analisis.tecnicasEstudio || {
      metodosRecomendados: ['Técnica Pomodoro', 'Mapas conceptuales'],
      organizacionTiempo: 'Estudiar en bloques de 25-30 minutos',
      ambienteEstudio: 'Espacio tranquilo y bien iluminado',
      tecnicasMemorizacion: ['Repetición espaciada', 'Mnemotecnias'],
      controlAnsiedad: 'Técnicas de respiración y relajación'
    },
    seguimientoEvaluacion: analisis.seguimientoEvaluacion || {
      metasCortoplazo: ['Mejorar en áreas débiles'],
      metasMedianoplazo: ['Aumentar promedio general'],
      metasLargoplazo: ['Dominar todas las materias'],
      indicadoresExito: ['Mejora en puntajes', 'Reducción de tiempo'],
      frecuenciaEvaluacion: 'Semanal',
      ajustesNecesarios: 'Revisar estrategias según progreso'
    },
    recursosAdicionales: analisis.recursosAdicionales || {
      librosRecomendados: ['Recursos específicos por materia'],
      videosEducativos: ['Khan Academy', 'Coursera'],
      aplicacionesUtiles: ['Forest', 'Anki'],
      paginasWeb: ['Recursos educativos en línea'],
      ejerciciosPracticos: ['Simulacros adicionales']
    },
    mensajeMotivacional: analisis.mensajeMotivacional || 'Continúa esforzándote, cada intento es una oportunidad de mejora.',
    puntuacionConfianza: calcularPuntuacionConfianza(analisis),
    recomendacionesPersonalizadas: generarRecomendacionesPersonalizadas(analisis)
  };
  
  return analisisCompleto;
};

/**
 * Crear análisis fallback si falla el procesamiento JSON
 * @param {string} textoRespuesta - Respuesta original
 * @returns {Object} - Análisis básico
 */
const crearAnalisisFallback = (textoRespuesta) => {
  return {
    analisisGeneral: {
      resumen: 'Se ha generado un análisis, pero hubo problemas con el formato. Revisa el texto completo para más detalles.',
      nivelActual: 'Intermedio',
      potencialEstimado: 'Evaluación en proceso',
      perfilAprendizaje: 'Mixto',
      motivacion: 'Media'
    },
    fortalezasDetalladas: [{
      materia: 'General',
      nivel: 'Bueno',
      habilidadesEspecificas: ['Persistencia', 'Práctica constante'],
      comentario: 'Muestra dedicación al realizar múltiples intentos.',
      comoMantener: 'Continuar con la práctica regular'
    }],
    areasDeDesarrollo: [{
      materia: 'General',
      nivelDificultad: 'Media',
      tipoProblema: 'Técnico',
      diagnostico: 'Necesita revisar el análisis detallado en el texto completo.',
      estrategiasPrincipales: ['Revisar contenido', 'Practicar más', 'Buscar ayuda'],
      recursosRecomendados: ['Libros de texto', 'Tutorías'],
      tiempoEstimado: '2-4 semanas',
      indicadoresProgreso: ['Mejora en puntajes', 'Mayor velocidad']
    }],
    textoCompleto: textoRespuesta,
    mensajeMotivacional: 'Aunque hubo un problema técnico, tu dedicación es evidente. Continúa practicando y mejorando.',
    esFallback: true
  };
};

/**
 * Calcular puntuación de confianza del análisis
 * @param {Object} analisis - Análisis generado
 * @returns {number} - Puntuación de confianza (0-100)
 */
const calcularPuntuacionConfianza = (analisis) => {
  let puntuacion = 70; // Base
  
  if (analisis.fortalezasDetalladas && analisis.fortalezasDetalladas.length > 0) puntuacion += 10;
  if (analisis.areasDeDesarrollo && analisis.areasDeDesarrollo.length > 0) puntuacion += 10;
  if (analisis.planEstudioPersonalizado) puntuacion += 10;
  
  return Math.min(puntuacion, 100);
};

/**
 * Generar recomendaciones personalizadas adicionales
 * @param {Object} analisis - Análisis base
 * @returns {Array} - Recomendaciones personalizadas
 */
const generarRecomendacionesPersonalizadas = (analisis) => {
  const recomendaciones = [];
  
  // Recomendaciones basadas en áreas de desarrollo
  if (analisis.areasDeDesarrollo && analisis.areasDeDesarrollo.length > 0) {
    recomendaciones.push({
      tipo: 'Enfoque prioritario',
      descripcion: `Concentra el 60% de tu tiempo de estudio en: ${analisis.areasDeDesarrollo.slice(0, 2).map(a => a.materia).join(', ')}`,
      prioridad: 'Alta'
    });
  }
  
  // Recomendaciones basadas en fortalezas
  if (analisis.fortalezasDetalladas && analisis.fortalezasDetalladas.length > 0) {
    recomendaciones.push({
      tipo: 'Aprovecha tus fortalezas',
      descripcion: `Usa tu habilidad en ${analisis.fortalezasDetalladas[0].materia} como base para estudiar materias relacionadas`,
      prioridad: 'Media'
    });
  }
  
  return recomendaciones;
};

/**
 * Función auxiliar para validar si la API está configurada
 * @returns {boolean} - True si está configurada
 */
export const esGeminiConfigurado = () => {
  return Boolean(GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey.length > 0);
};

/**
 * Función para obtener recomendaciones de recursos adicionales
 * @param {string} materia - Materia específica
 * @returns {Array} - Lista de recursos recomendados
 */
export const obtenerRecursosRecomendados = (materia) => {
  const recursos = {
    'Matemáticas': [
      { tipo: 'Video', nombre: 'Khan Academy - Álgebra', url: 'https://www.khanacademy.org/math/algebra' },
      { tipo: 'Libro', nombre: 'Álgebra de Baldor', url: '#' },
      { tipo: 'App', nombre: 'Photomath', url: 'https://photomath.com' },
      { tipo: 'Práctica', nombre: 'Ejercicios de Matemáticas', url: '#' }
    ],
    'Español': [
      { tipo: 'Web', nombre: 'RAE - Diccionario', url: 'https://dle.rae.es' },
      { tipo: 'Libro', nombre: 'Ortografía de la RAE', url: '#' },
      { tipo: 'App', nombre: 'Lingolia Español', url: '#' },
      { tipo: 'Práctica', nombre: 'Ejercicios de Gramática', url: '#' }
    ],
    'Ciencias': [
      { tipo: 'Video', nombre: 'Khan Academy - Ciencias', url: 'https://www.khanacademy.org/science' },
      { tipo: 'Web', nombre: 'NASA Education', url: 'https://www.nasa.gov/audience/foreducators/' },
      { tipo: 'App', nombre: 'Elements 4D', url: '#' },
      { tipo: 'Simulador', nombre: 'Laboratorio Virtual', url: '#' }
    ],
    'Ciencias Sociales': [
      { tipo: 'Web', nombre: 'Historia Universal', url: '#' },
      { tipo: 'Video', nombre: 'Documentales Educativos', url: '#' },
      { tipo: 'App', nombre: 'Timeline - Historia', url: '#' },
      { tipo: 'Libro', nombre: 'Atlas Histórico', url: '#' }
    ],
    'Inglés': [
      { tipo: 'App', nombre: 'Duolingo', url: 'https://www.duolingo.com' },
      { tipo: 'Web', nombre: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish' },
      { tipo: 'Podcast', nombre: 'English Pod', url: '#' },
      { tipo: 'Video', nombre: 'English Grammar Course', url: '#' }
    ],
    'Razonamiento Lógico': [
      { tipo: 'App', nombre: 'Lumosity', url: 'https://www.lumosity.com' },
      { tipo: 'Libro', nombre: 'Ejercicios de Lógica', url: '#' },
      { tipo: 'Web', nombre: 'Puzzles y Acertijos', url: '#' },
      { tipo: 'Práctica', nombre: 'Tests de Razonamiento', url: '#' }
    ],
    'Comprensión Lectora': [
      { tipo: 'App', nombre: 'Reading Comprehension', url: '#' },
      { tipo: 'Libro', nombre: 'Técnicas de Lectura Rápida', url: '#' },
      { tipo: 'Web', nombre: 'Textos y Ejercicios', url: '#' },
      { tipo: 'Práctica', nombre: 'Tests de Comprensión', url: '#' }
    ],
    'Conocimientos Generales': [
      { tipo: 'App', nombre: 'Quiz Culture Générale', url: '#' },
      { tipo: 'Web', nombre: 'Enciclopedia Britannica', url: 'https://www.britannica.com' },
      { tipo: 'Libro', nombre: 'Almanaque Mundial', url: '#' },
      { tipo: 'Práctica', nombre: 'Tests de Cultura General', url: '#' }
    ],
    'Habilidades Cuantitativas': [
      { tipo: 'App', nombre: 'Math Tricks', url: '#' },
      { tipo: 'Web', nombre: 'Ejercicios de Cálculo Mental', url: '#' },
      { tipo: 'Libro', nombre: 'Matemáticas Básicas', url: '#' },
      { tipo: 'Práctica', nombre: 'Tests Cuantitativos', url: '#' }
    ]
  };

  return recursos[materia] || [
    { tipo: 'General', nombre: 'Recursos adicionales disponibles', url: '#' },
    { tipo: 'Biblioteca', nombre: 'Consulta tu biblioteca local', url: '#' },
    { tipo: 'Tutor', nombre: 'Considera clases particulares', url: '#' }
  ];
};

/**
 * Función para obtener consejos de estudio personalizados
 * @param {string} materia - Materia específica
 * @param {number} promedio - Promedio actual
 * @returns {Array} - Lista de consejos personalizados
 */
export const obtenerConsejosEstudio = (materia, promedio) => {
  const consejosBase = {
    'Matemáticas': [
      'Practica problemas diariamente, empezando por los más simples',
      'Crea un formulario con las fórmulas más importantes',
      'Explica los problemas en voz alta para reforzar el aprendizaje'
    ],
    'Español': [
      'Lee al menos 30 minutos diarios de diferentes tipos de texto',
      'Practica escritura creativa para mejorar redacción',
      'Usa fichas para aprender nuevas palabras y su significado'
    ],
    'Ciencias': [
      'Relaciona los conceptos con ejemplos de la vida cotidiana',
      'Crea diagramas y mapas conceptuales',
      'Realiza experimentos simples para comprender mejor'
    ],
    'Inglés': [
      'Escucha música y ve películas en inglés con subtítulos',
      'Practica conversación con aplicaciones de intercambio',
      'Lleva un diario escribiendo en inglés'
    ]
  };

  const consejos = consejosBase[materia] || [
    'Organiza tu tiempo de estudio con descansos regulares',
    'Busca diferentes fuentes de información sobre el tema',
    'Practica con ejercicios similares a los del examen'
  ];

  // Personalizar según el promedio
  if (promedio < 60) {
    consejos.unshift('Enfócate en conceptos básicos antes de avanzar');
    consejos.push('Considera buscar ayuda de un tutor o profesor');
  } else if (promedio >= 80) {
    consejos.push('Intenta ejercicios más avanzados para desafiarte');
    consejos.push('Ayuda a otros estudiantes, enseñar refuerza el aprendizaje');
  }

  return consejos;
};

/**
 * Función para verificar modelos disponibles de Gemini
 * @returns {Promise<Array>} - Lista de modelos disponibles
 */
export const verificarModelosDisponibles = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_CONFIG.apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('🔍 Modelos disponibles:', data.models.map(m => m.name));
      return data.models;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error verificando modelos:', error);
    return [];
  }
};

/**
 * Función de prueba para verificar que la API de Gemini funciona
 * @returns {Promise<Object>} - Resultado de la prueba
 */
export const probarConexionGemini = async () => {
  try {
    console.log('🧪 Probando conexión con Gemini API...');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Responde con un JSON simple: {\"status\": \"ok\", \"mensaje\": \"Conexión exitosa\"}"
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    };

    const response = await fetch(GEMINI_CONFIG.baseUrl + '?key=' + GEMINI_CONFIG.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    console.log('✅ Conexión exitosa con Gemini API');
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Error en prueba de conexión:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calcular tendencia general del rendimiento
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Tendencia general
 */
const calcularTendenciaGeneral = (datos) => {
  const promediosGenerales = datos.materias.map(m => m.promedio);
  const primerosMitad = promediosGenerales.slice(0, Math.floor(promediosGenerales.length / 2));
  const segundaMitad = promediosGenerales.slice(Math.floor(promediosGenerales.length / 2));
  
  const promedioInicial = primerosMitad.reduce((a, b) => a + b, 0) / primerosMitad.length;
  const promedioFinal = segundaMitad.reduce((a, b) => a + b, 0) / segundaMitad.length;
  
  if (promedioFinal > promedioInicial + 5) return 'Mejora significativa';
  if (promedioFinal > promedioInicial) return 'Mejora gradual';
  if (promedioFinal < promedioInicial - 5) return 'Declive preocupante';
  if (promedioFinal < promedioInicial) return 'Declive leve';
  return 'Rendimiento estable';
};

/**
 * Identificar patrones de aprendizaje
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Patrones identificados
 */
const identificarPatronesAprendizaje = (datos) => {
  const materiasConsistentes = datos.materias.filter(m => calcularConsistencia(m.puntajes) > 0.8);
  const materiasInconsistentes = datos.materias.filter(m => calcularConsistencia(m.puntajes) < 0.6);
  
  if (materiasConsistentes.length > materiasInconsistentes.length) {
    return 'Aprendizaje consistente y estructurado';
  } else if (materiasInconsistentes.length > materiasConsistentes.length) {
    return 'Aprendizaje irregular, necesita estructura';
  }
  return 'Patrones mixtos de aprendizaje';
};

/**
 * Evaluar nivel de dificultad percibido
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Nivel de dificultad
 */
const evaluarNivelDificultad = (datos) => {
  const promedioGeneral = datos.promedio;
  const tiempoPromedio = datos.tiempoPromedio;
  
  if (promedioGeneral >= 85 && tiempoPromedio <= 30) return 'Nivel apropiado - Alta eficiencia';
  if (promedioGeneral >= 70 && tiempoPromedio <= 45) return 'Nivel adecuado - Eficiencia normal';
  if (promedioGeneral >= 60 && tiempoPromedio <= 60) return 'Nivel desafiante - Requiere más tiempo';
  if (promedioGeneral < 60) return 'Nivel muy desafiante - Necesita apoyo adicional';
  return 'Nivel balanceado';
};

/**
 * Calcular mejora entre intentos
 * @param {Array} puntajes - Array de puntajes
 * @returns {number} - Porcentaje de mejora
 */
const calcularMejora = (puntajes) => {
  if (puntajes.length < 2) return 0;
  const primero = puntajes[0];
  const ultimo = puntajes[puntajes.length - 1];
  return ((ultimo - primero) / primero * 100).toFixed(1);
};

/**
 * Calcular consistencia del rendimiento
 * @param {Array} puntajes - Array de puntajes
 * @returns {number} - Índice de consistencia (0-1)
 */
const calcularConsistencia = (puntajes) => {
  if (puntajes.length < 2) return 1;
  const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
  const desviacion = Math.sqrt(puntajes.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / puntajes.length);
  return Math.max(0, 1 - (desviacion / promedio));
};

/**
 * Calcular eficiencia temporal
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Evaluación de eficiencia
 */
const calcularEficienciaTemporal = (datos) => {
  const eficiencia = datos.promedio / datos.tiempoPromedio;
  if (eficiencia >= 2) return 'Muy eficiente';
  if (eficiencia >= 1.5) return 'Eficiente';
  if (eficiencia >= 1) return 'Eficiencia normal';
  return 'Necesita mejorar velocidad';
};

/**
 * Evaluar gestión del tiempo
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Evaluación de gestión del tiempo
 */
const evaluarGestionTiempo = (datos) => {
  const diferenciaTiempo = datos.tiempoPromedio - datos.mejorTiempo;
  if (diferenciaTiempo <= 5) return 'Gestión del tiempo consistente';
  if (diferenciaTiempo <= 10) return 'Gestión del tiempo variable';
  return 'Gestión del tiempo inconsistente';
};

/**
 * Generar análisis completo avanzado (función principal mejorada)
 * @param {Object} datosAnalisis - Datos del rendimiento del estudiante
 * @param {Object} opciones - Opciones de análisis
 * @returns {Promise<Object>} - Análisis completo y detallado
 */
export const generarAnalisisCompletoAvanzado = async (datosAnalisis, opciones = {}) => {
  try {
    console.log('🚀 Iniciando análisis completo avanzado');
    
    // Opciones por defecto
    const opcionesCompletas = {
      incluirAnalisisEspecializado: true,
      incluirAnalisisPorArea: true,
      detectarTipoAutomatico: true,
      generarRecomendacionesPersonalizadas: true,
      ...opciones
    };
    
    // Detectar tipo de estudiante automáticamente
    const tipoEstudiante = opcionesCompletas.detectarTipoAutomatico ? 
      detectarTipoEstudiante(datosAnalisis) : 
      (opciones.tipoEstudiante || 'intermedio');
    
    console.log('🎯 Tipo de estudiante detectado:', tipoEstudiante);
    
    // Generar análisis principal
    const analisisPrincipal = await generarAnalisisConGemini(datosAnalisis);
    
    // Generar análisis especializado si se solicita
    let analisisEspecializado = null;
    if (opcionesCompletas.incluirAnalisisEspecializado) {
      try {
        analisisEspecializado = await generarAnalisisEspecializado(datosAnalisis, tipoEstudiante);
      } catch (error) {
        console.warn('⚠️ Error en análisis especializado:', error.message);
      }
    }
    
    // Identificar área principal de dificultad
    const areaPrincipal = identificarAreaPrincipal(datosAnalisis);
    
    // Generar análisis por área si se solicita
    let analisisPorArea = null;
    if (opcionesCompletas.incluirAnalisisPorArea && areaPrincipal) {
      try {
        analisisPorArea = await generarAnalisisPorArea(datosAnalisis, areaPrincipal);
      } catch (error) {
        console.warn('⚠️ Error en análisis por área:', error.message);
      }
    }
    
    // Combinar todos los análisis
    const analisisCompleto = combinarAnalisis(
      analisisPrincipal,
      analisisEspecializado,
      analisisPorArea,
      tipoEstudiante,
      datosAnalisis
    );
    
    console.log('✅ Análisis completo generado exitosamente');
    return analisisCompleto;
    
  } catch (error) {
    console.error('❌ Error en análisis completo avanzado:', error);
    throw error;
  }
};

/**
 * Identificar área principal de dificultad
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Área principal identificada
 */
const identificarAreaPrincipal = (datos) => {
  // Encontrar materia con menor promedio
  const materiaDebil = datos.materias.reduce((min, actual) => 
    actual.promedio < min.promedio ? actual : min
  );
  
  // Mapear materia a área
  const materia = materiaDebil.nombre.toLowerCase();
  
  if (materia.includes('matemática') || materia.includes('álgebra') || 
      materia.includes('geometría') || materia.includes('cálculo')) {
    return 'matematicas';
  }
  
  if (materia.includes('física') || materia.includes('química') || 
      materia.includes('biología') || materia.includes('ciencias')) {
    return 'ciencias';
  }
  
  if (materia.includes('español') || materia.includes('literatura') || 
      materia.includes('redacción') || materia.includes('comunicación')) {
    return 'lenguaje';
  }
  
  if (materia.includes('historia') || materia.includes('geografía') || 
      materia.includes('civismo') || materia.includes('sociales')) {
    return 'sociales';
  }
  
  if (materia.includes('inglés') || materia.includes('english')) {
    return 'ingles';
  }
  
  return null;
};

/**
 * Combinar múltiples análisis en uno completo
 * @param {Object} principal - Análisis principal
 * @param {Object} especializado - Análisis especializado
 * @param {Object} porArea - Análisis por área
 * @param {string} tipoEstudiante - Tipo de estudiante
 * @param {Object} datos - Datos originales
 * @returns {Object} - Análisis combinado
 */
const combinarAnalisis = (principal, especializado, porArea, tipoEstudiante, datos) => {
  const analisisCombinado = {
    timestamp: new Date().toISOString(),
    tipoEstudiante,
    metadata: {
      simulacion: datos.simulacion,
      intentos: datos.intentos,
      promedio: datos.promedio,
      tiempoPromedio: datos.tiempoPromedio,
      numeroMaterias: datos.materias.length,
      puntuacionConfianza: principal.puntuacionConfianza || 85
    },
    
    // Análisis general (del análisis principal)
    analisisGeneral: principal.analisisGeneral || {},
    
    // Combinar fortalezas de todos los análisis
    fortalezasDetalladas: [
      ...(principal.fortalezasDetalladas || []),
      ...(especializado?.fortalezasDetalladas || []),
      ...(porArea?.fortalezasDetalladas || [])
    ].filter((fortaleza, index, self) => 
      index === self.findIndex(f => f.materia === fortaleza.materia)
    ),
    
    // Combinar áreas de desarrollo
    areasDeDesarrollo: [
      ...(principal.areasDeDesarrollo || []),
      ...(especializado?.areasDeDesarrollo || []),
      ...(porArea?.areasDeDesarrollo || [])
    ].filter((area, index, self) => 
      index === self.findIndex(a => a.materia === area.materia)
    ),
    
    // Plan de estudio personalizado (tomar el más completo)
    planEstudioPersonalizado: especializado?.planEstudioPersonalizado || 
                             principal.planEstudioPersonalizado || {},
    
    // Técnicas de estudio especializadas
    tecnicasEstudio: {
      ...(principal.tecnicasEstudio || {}),
      ...(especializado?.tecnicasEstudio || {}),
      metodosEspecializados: porArea?.tecnicasEstudio?.metodosRecomendados || []
    },
    
    // Seguimiento y evaluación
    seguimientoEvaluacion: especializado?.seguimientoEvaluacion || 
                          principal.seguimientoEvaluacion || {},
    
    // Recursos combinados
    recursosAdicionales: {
      ...(principal.recursosAdicionales || {}),
      recursosEspecializados: porArea?.recursosAdicionales || {}
    },
    
    // Recomendaciones personalizadas mejoradas
    recomendacionesPersonalizadas: [
      ...(principal.recomendacionesPersonalizadas || []),
      ...(especializado?.recomendacionesPersonalizadas || []),
      ...(porArea?.recomendacionesPersonalizadas || [])
    ],
    
    // Mensaje motivacional personalizado
    mensajeMotivacional: especializado?.mensajeMotivacional || 
                        principal.mensajeMotivacional || 
                        'Continúa trabajando con dedicación, cada paso te acerca a tus objetivos.',
    
    // Análisis específicos adicionales
    analisisEspecificos: {
      ...(especializado ? { porTipoEstudiante: especializado } : {}),
      ...(porArea ? { porArea: porArea } : {})
    },
    
    // Indicadores de rendimiento calculados
    indicadoresRendimiento: calcularIndicadoresRendimiento(datos),
    
    // Próximos pasos recomendados
    proximosPasos: generarProximosPasos(datos, tipoEstudiante)
  };
  
  return analisisCombinado;
};

/**
 * Calcular indicadores de rendimiento adicionales
 * @param {Object} datos - Datos del estudiante
 * @returns {Object} - Indicadores calculados
 */
const calcularIndicadoresRendimiento = (datos) => {
  const promedios = datos.materias.map(m => m.promedio);
  const tiempos = datos.materias.map(m => m.tiempoPromedio || datos.tiempoPromedio);
  
  return {
    promedioGeneral: datos.promedio,
    desviacionEstandar: calcularDesviacionEstandar(promedios),
    coeficienteVariacion: calcularCoeficienteVariacion(promedios),
    eficienciaTemporal: datos.promedio / datos.tiempoPromedio,
    consistenciaGeneral: calcularConsistenciaGeneral(datos.materias),
    tendenciaAprendizaje: calcularTendenciaAprendizaje(datos.materias),
    indiceImprovement: calcularIndiceImprovement(datos.materias)
  };
};

/**
 * Generar próximos pasos recomendados
 * @param {Object} datos - Datos del estudiante
 * @param {string} tipoEstudiante - Tipo de estudiante
 * @returns {Array} - Lista de próximos pasos
 */
const generarProximosPasos = (datos, tipoEstudiante) => {
  const pasos = [];
  
  // Paso 1: Enfoque en área más débil
  const areaDebil = datos.materias.reduce((min, actual) => 
    actual.promedio < min.promedio ? actual : min
  );
  
  pasos.push({
    orden: 1,
    titulo: `Reforzar ${areaDebil.nombre}`,
    descripcion: `Dedica 40% de tu tiempo de estudio a ${areaDebil.nombre} (promedio actual: ${areaDebil.promedio.toFixed(1)}%)`,
    plazo: '2 semanas',
    prioridad: 'Alta'
  });
  
  // Paso 2: Optimizar tiempo de estudio
  if (datos.tiempoPromedio > 60) {
    pasos.push({
      orden: 2,
      titulo: 'Optimizar tiempo de estudio',
      descripcion: 'Implementar técnica Pomodoro para reducir tiempo promedio de estudio',
      plazo: '1 semana',
      prioridad: 'Media'
    });
  }
  
  // Paso 3: Mantener fortalezas
  const areaFuerte = datos.materias.reduce((max, actual) => 
    actual.promedio > max.promedio ? actual : max
  );
  
  pasos.push({
    orden: 3,
    titulo: `Mantener nivel en ${areaFuerte.nombre}`,
    descripcion: `Practica ${areaFuerte.nombre} 15 minutos diarios para mantener el nivel (promedio actual: ${areaFuerte.promedio.toFixed(1)}%)`,
    plazo: 'Continuo',
    prioridad: 'Baja'
  });
  
  return pasos;
};

/**
 * Calcular funciones auxiliares adicionales
 */
const calcularDesviacionEstandar = (valores) => {
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const varianza = valores.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / valores.length;
  return Math.sqrt(varianza);
};

const calcularCoeficienteVariacion = (valores) => {
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const desviacion = calcularDesviacionEstandar(valores);
  return (desviacion / promedio) * 100;
};

const calcularConsistenciaGeneral = (materias) => {
  const consistencias = materias.map(m => calcularConsistencia(m.puntajes));
  return consistencias.reduce((a, b) => a + b, 0) / consistencias.length;
};

const calcularTendenciaAprendizaje = (materias) => {
  const tendencias = materias.map(m => {
    const mejora = calcularMejora(m.puntajes);
    return parseFloat(mejora);
  });
  
  const promedioTendencia = tendencias.reduce((a, b) => a + b, 0) / tendencias.length;
  
  if (promedioTendencia > 10) return 'Mejora significativa';
  if (promedioTendencia > 5) return 'Mejora gradual';
  if (promedioTendencia > -5) return 'Estable';
  return 'Necesita atención';
};

const calcularIndiceImprovement = (materias) => {
  const mejoras = materias.map(m => parseFloat(calcularMejora(m.puntajes)));
  const mejorasPositivas = mejoras.filter(m => m > 0).length;
  return (mejorasPositivas / materias.length) * 100;
};