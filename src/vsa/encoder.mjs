#!/usr/bin/env node

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function tokenize(text) {
  return text.toLowerCase().split(/\W+/).filter(Boolean);
}

function tokenSeed(token, seed) {
  return fnv1a32(`${seed}:${token}`);
}

function tokenVector(token, dim, seed) {
  let state = tokenSeed(token, seed) || 1;
  const vec = new Array(dim);
  for (let i = 0; i < dim; i++) {
    // simple xorshift32
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17; state >>>= 0;
    state ^= state << 5; state >>>= 0;
    vec[i] = (state & 1) ? 1 : -1;
  }
  return vec;
}

export function bind(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return [];
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] * b[i];
  return out;
}

export function bundle(vectors) {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const sums = new Array(dim).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) sums[i] += vec[i];
  }
  return sums.map((s) => (s >= 0 ? 1 : -1));
}

export function permute(vec, shiftK = 1) {
  if (!Array.isArray(vec) || vec.length === 0) return [];
  const dim = vec.length;
  const raw = Number(shiftK) || 0;
  const k = ((raw % dim) + dim) % dim;
  if (k === 0) return [...vec];

  const out = new Array(dim);
  for (let i = 0; i < dim; i++) {
    out[(i + k) % dim] = vec[i];
  }
  return out;
}

export function encodeText(text, dim = 10000, seed = 42) {
  const tokens = tokenize(text);
  if (!tokens.length) return new Array(dim).fill(1);
  const vectors = tokens.map((tok) => tokenVector(tok, dim, seed));
  return bundle(vectors);
}

export function cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[name] = value;
    }
  }
  return args;
}

const isNode = typeof process !== 'undefined' && !!process.versions?.node;
if (isNode && import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv);
  if (!args.text) {
    console.error('Usage: node src/vsa/encoder.mjs --text "..." [--compare "..."] [--dim 10000] [--seed 42] [--no-vector]');
    process.exit(1);
  }
  const dim = args.dim ? Number(args.dim) : 10000;
  const seed = args.seed ? Number(args.seed) : 42;
  const vec = encodeText(args.text, dim, seed);
  const output = { dim, seed };
  if (!args['no-vector']) output.vector = vec;
  if (args.compare) {
    const vec2 = encodeText(args.compare, dim, seed);
    output.similarity = cosine(vec, vec2);
  }
  console.log(JSON.stringify(output, null, 2));
}
