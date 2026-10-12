/**
 * Canonical Unique User Code Utility for Tallyin
 * Generates an immutable, deterministic, unique user tracking code (e.g. USR-891B-471C)
 * based on the user's permanent identifier (email, UID, or database ID).
 * If the user object already has an explicit user_code, that is returned.
 */

export function getUserCode(userOrIdentifier) {
  if (!userOrIdentifier) return 'USR-GUEST-0000';

  if (typeof userOrIdentifier === 'object') {
    if (userOrIdentifier.user_code) return String(userOrIdentifier.user_code).toUpperCase();
    if (userOrIdentifier.userCode) return String(userOrIdentifier.userCode).toUpperCase();
    userOrIdentifier = userOrIdentifier.email || userOrIdentifier.id || userOrIdentifier.uid || '';
  }

  const raw = String(userOrIdentifier).trim().toLowerCase();
  if (!raw || raw === 'n/a' || raw === 'undefined' || raw === 'null') {
    return 'USR-GUEST-0000';
  }

  // FNV-1a 32-bit hash
  let h1 = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h1 ^= raw.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }

  // Murmur-inspired 32-bit hash for second 4-character segment
  let h2 = 0x5bd1e995;
  for (let i = 0; i < raw.length; i++) {
    h2 = Math.imul(h2 ^ raw.charCodeAt(i), 0x5bd1e995);
    h2 ^= h2 >>> 15;
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0').slice(0, 4).toUpperCase();
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0').slice(0, 4).toUpperCase();

  return `USR-${part1}-${part2}`;
}

export default getUserCode;
