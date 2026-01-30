import { Router } from 'express';
import { getMyUsageStats } from '../controllers/ai_quota.controller.js';
import { authREquired } from '../middlewares/validateToken.js';

const router = Router();

// Ruta para obtener estadísticas de uso del usuario actual
router.get('/ai/quota/my-stats', authREquired, getMyUsageStats);

export default router;

