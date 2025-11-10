import { Router } from 'express';
import { obtenerEEAU } from '../controllers/eeau.controller.js';
import { ensureEEAUTable } from '../models/eeau.model.js';

const router = Router();

router.get('/eeau', obtenerEEAU);
router.get('/eeau/health', async (_req, res) => {
	try {
		await ensureEEAUTable();
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ ok: false, error: e?.message || String(e) });
	}
});

export default router;
