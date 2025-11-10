// Configuración para integración con Gemini API
// Este archivo contiene las funciones necesarias para conectar con la API de Gemini

/**
 * Configuración de la API de Gemini
 * Nota: En Vite, las variables de entorno se acceden con import.meta.env
 */
const GEMINI_CONFIG = {
  // En el cliente ya no usamos la API key directamente: llamamos al proxy backend
  apiKey: import.meta.env?.VITE_GEMINI_API_KEY || '',
  proxyEndpoint: '/api/ai/gemini/generate',
  // Permite override del modelo vía variable de entorno
  model: (import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.0-flash'),
  temperature: 0.7,
  maxTokens: 1500, // permitir respuestas más ricas
  timeout: 30000
};

// ===================== utilidades internas =====================
const ESPERA = (ms) => new Promise(res => setTimeout(res, ms));

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas
const buildCacheKey = (datos) => `gemini_analisis_${(datos.simulacion || 'simulacion').replace(/\s+/g,'_')}_${datos.tipo || 'general'}`;
// Rate limiter simple por ventana (evita golpear la API)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX_CALLS = 3; // máx 3 llamadas/min por pestaña
let callTimestamps = [];

const asegurarRateLimit = async () => {
  const ahora = Date.now();
  callTimestamps = callTimestamps.filter(ts => ahora - ts < RATE_LIMIT_WINDOW_MS);
  if (callTimestamps.length >= RATE_LIMIT_MAX_CALLS) {
    const espera = RATE_LIMIT_WINDOW_MS - (ahora - callTimestamps[0]) + Math.random()*300;
    console.warn(`⏳ Rate limit local: esperando ${Math.round(espera)}ms para no saturar la API`);
    await ESPERA(espera);
  }
  callTimestamps.push(Date.now());
};

async function fetchConReintentos(url, options, { maxRetries = 4, baseDelay = 1000, maxDelay = 10_000 } = {}) {
  let intento = 0;
  // Intentos: 0..maxRetries (inclusive de primer intento)
  while (true) {
    try {
      const resp = await fetch(url, options);
      if (resp.status !== 429 || intento >= maxRetries) return resp;
      intento++;
      // Respetar Retry-After si está disponible
      const retryAfterHeader = resp.headers?.get?.('retry-after');
      let delay = baseDelay * Math.pow(2, Math.max(0, intento - 1)) + Math.random() * 400;
      if (retryAfterHeader) {
        const retryAfterSec = Number(retryAfterHeader);
        if (!Number.isNaN(retryAfterSec)) {
          delay = Math.max(delay, retryAfterSec * 1000);
        }
      }
      delay = Math.min(delay, maxDelay);
      console.warn(`⚠️ 429 recibido. Reintentando (${intento}/${maxRetries}) en ${Math.round(delay)}ms`);
      await ESPERA(delay);
    } catch (e) {
      if (intento >= maxRetries) throw e;
      const delay = Math.min(baseDelay * Math.pow(2, Math.max(0, intento)), maxDelay);
      console.warn(`🔌 Error de red. Reintentando (${intento + 1}/${maxRetries}) en ${Math.round(delay)}ms`, e?.message || e);
      intento++;
      await ESPERA(delay);
    }
  }
}

const guardarEnCache = (key, payload) => {
  try {
    const envoltura = { ts: Date.now(), payload };
    localStorage.setItem(key, JSON.stringify(envoltura));
  } catch(e) { /* ignore */ }
};

const leerCacheValido = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envoltura = JSON.parse(raw);
    if (Date.now() - envoltura.ts > CACHE_TTL_MS) return null;
    return envoltura.payload;
  } catch(e) { return null; }
};

