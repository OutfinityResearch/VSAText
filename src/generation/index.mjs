/**
 * SCRIPTA SDK - Generation Module
 * 
 * Main entrypoint for story generation functionality.
 * Includes random generation, optimization, and NL generation.
 */

export { generateRandomStory, NARRATIVE_ARCS, GENRE_CONFIG } from './random-generator.mjs';

export { 
  optimizeStory, 
  quickOptimize, 
  applyConstraintOptimizations,
  ensureValidReferences,
  ensureMinimumElements,
  ensureEmotionalArcCoverage,
  normalizeCharacterTraits,
  ensureStructuralCompleteness,
  DEFAULT_CONFIG
} from './optimizer.mjs';

export {
  SUPPORTED_LANGUAGES,
  buildScenePrompt,
  buildChapterPrompt,
  buildFullStoryPrompt,
  validateContent,
  generateStoryByScenes,
  generateStoryByChapters,
  regenerateFailedSections
} from './nl-generator.mjs';

export { sliceCnlToScenes } from './cnl-scene-slicer.mjs';
export { computeSceneRosterViolations, buildSceneRosterRepairPrompt } from './nl-adherence.mjs';

// Re-export for convenience
export { generateRandomStory as generateRandom } from './random-generator.mjs';
