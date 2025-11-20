import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { uploadRecurso } from '../middlewares/recursosMulter.js';
import {
  list,
  getById,
  create,
  update,
  remove,
  download
} from '../controllers/asesor_resources.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/asesores/resources', authREquired, list);
router.get('/asesores/resources/:id', authREquired, getById);
router.post('/asesores/resources', authREquired, uploadRecurso.single('file'), create);
router.put('/asesores/resources/:id', authREquired, update);
router.delete('/asesores/resources/:id', authREquired, remove);
router.get('/asesores/resources/:id/download', authREquired, download);

export default router;

