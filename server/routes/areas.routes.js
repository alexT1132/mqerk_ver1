import { Router } from 'express';
import { listAreas, catalogAreas, getArea } from '../controllers/areas.controller.js';

const router = Router();

router.get('/areas', listAreas);
router.get('/areas/catalog', catalogAreas);
router.get('/areas/:id', getArea);

export default router;
