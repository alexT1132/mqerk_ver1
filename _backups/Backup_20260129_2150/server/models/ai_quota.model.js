import db from '../db.js';

/**
 * Obtiene la configuración de cuotas de IA
 * @returns {Promise<Object|null>} Configuración de cuotas
 */
export const getQuotaConfig = async () => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ai_quota_config WHERE activo = 1 ORDER BY id DESC LIMIT 1'
    );
    return rows[0] || null;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo configuración:', error);
    return null;
  }
};

/**
 * Obtiene los límites según el rol del usuario
 * @param {string} role - Rol del usuario (estudiante, asesor, admin)
 * @returns {Promise<Object>} Límites diarios y mensuales
 */
export const getLimitsByRole = async (role) => {
  const config = await getQuotaConfig();
  if (!config) {
    // Valores por defecto si no hay configuración
    const defaults = {
      estudiante: { diario: 30, mensual: 300 },
      asesor: { diario: 100, mensual: 1000 },
      admin: { diario: 500, mensual: 5000 }
    };
    return defaults[role?.toLowerCase()] || defaults.estudiante;
  }

  const roleLower = (role || '').toLowerCase();
  return {
    diario: roleLower === 'estudiante' ? config.limite_diario_estudiante :
            roleLower === 'asesor' ? config.limite_diario_asesor :
            roleLower === 'admin' ? config.limite_diario_admin : config.limite_diario_estudiante,
    mensual: roleLower === 'estudiante' ? config.limite_mensual_estudiante :
             roleLower === 'asesor' ? config.limite_mensual_asesor :
             roleLower === 'admin' ? config.limite_mensual_admin : config.limite_mensual_estudiante,
    global: {
      diario: config.limite_diario_global,
      mensual: config.limite_mensual_global
    },
    cooldown: config.cooldown_segundos || 45,
    cacheEnabled: config.cache_habilitado === 1,
    cacheTTL: config.cache_ttl_horas || 6
  };
};

/**
 * Registra un uso de IA en el log
 * @param {Object} usageData - Datos del uso
 * @returns {Promise<number>} ID del registro creado
 */
export const logAIUsage = async (usageData) => {
  try {
    const {
      id_usuario,
      tipo_operacion = 'general',
      modelo_usado = 'gemini-2.5-flash',
      tokens_estimados = 0,
      exito = true,
      error_mensaje = null,
      duracion_ms = null,
      proveedor = 'gemini' // 'gemini' o 'groq'
    } = usageData;

    // Verificar si la columna proveedor existe
    let columns = 'id_usuario, tipo_operacion, modelo_usado, tokens_estimados, exito, error_mensaje, duracion_ms';
    let values = [id_usuario, tipo_operacion, modelo_usado, tokens_estimados, exito ? 1 : 0, error_mensaje, duracion_ms];
    let placeholders = '?, ?, ?, ?, ?, ?, ?';

    // Intentar agregar proveedor si existe la columna
    try {
      const [columnCheck] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'ai_usage_log' 
         AND COLUMN_NAME = 'proveedor'`
      );
      
      if (columnCheck && columnCheck.length > 0) {
        columns += ', proveedor';
        values.push(proveedor || 'gemini');
        placeholders += ', ?';
      }
    } catch (err) {
      // Si falla la verificación, continuar sin el campo
      console.warn('[AI Quota] No se pudo verificar columna proveedor, usando valores por defecto');
    }

    const [result] = await db.query(
      `INSERT INTO ai_usage_log (${columns}) VALUES (${placeholders})`,
      values
    );

    return result.insertId;
  } catch (error) {
    console.error('[AI Quota] Error registrando uso:', error);
    return null;
  }
};

/**
 * Obtiene el conteo de usos diarios de un usuario
 * @param {number} userId - ID del usuario
 * @param {string} date - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
 * @returns {Promise<number>} Número de usos
 */
export const getDailyUsage = async (userId, date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM ai_usage_log 
       WHERE id_usuario = ? AND DATE(timestamp) = ? AND exito = 1`,
      [userId, targetDate]
    );
    return rows[0]?.count || 0;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo uso diario:', error);
    return 0;
  }
};

/**
 * Obtiene el conteo de usos mensuales de un usuario
 * @param {number} userId - ID del usuario
 * @param {string} month - Mes en formato YYYY-MM (opcional, por defecto mes actual)
 * @returns {Promise<number>} Número de usos
 */
export const getMonthlyUsage = async (userId, month = null) => {
  try {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM ai_usage_log 
       WHERE id_usuario = ? AND DATE_FORMAT(timestamp, '%Y-%m') = ? AND exito = 1`,
      [userId, targetMonth]
    );
    return rows[0]?.count || 0;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo uso mensual:', error);
    return 0;
  }
};

/**
 * Obtiene el conteo de usos globales diarios
 * @param {string} date - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
 * @returns {Promise<number>} Número de usos
 */
export const getGlobalDailyUsage = async (date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM ai_usage_log 
       WHERE DATE(timestamp) = ? AND exito = 1`,
      [targetDate]
    );
    return rows[0]?.count || 0;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo uso global diario:', error);
    return 0;
  }
};

