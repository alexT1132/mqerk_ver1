import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { gmailAuthUrl, gmailOAuthCallback, gmailListInbox, gmailSend, gmailStatus } from '../controllers/gmail.controller.js';

const router = Router();

router.get('/admin/gmail/auth-url', authREquired, gmailAuthUrl);
router.get('/admin/gmail/oauth2/callback', gmailOAuthCallback); // no auth, Google redirects here
router.get('/admin/gmail/inbox', authREquired, gmailListInbox);
router.post('/admin/gmail/send', authREquired, gmailSend);
router.get('/admin/gmail/status', authREquired, gmailStatus);

// Simple diagnostics (no secrets leaked) to validate env config
router.get('/admin/gmail/env-check', (req, res) => {
	const clientId = process.env.GOOGLE_CLIENT_ID || '';
	const hasId = !!clientId;
	const hasSecret = !!process.env.GOOGLE_CLIENT_SECRET;
	const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:1002/api/admin/gmail/oauth2/callback';
	const maskedClientId = hasId ? `${clientId.slice(0, 8)}...${clientId.slice(-6)}` : null;
	res.json({ ok: true, hasId, hasSecret, maskedClientId, redirectUri });
});

export default router;
