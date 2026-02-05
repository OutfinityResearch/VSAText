/**
 * SCRIPTA SDK - Random Story Generator
 *
 * Generates story structures using random selection from vocabularies.
 * This is a pure function that returns data - no side effects.
 *
 * @module generation/random-generator
 */

import {
  CHARACTER_ARCHETYPES,
  CHARACTER_TRAITS,
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  OBJECT_TYPES,
  MOOD_PRESETS,
  THEMES,
  NAMES
} from '../vocabularies/vocabularies.mjs';

import { makeId } from '../utils/ids.mjs';
import { NARRATIVE_ARCS, GENRE_CONFIG, MOODS_BY_TONE, COUNTS } from './random-generator-config.mjs';
import { generateBlueprint } from './random-generator-blueprint.mjs';
import { pick, pickN } from './random-generator-utils.mjs';
import { generateStructure, applyBeatTitles, ensureAllCharactersAppear } from './random-generator-structure.mjs';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getConfig(genre) {
  return GENRE_CONFIG[genre] || GENRE_CONFIG.fantasy;
}

function getRelationshipType(archetype) {
  const mapping = {
    mentor: 'mentor_student',
    shadow: 'rivals',
    ally: 'friends',
    trickster: 'acquaintances',
    herald: 'acquaintances',
    shapeshifter: 'rivals',
    threshold_guardian: 'acquaintances'
  };
  return mapping[archetype] || 'acquaintances';
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

function generateCharacters(config, numChars, usedNames = new Set()) {
  const characters = [];
  const archetypes = config.archetypes;

  for (let i = 0; i < numChars; i++) {
    const arch = archetypes[i % archetypes.length];
    const archData = CHARACTER_ARCHETYPES[arch];

    const availableNames = NAMES.characters.filter(n => !usedNames.has(n));
    const name = pick(availableNames);
    if (!name) continue;

    usedNames.add(name);

    characters.push({
      id: makeId('char'),
      name: name,
      archetype: arch,
      traits: [...(archData?.suggestedTraits || []), ...pickN(Object.keys(CHARACTER_TRAITS), 2)]
    });
  }

  return characters;
}

function generateRelationships(characters) {
  const relationships = [];
  const hero = characters.find(c => c.archetype === 'hero') || characters[0];
  if (!hero) return relationships;

  characters.forEach(c => {
    if (c === hero) return;

    relationships.push({
      id: makeId('rel'),
      fromId: hero.id,
      toId: c.id,
      type: getRelationshipType(c.archetype)
    });
  });

  return relationships;
}

function generateLocations(config, numScenes, usedNames = new Set()) {
  const locations = [];
  const numLocs = Math.max(2, Math.floor(numScenes / 3));
  const geos = config.geographies.length > 0
    ? config.geographies
    : Object.keys(LOCATION_GEOGRAPHY);

  pickN(geos, numLocs).forEach(geo => {
    const availableNames = NAMES.locations.filter(n => !usedNames.has(n));
    const name = pick(availableNames);
    if (!name) return;

    usedNames.add(name);

    locations.push({
      id: makeId('loc'),
      name: name,
      geography: geo,
      time: pick(Object.keys(LOCATION_TIME)),
      characteristics: pickN(Object.keys(LOCATION_CHARACTERISTICS), 2)
    });
  });

  return locations;
}

function generateObjects(config, characters, usedNames = new Set()) {
  const objects = [];
  const numObjs = Math.max(1, Math.floor(characters.length / 2));
  const objTypes = config.objectTypes.length > 0
    ? config.objectTypes
    : Object.keys(OBJECT_TYPES);

  const hero = characters.find(c => c.archetype === 'hero');
  const availableNames = NAMES.objects.filter(n => !usedNames.has(n));

  pickN(availableNames, numObjs).forEach(name => {
    usedNames.add(name);

    objects.push({
      id: makeId('obj'),
      name: name,
      objectType: pick(objTypes),
      significance: pick(['important', 'central', 'chekhov']),
      ownerId: Math.random() > 0.5 ? hero?.id : null
    });
  });

  return objects;
}

function generateMoods(tone) {
  const moods = [];
  const moodKeys = MOODS_BY_TONE[tone] || MOODS_BY_TONE.balanced;

  moodKeys.forEach(k => {
    const preset = MOOD_PRESETS[k];
    if (preset) {
      moods.push({
        id: makeId('mood'),
        name: preset.label,
        emotions: { ...preset.emotions }
      });
    }
  });

  return moods;
}

function generateThemes(config) {
  const themes = [];
  const themeKeys = config.themes.length > 0
    ? config.themes
    : Object.keys(THEMES);

  pickN(themeKeys, 2).forEach(k => {
    const t = THEMES[k];
    if (t) {
      themes.push({
        id: makeId('theme'),
        name: t.label,
        themeKey: k
      });
    }
  });

  return themes;
}

function generateWorldRules(config, rulesSetting) {
  const templates = Array.isArray(config.worldRules) ? config.worldRules : [];
  const spec = COUNTS.rules[rulesSetting] ?? 0;

  let count = 0;
  if (Array.isArray(spec)) {
    const [min, max] = spec;
    count = min + Math.floor(Math.random() * (max - min + 1));
  } else {
    count = Number(spec) || 0;
  }

  if (count <= 0 || templates.length === 0) return [];

  return pickN(templates, Math.min(count, templates.length)).map(r => ({
    id: makeId('rule'),
    name: r.name,
    category: r.category || 'other',
    description: r.description || '',
    scope: r.scope || ''
  }));
}

// ============================================
// MAIN EXPORT
// ============================================

/**
 * Generate a complete story structure using random selection.
 *
 * @param {Object} options - Generation options
 * @param {string} options.genre - Genre (fantasy, romance, mystery, scifi, thriller)
 * @param {string} options.tone - Tone (dark, light, balanced, dramatic, mysterious)
 * @param {string} options.chars - Character count (few, medium, many)
 * @param {string} options.length - Story length (short, medium, long)
 * @param {string} options.complexity - Structure complexity (simple, medium, complex)
 * @param {string} options.rules - World rules (none, few, many)
 * @param {string} options.title - Story title
 * @returns {Object} Complete story structure
 */
export function generateRandomStory(options = {}) {
  const config = getConfig(options.genre);

  // Calculate counts
  const [minChars, maxChars] = COUNTS.characters[options.chars] || [4, 6];
  const [minScenes, maxScenes] = COUNTS.scenes[options.length] || [8, 12];

  const numChars = minChars + Math.floor(Math.random() * (maxChars - minChars + 1));
  const numScenes = minScenes + Math.floor(Math.random() * (maxScenes - minScenes + 1));

  // Generate entities
  const usedNames = new Set();
  const characters = generateCharacters(config, numChars, usedNames);
  const relationships = generateRelationships(characters);
  const locations = generateLocations(config, numScenes, usedNames);
  const objects = generateObjects(config, characters, usedNames);
  const moods = generateMoods(options.tone);
  const themes = generateThemes(config);
  const worldRules = generateWorldRules(config, options.rules);

  const libraries = { characters, relationships, locations, objects, moods, themes, worldRules };

  // Generate structure
  const structure = generateStructure(options, libraries, numScenes);

  // Apply narrative arc
  const arcName = config.arc || 'heros_journey';
  const blueprint = generateBlueprint(arcName, structure, characters, numScenes);

  applyBeatTitles(structure, blueprint.beatMappings);
  ensureAllCharactersAppear(structure, characters);

  // Add dialogues to libraries
  libraries.dialogues = blueprint.dialogues;

  return {
    name: options.title || 'Untitled Story',
    selectedArc: arcName,
    libraries,
    structure,
    blueprint: {
      arc: blueprint.arc,
      beatMappings: blueprint.beatMappings,
      tensionCurve: blueprint.tensionCurve,
      subplots: []
    }
  };
}

export { NARRATIVE_ARCS, GENRE_CONFIG, COUNTS };

export default generateRandomStory;

