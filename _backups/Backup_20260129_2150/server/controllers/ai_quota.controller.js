import { getUserUsageStats } from '../models/ai_quota.model.js';
import { authREquired } from '../middlewares/validateToken.js';

/**
 * Obtiene las estadísticas de uso de IA para el usuario actual
 */
export const getMyUsageStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || req.user?.rol;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    const stats = await getUserUsageStats(userId, role);

    if (!stats) {
      return res.status(500).json({
        error: 'Error al obtener estadísticas de uso'
      });
    }

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('[AI Quota Controller] Error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

