import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { listStudentNotifications, markRead, markUnread, markAllRead, deleteNotification, deleteRead } from '../controllers/student_notifications.controller.js';

const router = Router();

router.get('/student/notifications', authREquired, listStudentNotifications);
router.put('/student/notifications/:id/read', authREquired, markRead);
router.put('/student/notifications/:id/unread', authREquired, markUnread);
router.put('/student/notifications/mark-all-read', authREquired, markAllRead);
router.delete('/student/notifications/:id', authREquired, deleteNotification);
router.delete('/student/notifications/delete-read', authREquired, deleteRead);

export default router;
