import fetch from 'node-fetch';

// ==========================================
// CONFIGURACIÓN Y HELPERS
// ==========================================

/**
 * Mapeo de modelos Groq actualizados (Enero 2026)
 * Priorizamos las versiones "versatile" (70B) e "instant" (8B).
 */
const GROQ_MODELS = {
 
  'llama-3.3-70b': 'llama-3.3-70b-versatile', 
  'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
  
  // El modelo "Rápido" - Para fallbacks o tareas simples
  'llama-3.1-8b': 'llama-3.1-8b-instant',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  
  // Modelos Legacy/Otros
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'gemma2-9b-it': 'gemma2-9b-it',
  
  // Alias genéricos
  'premium': 'llama-3.3-70b-versatile',
  'fast': 'llama-3.1-8b-instant'
};

/**
 * Obtiene la configuración de la API según el modelo
 */
const getApiConfig = (model) => {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    // Por defecto usamos el 3.3 70B ya que estás en el plan gratuito y conviene aprovechar la potencia
    model: model || 'llama-3.3-70b-versatile' 
  };
};

/**
 * Normaliza el nombre del modelo usando el mapa
 */
const normalizeModel = (model) => {
  if (!model) return 'llama-3.3-70b-versatile'; // Default potente
  const modelLower = model.toLowerCase();
  // Buscar coincidencia exacta o parcial
  for (const [key, value] of Object.entries(GROQ_MODELS)) {
    if (modelLower === key || modelLower === value) return value;
  }
  return GROQ_MODELS['premium']; // Fallback seguro
};

/**
 * Convierte el formato de Gemini a formato Groq (OpenAI compatible)
 */
const convertToGroqFormat = (geminiContents, systemInstruction) => {
  const messages = [];

  // 1. System Prompt (Instrucciones de rol)
  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: typeof systemInstruction === 'string' 
        ? systemInstruction 
        : (systemInstruction.parts?.[0]?.text || systemInstruction.text || '')
    });
  }

  // 2. Historial de conversación
  if (Array.isArray(geminiContents)) {
    for (const content of geminiContents) {
      if (content.parts && Array.isArray(content.parts)) {
        // Concatenar partes de texto en un solo mensaje si es necesario
        const textParts = content.parts.map(p => p.text).filter(Boolean).join('\n');
        if (textParts) {
           const role = content.role === 'model' ? 'assistant' : 'user';
           messages.push({ role, content: textParts });
        }
      } else if (typeof content === 'string') {
        messages.push({ role: 'user', content: content });
      }
    }
  }

  // Fallback si no hay mensajes
  if (messages.length === 0) {
    messages.push({ role: 'user', content: 'Hola' });
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
        parts: [{ text: content }],
        role: 'model'
      },
      finishReason: choice?.finish_reason === 'stop' ? 'STOP' : 'OTHER',
      index: 0
    }],
    // Mapeo de uso de tokens para tus métricas
    usageMetadata: groqResponse.usage ? {
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
  const purposeUpper = (purpose || '').toUpperCase();
  // Soporte para múltiples keys (Rotación manual si configuras _1, _2)
  const specificKey = process.env[`GROQ_API_KEY_${purposeUpper}`] || 
                      process.env[`GROQ_API_KEY_${purposeUpper}_1`];

  if (specificKey && specificKey.trim().length > 0) return specificKey.trim();

  // Key general
  const generalKey = process.env.GROQ_API_KEY;
  if (generalKey && generalKey.trim().length > 0) return generalKey.trim();

  return null;
};

// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

