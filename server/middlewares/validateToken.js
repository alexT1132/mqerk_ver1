import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { findAccessToken } from '../libs/authTokens.js';

export const authREquired = (req, res, next) => {
  // 1) Preferir Authorization: Bearer <token> cuando esté presente (permite elegir rol correcto desde el cliente)
  const headerAuth = req.headers?.authorization || req.headers?.Authorization;
  const headerToken = (typeof headerAuth === 'string' && headerAuth.toLowerCase().startsWith('bearer '))
    ? headerAuth.slice(7).trim()
    : null;
  // 2) Si no hay header válido, usar cookies (método que intenta resolver mejor múltiples roles)
  const { value: cookieToken } = findAccessToken(req.cookies);
  const candidate = headerToken || cookieToken;
  if (!candidate) {
    return res.status(401).json({ message: "No token, Authorization denied", reason: 'no-token' });
  }
  jwt.verify(candidate, TOKEN_SECRET, (err, user) => {
    if (err) {
      // Diferenciar token expirado vs. token inválido para que el frontend pueda refrescar
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado', reason: 'expired' });
      }
      return res.status(403).json({ message: 'Invalid token', reason: 'invalid-token' });
    }
    req.user = user;
    next();
  });
};