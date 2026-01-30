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
} from '../controllers/student_resources.controller.js';

const router = Router();

// Listar todos los recursos de estudiantes (visibles para todos los alumnos)
router.get('/student-resources', authREquired, list);

// Obtener un recurso por ID
router.get('/student-resources/:id', authREquired, getById);

// Crear recurso (solo estudiantes)
router.post('/student-resources', authREquired, uploadRecurso.single('file'), create);

// Actualizar recurso (solo el estudiante que lo subió)
router.put('/student-resources/:id', authREquired, update);

// Eliminar recurso (solo el estudiante que lo subió)
router.delete('/student-resources/:id', authREquired, remove);

// Descargar recurso
router.get('/student-resources/:id/download', authREquired, download);

export default router;

