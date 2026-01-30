import { Router } from 'express';
import { groqGenerate, groqListModels } from '../controllers/groq.controller.js';
import { authREquired } from '../middlewares/validateToken.js';
import { verificarLimitesAI, registrarUsoAI } from '../middlewares/aiUsageControl.js';

const router = Router();

// Ruta para generar contenido con Groq
router.post(
  '/ai/groq/generate',
  authREquired,
  verificarLimitesAI,
  registrarUsoAI,
  groqGenerate
);

// Ruta para listar modelos disponibles
router.get('/ai/groq/models', groqListModels);

export default router;

