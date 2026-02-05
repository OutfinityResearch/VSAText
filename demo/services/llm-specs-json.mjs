/**
 * SCRIPTA Demo - LLM Specs JSON Helpers
 *
 * Shared helpers for:
 * - Building prompt presets for "Create Specs → With LLM"
 * - Parsing JSON safely from imperfect LLM output
 * - Normalizing/repairing the resulting project for the demo UI
 *
 * No external dependencies.
 */

import { loadProject } from '../../src/models/project.mjs';

const SPECS_PROMPT_PRESETS = {
  strict_project_json: {
    system: 'You generate story specifications. Return valid JSON only (no markdown, no commentary).',
    buildPrompt: (p) => buildStrictProjectJsonPrompt(p)
  },
  creative_project_json: {
    system: 'You generate creative story specifications. Return valid JSON only (no markdown, no commentary).',
    buildPrompt: (p) => buildCreativeProjectJsonPrompt(p)
  },
  minimal_project_json: {
    system: 'You generate minimal but valid story specifications. Return valid JSON only (no markdown, no commentary).',
    buildPrompt: (p) => buildMinimalProjectJsonPrompt(p)
  }
};

let autoIdCounter = 0;

function makeId(prefix) {
  autoIdCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${autoIdCounter.toString(36)}`;
}

function normalizeNameKey(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function normalizeNodeType(value) {
  if (typeof value !== 'string') return value;
  const t = value.trim().toLowerCase().replace(/_/g, '-');

  const aliases = {
    book: 'book',
    chapter: 'chapter',
    scene: 'scene',
    action: 'action',
    dialogue: 'dialogue',
    'dialogue-ref': 'dialogue-ref',
    'character-ref': 'character-ref',
    'location-ref': 'location-ref',
    'object-ref': 'object-ref',
    'mood-ref': 'mood-ref',
    'block-ref': 'block-ref'
  };

  if (aliases[t]) return aliases[t];
  if (t === 'characterref' || t === 'character-reference') return 'character-ref';
  if (t === 'locationref' || t === 'location-reference') return 'location-ref';
  if (t === 'objectref' || t === 'object-reference') return 'object-ref';
  if (t === 'moodref' || t === 'mood-reference') return 'mood-ref';
  if (t === 'dialogueref' || t === 'dialogue-reference') return 'dialogue-ref';
  if (t === 'blockref' || t === 'block-reference') return 'block-ref';
  return t;
}

function extractFirstCompleteJson(text) {
  if (typeof text !== 'string') return null;
  const start = text.search(/[{\[]/);
  if (start === -1) return null;

  const stack = [];
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\\\') {
        escape = true;
        continue;
      }
      if (ch === '\"') {
        inString = false;
      }
      continue;
    }

    if (ch === '\"') {
      inString = true;
      continue;
    }

    if (ch === '{' || ch === '[') {
      stack.push(ch);
      continue;
    }

    if (ch === '}' || ch === ']') {
      const open = stack.pop();
      if (!open) continue;

      const ok = (open === '{' && ch === '}') || (open === '[' && ch === ']');
      if (!ok) return null;

      if (stack.length === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function removeTrailingCommas(jsonText) {
  if (typeof jsonText !== 'string') return jsonText;
  let prev = null;
  let next = jsonText;
  while (next !== prev) {
    prev = next;
    next = next.replace(/,\\s*([}\\]])/g, '$1');
  }
  return next;
}

export function coerceToString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function parseLLMJson(content) {
  if (content == null) return content;
  if (typeof content !== 'string') return content;

  let text = content.trim();

  const fenced = text.match(/```(?:json)?\\s*([\\s\\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  const extracted = extractFirstCompleteJson(text);
  const candidate = extracted || text;

  try {
    return JSON.parse(candidate);
  } catch (err) {
    const repaired = removeTrailingCommas(candidate);
    return JSON.parse(repaired);
  }
}

export function buildJsonRepairPrompt(originalText) {
  const text = coerceToString(originalText);
  const maxChars = 12000;
  const clipped = text.length > maxChars
    ? text.slice(0, maxChars) + '\\n[TRUNCATED INPUT]\\n'
    : text;

  return `Fix the following content into a single valid JSON value.

Rules:
- Output JSON only (no markdown).
- Use double quotes for keys and strings.
- Remove trailing commas.
- If there is extra non-JSON text, ignore it.
- If the JSON is truncated, complete it with the smallest reasonable additions.

CONTENT:
${clipped}
`;
}

export function buildSpecsPrompt({ promptKey, options }) {
  const key = promptKey || 'strict_project_json';
  const preset = SPECS_PROMPT_PRESETS[key] || SPECS_PROMPT_PRESETS.strict_project_json;

  const storyName = options.storyName || options.title || 'Untitled Story';
  const prompt = preset.buildPrompt({ ...options, storyName });

  return { promptKey: key, systemPrompt: preset.system, prompt };
}

export function normalizeSpecsProject(rawValue, storyName) {
  const pickCandidate = (value) => {
    if (!value || typeof value !== 'object') return null;

    if (Array.isArray(value)) {
      for (const item of value) {
        const picked = pickCandidate(item);
        if (picked) return picked;
      }
      return null;
    }

    if (value.project && typeof value.project === 'object') return value.project;
    if (value.libraries || value.structure || value.blueprint) return value;

    return null;
  };

  const candidate = pickCandidate(rawValue);
  if (!candidate) return null;

  const project = loadProject({
    ...candidate,
    name: candidate.name || storyName || 'Untitled Story'
  });

  project.libraries.dialogues = Array.isArray(project.libraries.dialogues) ? project.libraries.dialogues : [];
  project.libraries.emotionalArc = Array.isArray(project.libraries.emotionalArc) ? project.libraries.emotionalArc : [];
  project.libraries.wisdom = Array.isArray(project.libraries.wisdom) ? project.libraries.wisdom : [];
  project.libraries.patterns = Array.isArray(project.libraries.patterns) ? project.libraries.patterns : [];

  const libs = project.libraries;

  const normalizeList = (key, prefix, mapFields) => {
    const list = Array.isArray(libs[key]) ? libs[key] : [];
    const normalized = list
      .filter(x => x && typeof x === 'object')
      .map((x, idx) => {
        const mapped = mapFields ? mapFields(x) : x;
        return {
          id: mapped.id || makeId(prefix),
          ...mapped,
          name: mapped.name || mapped.title || `${key}_${idx + 1}`
        };
      });
    libs[key] = normalized;
    return normalized;
  };

  const characters = normalizeList('characters', 'char', (c) => ({
    ...c,
    archetype: c.archetype || c.role || 'ally',
    traits: Array.isArray(c.traits) ? c.traits : (Array.isArray(c.attributes) ? c.attributes : [])
  }));

  const locations = normalizeList('locations', 'loc', (l) => ({ ...l, type: l.type || l.kind || 'place' }));
  const objects = normalizeList('objects', 'obj', (o) => ({ ...o, type: o.type || o.kind || 'object' }));
  const moods = normalizeList('moods', 'mood', (m) => ({ ...m, description: m.description || m.note || '' }));
  normalizeList('themes', 'theme', (t) => ({ ...t, description: t.description || t.note || '' }));

  normalizeList('worldRules', 'rule', (r) => ({
    ...r,
    name: r.name || r.rule || r.title || 'World Rule',
    category: r.category || 'other',
    description: r.description || r.impact || '',
    scope: r.scope || ''
  }));

  const charNameToId = new Map(characters.map(c => [normalizeNameKey(c.name), c.id]));
  const locNameToId = new Map(locations.map(l => [normalizeNameKey(l.name), l.id]));
  const objNameToId = new Map(objects.map(o => [normalizeNameKey(o.name), o.id]));
  const moodNameToId = new Map(moods.map(m => [normalizeNameKey(m.name), m.id]));

  libs.relationships = (Array.isArray(libs.relationships) ? libs.relationships : [])
    .filter(r => r && typeof r === 'object')
    .map((r) => {
      const fromRaw = r.fromId || r.from || r.sourceId || r.source;
      const toRaw = r.toId || r.to || r.targetId || r.target;

      const resolveCharId = (v) => {
        if (!v) return null;
        if (typeof v === 'string') {
          if (characters.some(c => c.id === v)) return v;
          return charNameToId.get(normalizeNameKey(v)) || null;
        }
        if (typeof v === 'object') {
          if (typeof v.id === 'string') return v.id;
          if (typeof v.name === 'string') return charNameToId.get(normalizeNameKey(v.name)) || null;
        }
        return null;
      };

      return {
        id: r.id || makeId('rel'),
        fromId: resolveCharId(fromRaw) || characters[0]?.id || null,
        toId: resolveCharId(toRaw) || characters[1]?.id || characters[0]?.id || null,
        type: r.type || r.kind || 'ally'
      };
    });

  const refTypeToInfo = {
    'character-ref': { map: charNameToId, libKey: 'characters', prefix: 'char' },
    'location-ref': { map: locNameToId, libKey: 'locations', prefix: 'loc' },
    'object-ref': { map: objNameToId, libKey: 'objects', prefix: 'obj' },
    'mood-ref': { map: moodNameToId, libKey: 'moods', prefix: 'mood' }
  };

  const ensureNodeIds = (node) => {
    if (!node || typeof node !== 'object') return;

    node.type = normalizeNodeType(node.type || node.nodeType || node.kind || 'unknown');
    node.id = node.id || makeId(node.type || 'node');
    node.name = node.name || node.title || node.type;

    if (!Array.isArray(node.children)) node.children = [];
    node.children.forEach(ensureNodeIds);

    const refInfo = refTypeToInfo[node.type];
    if (!refInfo) return;

    const hasRefId = typeof node.refId === 'string' && node.refId.length > 0;
    const hasName = typeof node.name === 'string' && node.name.trim().length > 0;

    if (!hasRefId && hasName) {
      const existingId = refInfo.map.get(normalizeNameKey(node.name));
      if (existingId) node.refId = existingId;
    }

    if (!node.refId && hasName) {
      const newEntity = { id: makeId(refInfo.prefix), name: node.name };
      libs[refInfo.libKey].push(newEntity);
      refInfo.map.set(normalizeNameKey(newEntity.name), newEntity.id);
      node.refId = newEntity.id;
    }
  };

  if (!project.structure || typeof project.structure !== 'object') {
    project.structure = {
      id: makeId('book'),
      type: 'book',
      name: 'Book',
      title: project.name,
      children: [
        {
          id: makeId('ch'),
          type: 'chapter',
          name: 'Ch1',
          title: '',
          children: [
            {
              id: makeId('sc'),
              type: 'scene',
              name: 'Sc1.1',
              title: '',
              children: []
            }
          ]
        }
      ]
    };
  }

  ensureNodeIds(project.structure);

  return project;
}

function buildCommonSpecsLines(options) {
  const lines = [];
  lines.push(`Story name: ${options.storyName || 'Untitled Story'}`);
  lines.push(`Genre: ${options.genre || 'unknown'}`);
  lines.push(`Tone: ${options.tone || 'balanced'}`);
  lines.push(`Length: ${options.length || 'medium'}`);
  lines.push(`Characters: ${options.characters || options.chars || 'medium'}`);
  lines.push(`Complexity: ${options.complexity || 'medium'}`);
  lines.push(`World rules: ${options.worldRules || options.rules || 'few'}`);
  if (options.customPrompt) lines.push(`Custom instructions: ${options.customPrompt}`);
  return lines.join('\\n');
}

function buildStrictProjectJsonPrompt(options) {
  return `Return a single JSON object with this exact top-level shape:
{"project": {...}}

Hard rules:
- Output JSON only. No markdown, no code blocks, no comments.
- Use double quotes for all keys and string values.
- No trailing commas.

The project must match this schema (all keys required):
project: {
  "id": null,
  "name": string,
  "selectedArc": string,
  "blueprint": { "arc": string, "beatMappings": [], "tensionCurve": [], "subplots": [] },
  "libraries": {
    "characters": [{ "id": string, "name": string, "archetype": string, "traits": [string] }],
    "locations": [{ "id": string, "name": string, "type": string, "description": string }],
    "objects": [{ "id": string, "name": string, "type": string, "description": string }],
    "moods": [{ "id": string, "name": string, "description": string }],
    "themes": [{ "id": string, "name": string, "description": string }],
    "relationships": [{ "id": string, "fromId": string, "toId": string, "type": string }],
    "worldRules": [{ "id": string, "name": string, "category": string, "description": string, "scope": string }],
    "dialogues": [],
    "emotionalArc": [],
    "wisdom": [],
    "patterns": []
  },
  "structure": {
    "id": string,
    "type": "book",
    "name": "Book",
    "title": string,
    "children": [{
      "id": string,
      "type": "chapter",
      "name": string,
      "title": string,
      "children": [{
        "id": string,
        "type": "scene",
        "name": string,
        "title": string,
        "children": [
          { "id": string, "type": "character-ref", "name": string, "refId": string },
          { "id": string, "type": "location-ref", "name": string, "refId": string }
        ]
      }]
    }]
  }
}

Generate a coherent story world. Keep it compact (avoid long paragraphs).

Input parameters:
${buildCommonSpecsLines(options)}
`;
}

function buildCreativeProjectJsonPrompt(options) {
  return `Return JSON only (no markdown). Use the same {"project": {...}} shape as in the strict preset.

Focus on originality and strong character dynamics. Keep it compact enough to stay valid and complete.

Input parameters:
${buildCommonSpecsLines(options)}
`;
}

function buildMinimalProjectJsonPrompt(options) {
  return `Return JSON only (no markdown). Use the same {"project": {...}} top-level shape.

Goal: a minimal but valid skeleton that the editor can load.
- 2-4 characters, 2-4 locations, 1-3 objects
- 1-2 chapters, 2-4 scenes total
- Keep all descriptions short

Input parameters:
${buildCommonSpecsLines(options)}
`;
}

