import { Router } from 'express';
import {
  createActividad,
  updateActividad,
  listActividades,
  getActividad,
  crearOReemplazarEntrega,
  getEntregaActual,
  calificarEntrega,
  listEntregasActividad,
  listEntregasEstudiante,
  historialEntregasActividadEstudiante,
  agregarEntrega,
  listArchivosEntrega,
  addArchivoEntrega,
  deleteArchivoEntrega,
  resumenActividadesEstudiante,
  actividadUploadMiddleware,
  actividadAssetsUpload
} from '../controllers/actividades.controller.js';

const router = Router();

router.post('/actividades', actividadAssetsUpload, createActividad);
router.get('/actividades', listActividades);
router.get('/actividades/:id', getActividad);
router.put('/actividades/:id', actividadAssetsUpload, updateActividad);
router.post('/actividades/:id/entregas', actividadUploadMiddleware, crearOReemplazarEntrega);
router.post('/actividades/:id/entregas/agregar', actividadUploadMiddleware, agregarEntrega);
router.get('/actividades/:id/entregas/:id_estudiante', getEntregaActual);
router.get('/actividades/:id/entregas/:id_estudiante/historial', historialEntregasActividadEstudiante);
// Archivos múltiples sobre una entrega existente
router.get('/actividades/entregas/:entregaId/archivos', listArchivosEntrega);
router.post('/actividades/entregas/:entregaId/archivos', actividadUploadMiddleware, addArchivoEntrega);
router.delete('/actividades/entregas/:entregaId/archivos/:archivoId', deleteArchivoEntrega);
router.put('/actividades/entregas/:id/calificar', calificarEntrega);
router.get('/actividades/:id/entregas', listEntregasActividad);
router.get('/actividades/entregas/estudiante/:id_estudiante', listEntregasEstudiante);
router.get('/actividades/estudiante/:id_estudiante/resumen', resumenActividadesEstudiante);

export default router;
