import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import {
  createActividad,
  updateActividad,
  listActividades,
  getActividad,
  crearOReemplazarEntrega,
  getEntregaActual,
  calificarEntrega,
  listEntregasActividad,
  getEstudiantesAsignadosActividad,
  listEntregasEstudiante,
  historialEntregasActividadEstudiante,
  agregarEntrega,
  listArchivosEntrega,
  addArchivoEntrega,
  deleteArchivoEntrega,
  resumenActividadesEstudiante,
  extenderFechaLimiteGrupo,
  extenderFechaLimiteEstudiante,
  listExtensionesActividad,
  eliminarExtension,
  permitirEditarDespuesCalificada,
  actividadUploadMiddleware,
  actividadAssetsUpload
} from '../controllers/actividades.controller.js';

const router = Router();

router.post('/actividades', authREquired, actividadAssetsUpload, createActividad);
router.get('/actividades', authREquired, listActividades);
router.get('/actividades/:id', authREquired, getActividad);
router.put('/actividades/:id', authREquired, actividadAssetsUpload, updateActividad);
router.post('/actividades/:id/entregas', authREquired, actividadUploadMiddleware, crearOReemplazarEntrega);
router.post('/actividades/:id/entregas/agregar', authREquired, actividadUploadMiddleware, agregarEntrega);
router.get('/actividades/:id/entregas/:id_estudiante', authREquired, getEntregaActual);
router.get('/actividades/:id/entregas/:id_estudiante/historial', authREquired, historialEntregasActividadEstudiante);
// Archivos múltiples sobre una entrega existente
router.get('/actividades/entregas/:entregaId/archivos', authREquired, listArchivosEntrega);
router.post('/actividades/entregas/:entregaId/archivos', authREquired, actividadUploadMiddleware, addArchivoEntrega);
router.delete('/actividades/entregas/:entregaId/archivos/:archivoId', authREquired, deleteArchivoEntrega);
router.put('/actividades/entregas/:id/calificar', authREquired, calificarEntrega);
router.get('/actividades/:id/entregas', authREquired, listEntregasActividad);
router.get('/actividades/:id/estudiantes-asignados', authREquired, getEstudiantesAsignadosActividad);
router.get('/actividades/entregas/estudiante/:id_estudiante', authREquired, listEntregasEstudiante);
router.get('/actividades/estudiante/:id_estudiante/resumen', authREquired, resumenActividadesEstudiante);

// Extensiones de fecha límite
router.post('/actividades/:id/extender-fecha/grupo', authREquired, extenderFechaLimiteGrupo);
router.post('/actividades/:id/extender-fecha/estudiante', authREquired, extenderFechaLimiteEstudiante);
router.get('/actividades/:id/extensiones', authREquired, listExtensionesActividad);
router.delete('/actividades/extensiones/:extensionId', authREquired, eliminarExtension);

// Permitir editar después de calificada
router.put('/actividades/entregas/:entregaId/permite-editar', authREquired, permitirEditarDespuesCalificada);

export default router;
