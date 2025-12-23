import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import {
  registrarAsistencia,
  registrarAsistenciasMasivas,
  getAsistenciasEstudiante,
  getAsistenciasPorAsesor,
  getResumenAsistenciaEstudiante,
  eliminarAsistencia
} from '../controllers/asistencias.controller.js';

const router = Router();

// Registrar asistencia individual
router.post('/asistencias', authREquired, registrarAsistencia);

// Registrar múltiples asistencias (para una clase)
router.post('/asistencias/masivo', authREquired, registrarAsistenciasMasivas);

// Obtener asistencias de un estudiante
router.get('/asistencias/estudiante/:id_estudiante', authREquired, getAsistenciasEstudiante);

// Obtener resumen de asistencia de un estudiante
router.get('/asistencias/estudiante/:id_estudiante/resumen', authREquired, getResumenAsistenciaEstudiante);

// Obtener asistencias de estudiantes del asesor
router.get('/asistencias/asesor', authREquired, getAsistenciasPorAsesor);

// Eliminar asistencia
router.delete('/asistencias/:id', authREquired, eliminarAsistencia);

export default router;

