import { Router } from 'express';
import { health } from '../controllers/health.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();
router.get('/health', asyncHandler(health));
export default router;
