import { Router } from 'express';
import { geminiGenerate, geminiListModels, calificarRespuestaCorta } from '../controllers/gemini.controller.js';
import { authREquired } from '../middlewares/validateToken.js';
import { verificarLimitesAI, registrarUsoAI } from '../middlewares/aiUsageControl.js';

const router = Router();

// Ruta para generar contenido con IA
router.post(
  '/ai/gemini/generate',
  authREquired,
  verificarLimitesAI,
  registrarUsoAI,
  geminiGenerate
);

// Ruta para listar modelos disponibles
router.get('/ai/gemini/models', geminiListModels);

// Ruta para calificar respuestas cortas con sistema híbrido
router.post('/ai/gemini/calificar-respuesta', calificarRespuestaCorta);

export default router;
