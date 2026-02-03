/**
 * SCRIPTA Demo - Blueprint State Management
 * 
 * Manages blueprint-specific state and operations.
 */

import state, { updateBeatMapping, setTensionCurve, setBlueprintArc, upsertDialogue, upsertSubplot } from '../state.mjs';

// Load narrative arcs data
let arcsData = null;
let templatesData = null;

/**
 * Load blueprint-related data files
 */
export async function loadBlueprintData() {
  try {
    const [arcsRes, templatesRes] = await Promise.all([
      fetch('/src/data/narrative/arcs.json'),
      fetch('/src/data/blueprint/templates.json')
    ]);
    arcsData = await arcsRes.json();
    templatesData = await templatesRes.json();
    return { arcsData, templatesData };
  } catch (err) {
    console.error('Failed to load blueprint data:', err);
    return { arcsData: null, templatesData: null };
  }
}

/**
 * Get all available narrative arcs
 */
export function getArcs() {
  return arcsData?.arcs || {};
}

/**
 * Get arc by key
 */
export function getArc(key) {
  return arcsData?.arcs?.[key] || null;
}

/**
 * Get all story templates
 */
export function getTemplates() {
  return templatesData?.templates || {};
}

/**
 * Get template by key
 */
export function getTemplate(key) {
  return templatesData?.templates?.[key] || null;
}

/**
 * Get beats for the currently selected arc
 */
export function getCurrentArcBeats() {
  const arcKey = state.project.blueprint.arc || state.project.selectedArc;
  const arc = getArc(arcKey);
  return arc?.beats || [];
}

/**
 * Apply a template to the current project
 */
export function applyTemplate(templateKey) {
  const template = getTemplate(templateKey);
  if (!template) return false;
  
  // Set arc
  setBlueprintArc(template.arc);
  
  // Apply tension preset
  if (template.tensionPreset) {
    setTensionCurve(template.tensionPreset.map(p => ({
      position: p.position,
      tension: p.tension
    })));
  }
  
  // Create dialogue markers from template
  if (template.dialogueMarkers) {
    template.dialogueMarkers.forEach((dm, idx) => {
      upsertDialogue({
        id: `dlg_${Date.now()}_${idx}`,
        purpose: dm.purpose,
        participants: [],
        tone: null,
        tension: null,
        beatKey: dm.beatKey,
        location: null,
        exchanges: [],
        description: dm.description
      });
    });
  }
  
  return true;
}

/**
 * Calculate interpolated tension at any position
 * @param {number} position - Position in story (0.0-1.0)
 * @returns {number} - Interpolated tension (1-5)
 */
export function getTensionAtPosition(position) {
  const curve = state.project.blueprint.tensionCurve;
  if (!curve || curve.length === 0) return 3; // Default middle tension
  
  // Sort by position
  const sorted = [...curve].sort((a, b) => a.position - b.position);
  
  // Find surrounding points
  let before = sorted[0];
  let after = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].position <= position) before = sorted[i];
    if (sorted[i].position >= position && after.position > sorted[i].position) {
      after = sorted[i];
      break;
    }
  }
  
  if (before.position === after.position) return before.tension;
  
  // Linear interpolation
  const t = (position - before.position) / (after.position - before.position);
  return Math.round(before.tension + t * (after.tension - before.tension));
}

/**
 * Get beats mapped to chapters
 * @returns {Object} - { chapterId: [beatKey, ...] }
 */
export function getBeatsByChapter() {
  const result = {};
  for (const mapping of state.project.blueprint.beatMappings) {
    if (!result[mapping.chapterId]) result[mapping.chapterId] = [];
    result[mapping.chapterId].push(mapping.beatKey);
  }
  return result;
}

/**
 * Get dialogues for a specific location
 * @param {string} chapterId 
 * @param {string} [sceneId]
 */
export function getDialoguesAtLocation(chapterId, sceneId = null) {
  return state.project.libraries.dialogues.filter(d => {
    if (!d.location) return false;
    if (d.location.chapterId !== chapterId) return false;
    if (sceneId && d.location.sceneId !== sceneId) return false;
    return true;
  });
}

/**
 * Get subplots active at a specific beat position
 * @param {number} position - Position in story (0.0-1.0)
 */
export function getActiveSubplots(position) {
  const arcs = getArcs();
  const currentArc = arcs[state.project.blueprint.arc] || arcs.heros_journey;
  
  return state.project.blueprint.subplots.filter(subplot => {
    const startBeat = currentArc?.beats?.find(b => b.key === subplot.startBeat);
    const resolveBeat = currentArc?.beats?.find(b => b.key === subplot.resolveBeat);
    
    const startPos = startBeat?.position || 0;
    const endPos = resolveBeat?.position || 1;
    
    return position >= startPos && position <= endPos;
  });
}

export default {
  loadBlueprintData,
  getArcs,
  getArc,
  getTemplates,
  getTemplate,
  getCurrentArcBeats,
  applyTemplate,
  getTensionAtPosition,
  getBeatsByChapter,
  getDialoguesAtLocation,
  getActiveSubplots
};
