/**
 * SCRIPTA Demo - Story Generation
 * 
 * Generates random stories based on genre and options.
 */

import { state } from './state.mjs';
import { $, genId, pick, pickN, closeModal } from './utils.mjs';
import { renderTree } from './tree.mjs';
import { renderEntityGrid } from './entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from './views.mjs';
import { evaluateMetrics } from './metrics.mjs';
import VOCAB from '../../src/vocabularies/vocabularies.mjs';

// Genre-specific configurations
const GENRE_CONFIG = {
  fantasy: {
    archetypes: ['hero', 'mentor', 'shadow', 'ally', 'trickster'],
    geographies: ['forest', 'mountain', 'castle', 'village', 'cave'],
    objectTypes: ['weapon', 'artifact', 'tool'],
    themes: ['redemption', 'coming_of_age', 'good_vs_evil'],
    rules: [
      { name: 'Magic requires sacrifice', category: 'magic', description: 'All magic has a cost' },
      { name: 'Ancient prophecy', category: 'magic', description: "A prophecy guides the hero's destiny" },
      { name: 'Dragons exist', category: 'biology', description: 'Dragons are real creatures in this world' }
    ]
  },
  scifi: {
    archetypes: ['hero', 'mentor', 'shadow', 'ally', 'herald'],
    geographies: ['urban', 'space', 'underwater', 'desert'],
    objectTypes: ['tool', 'document', 'vehicle'],
    themes: ['identity', 'freedom_vs_security', 'power_corruption'],
    rules: [
      { name: 'FTL travel exists', category: 'technology', description: 'Faster-than-light travel is possible' },
      { name: 'AI is sentient', category: 'technology', description: 'Artificial intelligences have consciousness' },
      { name: 'Aliens exist', category: 'biology', description: 'Humanity has encountered alien species' }
    ]
  },
  mystery: {
    archetypes: ['hero', 'shadow', 'ally', 'trickster', 'shapeshifter'],
    geographies: ['urban', 'manor', 'village'],
    objectTypes: ['document', 'tool', 'clothing'],
    themes: ['justice', 'identity', 'sacrifice'],
    rules: [
      { name: 'Everyone lies', category: 'society', description: 'No character tells the complete truth' },
      { name: 'Closed setting', category: 'geography', description: 'The crime scene is isolated' }
    ]
  },
  romance: {
    archetypes: ['hero', 'ally', 'mentor', 'trickster'],
    geographies: ['urban', 'village', 'coastal', 'manor'],
    objectTypes: ['clothing', 'document', 'artifact'],
    themes: ['love_and_loss', 'identity', 'sacrifice'],
    rules: []
  },
  horror: {
    archetypes: ['hero', 'shadow', 'ally', 'innocent'],
    geographies: ['forest', 'manor', 'cave', 'urban'],
    objectTypes: ['artifact', 'weapon', 'tool'],
    themes: ['sacrifice', 'good_vs_evil', 'identity'],
    rules: [
      { name: 'Darkness is deadly', category: 'physics', description: 'Something lurks in the darkness' },
      { name: 'The dead return', category: 'magic', description: 'Death is not always permanent' },
      { name: 'Evil cannot be killed', category: 'magic', description: 'The antagonist cannot be destroyed conventionally' }
    ]
  },
  adventure: {
    archetypes: ['hero', 'mentor', 'ally', 'trickster', 'herald'],
    geographies: ['forest', 'mountain', 'ocean', 'desert', 'jungle'],
    objectTypes: ['weapon', 'tool', 'vehicle', 'artifact'],
    themes: ['coming_of_age', 'redemption', 'freedom_vs_security'],
    rules: [
      { name: 'Treasure awaits', category: 'other', description: "A great reward lies at journey's end" }
    ]
  },
  drama: {
    archetypes: ['hero', 'shadow', 'ally', 'mentor'],
    geographies: ['urban', 'village', 'manor'],
    objectTypes: ['document', 'clothing'],
    themes: ['identity', 'love_and_loss', 'sacrifice', 'power_corruption'],
    rules: []
  },
  comedy: {
    archetypes: ['hero', 'trickster', 'ally', 'innocent'],
    geographies: ['urban', 'village'],
    objectTypes: ['tool', 'clothing'],
    themes: ['identity', 'coming_of_age'],
    rules: [
      { name: 'Misunderstandings abound', category: 'society', description: 'Characters constantly misinterpret each other' }
    ]
  }
};

