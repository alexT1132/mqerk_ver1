import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { uploadRecurso } from '../middlewares/recursosMulter.js';
import {
  list,
  getById,
  create,
  update,
  remove,
  download,
  listByEstudianteAsesor,
  downloadByEstudiante
} from '../controllers/asesor_resources.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/asesores/resources', authREquired, list);
router.get('/asesores/resources/:id', authREquired, getById);
// Usamos uploadRecurso.single('file') para manejar tanto archivos como datos de formulario (enlaces)
router.post('/asesores/resources', authREquired, uploadRecurso.single('file'), create);
router.put('/asesores/resources/:id', authREquired, update);
router.delete('/asesores/resources/:id', authREquired, remove);
router.get('/asesores/resources/:id/download', authREquired, download);

// Rutas para estudiantes (ver recursos de su asesor)
// Usamos una ruta más específica para evitar conflicto con /estudiantes/:id
router.get('/estudiantes/recursos/asesor', authREquired, listByEstudianteAsesor);
router.get('/estudiantes/recursos/asesor/:id/download', authREquired, downloadByEstudiante);

export default router;

