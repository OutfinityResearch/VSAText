/**
 * SCRIPTA Demo - Random Generation Strategy
 * 
 * Fast, deterministic generation using predefined vocabularies and templates.
 */

import { state, upsertDialogue, updateBeatMapping, setBlueprintArc, createSnapshot } from '../state.mjs';
import { genId, pick, pickN } from '../utils.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { 
  NARRATIVE_ARCS, 
  GENRE_CONFIG, 
  COUNTS, 
  MOODS_BY_TONE,
  getTensionForBeat,
  getArcForGenre,
  getGenreConfig
} from './generation-config.mjs';
import { 
  resetProjectState, 
  refreshAllViews,
  generatePlaceholderExchanges,
  getToneFromPurpose
} from './generation-utils.mjs';
import { updateGenerateButton } from './generation-improve.mjs';

/**
 * Generate a complete story using random selection from vocabularies
 * @param {Object} options - Generation options
 */
export function generateRandom(options) {
  // Reset state
  resetProjectState();
  
  const config = getGenreConfig(options.genre);
  
  // Calculate counts
  const [minChars, maxChars] = COUNTS.characters[options.chars] || [4, 6];
  const [minScenes, maxScenes] = COUNTS.scenes[options.length] || [8, 12];
  const ruleCount = calculateRuleCount(options.rules);
  
  const numChars = minChars + Math.floor(Math.random() * (maxChars - minChars + 1));
  const numScenes = minScenes + Math.floor(Math.random() * (maxScenes - minScenes + 1));
  
  // Generate entities
  generateCharacters(config, numChars);
  generateRelationships();
  generateLocations(config, numScenes);
  generateObjects(config, numChars);
  generateMoods(options.tone);
  generateThemes(config);
  generateWorldRules(config, ruleCount);
  
  // Generate structure
  generateStructure(options, numScenes);
  
  // Apply narrative arc
  applyNarrativeArc(options.genre, numScenes);
  
  // Finalize
  createSnapshot();
  updateGenerateButton();
  refreshAllViews();
}

// ============================================
// ENTITY GENERATION
// ============================================

function generateCharacters(config, numChars) {
  const archetypes = config.archetypes;
  
  for (let i = 0; i < numChars; i++) {
    const arch = archetypes[i % archetypes.length];
    const archData = VOCAB.CHARACTER_ARCHETYPES[arch];
    const name = pick(VOCAB.NAMES.characters.filter(n => 
      !state.project.libraries.characters.find(c => c.name === n)
    ));
    
    if (!name) continue;
    
    state.project.libraries.characters.push({
      id: genId(),
      name: name,
      archetype: arch,
      traits: [...(archData?.suggestedTraits || []), ...pickN(Object.keys(VOCAB.CHARACTER_TRAITS), 2)]
    });
  }
}

function generateRelationships() {
  const chars = state.project.libraries.characters;
  const hero = chars.find(c => c.archetype === 'hero') || chars[0];
  
  chars.forEach(c => {
    if (c === hero) return;
    
    const relType = getRelationshipType(c.archetype);
    state.project.libraries.relationships.push({
      id: genId(),
      fromId: hero?.id,
      toId: c.id,
      type: relType
    });
  });
}

function getRelationshipType(archetype) {
  const mapping = {
    mentor: 'mentor_student',
    shadow: 'rivals',
    ally: 'friends',
    trickster: 'acquaintances'
  };
  return mapping[archetype] || 'acquaintances';
}

function generateLocations(config, numScenes) {
  const numLocs = Math.max(2, Math.floor(numScenes / 3));
  const geos = config.geographies.length > 0 ? config.geographies : Object.keys(VOCAB.LOCATION_GEOGRAPHY);
  
  pickN(geos, numLocs).forEach(geo => {
    const name = pick(VOCAB.NAMES.locations.filter(n => 
      !state.project.libraries.locations.find(l => l.name === n)
    ));
    
    if (!name) return;
    
    state.project.libraries.locations.push({
      id: genId(),
      name: name,
      geography: geo,
      time: pick(Object.keys(VOCAB.LOCATION_TIME)),
      characteristics: pickN(Object.keys(VOCAB.LOCATION_CHARACTERISTICS), 2)
    });
  });
}