// Template presets
const TEMPLATES = {
  classic_hero: { genre: 'fantasy', length: 'medium', chars: 'medium', tone: 'balanced', complexity: 'moderate', rules: 'few' },
  mystery: { genre: 'mystery', length: 'medium', chars: 'many', tone: 'dark', complexity: 'complex', rules: 'few' },
  romance: { genre: 'romance', length: 'medium', chars: 'few', tone: 'light', complexity: 'simple', rules: 'none' },
  scifi: { genre: 'scifi', length: 'long', chars: 'medium', tone: 'balanced', complexity: 'complex', rules: 'many' },
  horror: { genre: 'horror', length: 'short', chars: 'few', tone: 'dark', complexity: 'moderate', rules: 'few' },
  minimal: { genre: 'drama', length: 'short', chars: 'few', tone: 'balanced', complexity: 'simple', rules: 'none' }
};

window.applyTemplate = (templateKey) => {
  const t = TEMPLATES[templateKey];
  if (!t) return;
  $('#gen-genre').value = t.genre;
  $('#gen-length').value = t.length;
  $('#gen-chars').value = t.chars;
  $('#gen-tone').value = t.tone;
  $('#gen-complexity').value = t.complexity;
  $('#gen-rules').value = t.rules;
};

window.executeGenerate = () => {
  const options = {
    genre: $('#gen-genre').value,
    length: $('#gen-length').value,
    chars: $('#gen-chars').value,
    tone: $('#gen-tone').value,
    complexity: $('#gen-complexity').value,
    rules: $('#gen-rules').value
  };
  
  generateStory(options);
  closeModal('generate-modal');
};

