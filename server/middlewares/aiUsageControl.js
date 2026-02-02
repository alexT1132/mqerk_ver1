import { checkQuota, logAIUsage, getLimitsByRole } from '../models/ai_quota.model.js';

/**
 * Middleware para verificar límites de uso de IA antes de procesar la petición
 * Agrega información de cuota a req.aiQuota
 */
export const verificarLimitesAI = async (req, res, next) => {
  try {
    // Obtener usuario del token (debe estar autenticado)
    const userId = req.user?.id;
    const role = req.user?.role || req.user?.rol;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    // Obtener propósito de la operación para cuota específica
    const operationType = req.body?.purpose || req.body?.tipo_operacion || 'general';

    // Verificar cuota
    const quotaCheck = await checkQuota(userId, role, operationType);

    if (!quotaCheck.allowed) {
      const messages = {
        daily_limit_exceeded: 'Has alcanzado tu límite diario de uso de IA',
        monthly_limit_exceeded: 'Has alcanzado tu límite mensual de uso de IA',
        global_daily_limit_exceeded: 'Se ha alcanzado el límite diario global del sistema',
        global_monthly_limit_exceeded: 'Se ha alcanzado el límite mensual global del sistema'
      };

      return res.status(429).json({
        error: messages[quotaCheck.reason] || 'Límite de uso alcanzado',
        code: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    // Agregar información de cuota a la petición
    req.aiQuota = quotaCheck.quota;
    req.aiUserId = userId;
    req.aiUserRole = role;

    next();
  } catch (error) {
    console.error('[AI Usage Control] Error en middleware:', error);
    // En caso de error, permitir el uso (fail-open)
    next();
  }
};

/**
 * Middleware para registrar el uso de IA después de una llamada exitosa
 * Debe llamarse después de que la respuesta se haya enviado
 */
export const registrarUsoAI = async (req, res, next) => {
  // Guardar referencia a la función original de res.json
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json para interceptar la respuesta
  res.json = function (data) {
    // Si la respuesta fue exitosa (status 200), registrar el uso
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const startTime = req.aiStartTime || Date.now();
      const duration = Date.now() - startTime;

      // Registrar uso de forma asíncrona (no bloquear la respuesta)
      if (req.aiUserId) {
        const tipoOperacion = req.body?.purpose || req.body?.tipo_operacion || 'general';
        // Determinar proveedor basado en la ruta o el body
        let proveedor = req.body?.proveedor;
        if (!proveedor) {
          // Inferir del path
          if (req.path?.includes('/groq/')) {
            proveedor = 'groq';
          } else if (req.path?.includes('/gemini/')) {
            proveedor = 'gemini';
          } else {
            proveedor = 'gemini'; // Por defecto
          }
        }
        const modelo = req.body?.model || (proveedor === 'groq' ? 'llama-3.1-70b-versatile' : 'gemini-2.5-flash');

        // Estimar tokens (aproximación simple: ~4 caracteres por token)
        const promptLength = JSON.stringify(req.body?.contents || []).length;
        const responseLength = JSON.stringify(data).length;
        const tokensEstimados = Math.ceil((promptLength + responseLength) / 4);

        logAIUsage({
          id_usuario: req.aiUserId,
          tipo_operacion: tipoOperacion,
          modelo_usado: modelo,
          tokens_estimados: tokensEstimados,
          exito: true,
          duracion_ms: duration,
          proveedor: proveedor
        }).catch(err => {
          console.error('[AI Usage Control] Error registrando uso:', err);
        });

        // Agregar información de cuota actualizada a la respuesta
        if (req.aiQuota && !data.aiQuota) {
          data.aiQuota = req.aiQuota;
        }
      }
    }

    // Llamar a la función original
    return originalJson(data);
  };

  // Guardar tiempo de inicio
  req.aiStartTime = Date.now();
  next();
};

/**
 * Middleware para registrar errores de IA
 */
export const registrarErrorAI = async (error, req, res, next) => {
  if (req.aiUserId && error) {
    const startTime = req.aiStartTime || Date.now();
    const duration = Date.now() - startTime;

    const tipoOperacion = req.body?.purpose || req.body?.tipo_operacion || 'general';
    // Determinar proveedor basado en la ruta o el body
    let proveedor = req.body?.proveedor;
    if (!proveedor) {
      // Inferir del path
      if (req.path?.includes('/groq/')) {
        proveedor = 'groq';
      } else if (req.path?.includes('/gemini/')) {
        proveedor = 'gemini';
      } else {
        proveedor = 'gemini'; // Por defecto
      }
    }
    const modelo = req.body?.model || (proveedor === 'groq' ? 'llama-3.1-70b-versatile' : 'gemini-2.5-flash');

    logAIUsage({
      id_usuario: req.aiUserId,
      tipo_operacion: tipoOperacion,
      modelo_usado: modelo,
      tokens_estimados: 0,
      exito: false,
      error_mensaje: error.message || 'Error desconocido',
      duracion_ms: duration,
      proveedor: proveedor
    }).catch(err => {
      console.error('[AI Usage Control] Error registrando error:', err);
    });
  }

  next(error);
};

/**
 * Agrega información de cuota a la respuesta (sin verificar límites)
 * Útil para endpoints que solo necesitan mostrar información
 */
export const agregarInfoCuota = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || req.user?.rol;

    if (userId) {
      const quotaCheck = await checkQuota(userId, role);
      req.aiQuota = quotaCheck.quota;
    }

    next();
  } catch (error) {
    console.error('[AI Usage Control] Error agregando info de cuota:', error);
    next();
  }
};