const crearAnalisisHeuristico = (datos) => {
  const fortalezas = (datos.materias || [])
    .filter(m => m.promedio >= 80)
    .map(m => ({ materia: m.nombre, comentario: 'Buen dominio, mantener práctica estratégica.' }));
  const debilidades = (datos.materias || [])
    .filter(m => m.promedio < 70)
    .map(m => ({
      materia: m.nombre,
      comentario: 'Prioridad de refuerzo: revisar fundamentos y practicar ejercicios graduales.',
      accionesEspecificas: [
        'Revisar conceptos base',
        'Resolver 10 ejercicios diarios',
        'Autoevaluación semanal'
      ]
    }));
  return {
    resumen: `Análisis heurístico local generado sin IA. Promedio general: ${datos.promedio?.toFixed ? datos.promedio.toFixed(1) : datos.promedio || 0}%.`,
    fortalezas,
    debilidades,
    planEstudio: { prioridad: debilidades.slice(0,3).map(d => ({ materia: d.materia, tiempo: '30-40 min diarios', enfoque: 'Fundamentos y práctica guiada' })) },
    esFallbackLocal: true,
    timestamp: new Date().toISOString(),
    nota: 'Mostrando análisis heurístico por límite de cuota (429) o error en IA.'
  };
};

export const limpiarCacheAnalisisGemini = (datos) => {
  try { localStorage.removeItem(buildCacheKey(datos)); } catch(e) { /* ignore */ }
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
    // Intentar cache primero
    const cacheKey = buildCacheKey(datosAnalisis || {});
    const cache = leerCacheValido(cacheKey);
    if (cache) {
      console.warn('📦 Usando análisis desde cache');
      return { ...cache, desdeCache: true };
    }
    
    // Validar datos de entrada
    if (!datosAnalisis || !datosAnalisis.simulacion) {
      throw new Error('Datos de análisis inválidos - falta simulación');
    }

    // Validar que el proxy esté configurado
    if (!GEMINI_CONFIG.proxyEndpoint) {
      throw new Error('Endpoint de proxy Gemini no configurado');
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
        response_mime_type: 'application/json'
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

  console.log('🌐 Realizando petición a Gemini (proxy backend)...');
    
    // Llamada a la API de Gemini
    // Respetar rate limit local antes de llamar
    await asegurarRateLimit();
  const response = await fetchConReintentos(GEMINI_CONFIG.proxyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model }),
        signal: controller.signal
      }, { maxRetries: 4, baseDelay: 1000, maxDelay: 12000 });

    clearTimeout(timeoutId);

    console.log('📡 Respuesta recibida, status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en la respuesta de Gemini:', errorData);

      if (response.status === 429) {
        // Intentar cache
        const cacheKey = buildCacheKey(datosAnalisis);
        const cache = leerCacheValido(cacheKey);
        if (cache) {
          console.warn('📦 Usando análisis en cache por 429');
          return { ...cache, desdeCache: true, aviso: 'Mostrando resultado previo (cache) por límite de cuota 429.' };
        }
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(cacheKey, heuristico); } catch(e) { /* ignore */ }
        return heuristico;
      }
      if (response.status === 404) {
        console.warn(`📭 Modelo no disponible (${GEMINI_CONFIG.model}). Usando análisis heurístico local.`);
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(cacheKey, heuristico); } catch(e) { /* ignore */ }
        return heuristico;
      }
      // Fallback amigable si el servidor no tiene configurada la API Key
      if (response.status === 500 && typeof (errorData?.error) === 'string' && errorData.error.includes('GEMINI_API_KEY')) {
        console.warn('🔐 GEMINI_API_KEY no configurada en el servidor. Generando análisis heurístico local.');
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(cacheKey, heuristico); } catch(e) { /* ignore */ }
        return heuristico;
      }
      if (response.status === 403) {
        throw new Error('Acceso denegado. Verifica que la API key tenga los permisos necesarios.');
      }
      if (response.status === 401) {
        throw new Error('API Key inválida. Verifica la configuración.');
      }
      throw new Error(`Error en la API de Gemini: ${response.status} - ${errorData.error?.message || errorData.error || 'Error desconocido'}`);
    }

    const data = await response.json();
  console.log('📄 Datos de respuesta:', data);
    
    // Verificar que la respuesta tenga el formato esperado
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Respuesta inválida de Gemini:', data);
      throw new Error('Respuesta inválida de la API de Gemini');
    }
    
    // Procesar respuesta de Gemini
  const analisisTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('📝 Texto de análisis recibido:', analisisTexto.substring(0, 200) + '...');
    
  let resultado = procesarRespuestaGemini(analisisTexto);
  console.log(`✅ Análisis procesado exitosamente (${resultado?.esFallback ? 'fallback' : 'IA'})`, resultado);

    // Transformar a formato simplificado esperado por el componente
    const simplificado = {
      resumen: resultado.analisisGeneral?.resumen || 'Análisis generado',
      fortalezas: (resultado.fortalezasDetalladas || []).map(f => ({
        materia: f.materia,
        comentario: f.comentario || f.nivel || 'Rendimiento sólido'
      })),
      debilidades: (resultado.areasDeDesarrollo || []).map(a => ({
        materia: a.materia,
        comentario: a.diagnostico || 'Área de mejora',
        accionesEspecificas: a.estrategiasPrincipales || []
      })),
      planEstudio: {
        prioridad: (resultado.planEstudioPersonalizado?.faseInicial?.actividades || []).map(act => ({
          materia: act.materia || act.actividad || 'General',
            tiempo: act.tiempo || '30 min',
            enfoque: act.actividad || 'Práctica guiada'
        }))
      },
      metadata: resultado.metadata || {},
      puntuacionConfianza: resultado.puntuacionConfianza || 80,
      recomendaciones: resultado.recomendacionesPersonalizadas || [],
      timestamp: new Date().toISOString()
    };

    // Guardar en cache
  guardarEnCache(cacheKey, simplificado);

    return simplificado;
    
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
      // Fallback heurístico final si algo falló antes de generar
      return crearAnalisisHeuristico(datosAnalisis);
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
        response_mime_type: 'application/json'
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

    await asegurarRateLimit();
    const response = await fetchConReintentos(GEMINI_CONFIG.proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model }),
      signal: controller.signal
    }, { maxRetries: 4, baseDelay: 1000, maxDelay: 12000 });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        // fallback heurístico y cache
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(buildCacheKey(datosAnalisis), heuristico); } catch(e) { /* ignore */ }
        return heuristico;
      }
      throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
    }

  const data = await response.json();
  const analisisTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
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
  const promedio = Number(datos?.promedio) || 0;
  const intentos = Number(datos?.intentos) || 0;
  const tp = Number(datos?.tiempoPromedio) || 0;
  const eficiencia = tp > 0 ? promedio / tp : 0;
  
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
Simulación: "${datos?.simulacion || 'Simulación'}"
Tipo de evaluación: ${datos?.tipoEvaluacion || 'Simulacro académico'}
Nivel educativo: ${datos?.nivelEducativo || 'Preparatoria/Universidad'}

