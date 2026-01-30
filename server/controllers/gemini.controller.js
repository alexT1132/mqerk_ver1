import fetch from 'node-fetch';
import {
  normalizeText,
  extractKeywords,
  calculateKeywordMatch,
  compareExact,
  calculateSimilarity
} from '../utils/textComparison.js';

// ==========================================
// 1. CONFIGURACIÓN Y HELPERS
// ==========================================

const getApiConfig = (model) => {
  // Siempre v1beta. Es la única que soporta modelos experimentales y estables a la vez.
  return {
    version: 'v1beta',
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  };
};

const sanitizeConfig = (config) => {
  if (!config) return {};
  return Object.fromEntries(
    Object.entries(config).filter(([_, v]) => v !== undefined && v !== null)
  );
};

/**
 * ESTRATEGIA DE FALLBACK "SEGURA"
 * Si fallan las versiones experimentales o nuevas,
 * recurrimos a versiones estables que están disponibles en la API.
 */
const getFallbackModel = (currentModel) => {
  // 1. Si falla experimental o 2.0, bajar a 2.5-flash (estable y rápido)
  if (currentModel.includes('exp') || currentModel.includes('2.0')) {
    return 'gemini-2.5-flash';
  }

  // 2. Si falla 2.5-flash, intentar 2.5-pro (más potente)
  if (currentModel === 'gemini-2.5-flash') {
    return 'gemini-2.5-pro';
  }

  // 3. Si falla 2.5-pro, intentar 1.5-flash (versión anterior estable)
  if (currentModel === 'gemini-2.5-pro') {
    return 'gemini-1.5-flash';
  }

  // 4. Último intento: gemini-pro (alias genérico)
  if (currentModel === 'gemini-1.5-flash') {
    return 'gemini-pro-latest';
  }

  return null; // Fin del camino
};

/**
 * Función de Diagnóstico: Se ejecuta solo si hay error 404.
 * Imprime en la consola qué modelos TIENES REALMENTE disponibles.
 */
const debugAvailableModels = async (apiKey) => {
  try {
    console.log('\n[Gemini DIAGNÓSTICO] 🔍 Consultando modelos permitidos para tu API Key...');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      const names = data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      console.log('[Gemini DIAGNÓSTICO] ✅ TUS MODELOS DISPONIBLES SON:', names.join(', '));
      console.log('[Gemini DIAGNÓSTICO] 💡 El sistema usará uno de estos en el siguiente intento.\n');
    } else {
      console.error('[Gemini DIAGNÓSTICO] ❌ No se pudo obtener la lista. Error:', JSON.stringify(data));
    }
  } catch (e) {
    console.error('[Gemini DIAGNÓSTICO] Error de red al consultar modelos.');
  }
};

// ==========================================
// 2. CONTROLADOR PRINCIPAL
// ==========================================

/**
 * GESTOR DE ROTACIÓN DE API KEYS
 * Permite usar hasta 3 API keys por propósito para distribuir la carga
 * y evitar límites de rate limit (429).
 */
class GeminiKeyRotator {
  constructor(purpose) {
    this.purpose = purpose;
    this.keys = this.loadKeys(purpose);
    this.currentIndex = 0;
    this.cooldowns = new Map(); // key -> timestamp cuando expira el cooldown
    console.log(`[GeminiKeyRotator] Inicializado para "${purpose}" con ${this.keys.length} key(s)`);
  }

