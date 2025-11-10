import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { 
  listSimulaciones,
  resumenSimulacionesEstudiante,
  listIntentosSimulacionEstudiante,
  listPreguntasSimulacion,
  crearSesionSimulacion,
  registrarRespuestasSesion,
  finalizarSesionSimulacion,
  createSimulacion,
  updateSimulacion,
  deleteSimulacion,
  getSimulacion,
  getSimulacionFull,
  getAnaliticaSimulacionEstudiante,
  getReviewSimulacionIntento
} from '../controllers/simulaciones.controller.js';

const router = Router();

router.get('/simulaciones', authREquired, listSimulaciones);
router.post('/simulaciones', authREquired, createSimulacion);
router.put('/simulaciones/:id', authREquired, updateSimulacion);
router.delete('/simulaciones/:id', authREquired, deleteSimulacion);
router.get('/simulaciones/:id', authREquired, getSimulacion);
router.get('/simulaciones/:id/full', authREquired, getSimulacionFull);
router.get('/simulaciones/estudiante/:id_estudiante/resumen', authREquired, resumenSimulacionesEstudiante);
router.get('/simulaciones/:id/intentos/:id_estudiante', authREquired, listIntentosSimulacionEstudiante);
router.get('/simulaciones/:id/analitica/:id_estudiante', authREquired, getAnaliticaSimulacionEstudiante);
// Review detallado por intento (similar a quizzes): ?intento=N opcional
router.get('/simulaciones/:id/review/:id_estudiante', authREquired, getReviewSimulacionIntento);

router.get('/simulaciones/:id/preguntas', authREquired, listPreguntasSimulacion);
router.post('/simulaciones/:id/sesiones', authREquired, crearSesionSimulacion);
router.post('/simulaciones/sesiones/:id_sesion/respuestas', authREquired, registrarRespuestasSesion);
router.post('/simulaciones/sesiones/:id_sesion/finalizar', authREquired, finalizarSesionSimulacion);

export default router;
