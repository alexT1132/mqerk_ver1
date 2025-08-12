import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { listAdminEmails, sendAdminEmail, markEmailRead, deleteAdminEmail } from '../controllers/emails.controller.js';

const router = Router();

router.get('/admin/emails', authREquired, listAdminEmails);
router.post('/admin/emails/send', authREquired, sendAdminEmail);
router.put('/admin/emails/:id/read', authREquired, markEmailRead);
router.delete('/admin/emails/:id', authREquired, deleteAdminEmail);

export default router;
