/**
 * Utilidad para logging que guarda logs en el servidor (log_error.txt)
 * También mantiene console.log para desarrollo inmediato
 */

const LOG_ENABLED = true; // Cambiar a false para deshabilitar logging remoto
const LOG_ENDPOINT = '/api/logger/log';

/**
 * Envía un log al servidor para guardarlo en log_error.txt
 * @param {string} level - Nivel del log: 'info', 'warn', 'error', 'debug'
 * @param {string} component - Nombre del componente (ej: 'Quiz.jsx', 'QuiztBuilder')
 * @param {string} message - Mensaje del log
 * @param {any} data - Datos adicionales (objeto, array, etc.)
 */
export const logToFile = async (level, component, message, data = null) => {
  // Siempre loguear en consola para desarrollo inmediato
  const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  const prefix = `[${component}]`;
  
  if (data !== null && data !== undefined) {
    logMethod(prefix, message, data);
  } else {
    logMethod(prefix, message);
  }
  
  // Enviar al servidor si está habilitado
  if (LOG_ENABLED) {
    try {
      // Usar fetch sin await para no bloquear la ejecución
      fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          component,
          message,
          data: data !== null && data !== undefined ? data : null
        })
      }).catch(err => {
        // Silenciar errores de red para no interrumpir el flujo
        console.warn('[Logger] No se pudo enviar log al servidor:', err);
      });
    } catch (error) {
      // Silenciar errores para no interrumpir el flujo
    }
  }
};

/**
 * Helpers convenientes para diferentes niveles de log
 */
export const logInfo = (component, message, data = null) => {
  logToFile('info', component, message, data);
};

export const logWarn = (component, message, data = null) => {
  logToFile('warn', component, message, data);
};

export const logError = (component, message, data = null) => {
  logToFile('error', component, message, data);
};

export const logDebug = (component, message, data = null) => {
  logToFile('debug', component, message, data);
};

