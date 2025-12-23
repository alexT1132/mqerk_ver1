import { Router } from 'express';
import { logError, clearLog, getLog } from '../controllers/logger.controller.js';
import { authREquired } from '../middlewares/validateToken.js';

const router = Router();

// Endpoint público para recibir logs (no requiere auth para facilitar debugging)
router.post('/logger/log', logError);

// Endpoints protegidos para administrar logs
router.get('/logger/log', authREquired, getLog);
router.delete('/logger/log', authREquired, clearLog);

export default router;