  loadKeys(purpose) {
    const keys = [];
    const purposeUpper = purpose.toUpperCase();

    // Intentar cargar hasta 3 keys: GEMINI_API_KEY_QUIZZES_1, _2, _3
    for (let i = 1; i <= 3; i++) {
      const envVar = `GEMINI_API_KEY_${purposeUpper}_${i}`;
      const key = process.env[envVar];

      if (key && key.trim().length > 0) {
        keys.push({
          key: key.trim(),
          index: i,
          envVar
        });
        if (process.env.NODE_ENV !== 'production') {
          const preview = key.length > 10
            ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
            : '***';
          console.log(`[GeminiKeyRotator] ✅ Cargada ${envVar} (${preview})`);
        }
      }
    }

    // Fallback: Si no hay keys numeradas, intentar la key sin número
    if (keys.length === 0) {
      const fallbackVar = `GEMINI_API_KEY_${purposeUpper}`;
      const fallbackKey = process.env[fallbackVar];

      if (fallbackKey && fallbackKey.trim().length > 0) {
        keys.push({
          key: fallbackKey.trim(),
          index: 0,
          envVar: fallbackVar
        });
        console.log(`[GeminiKeyRotator] ⚠️ Usando fallback ${fallbackVar} (sin rotación)`);
      }
    }

    return keys;
  }

  getNextKey() {
    if (this.keys.length === 0) {
      console.error(`[GeminiKeyRotator] ❌ No hay keys configuradas para "${this.purpose}"`);
      return null;
    }

    const now = Date.now();

    // Buscar la primera key que no esté en cooldown
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const keyObj = this.keys[idx];
      const cooldownUntil = this.cooldowns.get(keyObj.key) || 0;

      if (now >= cooldownUntil) {
        // Key disponible
        this.currentIndex = (idx + 1) % this.keys.length;

        if (this.keys.length > 1) {
          console.log(`[GeminiKeyRotator] 🔑 Usando ${keyObj.envVar} para "${this.purpose}"`);
        }

        return keyObj.key;
      } else {
        const remainingSecs = Math.ceil((cooldownUntil - now) / 1000);
        console.log(`[GeminiKeyRotator] ⏳ ${keyObj.envVar} en cooldown (${remainingSecs}s restantes)`);
      }
    }

    // Si todas están en cooldown, usar la que tenga menos tiempo restante
    let minCooldown = Infinity;
    let bestKeyObj = this.keys[0];

    for (const keyObj of this.keys) {
      const cooldown = this.cooldowns.get(keyObj.key) || 0;
      if (cooldown < minCooldown) {
        minCooldown = cooldown;
        bestKeyObj = keyObj;
      }
    }

    const remainingSecs = Math.ceil((minCooldown - now) / 1000);
    console.warn(`[GeminiKeyRotator] ⚠️ Todas las keys en cooldown. Usando ${bestKeyObj.envVar} (espera ${remainingSecs}s)`);

    return bestKeyObj.key;
  }

  markAs429(key) {
    // Cooldown de 10 minutos (600,000 ms)
    const cooldownMs = 600000;
    const cooldownUntil = Date.now() + cooldownMs;
    this.cooldowns.set(key, cooldownUntil);

    const keyObj = this.keys.find(k => k.key === key);
    const keyName = keyObj ? keyObj.envVar : 'unknown';

    console.warn(`[GeminiKeyRotator] 🚫 429 detectado en ${keyName}. Cooldown de 10 minutos activado.`);

    // Si hay más keys disponibles, informar
    const now = Date.now();
    const availableKeys = this.keys.filter(k => {
      const cooldown = this.cooldowns.get(k.key) || 0;
      return now >= cooldown;
    });

    if (availableKeys.length > 0) {
      console.log(`[GeminiKeyRotator] ✅ ${availableKeys.length} key(s) disponible(s) para rotación`);
    } else {
      console.warn(`[GeminiKeyRotator] ⚠️ Todas las keys agotadas. Considera agregar más keys o esperar.`);
    }
  }

  resetCooldown(key) {
    this.cooldowns.delete(key);
    const keyObj = this.keys.find(k => k.key === key);
    const keyName = keyObj ? keyObj.envVar : 'unknown';
    console.log(`[GeminiKeyRotator] ✅ Cooldown reseteado para ${keyName}`);
  }
}

// Instancias globales de rotadores (una por propósito)
const rotators = {
  simuladores: new GeminiKeyRotator('simuladores'),
  quizzes: new GeminiKeyRotator('quizzes'),
  analisis: new GeminiKeyRotator('analisis'),
  formulas: new GeminiKeyRotator('formulas'),
  calificacion: new GeminiKeyRotator('calificacion')
};

