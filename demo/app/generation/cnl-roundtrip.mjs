/**
 * SCRIPTA Demo - CNL Roundtrip
 *
 * Converts parsed CNL AST back into demo project state.
 */

import { parseCNL } from '/src/cnl-parser/cnl-parser.mjs';
import { loadProject } from '/src/models/project.mjs';
import { genId } from '../utils.mjs';
import { normalizeAnnotations } from '../cnl-annotations.mjs';

const CHARACTER_TYPES = new Set([
  'protagonist', 'character', 'antagonist', 'mentor', 'ally', 'enemy',
  'hero', 'villain', 'shadow', 'sidekick', 'trickster', 'herald',
  'shapeshifter', 'threshold_guardian', 'mother', 'father', 'innocent',
  'outcast', 'sage', 'ruler', 'rebel', 'caregiver', 'explorer', 'lover',
  'magician', 'jester', 'orphan', 'warrior', 'tyrant', 'seducer', 'fanatic'
]);

const LOCATION_TYPES = new Set(['location', 'place', 'setting']);
const OBJECT_TYPES = new Set(['artifact', 'object', 'item']);
const MOOD_TYPES = new Set(['mood']);
const THEME_TYPES = new Set(['theme', 'motif']);

const SCALAR_META_VERBS = new Set([
  'is', 'has', 'includes', 'requires', 'forbids', 'must', 'owns', 'relates',
  'uses', 'mapped', 'linked', 'involves', 'starts', 'resolves', 'touchpoint',
  'says', 'applies', 'references', 'describes'
]);

function toKey(value) {
  return String(value || '').trim().toLowerCase();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function parseProjectHeader(cnlText) {
  const lines = String(cnlText || '').split(/\r?\n/).slice(0, 30);
  let name = null;
  let arc = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('//')) continue;
    const body = line.slice(2).trim();
    if (!body) continue;

    if (/^arc:/i.test(body)) {
      const foundArc = body.split(':').slice(1).join(':').trim();
      if (foundArc) arc = foundArc;
      continue;
    }

    if (body.toLowerCase() === 'auto-generated cnl') continue;
    if (!name) name = body;
  }

  return { name, arc };
}

function collectStatements(ast) {
  const all = [];
  if (Array.isArray(ast?.statements)) all.push(...ast.statements);

  function walkGroups(groups) {
    for (const group of groups || []) {
      if (Array.isArray(group?.statements)) all.push(...group.statements);
      walkGroups(group?.children || []);
    }
  }

  walkGroups(ast?.groups || []);
  return all;
}

function collectSubjectAnnotations(ast) {
  const bySubject = new Map();

  const pushForSubject = (subject, annotations) => {
    const key = toKey(subject);
    if (!key || !Array.isArray(annotations) || annotations.length === 0) return;
    const prev = bySubject.get(key) || [];
    bySubject.set(key, normalizeAnnotations([...prev, ...annotations]));
  };

  for (const stmt of collectStatements(ast)) {
    pushForSubject(stmt?.subject, stmt?.annotations);
  }

  return bySubject;
}

