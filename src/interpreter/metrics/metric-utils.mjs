/**
 * Metrics Interpreter - Shared Metric Utilities
 */

export function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function normalizeString(x) {
  return String(x ?? '').trim();
}

export function toLowerId(x) {
  return normalizeString(x).toLowerCase();
}

export function countTokens(text) {
  const s = normalizeString(text);
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
}

export function splitSentences(text) {
  return normalizeString(text)
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function joinScopeText(world, sceneIds) {
  const parts = [];
  for (const id of sceneIds || []) {
    const s = world?.scenes?.by_id?.[id];
    if (!s) continue;
    const t = normalizeString(s.text);
    if (t) parts.push(t);
  }
  return parts.join('\n');
}

export function unionLowerSets(sets) {
  const out = new Set();
  for (const s of sets || []) {
    for (const v of s || []) out.add(String(v).toLowerCase());
  }
  return out;
}

export function jaccard(a, b) {
  const A = a instanceof Set ? a : new Set(a || []);
  const B = b instanceof Set ? b : new Set(b || []);
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

export function average(nums) {
  const arr = (nums || []).filter(n => Number.isFinite(n));
  if (arr.length === 0) return 0;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

