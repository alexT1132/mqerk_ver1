import fetch from 'node-fetch';

// ==========================================
// CONFIGURACIÓN Y HELPERS
// ==========================================

/**
 * Obtiene la configuración de la API según el modelo
 */
const getApiConfig = (model) => {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: model || 'llama-3.1-70b-versatile'
  };
};

/**
 * Convierte el formato de Gemini a formato Groq
 */
const convertToGroqFormat = (geminiContents, systemInstruction) => {
  const messages = [];

  // Agregar system instruction si existe
  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: typeof systemInstruction === 'string' 
        ? systemInstruction 
        : systemInstruction.text || ''
    });
  }

  // Convertir contents de Gemini a messages de Groq
  if (Array.isArray(geminiContents)) {
    for (const content of geminiContents) {
      if (content.parts && Array.isArray(content.parts)) {
        for (const part of content.parts) {
          if (part.text) {
            // Determinar el rol (por defecto 'user', pero podría ser 'assistant' si hay metadata)
            const role = content.role || 'user';
            messages.push({
              role: role === 'model' ? 'assistant' : role,
              content: part.text
            });
          }
        }
      } else if (typeof content === 'string') {
        messages.push({
          role: 'user',
          content: content
        });
      }
    }
  }

  // Si no hay mensajes, crear uno por defecto
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: 'Hola'
    });
  }

  return messages;
};

/**
 * Convierte la respuesta de Groq al formato de Gemini
 */
const convertFromGroqFormat = (groqResponse) => {
  const choice = groqResponse.choices?.[0];
  const message = choice?.message;
  const content = message?.content || '';

  return {
    candidates: [{
      content: {
        parts: [{
          text: content
        }]
      },
      finishReason: choice?.finish_reason === 'stop' ? 'STOP' : 'OTHER',
      index: 0
    }],
    usage: groqResponse.usage ? {
      promptTokenCount: groqResponse.usage.prompt_tokens,
      candidatesTokenCount: groqResponse.usage.completion_tokens,
      totalTokenCount: groqResponse.usage.total_tokens
    } : undefined
  };
};

/**
 * Obtiene la API key de Groq según el propósito
 */
const getGroqApiKey = (purpose) => {
  // Intentar obtener key específica por propósito
  const purposeUpper = (purpose || '').toUpperCase();
  const specificKey = process.env[`GROQ_API_KEY_${purposeUpper}`] || 
                      process.env[`GROQ_API_KEY_${purposeUpper}_1`];

  if (specificKey && specificKey.trim().length > 0) {
    return specificKey.trim();
  }

  // Fallback a key general
  const generalKey = process.env.GROQ_API_KEY;
  if (generalKey && generalKey.trim().length > 0) {
    return generalKey.trim();
  }

  return null;
};

/**
 * Mapeo de modelos Groq disponibles
 */
const GROQ_MODELS = {
  'llama-3.1-70b-versatile': 'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'gemma-7b-it': 'gemma-7b-it',
  'llama-3.1-70b': 'llama-3.1-70b-versatile', // Alias
  'llama-3.1-8b': 'llama-3.1-8b-instant', // Alias
  'mixtral': 'mixtral-8x7b-32768' // Alias
};

/**
 * Normaliza el nombre del modelo
 */
const normalizeModel = (model) => {
  if (!model) return 'llama-3.1-70b-versatile';
  const modelLower = model.toLowerCase();
  return GROQ_MODELS[modelLower] || GROQ_MODELS[model] || model;
};

// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

/**
 * Genera contenido usando Groq API
 */
