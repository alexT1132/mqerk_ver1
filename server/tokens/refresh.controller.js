import jwt from 'jsonwebtoken';
import { createAccessToken, createRefreshToken } from '../libs/jwt.js';
import { TOKEN_SECRET } from '../config.js';
import { findRefreshToken, issueTokenCookies } from '../libs/authTokens.js';
import { revokeJti } from '../libs/tokenStore.js';
import * as Usuarios from '../models/usuarios.model.js';

// POST /api/token/refresh
// Uses httpOnly cookie 'rtoken' to mint a fresh short-lived access token
export async function refreshToken(req, res) {
  try {
  const { value: source, role } = findRefreshToken(req.cookies);
  if (!source) return res.status(401).json({ message: 'No refresh token', reason: 'no-rtoken' });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[REFRESH] Attempt role=%s cookiesPresent=%s%s%s%s', role,
      rtoken_admin?'admin ':'', rtoken_asesor?'asesor ':'', rtoken_estudiante?'estudiante ':'', (!rtoken_admin&&!rtoken_asesor&&!rtoken_estudiante&&rtoken)?'generic':'');
  }

  jwt.verify(source, TOKEN_SECRET, async (err, payload) => {
  if (err) {
    const reason = err.name === 'TokenExpiredError' ? 'expired-rtoken' : 'invalid-rtoken';
    return res.status(401).json({ message: 'Invalid refresh token', reason });
  }
      const userId = payload?.id;
  if (!userId) return res.status(401).json({ message: 'Invalid refresh token', reason: 'invalid-payload' });

      // Ensure user still exists and is not soft-deleted
      const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user) return res.status(401).json({ message: 'User not found', reason: 'user-not-found' });

  // Rotate: revoke old refresh jti then issue new pair
  if (payload.jti) revokeJti(payload.jti);
  await issueTokenCookies(res, userId, role, { accessMins: 60, refreshDays: 30, remember: true });
  return res.status(200).json({ ok: true, rotated: true });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error refreshing token' });
  }
}