/**
 * Selecciona la API key según el propósito de la petición usando rotación.
 * Esto distribuye la carga entre múltiples API keys para evitar límites de cuota.
 * 
 * Propósitos soportados:
 * - 'simuladores' → GEMINI_API_KEY_SIMULADORES_1, _2, _3
 * - 'quizzes'     → GEMINI_API_KEY_QUIZZES_1, _2, _3
 * - 'analisis'    → GEMINI_API_KEY_ANALISIS_1, _2, _3
 * - default       → GEMINI_API_KEY (fallback general)
 */
const getApiKeyByPurpose = (purpose) => {
  const purposeLower = purpose?.toLowerCase();

  // Intentar usar rotador específico
  if (purposeLower && rotators[purposeLower]) {
    const key = rotators[purposeLower].getNextKey();
    if (key) {
      return key;
    }
    console.warn(`[Gemini] ⚠️ Rotador de "${purpose}" no devolvió key, usando fallback general`);
  }

  // Fallback a la key general
  const generalKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (purpose) {
    console.log(`[Gemini] ⚠️ No hay rotador para "${purpose}", usando key general`);
  }

  // Validar que la key general no esté vacía
  if (!generalKey || generalKey.trim().length === 0) {
    console.error(`[Gemini] ❌ No hay API key configurada. Verifica GEMINI_API_KEY en tu archivo .env`);
    return null;
  }

  const trimmedGeneralKey = generalKey.trim();

  // Log diagnóstico (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    const keyPreview = trimmedGeneralKey.length > 10
      ? `${trimmedGeneralKey.substring(0, 4)}...${trimmedGeneralKey.substring(trimmedGeneralKey.length - 4)}`
      : '***';
    console.log(`[Gemini] 🔑 Usando API key general (${keyPreview})`);
  } else {
    console.log(`[Gemini] 🔑 Usando API key general`);
  }

  return trimmedGeneralKey;
};


import { checkQuota, logAIUsage } from '../models/ai_quota.model.js';

