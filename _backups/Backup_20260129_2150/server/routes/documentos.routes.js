import express from 'express';
import * as documentosController from '../controllers/documentos.controller.js';
import { authREquired } from '../middlewares/validateToken.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authREquired);

// Obtener todos los documentos del asesor autenticado
router.get('/', documentosController.getDocumentos);

// Obtener un documento por ID
router.get('/:id', documentosController.getDocumento);

// Subir/actualizar archivo de un documento
router.post('/:id/upload', documentosController.uploadMiddleware, documentosController.uploadDocumento);

// Actualizar estado de un documento (solo admin - se puede agregar middleware después)
router.patch('/:id/estado', documentosController.updateEstadoDocumento);

// Descargar un documento
router.get('/:id/download', documentosController.downloadDocumento);

// Eliminar un documento
router.delete('/:id', documentosController.deleteDocumento);

export default router;

