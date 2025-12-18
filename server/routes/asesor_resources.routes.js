import { Router } from 'express';
import multer from 'multer';
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

// Middleware para manejar upload opcional (solo si no es un enlace)
// Usamos multer.none() primero para procesar el body, luego verificamos si es enlace
const optionalUpload = (req, res, next) => {
  // Primero procesar el body sin archivos para poder leer los campos
  const multerNone = multer().none();
  multerNone(req, res, () => {
    // Si viene link_url o resource_type === 'link', no aplicar multer de archivos
    if (req.body?.link_url || req.body?.resource_type === 'link') {
      return next();
    }
    // Si no es enlace, aplicar multer para archivos
    uploadRecurso.single('file')(req, res, next);
  });
};

// Todas las rutas requieren autenticación
router.get('/asesores/resources', authREquired, list);
router.get('/asesores/resources/:id', authREquired, getById);
router.post('/asesores/resources', authREquired, optionalUpload, create);
router.put('/asesores/resources/:id', authREquired, update);
router.delete('/asesores/resources/:id', authREquired, remove);
router.get('/asesores/resources/:id/download', authREquired, download);

// Rutas para estudiantes (ver recursos de su asesor)
// Usamos una ruta más específica para evitar conflicto con /estudiantes/:id
router.get('/estudiantes/recursos/asesor', authREquired, listByEstudianteAsesor);
router.get('/estudiantes/recursos/asesor/:id/download', authREquired, downloadByEstudiante);

export default router;

