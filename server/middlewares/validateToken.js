import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { findAccessToken } from '../libs/authTokens.js';

export const authREquired = (req, res, next) => {
  const { value: candidate } = findAccessToken(req.cookies);
  if (!candidate) return res.status(401).json({ message: "No token, Authorization denied" });
  jwt.verify(candidate, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};