/**
 * SCRIPTA Demo - Generation Utilities
 * 
 * Shared utility functions for all generation strategies.
 */

import { state } from '../state.mjs';
import { genId } from '../utils.mjs';
import { renderTree } from '../tree.mjs';
import { renderEntityGrid } from '../entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from '../views.mjs';
import { renderEmptyMetrics } from '../metrics.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { DIALOGUE_TEMPLATES, PURPOSE_TO_TONE, getTensionForBeat } from './generation-config.mjs';

// ============================================
// UI REFRESH
// ============================================

/**
 * Refresh all UI views after generation
 */
export function refreshAllViews() {
  renderTree();
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
}

// ============================================
// PROGRESS INDICATOR
// ============================================

/**
 * Show generation status indicator
 */
export function showGenerationStatus(message) {
  let statusEl = document.getElementById('generation-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'generation-status';
    statusEl.className = 'generation-progress active';
    statusEl.innerHTML = `
      <div class="progress-header">
        <span class="progress-title">Generating...</span>
        <span class="progress-percent">0%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
      <div class="progress-status">${message}</div>
    `;
    document.getElementById('generate-modal-body')?.appendChild(statusEl);
  }
  
  statusEl.querySelector('.progress-status').textContent = message;
  statusEl.classList.add('active');
  return statusEl;
}

/**
 * Update generation status
 */
export function updateGenerationStatus(statusEl, message, progress) {
  if (!statusEl) return;
  statusEl.querySelector('.progress-status').textContent = message;
  statusEl.querySelector('.progress-percent').textContent = `${Math.round(progress)}%`;
  statusEl.querySelector('.progress-bar').style.width = `${progress}%`;
}

/**
 * Hide generation status
 */
export function hideGenerationStatus(statusEl) {
  if (statusEl) {
    statusEl.classList.remove('active');
    setTimeout(() => statusEl.remove(), 300);
  }
}

// ============================================
// PROJECT STATE MANIPULATION
// ============================================

/**
 * Reset project libraries and blueprint for fresh generation
 */
export function resetProjectState() {
  state.project.libraries = {
    characters: [], locations: [], objects: [], moods: [],
    emotionalArc: [], themes: [], relationships: [], worldRules: [],
    dialogues: []
  };
  
  state.project.blueprint = {
    arc: 'heros_journey',
    beatMappings: [],
    tensionCurve: [],
    subplots: []
  };
}

/**
 * Load project data directly into state
 */
export function loadProjectData(projectData) {
  if (projectData.libraries) {
    state.project.libraries = {
      ...state.project.libraries,
      ...projectData.libraries
    };
  }
  if (projectData.structure) {
    state.project.structure = projectData.structure;
  }
  if (projectData.blueprint) {
    state.project.blueprint = projectData.blueprint;
  }
}

/**
 * Load CNL string and parse into state
 * (Placeholder - would use CNL parser)
 */
export async function loadCNLIntoState(cnlText) {
  console.log('CNL to parse:', cnlText.substring(0, 200) + '...');
  // TODO: Integrate with CNL parser when available
}

// ============================================
// DIALOGUE GENERATION
// ============================================

/**
 * Generate placeholder dialogue exchanges based on purpose
 */
export function generatePlaceholderExchanges(purpose, characters) {
  if (!characters || characters.length === 0) return [];
  
  const template = DIALOGUE_TEMPLATES[purpose] || DIALOGUE_TEMPLATES.exposition;
  const exchanges = [];
  
  template.forEach((t, i) => {
    const charIndex = i % characters.length;
    exchanges.push({
      speakerId: characters[charIndex]?.id || 'unknown',
      intent: t.intent,
      emotion: t.emotion,
      sketch: `[${characters[charIndex]?.name || 'Character'}: ${t.intent}...]`
    });
  });
  
  return exchanges;
}

/**
 * Get dialogue tone from purpose
 */
