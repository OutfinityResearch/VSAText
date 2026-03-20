/**
 * SCRIPTA Demo - Advanced Generation Strategy
 * 
 * Uses SDK optimizer for multi-pass generation with constraint solving.
 * This is a thin UI wrapper around the SDK optimization engine.
 */

import { state, createSnapshot } from '../state.mjs';
import { showNotification } from '../utils.mjs';
import { 
  refreshAllViews,
  finalizeGeneratedProjectState,
  showGenerationStatus,
  updateGenerationStatus,
  hideGenerationStatus
} from './generation-utils.mjs';
import { refineWithLLM } from './generation-llm.mjs';
import { updateGenerateButton } from './generation-improve.mjs';
import { applyGenerationAnnotations } from './generation-annotations.mjs';

// Import SDK optimizer
import { optimizeStory, DEFAULT_CONFIG } from '../../../src/generation/index.mjs';

// Configuration
const MAX_ITERATIONS = DEFAULT_CONFIG.maxIterations;
const TARGET_NQS = DEFAULT_CONFIG.targetNQS;

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

/**
 * Advanced generation with multi-pass optimization
 * Uses SDK optimizer and shows progress in UI
 * 
 * @param {Object} options - Generation options
 * @param {Object} control - Cancellation/progress controls
 */
export async function generateAdvanced(options, control = {}) {
  const statusEl = showGenerationStatus('Initializing advanced generation...');
  
  try {
    throwIfCancelled(control);
    control?.onPhase?.({ key: 'optimize', label: 'Initializing advanced generation...', progress: 2 });

    // Progress callback for UI updates
    const onProgress = (progress) => {
      throwIfCancelled(control);
      const percent = (progress.iteration / progress.maxIterations) * 100;
      const phase = progress.phase === 'optimization' ? 'Optimizing' : 'Evaluating';
      const phaseLabel = `Pass ${progress.iteration}/${progress.maxIterations}: ${phase}... Score: ${(progress.score * 100).toFixed(0)}%`;
      
      updateGenerationStatus(
        statusEl, 
        phaseLabel, 
        percent
      );
      control?.onPhase?.({ key: 'optimize', label: phaseLabel, progress: percent });
    };
    
    // Use SDK optimizer
    updateGenerationStatus(statusEl, 'Running SDK optimizer...', 10);
    control?.onPhase?.({ key: 'optimize', label: 'Running SDK optimizer...', progress: 10 });
    
    const result = optimizeStory(options, {
      maxIterations: MAX_ITERATIONS,
      targetNQS: TARGET_NQS
    }, onProgress);

    throwIfCancelled(control);
    
    if (!result.success || !result.project) {
      throw new Error('Optimization failed to produce a valid story');
    }
    
    // Apply result to state
    state.project = {
      ...state.project,
      name: result.project.name || state.project.name,
      selectedArc: result.project.selectedArc,
      libraries: result.project.libraries,
      structure: result.project.structure,
      blueprint: result.project.blueprint
    };

    applyGenerationAnnotations(state.project, { strategy: 'advanced', options });
    finalizeGeneratedProjectState();
    
    updateGenerationStatus(
      statusEl, 
      `Optimization complete! Score: ${(result.score * 100).toFixed(0)}%`, 
      85
    );
    control?.onPhase?.({
      key: 'optimize',
      label: `Optimization complete! Score: ${(result.score * 100).toFixed(0)}%`,
      progress: 85
    });
    
    // Attempt LLM refinement
    updateGenerationStatus(statusEl, 'Attempting LLM refinement...', 90);
    control?.onPhase?.({ key: 'refine', label: 'Attempting LLM refinement...', progress: 90 });
    try {
      await refineWithLLM(options, control);
    } catch (e) {
      if (isAbortError(e)) throw makeAbortError();
      console.log('LLM refinement skipped:', e.message);
    }

    throwIfCancelled(control);
    
    control?.onPhase?.({ key: 'apply_result', label: 'Applying optimized specs...', progress: 96 });
    updateGenerationStatus(
      statusEl, 
      `Complete! Final score: ${(result.score * 100).toFixed(0)}% (${result.iterations} iterations)`, 
      100
    );
    control?.onPhase?.({
      key: 'complete',
      label: `Complete! Final score: ${(result.score * 100).toFixed(0)}% (${result.iterations} iterations)`,
      progress: 100
    });
    
    // Finalize
    createSnapshot();
    updateGenerateButton();
    refreshAllViews();
    
    setTimeout(() => hideGenerationStatus(statusEl), 1500);
    
  } catch (err) {
    hideGenerationStatus(statusEl);
    if (isAbortError(err)) {
      throw makeAbortError();
    }
    console.error('Advanced Generation Error:', err);
    showNotification('Advanced Generation failed: ' + err.message, 'error');
    throw err;
  }
}

/**
 * Get optimization statistics for display
 * @returns {Object} Statistics about the optimization process
 */
export function getOptimizationStats() {
  return {
    maxIterations: MAX_ITERATIONS,
    targetScore: TARGET_NQS
  };
}

export default generateAdvanced;
