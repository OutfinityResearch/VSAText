/**
 * SCRIPTA SDK - Random Generator: Blueprint Helpers
 *
 * Generates blueprint beat mappings, tension curve, and dialogue stubs.
 * Portable (browser + Node.js).
 */

import { makeId } from '../utils/ids.mjs';
import { NARRATIVE_ARCS } from './random-generator-config.mjs';

function getToneFromPurpose(purpose) {
  const mapping = {
    exposition: 'neutral',
    revelation: 'dramatic',
    conflict: 'tense',
    confrontation: 'aggressive',
    bonding: 'warm',
    confession: 'intimate',
    advice: 'warm',
    decision: 'serious',
    planning: 'focused',
    resolution: 'warm'
  };
  return mapping[purpose] || 'neutral';
}

function getTensionForBeat(beatKey) {
  const tensions = {
    // Scale: 1..5 (matches DS11 examples and UI expectations)
    ordinary_world: 1, call_to_adventure: 3, refusal: 3,
    meeting_mentor: 2, crossing_threshold: 3, tests_allies_enemies: 4,
    approach: 4, ordeal: 5, reward: 3, road_back: 4,
    resurrection: 5, return: 2,
    setup: 1, inciting_incident: 3, first_plot_point: 4,
    rising_action: 4, midpoint: 4, complications: 5,
    crisis: 5, climax: 5, resolution: 2,
    exposition: 1, falling_action: 3, denouement: 2,

    // Save the Cat beats
    opening_image: 1,
    theme_stated: 2,
    catalyst: 3,
    debate: 3,
    break_into_two: 3,
    b_story: 2,
    fun_and_games: 4,
    bad_guys_close_in: 4,
    all_is_lost: 5,
    dark_night: 4,
    break_into_three: 4,
    finale: 5,
    final_image: 2
  };
  return tensions[beatKey] || 3;
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

function createDialogueForBeat(beat, chapter, scene, characters) {
  const sceneChars = scene.children
    .filter(c => c.type === 'character-ref')
    .map(c => characters.find(ch => ch.id === c.refId))
    .filter(Boolean);

  const participants = [];
  if (sceneChars.length >= 1) {
    participants.push({ characterId: sceneChars[0].id, role: 'speaker' });
  }
  if (sceneChars.length >= 2) {
    participants.push({ characterId: sceneChars[1].id, role: 'listener' });
  }

  return {
    id: makeId('dlg'),
    purpose: beat.dialoguePurpose,
    participants,
    tone: getToneFromPurpose(beat.dialoguePurpose),
    tension: Math.ceil(beat.position * 5),
    beatKey: beat.key,
    location: {
      chapterId: chapter.id,
      sceneId: scene.id
    },
    exchanges: []
  };
}

export function generateBlueprint(arcName, structure, characters, numScenes) {
  const arcBeats = NARRATIVE_ARCS[arcName] || NARRATIVE_ARCS.heros_journey;
  const chapters = structure.children;

  const beatMappings = [];
  const dialogues = [];

  arcBeats.forEach(beat => {
    const targetSceneIndex = Math.floor(beat.position * numScenes);
    const { chapter, scene } = findSceneByIndex(chapters, targetSceneIndex);

    if (chapter && scene) {
      beatMappings.push({
        beatKey: beat.key,
        chapterId: chapter.id,
        sceneId: scene.id,
        tension: Math.ceil(beat.position * 5)
      });

      if (beat.dialoguePurpose) {
        const dialogue = createDialogueForBeat(beat, chapter, scene, characters);
        dialogues.push(dialogue);

        scene.children.push({
          id: makeId('ref'),
          type: 'dialogue-ref',
          name: `[${beat.dialoguePurpose}]`,
          refId: dialogue.id
        });
      }
    }
  });

  const tensionCurve = arcBeats
    .filter((_, i) => i % 2 === 0)
    .map(beat => ({
      position: beat.position,
      tension: getTensionForBeat(beat.key)
    }));

  return {
    arc: arcName,
    beatMappings,
    tensionCurve,
    dialogues
  };
}

export default { generateBlueprint };

