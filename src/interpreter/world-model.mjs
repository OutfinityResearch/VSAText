/**
 * Metrics Interpreter - World Model Builder (DS12)
 *
 * Builds a deterministic, metric-friendly "world" derived from the CNL AST:
 * - entity registry
 * - ordered scenes (timeline)
 * - per-scene events, references, and canonical text
 * - constraints resolved to scene scopes
 */

import { extractEntities, extractConstraints, extractOwnership } from '../cnl-parser/cnl-parser.mjs';

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function normalizeString(x) {
  return String(x ?? '').trim();
}

function isSceneName(name) {
  const s = normalizeString(name);
  if (!s) return false;
  // Supports: Scene1, "Scene 1.1", Sc1.1, Ch1.Sc2, Book1.Ch2.Scene3
  return /(^|[.\s])(?:sc|scene)\s*\d+(?:\.\d+)*$/i.test(s);
}

function isChapterName(name) {
  const s = normalizeString(name);
  if (!s) return false;
  return /(^|[.\s])(?:ch|chapter)\s*\d+(?:\.\d+)*$/i.test(s);
}

function groupTypeOf(group) {
  const t = normalizeString(group?.properties?.type).toLowerCase();
  return t || null;
}

function isSceneGroup(group) {
  const t = groupTypeOf(group);
  if (t === 'scene') return true;
  return isSceneName(group?.name);
}

function isChapterGroup(group) {
  const t = groupTypeOf(group);
  if (t === 'chapter') return true;
  return isChapterName(group?.name);
}

function collectStatements(group, shouldStopAt) {
  const out = [];
  (function walk(g) {
    if (!g) return;
    for (const s of g.statements || []) out.push(s);
    for (const child of g.children || []) {
      if (shouldStopAt && shouldStopAt(child)) continue;
      walk(child);
    }
  })(group);
  return out;
}

function statementToEvent(statement) {
  return {
    line: statement.line,
    subject: statement.subject,
    verb: statement.verb,
    objects: Array.isArray(statement.objects) ? [...statement.objects] : [],
    modifiers: statement.modifiers ? { ...statement.modifiers } : {}
  };
}

function synthesizeEventSentence(ev) {
  const parts = [];
  if (ev.subject) parts.push(ev.subject);
  if (ev.verb) parts.push(ev.verb);
  for (const o of ev.objects || []) parts.push(String(o));
  const mods = ev.modifiers && typeof ev.modifiers === 'object' ? ev.modifiers : {};
  for (const [k, v] of Object.entries(mods)) {
    if (!v) continue;
    parts.push(`${k} ${v}`);
  }
  const sentence = parts.join(' ').trim();
  return sentence ? sentence + '.' : '';
}

function countTokens(text) {
  const s = String(text ?? '').trim();
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
}

function computeSceneEntityMentions(scene, entityNamesLower) {
  const mentioned = new Set();

  function consider(value) {
    const v = normalizeString(value);
    if (!v) return;
    const key = v.toLowerCase();
    if (entityNamesLower.has(key)) mentioned.add(key);
  }

  for (const inc of scene.includes?.all || []) consider(inc);

  for (const ev of scene.events || []) {
    consider(ev.subject);
    for (const o of ev.objects || []) consider(o);
    for (const v of Object.values(ev.modifiers || {})) consider(v);
  }

  // Also scan description text for literal entity names (best effort).
  const text = normalizeString(scene.text || '');
  if (text) {
    const lower = text.toLowerCase();
    for (const nameLower of entityNamesLower) {
      if (lower.includes(nameLower)) mentioned.add(nameLower);
    }
  }

  return mentioned;
}

function indexGroups(groups) {
  const byName = new Map();
  const roots = [];

  function walk(group, parentName, path) {
    if (!group || !group.name) return;
    const entry = {
      name: group.name,
      group,
      parentName: parentName || null,
      path: [...path, group.name],
      isScene: isSceneGroup(group),
      isChapter: isChapterGroup(group)
    };
    byName.set(group.name, entry);
    for (const child of group.children || []) walk(child, group.name, entry.path);
  }

  for (const g of groups || []) {
    roots.push(g);
    walk(g, null, []);
  }

  return { byName, roots };
}

