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
      estudiante: {
        diario: 1000,
        mensual: 3000,
        // Límites específicos por tipo (override del general si se especifica)
        analysis_diario: 5,
        tutor_diario: 10
      },
      asesor: {
        diario: 2000,
        mensual: 5000,
        analysis_diario: 50,
        tutor_diario: 100,
        // Nuevos límites solicitados
        simulation_gen_diario: 10,
        quiz_gen_diario: 10,
        formula_gen_diario: 20
      },
      admin: { diario: 5000, mensual: 50000, analysis_diario: 500, tutor_diario: 500, simulation_gen_diario: 500, quiz_gen_diario: 500, formula_gen_diario: 500 }
    };
    return defaults[role?.toLowerCase()] || defaults.estudiante;
  }

  const roleLower = (role || '').toLowerCase();

  // Base configuration from DB
  const baseLimits = {
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

  // Add specific limits (hardcoded for now as DB might not have columns yet)
  // user requested: 5 for analysis, 10 for tutor for students
  if (roleLower === 'estudiante') {
    baseLimits.analysis_diario = 5;
    baseLimits.tutor_diario = 10;
  } else if (roleLower === 'asesor') {
    baseLimits.analysis_diario = 50;
    baseLimits.tutor_diario = 100;
    baseLimits.simulation_gen_diario = 10;
    baseLimits.quiz_gen_diario = 10;
    baseLimits.formula_gen_diario = 20;
  } else {
    // Admin or others (fallback high defaults)
    baseLimits.analysis_diario = baseLimits.diario;
    baseLimits.tutor_diario = baseLimits.diario;
    baseLimits.simulation_gen_diario = baseLimits.diario;
    baseLimits.quiz_gen_diario = baseLimits.diario;
    baseLimits.formula_gen_diario = baseLimits.diario;
  }

  return baseLimits;
};

/**
 * Registra un uso de IA en el log
 * @param {Object} usageData - Datos del uso
 * @returns {Promise<number>} ID del registro creado
 */
import AiUsageModel from './aiUsageModel.js';

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

    // --- SINCRONIZACIÓN CON LEGACY TRACKING (Simuladores y Quizzes) ---
    // Esto asegura que el contador que ve el usuario en el frontend se actualice automáticamente
    // sin necesidad de que el frontend llame a /increment manualmente.
    if (exito && id_usuario) {
      try {
        let legacyType = null;
        let estudianteId = null;

        // Mapear el propósito/tipo_operacion a los tipos del legacy tracking
        // 'tutor' ya NO comparte la cuota con 'quiz' (tiene su propio límite de 10)
        if (tipo_operacion === 'quizzes' || tipo_operacion === 'quiz') {
          legacyType = 'quiz';
        } else if (tipo_operacion === 'analisis' || tipo_operacion === 'simulacion') {
          legacyType = 'simulacion';
        }

        if (legacyType) {
          // Obtener id_estudiante asociado al usuario
          const [userRows] = await db.query('SELECT id_estudiante FROM usuarios WHERE id = ?', [id_usuario]);
          if (userRows.length > 0 && userRows[0].id_estudiante) {
            estudianteId = userRows[0].id_estudiante;
            await AiUsageModel.incrementUsage(estudianteId, legacyType);
            console.log(`[AI Quota] ✅ Legacy counter actualizado para ${legacyType} (user ${id_usuario} -> student ${estudianteId})`);
          } else {
            console.log(`[AI Quota] ℹ️ No se actualizó legacy counter: Usuario ${id_usuario} no es estudiante o no tiene ID asociado.`);
          }
        }
      } catch (legacyErr) {
        // No fallar si el legacy tracking falla, solo loguear
        // Esto puede pasar si ya se alcanzó el límite diario en el legacy tracking,
        // pero aquí permitimos pasar si la cuota global (logs) lo permite.
        // Ojo: Si queremos ser estrictos con el límite de 5, el checkQuota debería haberlo atrapado antes,
        // pero checkQuota usa getLimitsByRole que es diferente a AiUsageModel.
        console.warn(`[AI Quota] ⚠️ No se pudo actualizar legacy counter: ${legacyErr.message}`);
      }
    }
    // ------------------------------------------------------------------

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
 * Obtiene el conteo de usos diarios filtrado por tipo/grupo de operación
 */
