/**
 * SCRIPTA SDK - Random Generator Utilities
 *
 * Small shared helpers used across random generation modules.
 * Portable (browser + Node.js).
 */

export function pick(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickN(arr, n) {
  if (!arr || arr.length === 0) return [];
  const copy = [...arr];
  const k = Math.max(0, Math.min(n, copy.length));

  // Fisher–Yates partial shuffle (unbiased, O(n))
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, k);
}

export function humanizeKey(key) {
  const raw = String(key || '').replace(/_/g, ' ').trim();
  if (!raw) return '';
  return raw.replace(/\b\w/g, c => c.toUpperCase());
}

export default { pick, pickN, humanizeKey };

