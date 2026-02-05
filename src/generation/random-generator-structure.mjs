/**
 * SCRIPTA SDK - Random Generator: Structure Helpers
 *
 * Generates the book/chapter/scene tree and post-processes it for coherence.
 * Portable (browser + Node.js).
 */

import { ACTIONS } from '../vocabularies/vocabularies.mjs';
import { makeId } from '../utils/ids.mjs';
import { pick, pickN, humanizeKey } from './random-generator-utils.mjs';

function buildSceneTitle({ primaryActionKey, locationName, chapterIndex, sceneIndex }) {
  const action = humanizeKey(primaryActionKey) || `Scene ${chapterIndex + 1}.${sceneIndex + 1}`;
  const where = locationName ? ` at ${locationName}` : '';
  return `${action}${where}`.trim();
}

function createScene(chapterIndex, sceneIndex, { characters, locations, moods, objects, hero }) {
  const scene = {
    id: makeId('sc'),
    type: 'scene',
    name: `Sc${chapterIndex + 1}.${sceneIndex + 1}`,
    title: '',
    children: []
  };

  const includedCharIds = new Set();
  const includedObjIds = new Set();
  let chosenLocation = null;
  let chosenMood = null;

  function includeCharacter(char) {
    if (!char || includedCharIds.has(char.id)) return;
    includedCharIds.add(char.id);
    scene.children.push({
      id: makeId('ref'),
      type: 'character-ref',
      name: char.name,
      refId: char.id
    });
  }

  function includeObject(obj) {
    if (!obj || includedObjIds.has(obj.id)) return;
    includedObjIds.add(obj.id);
    scene.children.push({
      id: makeId('ref'),
      type: 'object-ref',
      name: obj.name,
      refId: obj.id
    });
  }

  // Characters (ensure hero is included)
  if (hero) includeCharacter(hero);
  const otherChars = characters.filter(c => c && c.id !== hero?.id);
  pickN(otherChars, 1 + Math.floor(Math.random() * 2)).forEach(includeCharacter);
  const sceneCharacters = characters.filter(c => includedCharIds.has(c.id));

  // Location
  if (locations.length) {
    chosenLocation = pick(locations);
    if (chosenLocation) {
      scene.children.push({
        id: makeId('ref'),
        type: 'location-ref',
        name: chosenLocation.name,
        refId: chosenLocation.id
      });
    }
  }

  // Mood
  if (moods.length) {
    chosenMood = pick(moods);
    if (chosenMood) {
      scene.children.push({
        id: makeId('ref'),
        type: 'mood-ref',
        name: chosenMood.name,
        refId: chosenMood.id
      });
    }
  }

  // Actions (targets constrained to entities present in this scene)
  const actionKeys = Object.keys(ACTIONS);
  const chosenActions = pickN(actionKeys, 1 + Math.floor(Math.random() * 2));
  const primaryActionKey = chosenActions[0] || '';

  chosenActions.forEach(actKey => {
    const act = ACTIONS[actKey];
    const subject = pick(sceneCharacters)?.name || hero?.name || pick(characters)?.name;
    let target = '';

    if (act?.requires?.length > 1) {
      const targetType = act.requires[1];
      if (targetType.includes('character')) {
        let targetChar = pick(sceneCharacters.filter(c => c.name !== subject));
        if (!targetChar) {
          targetChar = pick(otherChars.filter(c => c.name !== subject));
          if (targetChar) includeCharacter(targetChar);
        }
        target = targetChar?.name || '';
      } else if (targetType.includes('location')) {
        target = chosenLocation?.name || pick(locations)?.name || '';
      } else if (targetType.includes('object')) {
        const obj = pick(objects);
        if (obj) includeObject(obj);
        target = obj?.name || '';
      }
    }

    scene.children.push({
      id: makeId('act'),
      type: 'action',
      name: `${subject} ${actKey}`,
      actionData: { subject, action: actKey, target }
    });
  });

  scene.title = buildSceneTitle({
    primaryActionKey,
    locationName: chosenLocation?.name,
    chapterIndex,
    sceneIndex
  });

  return scene;
}

export function generateStructure(options, libraries, numScenes) {
  const { characters, locations, moods, objects } = libraries;
  const hero = characters.find(c => c.archetype === 'hero') || characters[0];

  const scenesPerChapter = options.complexity === 'simple' ? 2 :
                           options.complexity === 'complex' ? 4 : 3;
  const numChapters = Math.ceil(numScenes / scenesPerChapter);

  const structure = {
    id: makeId('book'),
    type: 'book',
    name: 'Book',
    title: options.title || 'Untitled Story',
    children: []
  };

  let sceneNum = 0;
  for (let ch = 0; ch < numChapters; ch++) {
    const chapter = {
      id: makeId('ch'),
      type: 'chapter',
      name: `Ch${ch + 1}`,
      title: `Chapter ${ch + 1}`,
      children: []
    };

    const scenesInChapter = Math.min(scenesPerChapter, numScenes - sceneNum);
    for (let sc = 0; sc < scenesInChapter; sc++) {
      sceneNum++;
      chapter.children.push(createScene(ch, sc, { characters, locations, moods, objects, hero }));
    }
    structure.children.push(chapter);
  }

  return structure;
}

export function ensureAllCharactersAppear(structure, characters) {
  const used = new Set();
  const scenes = [];

  for (const chapter of structure?.children || []) {
    for (const scene of chapter.children || []) {
      scenes.push(scene);
      for (const child of scene.children || []) {
        if (child.type === 'character-ref' && child.refId) used.add(child.refId);
      }
    }
  }

  if (scenes.length === 0) return;

  const missing = (characters || []).filter(c => c && c.id && !used.has(c.id));
  for (const char of missing) {
    const targetScene = pick(scenes);
    if (!targetScene) break;
    (targetScene.children || (targetScene.children = [])).push({
      id: makeId('ref'),
      type: 'character-ref',
      name: char.name,
      refId: char.id
    });
  }
}

export function applyBeatTitles(structure, beatMappings) {
  if (!structure?.children?.length || !Array.isArray(beatMappings) || beatMappings.length === 0) return;

  const chapterById = new Map();
  const sceneById = new Map();
  for (const ch of structure.children) {
    chapterById.set(ch.id, ch);
    for (const sc of ch.children || []) sceneById.set(sc.id, sc);
  }

  const firstBeatByChapterId = new Map();
  const usedSceneIds = new Set();

  for (const m of beatMappings) {
    if (!m?.sceneId || usedSceneIds.has(m.sceneId)) continue;
    const sc = sceneById.get(m.sceneId);
    if (sc) {
      sc.title = humanizeKey(m.beatKey) || sc.title;
      usedSceneIds.add(m.sceneId);
    }
    if (m?.chapterId && !firstBeatByChapterId.has(m.chapterId)) {
      firstBeatByChapterId.set(m.chapterId, m.beatKey);
    }
  }

  for (const [chId, beatKey] of firstBeatByChapterId.entries()) {
    const ch = chapterById.get(chId);
    if (!ch) continue;
    if (!ch.title || /^chapter\\s+\\d+$/i.test(String(ch.title).trim())) {
      ch.title = `Chapter ${String(ch.name || '').replace(/^Ch/i, '') || ''}: ${humanizeKey(beatKey)}`.trim();
    }
  }
}

export default { generateStructure, ensureAllCharactersAppear, applyBeatTitles };

