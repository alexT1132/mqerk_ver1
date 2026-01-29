// Configuración para integración con Gemini API
// Este archivo contiene las funciones necesarias para conectar con la API de Gemini

/**
 * Configuración de la API de Gemini
 * Nota: En Vite, las variables de entorno se acceden con import.meta.env
 */
const GEMINI_CONFIG = {
  // ⚠️ SEGURIDAD: El cliente NUNCA debe usar la API key directamente
  // Todas las peticiones deben ir a través del proxy del servidor
  // La API key solo existe en el servidor (server/.env)
  apiKey: '', // ⚠️ NO USAR - Solo para referencia, el proxy maneja la autenticación
  proxyEndpoint: '/api/ai/gemini/generate',
  // Permite override del modelo vía variable de entorno
  model: (import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash'),
  temperature: 0.7,
  maxTokens: 1500, // permitir respuestas más ricas
  timeout: 30000
};

// ===================== utilidades internas =====================
const ESPERA = (ms) => new Promise(res => setTimeout(res, ms));

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas
const buildCacheKey = (datos) => {
  // Construir clave más específica que incluya tipo de análisis y datos relevantes
  const simulacion = (datos.simulacion || 'simulacion').replace(/\s+/g, '_');
  const tipoAnalisis = datos.analisisTipo || datos.tipo || 'general';

  // Para análisis de fallos repetidos, incluir hash de preguntas problemáticas para hacerlo único
  let hashExtra = '';
  if (tipoAnalisis === 'fallos_repetidos' && Array.isArray(datos.preguntasProblematicas)) {
    // Crear hash simple basado en IDs de preguntas problemáticas
    const ids = datos.preguntasProblematicas.map(p => p.id || p.orden || '').sort().join('_');
    const hash = ids.length > 0 ? btoa(ids).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16) : '';
    hashExtra = `_${hash}`;
  }

  // Incluir ID de estudiante si está disponible para hacer el caché específico por estudiante
  const estudianteId = datos.idEstudiante || datos.estudiante?.id || '';
  const estudianteHash = estudianteId ? `_est${estudianteId}` : '';

  return `gemini_analisis_${simulacion}_${tipoAnalisis}${hashExtra}${estudianteHash}`;
};
// Rate limiter simple por ventana (evita golpear la API)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX_CALLS = 3; // máx 3 llamadas/min por pestaña
let callTimestamps = [];

const asegurarRateLimit = async () => {
  const ahora = Date.now();
  callTimestamps = callTimestamps.filter(ts => ahora - ts < RATE_LIMIT_WINDOW_MS);
  if (callTimestamps.length >= RATE_LIMIT_MAX_CALLS) {
    const espera = RATE_LIMIT_WINDOW_MS - (ahora - callTimestamps[0]) + Math.random() * 300;
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
  } catch (e) { /* ignore */ }
};

const leerCacheValido = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envoltura = JSON.parse(raw);
    if (Date.now() - envoltura.ts > CACHE_TTL_MS) return null;
    return envoltura.payload;
  } catch (e) { return null; }
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
    planEstudio: { prioridad: debilidades.slice(0, 3).map(d => ({ materia: d.materia, tiempo: '30-40 min diarios', enfoque: 'Fundamentos y práctica guiada' })) },
    esFallbackLocal: true,
    timestamp: new Date().toISOString(),
    nota: 'Mostrando análisis heurístico por límite de cuota (429) o error en IA.'
  };
};

export const limpiarCacheAnalisisGemini = (datos) => {
  try { localStorage.removeItem(buildCacheKey(datos)); } catch (e) { /* ignore */ }
};

/**
 * Función para generar análisis de rendimiento usando Gemini API
 * @param {Object} datosAnalisis - Datos del rendimiento del estudiante
 * @param {Object} opciones - Opciones adicionales (forceRegenerate: true para forzar regeneración sin cache)
 * @returns {Promise<Object>} - Análisis generado por IA
 */
export const generarAnalisisConGemini = async (datosAnalisis, opciones = {}) => {
  try {
    console.log('🚀 Iniciando análisis con Gemini API');
    console.log('📊 Datos recibidos:', datosAnalisis);
    
    // Intentar cache primero (solo si no se fuerza la regeneración)
    const cacheKey = buildCacheKey(datosAnalisis || {});
    
    // Si se fuerza la regeneración, limpiar el cache primero
    if (opciones.forceRegenerate) {
      console.log('🔄 Forzando regeneración - limpiando cache');
      limpiarCacheAnalisisGemini(datosAnalisis);
    } else {
      const cache = leerCacheValido(cacheKey);
      if (cache) {
        console.warn('📦 Usando análisis desde cache');
        return { ...cache, desdeCache: true };
      }
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
      credentials: 'include',
      body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model, purpose: 'quizzes' }), // Usa GEMINI_API_KEY_QUIZZES
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
        try { guardarEnCache(cacheKey, heuristico); } catch (e) { /* ignore */ }
        return heuristico;
      }
      if (response.status === 404) {
        console.warn(`📭 Modelo no disponible (${GEMINI_CONFIG.model}). Usando análisis heurístico local.`);
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(cacheKey, heuristico); } catch (e) { /* ignore */ }
        return heuristico;
      }
      // Fallback amigable si el servidor no tiene configurada la API Key
      if (response.status === 500 && typeof (errorData?.error) === 'string' && errorData.error.includes('GEMINI_API_KEY')) {
        console.warn('🔐 GEMINI_API_KEY no configurada en el servidor. Generando análisis heurístico local.');
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(cacheKey, heuristico); } catch (e) { /* ignore */ }
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
    // Cuando se usa response_mime_type: 'application/json', la respuesta puede venir como JSON directo
    let analisisTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Si la respuesta viene como JSON estructurado (cuando se usa response_mime_type)
    // Intentar parsear directamente primero
    let resultado = null;
    if (analisisTexto && analisisTexto.trim().startsWith('{')) {
      try {
        // Intentar parsear directamente como JSON
        resultado = JSON.parse(analisisTexto);
        console.log('✅ JSON parseado directamente desde respuesta estructurada');
        resultado = validarEstructuraAnalisis(resultado);
      } catch (e) {
        console.warn('⚠️ No se pudo parsear directamente, usando procesamiento normal:', e.message);
        // Continuar con el procesamiento normal
      }
    }
    
    // Si no se pudo parsear directamente, usar el procesador normal
    if (!resultado) {
      console.log('📝 Texto de análisis recibido:', analisisTexto.substring(0, 200) + '...');
      // Si es análisis de fallos repetidos (para asesor), usar procesador especializado
      if (datosAnalisis?.analisisTipo === 'fallos_repetidos') {
        resultado = procesarRespuestaGeminiAsesor(analisisTexto);
      } else {
        resultado = procesarRespuestaGemini(analisisTexto);
      }
    }
    
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
      // ✅ Nuevos campos: preguntas problemáticas y patrones de errores
      preguntasProblematicas: resultado.preguntasProblematicas || [],
      patronesErrores: resultado.patronesErrores || {},
      metadata: resultado.metadata || {},
      puntuacionConfianza: resultado.puntuacionConfianza || 80,
      recomendaciones: resultado.recomendacionesPersonalizadas || [],
      // ✅ Campos adicionales para la modal del asesor
      intervencionAsesor: resultado.intervencionAsesor || null,
      planIntervencion: resultado.planIntervencion || null,
      analisisGeneral: resultado.analisisGeneral || null,
      estrategiasEstudio: resultado.estrategiasEstudio || [],
      recomendacionesPersonalizadas: resultado.recomendacionesPersonalizadas || [],
      timestamp: new Date().toISOString(),
      // ✅ Incluir el resultado completo para la modal
      _completo: resultado
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
      credentials: 'include',
      body: JSON.stringify({ ...requestBody, model: GEMINI_CONFIG.model, purpose: 'quizzes' }),
      signal: controller.signal
    }, { maxRetries: 4, baseDelay: 1000, maxDelay: 12000 });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        // fallback heurístico y cache
        const heuristico = crearAnalisisHeuristico(datosAnalisis);
        try { guardarEnCache(buildCacheKey(datosAnalisis), heuristico); } catch (e) { /* ignore */ }
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
};

