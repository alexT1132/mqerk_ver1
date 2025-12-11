import fetch from 'node-fetch';

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

export const geminiGenerate = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Server Error: API Key missing.' });

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

    const finalGenConfig = sanitizeConfig({ temperature: 0.7, maxOutputTokens: 2000, ...generationConfig });

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
        const is404 = response.status === 404 || response.status === 400 || errorMessage.includes('not found');

        // 1. Key Bloqueada
        if (response.status === 403 || errorMessage.toLowerCase().includes('leaked')) {
          return res.status(403).json({ error: 'API Key Blocked', code: 'API_KEY_LEAKED' });
        }

        // 2. Rate Limit (429) -> Cambiar modelo si es experimental
        if (response.status === 429 || response.status === 503) {
          console.warn(`[Gemini] Rate Limit (${response.status}) en ${currentModel}`);
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

        // 3. Error 404/400 (Modelo no encontrado) -> Fallback y Diagnóstico
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

    // --- RESPUESTA FINAL ---
    console.error(`[Gemini] Falló tras ${attempt} intentos.`);
    return res.status(lastStatus).json({
      error: lastErrorData?.error?.message || 'Error en Gemini',
      status: lastStatus,
      finalModel: currentModel,
      availableModelsHint: 'Revisa la consola del servidor para ver los modelos disponibles.'
    });

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