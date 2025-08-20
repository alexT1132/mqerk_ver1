// Central helpers for token cookie handling and role abstraction
// Supports dynamic role lists; easy to extend.

import { createAccessToken, createRefreshToken } from './jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

// Ordered list of roles; append new roles here only.
export const ROLE_ORDER = ['admin','asesor','estudiante'];

// Cookie name patterns (legacy role-specific + generic + future canonical names)
export const ACCESS_GENERIC = 'token';
export const REFRESH_GENERIC = 'rtoken';
export const ACCESS_UNIFIED = 'access_token'; // optional future canonical
export const REFRESH_UNIFIED = 'refresh_token';

export function findAccessToken(cookies = {}) {
  if (cookies[ACCESS_UNIFIED]) return { name: ACCESS_UNIFIED, role: null, value: cookies[ACCESS_UNIFIED] };
  for (const role of ROLE_ORDER) {
    const name = `token_${role}`;
    if (cookies[name]) return { name, role, value: cookies[name] };
  }
  if (cookies[ACCESS_GENERIC]) return { name: ACCESS_GENERIC, role: null, value: cookies[ACCESS_GENERIC] };
  return { name: null, role: null, value: null };
}

export function findRefreshToken(cookies = {}) {
  if (cookies[REFRESH_UNIFIED]) return { name: REFRESH_UNIFIED, role: null, value: cookies[REFRESH_UNIFIED] };
  for (const role of ROLE_ORDER) {
    const name = `rtoken_${role}`;
    if (cookies[name]) return { name, role, value: cookies[name] };
  }
  if (cookies[REFRESH_GENERIC]) return { name: REFRESH_GENERIC, role: null, value: cookies[REFRESH_GENERIC] };
  return { name: null, role: null, value: null };
}

export async function issueTokenCookies(res, userId, role, { accessMins, refreshDays = 30, remember = false }) {
  const roleLower = (role||'').toLowerCase();
  const accessExp = `${Math.max(5, accessMins)}m`;
  const refreshExp = `${refreshDays}d`;
  const access = await createAccessToken({ id: userId, role: roleLower }, accessExp);
  const refresh = await createRefreshToken({ id: userId, role: roleLower }, refreshExp);
  const isProd = process.env.NODE_ENV === 'production';
  const base = { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' };
  if (remember) base.maxAge = refreshDays * 24 * 60 * 60 * 1000;
  const accessName = roleLower ? `token_${roleLower}` : ACCESS_GENERIC;
  const refreshName = roleLower ? `rtoken_${roleLower}` : REFRESH_GENERIC;
  // Legacy role-specific + unified canonical
  res.cookie(accessName, access, base);
  res.cookie(refreshName, refresh, { ...base, maxAge: refreshDays * 24 * 60 * 60 * 1000 });
  res.cookie(ACCESS_UNIFIED, access, base);
  res.cookie(REFRESH_UNIFIED, refresh, { ...base, maxAge: refreshDays * 24 * 60 * 60 * 1000 });
  return { accessName, refreshName, unified: { access: ACCESS_UNIFIED, refresh: REFRESH_UNIFIED } };
}

export function verifyJwt(token) {
  try {
    return { ok: true, payload: jwt.verify(token, TOKEN_SECRET) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

// Sliding expiration helper: if remaining time < threshold% issue new access token
export async function maybeSlideAccess(res, decodedPayload, existingToken, { thresholdPct = 20, accessMins = 60 }) {
  if (!decodedPayload?.exp || !decodedPayload?.iat) return false;
  const nowSec = Math.floor(Date.now()/1000);
  const total = decodedPayload.exp - decodedPayload.iat;
  const remaining = decodedPayload.exp - nowSec;
  if (remaining <= 0) return false;
  const remainingPct = (remaining / total) * 100;
  if (remainingPct <= thresholdPct) {
    const role = decodedPayload.role || null;
    await issueTokenCookies(res, decodedPayload.id, role, { accessMins });
    return true;
  }
  return false;
}