/**
 * Obtiene el conteo de usos globales mensuales
 * @param {string} month - Mes en formato YYYY-MM (opcional, por defecto mes actual)
 * @returns {Promise<number>} Número de usos
 */
export const getGlobalMonthlyUsage = async (month = null) => {
  try {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM ai_usage_log 
       WHERE DATE_FORMAT(timestamp, '%Y-%m') = ? AND exito = 1`,
      [targetMonth]
    );
    return rows[0]?.count || 0;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo uso global mensual:', error);
    return 0;
  }
};

/**
 * Verifica si un usuario puede hacer una llamada a IA
 * @param {number} userId - ID del usuario
 * @param {string} role - Rol del usuario
 * @returns {Promise<Object>} { allowed: boolean, reason?: string, quota?: Object }
 */
export const checkQuota = async (userId, role) => {
  try {
    const limits = await getLimitsByRole(role);
    const dailyUsage = await getDailyUsage(userId);
    const monthlyUsage = await getMonthlyUsage(userId);
    const globalDaily = await getGlobalDailyUsage();
    const globalMonthly = await getGlobalMonthlyUsage();

    // Verificar límites del usuario
    if (dailyUsage >= limits.diario) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        quota: {
          daily: { used: dailyUsage, limit: limits.diario },
          monthly: { used: monthlyUsage, limit: limits.mensual }
        }
      };
    }

    if (monthlyUsage >= limits.mensual) {
      return {
        allowed: false,
        reason: 'monthly_limit_exceeded',
        quota: {
          daily: { used: dailyUsage, limit: limits.diario },
          monthly: { used: monthlyUsage, limit: limits.mensual }
        }
      };
    }

    // Verificar límites globales
    if (globalDaily >= limits.global.diario) {
      return {
        allowed: false,
        reason: 'global_daily_limit_exceeded',
        quota: {
          daily: { used: dailyUsage, limit: limits.diario },
          monthly: { used: monthlyUsage, limit: limits.mensual },
          global: {
            daily: { used: globalDaily, limit: limits.global.diario },
            monthly: { used: globalMonthly, limit: limits.global.mensual }
          }
        }
      };
    }

    if (globalMonthly >= limits.global.mensual) {
      return {
        allowed: false,
        reason: 'global_monthly_limit_exceeded',
        quota: {
          daily: { used: dailyUsage, limit: limits.diario },
          monthly: { used: monthlyUsage, limit: limits.mensual },
          global: {
            daily: { used: globalDaily, limit: limits.global.diario },
            monthly: { used: globalMonthly, limit: limits.global.mensual }
          }
        }
      };
    }

    return {
      allowed: true,
      quota: {
        daily: { used: dailyUsage, limit: limits.diario, remaining: limits.diario - dailyUsage },
        monthly: { used: monthlyUsage, limit: limits.mensual, remaining: limits.mensual - monthlyUsage },
        global: {
          daily: { used: globalDaily, limit: limits.global.diario, remaining: limits.global.diario - globalDaily },
          monthly: { used: globalMonthly, limit: limits.global.mensual, remaining: limits.global.mensual - globalMonthly }
        }
      }
    };
  } catch (error) {
    console.error('[AI Quota] Error verificando cuota:', error);
    // En caso de error, permitir el uso (fail-open)
    return { allowed: true, error: 'quota_check_failed' };
  }
};

/**
 * Obtiene estadísticas de uso para un usuario
 * @param {number} userId - ID del usuario
 * @param {string} role - Rol del usuario
 * @returns {Promise<Object>} Estadísticas de uso
 */
export const getUserUsageStats = async (userId, role) => {
  try {
    const limits = await getLimitsByRole(role);
    const dailyUsage = await getDailyUsage(userId);
    const monthlyUsage = await getMonthlyUsage(userId);

    return {
      daily: {
        used: dailyUsage,
        limit: limits.diario,
        remaining: Math.max(0, limits.diario - dailyUsage),
        percentage: limits.diario > 0 ? Math.round((dailyUsage / limits.diario) * 100) : 0
      },
      monthly: {
        used: monthlyUsage,
        limit: limits.mensual,
        remaining: Math.max(0, limits.mensual - monthlyUsage),
        percentage: limits.mensual > 0 ? Math.round((monthlyUsage / limits.mensual) * 100) : 0
      }
    };
  } catch (error) {
    console.error('[AI Quota] Error obteniendo estadísticas:', error);
    return null;
  }
};

