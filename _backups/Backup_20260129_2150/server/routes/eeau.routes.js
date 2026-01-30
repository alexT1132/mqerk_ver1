import { Router } from 'express';
import { obtenerEEAU } from '../controllers/eeau.controller.js';
import { ensureEEAUTable } from '../models/eeau.model.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.get('/eeau', asyncHandler(obtenerEEAU));
router.get('/eeau/health', asyncHandler(async (_req, res) => {
	try {
		await ensureEEAUTable();
		return res.status(200).json({ ok: true });
	} catch (e) {
		// Devolver 200 con ok: false para que el health check no bloquee el frontend
		console.error('[eeau/health] Error:', e?.message || String(e));
		return res.status(200).json({ ok: false, error: e?.message || String(e) });
	}
}));

export default router;