function makeStableId(prefix, name, usedIds) {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  let candidate = `${prefix}_${slug || 'item'}`;
  let idx = 2;
  while (usedIds.has(candidate)) {
    candidate = `${prefix}_${slug || 'item'}_${idx}`;
    idx += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

function resolveNameId(map, name) {
  return map.get(toKey(name)) || null;
}

function normalizeSceneProp(value) {
  if (value == null) return null;
  const txt = String(value).trim();
  return txt || null;
}

function mapSceneStatementsToProps(statements) {
  const props = {};
  for (const stmt of statements || []) {
    if (stmt?.verb !== 'has' || !Array.isArray(stmt.objects) || stmt.objects.length < 2) continue;
    const prop = toKey(stmt.objects[0]);
    const val = stmt.objects.slice(1).join(' ').trim();
    if (!val) continue;

    if (prop === 'purpose') props.purpose = val;
    else if (prop === 'time') props.time = val;
    else if (prop === 'goal' || prop === 'scene_goal') props.goal = val;
    else if (prop === 'conflict') props.conflict = val;
    else if (prop === 'disaster') props.disaster = val;
    else if (prop === 'theme') props.theme = val;
    else if (prop === 'mood') props.mood = val;
    else if (prop === 'pacing') props.pacing = val;
    else if (prop === 'length' || prop === 'word_count') props.wordCount = val;
    else if (prop === 'introduction') props.introduction = val;
    else if (prop === 'information_change') props.informationChange = val;
    else if (prop === 'emotional_change') props.emotionalChange = val;
    else if (prop === 'relationship_change') props.relationshipChange = val;
    else if (prop === 'stakes_change') props.stakesChange = val;
    else if (prop === 'reaction') props.sequelReaction = val;
    else if (prop === 'reflection') props.sequelReflection = val;
    else if (prop === 'dilemma') props.sequelDilemma = val;
    else if (prop === 'decision') props.sequelDecision = val;
    else if (prop === 'mapped_scene') props.sequelMappedScene = val;
  }
  return props;
}

function buildStructure(ast, refs, subjectAnnotations) {
  const allNodeIds = new Set();

  function createNodeFromGroup(group, depth) {
    const nodeType = depth <= 0 ? 'book' : (depth === 1 ? 'chapter' : 'scene');
    const node = {
      id: makeStableId(nodeType === 'book' ? 'book' : (nodeType === 'chapter' ? 'ch' : 'sc'), group.name, allNodeIds),
      type: nodeType,
      name: group.name,
      title: group.properties?.title || '',
      children: []
    };

    const normalizedGroupAnn = normalizeAnnotations(group.annotations || []);
    if (normalizedGroupAnn.length) node.annotations = normalizedGroupAnn;

    if (nodeType === 'scene') {
      const sceneProps = mapSceneStatementsToProps(group.statements || []);
      Object.assign(node, sceneProps);
      const nodeAnn = subjectAnnotations.get(toKey(node.name));
      if (nodeAnn?.length) {
        node.annotations = normalizeAnnotations([...(node.annotations || []), ...nodeAnn]);
      }
    }

    for (const stmt of group.statements || []) {
      if (stmt?.verb === 'includes' && Array.isArray(stmt.objects) && stmt.objects.length >= 2) {
        const includeType = toKey(stmt.objects[0]);
        const includeName = stmt.objects.slice(1).join(' ').trim();
        if (!includeName) continue;

        if (includeType === 'character') {
          node.children.push({
            id: genId('ref'),
            type: 'character-ref',
            name: includeName,
            refId: resolveNameId(refs.characters, includeName)
          });
          continue;
        }
        if (includeType === 'location') {
          node.children.push({
            id: genId('ref'),
            type: 'location-ref',
            name: includeName,
            refId: resolveNameId(refs.locations, includeName)
          });
          continue;
        }
        if (includeType === 'object') {
          node.children.push({
            id: genId('ref'),
            type: 'object-ref',
            name: includeName,
            refId: resolveNameId(refs.objects, includeName)
          });
          continue;
        }
        if (includeType === 'mood') {
          node.children.push({
            id: genId('ref'),
            type: 'mood-ref',
            name: includeName,
            refId: resolveNameId(refs.moods, includeName)
          });
          continue;
        }
        if (includeType === 'dialogue') {
          node.children.push({
            id: genId('ref'),
            type: 'dialogue-ref',
            name: includeName,
            refId: includeName
          });
          continue;
        }
        if (includeType === 'block') {
          node.children.push({
            id: genId('ref'),
            type: 'block-ref',
            name: includeName,
            blockKey: includeName
          });
        }
        continue;
      }

      const isAction = stmt?.verb && !SCALAR_META_VERBS.has(toKey(stmt.verb));
      if (nodeType === 'scene' && isAction) {
        const target = Array.isArray(stmt.objects) ? stmt.objects.join(' ').trim() : '';
        node.children.push({
          id: genId('act'),
          type: 'action',
          name: `${stmt.subject} ${stmt.verb}`.trim(),
          actionData: {
            subject: stmt.subject,
            action: String(stmt.verb || '').replace(/\s+/g, '_'),
            target
          },
          annotations: normalizeAnnotations(stmt.annotations || [])
        });
      }
    }

    for (const childGroup of group.children || []) {
      node.children.push(createNodeFromGroup(childGroup, depth + 1));
    }

    return node;
  }

  if (!Array.isArray(ast?.groups) || ast.groups.length === 0) {
    return {
      id: genId('book'),
      type: 'book',
      name: 'Book',
      title: '',
      children: []
    };
  }

  if (ast.groups.length === 1) {
    return createNodeFromGroup(ast.groups[0], 0);
  }

  return {
    id: genId('book'),
    type: 'book',
    name: 'Book',
    title: '',
    children: ast.groups.map(g => createNodeFromGroup(g, 1))
  };
}

function buildLibraries(ast, subjectAnnotations) {
  const usedIds = new Set();
  const libraries = {
    characters: [],
    locations: [],
    objects: [],
    moods: [],
    themes: [],
    relationships: [],
    worldRules: [],
    dialogues: [],
    emotionalArc: [],
    wisdom: [],
    patterns: []
  };

  const refs = {
    characters: new Map(),
    locations: new Map(),
    objects: new Map(),
    moods: new Map()
  };

  const rawEntities = ast?.entities || {};

  for (const [entityName, entity] of Object.entries(rawEntities)) {
    const type = toKey(entity.type);
    const annotations = subjectAnnotations.get(toKey(entityName)) || [];

    if (CHARACTER_TYPES.has(type)) {
      const char = {
        id: makeStableId('char', entityName, usedIds),
        name: entityName,
        archetype: type || 'character',
        traits: Array.isArray(entity.traits) ? [...new Set(entity.traits)] : []
      };
      if (entity.properties?.motivation) char.motivation = entity.properties.motivation;
      if (entity.properties?.backstory) char.backstory = entity.properties.backstory;
      if (entity.properties?.goals || entity.properties?.goal) char.objectives = entity.properties.goals || entity.properties.goal;
      if (entity.properties?.secrets || entity.properties?.secret) char.secrets = entity.properties.secrets || entity.properties.secret;
      if (annotations.length) char.annotations = annotations;
      libraries.characters.push(char);
      refs.characters.set(toKey(entityName), char.id);
      continue;
    }

    if (LOCATION_TYPES.has(type)) {
      const characteristics = toArray(entity.properties?.characteristic)
        .flatMap(v => String(v).split(','))
        .map(v => v.trim())
        .filter(Boolean);
      const loc = {
        id: makeStableId('loc', entityName, usedIds),
        name: entityName,
        geography: normalizeSceneProp(entity.properties?.geography) || 'location',
        time: normalizeSceneProp(entity.properties?.era || entity.properties?.time) || 'timeless',
        characteristics
      };
      if (annotations.length) loc.annotations = annotations;
      libraries.locations.push(loc);
      refs.locations.set(toKey(entityName), loc.id);
      continue;
    }

    if (OBJECT_TYPES.has(type)) {
      const obj = {
        id: makeStableId('obj', entityName, usedIds),
        name: entityName,
        objectType: type || 'object',
        significance: normalizeSceneProp(entity.properties?.significance) || 'important',
        function: normalizeSceneProp(entity.properties?.function),
        symbolism: normalizeSceneProp(entity.properties?.symbolism)
      };
      if (annotations.length) obj.annotations = annotations;
      libraries.objects.push(obj);
      refs.objects.set(toKey(entityName), obj.id);
      continue;
    }

    if (MOOD_TYPES.has(type)) {
      const mood = {
        id: makeStableId('mood', entityName, usedIds),
        name: entityName,
        emotions: entity.properties?.emotions && typeof entity.properties.emotions === 'object'
          ? { ...entity.properties.emotions }
          : {}
      };
      if (annotations.length) mood.annotations = annotations;
      libraries.moods.push(mood);
      refs.moods.set(toKey(entityName), mood.id);
      continue;
    }

    if (THEME_TYPES.has(type)) {
      const theme = {
        id: makeStableId('theme', entityName, usedIds),
        name: entityName,
        themeKey: toKey(entityName)
      };
      if (annotations.length) theme.annotations = annotations;
      libraries.themes.push(theme);
    }
  }

  const allStatements = collectStatements(ast);

  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'has' && toKey(stmt.objects?.[0]) === 'theme') {
      const themeName = stmt.objects.slice(1, stmt.objects?.length).join(' ').trim();
      if (!themeName) continue;
      if (!libraries.themes.find(t => toKey(t.name) === toKey(themeName))) {
        libraries.themes.push({
          id: makeStableId('theme', themeName, usedIds),
          name: themeName,
          themeKey: toKey(themeName),
          annotations: normalizeAnnotations(stmt.annotations || [])
        });
      }
    }
  }

  for (const rel of ast.relationships || []) {
    const fromId = resolveNameId(refs.characters, rel.from);
    const toId = resolveNameId(refs.characters, rel.to);
    if (!fromId || !toId) continue;
    libraries.relationships.push({
      id: genId('rel'),
      fromId,
      toId,
      type: rel.type || 'related'
    });
  }

  for (const own of ast.ownership || []) {
    const ownerId = resolveNameId(refs.characters, own.owner);
    const objectId = resolveNameId(refs.objects, own.owned);
    if (!ownerId || !objectId) continue;
    const obj = libraries.objects.find(o => o.id === objectId);
    if (obj) obj.ownerId = ownerId;
  }

  return { libraries, refs };
}

