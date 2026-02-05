/**
 * NQS_AUTO (Automated)
 *
 * This is the automated composite score used for fast feedback in the UI.
 * It aligns with DS25's "Integration with NQS" formula, but is computed
 * purely from interpreter-derived signals and other deterministic metrics.
 */

import { extractEntitiesFromAST } from '../../evaluate/extract-entities.mjs';
import { clamp01, toLowerId } from './metric-utils.mjs';

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function safeScore(x, fallback = null) {
  const n = num(x);
  return n == null ? fallback : n;
}

function completenessScore(counts) {
  const hasChars = counts.characters >= 2 ? 1 : counts.characters / 2;
  const hasLocs = counts.locations >= 2 ? 1 : counts.locations / 2;
  const hasStructure = counts.scenes >= 3 ? 1 : counts.scenes / 3;
  const hasThemes = counts.themes >= 1 ? 1 : 0;
  const hasDialogues = counts.dialogues >= 2 ? 1 : counts.dialogues / 2;
  const hasRels = counts.relationships >= 2 ? 1 : counts.relationships / 2;

  return clamp01(
    hasChars * 0.20 +
    hasLocs * 0.15 +
    hasStructure * 0.25 +
    hasThemes * 0.10 +
    hasDialogues * 0.15 +
    hasRels * 0.15
  );
}

function explainabilityScore(entities, arcName) {
  let score = 0;
  if (arcName) score += 0.15;
  if ((entities.themes || []).length > 0) score += 0.15;
  if ((entities.relationships || []).length > 0) score += 0.15;
  if ((entities.world_rules || []).length > 0) score += 0.15;
  if ((entities.moods || []).length >= 3) score += 0.15;
  if ((entities.wisdom || []).length > 0) score += 0.15;
  if ((entities.patterns || []).length > 0) score += 0.10;
  return clamp01(score);
}

function computeAppearances(world, idsLower) {
  const sceneIds = world?.scenes?.ordered_ids || [];
  const byId = world?.scenes?.by_id || {};

  const counts = new Map();
  for (const id of idsLower) counts.set(id, 0);

  for (const sceneId of sceneIds) {
    const s = byId[sceneId];
    const mentions = s?.entityMentions || new Set();
    for (const idLower of idsLower) {
      if (mentions.has(idLower)) counts.set(idLower, (counts.get(idLower) || 0) + 1);
    }
  }

  return { sceneCount: sceneIds.length, counts };
}

function charContinuityScore(world, entities) {
  const chars = (entities.characters || []).map(c => toLowerId(c.id || c.name));
  if (chars.length === 0) return 0;

  const { sceneCount, counts } = computeAppearances(world, chars);
  const charsInMultiple = [...counts.values()].filter(x => x >= 2).length;

  // Hero presence: protagonist/hero if present, else first character.
  const hero = (entities.characters || []).find(c => ['protagonist', 'hero'].includes(toLowerId(c.archetype))) || entities.characters?.[0] || null;
  const heroId = hero ? toLowerId(hero.id || hero.name) : null;
  const heroAppearances = heroId ? (counts.get(heroId) || 0) : 0;
  const heroPresence = sceneCount > 0 ? heroAppearances / sceneCount : 0;

  return clamp01((charsInMultiple / chars.length) * 0.5 + Math.min(1, heroPresence) * 0.5);
}

function locLogicScore(world, entities) {
  const locs = (entities.locations || []).map(l => toLowerId(l.id || l.name));
  if (locs.length === 0) return 0;

  const { sceneCount, counts } = computeAppearances(world, locs);
  const locsReused = [...counts.values()].filter(x => x >= 2).length;

  const sumUsage = [...counts.values()].reduce((s, x) => s + x, 0);
  const avgLocUsage = sumUsage / Math.max(1, locs.length);
  const expectedUsage = Math.max(3, sceneCount / 3);

  return clamp01(Math.min(1,
    (locsReused / locs.length) * 0.5 +
    (avgLocUsage / Math.max(1, expectedUsage)) * 0.5
  ));
}

