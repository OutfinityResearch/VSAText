/**
 * SCRIPTA SDK - Models Module
 * 
 * Data models and structures for story projects.
 */

export {
  createProject,
  createDefaultBlueprint,
  createDefaultLibraries,
  cloneProject,
  loadProject,
  getEntityById,
  upsertEntity,
  removeEntity,
  getDialogue,
  upsertDialogue,
  removeDialogue,
  getSubplot,
  upsertSubplot,
  removeSubplot,
  updateBeatMapping,
  setTensionCurve,
  setBlueprintArc
} from './project.mjs';

export {
  detectChanges,
  detectLibraryChanges,
  detectStructureChanges,
  detectBlueprintChanges,
  hasChanges
} from './change-detection.mjs';