function mapDialogues(ast, refs) {
  const dialogues = [];
  for (const dialogue of Object.values(ast?.dialogues || {})) {
    const participants = (dialogue.participants || []).map(p => ({
      characterId: resolveNameId(refs.characters, p.characterId) || p.characterId,
      role: p.role || 'participant'
    }));

    const exchanges = (dialogue.exchanges || []).map(ex => ({
      speakerId: resolveNameId(refs.characters, ex.speakerId) || ex.speakerId || '',
      intent: ex.intent || '',
      emotion: ex.emotion || '',
      sketch: ex.sketch || '',
      conflictType: ex.conflictType || '',
      subtext: ex.subtext || '',
      information: ex.information || '',
      relationshipBetweenCharacters: ex.relationshipBetweenCharacters || '',
      power: ex.power || '',
      emotionShift: ex.emotionShift || '',
      storyDirection: ex.storyDirection || '',
      readerPerception: ex.readerPerception || ''
    }));

    dialogues.push({
      id: dialogue.id,
      purpose: dialogue.purpose || null,
      participants,
      tone: dialogue.tone || null,
      tension: dialogue.tension || null,
      beatKey: dialogue.beatKey || null,
      location: dialogue.location || null,
      exchanges,
      annotations: normalizeAnnotations(dialogue.annotations || [])
    });
  }
  return dialogues;
}

