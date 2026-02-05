/**
 * DS13 - Coherence Score (CS)
 *
 * CS = clamp(0.50*EC + 0.40*CC - 0.30*LVP, 0, 1)
 */

import { clamp01, jaccard, average, toLowerId } from './metric-utils.mjs';

function setIntersection(a, b) {
  const out = new Set();
  for (const x of a || []) if (b.has(x)) out.add(x);
  return out;
}

export const metricCS = {
  code: 'CS',
  version: '1.0',
  threshold: 0.75,
  dependsOn: ['CSA'],
  compute(ctx) {
    const world = ctx?.world;
    const sceneIds = world?.scenes?.ordered_ids || [];

    if (!ctx?.diagnostics?.parse?.valid) {
      return {
        value: 0,
        threshold: 0.75,
        pass: false,
        details: { status: 'parse_invalid' }
      };
    }

    const charSet = new Set((world?.entities?.extracted?.characters || []).map(c => toLowerId(c.name)));
    const locSet = new Set((world?.entities?.extracted?.locations || []).map(l => toLowerId(l.name)));

    function sceneEntitySet(id) {
      const s = world?.scenes?.by_id?.[id];
      const out = new Set();
      for (const m of s?.entityMentions || []) {
        const key = String(m).toLowerCase();
        if (charSet.has(key) || locSet.has(key)) out.add(key);
      }
      for (const c of s?.includes?.characters || []) {
        const key = toLowerId(c);
        if (charSet.has(key)) out.add(key);
      }
      for (const l of s?.includes?.locations || []) {
        const key = toLowerId(l);
        if (locSet.has(key)) out.add(key);
      }
      return out;
    }

    const entitySets = sceneIds.map(id => sceneEntitySet(id));

    // 3.1 Entity Continuity (EC)
    const ecPairs = [];
    for (let i = 0; i < entitySets.length - 1; i++) {
      ecPairs.push(jaccard(entitySets[i], entitySets[i + 1]));
    }
    const EC = entitySets.length <= 1 ? 1 : average(ecPairs);

    // 3.2 Causal Chain (CC)
    const causeVerbs = new Set((ctx?.options?.cause_verbs || ['threatens', 'decides', 'reveals', 'betrays', 'destroys']).map(v => String(v).toLowerCase()));
    const effectVerbs = new Set((ctx?.options?.effect_verbs || ['escapes', 'confronts', 'travels', 'resolves', 'is_defeated_by']).map(v => String(v).toLowerCase()));

    const ccPairs = [];
    const ccDetails = [];

    for (let i = 0; i < sceneIds.length - 1; i++) {
      const aId = sceneIds[i];
      const bId = sceneIds[i + 1];
      const aScene = world?.scenes?.by_id?.[aId];
      const bScene = world?.scenes?.by_id?.[bId];

      const shared = setIntersection(entitySets[i], entitySets[i + 1]);

      let hasCause = false;
      let hasEffect = false;

      for (const ev of aScene?.events || []) {
        const verb = toLowerId(ev?.verb);
        const subj = toLowerId(ev?.subject);
        if (causeVerbs.has(verb) && shared.has(subj)) { hasCause = true; break; }
      }
      for (const ev of bScene?.events || []) {
        const verb = toLowerId(ev?.verb);
        const subj = toLowerId(ev?.subject);
        if (effectVerbs.has(verb) && shared.has(subj)) { hasEffect = true; break; }
      }

      let score = 0;
      if (shared.size > 0 && hasCause && hasEffect) score = 1.0;
      else if (shared.size > 0 && (hasCause || hasEffect)) score = 0.7;
      else if (shared.size > 0) score = 0.4;
      else score = 0.0;

      ccPairs.push(score);
      ccDetails.push({ from: aId, to: bId, shared: [...shared], hasCause, hasEffect, score });
    }

    const CC = sceneIds.length <= 1 ? 1 : average(ccPairs);

    // 3.3 Logic Violation Penalty (LVP)
    const semantic = ctx?.diagnostics?.semantic || { errors: [], warnings: [] };
    const semanticErrors = Array.isArray(semantic.errors) ? semantic.errors.length : 0;
    const locationJumps = Array.isArray(semantic.warnings) ? semantic.warnings.filter(w => w && w.code === 'location_jump').length : 0;

    const csa = ctx?.metrics?.CSA;
    const csaViolations = Array.isArray(csa?.details?.violations) ? csa.details.violations.length : 0;

    const v = semanticErrors + locationJumps + csaViolations;
    const n = Math.max(1, sceneIds.length);
    const LVP = Math.min(1.0, v / n);

    const CS = clamp01(0.50 * EC + 0.40 * CC - 0.30 * LVP);
    const pass = CS > 0.75;

    return {
      value: CS,
      threshold: 0.75,
      pass,
      details: {
        components: {
          EC,
          CC,
          LVP
        },
        weights: { w_ec: 0.50, w_cc: 0.40, w_lvp: 0.30 },
        violations: {
          semantic_errors: semanticErrors,
          location_jumps: locationJumps,
          csa_violations: csaViolations,
          total: v
        },
        pairs: {
          ec: ecPairs,
          cc: ccDetails
        }
      }
    };
  }
};

export default metricCS;

