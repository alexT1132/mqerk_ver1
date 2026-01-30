import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { list, create, update, remove } from '../controllers/student_reminders.controller.js';

const router = Router();

router.get('/student/reminders', authREquired, list);
router.post('/student/reminders', authREquired, create);
router.put('/student/reminders/:id', authREquired, update);
router.delete('/student/reminders/:id', authREquired, remove);

export default router;
