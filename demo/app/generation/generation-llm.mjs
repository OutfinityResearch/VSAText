/**
 * SCRIPTA Demo - LLM Generation Strategy
 * 
 * Uses LLM API to generate creative story specifications.
 */

import { state, createSnapshot } from '../state.mjs';
import { showNotification } from '../utils.mjs';
import { 
  refreshAllViews,
  resetProjectState,
  loadProjectData,
  loadCNLIntoState,
  showGenerationStatus,
  updateGenerationStatus,
  hideGenerationStatus
} from './generation-utils.mjs';
import { updateGenerateButton } from './generation-improve.mjs';

/**
 * Generate story using LLM to create CNL specification
 * @param {Object} options - Generation options
 */
export async function generateLLM(options) {
  const statusEl = showGenerationStatus('Connecting to LLM API...');
  
  try {
    // Reset demo state to avoid merging old libraries/structure with LLM output
    resetProjectState();

    updateGenerationStatus(statusEl, 'Generating CNL specification...', 20);
    
    // Call server API for LLM generation
    const response = await fetch('/v1/generate/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        genre: options.genre,
        length: options.length,
        characters: options.chars,
        tone: options.tone,
        complexity: options.complexity,
        worldRules: options.rules,
        storyName: state.project.name,
        model: options.model || undefined,
        promptKey: options.promptKey || undefined,
        customPrompt: options.customPrompt || undefined
      })
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
      throw new Error(err.error?.message || 'LLM generation failed');
    }
    
    updateGenerationStatus(statusEl, 'Parsing response...', 60);
    
    const result = await response.json();

    if (result && result._fallback) {
      showNotification('LLM unavailable — generated a fallback story instead.', 'warning');
    }
    
    // Handle CNL response
    if (result.cnl) {
      updateGenerationStatus(statusEl, 'Loading CNL into editor...', 80);
      await loadCNLIntoState(result.cnl);
    }
    
    // Handle direct project data
    const projectData = result?.project || (
      result?.libraries && (result?.structure || result?.blueprint)
        ? result
        : null
    );

    if (projectData) {
      updateGenerationStatus(statusEl, 'Loading project data...', 80);
      loadProjectData(projectData);
    }
    
    updateGenerationStatus(statusEl, 'Complete!', 100);
    
    // Finalize
    createSnapshot();
    updateGenerateButton();
    refreshAllViews();
    
    setTimeout(() => hideGenerationStatus(statusEl), 1000);
    
  } catch (err) {
    hideGenerationStatus(statusEl);
    console.error('LLM Generation Error:', err);
    showNotification('LLM Generation failed: ' + err.message, 'error');
    throw err; // Re-throw so caller can handle
  }
}

/**
 * Attempt to refine story with LLM suggestions
 * @param {Object} options - Original generation options
 */
export async function refineWithLLM(options) {
  const response = await fetch('/v1/generate/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: state.project,
      options
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    if (result.suggestions) {
      applySuggestions(result.suggestions);
    }
  }
}

/**
 * Apply LLM suggestions to improve the story
 * @param {Object} suggestions - Suggestions from LLM
 */
function applySuggestions(suggestions) {
  // Apply scene title suggestions
  if (suggestions.sceneNames && state.project.structure?.children) {
    for (const chapter of state.project.structure.children) {
      for (const scene of chapter.children || []) {
        if (suggestions.sceneNames[scene.id]) {
          scene.title = suggestions.sceneNames[scene.id];
        }
      }
    }
  }
  
  // Apply character trait enhancements
  if (suggestions.characterTraits) {
    for (const char of state.project.libraries.characters) {
      if (suggestions.characterTraits[char.id]) {
        const newTraits = suggestions.characterTraits[char.id];
        char.traits = [...new Set([...char.traits, ...newTraits])].slice(0, 5);
      }
    }
  }
  
  // Apply new plot elements
  if (suggestions.plotElements && Array.isArray(suggestions.plotElements)) {
    for (const element of suggestions.plotElements) {
      if (!state.project.libraries.objects.find(o => o.name === element.name)) {
        state.project.libraries.objects.push({
          id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ...element
        });
      }
    }
  }
}

/**
 * Check if LLM is available on the server
 * @returns {Promise<boolean>}
 */
export async function checkLLMAvailability() {
  try {
    const response = await fetch('/v1/generate/status');
    if (response.ok) {
      const result = await response.json();
      return result.llmAvailable === true;
    }
    return false;
  } catch {
    return false;
  }
}

export default generateLLM;
