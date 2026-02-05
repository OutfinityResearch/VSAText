/**
 * SCRIPTA SDK - CNL Scene Slicer
 *
 * Derives scene-level CNL snippets and per-scene rosters from a full CNL spec.
 * Portable (browser + Node.js).
 *
 * Why:
 * - Streaming NL generation needs per-scene (or per-chapter) CNL, not just the full spec.
 * - A compact per-scene snippet reduces model degrees of freedom and improves adherence.
 */

import { parseCNL, extractEntities } from '../cnl-parser/cnl-parser.mjs';

function stripDiacritics(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function toComparable(text) {
  return stripDiacritics(text).toLowerCase();
}

function countGroupDescendants(group) {
  let count = 0;
  for (const child of group?.children || []) {
    count += 1 + countGroupDescendants(child);
  }
  return count;
}

function pickStructureRoot(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return null;
  if (groups.length === 1) return groups[0];

  const book = groups.find(g => String(g?.name || '').toLowerCase() === 'book');
  if (book) return book;

  let best = groups[0];
  let bestScore = countGroupDescendants(best);
  for (const g of groups.slice(1)) {
    const score = countGroupDescendants(g);
    if (score > bestScore) {
      best = g;
      bestScore = score;
    }
  }
  return best;
}

function sliceLines(lines, startLine, endLine) {
  const start = Math.max(1, Number(startLine) || 1);
  const end = Math.max(start, Number(endLine) || start);
  const safeEnd = Math.min(end, lines.length);
  return lines.slice(start - 1, safeEnd).join('\n').trim();
}

function uniquePreserveOrder(items) {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    const key = toComparable(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function looksLikeChapterName(name) {
  const n = String(name || '');
  return /^ch\d+$/i.test(n);
}

function looksLikeSceneName(name) {
  const n = String(name || '');
  return /^sc\d+(?:\.\d+)?$/i.test(n);
}

function getGroupTitle(group, fallback) {
  const title = group?.properties?.title;
  if (title && String(title).trim()) return String(title).trim();
  return fallback;
}

function getStatementValues(statement) {
  const values = [];
  if (!statement || statement.type !== 'statement') return values;
  values.push(statement.subject);
  for (const o of statement.objects || []) values.push(o);
  for (const v of Object.values(statement.modifiers || {})) values.push(v);
  return values.filter(v => typeof v === 'string' && v.trim());
}

function buildDeclaredNameMaps({ declaredCharacters, declaredLocations, declaredObjects, declaredThemes }) {
  const maps = {
    character: new Map(),
    location: new Map(),
    object: new Map(),
    theme: new Map()
  };

  for (const name of declaredCharacters || []) maps.character.set(toComparable(name), name);
  for (const name of declaredLocations || []) maps.location.set(toComparable(name), name);
  for (const name of declaredObjects || []) maps.object.set(toComparable(name), name);
  for (const name of declaredThemes || []) maps.theme.set(toComparable(name), name);

  return maps;
}

function extractIncludes(group, kind) {
  const out = [];
  for (const st of group?.statements || []) {
    if (st?.type !== 'statement') continue;
    if (String(st.verb || '').toLowerCase() !== 'includes') continue;
    const first = String(st.objects?.[0] || '').toLowerCase();
    if (first !== kind) continue;
    const name = st.objects?.[1];
    if (typeof name === 'string' && name.trim()) out.push(name.trim());
  }
  return uniquePreserveOrder(out);
}

function expandRosterFromStatements(group, declaredMaps, roster) {
  const allowedCharacters = new Map((roster.allowedCharacters || []).map(n => [toComparable(n), n]));
  const allowedLocations = new Map((roster.allowedLocations || []).map(n => [toComparable(n), n]));
  const allowedObjects = new Map((roster.allowedObjects || []).map(n => [toComparable(n), n]));

  for (const st of group?.statements || []) {
    for (const raw of getStatementValues(st)) {
      const key = toComparable(raw);
      if (!key) continue;

      const c = declaredMaps.character.get(key);
      if (c && !allowedCharacters.has(key)) allowedCharacters.set(key, c);

      const l = declaredMaps.location.get(key);
      if (l && !allowedLocations.has(key)) allowedLocations.set(key, l);

      const o = declaredMaps.object.get(key);
      if (o && !allowedObjects.has(key)) allowedObjects.set(key, o);
    }
  }

  return {
    allowedCharacters: Array.from(allowedCharacters.values()),
    allowedLocations: Array.from(allowedLocations.values()),
    allowedObjects: Array.from(allowedObjects.values())
  };
}

/**
 * Slice a full CNL document into scene objects suitable for streaming NL generation.
 *
 * @param {string} cnl - Full CNL text
 * @returns {object} result
 * @returns {Array<object>} result.scenes - Scene definitions
 * @returns {object} result.parse - parseCNL result (valid/errors/warnings)
 */
export function sliceCnlToScenes(cnl) {
  const text = String(cnl || '');
  const lines = text.split(/\r?\n/);
  const parse = parseCNL(text);

  const { characters, locations, objects, themes } = extractEntities(parse.ast || {});
  const declaredCharacters = (characters || []).map(c => c.name);
  const declaredLocations = (locations || []).map(l => l.name);
  const declaredObjects = (objects || []).map(o => o.name);
  const declaredThemes = (themes || []).map(t => t.name);

  const declaredMaps = buildDeclaredNameMaps({
    declaredCharacters,
    declaredLocations,
    declaredObjects,
    declaredThemes
  });

  const declaredEntityNames = uniquePreserveOrder([
    ...declaredCharacters,
    ...declaredLocations,
    ...declaredObjects,
    ...declaredThemes
  ]);

  const root = pickStructureRoot(parse.ast?.groups || []);
  if (!root) {
    return { scenes: [], parse };
  }

  let chapterGroups = [];
  const children = root.children || [];

  const hasChapterLike = children.some(g => looksLikeChapterName(g?.name));
  const allSceneLike = children.length > 0 && children.every(g => looksLikeSceneName(g?.name));
  const anyHasChildren = children.some(g => (g?.children || []).length > 0);

  if (hasChapterLike || (anyHasChildren && !allSceneLike)) {
    chapterGroups = children;
  } else if (children.length > 0) {
    // Scenes directly under root ("Book -> Sc1, Sc2, ...")
    chapterGroups = [{
      name: root.name,
      properties: root.properties || {},
      children: children
    }];
  } else {
    // Root has no children; treat it as a single scene under a pseudo chapter.
    chapterGroups = [{
      name: 'Chapter1',
      properties: {},
      children: [root]
    }];
  }

  const scenes = [];

  for (let chIndex = 0; chIndex < chapterGroups.length; chIndex++) {
    const chapterGroup = chapterGroups[chIndex];
    const chapterNumber = chIndex + 1;
    const chapterTitle = getGroupTitle(
      chapterGroup,
      looksLikeChapterName(chapterGroup?.name)
        ? String(chapterGroup?.name || `Chapter ${chapterNumber}`)
        : `Chapter ${chapterNumber}`
    );

    const sceneGroups = chapterGroup.children || [];
    for (let scIndex = 0; scIndex < sceneGroups.length; scIndex++) {
      const sceneGroup = sceneGroups[scIndex];
      const sceneNumber = scIndex + 1;

      const sceneTitle = getGroupTitle(
        sceneGroup,
        looksLikeSceneName(sceneGroup?.name)
          ? String(sceneGroup?.name || `Scene ${chapterNumber}.${sceneNumber}`)
          : `Scene ${chapterNumber}.${sceneNumber}`
      );

      const startLine = sceneGroup.startLine || 1;
      const endLine = sceneGroup.endLine || lines.length;
      const sceneCnl = sliceLines(lines, startLine, endLine);

      const rosterBase = {
        allowedCharacters: extractIncludes(sceneGroup, 'character'),
        allowedLocations: extractIncludes(sceneGroup, 'location'),
        allowedMoods: extractIncludes(sceneGroup, 'mood'),
        allowedObjects: extractIncludes(sceneGroup, 'object')
      };

      const rosterExpanded = expandRosterFromStatements(sceneGroup, declaredMaps, rosterBase);

      const allowedCharacters = rosterExpanded.allowedCharacters;
      const allowedLocations = rosterExpanded.allowedLocations.length
        ? rosterExpanded.allowedLocations
        : rosterBase.allowedLocations;
      const allowedObjects = rosterExpanded.allowedObjects.length
        ? rosterExpanded.allowedObjects
        : rosterBase.allowedObjects;

      const allowedMoods = rosterBase.allowedMoods;

      const location = allowedLocations[0] || '';
      const mood = allowedMoods[0] || '';

      scenes.push({
        chapterNumber,
        chapterTitle,
        sceneNumber,
        title: sceneTitle,
        cnl: sceneCnl,
        characters: allowedCharacters.join(', '),
        location,
        mood,
        allowedCharacters,
        allowedLocations,
        allowedMoods,
        allowedObjects,
        declaredCharacters,
        declaredLocations,
        declaredObjects,
        declaredEntityNames
      });
    }
  }

  return { scenes, parse };
}

export default { sliceCnlToScenes };

