import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendar.controller.js';

const router = Router();

// Admin calendar events CRUD
router.get('/admin/calendar/events', authREquired, listEvents);
router.post('/admin/calendar/events', authREquired, createEvent);
router.put('/admin/calendar/events/:id', authREquired, updateEvent);
router.delete('/admin/calendar/events/:id', authREquired, deleteEvent);

export default router;
