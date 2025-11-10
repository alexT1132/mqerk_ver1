import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import crypto from 'crypto';

export function createAccessToken(payload, expiresIn = "1d") {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      {
  expiresIn,
  jwtid: crypto.randomUUID(),
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

export function createRefreshToken(payload, expiresIn = "30d") {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
  { expiresIn, jwtid: crypto.randomUUID() },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}