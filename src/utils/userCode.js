/**
 * Canonical Unique User Code Utility for Tallyin
 * Generates an immutable, deterministic, unique user tracking code (e.g. USR-891B-471C)
 * based on the user's permanent identifier (email, UID, or database ID).
 * If the user object already has an explicit user_code, that is returned.
 */

// Special permanent designated codes for VIP / founding administrator accounts
const SPECIAL_USER_CODES = {
  'sampathjogipusala123@gmail.com': 'USR-0000-8888',
  'd0b4cb3b-e0bd-44df-b876-f284e542dc0f': 'USR-0000-8888',
  'user_3ip8e7i4nu9n0ksdqp1u6b8kpom': 'USR-0000-8888',
  't8teciwsjbw01hm2e4b93bxvtuu2': 'USR-0000-8888',
  'dljizukwmvedihkcj2y3cpe7jcl1': 'USR-0000-8888',
};

export function getUserCode(userOrIdentifier) {
  if (!userOrIdentifier) return 'USR-GUEST-0000';

  if (typeof userOrIdentifier === 'object') {
    const email = String(userOrIdentifier.email || userOrIdentifier.user_email || '').trim().toLowerCase();
    const uid = String(userOrIdentifier.uid || userOrIdentifier.id || userOrIdentifier.user_id || '').trim().toLowerCase();

    // Priority 1: Check if this user identity matches a special designated code
    if (SPECIAL_USER_CODES[email]) return SPECIAL_USER_CODES[email];
    if (SPECIAL_USER_CODES[uid]) return SPECIAL_USER_CODES[uid];
    if (email === 'sampathjogipusala123@gmail.com') return 'USR-0000-8888';

    if (userOrIdentifier.user_code) return String(userOrIdentifier.user_code).toUpperCase();
    if (userOrIdentifier.userCode) return String(userOrIdentifier.userCode).toUpperCase();
    userOrIdentifier = email || uid || '';
  }

  const raw = String(userOrIdentifier).trim().toLowerCase();
  if (!raw || raw === 'n/a' || raw === 'undefined' || raw === 'null') {
    return 'USR-GUEST-0000';
  }

  // Priority 1: Direct match for special designated codes
  if (SPECIAL_USER_CODES[raw] || raw === 'sampathjogipusala123@gmail.com') {
    return 'USR-0000-8888';
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
