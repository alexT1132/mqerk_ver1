import jwt from 'jsonwebtoken';
import { createAccessToken } from '../libs/jwt.js';
import { TOKEN_SECRET } from '../config.js';
import * as Usuarios from '../models/usuarios.model.js';

// POST /api/token/refresh
// Uses httpOnly cookie 'rtoken' to mint a fresh short-lived access token
export async function refreshToken(req, res) {
  try {
    const { rtoken } = req.cookies || {};
    if (!rtoken) return res.status(401).json({ message: 'No refresh token' });

    jwt.verify(rtoken, TOKEN_SECRET, async (err, payload) => {
      if (err) return res.status(401).json({ message: 'Invalid refresh token' });
      const userId = payload?.id;
      if (!userId) return res.status(401).json({ message: 'Invalid refresh token' });

      // Ensure user still exists and is not soft-deleted
      const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
      if (!user) return res.status(401).json({ message: 'User not found' });

      // Issue new short token with current configured duration (default 1d; config may override on next login)
      const token = await createAccessToken({ id: userId }, '60m');
      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' };
      res.cookie('token', token, cookieOptions);
      return res.status(200).json({ ok: true });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error refreshing token' });
  }
}
