/**
 * SCRIPTA Demo - Random Generation Strategy
 * 
 * This module wraps the SDK random generator and applies results to demo state.
 * Business logic is in SDK (src/generation/random-generator.mjs).
 */

import { state, createSnapshot } from '../state.mjs';
import { generateRandomStory } from '/src/generation/random-generator.mjs';
import { 
  resetProjectState, 
  refreshAllViews
} from './generation-utils.mjs';
import { updateGenerateButton } from './generation-improve.mjs';

/**
 * Generate a complete story using SDK random generator
 * @param {Object} options - Generation options
 */
export function generateRandom(options) {
  // Reset demo state
  resetProjectState();
  
  // Call SDK generator (pure function, no side effects)
  const result = generateRandomStory({
    genre: options.genre,
    tone: options.tone,
    chars: options.chars,
    length: options.length,
    complexity: options.complexity,
    rules: options.rules,
    title: state.project.name
  });
  
  // Apply result to demo state
  state.project.libraries = {
    characters: result.libraries.characters,
    locations: result.libraries.locations,
    objects: result.libraries.objects,
    moods: result.libraries.moods,
    themes: result.libraries.themes,
    relationships: result.libraries.relationships,
    worldRules: result.libraries.worldRules || [],
    dialogues: result.libraries.dialogues || [],
    emotionalArc: [],
    wisdom: [],
    patterns: []
  };
  
  state.project.structure = result.structure;
  state.project.selectedArc = result.selectedArc;
  
  state.project.blueprint = {
    arc: result.blueprint.arc,
    beatMappings: result.blueprint.beatMappings,
    tensionCurve: result.blueprint.tensionCurve,
    subplots: result.blueprint.subplots || []
  };
  
  // Finalize UI state
  createSnapshot();
  updateGenerateButton();
  refreshAllViews();
}

export default generateRandom;
