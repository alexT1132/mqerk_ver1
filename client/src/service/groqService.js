// Configuración para integración con Groq API
// Este archivo contiene las funciones necesarias para conectar con la API de Groq

/**
 * Configuración de la API de Groq
 */
const GROQ_CONFIG = {
  proxyEndpoint: '/api/ai/groq/generate',
  model: (import.meta.env?.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile'),
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000
};

// ===================== utilidades internas =====================
const ESPERA = (ms) => new Promise(res => setTimeout(res, ms));

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas

// Rate limiter simple por ventana
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
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 && i < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, i) + Math.random() * 1000, maxDelay);
        await ESPERA(delay);
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (i < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
        await ESPERA(delay);
      }
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

// ===================== Caché =====================
const buildCacheKey = (datos) => {
  return `groq_${btoa(JSON.stringify(datos)).slice(0, 50)}`;
};

const leerCacheValido = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const guardarEnCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('No se pudo guardar en cache:', e);
  }
};

export const limpiarCacheGroq = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('groq_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Error limpiando cache:', e);
  }
};

// ===================== Funciones principales =====================

/**
 * Genera contenido usando Groq API
 * @param {Object} requestBody - Cuerpo de la petición
 * @returns {Promise<Object>} Respuesta de Groq
 */
export const generarConGroq = async (requestBody) => {
  try {
    console.log('🚀 Iniciando generación con Groq API');

    // Validar datos de entrada
    if (!requestBody || !requestBody.contents) {
      throw new Error('Datos de generación inválidos - falta contents');
    }

    // Validar que el proxy esté configurado
    if (!GROQ_CONFIG.proxyEndpoint) {
      throw new Error('Endpoint de proxy Groq no configurado');
    }

    // Intentar cache primero (si aplica)
    const cacheKey = buildCacheKey(requestBody);
    const cache = leerCacheValido(cacheKey);
    if (cache) {
      console.warn('📦 Usando respuesta desde cache');
      return { ...cache, desdeCache: true };
    }

    // Configurar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_CONFIG.timeout);

    const body = {
      ...requestBody,
      model: requestBody.model || GROQ_CONFIG.model,
      proveedor: 'groq',
      generationConfig: {
        temperature: GROQ_CONFIG.temperature,
        maxOutputTokens: GROQ_CONFIG.maxTokens,
        ...requestBody.generationConfig
      }
    };

    console.log('🌐 Realizando petición a Groq (proxy backend)...');

    // Respetar rate limit local antes de llamar
    await asegurarRateLimit();
    const response = await fetchConReintentos(
      GROQ_CONFIG.proxyEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
        signal: controller.signal
      },
      { maxRetries: 4, baseDelay: 1000, maxDelay: 12000 }
    );

    clearTimeout(timeoutId);

    console.log('📡 Respuesta recibida, status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Error ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Guardar en cache si la respuesta es válida
    if (data.candidates && data.candidates.length > 0) {
      guardarEnCache(cacheKey, data);
    }

    console.log('✅ Generación exitosa con Groq');
    return data;

  } catch (error) {
    console.error('❌ Error en generación con Groq:', error);
    throw error;
  }
};

/**
 * Genera análisis usando Groq (similar a generarAnalisisConGemini)
 * @param {Object} datosAnalisis - Datos del análisis
 * @returns {Promise<Object>} Análisis generado
 */
export const generarAnalisisConGroq = async (datosAnalisis) => {
  try {
    console.log('🚀 Iniciando análisis con Groq API');

    // Intentar cache primero
    const cacheKey = buildCacheKey(datosAnalisis || {});
    const cache = leerCacheValido(cacheKey);
    if (cache) {
      console.warn('📦 Usando análisis desde cache');
      return { ...cache, desdeCache: true };
    }

    // Validar datos
    if (!datosAnalisis || !datosAnalisis.simulacion) {
      throw new Error('Datos de análisis inválidos - falta simulación');
    }

    // Crear prompt estructurado
    const prompt = crearPromptAnalisis(datosAnalisis);
    console.log('📝 Prompt creado:', prompt.substring(0, 200) + '...');

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: GROQ_CONFIG.temperature,
        maxOutputTokens: GROQ_CONFIG.maxTokens,
        response_mime_type: 'application/json'
      },
      purpose: 'analisis'
    };

    const data = await generarConGroq(requestBody);

    // Parsear respuesta JSON si viene como texto
    let analisisData = data;
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      try {
        analisisData = JSON.parse(data.candidates[0].content.parts[0].text);
      } catch (e) {
        console.warn('⚠️ No se pudo parsear respuesta JSON, usando texto directo');
      }
    }

    console.log('✅ Análisis generado exitosamente');
    return analisisData;

  } catch (error) {
    console.error('❌ Error en análisis con Groq:', error);
    throw error;
  }
};

/**
 * Crea un prompt estructurado para análisis
 * (Función auxiliar, similar a la de geminiService)
 */
function crearPromptAnalisis(datosAnalisis) {
  const { simulacion, intentos = [] } = datosAnalisis;

  let prompt = `Eres un tutor experto analizando el rendimiento de un estudiante en simulaciones de examen.

Datos de la simulación:
- Materia: ${simulacion.materia || 'N/A'}
- Total de preguntas: ${simulacion.total_preguntas || 0}
- Intentos realizados: ${intentos.length}

`;

  if (intentos.length > 0) {
    prompt += `Análisis de intentos:\n`;
    intentos.forEach((intento, idx) => {
      prompt += `\nIntento ${idx + 1}:\n`;
      prompt += `- Calificación: ${intento.calificacion || 'N/A'}\n`;
      prompt += `- Preguntas correctas: ${intento.correctas || 0}\n`;
      prompt += `- Preguntas incorrectas: ${intento.incorrectas || 0}\n`;
    });
  }

  prompt += `\nProporciona un análisis detallado en formato JSON con:
- fortalezas: [array de fortalezas identificadas]
- debilidades: [array de áreas a mejorar]
- recomendaciones: [array de recomendaciones específicas]
- resumen: "resumen general del rendimiento"
- nivel_actual: "principiante" | "intermedio" | "avanzado"`;

  return prompt;
}

export const limpiarCacheAnalisisGroq = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('groq_analisis_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Error limpiando cache de análisis:', e);
  }
};

