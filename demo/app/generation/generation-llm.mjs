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
  finalizeGeneratedProjectState,
  showGenerationStatus,
  updateGenerationStatus,
  hideGenerationStatus
} from './generation-utils.mjs';
import { updateGenerateButton } from './generation-improve.mjs';
import { applyGenerationAnnotations } from './generation-annotations.mjs';

function makeAbortError(message = 'Generation cancelled') {
  const err = new Error(message);
  err.name = 'AbortError';
  return err;
}

function isAbortError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const msg = String(err.message || '').toLowerCase();
  return msg.includes('abort') || msg.includes('cancel');
}

function throwIfCancelled(control) {
  if (control?.signal?.aborted || control?.isCancelled?.()) {
    throw makeAbortError();
  }
}

function emitPhase(control, statusEl, phaseKey, message, progress = null) {
  control?.onPhase?.({ key: phaseKey, label: message, progress });
  if (statusEl) {
    const pct = Number.isFinite(progress) ? progress : 0;
    updateGenerationStatus(statusEl, message, pct);
  }
}

/**
 * Generate story using LLM to create CNL specification
 * @param {Object} options - Generation options
 * @param {Object} control - Cancellation/progress controls
 */
export async function generateLLM(options, control = {}) {
  const useLegacyStatus = !control?.onPhase;
  const statusEl = useLegacyStatus
    ? showGenerationStatus('Connecting to LLM API...')
    : null;
  
  try {
    throwIfCancelled(control);
    emitPhase(control, statusEl, 'connect', 'Connecting to LLM API...', 5);
    emitPhase(control, statusEl, 'request_specs', 'Generating CNL specification...', 20);
    
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
      }),
      signal: control?.signal
    });

    throwIfCancelled(control);
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
      throw new Error(err.error?.message || 'LLM generation failed');
    }
    
    emitPhase(control, statusEl, 'parse_response', 'Parsing response...', 70);
    
    const result = await response.json();
    throwIfCancelled(control);

    if (result && result._fallback) {
      showNotification('LLM unavailable — generated a fallback story instead.', 'warning');
    }

    // Handle direct project data
    const projectData = result?.project || (
      result?.libraries && (result?.structure || result?.blueprint)
        ? result
        : null
    );

    // Apply only after full response is valid to keep old state intact on cancel/error.
    emitPhase(control, statusEl, 'apply_result', 'Applying generated specs...', 90);
    resetProjectState();

    // Handle CNL response
    if (result.cnl) {
      await loadCNLIntoState(result.cnl);
    }

    if (projectData) {
      loadProjectData(projectData);
    }

    throwIfCancelled(control);

    applyGenerationAnnotations(state.project, {
      strategy: 'llm',
      options,
      llmAnnotations: result?.annotations || []
    });
    finalizeGeneratedProjectState();
    
    emitPhase(control, statusEl, 'complete', 'Complete!', 100);
    
    // Finalize
    createSnapshot();
    updateGenerateButton();
    refreshAllViews();
    
    if (statusEl) {
      setTimeout(() => hideGenerationStatus(statusEl), 1000);
    }
    
  } catch (err) {
    if (statusEl) {
      hideGenerationStatus(statusEl);
    }
    if (isAbortError(err)) {
      throw makeAbortError();
    }
    console.error('LLM Generation Error:', err);
    showNotification('LLM Generation failed: ' + err.message, 'error');
    throw err;
  }
}

/**
 * Attempt to refine story with LLM suggestions
 * @param {Object} options - Original generation options
 * @param {Object} control - Cancellation controls
 */
export async function refineWithLLM(options, control = {}) {
  throwIfCancelled(control);
  const response = await fetch('/v1/generate/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: state.project,
      options
    }),
    signal: control?.signal
  });
  throwIfCancelled(control);
  
  if (response.ok) {
    const result = await response.json();
    throwIfCancelled(control);
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
