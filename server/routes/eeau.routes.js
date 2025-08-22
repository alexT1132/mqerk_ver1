import { Router } from 'express';
import { obtenerEEAU } from '../controllers/eeau.controller.js';

const router = Router();

router.get('/eeau', obtenerEEAU);

export default router;