export function getToneFromPurpose(purpose) {
  return PURPOSE_TO_TONE[purpose] || 'neutral';
}

// ============================================
// ENTITY VALIDATION
// ============================================

/**
 * Ensure all references in scenes point to valid entities
 */
export function ensureValidReferences() {
  if (!state.project.structure?.children) return;
  
  const charIds = new Set(state.project.libraries.characters.map(c => c.id));
  const locIds = new Set(state.project.libraries.locations.map(l => l.id));
  const objIds = new Set(state.project.libraries.objects.map(o => o.id));
  
  for (const chapter of state.project.structure.children) {
    for (const scene of chapter.children || []) {
      scene.children = (scene.children || []).filter(child => {
        if (child.type === 'character-ref') return charIds.has(child.refId);
        if (child.type === 'location-ref') return locIds.has(child.refId);
        if (child.type === 'object-ref') return objIds.has(child.refId);
        return true;
      });
    }
  }
}

/**
 * Ensure minimum required elements exist
 */
export function ensureMinimumElements() {
  const libs = state.project.libraries;
  
  // Need at least 2 characters
  if (libs.characters.length < 2) {
    const usedNames = libs.characters.map(c => c.name);
    const name = VOCAB.NAMES.characters.find(n => !usedNames.includes(n));
    if (name) {
      libs.characters.push({
        id: genId(),
        name,
        archetype: 'ally',
        traits: ['loyal', 'brave']
      });
    }
  }
  
  // Need at least 1 location
  if (libs.locations.length < 1) {
    const usedNames = libs.locations.map(l => l.name);
    const name = VOCAB.NAMES.locations.find(n => !usedNames.includes(n));
    if (name) {
      libs.locations.push({
        id: genId(),
        name,
        geography: 'village',
        time: 'medieval',
        characteristics: ['bustling']
      });
    }
  }
  
  // Need at least 1 theme
  if (libs.themes.length < 1) {
    const themeKeys = Object.keys(VOCAB.THEMES);
    const themeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const t = VOCAB.THEMES[themeKey];
    if (t) {
      libs.themes.push({ id: genId(), name: t.label, themeKey });
    }
  }
}

/**
 * Ensure emotional arc has mood coverage
 */
export function ensureEmotionalArcCoverage() {
  const libs = state.project.libraries;
  
  if (libs.moods.length < 3) {
    const moodKeys = ['mysterious', 'tense', 'triumphant'];
    for (const k of moodKeys) {
      if (!libs.moods.find(m => m.name.toLowerCase() === k)) {
        const preset = VOCAB.MOOD_PRESETS[k];
        if (preset) {
          libs.moods.push({
            id: genId(),
            name: preset.label,
            emotions: { ...preset.emotions }
          });
        }
      }
    }
  }
}

/**
 * Normalize character traits to reduce drift
 */
export function normalizeCharacterTraits() {
  for (const char of state.project.libraries.characters) {
    if (char.traits && char.traits.length > 4) {
      char.traits = char.traits.slice(0, 4);
    }
  }
}

// ============================================
// METRIC CALCULATIONS
// ============================================

/**
 * Calculate composite quality score from metrics
 */
export function calculateCompositeScore(metrics) {
  if (!metrics || !metrics.scores) return 0;
  
  const weights = {
    nqs: 0.25,
    coherence: 0.20,
    completeness: 0.15,
    eap: 0.10,
    cad: 0.10,
    car: 0.10,
    csa: 0.10
  };
  
  let score = 0;
  let totalWeight = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    if (metrics.scores[key] !== undefined) {
      let value = metrics.scores[key];
      // Invert CAD since lower is better
      if (key === 'cad') value = 1 - Math.min(value, 1);
      score += value * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? score / totalWeight : 0;
}

// ============================================
// RE-EXPORT VOCAB FOR CONVENIENCE
// ============================================

export { VOCAB, genId };