function resolveScopeGroupId(constraint, groupIndex) {
  const subject = normalizeString(constraint?.subject);
  const scope = normalizeString(constraint?.scope);

  if (subject && groupIndex.byName.has(subject)) return subject;
  if (scope && groupIndex.byName.has(scope)) return scope;

  // Common global subjects
  if (subject && ['story', 'world', 'book', 'document'].includes(subject.toLowerCase())) return 'global';
  if (scope && ['global'].includes(scope.toLowerCase())) return 'global';

  return 'global';
}

function scenesUnderScope(scopeId, groupIndex, sceneIdsInOrder) {
  if (!scopeId || scopeId === 'global') return [...sceneIdsInOrder];

  const entry = groupIndex.byName.get(scopeId);
  if (!entry) return [...sceneIdsInOrder];

  const prefix = entry.path;
  const out = [];
  for (const id of sceneIdsInOrder) {
    const sEntry = groupIndex.byName.get(id);
    if (!sEntry) continue;
    const sPath = sEntry.path;
    let ok = prefix.length <= sPath.length;
    for (let i = 0; ok && i < prefix.length; i++) ok = sPath[i] === prefix[i];
    if (ok) out.push(id);
  }
  return out;
}

export function buildWorldModel(ast, options = {}) {
  const entities = extractEntities(ast || {});
  const constraintsRaw = extractConstraints(ast || {});
  const ownership = extractOwnership(ast || {});

  const groupIndex = indexGroups(ast?.groups || []);

  const entityById = {};
  const entityTypes = {};
  const entityNamesLower = new Set();

  for (const [name, ent] of Object.entries(ast?.entities || {})) {
    if (!name) continue;
    entityById[name] = {
      id: name,
      name,
      type: ent?.type || 'unknown',
      types: Array.isArray(ent?.types) ? [...ent.types] : [ent?.type || 'unknown'],
      traits: Array.isArray(ent?.traits) ? [...ent.traits] : [],
      properties: ent?.properties && typeof ent.properties === 'object' ? { ...ent.properties } : {},
      relationships: Array.isArray(ent?.relationships) ? [...ent.relationships] : [],
      line: ent?.line ?? null
    };
    const t = String(ent?.type || 'unknown').toLowerCase();
    entityTypes[t] = (entityTypes[t] || 0) + 1;
    entityNamesLower.add(String(name).toLowerCase());
  }

  const scenesById = {};
  const orderedSceneIds = [];

  function walkGroups(groups, path = [], parentChapterId = null) {
    for (const g of groups || []) {
      const chapterId = isChapterGroup(g) ? g.name : parentChapterId;

      if (isSceneGroup(g)) {
        const statements = collectStatements(g, (child) => isSceneGroup(child));
        const metaVerbs = new Set(['is', 'has', 'group', 'includes', 'requires', 'forbids', 'must', 'owns', 'relates', 'references', 'describes']);

        const includes = {
          characters: [],
          locations: [],
          objects: [],
          blocks: [],
          other: [],
          all: []
        };

        const descriptions = [];
        const events = [];

        for (const s of statements) {
          if (!s || s.type !== 'statement') continue;
          if (s.verb === 'includes' && Array.isArray(s.objects) && s.objects.length >= 2) {
            const refType = String(s.objects[0]).toLowerCase();
            const refId = String(s.objects[1]);
            includes.all.push(refId);
            if (refType === 'character') includes.characters.push(refId);
            else if (refType === 'location') includes.locations.push(refId);
            else if (['object', 'artifact', 'item'].includes(refType)) includes.objects.push(refId);
            else if (refType === 'block') includes.blocks.push(refId);
            else includes.other.push(refId);
            continue;
          }

          if (s.verb === 'describes' && Array.isArray(s.objects) && s.objects.length >= 1) {
            const text = String(s.objects[0] ?? '').trim();
            if (text) descriptions.push({ line: s.line, subject: s.subject, text });
            continue;
          }

          if (!metaVerbs.has(String(s.verb || '').toLowerCase())) {
            events.push(statementToEvent(s));
          }
        }

        const describedText = descriptions.map(d => d.text).join('\n').trim();
        const synthesizedText = describedText ? '' : events.map(synthesizeEventSentence).filter(Boolean).join(' ').trim();
        const text = describedText || synthesizedText;

        const scene = {
          id: g.name,
          name: g.name,
          path: [...path, g.name],
          chapterId,
          properties: g.properties && typeof g.properties === 'object' ? { ...g.properties } : {},
          includes,
          descriptions,
          events,
          text,
          tokenCount: countTokens(text)
        };

        scene.entityMentions = computeSceneEntityMentions(scene, entityNamesLower);

        scenesById[scene.id] = scene;
        orderedSceneIds.push(scene.id);
      }

      walkGroups(g.children, [...path, g.name], chapterId);
    }
  }

  walkGroups(ast?.groups || [], [], null);

  // Fallback: treat document as one implicit scene if none are found.
  if (orderedSceneIds.length === 0) {
    const metaVerbs = new Set(['is', 'has', 'group', 'includes', 'requires', 'forbids', 'must', 'owns', 'relates', 'references', 'describes']);
    const events = [];
    const descriptions = [];

    for (const s of ast?.statements || []) {
      if (!s || s.type !== 'statement') continue;
      if (s.verb === 'describes' && Array.isArray(s.objects) && s.objects.length >= 1) {
        const text = String(s.objects[0] ?? '').trim();
        if (text) descriptions.push({ line: s.line, subject: s.subject, text });
        continue;
      }
      if (!metaVerbs.has(String(s.verb || '').toLowerCase())) events.push(statementToEvent(s));
    }

    const describedText = descriptions.map(d => d.text).join('\n').trim();
    const synthesizedText = describedText ? '' : events.map(synthesizeEventSentence).filter(Boolean).join(' ').trim();
    const text = describedText || synthesizedText;

    const scene = {
      id: 'Document',
      name: 'Document',
      path: ['Document'],
      chapterId: null,
      properties: {},
      includes: { characters: [], locations: [], objects: [], blocks: [], other: [], all: [] },
      descriptions,
      events,
      text,
      tokenCount: countTokens(text)
    };
    scene.entityMentions = computeSceneEntityMentions(scene, entityNamesLower);

    scenesById[scene.id] = scene;
    orderedSceneIds.push(scene.id);
  }

  const constraintItems = [];
  const byType = {};

  function pushConstraint(type, data) {
    const scopeId = resolveScopeGroupId(data, groupIndex);
    const sceneIds = scenesUnderScope(scopeId, groupIndex, orderedSceneIds);
    const item = { type, ...data, scopeId, sceneIds };
    constraintItems.push(item);
    byType[type] = (byType[type] || 0) + 1;
  }

  for (const c of constraintsRaw.requires || []) pushConstraint('requires', c);
  for (const c of constraintsRaw.forbids || []) pushConstraint('forbids', c);
  for (const c of constraintsRaw.must || []) pushConstraint('must', c);
  for (const c of constraintsRaw.tone || []) pushConstraint('tone', c);
  for (const c of constraintsRaw.max || []) pushConstraint('max', c);
  for (const c of constraintsRaw.min || []) pushConstraint('min', c);

  const textsByScene = {};
  let totalTokens = 0;
  for (const id of orderedSceneIds) {
    const s = scenesById[id];
    const tokens = s?.tokenCount || 0;
    textsByScene[id] = tokens;
    totalTokens += tokens;
  }

  const documentText = orderedSceneIds.map(id => scenesById[id]?.text || '').filter(Boolean).join('\n\n').trim();

  const world = {
    entities: {
      count: Object.keys(entityById).length,
      by_type: { ...entityTypes },
      registry: entityById,
      extracted: entities
    },
    scenes: {
      count: orderedSceneIds.length,
      ordered_ids: [...orderedSceneIds],
      by_id: scenesById
    },
    events: {
      count: orderedSceneIds.reduce((sum, id) => sum + (scenesById[id]?.events?.length || 0), 0),
      by_scene: Object.fromEntries(orderedSceneIds.map(id => [id, (scenesById[id]?.events?.length || 0)]))
    },
    constraints: {
      count: constraintItems.length,
      by_type: byType,
      items: constraintItems
    },
    ownership: Array.isArray(ownership) ? [...ownership] : [],
    texts: {
      token_count: totalTokens,
      by_scene: textsByScene,
      document_text: documentText
    },
    // Internal indices used by semantic validation and metrics.
    _internal: {
      groupIndex,
      entityNamesLower
    },
    // Convenience scores that are safe to compute at this stage.
    _quality: {
      scene_text_coverage: clamp01(orderedSceneIds.filter(id => (scenesById[id]?.text || '').trim().length > 0).length / Math.max(1, orderedSceneIds.length))
    }
  };

  return world;
}

export default { buildWorldModel };