function mapSubplots(ast, refs) {
  return Object.values(ast?.subplots || {}).map(subplot => ({
    id: subplot.id,
    name: subplot.name || subplot.id,
    type: subplot.type || 'generic',
    characterIds: (subplot.characterIds || []).map(cid => resolveNameId(refs.characters, cid) || cid),
    startBeat: subplot.startBeat || null,
    resolveBeat: subplot.resolveBeat || null,
    touchpoints: Array.isArray(subplot.touchpoints) ? subplot.touchpoints : [],
    annotations: normalizeAnnotations(subplot.annotations || [])
  }));
}

export function cnlToProjectState(cnlText, currentProject = {}) {
  const parseResult = parseCNL(cnlText || '');
  if (!parseResult.valid) {
    const first = parseResult.errors?.[0];
    const msg = first ? `Line ${first.line}: ${first.message}` : 'Invalid CNL';
    throw new Error(msg);
  }

  const ast = parseResult.ast || {};
  const header = parseProjectHeader(cnlText);
  const subjectAnnotations = collectSubjectAnnotations(ast);
  const { libraries, refs } = buildLibraries(ast, subjectAnnotations);

  libraries.dialogues = mapDialogues(ast, refs);
  libraries.emotionalArc = (ast.blueprint?.beatProperties
    ? Object.entries(ast.blueprint.beatProperties)
      .filter(([, props]) => props?.mood)
      .map(([beatKey, props]) => ({ id: genId('ea'), beatKey, moodPreset: props.mood }))
    : []);

  const structure = buildStructure(ast, refs, subjectAnnotations);
  const subplots = mapSubplots(ast, refs);

  const arc = ast.blueprint?.arc || header.arc || currentProject.selectedArc || 'heros_journey';
  const beatMappings = Array.isArray(ast.blueprint?.beatMappings) ? ast.blueprint.beatMappings.map(m => ({
    beatKey: m.beatKey,
    chapterId: m.chapterId || null,
    sceneId: m.sceneId || null,
    tension: m.tension ?? null,
    notes: Array.isArray(m.notes) ? m.notes : [],
    annotations: normalizeAnnotations(m.annotations || [])
  })) : [];

  const project = loadProject({
    id: currentProject.id || null,
    name: header.name || currentProject.name || 'Imported Story',
    selectedArc: arc,
    blueprint: {
      arc,
      beatMappings,
      tensionCurve: Array.isArray(ast.blueprint?.tensionCurve) ? ast.blueprint.tensionCurve : [],
      subplots
    },
    libraries,
    structure,
    cnlAnnotations: {
      global: normalizeAnnotations(ast.globalAnnotations || [])
    }
  });

  return {
    project,
    parseResult
  };
}

export default {
  cnlToProjectState
};