DATOS DE RENDIMIENTO DETALLADOS:
═══════════════════════════════════════

📊 MÉTRICAS GENERALES:
- Intentos realizados: ${Number(datos?.intentos) || 0}
- Puntaje oficial (primer intento): ${datos?.intentoOficial ? `${Number(datos?.intentoOficial?.puntaje || 0).toFixed(1)}%` : 'N/A'}
- Intentos de práctica: ${(Array.isArray(datos?.intentosPractica) ? datos.intentosPractica.length : 0)} ${Array.isArray(datos?.intentosPractica) && datos.intentosPractica.length ? `→ ${datos.intentosPractica.map(i => Number(i.puntaje)||0).join(' | ')}` : ''}
- Promedio general: ${(Number(datos?.promedio) || 0).toFixed(1)}%
- Tiempo promedio por intento: ${(Number(datos?.tiempoPromedio) || 0).toFixed(1)} minutos
- Mejor tiempo registrado: ${Number(datos?.mejorTiempo) || 0} minutos
- Tendencia general: ${tendenciaGeneral}
- Patrones de aprendizaje: ${patronesAprendizaje}
- Nivel de dificultad percibido: ${nivelDificultad}

📈 ANÁLISIS POR MATERIA:
${(datos.materias || []).map(m => `
▶ ${m.nombre}:
  • Promedio: ${(Number(m?.promedio) || 0).toFixed(1)}%
  • Tendencia: ${m.tendencia}
  • Puntajes por intento: ${(m?.puntajes || []).join(' → ')}
  • Mejora: ${calcularMejora(m?.puntajes || [])}%
  • Consistencia: ${calcularConsistencia(m?.puntajes || [])}
  • Tiempo promedio: ${m.tiempoPromedio || 'N/A'} min
`).join('')}

