import { Router } from 'express';
import AiUsageController from '../controllers/aiUsageController.js';
import { authREquired } from '../middlewares/validateToken.js';

/**
 * Rutas para gestionar el tracking de uso de análisis IA
 * Todas las rutas requieren autenticación
 */

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authREquired);

/**
 * GET /api/ai-usage/:studentId/:type
 * Obtener uso actual del día
 * @param {number} studentId - ID del estudiante
 * @param {string} type - Tipo de análisis ('simulacion' | 'quiz')
 */
router.get('/:studentId/:type', AiUsageController.getUsage);

/**
 * POST /api/ai-usage/:studentId/:type/increment
 * Incrementar contador de uso
 * @param {number} studentId - ID del estudiante
 * @param {string} type - Tipo de análisis ('simulacion' | 'quiz')
 */
router.post('/:studentId/:type/increment', AiUsageController.incrementUsage);

/**
 * POST /api/ai-usage/:studentId/:type/reset
 * Resetear contador (solo admin/testing)
 * @param {number} studentId - ID del estudiante
 * @param {string} type - Tipo de análisis ('simulacion' | 'quiz')
 */
router.post('/:studentId/:type/reset', AiUsageController.resetUsage);

/**
 * GET /api/ai-usage/:studentId/stats
 * Obtener estadísticas de uso
 * @param {number} studentId - ID del estudiante
 * @query {number} days - Días a analizar (default: 7)
 */
router.get('/:studentId/stats', AiUsageController.getStats);

export default router;
