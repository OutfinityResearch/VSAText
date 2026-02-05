/**
 * DS22 - Explainability Score (XAI)
 *
 * Human-rated metric. Deterministic if the rating dataset is provided as input.
 */

function asNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function clamp(n, lo, hi) {
  if (!Number.isFinite(n)) return null;
  return Math.max(lo, Math.min(hi, n));
}

export const metricXAI = {
  code: 'XAI',
  version: '1.0',
  threshold: 4.0,
  compute(ctx) {
    const sessions = ctx?.human?.xai_sessions ?? ctx?.human?.xaiSessions ?? null;
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return {
        value: null,
        threshold: 4.0,
        pass: null,
        details: { status: 'skipped', reason: 'missing_xai_sessions' }
      };
    }

    const perSession = [];
    const scores = [];

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i] || {};
      const clarity = clamp(asNumber(s.clarity), 1, 5);
      const evidence = clamp(asNumber(s.evidence), 1, 5);
      const actionability = clamp(asNumber(s.actionability), 1, 5);
      const trust = clamp(asNumber(s.trust), 1, 5);

      const dims = [clarity, evidence, actionability, trust].filter(n => Number.isFinite(n));
      if (dims.length < 4) {
        perSession.push({ id: s.id ?? `session_${i + 1}`, status: 'skipped', reason: 'missing_dimensions' });
        continue;
      }

      const score = (clarity + evidence + actionability + trust) / 4;
      scores.push(score);
      perSession.push({
        id: s.id ?? `session_${i + 1}`,
        clarity,
        evidence,
        actionability,
        trust,
        score
      });
    }

    if (scores.length === 0) {
      return {
        value: null,
        threshold: 4.0,
        pass: null,
        details: { status: 'skipped', reason: 'no_valid_sessions', per_session: perSession }
      };
    }

    const XAI = scores.reduce((s, x) => s + x, 0) / scores.length;
    const pass = XAI >= 4.0;

    return {
      value: XAI,
      threshold: 4.0,
      pass,
      details: {
        sessions_total: sessions.length,
        sessions_used: scores.length,
        per_session: perSession
      }
    };
  }
};

export default metricXAI;