export const geminiGenerate = async (req, res) => {
  try {
    // 0. VERIFICACIÓN DE CUOTA DE IA (Strict Backend Enforcement)
    // Extraer usuario desde el middleware authREquired (req.user debe existir)
    const userId = req.user?.id;
    const userRole = req.user?.role || req.user?.rol;

    // Solo verificar cuota si hay un usuario autenticado
    if (userId) {
      const quotaCheck = await checkQuota(userId, userRole);

      if (!quotaCheck.allowed) {
        console.warn(`[AI Quota] 🚫 Usuario ${userId} bloqueado por límite: ${quotaCheck.reason}`);
        return res.status(403).json({
          error: 'Límite de uso de IA alcanzado. Por favor espera al reinicio de tu cuota.',
          code: 'QUOTA_EXCEEDED',
          reason: quotaCheck.reason,
          quota: quotaCheck.quota
        });
      }

      // Adjuntar info de cuota al request para usarlo en la respuesta
      const dailyStats = quotaCheck.quota?.daily;
      const monthlyStats = quotaCheck.quota?.monthly;
      req.aiQuota = {
        restanteHoy: dailyStats ? dailyStats.remaining : 0,
        restanteMes: monthlyStats ? monthlyStats.remaining : 0,
        porcentajeHoy: dailyStats ? Math.round((dailyStats.used / dailyStats.limit) * 100) : 0,
        porcentajeMes: monthlyStats ? Math.round((monthlyStats.used / monthlyStats.limit) * 100) : 0,
        limiteDiario: dailyStats ? dailyStats.limit : 0,
        limiteMensual: monthlyStats ? monthlyStats.limit : 0
      };
    } else {
      console.warn('[Gemini] ⚠️ Petición sin usuario autenticado. La cuota no se descontará.');
    }

    // Extraer el propósito de la petición para seleccionar la API key correcta
    const { purpose, proveedor } = req.body || {};

    // Si el proveedor no es 'gemini' o está vacío, permitir (compatibilidad)
    // pero registrar como 'gemini' para este endpoint
    const finalProveedor = (proveedor && proveedor.toLowerCase() === 'groq') ? 'groq' : 'gemini';

    const apiKey = getApiKeyByPurpose(purpose);

    if (!apiKey) {
      // ⚠️ SEGURIDAD: No exponer nombres de variables de entorno en respuestas al cliente
      return res.status(500).json({
        error: `Error de configuración del servidor. Contacta al administrador.`,
        code: 'API_KEY_MISSING'
        // No incluir keyName ni detalles de configuración en la respuesta
      });
    }

    let {
      contents,
      systemInstruction,
      generationConfig = {},
      safetySettings,
      model = 'gemini-2.5-flash'
    } = req.body || {};

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'Validation Error: contents required.' });
    }

    // Sanitizar config pero preservar response_schema si existe (Structured Outputs)
    const baseConfig = { temperature: 0.7, maxOutputTokens: 2000, ...generationConfig };
    const finalGenConfig = sanitizeConfig(baseConfig);
    // Asegurar que response_schema se preserve si viene en generationConfig
    if (generationConfig?.response_schema) {
      finalGenConfig.response_schema = generationConfig.response_schema;
    }

    // Variables de control
    let currentModel = model;
    let attempt = 0;
    const maxRetries = 3;
    let lastErrorData = null;
    let lastStatus = 500;
    let diagnosisRun = false; // Para no ejecutar el diagnóstico múltiples veces

    // --- BUCLE DE REINTENTOS ---
    while (attempt <= maxRetries) {
      const { url } = getApiConfig(currentModel);

      const ac = new AbortController();
      const timeoutId = setTimeout(() => ac.abort(), 60000);

      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Gemini] Intento ${attempt + 1}: ${currentModel}`);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents,
            generationConfig: finalGenConfig,
            safetySettings,
            systemInstruction
          }),
          signal: ac.signal,
        });

        clearTimeout(timeoutId);
        lastStatus = response.status;
        const textData = await response.text();
        const data = textData ? JSON.parse(textData) : {};

        // --- ÉXITO ---
        if (response.ok) {
          // DEBUG: Log de la respuesta de Gemini
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log(`[Gemini] ✅ Respuesta exitosa (${responseText.length} chars)`);
          if (responseText.length < 100) {
            console.log('[Gemini] ⚠️ Respuesta muy corta:', responseText);
          }
          // Verificar si la respuesta fue truncada
          const finishReason = data?.candidates?.[0]?.finishReason;
          if (finishReason && finishReason !== 'STOP') {
            console.warn(`[Gemini] ⚠️ finishReason: ${finishReason} (posible truncamiento)`);
          }

          // REGISTRAR USO EXITOSO EN DB
          if (userId) {
            try {
              // Estimar tokens (muy aproximado: 1 palabra ~ 1.3 tokens)
              const inputTokensEstimate = JSON.stringify(contents).length / 4;
              const outputTokensEstimate = responseText.length / 4;
              const totalTokens = Math.ceil(inputTokensEstimate + outputTokensEstimate);

              await logAIUsage({
                id_usuario: userId,
                tipo_operacion: purpose || 'generacion_texto',
                modelo_usado: currentModel,
                tokens_estimados: totalTokens,
                exito: true,
                proveedor: finalProveedor,
                // Si tienes forma de medir duración real, úsala. Aquí es aproximado.
                duracion_ms: 0
              });
              console.log(`[AI Quota] ✅ Uso registrado para usuario ${userId}`);
            } catch (logErr) {
              console.error('[AI Quota] Error registrando uso (no crítico):', logErr);
            }
          }

          // Agregar información de cuota si está disponible
          const responseData = { ...data };
          if (req.aiQuota) {
            responseData.aiQuota = {
              restanteHoy: req.aiQuota.restanteHoy,
              restanteMes: req.aiQuota.restanteMes,
              porcentajeHoy: req.aiQuota.porcentajeHoy,
              porcentajeMes: req.aiQuota.porcentajeMes,
              limiteDiario: req.aiQuota.limiteDiario,
              limiteMensual: req.aiQuota.limiteMensual
            };
          }
          return res.json(responseData);
        }

        // --- ERROR ---
        lastErrorData = data;
        const errorMessage = data?.error?.message || response.statusText || '';
        const is404 = response.status === 404 || (response.status === 400 && errorMessage.includes('not found'));
        const isInvalidKey = response.status === 400 && (errorMessage.toLowerCase().includes('api key not valid') || errorMessage.toLowerCase().includes('invalid api key') || errorMessage.toLowerCase().includes('api_key_invalid'));

        // 1. API Key Inválida o Faltante
        if (isInvalidKey) {
          console.error(`[Gemini] ❌ API Key inválida o no configurada para propósito: ${purpose || 'general'}`);
          console.error(`[Gemini] 📋 Detalles del error de Google:`, JSON.stringify(data?.error || {}, null, 2));
          const keyName = purpose ? `GEMINI_API_KEY_${purpose.toUpperCase()}` : 'GEMINI_API_KEY';
          // Solo mostrar preview en desarrollo, nunca en producción
          if (process.env.NODE_ENV !== 'production') {
            const keyPreview = apiKey && apiKey.length > 10
              ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
              : '***';
            console.error(`[Gemini] 🔍 API Key usada (preview): ${keyPreview}, longitud: ${apiKey?.length || 0}`);
          } else {
            console.error(`[Gemini] 🔍 API Key inválida (longitud: ${apiKey?.length || 0})`);
          }
          console.error(`[Gemini] 💡 Verifica que:`);
          console.error(`[Gemini]    1. La variable ${keyName} esté en el archivo .env del SERVIDOR (carpeta server/)`);
          console.error(`[Gemini]    2. La API key sea válida y no haya expirado`);
          console.error(`[Gemini]    3. La API key tenga permisos para usar Gemini API`);
          console.error(`[Gemini]    4. No haya espacios extra al inicio o final de la key`);
          console.error(`[Gemini]    5. El servidor se haya reiniciado después de agregar la key`);
          // ⚠️ SEGURIDAD: No exponer información sobre la API key en la respuesta HTTP
          return res.status(400).json({
            error: `Error de configuración del servidor. Contacta al administrador.`,
            code: 'API_KEY_INVALID'
            // No incluir keyName, detalles de la API key, ni información de configuración en la respuesta al cliente
          });
        }

        // 2. Key Bloqueada
        if (response.status === 403 || errorMessage.toLowerCase().includes('leaked')) {
          return res.status(403).json({ error: 'API Key Blocked', code: 'API_KEY_LEAKED' });
        }

        // 3. Rate Limit (429) -> Marcar key en cooldown y rotar
        if (response.status === 429 || response.status === 503) {
          console.warn(`[Gemini] Rate Limit (${response.status}) en ${currentModel}`);

          // Marcar la key actual en cooldown
          const purposeLower = purpose?.toLowerCase();
          if (purposeLower && rotators[purposeLower]) {
            rotators[purposeLower].markAs429(apiKey);

            // Si hay más intentos y más keys disponibles, reintentar con otra key
            if (attempt < maxRetries) {
              const nextKey = rotators[purposeLower].getNextKey();

              // Si obtuvimos una key diferente, reintentar inmediatamente
              if (nextKey && nextKey !== apiKey) {
                console.log(`[Gemini] 🔄 Rotando a otra API key automáticamente`);
                apiKey = nextKey; // Actualizar la key para el siguiente intento
                attempt++;
                continue;
              }
            }
          }

          // Si no hay rotación disponible o es experimental, aplicar lógica original
          if (attempt < maxRetries) {
            // Si es experimental, bajamos a estable inmediatamente
            if (currentModel.includes('2.0') || currentModel.includes('exp')) {
              const next = getFallbackModel(currentModel);
              if (next) {
                console.log(`[Gemini] ⚠️ Saturado. Cambiando a estable: ${next}`);
                currentModel = next;
                attempt++;
                continue;
              }
            }
            // Si es estable, esperar
            const wait = 2000 * Math.pow(2, attempt + 1);
            await new Promise(r => setTimeout(r, wait));
            attempt++;
            continue;
          }
        }

        // 4. Error 404/400 (Modelo no encontrado) -> Fallback y Diagnóstico
        if (is404 && attempt < maxRetries) {
          console.warn(`[Gemini] Error: Modelo ${currentModel} no encontrado.`);

          // ¡DIAGNÓSTICO AUTOMÁTICO!
          // Si falla, consultamos qué modelos TIENE realmente la cuenta para mostrarlos en consola
          if (!diagnosisRun) {
            await debugAvailableModels(apiKey);
            diagnosisRun = true;
          }

          const nextModel = getFallbackModel(currentModel);
          if (nextModel && nextModel !== currentModel) {
            console.log(`[Gemini] Probando fallback seguro: ${nextModel}`);
            currentModel = nextModel;
            attempt++;
            continue;
          }
        }

        break; // Error fatal

      } catch (err) {
        clearTimeout(timeoutId);
        if (attempt < maxRetries) { attempt++; continue; }
        throw err;
      }
    }

    // --- FALLBACK A GROQ CUANDO GEMINI FALLA ---
    console.error(`[Gemini] Falló tras ${attempt} intentos. Intentando fallback a Groq...`);

    try {
      // Importar dinámicamente para evitar dependencia circular
      const { groqGenerate } = await import('./groq.controller.js');

      // Crear un mock request/response para reutilizar la lógica de Groq
      const mockReq = {
        ...req,
        body: {
          ...req.body,
          proveedor: 'groq', // Forzar uso de Groq
          purpose: purpose || 'general' // Usar el mismo propósito
        }
      };

      // Llamar a groqGenerate directamente
      return groqGenerate(mockReq, res);

    } catch (groqError) {
      console.error('[Gemini->Groq] Fallback también falló:', groqError.message);
      return res.status(lastStatus).json({
        error: 'Todos los proveedores de IA no disponibles. Intente más tarde.',
        status: lastStatus,
        finalModel: currentModel,
        fallbackError: groqError.message
      });
    }

  } catch (e) {
    console.error('[Gemini] Internal Server Error:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==========================================
// 3. CONTROLADOR: LISTAR MODELOS
// ==========================================

export const geminiListModels = async (_req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch models');

    const models = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => ({
        id: m.name.replace('models/', ''),
        name: m.displayName,
        version: m.version
      }));

    res.json({ models });
  } catch (e) {
    res.status(500).json({ error: 'List Models Error' });
  }
};

// ==========================================
// 4. CONTROLADOR: CALIFICAR RESPUESTA CORTA
// ==========================================



/**
 * Califica una respuesta corta usando un sistema híbrido de 3 niveles:
 * 1. Comparación exacta (normalizada)
 * 2. Coincidencia de palabras clave
 * 3. IA (solo para casos dudosos)
 */
export const calificarRespuestaCorta = async (req, res) => {
  try {
    const { pregunta, respuestaEsperada, respuestaEstudiante } = req.body;

    // Validación
    if (!pregunta || !respuestaEsperada || !respuestaEstudiante) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: pregunta, respuestaEsperada, respuestaEstudiante'
      });
    }

    // NIVEL 1: Comparación exacta (normalizada)
    const exactMatch = compareExact(respuestaEsperada, respuestaEstudiante);
    if (exactMatch) {
      return res.json({
        correcta: true,
        confianza: 100,
        metodo: 'exacta',
        explicacion: 'Respuesta idéntica a la esperada'
      });
    }

    // NIVEL 2: Coincidencia de palabras clave
    const keywordMatch = calculateKeywordMatch(respuestaEsperada, respuestaEstudiante);

    // Si tiene 70%+ de palabras clave, considerarla correcta
    if (keywordMatch >= 0.7) {
      return res.json({
        correcta: true,
        confianza: Math.round(keywordMatch * 100),
        metodo: 'palabras_clave',
        explicacion: `Coincide ${Math.round(keywordMatch * 100)}% de palabras clave`
      });
    }

    // Si tiene menos de 30% de palabras clave, probablemente incorrecta
    if (keywordMatch < 0.3) {
      return res.json({
        correcta: false,
        confianza: Math.round((1 - keywordMatch) * 100),
        metodo: 'palabras_clave',
        explicacion: `Solo coincide ${Math.round(keywordMatch * 100)}% de palabras clave`
      });
    }

    // NIVEL 3: IA (solo para casos dudosos: 30-70% de palabras clave)
    try {
      const prompt = `Eres un profesor calificando una respuesta corta. Analiza si la respuesta del estudiante es correcta.

