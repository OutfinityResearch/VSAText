/**
 * DS21 - Constraint Satisfaction Accuracy (CSA)
 *
 * Checks AST constraints over their resolved scope (scene/chapter/global).
 */

import { joinScopeText, normalizeString, toLowerId } from './metric-utils.mjs';

function getToneWords(tone) {
  const toneMap = {
    hopeful: ['hope', 'bright', 'future', 'better', 'light', 'promise', 'optimistic'],
    melancholic: ['sad', 'sorrow', 'loss', 'grief', 'longing', 'wistful', 'regret'],
    determination: ['resolve', 'determined', 'unwavering', 'strong', 'push', 'overcome'],
    neutral: ['stated', 'according', 'research', 'data', 'analysis', 'evidence'],
    grounded: ['real', 'practical', 'everyday', 'simple', 'ordinary', 'mundane'],
    dark: ['shadow', 'fear', 'danger', 'threat', 'ominous', 'dread'],
    light: ['joy', 'happy', 'bright', 'sunny', 'cheerful', 'warm'],
    mysterious: ['unknown', 'secret', 'hidden', 'strange', 'enigma', 'puzzle'],
    tense: ['tension', 'pressure', 'urgent', 'critical', 'desperate', 'intense']
  };
  const key = toLowerId(tone);
  return toneMap[key] || (key ? [key] : []);
}

function scopeEntityMentions(world, sceneIds) {
  const out = new Set();
  for (const id of sceneIds || []) {
    const s = world?.scenes?.by_id?.[id];
    if (!s) continue;
    for (const nameLower of s.entityMentions || []) out.add(String(nameLower).toLowerCase());
  }
  return out;
}

function countScopeItems(world, sceneIds, what) {
  const key = toLowerId(what);

  if (!key) return 0;

  if (key.includes('scene')) return (sceneIds || []).length;

  if (key.includes('chapter')) {
    const chapters = new Set();
    for (const id of sceneIds || []) {
      const ch = world?.scenes?.by_id?.[id]?.chapterId;
      if (ch) chapters.add(String(ch));
    }
    return chapters.size;
  }

  const mentions = scopeEntityMentions(world, sceneIds);

  const chars = new Set((world?.entities?.extracted?.characters || []).map(c => toLowerId(c.name)));
  const locs = new Set((world?.entities?.extracted?.locations || []).map(l => toLowerId(l.name)));

  if (key.includes('character')) {
    let count = 0;
    for (const m of mentions) if (chars.has(m)) count++;
    return count;
  }

  if (key.includes('location')) {
    let count = 0;
    for (const m of mentions) if (locs.has(m)) count++;
    return count;
  }

  // Fallback: count distinct entity mentions.
  return mentions.size;
}

function constraintPresence(scopeTextLower, scopeEntitiesLower, target) {
  const t = toLowerId(target);
  if (!t) return false;
  if (scopeEntitiesLower.has(t)) return true;
  return scopeTextLower.includes(t);
}

export const metricCSA = {
  code: 'CSA',
  version: '1.0',
  threshold: 0.98,
  compute(ctx) {
    const world = ctx?.world;
    const constraints = world?.constraints?.items || [];

    if (!constraints.length) {
      return {
        value: 1,
        threshold: 0.98,
        pass: true,
        details: { total: 0, satisfied: 0, violations: [] }
      };
    }

    const results = [];
    let satisfied = 0;

    for (const c of constraints) {
      const sceneIds = Array.isArray(c.sceneIds) ? c.sceneIds : [];
      const scopeText = joinScopeText(world, sceneIds);
      const scopeTextLower = scopeText.toLowerCase();
      const scopeEntitiesLower = scopeEntityMentions(world, sceneIds);

      let ok = true;
      let evidence = null;

      if (c.type === 'requires') {
        ok = constraintPresence(scopeTextLower, scopeEntitiesLower, c.target);
        evidence = { target: normalizeString(c.target) };
      } else if (c.type === 'forbids') {
        ok = !constraintPresence(scopeTextLower, scopeEntitiesLower, c.target);
        evidence = { target: normalizeString(c.target) };
      } else if (c.type === 'must') {
        const action = toLowerId(c.action);
        const target = normalizeString(c.target);
        const targetLower = toLowerId(target);

        if (action === 'introduce' || action === 'include') {
          ok = constraintPresence(scopeTextLower, scopeEntitiesLower, target);
        } else if (action === 'resolve') {
          const resolutionWords = ['resolved', 'solved', 'ended', 'concluded', 'settled', 'peace'];
          ok = constraintPresence(scopeTextLower, scopeEntitiesLower, target) && resolutionWords.some(w => scopeTextLower.includes(w));
        } else {
          ok = false;
          for (const id of sceneIds) {
            const scene = world?.scenes?.by_id?.[id];
            for (const ev of scene?.events || []) {
              if (!ev || !ev.verb) continue;
              if (toLowerId(ev.verb) !== action) continue;
              const subj = toLowerId(ev.subject);
              const objs = (ev.objects || []).map(o => toLowerId(o));
              if (subj === targetLower || objs.includes(targetLower) || scopeTextLower.includes(`${action} ${targetLower}`)) {
                ok = true;
                break;
              }
            }
            if (ok) break;
          }
        }

        evidence = { action, target };
      } else if (c.type === 'tone') {
        const value = normalizeString(c.value);
        const valueLower = toLowerId(value);

        // Explicit tone property in any scene within scope
        ok = false;
        for (const id of sceneIds) {
          const t = world?.scenes?.by_id?.[id]?.properties?.tone;
          if (toLowerId(t) === valueLower) { ok = true; break; }
        }

        // Text analysis fallback
        if (!ok) {
          const words = getToneWords(valueLower);
          if (words.length === 0) ok = true;
          else {
            const matches = words.filter(w => scopeTextLower.includes(w)).length;
            ok = matches >= Math.ceil(words.length * 0.2);
            evidence = { matches, totalWords: words.length, words };
          }
        }
      } else if (c.type === 'max' || c.type === 'min') {
        const actual = countScopeItems(world, sceneIds, c.what);
        const limit = Number(c.count);

        if (!Number.isFinite(limit)) {
          ok = false;
          evidence = { error: 'invalid_limit', what: c.what, limit: c.count };
        } else if (c.type === 'max') {
          ok = actual <= limit;
        } else {
          ok = actual >= limit;
        }

        evidence = { what: c.what, actual, limit };
      }

      if (ok) satisfied++;

      results.push({
        type: c.type,
        subject: c.subject,
        scopeId: c.scopeId,
        sceneIds,
        line: c.line ?? null,
        ok,
        evidence
      });
    }

    const total = constraints.length;
    const value = total > 0 ? satisfied / total : 1;
    const pass = value >= 0.98;

    const violations = results.filter(r => !r.ok).map(r => ({
      type: r.type,
      subject: r.subject,
      scopeId: r.scopeId,
      line: r.line,
      evidence: r.evidence
    }));

    return {
      value,
      threshold: 0.98,
      pass,
      details: {
        satisfied,
        total,
        violations,
        results
      }
    };
  }
};

export default metricCSA;

