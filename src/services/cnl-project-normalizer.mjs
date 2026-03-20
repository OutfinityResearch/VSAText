/**
 * SCRIPTA SDK - CNL Project Normalizer
 *
 * Repairs sparse story projects before CNL serialization.
 * The goal is not to invent a different story, but to guarantee
 * a minimally useful narrative specification with chapters, scenes,
 * characters, locations, objects, moods, actions, and dialogues.
 */

import VOCAB from '../vocabularies/vocabularies.mjs';
import { makeId } from '../utils/ids.mjs';

const LIBRARY_KEYS = [
  'characters', 'locations', 'objects', 'moods', 'emotionalArc',
  'themes', 'relationships', 'worldRules', 'dialogues', 'wisdom', 'patterns'
];

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project || {}));
}

function ensureLibraries(project) {
  const libraries = project.libraries || (project.libraries = {});
  for (const key of LIBRARY_KEYS) {
    if (!Array.isArray(libraries[key])) libraries[key] = [];
  }
  return libraries;
}

function pickUnusedName(usedNames, values, fallback) {
  for (const value of values) {
    if (!usedNames.has(value)) {
      usedNames.add(value);
      return value;
    }
  }
  return fallback;
}

function ensureMinimumLibraries(project) {
  const libraries = ensureLibraries(project);

  const usedCharacterNames = new Set(libraries.characters.map(item => item?.name).filter(Boolean));
  while (libraries.characters.length < 2) {
    libraries.characters.push({
      id: makeId('char'),
      name: pickUnusedName(usedCharacterNames, VOCAB.NAMES.characters, `Character ${libraries.characters.length + 1}`),
      archetype: libraries.characters.length === 0 ? 'hero' : 'ally',
      traits: libraries.characters.length === 0 ? ['curious', 'resilient'] : ['loyal', 'perceptive']
    });
  }

  const usedLocationNames = new Set(libraries.locations.map(item => item?.name).filter(Boolean));
  while (libraries.locations.length < 2) {
    libraries.locations.push({
      id: makeId('loc'),
      name: pickUnusedName(usedLocationNames, VOCAB.NAMES.locations, `Location ${libraries.locations.length + 1}`),
      geography: libraries.locations.length === 0 ? 'city' : 'ruins',
      time: 'present',
      characteristics: libraries.locations.length === 0
        ? ['crowded', 'restless']
        : ['ancient', 'silent']
    });
  }

  const usedObjectNames = new Set(libraries.objects.map(item => item?.name).filter(Boolean));
  while (libraries.objects.length < 1) {
    libraries.objects.push({
      id: makeId('obj'),
      name: pickUnusedName(usedObjectNames, VOCAB.NAMES.objects, 'Story Key'),
      objectType: 'artifact',
      significance: 'important',
      function: 'Connects clues across scenes'
    });
  }

  const moodTemplates = [
    { key: 'mysterious', fallback: 'Mysterious' },
    { key: 'tense', fallback: 'Tense' },
    { key: 'triumphant', fallback: 'Triumphant' }
  ];
  for (const template of moodTemplates) {
    if (libraries.moods.some(item => String(item?.name || '').toLowerCase() === template.fallback.toLowerCase())) continue;
    if (libraries.moods.length >= 3) break;
    const preset = VOCAB.MOOD_PRESETS[template.key];
    libraries.moods.push({
      id: makeId('mood'),
      name: preset?.label || template.fallback,
      emotions: preset?.emotions ? { ...preset.emotions } : { tension: 3, hope: 2 }
    });
  }

  if (libraries.themes.length < 1) {
    libraries.themes.push({
      id: makeId('theme'),
      name: 'Transformation',
      themeKey: 'transformation',
      description: 'Characters are changed by what they discover and confront.'
    });
  }

  for (const character of libraries.characters) {
    if (!character.id) character.id = makeId('char');
    if (!character.name) character.name = 'Character';
    if (!character.archetype) character.archetype = 'character';
    if (!Array.isArray(character.traits)) character.traits = [];
    if (character.traits.length === 0) character.traits = ['determined', 'observant'];
    if (!character.motivation) character.motivation = `Understand what is hidden behind ${project.name || 'the central mystery'}`;
    if (!character.objectives) character.objectives = 'Reach the truth and survive the consequences';
    if (!character.backstory) character.backstory = `${character.name} carries unresolved history that shapes every decision.`;
    if (!character.secrets) character.secrets = `${character.name} hides a fear that can be exploited under pressure.`;
  }

  for (const location of libraries.locations) {
    if (!location.id) location.id = makeId('loc');
    if (!location.name) location.name = 'Location';
    if (!location.geography) location.geography = 'place';
    if (!location.time) location.time = 'present';
    if (!Array.isArray(location.characteristics)) location.characteristics = [];
    if (location.characteristics.length === 0) location.characteristics = ['evocative', 'dangerous'];
  }

  for (const object of libraries.objects) {
    if (!object.id) object.id = makeId('obj');
    if (!object.name) object.name = 'Object';
    if (!object.objectType) object.objectType = 'object';
    if (!object.significance) object.significance = 'important';
    if (!object.function) object.function = 'Moves the plot forward when discovered or lost';
    if (!object.symbolism) object.symbolism = 'A material sign of what the characters truly seek';
  }

  for (const mood of libraries.moods) {
    if (!mood.id) mood.id = makeId('mood');
    if (!mood.name) mood.name = 'Mood';
    if (!mood.emotions || typeof mood.emotions !== 'object') {
      mood.emotions = { tension: 3 };
    }
  }
}

