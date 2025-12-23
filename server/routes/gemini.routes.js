import { Router } from 'express';
import { geminiGenerate, geminiListModels, calificarRespuestaCorta } from '../controllers/gemini.controller.js';
// import { verificarLimitesAI, registrarUsoAI, agregarInfoCuota } from '../middleware/aiUsageControl.js';

const router = Router();

// Ruta para generar contenido con IA
// NOTA: Middleware de control de límites deshabilitado temporalmente
// TODO: Ejecutar migración 008_ai_usage_control.sql y luego habilitar middleware
router.post('/ai/gemini/generate', geminiGenerate);

// Ruta para listar modelos disponibles
router.get('/ai/gemini/models', geminiListModels);

// Ruta para calificar respuestas cortas con sistema híbrido
router.post('/ai/gemini/calificar-respuesta', calificarRespuestaCorta);

export default router;
