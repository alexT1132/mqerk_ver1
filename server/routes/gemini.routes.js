import { Router } from 'express';
import { geminiGenerate, geminiListModels } from '../controllers/gemini.controller.js';

const router = Router();

router.post('/ai/gemini/generate', geminiGenerate);
router.get('/ai/gemini/models', geminiListModels);

export default router;
