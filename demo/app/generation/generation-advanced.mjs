/**
 * SCRIPTA Demo - Advanced Generation Strategy
 * 
 * Multi-pass generation with constraint solving and metric optimization.
 */

import { state, createSnapshot } from '../state.mjs';
import { showNotification } from '../utils.mjs';
import { countType } from '../tree.mjs';
import { generateCNL } from '../cnl.mjs';
import { 
  refreshAllViews,
  showGenerationStatus,
  updateGenerationStatus,
  hideGenerationStatus,
  ensureValidReferences,
  ensureMinimumElements,
  ensureEmotionalArcCoverage,
  normalizeCharacterTraits
} from './generation-utils.mjs';
import { generateRandom } from './generation-random.mjs';
import { refineWithLLM } from './generation-llm.mjs';
import { updateGenerateButton } from './generation-improve.mjs';

// Configuration
const MAX_ITERATIONS = 5;
const TARGET_NQS = 0.85;

/**
 * Call server API to evaluate metrics
 */
async function evaluateOnServer() {
  const cnl = generateCNL();
  
  const response = await fetch('/v1/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnl })
  });
  
  if (!response.ok) {
    throw new Error('Evaluation failed');
  }
  
  return await response.json();
}

/**
 * Calculate composite score from server metrics
 */
function calculateCompositeScore(result) {
  if (!result.success) return 0;
  return result.summary?.nqs || 0;
}

/**
 * Advanced generation with multi-pass optimization
 * @param {Object} options - Generation options
 */
export async function generateAdvanced(options) {
  const statusEl = showGenerationStatus('Initializing advanced generation...');
  
  try {
    let bestResult = null;
    let bestScore = 0;
    
    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      const progress = (iteration / MAX_ITERATIONS) * 100;
      
      // Generate candidate
      updateGenerationStatus(
        statusEl, 
        `Pass ${iteration}/${MAX_ITERATIONS}: Generating candidate...`, 
        progress * 0.5
      );
      
      generateRandom(options);
      
      // Evaluate metrics on server
      updateGenerationStatus(
        statusEl, 
        `Pass ${iteration}/${MAX_ITERATIONS}: Evaluating metrics...`, 
        progress * 0.5 + 20
      );
      
      const evalResult = await evaluateOnServer();
      const score = calculateCompositeScore(evalResult);
      
      updateGenerationStatus(
        statusEl, 
        `Pass ${iteration}/${MAX_ITERATIONS}: Score ${(score * 100).toFixed(0)}%`, 
        progress * 0.5 + 40
      );
      
      // Track best result
      if (score > bestScore) {
        bestScore = score;
        bestResult = JSON.parse(JSON.stringify(state.project));
      }
      
      // Check if target reached
      if (score >= TARGET_NQS) {
        updateGenerationStatus(
          statusEl, 
          `Target score reached! (${(score * 100).toFixed(0)}%)`, 
          90
        );
        break;
      }
      
      // Apply constraint optimizations before next iteration
      if (iteration < MAX_ITERATIONS) {
        updateGenerationStatus(
          statusEl, 
          `Pass ${iteration}/${MAX_ITERATIONS}: Optimizing constraints...`, 
          progress * 0.5 + 50
        );
        
        await applyConstraintOptimizations(evalResult);
      }
    }
    
    // Restore best result
    if (bestResult) {
      state.project = bestResult;
    }
    
    // Attempt LLM refinement
    updateGenerationStatus(statusEl, 'Attempting LLM refinement...', 95);
    try {
      await refineWithLLM(options);
    } catch (e) {
      console.log('LLM refinement skipped:', e.message);
    }
    
    updateGenerationStatus(
      statusEl, 
      `Complete! Final score: ${(bestScore * 100).toFixed(0)}%`, 
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
    throw err; // Re-throw so caller can handle
  }
}

/**
 * Apply constraint-based optimizations to improve metrics
 * @param {Object} evalResult - Server evaluation result
 */
async function applyConstraintOptimizations(evalResult) {
  if (!evalResult || !evalResult.success || !evalResult.metrics) return;
  
  const m = evalResult.metrics;
  
  // Fix coherence issues (invalid references)
  if (m.coherence?.score < 0.75) {
    ensureValidReferences();
  }
  
  // Fix completeness issues (missing elements)
  if (m.completeness?.score < 0.80) {
    ensureMinimumElements();
  }
  
  // Fix emotional arc issues (missing moods)
  if (m.explainability?.score < 0.70) {
    ensureEmotionalArcCoverage();
  }
  
  // Fix character drift (normalize traits)
  if (m.characterDrift?.score < 0.80) {
    normalizeCharacterTraits();
  }
  
  // Additional optimizations can be added here
  await applyStructuralOptimizations();
}

/**
 * Apply structural optimizations to improve story flow
 */
async function applyStructuralOptimizations() {
  if (!state.project.structure?.children) return;
  
  // Ensure each scene has at least one character
  for (const chapter of state.project.structure.children) {
    for (const scene of chapter.children || []) {
      const hasCharacter = scene.children?.some(c => c.type === 'character-ref');
      
      if (!hasCharacter && state.project.libraries.characters.length > 0) {
        const hero = state.project.libraries.characters.find(c => c.archetype === 'hero')
                  || state.project.libraries.characters[0];
        
        if (hero) {
          scene.children = scene.children || [];
          scene.children.unshift({
            id: `ref_${Date.now()}`,
            type: 'character-ref',
            name: hero.name,
            refId: hero.id
          });
        }
      }
    }
  }
  
  // Ensure each chapter has at least one scene
  for (const chapter of state.project.structure.children) {
    if (!chapter.children || chapter.children.length === 0) {
      const locs = state.project.libraries.locations;
      const moods = state.project.libraries.moods;
      
      chapter.children = [{
        id: `sc_${Date.now()}`,
        type: 'scene',
        name: `${chapter.name}.1`,
        title: '',
        children: [
          ...(locs.length > 0 ? [{
            id: `ref_${Date.now()}_loc`,
            type: 'location-ref',
            name: locs[0].name,
            refId: locs[0].id
          }] : []),
          ...(moods.length > 0 ? [{
            id: `ref_${Date.now()}_mood`,
            type: 'mood-ref',
            name: moods[0].name,
            refId: moods[0].id
          }] : [])
        ]
      }];
    }
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
