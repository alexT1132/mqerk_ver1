import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import {
  listNotifications,
  countUnread,
  markRead,
  markUnread,
  markAllRead,
  deleteNotification,
  deleteRead
} from '../controllers/asesor_notifications.controller.js';

const router = Router();

router.get('/asesores/notifications', authREquired, listNotifications);
router.get('/asesores/notifications/unread-count', authREquired, countUnread);
router.put('/asesores/notifications/:id/read', authREquired, markRead);
router.put('/asesores/notifications/:id/unread', authREquired, markUnread);
router.put('/asesores/notifications/mark-all-read', authREquired, markAllRead);
router.delete('/asesores/notifications/:id', authREquired, deleteNotification);
router.delete('/asesores/notifications/delete-read', authREquired, deleteRead);

export default router;

