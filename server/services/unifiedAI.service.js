/**
 * Servicio unificado para manejar llamadas a diferentes proveedores de IA
 * Permite elegir entre Gemini y Groq de forma transparente
 */

/**
 * Genera contenido usando el proveedor especificado
 * @param {Object} options - Opciones de generación
 * @param {string} options.proveedor - 'gemini' o 'groq'
 * @param {Array} options.contents - Contenido a procesar
 * @param {string} options.systemInstruction - Instrucción del sistema
 * @param {Object} options.generationConfig - Configuración de generación
 * @param {string} options.model - Modelo a usar
 * @param {string} options.purpose - Propósito de la llamada
 * @returns {Promise<Object>} Respuesta del proveedor
 */
export const generateWithAI = async (options = {}) => {
  const {
    proveedor = 'gemini', // 'gemini' o 'groq'
    contents,
    systemInstruction,
    generationConfig = {},
    model,
    purpose
  } = options;

  const proveedorLower = (proveedor || 'gemini').toLowerCase();

  if (proveedorLower === 'groq') {
    return generateWithGroq({
      contents,
      systemInstruction,
      generationConfig,
      model,
      purpose
    });
  } else {
    return generateWithGemini({
      contents,
      systemInstruction,
      generationConfig,
      model,
      purpose
    });
  }
};

/**
 * Genera contenido usando Gemini
 */
const generateWithGemini = async (options) => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const endpoint = `${baseUrl}/api/ai/gemini/generate`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...options,
      proveedor: 'gemini'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Gemini API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Genera contenido usando Groq
 */
const generateWithGroq = async (options) => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const endpoint = `${baseUrl}/api/ai/groq/generate`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...options,
      proveedor: 'groq'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Groq API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Obtiene el proveedor recomendado según el propósito y disponibilidad
 * @param {string} purpose - Propósito de la llamada
 * @param {Object} preferences - Preferencias del usuario
 * @returns {string} 'gemini' o 'groq'
 */
export const getRecommendedProvider = (purpose, preferences = {}) => {
  // Si hay preferencia explícita, usarla
  if (preferences.proveedor) {
    return preferences.proveedor.toLowerCase();
  }

  // Verificar disponibilidad de API keys
  const hasGroq = !!(process.env.GROQ_API_KEY || process.env[`GROQ_API_KEY_${(purpose || '').toUpperCase()}`]);
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env[`GEMINI_API_KEY_${(purpose || '').toUpperCase()}_1`]);

  // Si solo uno está disponible, usarlo
  if (hasGroq && !hasGemini) return 'groq';
  if (hasGemini && !hasGroq) return 'gemini';

  // Estrategia por defecto: usar Groq para tareas rápidas, Gemini para tareas complejas
  const quickTasks = ['formula', 'calificacion'];
  const complexTasks = ['analisis', 'simulador'];

  if (quickTasks.includes(purpose?.toLowerCase())) {
    return hasGroq ? 'groq' : 'gemini';
  }

  if (complexTasks.includes(purpose?.toLowerCase())) {
    return hasGemini ? 'gemini' : 'groq';
  }

  // Por defecto, preferir Gemini si está disponible
  return hasGemini ? 'gemini' : 'groq';
};

/**
 * Intenta generar con un proveedor y hace fallback al otro si falla
 * @param {Object} options - Opciones de generación
 * @param {string} options.primaryProvider - Proveedor principal
 * @param {string} options.fallbackProvider - Proveedor de respaldo
 * @returns {Promise<Object>} Respuesta del proveedor
 */
export const generateWithFallback = async (options = {}) => {
  const {
    primaryProvider = 'gemini',
    fallbackProvider = 'groq',
    ...restOptions
  } = options;

  try {
    return await generateWithAI({
      ...restOptions,
      proveedor: primaryProvider
    });
  } catch (error) {
    console.warn(`[Unified AI] Error con ${primaryProvider}, intentando ${fallbackProvider}:`, error.message);
    
    try {
      return await generateWithAI({
        ...restOptions,
        proveedor: fallbackProvider
      });
    } catch (fallbackError) {
      throw new Error(`Ambos proveedores fallaron. ${primaryProvider}: ${error.message}, ${fallbackProvider}: ${fallbackError.message}`);
    }
  }
};

