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
  showGenerationStatus,
  updateGenerationStatus,
  hideGenerationStatus
} from './generation-utils.mjs';
import { refineWithLLM } from './generation-llm.mjs';
import { updateGenerateButton } from './generation-improve.mjs';

// Import SDK optimizer
import { optimizeStory, DEFAULT_CONFIG } from '../../../src/generation/index.mjs';

// Configuration
const MAX_ITERATIONS = DEFAULT_CONFIG.maxIterations;
const TARGET_NQS = DEFAULT_CONFIG.targetNQS;

/**
 * Advanced generation with multi-pass optimization
 * Uses SDK optimizer and shows progress in UI
 * 
 * @param {Object} options - Generation options
 */
export async function generateAdvanced(options) {
  const statusEl = showGenerationStatus('Initializing advanced generation...');
  
  try {
    // Progress callback for UI updates
    const onProgress = (progress) => {
      const percent = (progress.iteration / progress.maxIterations) * 100;
      const phase = progress.phase === 'optimization' ? 'Optimizing' : 'Evaluating';
      
      updateGenerationStatus(
        statusEl, 
        `Pass ${progress.iteration}/${progress.maxIterations}: ${phase}... Score: ${(progress.score * 100).toFixed(0)}%`, 
        percent
      );
    };
    
    // Use SDK optimizer
    updateGenerationStatus(statusEl, 'Running SDK optimizer...', 10);
    
    const result = optimizeStory(options, {
      maxIterations: MAX_ITERATIONS,
      targetNQS: TARGET_NQS
    }, onProgress);
    
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
    
    updateGenerationStatus(
      statusEl, 
      `Optimization complete! Score: ${(result.score * 100).toFixed(0)}%`, 
      85
    );
    
    // Attempt LLM refinement
    updateGenerationStatus(statusEl, 'Attempting LLM refinement...', 90);
    try {
      await refineWithLLM(options);
    } catch (e) {
      console.log('LLM refinement skipped:', e.message);
    }
    
    updateGenerationStatus(
      statusEl, 
      `Complete! Final score: ${(result.score * 100).toFixed(0)}% (${result.iterations} iterations)`, 
      100
    );
    
    // Finalize
    createSnapshot();
    updateGenerateButton();
    refreshAllViews();
    
    setTimeout(() => hideGenerationStatus(statusEl), 1500);
    
  } catch (err) {
    hideGenerationStatus(statusEl);
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
