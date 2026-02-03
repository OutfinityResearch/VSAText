/**
 * SCRIPTA SDK - ID Utilities
 *
 * Browser-safe random ID generation.
 * Uses Web Crypto when available, and falls back to Math.random otherwise.
 */

export function randomHex(bytes = 6) {
  const buf = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function randomId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(16)}${randomHex(8)}`;
}

export function makeId(prefix, length = 12) {
  return `${prefix}_${randomId().slice(0, length)}`;
}