function generateObjects(config, numChars) {
  const numObjs = Math.max(1, Math.floor(numChars / 2));
  const objTypes = config.objectTypes.length > 0 ? config.objectTypes : Object.keys(VOCAB.OBJECT_TYPES);
  const objNames = config.objectNames?.length > 0 ? config.objectNames : VOCAB.NAMES.objects;
  const hero = state.project.libraries.characters.find(c => c.archetype === 'hero');
  
  const availableNames = objNames.filter(n => 
    !state.project.libraries.objects.find(o => o.name === n)
  );
  
  pickN(availableNames, numObjs).forEach(name => {
    state.project.libraries.objects.push({
      id: genId(),
      name: name,
      objectType: pick(objTypes),
      significance: pick(['important', 'central', 'chekhov']),
      ownerId: Math.random() > 0.5 ? hero?.id : null
    });
  });
}

function generateMoods(tone) {
  const moodKeys = MOODS_BY_TONE[tone] || MOODS_BY_TONE.balanced;
  
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
}

function generateThemes(config) {
  const themeKeys = config.themes.length > 0 ? config.themes : Object.keys(VOCAB.THEMES);
  
  pickN(themeKeys, 2).forEach(k => {
    const t = VOCAB.THEMES[k];
    if (t) {
      state.project.libraries.themes.push({ 
        id: genId(), 
        name: t.label, 
        themeKey: k 
      });
    }
  });
}

function generateWorldRules(config, ruleCount) {
  if (ruleCount > 0 && config.rules.length > 0) {
    pickN(config.rules, ruleCount).forEach(r => {
      state.project.libraries.worldRules.push({ id: genId(), ...r });
    });
  }
}

function calculateRuleCount(rulesOption) {
  if (rulesOption === 'none') return 0;
  const counts = COUNTS.rules[rulesOption];
  if (Array.isArray(counts)) {
    return counts[0] + Math.floor(Math.random() * (counts[1] - counts[0] + 1));
  }
  return 0;
}

// ============================================
// STRUCTURE GENERATION
// ============================================

function generateStructure(options, numScenes) {
  const chars = state.project.libraries.characters;
  const locs = state.project.libraries.locations;
  const moods = state.project.libraries.moods;
  const objs = state.project.libraries.objects;
  const hero = chars.find(c => c.archetype === 'hero') || chars[0];
  
  state.project.structure = {
    id: genId(),
    type: 'book',
    name: 'Book',
    title: state.project.name,
    children: []
  };
  
  const scenesPerChapter = options.complexity === 'simple' ? 2 : 
                           options.complexity === 'complex' ? 4 : 3;
  const numChapters = Math.ceil(numScenes / scenesPerChapter);
  
  let sceneNum = 0;
  for (let ch = 0; ch < numChapters; ch++) {
    const chapter = createChapter(ch);
    const scenesInChapter = Math.min(scenesPerChapter, numScenes - sceneNum);
    
    for (let sc = 0; sc < scenesInChapter; sc++) {
      sceneNum++;
      const scene = createScene(ch, sc, { chars, locs, moods, objs, hero });
      chapter.children.push(scene);
    }
    
    state.project.structure.children.push(chapter);
  }
}

function createChapter(index) {
  return {
    id: genId(),
    type: 'chapter',
    name: `Ch${index + 1}`,
    title: '',
    children: []
  };
}

function createScene(chapterIndex, sceneIndex, { chars, locs, moods, objs, hero }) {
  const scene = {
    id: genId(),
    type: 'scene',
    name: `Sc${chapterIndex + 1}.${sceneIndex + 1}`,
    title: '',
    children: []
  };
  
  // Add character refs
  if (hero) {
    scene.children.push({ 
      id: genId(), 
      type: 'character-ref', 
      name: hero.name, 
      refId: hero.id 
    });
  }
  
  const otherChars = chars.filter(c => c !== hero);
  pickN(otherChars, 1 + Math.floor(Math.random() * 2)).forEach(c => {
    scene.children.push({ 
      id: genId(), 
      type: 'character-ref', 
      name: c.name, 
      refId: c.id 
    });
  });
  
  // Add location
  if (locs.length) {
    const loc = pick(locs);
    scene.children.push({ 
      id: genId(), 
      type: 'location-ref', 
      name: loc.name, 
      refId: loc.id 
    });
  }
  
  // Add mood
  if (moods.length) {
    const mood = pick(moods);
    scene.children.push({ 
      id: genId(), 
      type: 'mood-ref', 
      name: mood.name, 
      refId: mood.id 
    });
  }
  
  // Add actions
  addActionsToScene(scene, { chars, locs, objs, hero });
  
  return scene;
}