export const getDailyUsageByType = async (userId, typeGroup, date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    let query = `SELECT COUNT(*) as count FROM ai_usage_log WHERE id_usuario = ? AND DATE(timestamp) = ? AND exito = 1`;
    const params = [userId, targetDate];

    if (typeGroup === 'tutor') {
      query += ` AND tipo_operacion = 'tutor'`;
    } else if (typeGroup === 'analysis') {
      // Agrupamos quiz, quizzes, simulacion, analisis
      query += ` AND tipo_operacion IN ('quiz', 'quizzes', 'simulacion', 'analisis')`;
    } else if (typeGroup === 'simulation_gen_specific') {
      query += ` AND tipo_operacion = 'simulation_gen'`;
    } else if (typeGroup === 'quiz_gen_specific') {
      query += ` AND tipo_operacion = 'quiz_gen'`;
    } else if (typeGroup === 'formula_gen_specific') {
      query += ` AND tipo_operacion = 'formula_gen'`;
    }
    // Si es 'general' o null, cuenta todo (comportamiento original)

    const [rows] = await db.query(query, params);
    return rows[0]?.count || 0;
  } catch (error) {
    console.error('[AI Quota] Error obteniendo uso diario por tipo:', error);
    return 0;
  }
};

/**
 * Verifica si un usuario puede hacer una llamada a IA
 * @param {number} userId - ID del usuario
 * @param {string} role - Rol del usuario
 * @param {string} operationType - Tipo de operación ('tutor', 'quiz', 'simulacion', etc)
 * @returns {Promise<Object>} { allowed: boolean, reason?: string, quota?: Object }
 */
export const checkQuota = async (userId, role, operationType = 'general') => {
  try {
    const limits = await getLimitsByRole(role);
    const dailyUsage = await getDailyUsage(userId);
    const monthlyUsage = await getMonthlyUsage(userId);
    const globalDaily = await getGlobalDailyUsage();
    const globalMonthly = await getGlobalMonthlyUsage();

    // Determinar grupo de límites
    let limitToUse = limits.diario; // Fallback al general (alto)
    let usageToCompare = dailyUsage; // Fallback al uso total

    const isTutor = operationType === 'tutor';
    const isAnalysis = ['quiz', 'quizzes', 'simulacion', 'analisis'].includes(operationType);
    const isSimGen = operationType === 'simulation_gen';
    const isQuizGen = operationType === 'quiz_gen';
    const isFormulaGen = operationType === 'formula_gen';

    if (isTutor && limits.tutor_diario) {
      limitToUse = limits.tutor_diario;
      usageToCompare = await getDailyUsageByType(userId, 'tutor');
    } else if (isAnalysis && limits.analysis_diario) {
      limitToUse = limits.analysis_diario;
      usageToCompare = await getDailyUsageByType(userId, 'analysis');
    } else if (isSimGen && limits.simulation_gen_diario) {
      limitToUse = limits.simulation_gen_diario;
      usageToCompare = await getDailyUsageByType(userId, 'simulation_gen_specific');
    } else if (isQuizGen && limits.quiz_gen_diario) {
      limitToUse = limits.quiz_gen_diario;
      usageToCompare = await getDailyUsageByType(userId, 'quiz_gen_specific');
    } else if (isFormulaGen && limits.formula_gen_diario) {
      limitToUse = limits.formula_gen_diario;
      usageToCompare = await getDailyUsageByType(userId, 'formula_gen_specific');
    }

    // Verificar límite específico
    if (usageToCompare >= limitToUse) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        quota: {
          daily: { used: usageToCompare, limit: limitToUse },
          // Conservamos stats generales para info
          monthly: { used: monthlyUsage, limit: limits.mensual }
        }
      };
    }

    // NOTA: Ya no verificamos el límite DIARIO GENERAL estricto aquí para estudiantes, 
    // porque 'limits.diario' ahora es 1000 (failsafe). 
    // La restricción real viene de los bloques if/else de arriba.

    /* 
    // OLD GENERAL CHECK (Disabled for students/specific types to allow separate buckets)
    if (dailyUsage >= limits.diario) { ... } 
    */

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

