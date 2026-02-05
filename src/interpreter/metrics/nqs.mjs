/**
 * DS23 - Narrative Quality Score (NQS, hybrid)
 *
 * NQS = 0.5 * CS + 0.5 * H
 * where H is the normalized human overall rating (1..5 -> 0..1).
 *
 * Pass/fail is suite-relative (>= 25% improvement vs baseline); this metric
 * can optionally evaluate improvement if a baseline is supplied.
 */

function asNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function clamp01(x) {
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(1, x));
}

function getOverallRatings(human) {
  if (!human || typeof human !== 'object') return [];
  const candidates = [
    human.overall_ratings,
    human.overallRatings,
    human.H_OV,
    human.h_ov,
    human.ratings?.overall,
    human.ratings?.H_OV,
    human.overall
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c.map(asNumber).filter(n => n != null);
    const n = asNumber(c);
    if (n != null) return [n];
  }
  return [];
}

export const metricNQS = {
  code: 'NQS',
  version: '1.0',
  dependsOn: ['CS'],
  compute(ctx) {
    const CS = asNumber(ctx?.metrics?.CS?.value);
    if (CS == null) {
      return { value: null, threshold: null, pass: null, details: { status: 'skipped', reason: 'missing_CS' } };
    }

    const ratings = getOverallRatings(ctx?.human);
    if (ratings.length === 0) {
      return { value: null, threshold: null, pass: null, details: { status: 'skipped', reason: 'missing_human_overall_ratings' } };
    }

    const avgRating = ratings.reduce((s, x) => s + x, 0) / ratings.length;
    const H = clamp01((avgRating - 1) / 4);
    const NQS = clamp01(0.5 * CS + 0.5 * (H ?? 0));

    // Optional: compute improvement if baseline NQS is provided.
    const baseline = asNumber(ctx?.options?.baseline_nqs ?? ctx?.options?.baselineNqs ?? null);
    const improvement = baseline && baseline > 0 ? (NQS - baseline) / baseline : null;
    const pass = (improvement == null) ? null : improvement >= 0.25;

    return {
      value: NQS,
      threshold: null,
      pass,
      details: {
        CS,
        human_overall_avg: avgRating,
        H,
        baseline_nqs: baseline,
        improvement
      }
    };
  }
};

export default metricNQS;

