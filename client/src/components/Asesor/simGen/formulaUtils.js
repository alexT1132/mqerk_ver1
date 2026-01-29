// Utilidades para manejo de fórmulas y cooldown

// Configuración de cooldown
const COOLDOWN_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_MS || 45000);
const COOLDOWN_503_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_503_MS || 120000);
const COOLDOWN_KEY = 'ia_formula_cooldown_until';

// Sistema de tracking de uso diario
const USAGE_KEY = 'ai_formulas_usage';
const DAILY_LIMIT_ASESOR = 20;

// Helpers para cooldown
export const getCooldownRemainingMs = () => {
  try {
    const v = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    const rem = v - Date.now();
    return rem > 0 ? rem : 0;
  } catch {
    return 0;
  }
};

export const startCooldown = (is503 = false) => {
  try {
    const cooldownTime = is503 ? COOLDOWN_503_MS : COOLDOWN_MS;
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + cooldownTime));
  } catch { }
};

export const getFormulaUsageToday = () => {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
    }
    return {
      count: data.count || 0,
      limit: DAILY_LIMIT_ASESOR,
      remaining: Math.max(0, DAILY_LIMIT_ASESOR - (data.count || 0))
    };
  } catch {
    return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
  }
};

export const incrementFormulaUsage = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    if (data.date !== today) {
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT_ASESOR }));
    } else {
      data.count = (data.count || 0) + 1;
      localStorage.setItem(USAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error incrementando uso de fórmulas IA:', e);
  }
};

// Limpieza de fórmulas LaTeX
export const cleanFormula = (formula) => {
  if (!formula || typeof formula !== 'string') return '';
  
  let cleaned = formula.trim();
  // Remover delimitadores $ si los hay
  cleaned = cleaned.replace(/^\$+|\$+$/g, '').trim();
  // Remover texto adicional común
  cleaned = cleaned.replace(/^La fórmula es[:]?\s*/i, '').trim();
  cleaned = cleaned.replace(/^Fórmula[:]?\s*/i, '').trim();
  cleaned = cleaned.replace(/\s*\.\s*$/, '').trim();
  
  return cleaned;
};

// Validación de entrada del usuario
export const validateQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'La consulta no puede estar vacía' };
  }
  
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Por favor, ingresa una descripción de la fórmula que necesitas' };
  }
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'La descripción es demasiado larga (máximo 500 caracteres)' };
  }
  
  return { valid: true, query: trimmed };
};

// Formateo de tiempo para mensajes de error
export const formatCooldownTime = (ms) => {
  const secs = Math.ceil(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  
  if (mins > 0) {
    return `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`;
  }
  return `${secs} segundo${secs > 1 ? 's' : ''}`;
};

// Clasificación de errores de API
export const classifyAPIError = (response, errorData) => {
  if (response.status === 429) {
    return {
      type: 'RATE_LIMIT',
      message: `Se alcanzó el límite de solicitudes a la API. Por favor, espera ${formatCooldownTime(COOLDOWN_MS)}.`,
      is503: false
    };
  }
  
  if (response.status === 503) {
    return {
      type: 'SERVICE_UNAVAILABLE',
      message: `El servicio de IA está temporalmente no disponible (saturado). Por favor, espera ${formatCooldownTime(COOLDOWN_503_MS)}.`,
      is503: true
    };
  }
  
  if (response.status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: errorData?.error || `Error del servidor (${response.status}). Por favor intenta de nuevo más tarde.`,
      is503: false
    };
  }
  
  if (response.status >= 400 && response.status < 500) {
    return {
      type: 'CLIENT_ERROR',
      message: errorData?.error || `Error en la solicitud (${response.status}). Verifica tu conexión e intenta de nuevo.`,
      is503: false
    };
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: errorData?.error || `Error ${response.status}: ${response.statusText}`,
    is503: false
  };
};