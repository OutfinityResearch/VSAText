/**
 * DS18 - Retrieval Quality (RQ)
 *
 * Interpreter form: compute MRR (and Recall@k) over an optional labeled query set.
 */

import { embedText, cosineEmbedding } from './embedding.mjs';
import { average, normalizeString } from './metric-utils.mjs';

function normalizeQueryEntry(q) {
  if (q == null) return null;
  if (typeof q === 'string') return { query: q, relevant: [] };
  if (typeof q !== 'object') return null;

  const query = q.query ?? q.q ?? q.text ?? '';
  const relevant =
    q.relevant ??
    q.relevant_ids ??
    q.relevantIds ??
    q.answers ??
    q.ground_truth ??
    [];

  const topK = q.topK ?? q.k ?? null;

  return {
    id: q.id ?? null,
    query: normalizeString(query),
    relevant: Array.isArray(relevant) ? relevant.map(String) : [],
    topK: Number.isFinite(Number(topK)) ? Number(topK) : null
  };
}

export const metricRQ = {
  code: 'RQ',
  version: '1.0',
  threshold: 0.6,
  compute(ctx) {
    const queriesRaw = ctx?.corpora?.retrieval_queries ?? ctx?.corpora?.retrievalQueries ?? null;
    if (!Array.isArray(queriesRaw) || queriesRaw.length === 0) {
      return {
        value: null,
        threshold: 0.6,
        pass: null,
        details: { status: 'skipped', reason: 'missing_retrieval_queries' }
      };
    }

    const world = ctx?.world;
    const sceneIds = world?.scenes?.ordered_ids || [];
    if (sceneIds.length === 0) {
      return {
        value: null,
        threshold: 0.6,
        pass: null,
        details: { status: 'skipped', reason: 'no_scenes' }
      };
    }

    const sceneEmbeddings = sceneIds.map(id => {
      const text = world?.scenes?.by_id?.[id]?.text || '';
      return { id, emb: embedText(text, ctx, {}) };
    });

    const perQuery = [];
    const rrList = [];
    const recallList = [];

    const defaultTopK = Number.isFinite(Number(ctx?.options?.rq_top_k)) ? Number(ctx.options.rq_top_k) : 5;

    for (let i = 0; i < queriesRaw.length; i++) {
      const q = normalizeQueryEntry(queriesRaw[i]);
      if (!q || !q.query) continue;

      const relevant = new Set(q.relevant.map(String));
      if (relevant.size === 0) {
        perQuery.push({ id: q.id || `q_${i + 1}`, query: q.query, status: 'skipped', reason: 'no_ground_truth' });
        continue;
      }

      const topK = q.topK || defaultTopK;
      const qEmb = embedText(q.query, ctx, {});

      const scored = sceneEmbeddings.map(s => ({ id: s.id, score: cosineEmbedding(qEmb, s.emb) }));
      scored.sort((a, b) => b.score - a.score);

      const top = scored.slice(0, topK);

      let firstRank = null;
      for (let r = 0; r < scored.length; r++) {
        if (relevant.has(scored[r].id)) { firstRank = r + 1; break; }
      }

      const rr = firstRank ? 1 / firstRank : 0;
      const foundTop = top.filter(x => relevant.has(x.id)).length;
      const recall = foundTop / Math.max(1, relevant.size);

      rrList.push(rr);
      recallList.push(recall);

      perQuery.push({
        id: q.id || `q_${i + 1}`,
        query: q.query,
        topK,
        reciprocal_rank: rr,
        first_relevant_rank: firstRank,
        recall_at_k: recall,
        top_results: top.map(x => ({ id: x.id, score: x.score }))
      });
    }

    if (rrList.length === 0) {
      return {
        value: null,
        threshold: 0.6,
        pass: null,
        details: { status: 'skipped', reason: 'no_labeled_queries' }
      };
    }

    const MRR = average(rrList);
    const recallAtK = average(recallList);
    const pass = MRR > 0.6;

    return {
      value: MRR,
      threshold: 0.6,
      pass,
      details: {
        mrr: MRR,
        recall_at_k_avg: recallAtK,
        labeled_queries: rrList.length,
        total_queries: queriesRaw.length,
        per_query: perQuery
      }
    };
  }
};

export default metricRQ;