function addActionsToScene(scene, { chars, locs, objs, hero }) {
  const actionKeys = Object.keys(VOCAB.ACTIONS);
  
  pickN(actionKeys, 1 + Math.floor(Math.random() * 2)).forEach(actKey => {
    const act = VOCAB.ACTIONS[actKey];
    const subject = hero?.name || pick(chars)?.name;
    let target = '';
    
    if (act?.requires?.length > 1) {
      const targetType = act.requires[1];
      if (targetType.includes('character')) {
        target = pick(chars.filter(c => c.name !== subject))?.name || '';
      } else if (targetType.includes('location')) {
        target = pick(locs)?.name || '';
      } else if (targetType.includes('object')) {
        target = pick(objs)?.name || '';
      }
    }
    
    scene.children.push({
      id: genId(),
      type: 'action',
      name: `${subject} ${actKey}`,
      actionData: { subject, action: actKey, target }
    });
  });
}

// ============================================
// NARRATIVE ARC APPLICATION
// ============================================

function applyNarrativeArc(genre, numScenes) {
  const selectedArc = getArcForGenre(genre);
  setBlueprintArc(selectedArc);
  
  const arcBeats = NARRATIVE_ARCS[selectedArc] || NARRATIVE_ARCS.heros_journey;
  const chapters = state.project.structure.children;
  
  // Map beats to scenes
  arcBeats.forEach(beat => {
    const targetSceneIndex = Math.floor(beat.position * numScenes);
    const { chapter, scene } = findSceneByIndex(chapters, targetSceneIndex);
    
    if (chapter && scene) {
      // Create beat mapping
      updateBeatMapping(beat.key, {
        chapterId: chapter.id,
        sceneId: scene.id,
        tension: Math.ceil(beat.position * 5)
      });
      
      // Create dialogue if beat has purpose
      if (beat.dialoguePurpose) {
        createDialogueForBeat(beat, chapter, scene);
      }
    }
  });
  
  // Generate tension curve
  const tensionCurve = arcBeats
    .filter((_, i) => i % 2 === 0)
    .map(beat => ({
      position: beat.position,
      tension: getTensionForBeat(beat.key)
    }));
  
  state.project.blueprint.tensionCurve = tensionCurve;
}

function findSceneByIndex(chapters, targetIndex) {
  let sceneCount = 0;
  
  for (const ch of chapters) {
    for (const sc of ch.children || []) {
      if (sceneCount === targetIndex) {
        return { chapter: ch, scene: sc };
      }
      sceneCount++;
    }
  }
  
  return { chapter: null, scene: null };
}

function createDialogueForBeat(beat, chapter, scene) {
  const sceneChars = scene.children
    .filter(c => c.type === 'character-ref')
    .map(c => state.project.libraries.characters.find(ch => ch.id === c.refId))
    .filter(Boolean);
  
  const participants = [];
  if (sceneChars.length >= 1) {
    participants.push({ characterId: sceneChars[0].id, role: 'speaker' });
  }
  if (sceneChars.length >= 2) {
    participants.push({ characterId: sceneChars[1].id, role: 'listener' });
  }
  
  const dialogue = {
    id: genId(),
    purpose: beat.dialoguePurpose,
    participants,
    tone: getToneFromPurpose(beat.dialoguePurpose),
    tension: Math.ceil(beat.position * 5),
    beatKey: beat.key,
    location: {
      chapterId: chapter.id,
      sceneId: scene.id
    },
    exchanges: generatePlaceholderExchanges(beat.dialoguePurpose, sceneChars)
  };
  
  upsertDialogue(dialogue);
  
  scene.children.push({
    id: genId(),
    type: 'dialogue-ref',
    name: `[${beat.dialoguePurpose}]`,
    refId: dialogue.id
  });
}

export default generateRandom;
