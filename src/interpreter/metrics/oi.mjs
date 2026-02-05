/**
 * DS16 - Originality Index (OI)
 *
 * OI = 1 - max_similarity_to_any_trope
 */

import { embedText, cosineEmbedding } from './embedding.mjs';
import { clamp01, normalizeString, toLowerId } from './metric-utils.mjs';

function tropeText(entry) {
  if (entry == null) return '';
  if (typeof entry === 'string') return entry;
  if (typeof entry !== 'object') return String(entry);
  return (
    entry.text ??
    entry.description ??
    entry.trope ??
    entry.name ??
    ''
  );
}

function tropeId(entry, fallbackIndex) {
  if (entry == null) return `trope_${fallbackIndex}`;
  if (typeof entry === 'string') return `trope_${fallbackIndex}`;
  if (typeof entry !== 'object') return `trope_${fallbackIndex}`;
  return entry.id ?? entry.key ?? entry.trope ?? entry.name ?? `trope_${fallbackIndex}`;
}

export const metricOI = {
  code: 'OI',
  version: '1.0',
  threshold: 0.8,
  compute(ctx) {
    const tropes = ctx?.corpora?.tropes;
    if (!Array.isArray(tropes) || tropes.length === 0) {
      return {
        value: null,
        threshold: 0.8,
        pass: null,
        details: { status: 'skipped', reason: 'missing_trope_corpus' }
      };
    }

    const storyText = normalizeString(ctx?.world?.texts?.document_text || '');
    if (!storyText) {
      return {
        value: null,
        threshold: 0.8,
        pass: null,
        details: { status: 'skipped', reason: 'missing_story_text' }
      };
    }

    const storyEmb = embedText(storyText, ctx, {});

    let maxSim = 0;
    let best = null;

    for (let i = 0; i < tropes.length; i++) {
      const t = tropeText(tropes[i]);
      const text = normalizeString(t);
      if (!text) continue;

      const emb = embedText(text, ctx, {});
      const simRaw = cosineEmbedding(storyEmb, emb);
      const sim = Math.max(0, Math.min(1, simRaw));

      if (sim >= maxSim) {
        maxSim = sim;
        best = {
          id: String(tropeId(tropes[i], i)),
          similarity: sim,
          preview: text.slice(0, 140)
        };
      }
    }

    const OI = clamp01(1 - maxSim);
    const pass = OI > 0.8;

    return {
      value: OI,
      threshold: 0.8,
      pass,
      details: {
        corpus_size: tropes.length,
        max_similarity: maxSim,
        best_match: best,
        profile: toLowerId(ctx?.profile || '')
      }
    };
  }
};

export default metricOI;