function ensureStructure(project) {
  if (!project.structure || typeof project.structure !== 'object') {
    project.structure = {
      id: makeId('book'),
      type: 'book',
      name: 'Book',
      title: project.name || 'Untitled Story',
      children: []
    };
  }

  if (project.structure.type !== 'book') {
    project.structure = {
      id: project.structure.id || makeId('book'),
      type: 'book',
      name: 'Book',
      title: project.name || project.structure.title || 'Untitled Story',
      children: Array.isArray(project.structure.children) ? project.structure.children : []
    };
  }

  if (!project.structure.name) project.structure.name = 'Book';
  if (!project.structure.title) project.structure.title = project.name || 'Untitled Story';
  if (!Array.isArray(project.structure.children)) project.structure.children = [];
}

function getTargetShape(project) {
  const profile = project?.libraries?.frameworkProfile || {};
  const length = profile?.storyCore?.length || 'medium';
  if (length === 'short') return { chapters: 2, scenesPerChapter: 2 };
  if (length === 'long') return { chapters: 4, scenesPerChapter: 3 };
  return { chapters: 3, scenesPerChapter: 2 };
}

function ensureReference(scene, type, entity) {
  if (!entity) return;
  if ((scene.children || []).some(child => child?.type === `${type}-ref` && child.refId === entity.id)) return;
  scene.children.push({
    id: makeId('ref'),
    type: `${type}-ref`,
    name: entity.name,
    refId: entity.id
  });
}

function ensureAction(scene, chapterIndex, libraries) {
  const actions = (scene.children || []).filter(child => child?.type === 'action');
  if (actions.some(action => action?.actionData?.subject && action?.actionData?.action)) return;

  const characters = (scene.children || []).filter(child => child?.type === 'character-ref');
  const locations = (scene.children || []).filter(child => child?.type === 'location-ref');
  const objects = (scene.children || []).filter(child => child?.type === 'object-ref');
  const subjectName = characters[0]?.name || libraries.characters[0]?.name || 'Hero';
  const locationName = locations[0]?.name || libraries.locations[0]?.name || 'Unknown Place';
  const objectName = objects[0]?.name || libraries.objects[0]?.name || '';
  const action = chapterIndex === 0 ? 'discovers' : 'confronts';

  scene.children.push({
    id: makeId('act'),
    type: 'action',
    name: `${subjectName} ${action}`,
    actionData: {
      subject: subjectName,
      action,
      target: objectName || locationName
    }
  });
}

function ensureDialogue(scene, chapter, chapterIndex, sceneIndex, libraries) {
  const dialogueRefs = (scene.children || []).filter(child => child?.type === 'dialogue-ref');
  if (dialogueRefs.length > 0) return;

  const participants = (scene.children || [])
    .filter(child => child?.type === 'character-ref' && child.refId)
    .slice(0, 2)
    .map((child, index) => ({
      characterId: child.refId,
      role: index === 0 ? 'speaker' : 'listener'
    }));

  if (participants.length < 2) return;

  const speaker = libraries.characters.find(item => item.id === participants[0].characterId);
  const listener = libraries.characters.find(item => item.id === participants[1].characterId);
  const dialogueId = `D${libraries.dialogues.length + 1}`;

  libraries.dialogues.push({
    id: dialogueId,
    purpose: chapterIndex === 0 ? 'exposition' : (sceneIndex === 0 ? 'planning' : 'confrontation'),
    participants,
    tone: chapterIndex === 0 ? 'curious' : 'tense',
    tension: Math.min(5, chapterIndex + sceneIndex + 2),
    location: {
      chapterId: chapter.name || `Ch${chapterIndex + 1}`,
      sceneId: scene.name || `Sc${chapterIndex + 1}.${sceneIndex + 1}`
    },
    exchanges: [
      {
        speakerId: speaker?.id || participants[0].characterId,
        intent: 'Reveal a hidden problem',
        emotion: 'uneasy',
        information: `${speaker?.name || 'The speaker'} shares a clue that changes the scene.`,
        subtext: `${speaker?.name || 'The speaker'} fears the truth may cost too much.`,
        sketch: `${speaker?.name || 'Speaker'} opens the conflict and tests the other person.`
      },
      {
        speakerId: listener?.id || participants[1].characterId,
        intent: 'Challenge the revelation',
        emotion: 'guarded',
        information: `${listener?.name || 'The listener'} questions the cost of moving forward.`,
        subtext: `${listener?.name || 'The listener'} wants control, not comfort.`,
        sketch: `${listener?.name || 'Listener'} resists, but cannot ignore what was revealed.`
      }
    ]
  });

  scene.children.push({
    id: makeId('ref'),
    type: 'dialogue-ref',
    name: dialogueId,
    refId: dialogueId
  });
}

