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
    const {
      rtoken_admin,
      rtoken_asesor,
      rtoken_estudiante,
      rtoken,
      refresh_token
    } = req.cookies || {};
    const present = [
      rtoken_admin ? 'admin' : null,
      rtoken_asesor ? 'asesor' : null,
      rtoken_estudiante ? 'estudiante' : null,
      refresh_token ? 'unified' : null,
      rtoken && !rtoken_admin && !rtoken_asesor && !rtoken_estudiante ? 'generic' : null
    ].filter(Boolean).join(',');
    console.log('[REFRESH] Attempt role=%s cookiesPresent=[%s]', role || 'n/a', present || 'none');
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
  // Prefer the embedded role from the refresh token if the cookie name was generic/unified
  const effectiveRole = role || payload.role || null;
  // Respetar persistencia original: si la cookie existente tenía maxAge (persistente) express la presenta con expires.
  // Detectamos heurísticamente si el usuario eligió "recordarme" revisando si la cookie de refresh tenía fecha de expiración.
  // Si no podemos detectarlo, por seguridad usamos remember=false (sesión) para no extender indebidamente.
  let rememberOriginal = false;
  try {
    // Algunas libs no exponen directamente expiración; alternativa: el cliente que marcó remember guarda localStorage 'rememberMe'.
    // Aquí podemos inspeccionar una cabecera personalizada futura; por ahora mantenemos false.
  } catch {}
  await issueTokenCookies(res, userId, effectiveRole, { accessMins: 60, refreshDays: 30, remember: rememberOriginal });
  return res.status(200).json({ ok: true, rotated: true });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error refreshing token' });
  }
}