export function generateStory(options) {
  // Reset libraries
  state.project.libraries = {
    characters: [], locations: [], objects: [], moods: [],
    emotionalArc: [], themes: [], relationships: [], worldRules: []
  };
  
  const config = GENRE_CONFIG[options.genre] || GENRE_CONFIG.fantasy;
  
  // Determine counts based on options
  const charCounts = { few: [2, 3], medium: [4, 6], many: [7, 10] };
  const sceneCounts = { short: [3, 5], medium: [8, 12], long: [15, 20] };
  const ruleCounts = { none: 0, few: [1, 2], many: [3, 5] };
  
  const [minChars, maxChars] = charCounts[options.chars] || [4, 6];
  const [minScenes, maxScenes] = sceneCounts[options.length] || [8, 12];
  const ruleCount = options.rules === 'none' ? 0 :
    (Array.isArray(ruleCounts[options.rules]) ?
      ruleCounts[options.rules][0] + Math.floor(Math.random() * (ruleCounts[options.rules][1] - ruleCounts[options.rules][0] + 1)) : 0);
  
  const numChars = minChars + Math.floor(Math.random() * (maxChars - minChars + 1));
  const numScenes = minScenes + Math.floor(Math.random() * (maxScenes - minScenes + 1));
  
  // Generate characters
  const archetypes = config.archetypes;
  for (let i = 0; i < numChars; i++) {
    const arch = archetypes[i % archetypes.length];
    const a = VOCAB.CHARACTER_ARCHETYPES[arch];
    const name = pick(VOCAB.NAMES.characters.filter(n => !state.project.libraries.characters.find(c => c.name === n)));
    if (!name) continue;
    state.project.libraries.characters.push({
      id: genId(),
      name: name,
      archetype: arch,
      traits: [...(a?.suggestedTraits || []), ...pickN(Object.keys(VOCAB.CHARACTER_TRAITS), 2)]
    });
  }
  
  // Generate relationships
  const chars = state.project.libraries.characters;
  const hero = chars.find(c => c.archetype === 'hero') || chars[0];
  chars.forEach(c => {
    if (c === hero) return;
    const relType = c.archetype === 'mentor' ? 'mentor_student' :
      c.archetype === 'shadow' ? 'rivals' :
      c.archetype === 'ally' ? 'friends' :
      c.archetype === 'trickster' ? 'acquaintances' : 'acquaintances';
    state.project.libraries.relationships.push({
      id: genId(),
      fromId: hero?.id,
      toId: c.id,
      type: relType
    });
  });
  
  // Generate locations
  const numLocs = Math.max(2, Math.floor(numScenes / 3));
  const geos = config.geographies.length > 0 ? config.geographies : Object.keys(VOCAB.LOCATION_GEOGRAPHY);
  pickN(geos, numLocs).forEach(geo => {
    const name = pick(VOCAB.NAMES.locations.filter(n => !state.project.libraries.locations.find(l => l.name === n)));
    if (!name) return;
    state.project.libraries.locations.push({
      id: genId(),
      name: name,
      geography: geo,
      time: pick(Object.keys(VOCAB.LOCATION_TIME)),
      characteristics: pickN(Object.keys(VOCAB.LOCATION_CHARACTERISTICS), 2)
    });
  });
  
  // Generate objects
  const numObjs = Math.max(1, Math.floor(numChars / 2));
  const objTypes = config.objectTypes.length > 0 ? config.objectTypes : Object.keys(VOCAB.OBJECT_TYPES);
  pickN(VOCAB.NAMES.objects, numObjs).forEach(name => {
    state.project.libraries.objects.push({
      id: genId(),
      name: name,
      objectType: pick(objTypes),
      significance: pick(['important', 'central']),
      ownerId: Math.random() > 0.5 ? hero?.id : null
    });
  });
  
  // Generate moods based on tone
  const moodsByTone = {
    dark: ['tense', 'melancholic', 'dark', 'mysterious'],
    balanced: ['tense', 'hopeful', 'mysterious', 'triumphant'],
    light: ['hopeful', 'peaceful', 'romantic', 'triumphant'],
    comedic: ['peaceful', 'hopeful', 'chaotic']
  };
  const moodKeys = moodsByTone[options.tone] || moodsByTone.balanced;
  moodKeys.forEach(k => {
    const preset = VOCAB.MOOD_PRESETS[k];
    if (preset) {
      state.project.libraries.moods.push({
        id: genId(),
        name: preset.label,
        emotions: { ...preset.emotions }
      });
    }
  });
  
  // Generate themes
  const themeKeys = config.themes.length > 0 ? config.themes : Object.keys(VOCAB.THEMES);
  pickN(themeKeys, 2).forEach(k => {
    const t = VOCAB.THEMES[k];
    if (t) state.project.libraries.themes.push({ id: genId(), name: t.label, themeKey: k });
  });
  
  // Generate world rules
  if (ruleCount > 0 && config.rules.length > 0) {
    pickN(config.rules, ruleCount).forEach(r => {
      state.project.libraries.worldRules.push({ id: genId(), ...r });
    });
  }
  
  // Generate structure
  const locs = state.project.libraries.locations;
  const moods = state.project.libraries.moods;
  const objs = state.project.libraries.objects;
  
  state.project.structure = {
    id: genId(),
    type: 'book',
    name: 'Book',
    title: state.project.name,
    children: []
  };
  
  // Create chapters and scenes
  const scenesPerChapter = options.complexity === 'simple' ? 2 : options.complexity === 'complex' ? 4 : 3;
  const numChapters = Math.ceil(numScenes / scenesPerChapter);
  
  let sceneNum = 0;
  for (let ch = 0; ch < numChapters; ch++) {
    const chapter = {
      id: genId(),
      type: 'chapter',
      name: `Ch${ch + 1}`,
      title: '',
      children: []
    };
    
    const scenesInChapter = Math.min(scenesPerChapter, numScenes - sceneNum);
    for (let sc = 0; sc < scenesInChapter; sc++) {
      sceneNum++;
      const scene = {
        id: genId(),
        type: 'scene',
        name: `Sc${ch + 1}.${sc + 1}`,
        title: '',
        children: []
      };
      
      // Add character refs
      if (hero) scene.children.push({ id: genId(), type: 'character-ref', name: hero.name, refId: hero.id });
      const otherChars = chars.filter(c => c !== hero);
      pickN(otherChars, 1 + Math.floor(Math.random() * 2)).forEach(c => {
        scene.children.push({ id: genId(), type: 'character-ref', name: c.name, refId: c.id });
      });
      
      // Add location
      if (locs.length) {
        const loc = pick(locs);
        scene.children.push({ id: genId(), type: 'location-ref', name: loc.name, refId: loc.id });
      }
      
      // Add mood
      if (moods.length) {
        const mood = pick(moods);
        scene.children.push({ id: genId(), type: 'mood-ref', name: mood.name, refId: mood.id });
      }
      
      // Add 1-2 actions
      const actionKeys = Object.keys(VOCAB.ACTIONS);
      pickN(actionKeys, 1 + Math.floor(Math.random() * 2)).forEach(actKey => {
        const act = VOCAB.ACTIONS[actKey];
        const subject = hero?.name || pick(chars)?.name;
        let target = '';
        if (act?.requires?.length > 1) {
          const targetType = act.requires[1];
          if (targetType.includes('character')) target = pick(chars.filter(c => c.name !== subject))?.name || '';
          else if (targetType.includes('location')) target = pick(locs)?.name || '';
          else if (targetType.includes('object')) target = pick(objs)?.name || '';
        }
        scene.children.push({
          id: genId(),
          type: 'action',
          name: `${subject} ${actKey}`,
          actionData: { subject, action: actKey, target }
        });
      });
      
      chapter.children.push(scene);
    }
    
    state.project.structure.children.push(chapter);
  }
  
  // Refresh all views
  renderTree();
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  evaluateMetrics();
}