function pickDistinctCharacter(characters, preferredIndex, excludeId) {
  if (!Array.isArray(characters) || characters.length === 0) return null;
  for (let offset = 0; offset < characters.length; offset += 1) {
    const character = characters[(preferredIndex + offset) % characters.length];
    if (character && character.id !== excludeId) return character;
  }
  return characters[0] || null;
}

function deriveSceneTitle(scene, chapterIndex, sceneIndex) {
  if (String(scene.title || '').trim()) return;
  const action = (scene.children || []).find(child => child?.type === 'action' && child?.actionData?.action);
  const location = (scene.children || []).find(child => child?.type === 'location-ref');
  const actionText = action?.actionData?.action
    ? String(action.actionData.action).replace(/_/g, ' ')
    : `Scene ${chapterIndex + 1}.${sceneIndex + 1}`;
  const locationText = location?.name ? ` at ${location.name}` : '';
  scene.title = `${actionText}${locationText}`.trim();
}

function ensureNarrativeShape(project) {
  const libraries = ensureLibraries(project);
  ensureStructure(project);
  const { chapters, scenesPerChapter } = getTargetShape(project);

  while (project.structure.children.length < chapters) {
    const chapterIndex = project.structure.children.length;
    project.structure.children.push({
      id: makeId('ch'),
      type: 'chapter',
      name: `Ch${chapterIndex + 1}`,
      title: `Chapter ${chapterIndex + 1}`,
      children: []
    });
  }

  project.structure.children = project.structure.children
    .filter(node => node && node.type === 'chapter')
    .map((chapter, chapterIndex) => {
      if (!chapter.id) chapter.id = makeId('ch');
      if (!chapter.name) chapter.name = `Ch${chapterIndex + 1}`;
      if (!chapter.title) chapter.title = `Chapter ${chapterIndex + 1}`;
      if (!Array.isArray(chapter.children)) chapter.children = [];

      while (chapter.children.length < scenesPerChapter) {
        const sceneIndex = chapter.children.length;
        chapter.children.push({
          id: makeId('sc'),
          type: 'scene',
          name: `Sc${chapterIndex + 1}.${sceneIndex + 1}`,
          title: '',
          children: []
        });
      }

      chapter.children = chapter.children
        .filter(node => node && node.type === 'scene')
        .map((scene, sceneIndex) => {
          if (!scene.id) scene.id = makeId('sc');
          if (!scene.name) scene.name = `Sc${chapterIndex + 1}.${sceneIndex + 1}`;
          if (!Array.isArray(scene.children)) scene.children = [];

          const firstCharacter = libraries.characters[chapterIndex % libraries.characters.length];
          const secondCharacter = pickDistinctCharacter(
            libraries.characters,
            chapterIndex + sceneIndex + 1,
            firstCharacter?.id || null
          );
          const location = libraries.locations[(chapterIndex + sceneIndex) % libraries.locations.length];
          const mood = libraries.moods[(chapterIndex + sceneIndex) % libraries.moods.length];
          const object = libraries.objects[chapterIndex % libraries.objects.length];

          ensureReference(scene, 'character', firstCharacter);
          ensureReference(scene, 'character', secondCharacter);
          ensureReference(scene, 'location', location);
          ensureReference(scene, 'mood', mood);
          if (sceneIndex === 0 || chapterIndex === project.structure.children.length - 1) {
            ensureReference(scene, 'object', object);
          }

          ensureAction(scene, chapterIndex, libraries);
          deriveSceneTitle(scene, chapterIndex, sceneIndex);
          ensureDialogue(scene, chapter, chapterIndex, sceneIndex, libraries);

          return scene;
        });

      return chapter;
    });
}

export function prepareProjectForCNL(project) {
  const normalized = cloneProject(project);
  normalized.name = normalized.name || 'Untitled Story';
  normalized.selectedArc = normalized.selectedArc || normalized?.blueprint?.arc || 'heros_journey';
  if (!normalized.blueprint || typeof normalized.blueprint !== 'object') {
    normalized.blueprint = { arc: normalized.selectedArc, beatMappings: [], tensionCurve: [], subplots: [] };
  }
  if (!normalized.blueprint.arc) normalized.blueprint.arc = normalized.selectedArc;
  if (!Array.isArray(normalized.blueprint.beatMappings)) normalized.blueprint.beatMappings = [];
  if (!Array.isArray(normalized.blueprint.tensionCurve)) normalized.blueprint.tensionCurve = [];
  if (!Array.isArray(normalized.blueprint.subplots)) normalized.blueprint.subplots = [];

  ensureMinimumLibraries(normalized);
  ensureNarrativeShape(normalized);
  return normalized;
}

export default { prepareProjectForCNL };
