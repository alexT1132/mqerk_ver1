import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import {
  listPersonal,
  createPersonal,
  updatePersonal,
  deletePersonal,
  createForStudents,
  listForStudents
} from '../controllers/asesor_reminders.controller.js';

const router = Router();

// Recordatorios personales del asesor
router.get('/asesores/reminders/personal', authREquired, listPersonal);
router.post('/asesores/reminders/personal', authREquired, createPersonal);
router.put('/asesores/reminders/personal/:id', authREquired, updatePersonal);
router.delete('/asesores/reminders/personal/:id', authREquired, deletePersonal);

// Recordatorios para estudiantes
router.post('/asesores/reminders/students', authREquired, createForStudents);
router.get('/asesores/reminders/students', authREquired, listForStudents);

export default router;