Pregunta: ${pregunta}
Respuesta esperada: ${respuestaEsperada}
Respuesta del estudiante: ${respuestaEstudiante}

Responde SOLO con una de estas opciones:
- CORRECTA: Si la respuesta es correcta o equivalente semánticamente
- PARCIAL: Si la respuesta está parcialmente correcta
- INCORRECTA: Si la respuesta es incorrecta

Responde solo con una palabra (CORRECTA, PARCIAL o INCORRECTA).`;

      const model = process.env.GEMINI_CALIFICACION_MODEL || 'gemini-2.0-flash-exp';
      const config = getApiConfig(model);

      const rotator = rotators.calificacion || rotators.analisis; // Usar rotador de calificación o análisis
      const apiKey = rotator ? rotator.getKey() : (process.env.GEMINI_API_KEY_CALIFICACION_1 || process.env.GEMINI_API_KEY);

      if (!apiKey) {
        throw new Error('No API key available for grading');
      }

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1, // Muy baja para respuestas consistentes
          maxOutputTokens: 10, // Solo necesitamos una palabra
          topP: 0.95
        }
      };

      const response = await fetch(`${config.url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Calificación IA] Error:', errorData);

        // Si falla la IA, marcar para revisión manual
        return res.json({
          correcta: false,
          confianza: 50,
          metodo: 'revisar',
          requiereRevision: true,
          explicacion: 'No se pudo calificar automáticamente. Requiere revisión manual.'
        });
      }

      const data = await response.json();
      const iaResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';

      let correcta = false;
      let confianza = 50;

      if (iaResponse.includes('CORRECTA')) {
        correcta = true;
        confianza = 90;
      } else if (iaResponse.includes('PARCIAL')) {
        correcta = true;
        confianza = 60;
      } else if (iaResponse.includes('INCORRECTA')) {
        correcta = false;
        confianza = 90;
      } else {
        // Respuesta inesperada de la IA
        return res.json({
          correcta: false,
          confianza: 50,
          metodo: 'revisar',
          requiereRevision: true,
          explicacion: 'Respuesta ambigua. Requiere revisión manual.'
        });
      }

      return res.json({
        correcta,
        confianza,
        metodo: 'ia',
        explicacion: `Calificado por IA: ${iaResponse}`,
        requiereRevision: confianza < 70
      });

    } catch (iaError) {
      console.error('[Calificación IA] Error:', iaError);

      // Si falla la IA, marcar para revisión manual
      return res.json({
        correcta: false,
        confianza: 50,
        metodo: 'revisar',
        requiereRevision: true,
        explicacion: 'Error al calificar con IA. Requiere revisión manual.'
      });
    }

  } catch (error) {
    console.error('[Calificación] Error general:', error);
    res.status(500).json({
      error: 'Error al calificar respuesta',
      message: error.message
    });
  }
};