🔍 ÁREAS DE DIFICULTAD IDENTIFICADAS:
${(datos.areasDebiles || []).map(a => `
• ${a?.nombre || 'Área'}: ${(Number(a?.promedio) || 0).toFixed(1)}%
  - Tipo de dificultad: ${a?.tipoDificultad || 'Comprensión conceptual'}
  - Frecuencia de errores: ${a?.frecuenciaErrores || 'Alta'}
`).join('')}

🎯 ANÁLISIS TEMPORAL:
- Eficiencia temporal: ${calcularEficienciaTemporal(datos)}
- Gestión del tiempo: ${evaluarGestionTiempo(datos)}
- Curva de aprendizaje: ${datos.curvaAprendizaje || 'Ascendente'}

INSTRUCCIONES PARA ANÁLISIS AVANZADO:
═══════════════════════════════════════

0. RESPETO DE POLÍTICA DE INTENTOS:
- Considera el primer intento como "puntaje oficial" del estudiante. No lo reemplaces por intentos posteriores.
- Usa el resto de intentos solamente como evidencia de retroalimentación, tendencias y mejora; nunca para modificar el puntaje oficial.

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
        response_mime_type: 'application/json'
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

    await asegurarRateLimit();
    const response = await fetchConReintentos(GEMINI_CONFIG.proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model }),
      signal: controller.signal
    }, { maxRetries: 4, baseDelay: 1000, maxDelay: 12000 });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
    }

  const data = await response.json();
  const analisisTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
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
  const a = (area || '').toLowerCase();
  const materiasDelArea = (datos.materias || []).filter(m => 
    (m?.nombre || '').toLowerCase().includes(a) ||
    obtenerMateriasDeArea(a).some(ma => (m?.nombre || '').toLowerCase().includes(ma.toLowerCase()))
  );
  
  const basePrompt = crearPromptAnalisis(datos);
  
  const especializacionArea = `
ANÁLISIS ESPECIALIZADO PARA ÁREA: ${(area || '').toUpperCase()}
═══════════════════════════════════════

MATERIAS DEL ÁREA EVALUADAS:
${materiasDelArea.map(m => `
• ${m?.nombre || 'Materia'}: ${(Number(m?.promedio) || 0).toFixed(1)}%
  - Puntajes: ${(m?.puntajes || []).join(' → ')}
  - Mejora: ${calcularMejora(m?.puntajes || [])}%
  - Consistencia: ${(calcularConsistencia(m?.puntajes || [])).toFixed(2)}
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
  const original = String(respuestaTexto || '');
  const logFail = (err, intento, muestra) => {
    try { console.warn(`Gemini JSON parse intento ${intento} falló:`, err?.message); if (muestra) console.debug('⮑ muestra:', (muestra.length > 4000 ? muestra.slice(0,4000)+'…' : muestra)); } catch {}
  };

  // 1) Extraer JSON probable (desde fences o por llaves/corchetes)
  const extraerJsonCrudo = (txt) => {
    let t = String(txt || '').trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence && fence[1]) t = fence[1].trim();
    // Si comienza con { … } o [ … ], mantener desde el primer delimitador balanceado
    const firstBrace = t.indexOf('{');
    const firstBracket = t.indexOf('[');
    let startIdx = -1;
    let openChar = null, closeChar = null;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) { startIdx = firstBrace; openChar = '{'; closeChar = '}'; }
    else if (firstBracket !== -1) { startIdx = firstBracket; openChar = '['; closeChar = ']'; }
    if (startIdx === -1) return t; // no hay delimitadores claros, devolver tal cual
    // Balanceo simple ignorando comillas
    let depth = 0; let inStr = false; let esc = false; let endIdx = -1;
    for (let i = startIdx; i < t.length; i++) {
      const ch = t[i];
      if (inStr) {
        if (!esc && ch === '"') inStr = false;
        esc = (!esc && ch === '\\');
        continue;
      }
      if (ch === '"') { inStr = true; esc = false; continue; }
      if (ch === openChar) depth++;
      if (ch === closeChar) depth--;
      if (depth === 0) { endIdx = i; break; }
    }
    if (endIdx !== -1) return t.slice(startIdx, endIdx + 1).trim();
    // fallback a recorte bruto por última llave/corchete
    const lastClose = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (lastClose > startIdx) return t.slice(startIdx, lastClose + 1).trim();
    return t.trim();
  };

  // 2) Saneadores progresivos
  const sanearBasico = (t) => t
    .replace(/^\uFEFF/, '')
    .replace(/[\u0000-\u001F]+/g, ' ') // controla caracteres de control invisibles
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  const quitarComasColgantes = (t) => t
    // comas antes de cierre de objeto/array
    .replace(/,\s*(\}|\])/g, '$1');

  // Intento de autocompletar llaves/corchetes desbalanceados
  const autoBalance = (t) => {
    const s = sanearBasico(t);
    const opens = (s.match(/\{/g) || []).length;
    const closes = (s.match(/\}/g) || []).length;
    const openB = (s.match(/\[/g) || []).length;
    const closeB = (s.match(/\]/g) || []).length;
    let out = s;
    if (opens > closes) out += '}'.repeat(opens - closes);
    if (openB > closeB) out += ']'.repeat(openB - closeB);
    return out;
  };

  const candidates = [];
  candidates.push(extraerJsonCrudo(original));
  // Variante sin fences ni adornos adicionales
  candidates.push(extraerJsonCrudo(original.replace(/```[\s\S]*?```/g, (m)=> m.replace(/```/g,''))));

  for (let intento = 0; intento < candidates.length; intento++) {
    let s = candidates[intento];
    try {
      // Intento A: directo tras saneo básico
      let a = JSON.parse(sanearBasico(s));
      return validarEstructuraAnalisis(a);
    } catch (e1) { logFail(e1, `${intento}-A`, s); }

    try {
      // Intento B: quitar comas colgantes
      let b = quitarComasColgantes(sanearBasico(s));
      return validarEstructuraAnalisis(JSON.parse(b));
    } catch (e2) { logFail(e2, `${intento}-B`, s); }

    try {
      // Intento C: si empieza con [, quedarse con primer objeto
      const cleaned = quitarComasColgantes(sanearBasico(s));
      if (cleaned.startsWith('[')) {
        const arr = JSON.parse(cleaned);
        const obj = Array.isArray(arr) ? (arr.find(x => x && typeof x === 'object') || {}) : {};
        return validarEstructuraAnalisis(obj);
      }
    } catch (e3) { logFail(e3, `${intento}-C`, s); }

    try {
      // Intento D: autobalanceo de llaves/corchetes y parseo
      const d = autoBalance(s);
      const obj = JSON.parse(quitarComasColgantes(d));
      return validarEstructuraAnalisis(obj);
    } catch (e4) { logFail(e4, `${intento}-D`, s); }
  }

  // Todo falló: fallback
  console.warn('⚠️ No se pudo parsear JSON de Gemini; usando análisis fallback');
  return crearAnalisisFallback(original);
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
  // En el cliente, verificamos la presencia del endpoint proxy
  return typeof GEMINI_CONFIG.proxyEndpoint === 'string' && GEMINI_CONFIG.proxyEndpoint.length > 0;
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
    const response = await fetch('/api/ai/gemini/models');
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

// Compatibilidad: export para generación de preguntas de simulación por IA
// Redirige al wrapper aislado para NO duplicar lógica aquí
export const generarPreguntasSimulacionIA = async (opts) => {
  try {
    const mod = await import('./simuladoresAI.js');
    if (mod && typeof mod.generarPreguntasIA === 'function') {
      return await mod.generarPreguntasIA(opts || {});
    }
    throw new Error('Wrapper IA no disponible');
  } catch (e) {
    throw e;
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

    const response = await fetch(GEMINI_CONFIG.proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model }),
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
  const promediosGenerales = (datos.materias || []).map(m => Number(m?.promedio) || 0);
  if (!promediosGenerales.length) return 'Rendimiento estable';
  const half = Math.floor(promediosGenerales.length / 2) || 1;
  const primerosMitad = promediosGenerales.slice(0, half);
  const segundaMitad = promediosGenerales.slice(half);
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const promedioInicial = avg(primerosMitad);
  const promedioFinal = avg(segundaMitad.length ? segundaMitad : primerosMitad);
  
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
  const materias = datos.materias || [];
  const materiasConsistentes = materias.filter(m => calcularConsistencia(m.puntajes || []) > 0.8);
  const materiasInconsistentes = materias.filter(m => calcularConsistencia(m.puntajes || []) < 0.6);
  
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
  const promedioGeneral = Number(datos?.promedio) || 0;
  const tiempoPromedio = Number(datos?.tiempoPromedio) || 0;
  
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
  if (!Array.isArray(puntajes) || puntajes.length < 2) return 0;
  const primero = Number(puntajes[0]) || 0;
  const ultimo = Number(puntajes[puntajes.length - 1]) || 0;
  if (primero <= 0) return 0;
  return Number(((ultimo - primero) / primero * 100).toFixed(1));
};

/**
 * Calcular consistencia del rendimiento
 * @param {Array} puntajes - Array de puntajes
 * @returns {number} - Índice de consistencia (0-1)
 */
const calcularConsistencia = (puntajes) => {
  if (!Array.isArray(puntajes) || puntajes.length < 2) return 1;
  const arr = puntajes.map(v => Number(v) || 0);
  const promedio = arr.reduce((a, b) => a + b, 0) / arr.length;
  if (promedio <= 0) return 0;
  const desviacion = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / arr.length);
  return Math.max(0, 1 - (desviacion / promedio));
};

/**
 * Calcular eficiencia temporal
 * @param {Object} datos - Datos del estudiante
 * @returns {string} - Evaluación de eficiencia
 */
const calcularEficienciaTemporal = (datos) => {
  const promedio = Number(datos?.promedio) || 0;
  const tp = Number(datos?.tiempoPromedio) || 0;
  const eficiencia = tp > 0 ? promedio / tp : 0;
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
  const tp = Number(datos?.tiempoPromedio) || 0;
  const mt = Number(datos?.mejorTiempo) || 0;
  const diferenciaTiempo = tp - mt;
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
  const materiaDebil = (datos.materias || []).reduce((min, actual) => 
    (actual?.promedio ?? Infinity) < (min?.promedio ?? Infinity) ? actual : min
  , (datos.materias || [null])[0]);
  
  // Mapear materia a área
  const materia = (materiaDebil?.nombre || '').toLowerCase();
  
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
  // Si 'principal' viene simplificado, mapearlo a estructura rica
  const mapPrincipalToRich = (p) => {
    if (!p) return {};
    const fortalezasDetalladas = (p.fortalezas || []).map(f => ({
      materia: f.materia,
      nivel: 'Bueno',
      habilidadesEspecificas: [],
      comentario: f.comentario || 'Rendimiento sólido',
      comoMantener: 'Práctica constante'
    }));
    const areasDeDesarrollo = (p.debilidades || []).map(d => ({
      materia: d.materia,
      nivelDificultad: 'Media',
      tipoProblema: 'Conceptual',
      diagnostico: d.comentario || 'Área de mejora',
      estrategiasPrincipales: d.accionesEspecificas || [],
      recursosRecomendados: [],
      tiempoEstimado: '2-4 semanas',
      indicadoresProgreso: []
    }));
    const planEstudioPersonalizado = p.planEstudio ? {
      faseInicial: {
        duracion: '2-3 semanas',
        objetivos: ['Mejorar fundamentos'],
        actividades: (p.planEstudio.prioridad || []).map(a => ({
          materia: a.materia,
          tiempo: a.tiempo,
          actividad: a.enfoque,
          recursos: [],
          evaluacion: 'Autoevaluación semanal'
        }))
      }
    } : undefined;
    return { fortalezasDetalladas, areasDeDesarrollo, planEstudioPersonalizado, analisisGeneral: { resumen: p.resumen || 'Análisis generado' } };
  };

  const principalRich = { ...mapPrincipalToRich(principal), ...(principal || {}) };

  const analisisCombinado = {
    timestamp: new Date().toISOString(),
    tipoEstudiante,
    metadata: {
      simulacion: datos?.simulacion,
      intentos: Number(datos?.intentos) || 0,
      promedio: Number(datos?.promedio) || 0,
      tiempoPromedio: Number(datos?.tiempoPromedio) || 0,
      numeroMaterias: Array.isArray(datos?.materias) ? datos.materias.length : 0,
      puntuacionConfianza: Number(principal?.puntuacionConfianza) || 85
    },
    
    // Análisis general (del análisis principal)
    analisisGeneral: principalRich.analisisGeneral || principal.analisisGeneral || {},
    
    // Combinar fortalezas de todos los análisis
    fortalezasDetalladas: [
      ...(principalRich.fortalezasDetalladas || principal.fortalezasDetalladas || []),
      ...(especializado?.fortalezasDetalladas || []),
      ...(porArea?.fortalezasDetalladas || [])
    ].filter((fortaleza, index, self) => 
      index === self.findIndex(f => f.materia === fortaleza.materia)
    ),
    
    // Combinar áreas de desarrollo
    areasDeDesarrollo: [
      ...(principalRich.areasDeDesarrollo || principal.areasDeDesarrollo || []),
      ...(especializado?.areasDeDesarrollo || []),
      ...(porArea?.areasDeDesarrollo || [])
    ].filter((area, index, self) => 
      index === self.findIndex(a => a.materia === area.materia)
    ),
    
    // Plan de estudio personalizado (tomar el más completo)
  planEstudioPersonalizado: especializado?.planEstudioPersonalizado || 
               principalRich.planEstudioPersonalizado || principal.planEstudioPersonalizado || {},
    
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
  const lista = Array.isArray(datos?.materias) ? datos.materias : [];
  if (lista.length === 0) {
    return [
      {
        orden: 1,
        titulo: 'Establecer línea base',
        descripcion: 'Realiza un simulacro para obtener datos iniciales de rendimiento',
        plazo: '1 semana',
        prioridad: 'Alta'
      }
    ];
  }
  const areaDebil = lista.reduce((min, actual) => 
    (Number(actual?.promedio) || Infinity) < (Number(min?.promedio) || Infinity) ? actual : min
  );
  
  pasos.push({
    orden: 1,
    titulo: `Reforzar ${areaDebil.nombre}`,
    descripcion: `Dedica 40% de tu tiempo de estudio a ${areaDebil.nombre} (promedio actual: ${areaDebil.promedio.toFixed(1)}%)`,
    plazo: '2 semanas',
    prioridad: 'Alta'
  });
  
  // Paso 2: Optimizar tiempo de estudio
  if ((Number(datos?.tiempoPromedio) || 0) > 60) {
    pasos.push({
      orden: 2,
      titulo: 'Optimizar tiempo de estudio',
      descripcion: 'Implementar técnica Pomodoro para reducir tiempo promedio de estudio',
      plazo: '1 semana',
      prioridad: 'Media'
    });
  }
  
  // Paso 3: Mantener fortalezas
  const areaFuerte = lista.reduce((max, actual) => 
    (Number(actual?.promedio) || -Infinity) > (Number(max?.promedio) || -Infinity) ? actual : max
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
  if (!Array.isArray(valores) || valores.length === 0) return 0;
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const varianza = valores.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / valores.length;
  return Math.sqrt(varianza);
};

const calcularCoeficienteVariacion = (valores) => {
  if (!Array.isArray(valores) || valores.length === 0) return 0;
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  if (promedio === 0) return 0;
  const desviacion = calcularDesviacionEstandar(valores);
  return (desviacion / promedio) * 100;
};

const calcularConsistenciaGeneral = (materias) => {
  const lista = Array.isArray(materias) ? materias : [];
  if (lista.length === 0) return 0;
  const consistencias = lista.map(m => calcularConsistencia(m?.puntajes || []));
  return consistencias.reduce((a, b) => a + b, 0) / consistencias.length;
};

const calcularTendenciaAprendizaje = (materias) => {
  const lista = Array.isArray(materias) ? materias : [];
  if (lista.length === 0) return 'Estable';
  const tendencias = lista.map(m => {
    const mejora = calcularMejora(m?.puntajes || []);
    return Number(mejora) || 0;
  });
  const promedioTendencia = tendencias.reduce((a, b) => a + b, 0) / (tendencias.length || 1);
  
  if (promedioTendencia > 10) return 'Mejora significativa';
  if (promedioTendencia > 5) return 'Mejora gradual';
  if (promedioTendencia > -5) return 'Estable';
  return 'Necesita atención';
};

const calcularIndiceImprovement = (materias) => {
  const lista = Array.isArray(materias) ? materias : [];
  if (lista.length === 0) return 0;
  const mejoras = lista.map(m => Number(calcularMejora(m?.puntajes || [])) || 0);
  const mejorasPositivas = mejoras.filter(m => m > 0).length;
  return (mejorasPositivas / lista.length) * 100;
};