/**
 * Crear prompt avanzado para análisis completo de rendimiento
 * MODIFICADO: Enfocado en resoluciones paso a paso y detalle pedagógico
 */
const crearPromptAnalisis = (datos) => {
  // Si es análisis de fallos repetidos, mantener su lógica
  if (datos?.analisisTipo === 'fallos_repetidos') {
    return crearPromptFallosRepetidos(datos);
  }

  const nombreEstudiante = datos?.alumnoNombre || null;
  const primerNombre = nombreEstudiante ? nombreEstudiante.split(/\s+/)[0] : null;

  return `
Actúa como un TUTOR EXPERTO DE NIVEL UNIVERSITARIO. Tu objetivo no es solo evaluar, sino ENSEÑAR mediante la corrección detallada.

CONTEXTO:
Estudiante: ${nombreEstudiante || 'Estudiante'}
Simulación: "${datos?.simulacion || 'Simulación'}"
Puntaje Oficial: ${datos?.intentoOficial ? `${Number(datos?.intentoOficial?.puntaje || 0).toFixed(1)}%` : 'N/A'}

INSTRUCCIONES CRÍTICAS DE PEDAGOGÍA:
1. **CERO GENERALIDADES:** No digas "estudia más matemáticas". Di "revisa la factorización de trinomios cuadrados perfectos".
2. **RESOLUCIÓN PASO A PASO OBLIGATORIA:** En la sección de "preguntasProblematicas", si la pregunta implica CÁLCULOS (Matemáticas, Física, Química, Finanzas) o LÓGICA secuencial:
   - NO digas simplemente "La respuesta es 50".
   - DEBES escribir el procedimiento: "Paso 1: Planteamos la fórmula F=ma... Paso 2: Sustituimos 10kg... Paso 3: Calculamos...".
   - Si el estudiante se equivocó en un signo o un despeje, señálalo explícitamente.

FORMATO DE RESPUESTA (JSON ESTRICTO):
{
  "analisisGeneral": {
    "resumen": "${nombreEstudiante ? `Hola, ${primerNombre}. ` : 'Hola. '}He revisado tu simulación. Aquí tienes el desglose detallado de tus errores y cómo corregirlos paso a paso...",
    "nivelActual": "Básico/Intermedio/Avanzado",
    "motivacion": "Frase breve de aliento basada en datos reales"
  },
  "fortalezasDetalladas": [
    {
      "materia": "Materia",
      "comentario": "Por qué lo hizo bien (ej. 'Dominas perfectamente el despeje de ecuaciones lineales')"
    }
  ],
  "areasDeDesarrollo": [
    {
      "materia": "Materia débil",
      "diagnostico": "Diagnóstico técnico (ej. 'Errores consistentes en la aplicación de la jerarquía de operaciones')",
      "estrategiasPrincipales": ["Acción concreta 1", "Acción concreta 2"],
      "accionesEspecificas": ["Acción concreta 1", "Acción concreta 2"]
    }
  ],
  "preguntasProblematicas": [
    {
      "idPregunta": "ID",
      "enunciado": "Texto breve de la pregunta",
      "vecesFallada": 1,
      "seleccion": ["Respuesta errónea del estudiante"],
      "correctas": ["Respuesta correcta"],
      "tipoError": "Conceptual/Procedimental/Atención",
      "analisis": "EXPLICACIÓN MAESTRA: Aquí es donde debes brillar. 1. Explica el concepto. 2. DESARROLLA LA SOLUCIÓN COMPLETA PASO A PASO (usa texto plano claro, ej: 'Primero multiplicamos A por B...'). 3. Explica por qué la respuesta del estudiante es incorrecta (ej: 'Sumaste en lugar de restar en el segundo paso').",
      "recomendacion": "Consejo técnico rápido (ej: 'Recuerda siempre convertir unidades a metros antes de calcular')."
    }
  ],
  "planEstudioPersonalizado": {
    "faseInicial": {
      "actividades": [
        {
          "materia": "Materia prioritaria",
          "tiempo": "30 min",
          "actividad": "Tema específico a repasar basado en los errores"
        }
      ]
    }
  }
}

DATOS DE ERRORES DEL ESTUDIANTE (ANALIZA ESTO A FONDO):
${Array.isArray(datos?.incorrectasDetalle) && datos.incorrectasDetalle.length ? JSON.stringify(datos.incorrectasDetalle.slice(0, 7), null, 2) : 'No hay detalles de errores específicos disponibles, genera recomendaciones generales basadas en los promedios.'}

MÉTRICAS POR MATERIA:
${(datos.materias || []).map(m => `- ${m.nombre}: ${m.promedio}%`).join('\n')}

IMPORTANTE:
- Prioriza la sección "preguntasProblematicas". Es la más valiosa para el estudiante.
- Usa lenguaje matemático preciso pero claro.
- Si el estudiante respondió "$425" y era "$475", busca la lógica del error (quizás olvidó sumar el costo fijo).

Responde SOLO con el JSON.
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
      credentials: 'include',
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
 * Procesar respuesta de Gemini para análisis del asesor (versión especializada más robusta)
 * Esta función es más agresiva en reparar comillas sin escapar, especialmente en arrays
 * @param {string} respuestaTexto - Respuesta de Gemini
 * @returns {Object} - Análisis procesado
 */
const procesarRespuestaGeminiAsesor = (respuestaTexto) => {
  const original = String(respuestaTexto || '');
  console.log('🔧 Usando procesador especializado para análisis del asesor');
  
  // Si falla, usar reparación ultra-agresiva específica para arrays
  const repararJsonAsesor = (texto) => {
    let resultado = '';
    let dentroString = false;
    let escape = false;
    let dentroArray = false;
    let depthArray = 0;
    let depthObjeto = 0;
    let i = 0;
    
    while (i < texto.length) {
      const char = texto[i];
      const siguiente = i + 1 < texto.length ? texto[i + 1] : null;
      const siguiente2 = i + 2 < texto.length ? texto[i + 2] : null;
      
      // Manejar escape
      if (escape) {
        resultado += char;
        escape = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        resultado += char;
        escape = true;
        i++;
        continue;
      }
      
      // Si estamos dentro de un string
      if (dentroString) {
        // Si encontramos una comilla
        if (char === '"') {
          // Verificar contexto para determinar si es cierre válido
          let j = i + 1;
          // Saltar espacios
          while (j < texto.length && (texto[j] === ' ' || texto[j] === '\n' || texto[j] === '\r' || texto[j] === '\t')) {
            j++;
          }
          
          if (j >= texto.length) {
            // Fin del texto - cierre válido
            resultado += char;
            dentroString = false;
            i++;
            continue;
          }
          
          const siguienteNoEspacio = texto[j];
          
          // Si estamos dentro de un array y el siguiente es ',' o ']', es cierre válido
          if (dentroArray && (siguienteNoEspacio === ',' || siguienteNoEspacio === ']')) {
            resultado += char;
            dentroString = false;
            i++;
            continue;
          }
          
          // Si el siguiente es ',' o '}' o ']' o ':', es cierre válido
          if (siguienteNoEspacio === ',' || siguienteNoEspacio === '}' || siguienteNoEspacio === ']' || siguienteNoEspacio === ':') {
            resultado += char;
            dentroString = false;
            i++;
            continue;
          }
          
          // Si hay un patrón de nueva clave JSON después (ej: "key":)
          const patronClave = texto.slice(j, Math.min(j + 10, texto.length)).match(/^\s*"[^"]*"\s*:/);
          if (patronClave) {
            resultado += char;
            dentroString = false;
            i++;
            continue;
          }
          
          // En cualquier otro caso, es una comilla dentro del string - ESCAPARLA
          resultado += '\\"';
          i++;
          continue;
        }
        
        // Escapar caracteres problemáticos dentro de strings
        if (char === '\n') {
          resultado += '\\n';
        } else if (char === '\r') {
          resultado += '\\r';
        } else if (char === '\t') {
          resultado += '\\t';
        } else if (char.charCodeAt(0) < 32) {
          resultado += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
        } else {
          resultado += char;
        }
        i++;
        continue;
      }
      
      // Fuera de strings
      if (char === '"') {
        resultado += char;
        dentroString = true;
        i++;
        continue;
      }
      
      if (char === '[') {
        depthArray++;
        dentroArray = true;
        resultado += char;
        i++;
        continue;
      }
      
      if (char === ']') {
        depthArray--;
        if (depthArray === 0) dentroArray = false;
        resultado += char;
        i++;
        continue;
      }
      
      if (char === '{') {
        depthObjeto++;
        resultado += char;
        i++;
        continue;
      }
      
      if (char === '}') {
        depthObjeto--;
        resultado += char;
        i++;
        continue;
      }
      
      resultado += char;
      i++;
    }
    
    // Cerrar string si quedó abierto
    if (dentroString) {
      resultado += '"';
    }
    
    // Balancear estructura
    while (depthArray > 0) {
      resultado += ']';
      depthArray--;
    }
    while (depthObjeto > 0) {
      resultado += '}';
      depthObjeto--;
    }
    
    return resultado;
  };
  
  // Extraer JSON crudo
  const extraerJsonCrudo = (txt) => {
    let t = String(txt || '').trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence && fence[1]) t = fence[1].trim();
    const firstBrace = t.indexOf('{');
    if (firstBrace === -1) return t;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let endIdx = -1;
    for (let i = firstBrace; i < t.length; i++) {
      const ch = t[i];
      if (inStr) {
        if (!esc && ch === '"') inStr = false;
        esc = (!esc && ch === '\\');
        continue;
      }
      if (ch === '"') { inStr = true; esc = false; continue; }
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth === 0) { endIdx = i; break; }
    }
    if (endIdx !== -1) return t.slice(firstBrace, endIdx + 1).trim();
    const lastClose = t.lastIndexOf('}');
    if (lastClose > firstBrace) return t.slice(firstBrace, lastClose + 1).trim();
    return t.trim();
  };
  
  const sanearBasico = (t) => t
    .replace(/^\uFEFF/, '')
    .replace(/[\u0000-\u001F]+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();
  
  const quitarComasColgantes = (t) => t.replace(/,\s*(\}|\])/g, '$1');
  
  // Intentar múltiples estrategias
  const jsonCrudo = extraerJsonCrudo(original);
  
  // Intento 1: Reparación especializada para asesor
  try {
    let reparado = repararJsonAsesor(jsonCrudo);
    reparado = quitarComasColgantes(sanearBasico(reparado));
    const parsed = JSON.parse(reparado);
    return validarEstructuraAnalisis(parsed);
  } catch (e1) {
    console.warn('⚠️ Intento 1 (reparación especializada) falló:', e1.message);
  }
  
  // Intento 2: Reparación especializada + balanceo
  try {
    let reparado = repararJsonAsesor(jsonCrudo);
    // Auto-balancear
    const opens = (reparado.match(/\{/g) || []).length;
    const closes = (reparado.match(/\}/g) || []).length;
    const openB = (reparado.match(/\[/g) || []).length;
    const closeB = (reparado.match(/\]/g) || []).length;
    if (opens > closes) reparado += '}'.repeat(opens - closes);
    if (openB > closeB) reparado += ']'.repeat(openB - closeB);
    reparado = quitarComasColgantes(sanearBasico(reparado));
    const parsed = JSON.parse(reparado);
    return validarEstructuraAnalisis(parsed);
  } catch (e2) {
    console.warn('⚠️ Intento 2 (reparación + balanceo) falló:', e2.message);
  }
  
  // Si todo falla, intentar parseo directo con reparación básica
  try {
    let ultimoIntento = repararJsonAsesor(jsonCrudo);
    ultimoIntento = quitarComasColgantes(sanearBasico(ultimoIntento));
    // Auto-balancear
    const opens = (ultimoIntento.match(/\{/g) || []).length;
    const closes = (ultimoIntento.match(/\}/g) || []).length;
    const openB = (ultimoIntento.match(/\[/g) || []).length;
    const closeB = (ultimoIntento.match(/\]/g) || []).length;
    if (opens > closes) ultimoIntento += '}'.repeat(opens - closes);
    if (openB > closeB) ultimoIntento += ']'.repeat(openB - closeB);
    const parsed = JSON.parse(ultimoIntento);
    return validarEstructuraAnalisis(parsed);
  } catch (eFinal) {
    console.error('❌ Todos los intentos especializados fallaron');
    // Crear análisis fallback
    return crearAnalisisFallback(original);
  }
};

/**
 * Procesar respuesta de Gemini para extraer análisis estructurado
 * @param {string} respuestaTexto - Respuesta de Gemini
 * @returns {Object} - Análisis procesado
 */
const procesarRespuestaGemini = (respuestaTexto) => {
  const original = String(respuestaTexto || '');
  const logFail = (err, intento, muestra) => {
    try { 
      console.warn(`Gemini JSON parse intento ${intento} falló:`, err?.message); 
      if (err?.message && err.message.includes('position')) {
        const posMatch = err.message.match(/position (\d+)/);
        if (posMatch && muestra) {
          const pos = parseInt(posMatch[1]);
          const inicio = Math.max(0, pos - 200);
          const fin = Math.min(muestra.length, pos + 200);
          const contexto = muestra.slice(inicio, fin);
          console.error(`⮑ Error en posición ${pos} (línea ${err.message.match(/line (\d+)/)?.[1] || '?'}):`);
          console.error(`⮑ Contexto (200 chars antes y después):`, contexto);
          console.error(`⮑ Carácter problemático:`, muestra[pos] || 'N/A');
          console.error(`⮑ Caracteres alrededor:`, muestra.slice(Math.max(0, pos - 10), Math.min(muestra.length, pos + 10)));
        }
      }
      // Solo mostrar muestra completa si es pequeña o en modo debug
      if (muestra && muestra.length < 1000) {
        console.debug('⮑ muestra completa:', muestra);
      }
    } catch (e) { 
      console.error('Error en logFail:', e);
    }
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
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();

  const quitarComasColgantes = (t) => t
    // comas antes de cierre de objeto/array
    .replace(/,\s*(\}|\])/g, '$1');

  // 3) Reparar strings no terminados en JSON de forma más robusta
  const repararStringsNoTerminados = (t) => {
    let resultado = '';
    let dentroString = false;
    let escape = false;
    let i = 0;
    let ultimaComilla = -1;

    while (i < t.length) {
      const char = t[i];
      const charCode = char.charCodeAt(0);

      if (escape) {
        resultado += char;
        escape = false;
        i++;
        continue;
      }

      if (char === '\\') {
        resultado += char;
        escape = true;
        i++;
        continue;
      }

      if (char === '"') {
        resultado += char;
        ultimaComilla = resultado.length - 1;
        dentroString = !dentroString;
        i++;
        continue;
      }

      // Si estamos dentro de un string
      if (dentroString) {
        // Caracteres de control que deben ser escapados
        if (charCode < 32) {
          if (char === '\n') {
            resultado += '\\n';
          } else if (char === '\r') {
            resultado += '\\r';
          } else if (char === '\t') {
            resultado += '\\t';
          } else if (char === '\b') {
            resultado += '\\b';
          } else if (char === '\f') {
            resultado += '\\f';
          } else {
            // Otros caracteres de control: escapar como \uXXXX
            resultado += `\\u${charCode.toString(16).padStart(4, '0')}`;
          }
          i++;
          continue;
        }

        // Si encontramos una comilla simple dentro de un string, dejarla (es válida)
        if (char === "'") {
          resultado += char;
          i++;
          continue;
        }
      }

      resultado += char;
      i++;
    }

    // Si el string quedó abierto, cerrarlo
    if (dentroString) {
      // Buscar si hay una comilla de cierre más adelante que podríamos haber perdido
      // Si no, simplemente cerrar el string
      resultado += '"';
    }

    return resultado;
  };

  // 4) Limpiar y escapar caracteres problemáticos en strings JSON (versión mejorada)
  const limpiarStringsJSON = (t) => {
    // Primero, reparar strings no terminados
    let resultado = repararStringsNoTerminados(t);

    // Segunda pasada: buscar y reparar problemas específicos
    // Buscar patrones de strings mal formados usando regex más inteligente
    let nuevoResultado = resultado;

    // Patrón para encontrar strings JSON (desde " hasta " sin escapar)
    // Pero necesitamos ser más cuidadosos con el parsing
    let i = 0;
    let dentroString = false;
    let escape = false;
    let resultadoFinal = '';

    while (i < nuevoResultado.length) {
      const char = nuevoResultado[i];

      if (escape) {
        resultadoFinal += char;
        escape = false;
        i++;
        continue;
      }

      if (char === '\\') {
        resultadoFinal += char;
        escape = true;
        i++;
        continue;
      }

      if (char === '"') {
        resultadoFinal += char;
        dentroString = !dentroString;
        i++;
        continue;
      }

      // Si estamos dentro de un string
      if (dentroString) {
        // Verificar si hay caracteres problemáticos
        const charCode = char.charCodeAt(0);

        // Si es un salto de línea o retorno de carro sin escapar
        if (char === '\n' || char === '\r') {
          // Ya debería estar escapado de la primera pasada, pero por si acaso
          if (i === 0 || nuevoResultado[i - 1] !== '\\') {
            resultadoFinal += char === '\n' ? '\\n' : '\\r';
            i++;
            continue;
          }
        }

        // Si es un carácter de control
        if (charCode < 32 && char !== '\n' && char !== '\r' && char !== '\t') {
          resultadoFinal += `\\u${charCode.toString(16).padStart(4, '0')}`;
          i++;
          continue;
        }
      }

      resultadoFinal += char;
      i++;
    }

    // Si quedó un string abierto, cerrarlo
    if (dentroString) {
      resultadoFinal += '"';
    }

    return resultadoFinal;
  };

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
  candidates.push(extraerJsonCrudo(original.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))));

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
      // Intento C: reparar strings no terminados
      let c = limpiarStringsJSON(sanearBasico(s));
      c = quitarComasColgantes(c);
      return validarEstructuraAnalisis(JSON.parse(c));
    } catch (e3) { logFail(e3, `${intento}-C`, s); }

    try {
      // Intento D: si empieza con [, quedarse con primer objeto
      const cleaned = quitarComasColgantes(sanearBasico(s));
      if (cleaned.startsWith('[')) {
        const arr = JSON.parse(cleaned);
        const obj = Array.isArray(arr) ? (arr.find(x => x && typeof x === 'object') || {}) : {};
        return validarEstructuraAnalisis(obj);
      }
    } catch (e4) { logFail(e4, `${intento}-D`, s); }

    try {
      // Intento E: reparar strings + autobalanceo
      let e = limpiarStringsJSON(s);
      e = autoBalance(e);
      e = quitarComasColgantes(sanearBasico(e));
      return validarEstructuraAnalisis(JSON.parse(e));
    } catch (e5) { logFail(e5, `${intento}-E`, s); }

    try {
      // Intento F: autobalanceo de llaves/corchetes y parseo (original D)
      const f = autoBalance(s);
      const obj = JSON.parse(quitarComasColgantes(f));
      return validarEstructuraAnalisis(obj);
    } catch (e6) { logFail(e6, `${intento}-F`, s); }

    try {
      // Intento G: estrategia agresiva - reparar strings problemáticos usando regex
      let g = s;
      // Buscar strings que empiezan con " pero no terminan correctamente
      // Patrón: " seguido de contenido hasta encontrar " o fin de línea problemático
      g = g.replace(/"([^"\\]*(\\.[^"\\]*)*)"?/g, (match, contenido, grupo) => {
        // Si el match no termina con ", está mal formado
        if (!match.endsWith('"')) {
          // Escapar caracteres problemáticos y cerrar el string
          const contenidoLimpio = contenido
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/"/g, '\\"');
          return `"${contenidoLimpio}"`;
        }
        return match;
      });
      g = quitarComasColgantes(sanearBasico(g));
      g = autoBalance(g);
      return validarEstructuraAnalisis(JSON.parse(g));
    } catch (e7) { logFail(e7, `${intento}-G`, s); }

    try {
      // Intento H: última estrategia - extraer solo el objeto principal y reparar manualmente
      let h = extraerJsonCrudo(s);
      // Buscar y reparar strings no terminados de forma más agresiva
      let dentroString = false;
      let escape = false;
      let resultadoH = '';

      for (let i = 0; i < h.length; i++) {
        const char = h[i];

        if (escape) {
          resultadoH += char;
          escape = false;
          continue;
        }

        if (char === '\\') {
          resultadoH += char;
          escape = true;
          continue;
        }

        if (char === '"') {
          resultadoH += char;
          dentroString = !dentroString;
          continue;
        }

        if (dentroString) {
          // Si encontramos caracteres problemáticos, escapar
          if (char === '\n') {
            resultadoH += '\\n';
          } else if (char === '\r') {
            resultadoH += '\\r';
          } else if (char === '\t') {
            resultadoH += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            resultadoH += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            resultadoH += char;
          }
        } else {
          resultadoH += char;
        }
      }

      // Cerrar string si quedó abierto
      if (dentroString) {
        resultadoH += '"';
      }

      resultadoH = quitarComasColgantes(sanearBasico(resultadoH));
      resultadoH = autoBalance(resultadoH);
      return validarEstructuraAnalisis(JSON.parse(resultadoH));
    } catch (e8) { logFail(e8, `${intento}-H`, s); }

    try {
      // Intento I: Reparación agresiva de comillas sin escapar dentro de strings
      let i = extraerJsonCrudo(s);
      let resultadoI = '';
      let dentroString = false;
      let escape = false;
      let pos = 0;

      while (pos < i.length) {
        const char = i[pos];
        
        if (escape) {
          resultadoI += char;
          escape = false;
          pos++;
          continue;
        }

        if (char === '\\') {
          resultadoI += char;
          escape = true;
          pos++;
          continue;
        }

        if (char === '"') {
          // Verificar si estamos cerrando un string o abriendo uno
          // Si el siguiente carácter no es : o , o } o ] o espacio, podría ser una comilla dentro de un string
          const siguiente = pos + 1 < i.length ? i[pos + 1] : '';
          if (dentroString && siguiente !== '"' && siguiente !== ',' && siguiente !== '}' && siguiente !== ']' && siguiente !== ':' && siguiente !== ' ' && siguiente !== '\n' && siguiente !== '\r' && siguiente !== '\t') {
            // Probablemente es una comilla dentro de un string sin escapar
            resultadoI += '\\"';
          } else {
            resultadoI += char;
            dentroString = !dentroString;
          }
          pos++;
          continue;
        }

        if (dentroString) {
          // Escapar caracteres problemáticos dentro de strings
          if (char === '\n') {
            resultadoI += '\\n';
          } else if (char === '\r') {
            resultadoI += '\\r';
          } else if (char === '\t') {
            resultadoI += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            resultadoI += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            resultadoI += char;
          }
        } else {
          resultadoI += char;
        }
        pos++;
      }

      // Cerrar string si quedó abierto
      if (dentroString) {
        resultadoI += '"';
      }

      resultadoI = quitarComasColgantes(sanearBasico(resultadoI));
      resultadoI = autoBalance(resultadoI);
      return validarEstructuraAnalisis(JSON.parse(resultadoI));
    } catch (e9) { logFail(e9, `${intento}-I`, s); }

    try {
      // Intento J: Extraer y reparar usando regex más agresivo para strings
      let j = extraerJsonCrudo(s);
      // Reemplazar comillas problemáticas dentro de strings JSON
      // Patrón: buscar "key": "value" donde value puede tener comillas sin escapar
      j = j.replace(/("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*?)"/g, (match, key, value) => {
        // Escapar comillas y caracteres especiales en el valor
        const valueEscaped = value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `${key}: "${valueEscaped}"`;
      });
      
      j = quitarComasColgantes(sanearBasico(j));
      j = autoBalance(j);
      return validarEstructuraAnalisis(JSON.parse(j));
    } catch (e10) { logFail(e10, `${intento}-J`, s); }

    try {
      // Intento K: Reparación robusta de comillas sin escapar en strings largos
      // Esta estrategia recorre el JSON carácter por carácter y repara comillas problemáticas
      let k = extraerJsonCrudo(s);
      let resultadoK = '';
      let dentroString = false;
      let escape = false;
      let pos = 0;
      let ultimaComilla = -1;
      let depth = 0; // Profundidad de objetos/arrays
      let dentroObjeto = false;
      let dentroArray = false;

      while (pos < k.length) {
        const char = k[pos];
        const siguiente = pos + 1 < k.length ? k[pos + 1] : null;
        const anterior = pos > 0 ? k[pos - 1] : null;

        // Manejar escape
        if (escape) {
          resultadoK += char;
          escape = false;
          pos++;
          continue;
        }

        if (char === '\\') {
          resultadoK += char;
          escape = true;
          pos++;
          continue;
        }

        // Si estamos dentro de un string
        if (dentroString) {
          // Si encontramos una comilla, verificar si es el cierre del string o una comilla dentro del string
          if (char === '"') {
            // Verificar si el siguiente carácter es válido para cerrar un string JSON
            const esCierreValido = siguiente === null || 
                                   siguiente === ',' || 
                                   siguiente === '}' || 
                                   siguiente === ']' || 
                                   siguiente === ':' ||
                                   siguiente === ' ' ||
                                   siguiente === '\n' ||
                                   siguiente === '\r' ||
                                   siguiente === '\t';
            
            // Si no es un cierre válido, probablemente es una comilla dentro del string sin escapar
            if (!esCierreValido && siguiente !== '"' && siguiente !== '\\') {
              // Escapar esta comilla
              resultadoK += '\\"';
              pos++;
              continue;
            } else {
              // Es un cierre válido
              resultadoK += char;
              dentroString = false;
              ultimaComilla = -1;
              pos++;
              continue;
            }
          }

          // Escapar caracteres problemáticos dentro de strings
          if (char === '\n') {
            resultadoK += '\\n';
          } else if (char === '\r') {
            resultadoK += '\\r';
          } else if (char === '\t') {
            resultadoK += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            resultadoK += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            resultadoK += char;
          }
          pos++;
          continue;
        }

        // Fuera de strings: manejar estructura JSON
        if (char === '"') {
          resultadoK += char;
          dentroString = true;
          ultimaComilla = resultadoK.length - 1;
          pos++;
          continue;
        }

        if (char === '{') {
          depth++;
          dentroObjeto = true;
          resultadoK += char;
          pos++;
          continue;
        }

        if (char === '}') {
          depth--;
          if (depth === 0) dentroObjeto = false;
          resultadoK += char;
          pos++;
          continue;
        }

        if (char === '[') {
          depth++;
          dentroArray = true;
          resultadoK += char;
          pos++;
          continue;
        }

        if (char === ']') {
          depth--;
          if (depth === 0) dentroArray = false;
          resultadoK += char;
          pos++;
          continue;
        }

        resultadoK += char;
        pos++;
      }

      // Si quedó un string abierto, cerrarlo
      if (dentroString) {
        resultadoK += '"';
      }

      resultadoK = quitarComasColgantes(sanearBasico(resultadoK));
      resultadoK = autoBalance(resultadoK);
      return validarEstructuraAnalisis(JSON.parse(resultadoK));
    } catch (e11) { logFail(e11, `${intento}-K`, s); }

    try {
      // Intento L: Reparación ultra-agresiva usando regex para encontrar y reparar comillas problemáticas
      let l = extraerJsonCrudo(s);
      
      // Estrategia: encontrar todos los strings JSON y reparar comillas sin escapar dentro de ellos
      // Patrón: "key": "value" donde value puede extenderse hasta encontrar una comilla seguida de : o , o } o ]
      let resultadoL = '';
      let i = 0;
      let dentroString = false;
      let escape = false;
      let inicioString = -1;
      
      while (i < l.length) {
        const char = l[i];
        const siguiente = i + 1 < l.length ? l[i + 1] : null;
        const siguiente2 = i + 2 < l.length ? l[i + 2] : null;
        
        if (escape) {
          resultadoL += char;
          escape = false;
          i++;
          continue;
        }
        
        if (char === '\\') {
          resultadoL += char;
          escape = true;
          i++;
          continue;
        }
        
        if (char === '"') {
          if (!dentroString) {
            // Inicio de string
            dentroString = true;
            inicioString = resultadoL.length;
            resultadoL += char;
            i++;
            continue;
          } else {
            // Posible cierre de string - verificar contexto
            // Buscar hacia adelante para ver si es un cierre válido
            let esCierreValido = false;
            let j = i + 1;
            while (j < l.length && (l[j] === ' ' || l[j] === '\n' || l[j] === '\r' || l[j] === '\t')) {
              j++;
            }
            if (j < l.length) {
              const siguienteNoEspacio = l[j];
              esCierreValido = siguienteNoEspacio === ',' || 
                              siguienteNoEspacio === '}' || 
                              siguienteNoEspacio === ']' || 
                              siguienteNoEspacio === ':';
            } else {
              esCierreValido = true; // Fin del texto
            }
            
            if (esCierreValido) {
              // Es un cierre válido
              resultadoL += char;
              dentroString = false;
              inicioString = -1;
              i++;
              continue;
            } else {
              // Es una comilla dentro del string sin escapar - escapar
              resultadoL += '\\"';
              i++;
              continue;
            }
          }
        }
        
        if (dentroString) {
          // Escapar caracteres problemáticos
          if (char === '\n') {
            resultadoL += '\\n';
          } else if (char === '\r') {
            resultadoL += '\\r';
          } else if (char === '\t') {
            resultadoL += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            resultadoL += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            resultadoL += char;
          }
        } else {
          resultadoL += char;
        }
        
        i++;
      }
      
      // Cerrar string si quedó abierto
      if (dentroString) {
        resultadoL += '"';
      }
      
      resultadoL = quitarComasColgantes(sanearBasico(resultadoL));
      resultadoL = autoBalance(resultadoL);
      return validarEstructuraAnalisis(JSON.parse(resultadoL));
    } catch (e12) { logFail(e12, `${intento}-L`, s); }

    try {
      // Intento M: Reparación ultra-agresiva - reemplazar todas las comillas problemáticas dentro de strings
      // Estrategia: identificar strings JSON y escapar TODAS las comillas dentro de ellos
      let m = extraerJsonCrudo(s);
      
      // Primero, identificar todos los strings JSON usando un parser más inteligente
      let resultadoM = '';
      let dentroString = false;
      let escape = false;
      let i = 0;
      let stack = []; // Para rastrear la estructura
      
      while (i < m.length) {
        const char = m[i];
        const siguiente = i + 1 < m.length ? m[i + 1] : null;
        const siguiente2 = i + 2 < m.length ? m[i + 2] : null;
        const anterior = i > 0 ? m[i - 1] : null;
        
        // Manejar escape
        if (escape) {
          resultadoM += char;
          escape = false;
          i++;
          continue;
        }
        
        if (char === '\\') {
          resultadoM += char;
          escape = true;
          i++;
          continue;
        }
        
        // Si estamos dentro de un string
        if (dentroString) {
          // Si encontramos una comilla
          if (char === '"') {
            // Verificar si es realmente el cierre del string
            // Buscar el siguiente carácter no-espacio después de esta comilla
            let j = i + 1;
            while (j < m.length && (m[j] === ' ' || m[j] === '\n' || m[j] === '\r' || m[j] === '\t')) {
              j++;
            }
            
            if (j >= m.length) {
              // Fin del texto - es cierre válido
              resultadoM += char;
              dentroString = false;
              i++;
              continue;
            }
            
            const siguienteNoEspacio = m[j];
            
            // Verificar si hay un patrón de clave JSON después (ej: "key":)
            const patronClave = m.slice(j, Math.min(j + 20, m.length)).match(/^\s*"[^"]*"\s*:/);
            
            // Verificar si el siguiente carácter no-espacio es un delimitador válido
            const esDelimitadorValido = siguienteNoEspacio === ',' || 
                                      siguienteNoEspacio === '}' || 
                                      siguienteNoEspacio === ']';
            
            // Verificar si hay un patrón "key": después (indica nueva propiedad)
            const esNuevaPropiedad = patronClave !== null;
            
            // Si es delimitador válido o nueva propiedad, es cierre válido
            if (esDelimitadorValido || esNuevaPropiedad) {
              // Es un cierre válido
              resultadoM += char;
              dentroString = false;
              i++;
              continue;
            } else {
              // Si el siguiente carácter es ':', podría ser parte de un string o un cierre
              // Verificar el contexto: si hay un patrón como ": "value"" entonces es cierre
              if (siguienteNoEspacio === ':') {
                // Verificar si después de : hay espacios y luego una comilla (nuevo string)
                let k = j + 1;
                while (k < m.length && (m[k] === ' ' || m[k] === '\n' || m[k] === '\r' || m[k] === '\t')) {
                  k++;
                }
                if (k < m.length && m[k] === '"') {
                  // Es un cierre válido (patrón: "value": "next")
                  resultadoM += char;
                  dentroString = false;
                  i++;
                  continue;
                }
              }
              
              // En cualquier otro caso, es una comilla dentro del string sin escapar - ESCAPARLA
              resultadoM += '\\"';
              i++;
              continue;
            }
          }
          
          // Escapar caracteres problemáticos dentro de strings
          if (char === '\n') {
            resultadoM += '\\n';
          } else if (char === '\r') {
            resultadoM += '\\r';
          } else if (char === '\t') {
            resultadoM += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            resultadoM += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            resultadoM += char;
          }
          i++;
          continue;
        }
        
        // Fuera de strings
        if (char === '"') {
          resultadoM += char;
          dentroString = true;
          i++;
          continue;
        }
        
        // Manejar estructura JSON
        if (char === '{') {
          stack.push('{');
          resultadoM += char;
          i++;
          continue;
        }
        
        if (char === '}') {
          if (stack.length > 0 && stack[stack.length - 1] === '{') {
            stack.pop();
          }
          resultadoM += char;
          i++;
          continue;
        }
        
        if (char === '[') {
          stack.push('[');
          resultadoM += char;
          i++;
          continue;
        }
        
        if (char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === '[') {
            stack.pop();
          }
          resultadoM += char;
          i++;
          continue;
        }
        
        resultadoM += char;
        i++;
      }
      
      // Cerrar string si quedó abierto
      if (dentroString) {
        resultadoM += '"';
      }
      
      // Balancear estructura
      while (stack.length > 0) {
        const top = stack.pop();
        if (top === '{') resultadoM += '}';
        if (top === '[') resultadoM += ']';
      }
      
      resultadoM = quitarComasColgantes(sanearBasico(resultadoM));
      resultadoM = autoBalance(resultadoM);
      return validarEstructuraAnalisis(JSON.parse(resultadoM));
    } catch (e13) { logFail(e13, `${intento}-M`, s); }
  }

  // Intento final: Extraer solo campos esenciales usando regex y construir objeto manualmente
  try {
    console.warn('⚠️ Intentando extracción manual de campos esenciales del JSON');
    const texto = original.toLowerCase();
    const extraerCampo = (campo) => {
      const regex = new RegExp(`"${campo}"\\s*:\\s*"([^"]*)"`, 'i');
      const match = original.match(regex);
      return match ? match[1] : null;
    };

    const resumen = extraerCampo('resumen') || extraerCampo('analisisGeneral')?.match(/"resumen"\s*:\s*"([^"]*)"/i)?.[1] || 'Análisis generado';
    const diagnostico = extraerCampo('diagnosticoPrincipal') || extraerCampo('diagnostico') || '';
    
    // Extraer recomendaciones
    const recomendacionesMatch = original.match(/"recomendacionesPersonalizadas"\s*:\s*\[(.*?)\]/is);
    const recomendaciones = [];
    if (recomendacionesMatch) {
      const recs = recomendacionesMatch[1].match(/"([^"]*)"/g) || [];
      recomendaciones.push(...recs.map(r => r.slice(1, -1)));
    }

    // Construir objeto mínimo válido
    const analisisMinimo = {
      analisisGeneral: {
        resumen: resumen,
        diagnosticoPrincipal: diagnostico
      },
      recomendacionesPersonalizadas: recomendaciones.slice(0, 5),
      intervencionAsesor: {
        queEnsenar: extraerCampo('queEnsenar') || '',
        comoEnsenarlo: extraerCampo('comoEnsenarlo') || ''
      },
      esFallback: true,
      nota: 'Análisis extraído manualmente debido a errores de formato JSON'
    };

    return validarEstructuraAnalisis(analisisMinimo);
  } catch (eFinal) {
    console.error('❌ Fallo total en procesamiento JSON:', eFinal);
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
 * Crear prompt específico para análisis de fallos repetidos
 * @param {Object} datos - Datos del análisis de fallos repetidos
 * @returns {string} - Prompt específico para Gemini
 */
const crearPromptFallosRepetidos = (datos) => {
  const preguntasProblematicas = datos?.preguntasProblematicas || [];
  const estadisticas = datos?.estadisticas || {};
  const intentos = datos?.intentos || [];

  return `
Eres un ASESOR PEDAGÓGICO EXPERTO que analiza el rendimiento de estudiantes para ayudar a otros asesores a intervenir efectivamente. Tu análisis debe ser ESPECÍFICO, ACCIONABLE y ORIENTADO A LA INTERVENCIÓN DEL ASESOR.

CONTEXTO DEL ESTUDIANTE:
═══════════════════════════════════════
Tipo de evaluación: ${datos?.tipoEvaluacion || 'Simulación de examen'}
Nivel educativo: ${datos?.nivelEducativo || 'Preparatoria/Universidad'}
Total de intentos analizados: ${estadisticas.totalIntentosAnalizados || 0}
Total de preguntas problemáticas: ${estadisticas.preguntasConProblemas || 0}
Preguntas que SIEMPRE falló: ${estadisticas.preguntasSiempreFalladas || 0}
Porcentaje de problemas: ${estadisticas.porcentajeProblemas || 0}%

EVOLUCIÓN DE INTENTOS (ANÁLISIS DE TENDENCIA):
═══════════════════════════════════════
${intentos.length > 0 ? intentos.map((int, idx) => `
Intento ${int.numero || idx + 1}:
- Puntaje: ${int.puntaje?.toFixed(1) || 0}%
- Correctas: ${int.correctas || 0} / ${int.totalPreguntas || 0}
- Incorrectas: ${int.incorrectas || 0}
${idx > 0 ? `- Comparación con intento anterior: ${(int.puntaje - (intentos[idx-1]?.puntaje || 0)).toFixed(1)}% ${int.puntaje > (intentos[idx-1]?.puntaje || 0) ? '↑ Mejoró' : int.puntaje < (intentos[idx-1]?.puntaje || 0) ? '↓ Empeoró' : '→ Sin cambio'}` : ''}
`).join('') : 'No hay datos de intentos disponibles'}

PREGUNTAS PROBLEMÁTICAS DETALLADAS:
═══════════════════════════════════════
${preguntasProblematicas.map((p, idx) => `
${idx + 1}. PREGUNTA ${p.orden || 'N/A'} (${p.tipo || 'N/A'}):
   📝 Enunciado completo: "${p.enunciado || 'N/A'}"
   ❌ Fallos: ${p.fallos || 0} de ${p.totalIntentos || 0} intentos (${p.porcentajeFallo || 0}%)
   ${p.siempreFallo ? '🔴 SIEMPRE FALLÓ - URGENTE' : '🟡 Falla frecuentemente'}
   ${p.tipo ? `📋 Tipo: ${p.tipo}` : ''}
`).join('')}

INSTRUCCIONES CRÍTICAS PARA EL ASESOR:
═══════════════════════════════════════

1. **DIAGNÓSTICO PROFUNDO**: Para cada pregunta problemática, identifica EXACTAMENTE:
   - ¿Qué concepto específico no domina? (ej: "No comprende la fórmula de molaridad M=n/V, específicamente cómo despejar 'n'")
   - ¿Qué error específico comete? (ej: "Confunde multiplicación con división al calcular moles")
   - ¿Por qué comete ese error? (ej: "No memorizó la fórmula o no practicó ejercicios de despeje")
   - ¿Qué confusión conceptual tiene? (ej: "Confunde masa molar con masa molecular")

2. **PATRONES IDENTIFICADOS**: Analiza si hay patrones entre las preguntas:
   - ¿Todas son del mismo tema? (ej: "Todas son de química - cálculo de moles")
   - ¿Todas requieren el mismo tipo de razonamiento? (ej: "Todas requieren despeje de fórmulas")
   - ¿Hay un tema base que no domina? (ej: "No domina álgebra básica, por eso falla en despejes")

3. **INTERVENCIÓN ESPECÍFICA PARA EL ASESOR**: Proporciona:
   - QUÉ enseñar específicamente (ej: "Enseñar paso a paso cómo despejar 'n' de M=n/V")
   - CÓMO enseñarlo (ej: "Usar ejemplos concretos: Si tengo 0.5M en 250mL, ¿cuántos moles? Mostrar: n = M × V = 0.5 × 0.25 = 0.125 moles")
   - QUÉ ejercicios específicos dar (ej: "5 ejercicios de despeje de fórmulas químicas, empezando con los más simples")
   - QUÉ verificar que aprendió (ej: "Que pueda resolver 3 ejercicios similares sin ayuda")

4. **ESTRATEGIAS DE INTERVENCIÓN**: Para el asesor:
   - Si es error conceptual: "Explicar el concepto desde cero con analogías simples"
   - Si es error procedimental: "Modelar el procedimiento paso a paso, luego hacerlo juntos, luego que lo haga solo"
   - Si es error de comprensión: "Enseñar a leer preguntas: subrayar datos, identificar qué piden, identificar la fórmula"

5. **PRIORIZACIÓN**: Indica qué es más urgente:
   - ¿Qué pregunta/tema debe abordarse PRIMERO?
   - ¿Por qué es prioritario?
   - ¿Cuánto tiempo estimado necesita el estudiante para dominarlo?

FORMATO DE RESPUESTA (JSON ESTRICTO):
═══════════════════════════════════════
{
  "analisisGeneral": {
    "resumen": "Análisis conciso (3-4 frases) para el ASESOR: qué problema específico tiene el estudiante, por qué lo tiene, y qué debe hacer el asesor. Ejemplo: 'El estudiante falla consistentemente en preguntas de química que requieren despeje de fórmulas. Específicamente, no domina cómo despejar variables en M=n/V. El asesor debe enseñar álgebra básica aplicada a fórmulas químicas antes de continuar con problemas más complejos.'",
    "diagnosticoPrincipal": "Diagnóstico técnico específico: qué concepto/tema/habilidad específica no domina y por qué",
    "nivelUrgencia": "Alta/Media/Baja",
    "razonUrgencia": "Por qué es urgente o no (basado en porcentaje de fallos y si siempre falla)"
  },
  "patronesErrores": {
    "temaComun": "Tema/concepto común identificado en TODAS las preguntas problemáticas (ej: 'Despeje de fórmulas químicas')",
    "tipoErrorDominante": "Conceptual/Procedimental/Comprensión",
    "causaRaiz": "La causa raíz del problema (ej: 'No domina álgebra básica, específicamente despeje de variables')",
    "patronDetectado": "Descripción detallada del patrón: qué tienen en común las preguntas que falla"
  },
  "intervencionAsesor": {
    "queEnsenar": "QUÉ debe enseñar el asesor específicamente (concepto/tema/habilidad exacta)",
    "comoEnsenarlo": "CÓMO debe enseñarlo (método, pasos, ejemplos específicos)",
    "ejerciciosEspecificos": ["Ejercicio 1 específico que debe dar", "Ejercicio 2 específico", "Ejercicio 3 específico"],
    "verificacionAprendizaje": "CÓMO verificar que el estudiante aprendió (qué debe poder hacer)",
    "tiempoEstimado": "Tiempo estimado para que el estudiante domine esto (ej: '2-3 sesiones de 45 min')"
  },
  "preguntasProblematicas": [
    {
      "idPregunta": "${preguntasProblematicas[0]?.id || 'N/A'}",
      "orden": ${preguntasProblematicas[0]?.orden || 'N/A'},
      "enunciado": "${preguntasProblematicas[0]?.enunciado || 'N/A'}",
      "conceptoNoDomina": "Concepto específico que no domina (ej: 'Despeje de la variable n en la fórmula M=n/V')",
      "errorEspecifico": "Error específico que comete (ej: 'Multiplica en lugar de dividir al calcular moles')",
      "porQueFalla": "Por qué comete ese error (ej: 'No memorizó la fórmula o confunde el orden de operaciones')",
      "queEnsenar": "QUÉ debe enseñar el asesor para esta pregunta específica",
      "comoEnsenar": "CÓMO debe enseñarlo (pasos específicos, ejemplos)",
      "ejercicioPractica": "Ejercicio específico de práctica para esta pregunta"
    }
  ],
  "recomendacionesPersonalizadas": [
    "Recomendación 1 ESPECÍFICA para el asesor sobre QUÉ hacer (ej: 'Enseñar álgebra básica: cómo despejar variables en fórmulas. Empezar con ejemplos simples como despejar x en 2x=10')",
    "Recomendación 2 ESPECÍFICA sobre CÓMO intervenir (ej: 'Usar el método de modelado: primero el asesor resuelve un ejercicio completo explicando cada paso, luego resuelven uno juntos, luego el estudiante resuelve uno solo')",
    "Recomendación 3 ESPECÍFICA sobre QUÉ verificar (ej: 'Verificar que el estudiante puede despejar correctamente en 3 ejercicios similares sin ayuda antes de avanzar')"
  ],
  "planIntervencion": {
    "sesion1": {
      "objetivo": "Objetivo específico de la primera sesión",
      "actividades": ["Actividad 1 específica", "Actividad 2 específica"],
      "duracion": "Duración estimada",
      "materiales": ["Material 1 necesario", "Material 2 necesario"]
    },
    "sesion2": {
      "objetivo": "Objetivo específico de la segunda sesión",
      "actividades": ["Actividad 1 específica", "Actividad 2 específica"],
      "duracion": "Duración estimada"
    }
  },
  "estrategiasEstudio": [
    {
      "materia": "Tema específico identificado",
      "enfoque": "Enfoque específico de estudio (ej: 'Practicar despeje de fórmulas químicas')",
      "tiempo": "Tiempo diario recomendado (ej: '30 min diarios')",
      "actividadEspecifica": "Actividad específica que debe hacer (ej: 'Resolver 5 ejercicios de despeje de fórmulas, empezando con las más simples')"
    }
  ]
}

REGLAS CRÍTICAS:
═══════════════════════════════════════
1. PROHIBIDO usar frases genéricas como "necesita estudiar más" o "debe practicar". Sé ESPECÍFICO.
2. OBLIGATORIO mencionar conceptos/temas EXACTOS extraídos de los enunciados de las preguntas.
3. OBLIGATORIO proporcionar ejemplos CONCRETOS de qué enseñar y cómo.
4. OBLIGATORIO incluir ejercicios ESPECÍFICOS, no solo "dar ejercicios".
5. El análisis debe ser ÚTIL para el ASESOR, no solo para el estudiante.
6. Analiza el CONTENIDO de cada enunciado para identificar temas/conceptos específicos.
7. Si una pregunta menciona una fórmula (ej: "M=n/V"), identifica si el problema es que no conoce la fórmula, no sabe despejar, o no sabe aplicar.

REGLAS CRÍTICAS PARA JSON VÁLIDO:
═══════════════════════════════════════
⚠️ IMPORTANTE: El JSON DEBE ser válido o el análisis fallará.

1. ESCAPA TODAS las comillas dobles dentro de strings con \\" (ej: "texto con \\"comillas\\" dentro")
   - Si un campo contiene comillas (como en enunciados), DEBES escapar cada una: \\"
   - Ejemplo CORRECTO: "enunciado": "El estudiante debe calcular \\"x\\" en la fórmula"
   - Ejemplo INCORRECTO: "enunciado": "El estudiante debe calcular "x" en la fórmula"
2. ESCAPA todos los saltos de línea con \\n (ej: "línea 1\\nlínea 2")
3. ESCAPA todos los caracteres especiales: \\n para saltos de línea, \\t para tabs, \\r para retornos
4. NO uses comillas dobles dentro de strings sin escaparlas - ESTO CAUSARÁ ERRORES DE PARSEO
5. Si un campo contiene texto con comillas, REEMPLAZA las comillas por comillas simples o escápalas: \\"
6. MANTÉN los strings relativamente cortos (máximo 500 caracteres por campo)
7. Si un texto es muy largo, divídelo en múltiples recomendaciones en lugar de un string gigante
8. VERIFICA que todas las llaves { } y corchetes [ ] estén balanceados
9. VERIFICA que todas las comillas de strings estén cerradas
10. ANTES de enviar el JSON, REVISA mentalmente: ¿hay alguna comilla doble dentro de un string que no esté escapada?

EJEMPLO DE FORMATO CORRECTO (NOTA: todas las comillas dentro de strings están escapadas):
{
  "analisisGeneral": {
    "resumen": "El estudiante falla en despeje de formulas. No domina algebra basica para despejar variables.",
    "diagnosticoPrincipal": "No sabe despejar la variable n en la formula M=n/V"
  },
  "intervencionAsesor": {
    "queEnsenar": "Ensenar despeje de variables paso a paso",
    "comoEnsenarlo": "Mostrar: Si M=0.5 y V=0.25, entonces n = M x V = 0.125 moles"
  },
  "preguntasProblematicas": [
    {
      "idPregunta": "123",
      "enunciado": "Calcula el valor de \\"x\\" en la ecuacion 2x + 5 = 15",
      "conceptoNoDomina": "Despeje de ecuaciones lineales",
      "errorEspecifico": "No sabe aislar la variable x"
    }
  ],
  "recomendacionesPersonalizadas": [
    "Ensenar algebra basica: como despejar variables",
    "Practicar con 5 ejercicios de despeje de formulas quimicas",
    "Verificar que puede resolver 3 ejercicios similares sin ayuda"
  ]
}

IMPORTANTE: En el ejemplo anterior, nota que en el campo "enunciado" las comillas alrededor de "x" están escapadas como \\"x\\". 
SIEMPRE haz esto cuando haya comillas dentro de un string JSON.

Responde SOLO con el JSON válido, sin texto adicional antes o después. 

⚠️ VALIDACIÓN FINAL OBLIGATORIA ANTES DE ENVIAR:
1. Busca TODAS las comillas dobles (") dentro de los valores de strings
2. Si encuentras una comilla doble dentro de un string, REEMPLÁZALA por \\"
3. Verifica que NO haya comillas sin escapar dentro de ningún string
4. Verifica que todas las llaves { } estén balanceadas
5. Verifica que todos los corchetes [ ] estén balanceados
6. Si el JSON no es válido, CORRÍGELO antes de enviarlo

EJEMPLO DE CORRECCIÓN:
❌ INCORRECTO: "enunciado": "Calcula el valor de "x" en la ecuación"
✅ CORRECTO: "enunciado": "Calcula el valor de \\"x\\" en la ecuación"

VALIDA que el JSON sea correcto antes de enviarlo. Si tienes dudas, ESCAPA todas las comillas dentro de strings.
`;
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