export const groqGenerate = async (req, res) => {
  try {
    const { purpose, proveedor } = req.body || {};
    
    // Validación de seguridad básica
    if (proveedor && proveedor.toLowerCase() !== 'groq') {
      return res.status(400).json({
        error: 'Endpoint incorrecto. Use el controlador de Gemini.',
        code: 'INVALID_PROVIDER'
      });
    }

    const apiKey = getGroqApiKey(purpose);
    if (!apiKey) {
      console.error('[Groq] ❌ Falta API Key');
      return res.status(500).json({
        error: 'Configuración de servidor incompleta (Groq Key missing).',
        code: 'API_KEY_MISSING'
      });
    }

    let {
      contents,
      systemInstruction,
      generationConfig = {},
      model // Puede venir 'gemini-1.5-flash' si viene del fallback, lo ignoramos
    } = req.body || {};

    if (!contents || (Array.isArray(contents) && contents.length === 0)) {
      return res.status(400).json({ error: 'Validation Error: contents required.' });
    }

    // ESTRATEGIA FREE TIER:
    // Intentamos usar el modelo especificado o el Llama 3.3 70B por defecto.
    // Si falla por Rate Limit, bajamos al 8B.
    let targetModel = normalizeModel(model); 
    // Si viene un modelo de Gemini por error del fallback, forzamos el Premium de Groq
    if (targetModel.includes('gemini')) targetModel = GROQ_MODELS['premium'];

    const { url } = getApiConfig(targetModel);
    const messages = convertToGroqFormat(contents, systemInstruction);

    // Configuración Groq
    const groqConfig = {
      model: targetModel,
      messages: messages,
      temperature: generationConfig.temperature ?? 0.7,
      max_tokens: generationConfig.maxOutputTokens ?? 4096, // Groq soporta contextos grandes
      top_p: generationConfig.topP ?? 0.95,
      stream: false
    };

    let attempt = 0;
    const maxRetries = 3; // Intentos totales
    let lastError = null;
    let lastStatus = 500;

    while (attempt <= maxRetries) {
      try {
        const currentModel = groqConfig.model;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Groq] Intento ${attempt + 1}: ${currentModel} (Purpose: ${purpose || 'general'})`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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

        // --- ÉXITO ---
        if (response.ok) {
          const formattedResponse = convertFromGroqFormat(data);
          const responseText = formattedResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          console.log(`[Groq] ✅ Éxito con ${currentModel} (${responseText.length} chars)`);

          // Inyectar info de cuota simulada (Free Tier no devuelve headers de cuota estándar siempre)
          if (req.aiQuota) {
            formattedResponse.aiQuota = { ...req.aiQuota, provider: 'groq-free' };
          }

          return res.json(formattedResponse);
        }

        // --- MANEJO DE ERRORES ---
        lastError = data;
        const errMsg = data?.error?.message || response.statusText;

        // RATE LIMIT (429) - Muy común en Free Tier
        if (response.status === 429) {
          console.warn(`[Groq] ⚠️ Rate Limit (429) en ${currentModel}`);
          
          // ESTRATEGIA DE DOWNGRADE:
          // Si falló el modelo grande (70B), cambiamos al pequeño (8B) inmediatamente
          // para el siguiente intento, ya que suele tener límites diferentes.
          if (currentModel.includes('70b') && attempt < maxRetries) {
            console.log(`[Groq] 📉 Bajando a modelo 8B para evitar bloqueo...`);
            groqConfig.model = GROQ_MODELS['fast']; // Switch a 8B
            attempt++;
            // Espera breve (1s) antes de reintentar con el modelo pequeño
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }

          // Si ya estábamos en el pequeño o falló el downgrade, backoff exponencial
          if (attempt < maxRetries) {
            const wait = 2000 * Math.pow(2, attempt);
            console.log(`[Groq] Esperando ${wait}ms...`);
            await new Promise(r => setTimeout(r, wait));
            attempt++;
            continue;
          }
        }

        // OTROS ERRORES (400, 500, 503)
        if (response.status >= 500 || response.status === 400) {
           console.warn(`[Groq] Error ${response.status}: ${errMsg}`);
           if (attempt < maxRetries) {
             attempt++;
             continue;
           }
        }

        break; // Error fatal no recuperable (401, etc)

      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('[Groq] ⏱️ Timeout (60s)');
          lastStatus = 408;
          lastError = { error: { message: 'Groq Request Timeout' } };
        } else {
          console.error(`[Groq] Error de red: ${err.message}`);
          lastError = { error: { message: err.message } };
        }
        
        if (attempt < maxRetries) {
          attempt++;
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }

    // Si llegamos aquí, fallaron todos los intentos
    console.error(`[Groq] ❌ Falló definitivamente tras ${attempt} intentos.`);
    return res.status(lastStatus).json({
      error: lastError?.error?.message || 'Groq API Error',
      status: lastStatus,
      provider: 'groq'
    });

  } catch (e) {
    console.error('[Groq Controller] Exception:', e);
    res.status(500).json({ error: 'Internal Server Error (Groq Controller)' });
  }
};

/**
 * Lista modelos disponibles (Simulado para frontend)
 */
export const groqListModels = async (_req, res) => {
  const models = [
    {
      id: GROQ_MODELS['premium'],
      name: 'Llama 3.3 70B (Versatile)',
      description: 'Alta inteligencia, ideal para análisis complejos.'
    },
    {
      id: GROQ_MODELS['fast'],
      name: 'Llama 3.1 8B (Instant)',
      description: 'Máxima velocidad, ideal para chats rápidos.'
    }
  ];
  res.json({ models });
};