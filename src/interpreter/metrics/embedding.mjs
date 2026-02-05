/**
 * Metrics Interpreter - Embedding Backend
 *
 * Profiles:
 * - vsa: dense hypervector embedding (DS05)
 * - bow/basic: sparse bag-of-words cosine
 */

import { encodeText, cosine as cosineDense } from '../../vsa/encoder.mjs';

function tokenizeWords(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
}

function bow(text) {
  const tokens = tokenizeWords(text);
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

function cosineSparse(a, b) {
  if (!a || !b) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [, v] of a.entries()) normA += v * v;
  for (const [, v] of b.entries()) normB += v * v;
  if (!normA || !normB) return 0;

  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [k, v] of small.entries()) {
    const w = large.get(k) || 0;
    dot += v * w;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function embedText(text, ctx, options = {}) {
  const profile = String(ctx?.profile || 'vsa').toLowerCase();

  if (profile === 'vsa') {
    const dim = Number.isFinite(options.dim) ? options.dim : (Number.isFinite(ctx?.options?.dim) ? ctx.options.dim : 1000);
    const seed = Number.isFinite(options.seed) ? options.seed : (Number.isFinite(ctx?.seed) ? ctx.seed : 42);
    return { kind: 'dense', vector: encodeText(String(text ?? ''), dim, seed), dim, seed };
  }

  return { kind: 'sparse', map: bow(String(text ?? '')) };
}

export function cosineEmbedding(a, b) {
  if (!a || !b || a.kind !== b.kind) return 0;
  if (a.kind === 'dense') return cosineDense(a.vector, b.vector);
  return cosineSparse(a.map, b.map);
}

export default { embedText, cosineEmbedding };