export const groqGenerate = async (req, res) => {
  try {
    // Extraer propósito y obtener API key
    const { purpose, proveedor } = req.body || {};
    
    // Si el proveedor no es 'groq', devolver error o redirigir
    if (proveedor && proveedor.toLowerCase() !== 'groq') {
      return res.status(400).json({
        error: 'Este endpoint es solo para Groq. Use /api/ai/gemini/generate para Gemini.',
        code: 'INVALID_PROVIDER'
      });
    }

    const apiKey = getGroqApiKey(purpose);

    if (!apiKey) {
      return res.status(500).json({
        error: 'Error de configuración del servidor. Contacta al administrador.',
        code: 'API_KEY_MISSING'
      });
    }

    let {
      contents,
      systemInstruction,
      generationConfig = {},
      model = 'llama-3.1-70b-versatile'
    } = req.body || {};

    if (!contents || (Array.isArray(contents) && contents.length === 0)) {
      return res.status(400).json({ 
        error: 'Validation Error: contents required.' 
      });
    }

    // Normalizar modelo
    const normalizedModel = normalizeModel(model);
    const { url } = getApiConfig(normalizedModel);

    // Convertir formato de Gemini a Groq
    const messages = convertToGroqFormat(contents, systemInstruction);

    // Configurar parámetros de generación
    const groqConfig = {
      model: normalizedModel,
      messages: messages,
      temperature: generationConfig.temperature ?? 0.7,
      max_tokens: generationConfig.maxOutputTokens ?? 2000,
      top_p: generationConfig.topP ?? 0.95,
      stream: false
    };

    // Variables de control
    let attempt = 0;
    const maxRetries = 3;
    let lastError = null;
    let lastStatus = 500;

    // Bucle de reintentos
    while (attempt <= maxRetries) {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Groq] Intento ${attempt + 1}: ${normalizedModel}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(groqConfig),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        lastStatus = response.status;
        const data = await response.json();

        // Éxito
        if (response.ok) {
          const groqResponse = convertFromGroqFormat(data);
          const responseText = groqResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          console.log(`[Groq] ✅ Respuesta exitosa (${responseText.length} chars)`);

          // Agregar información de cuota si está disponible
          const responseData = { ...groqResponse };
          if (req.aiQuota) {
            responseData.aiQuota = {
              restanteHoy: req.aiQuota.daily?.remaining || 0,
              restanteMes: req.aiQuota.monthly?.remaining || 0,
              porcentajeHoy: req.aiQuota.daily?.percentage || 0,
              porcentajeMes: req.aiQuota.monthly?.percentage || 0,
              limiteDiario: req.aiQuota.daily?.limit || 0,
              limiteMensual: req.aiQuota.monthly?.limit || 0
            };
          }

          return res.json(responseData);
        }

        // Manejo de errores
        lastError = data;
        const errorMessage = data?.error?.message || response.statusText || '';

        // Rate limit (429)
        if (response.status === 429) {
          console.warn(`[Groq] Rate Limit (429)`);
          if (attempt < maxRetries) {
            const wait = 2000 * Math.pow(2, attempt + 1);
            await new Promise(r => setTimeout(r, wait));
            attempt++;
            continue;
          }
        }

        // API Key inválida
        if (response.status === 401) {
          console.error(`[Groq] ❌ API Key inválida`);
          return res.status(401).json({
            error: 'Error de configuración del servidor. Contacta al administrador.',
            code: 'API_KEY_INVALID'
          });
        }

        // Error 400/404
        if (response.status === 400 || response.status === 404) {
          console.warn(`[Groq] Error ${response.status}: ${errorMessage}`);
          if (attempt < maxRetries && response.status === 400) {
            // Intentar con un modelo más simple
            if (normalizedModel.includes('70b')) {
              groqConfig.model = 'llama-3.1-8b-instant';
              attempt++;
              continue;
            }
          }
        }

        break; // Error fatal

      } catch (err) {
        if (typeof timeoutId !== 'undefined') {
          clearTimeout(timeoutId);
        }
        if (err.name === 'AbortError') {
          lastError = { error: { message: 'Request timeout' } };
          lastStatus = 408;
        } else {
          lastError = { error: { message: err.message } };
        }
        if (attempt < maxRetries) {
          attempt++;
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }

    // Respuesta final de error
    console.error(`[Groq] Falló tras ${attempt} intentos.`);
    return res.status(lastStatus).json({
      error: lastError?.error?.message || 'Error en Groq API',
      status: lastStatus,
      finalModel: normalizedModel
    });

  } catch (e) {
    console.error('[Groq] Internal Server Error:', e);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: e.message 
    });
  }
};

/**
 * Lista modelos disponibles de Groq
 */
export const groqListModels = async (_req, res) => {
  try {
    // Groq no tiene un endpoint público para listar modelos
    // Retornamos los modelos conocidos
    const models = [
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B Versatile',
        description: 'Modelo más potente, ideal para tareas complejas'
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        description: 'Modelo rápido y eficiente para respuestas rápidas'
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Modelo de alta calidad con contexto extendido'
      },
      {
        id: 'gemma-7b-it',
        name: 'Gemma 7B IT',
        description: 'Modelo optimizado para instrucciones'
      }
    ];

    res.json({ models });
  } catch (e) {
    res.status(500).json({ error: 'List Models Error' });
  }
};