function actionCoherenceScore(world, entities) {
  const knownChars = new Set((entities.characters || []).map(c => toLowerId(c.id || c.name)));
  const knownLocs = new Set((entities.locations || []).map(l => toLowerId(l.id || l.name)));
  const knownObjs = new Set((entities.objects || []).map(o => toLowerId(o.id || o.name)));

  const sceneIds = world?.scenes?.ordered_ids || [];
  const byId = world?.scenes?.by_id || {};

  let total = 0;
  let valid = 0;

  function looksLikeEntityId(token) {
    const t = String(token || '').trim();
    if (!t) return false;
    if (/\s/.test(t)) return false;
    if (/^\d+$/.test(t)) return false;
    return /^[A-Z]/.test(t) || /[A-Za-z]*\d/.test(t);
  }

  for (const sceneId of sceneIds) {
    const scene = byId[sceneId];
    for (const ev of scene?.events || []) {
      total++;
      const subj = toLowerId(ev?.subject);
      const obj0 = ev?.objects?.[0];
      const objLower = toLowerId(obj0);

      const subjOk = knownChars.has(subj);
      let objOk = true;

      if (obj0 != null && String(obj0).trim()) {
        objOk = knownChars.has(objLower) || knownLocs.has(objLower) || knownObjs.has(objLower) || !looksLikeEntityId(obj0);
      }

      if (subjOk && objOk) valid++;
    }
  }

  if (total === 0) return 1;
  return clamp01(valid / total);
}

function sceneCompletenessScore(world, entities) {
  const knownChars = new Set((entities.characters || []).map(c => toLowerId(c.id || c.name)));
  const knownLocs = new Set((entities.locations || []).map(l => toLowerId(l.id || l.name)));

  const sceneIds = world?.scenes?.ordered_ids || [];
  const byId = world?.scenes?.by_id || {};

  if (sceneIds.length === 0) return 0;

  let complete = 0;

  for (const id of sceneIds) {
    const s = byId[id];
    const mentions = s?.entityMentions || new Set();
    const hasChar = [...mentions].some(x => knownChars.has(String(x)));
    const hasLoc = [...mentions].some(x => knownLocs.has(String(x)));
    const hasAction = (s?.events || []).length > 0;
    if (hasChar && hasLoc && hasAction) complete++;
  }

  return clamp01(complete / sceneIds.length);
}

export const metricNqsAuto = {
  code: 'NQS_AUTO',
  version: '1.0',
  dependsOn: ['CS', 'CAD', 'OI', 'EAP', 'CPSR', 'CSA', 'CAR'],
  compute(ctx) {
    const ast = ctx?._ast || ctx?.ast || {};
    const world = ctx?.world;
    const rawEntities = ast?.entities || {};
    const entities = extractEntitiesFromAST(rawEntities, ast);

    const counts = {
      characters: (entities.characters || []).length,
      locations: (entities.locations || []).length,
      scenes: (world?.scenes?.count || 0),
      themes: (entities.themes || []).length,
      dialogues: (entities.dialogues || []).length,
      relationships: (entities.relationships || []).length
    };

    const completeness = completenessScore(counts);
    const arcName = ast?.blueprint?.arc || null;
    const explainability = explainabilityScore(entities, arcName);
    const charContinuity = charContinuityScore(world, entities);
    const locLogic = locLogicScore(world, entities);
    const actionCoherence = actionCoherenceScore(world, entities);
    const sceneCompleteness = sceneCompletenessScore(world, entities);

    const cs = safeScore(ctx?.metrics?.CS?.value, null);
    const cad = safeScore(ctx?.metrics?.CAD?.value, null);
    const oi = safeScore(ctx?.metrics?.OI?.value, null);
    const eap = safeScore(ctx?.metrics?.EAP?.value, null);
    const cpsr = safeScore(ctx?.metrics?.CPSR?.value, null);
    const csa = safeScore(ctx?.metrics?.CSA?.value, null);

    const cadQuality = (cad == null) ? null : clamp01(1 - Math.min(1, cad * 4));

    const components = {
      completeness,
      cs,
      cad_quality: cadQuality,
      oi,
      eap,
      cpsr,
      csa,
      explainability,
      charContinuity,
      locLogic,
      actionCoherence,
      sceneCompleteness
    };

    const weights = {
      completeness: 0.12,
      cs: 0.12,
      cad_quality: 0.08,
      oi: 0.08,
      eap: 0.10,
      cpsr: 0.08,
      csa: 0.08,
      explainability: 0.08,
      charContinuity: 0.08,
      locLogic: 0.06,
      actionCoherence: 0.06,
      sceneCompleteness: 0.06
    };

    const used = [];
    let sumW = 0;
    let sum = 0;

    for (const [k, w] of Object.entries(weights)) {
      const v = components[k];
      if (!Number.isFinite(v)) continue;
      used.push(k);
      sumW += w;
      sum += v * w;
    }

    if (!sumW) {
      return {
        value: null,
        threshold: 0.70,
        pass: null,
        details: { status: 'skipped', reason: 'no_components', components }
      };
    }

    const score = clamp01(sum / sumW);
    const pass = score >= 0.70;

    const missing = Object.keys(weights).filter(k => !used.includes(k));

    return {
      value: score,
      threshold: 0.70,
      pass,
      details: {
        score,
        used_components: used,
        missing_components: missing,
        weights,
        components,
        counts
      }
    };
  }
};

export default metricNqsAuto;

