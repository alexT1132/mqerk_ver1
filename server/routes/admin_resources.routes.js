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
} from '../controllers/admin_resources.controller.js';

const router = Router();

// Listar todos los recursos del administrador (visibles para todos los asesores)
router.get('/admin-resources', authREquired, list);

// Obtener un recurso por ID
router.get('/admin-resources/:id', authREquired, getById);

// Crear recurso (solo administradores)
router.post('/admin-resources', authREquired, uploadRecurso.single('file'), create);

// Actualizar recurso (solo administradores)
router.put('/admin-resources/:id', authREquired, update);

// Eliminar recurso (solo administradores)
router.delete('/admin-resources/:id', authREquired, remove);

// Descargar recurso
router.get('/admin-resources/:id/download', authREquired, download);

export default router;

