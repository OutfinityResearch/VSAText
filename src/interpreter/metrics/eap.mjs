/**
 * DS17 - Emotional Arc Profile (EAP)
 *
 * - Compute scene valence from explicit moods (preferred) or text sentiment (fallback)
 * - Compare measured arc with target template using Pearson correlation (r)
 * - Report EAP normalized to [0,1]: EAP = (r + 1) / 2
 */

import { EMOTIONS, MOOD_PRESETS } from '../../vocabularies/vocabularies.mjs';
import { average, clamp01, normalizeString, toLowerId } from './metric-utils.mjs';

function emotionValence01(emotionKey) {
  const e = EMOTIONS?.[emotionKey];
  const v = String(e?.valence || '').toLowerCase();
  if (v === 'positive') return 1.0;
  if (v === 'negative') return 0.0;
  return 0.5;
}

function valenceFromEmotions(emotionsObj) {
  if (!emotionsObj || typeof emotionsObj !== 'object') return null;
  let sumW = 0;
  let sum = 0;
  for (const [k, rawW] of Object.entries(emotionsObj)) {
    const key = String(k).toLowerCase();
    const w = Number.isFinite(Number(rawW)) ? Number(rawW) : 1;
    if (w <= 0) continue;
    sumW += w;
    sum += emotionValence01(key) * w;
  }
  if (!sumW) return null;
  return clamp01(sum / sumW);
}

function moodPresetByLabel(label) {
  const target = toLowerId(label);
  for (const [k, v] of Object.entries(MOOD_PRESETS || {})) {
    if (toLowerId(v?.label) === target) return { key: k, preset: v };
  }
  return null;
}

function sceneValence(scene, ast) {
  const moodRaw = scene?.properties?.mood;
  const moodId = normalizeString(moodRaw);

  if (moodId) {
    const key = toLowerId(moodId);

    // 1) Mood preset key
    if (MOOD_PRESETS?.[key]?.emotions) {
      const v = valenceFromEmotions(MOOD_PRESETS[key].emotions);
      if (v != null) return { valence: v, source: { kind: 'preset', id: key } };
    }

    // 2) Mood preset label
    const byLabel = moodPresetByLabel(moodId);
    if (byLabel?.preset?.emotions) {
      const v = valenceFromEmotions(byLabel.preset.emotions);
      if (v != null) return { valence: v, source: { kind: 'preset_label', id: byLabel.key } };
    }

    // 3) Mood entity with explicit emotion intensities
    const ent = ast?.entities?.[moodId];
    const entType = toLowerId(ent?.type || '');
    const emotions = ent?.properties?.emotions;
    if (ent && entType === 'mood' && emotions && typeof emotions === 'object') {
      const v = valenceFromEmotions(emotions);
      if (v != null) return { valence: v, source: { kind: 'mood_entity', id: moodId } };
    }

    // 4) Emotion key as shorthand
    if (EMOTIONS?.[key]) {
      return { valence: emotionValence01(key), source: { kind: 'emotion', id: key } };
    }
  }

  return null;
}

function sentimentValence01(text) {
  const lower = String(text ?? '').toLowerCase();
  if (!lower.trim()) return 0.5;

  const positive = ['happy', 'joy', 'hope', 'love', 'bright', 'success', 'win', 'triumph', 'peace', 'warm'];
  const negative = ['sad', 'fear', 'dark', 'loss', 'fail', 'pain', 'death', 'cold', 'angry', 'hate'];

  let pos = 0;
  let neg = 0;

  for (const w of positive) pos += (lower.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
  for (const w of negative) neg += (lower.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;

  const denom = Math.max(1, pos + neg);
  const raw = (pos - neg) / denom; // [-1,1]
  return clamp01((raw + 1) / 2);
}

function resample(values, n) {
  const arr = (values || []).map(x => (Number.isFinite(x) ? x : 0.5));
  if (arr.length === 0) return new Array(n).fill(0.5);
  if (arr.length === n) return [...arr];

  if (arr.length > n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const start = Math.floor(i * arr.length / n);
      const end = Math.floor((i + 1) * arr.length / n);
      const slice = arr.slice(start, Math.max(start + 1, end));
      out.push(average(slice));
    }
    return out;
  }

  // Linear interpolation upsampling
  const out = [];
  const last = arr.length - 1;
  for (let i = 0; i < n; i++) {
    const pos = (n === 1) ? 0 : (i * last) / (n - 1);
    const a = Math.floor(pos);
    const b = Math.min(last, a + 1);
    const t = pos - a;
    out.push(arr[a] * (1 - t) + arr[b] * t);
  }
  return out;
}

function pearson(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
  const n = a.length;
  const meanA = a.reduce((s, x) => s + x, 0) / n;
  const meanB = b.reduce((s, x) => s + x, 0) / n;

  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (!varA || !varB) return 0;
  return cov / Math.sqrt(varA * varB);
}

const ARC_TEMPLATES = {
  // 10-point templates in [0,1]
  man_in_a_hole: [0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.35, 0.5, 0.7, 0.8],
  tragedy: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2],
  rags_to_riches: [0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8],
  steady_fall: [0.8, 0.75, 0.7, 0.6, 0.55, 0.5, 0.4, 0.35, 0.3, 0.2],

  // Aliases used by legacy code / UI
  fall_rise: [0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.35, 0.5, 0.7, 0.8],
  rise_fall: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2],
  steady_rise: [0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8]
};

export const metricEAP = {
  code: 'EAP',
  version: '1.0',
  threshold: 0.85, // equivalent to correlation r > 0.7
  compute(ctx) {
    const world = ctx?.world;
    const ast = ctx?._ast || ctx?.ast || {};
    const sceneIds = world?.scenes?.ordered_ids || [];

    if (!sceneIds.length) {
      return { value: null, threshold: 0.85, pass: null, details: { status: 'skipped', reason: 'no_scenes' } };
    }

    const rawTarget =
      ctx?.options?.target_arc ??
      ctx?.options?.targetArc ??
      null;

    const targetKey = rawTarget ? toLowerId(rawTarget) : 'man_in_a_hole';
    const target = Array.isArray(rawTarget) ? rawTarget.map(Number) : (ARC_TEMPLATES[targetKey] || ARC_TEMPLATES.man_in_a_hole);

    const measured = [];
    const sources = [];

    for (const id of sceneIds) {
      const scene = world?.scenes?.by_id?.[id];
      const mood = sceneValence(scene, ast);
      if (mood) {
        measured.push(mood.valence);
        sources.push({ sceneId: id, ...mood.source });
      } else {
        const val = sentimentValence01(scene?.text || '');
        measured.push(val);
        sources.push({ sceneId: id, kind: 'sentiment' });
      }
    }

    const n = 10;
    const targetN = resample(target, n);
    const measuredN = resample(measured, n);
    const r = pearson(targetN, measuredN);
    const EAP = clamp01((r + 1) / 2);

    const pass = r > 0.7;

    return {
      value: EAP,
      threshold: 0.85,
      pass,
      details: {
        correlation_r: r,
        correlation_threshold: 0.7,
        template: Array.isArray(rawTarget) ? 'custom_array' : targetKey,
        measured_scene_valence: measured.map((v, i) => ({ sceneId: sceneIds[i], valence: v, source: sources[i] })),
        resampled: { target: targetN, measured: measuredN }
      }
    };
  }
};

export default metricEAP;
