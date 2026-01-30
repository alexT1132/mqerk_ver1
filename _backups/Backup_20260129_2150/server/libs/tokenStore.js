// Simple in-memory token revocation and rotation tracking.
// Replace with Redis/DB in production if needed.

const revokedJti = new Set();

export function revokeJti(jti){
  if (jti) revokedJti.add(jti);
}

export function isRevoked(jti){
  return !!(jti && revokedJti.has(jti));
}

export function resetStore(){
  revokedJti.clear();
}
