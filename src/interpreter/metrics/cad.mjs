/**
 * DS14 - Character Attribute Drift (CAD)
 *
 * Drift is computed as: drift = 1 - similarity(spec_traits, observed_portrayal)
 * Overall CAD is the average drift across characters.
 */

import { embedText, cosineEmbedding } from './embedding.mjs';
import { average, splitSentences, toLowerId } from './metric-utils.mjs';

function buildSceneWindows(world, windowTokenSize = 10000) {
  const sceneIds = world?.scenes?.ordered_ids || [];
  const byId = world?.scenes?.by_id || {};
  const windows = [];

  let current = { sceneIds: [], texts: [], tokenCount: 0 };

  function flush() {
    if (current.sceneIds.length === 0) return;
    windows.push({
      index: windows.length + 1,
      sceneIds: [...current.sceneIds],
      text: current.texts.join('\n'),
      tokenCount: current.tokenCount
    });
    current = { sceneIds: [], texts: [], tokenCount: 0 };
  }

  for (const id of sceneIds) {
    const s = byId[id];
    if (!s) continue;
    const t = String(s.text || '').trim();
    const tokens = Number(s.tokenCount) || 0;

    if (current.sceneIds.length > 0 && current.tokenCount + tokens > windowTokenSize) flush();

    current.sceneIds.push(id);
    if (t) current.texts.push(t);
    current.tokenCount += tokens;
  }

  flush();

  if (windows.length === 0) {
    return [{
      index: 1,
      sceneIds: sceneIds.length ? [...sceneIds] : [],
      text: String(world?.texts?.document_text || ''),
      tokenCount: Number(world?.texts?.token_count) || 0
    }];
  }

  return windows;
}

function getAliases(character) {
  const aliases = new Set();
  const name = String(character?.name || '').trim();
  if (name) aliases.add(name);

  const props = character?.properties || {};
  const raw = props.aliases ?? props.alias ?? null;
  if (Array.isArray(raw)) {
    for (const a of raw) if (String(a).trim()) aliases.add(String(a).trim());
  } else if (typeof raw === 'string') {
    for (const a of raw.split(',').map(s => s.trim()).filter(Boolean)) aliases.add(a);
  }

  return [...aliases];
}

export const metricCAD = {
  code: 'CAD',
  version: '1.0',
  threshold: 0.15,
  compute(ctx) {
    const world = ctx?.world;
    const chars = world?.entities?.extracted?.characters || [];
    const eligible = chars.filter(c => Array.isArray(c.traits) && c.traits.length > 0);

    if (eligible.length === 0) {
      return {
        value: null,
        threshold: 0.15,
        pass: null,
        details: { status: 'skipped', reason: 'no_characters_with_traits' }
      };
    }

    const windowTokenSize = Number.isFinite(ctx?.options?.cad_window_tokens) ? ctx.options.cad_window_tokens : 10000;
    const windows = buildSceneWindows(world, windowTokenSize);

    if (!windows.length) {
      return {
        value: null,
        threshold: 0.15,
        pass: null,
        details: { status: 'skipped', reason: 'no_text_windows' }
      };
    }

    const perCharacter = [];

    for (const c of eligible) {
      const aliases = getAliases(c).map(a => a.toLowerCase());
      const baselineText = `${c.name} ${c.traits.join(' ')}`.trim();
      const baselineEmb = embedText(baselineText, ctx, {});

      const windowScores = [];

      for (const w of windows) {
        const sentences = splitSentences(w.text).filter(s => {
          const lower = s.toLowerCase();
          return aliases.some(a => a && lower.includes(a));
        });

        if (sentences.length === 0) continue;

        const ctxEmb = embedText(sentences.join('. '), ctx, {});
        const simRaw = cosineEmbedding(baselineEmb, ctxEmb);
        const similarity = Math.max(0, Math.min(1, simRaw)); // DS14 assumes [0,1]
        const drift = 1 - similarity;

        windowScores.push({
          window_index: w.index,
          sceneIds: w.sceneIds,
          similarity,
          drift
        });
      }

      if (windowScores.length === 0) {
        perCharacter.push({
          character: c.name,
          status: 'no_mentions',
          traits: [...c.traits],
          windows_analyzed: 0,
          CAD_char: null,
          worst_windows: []
        });
        continue;
      }

      const cadChar = average(windowScores.map(x => x.drift));
      const worst = [...windowScores].sort((a, b) => b.drift - a.drift).slice(0, 3);

      perCharacter.push({
        character: c.name,
        status: 'ok',
        traits: [...c.traits],
        windows_analyzed: windowScores.length,
        CAD_char: cadChar,
        worst_windows: worst
      });
    }

    const computed = perCharacter.filter(p => Number.isFinite(p.CAD_char));
    if (computed.length === 0) {
      return {
        value: null,
        threshold: 0.15,
        pass: null,
        details: { status: 'skipped', reason: 'no_character_windows' }
      };
    }

    const CAD = average(computed.map(p => p.CAD_char));
    const pass = CAD < 0.15;

    return {
      value: CAD,
      threshold: 0.15,
      pass,
      details: {
        window_token_size: windowTokenSize,
        characters_total: eligible.length,
        characters_computed: computed.length,
        per_character: perCharacter
      }
    };
  }
};

export default metricCAD;

