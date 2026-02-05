/**
 * SCRIPTA SDK - Story Optimizer
 * 
 * Multi-pass optimization with constraint solving and metric evaluation.
 * Pure functions that work with project objects - no side effects.
 * 
 * @module generation/optimizer
 */

import { evaluateCNL } from '../evaluate.mjs';
import { serializeToCNL } from '../services/cnl-serializer.mjs';
import { generateRandomStory } from './random-generator.mjs';

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG = {
  maxIterations: 5,
  targetNQS: 0.85,
  thresholds: {
    coherence: 0.75,
    completeness: 0.80,
    explainability: 0.70,
    characterDrift: 0.80
  }
};

// ============================================
// CONSTRAINT OPTIMIZATION
// ============================================

/**
 * Ensure valid entity references in scenes
 * Returns a new project with fixed references
 */
function ensureValidReferences(project) {
  if (!project.structure?.children) return project;
  
  const result = JSON.parse(JSON.stringify(project));
  const validCharIds = new Set(result.libraries.characters.map(c => c.id));
  const validLocIds = new Set(result.libraries.locations.map(l => l.id));
  const validMoodIds = new Set(result.libraries.moods.map(m => m.id));
  
  for (const chapter of result.structure.children) {
    for (const scene of chapter.children || []) {
      scene.children = (scene.children || []).filter(ref => {
        if (ref.type === 'character-ref') return validCharIds.has(ref.refId);
        if (ref.type === 'location-ref') return validLocIds.has(ref.refId);
        if (ref.type === 'mood-ref') return validMoodIds.has(ref.refId);
        return true;
      });
    }
  }
  
  return result;
}

/**
 * Ensure minimum required elements exist
 * Returns a new project with added elements if needed
 */
function ensureMinimumElements(project) {
  const result = JSON.parse(JSON.stringify(project));
  const { characters, locations, moods } = result.libraries;
  
  // Ensure at least 2 characters
  if (characters.length < 2) {
    characters.push({
      id: `char_${Date.now()}`,
      name: 'Ally',
      archetype: 'ally',
      traits: ['loyal', 'brave']
    });
  }
  
  // Ensure at least 1 location
  if (locations.length < 1) {
    locations.push({
      id: `loc_${Date.now()}`,
      name: 'Central Location',
      geography: 'urban',
      characteristics: []
    });
  }
  
  // Ensure at least 1 mood
  if (moods.length < 1) {
    moods.push({
      id: `mood_${Date.now()}`,
      name: 'Contemplative',
      emotions: { anticipation: 0.5, tension: 0.3 }
    });
  }
  
  return result;
}

/**
 * Ensure emotional arc coverage (mood assignments)
 * Returns a new project with improved emotional arc
 */
function ensureEmotionalArcCoverage(project) {
  const result = JSON.parse(JSON.stringify(project));
  
  if (!result.libraries.emotionalArc) {
    result.libraries.emotionalArc = [];
  }
  
  const beatMappings = result.blueprint?.beatMappings || [];
  const moods = result.libraries.moods;
  
  if (moods.length === 0) return result;
  
  // Ensure each beat has a mood assignment
  for (const mapping of beatMappings) {
    const hasMood = result.libraries.emotionalArc.some(
      ea => ea.beatKey === mapping.beatKey
    );
    
    if (!hasMood) {
      result.libraries.emotionalArc.push({
        beatKey: mapping.beatKey,
        moodPreset: moods[0].name
      });
    }
  }
  
  return result;
}

/**
 * Normalize character traits (ensure consistency)
 * Returns a new project with normalized traits
 */
function normalizeCharacterTraits(project) {
  const result = JSON.parse(JSON.stringify(project));
  const validTraits = [
    'brave', 'cunning', 'wise', 'loyal', 'mysterious', 'ambitious',
    'compassionate', 'stubborn', 'curious', 'cautious', 'charismatic'
  ];
  
  for (const char of result.libraries.characters) {
    char.traits = (char.traits || [])
      .filter(t => validTraits.includes(t.toLowerCase()) || t.length > 0)
      .slice(0, 4); // Max 4 traits
    
    // Ensure at least one trait
    if (char.traits.length === 0) {
      char.traits = ['determined'];
    }
  }
  
  return result;
}

/**
 * Ensure structural completeness (scenes have required elements)
 * Returns a new project with improved structure
 */
function ensureStructuralCompleteness(project) {
  const result = JSON.parse(JSON.stringify(project));
  
  if (!result.structure?.children) return result;
  
  const { characters, locations, moods } = result.libraries;
  const hero = characters.find(c => c.archetype === 'hero') || characters[0];
  
  for (let chIndex = 0; chIndex < result.structure.children.length; chIndex++) {
    const chapter = result.structure.children[chIndex];

    if (!chapter.title || !String(chapter.title).trim()) {
      chapter.title = `Chapter ${chIndex + 1}`;
    }

    // Ensure chapter has at least one scene
    if (!chapter.children || chapter.children.length === 0) {
      chapter.children = [{
        id: `sc_${Date.now()}`,
        type: 'scene',
        name: `${chapter.name}.1`,
        title: `Scene ${chIndex + 1}.1`,
        children: []
      }];
    }
    
    for (let scIndex = 0; scIndex < chapter.children.length; scIndex++) {
      const scene = chapter.children[scIndex];
      if (scene.type !== 'scene') continue;
      
      scene.children = scene.children || [];

      if (!scene.title || !String(scene.title).trim()) {
        scene.title = `Scene ${chIndex + 1}.${scIndex + 1}`;
      }
      
      // Ensure scene has at least one character
      const hasChar = scene.children.some(c => c.type === 'character-ref');
      if (!hasChar && hero) {
        scene.children.unshift({
          id: `ref_${Date.now()}_char`,
          type: 'character-ref',
          name: hero.name,
          refId: hero.id
        });
      }
      
      // Ensure scene has a location
      const hasLoc = scene.children.some(c => c.type === 'location-ref');
      if (!hasLoc && locations.length > 0) {
        scene.children.push({
          id: `ref_${Date.now()}_loc`,
          type: 'location-ref',
          name: locations[0].name,
          refId: locations[0].id
        });
      }

      // Ensure scene has a mood
      const hasMood = scene.children.some(c => c.type === 'mood-ref');
      if (!hasMood && moods.length > 0) {
        scene.children.push({
          id: `ref_${Date.now()}_mood`,
          type: 'mood-ref',
          name: moods[0].name,
          refId: moods[0].id
        });
      }

      // Ensure scene has at least one action (gives NL generator ground truth)
      const hasAction = scene.children.some(c => c.type === 'action');
      if (!hasAction && hero) {
        scene.children.push({
          id: `act_${Date.now()}`,
          type: 'action',
          name: `${hero.name} decides`,
          actionData: { subject: hero.name, action: 'decides', target: '' }
        });
      }
    }
  }
  
  return result;
}

/**
 * Apply all constraint optimizations based on evaluation result
 * @param {Object} project - Project to optimize
 * @param {Object} evalResult - Evaluation result from evaluateCNL
 * @param {Object} config - Optimization thresholds
 * @returns {Object} Optimized project (new object)
 */
export function applyConstraintOptimizations(project, evalResult, config = DEFAULT_CONFIG) {
  if (!evalResult || !evalResult.success || !evalResult.metrics) {
    return project;
  }
  
  let result = project;
  const m = evalResult.metrics;
  const t = config.thresholds;
  
  // Fix coherence issues (invalid references)
  if (m.coherence?.score < t.coherence) {
    result = ensureValidReferences(result);
  }
  
  // Fix completeness issues (missing elements)
  if (m.completeness?.score < t.completeness) {
    result = ensureMinimumElements(result);
  }
  
  // Fix emotional arc issues (missing moods)
  if (m.explainability?.score < t.explainability) {
    result = ensureEmotionalArcCoverage(result);
  }
  
  // Fix character drift (normalize traits)
  if (m.characterDrift?.score < t.characterDrift) {
    result = normalizeCharacterTraits(result);
  }
  
  // Apply structural completeness
  result = ensureStructuralCompleteness(result);
  
  return result;
}

// ============================================
// OPTIMIZATION ENGINE
// ============================================

/**
 * Result of optimization iteration
 * @typedef {Object} OptimizationIterationResult
 * @property {Object} project - Current project state
 * @property {number} score - NQS score
 * @property {Object} evalResult - Full evaluation result
 * @property {number} iteration - Iteration number
 */

/**
 * Run a single optimization iteration
 * @param {Object} project - Current project
 * @param {number} iteration - Current iteration number
 * @returns {OptimizationIterationResult}
 */
function runIteration(project, iteration) {
  const cnl = serializeToCNL(project);
  const evalResult = evaluateCNL(cnl);
  const score = evalResult.success ? (evalResult.summary?.nqs || 0) : 0;
  
  return {
    project,
    score,
    evalResult,
    iteration
  };
}

/**
 * Optimize a story through iterative generation and evaluation
 * 
 * This is a pure function that:
 * 1. Generates candidates using random generation
 * 2. Evaluates each using local SDK evaluation
 * 3. Applies constraint optimizations
 * 4. Tracks the best result
 * 
 * @param {Object} options - Generation options (passed to generateRandomStory)
 * @param {Object} config - Optimization configuration
 * @param {number} config.maxIterations - Maximum iterations (default: 5)
 * @param {number} config.targetNQS - Target NQS score (default: 0.85)
 * @param {Function} onProgress - Optional progress callback
 * @returns {Object} Optimization result with best project and metrics
 */
export function optimizeStory(options = {}, config = {}, onProgress = null) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  let bestProject = null;
  let bestScore = 0;
  let bestEvalResult = null;
  const iterationHistory = [];
  
  for (let iteration = 1; iteration <= cfg.maxIterations; iteration++) {
    // Generate candidate
    const candidate = generateRandomStory(options);
    
    // Evaluate
    let iterResult = runIteration(candidate, iteration);
    
    // Track best
    if (iterResult.score > bestScore) {
      bestScore = iterResult.score;
      bestProject = JSON.parse(JSON.stringify(iterResult.project));
      bestEvalResult = iterResult.evalResult;
    }
    
    // Report progress
    if (onProgress) {
      onProgress({
        iteration,
        maxIterations: cfg.maxIterations,
        score: iterResult.score,
        bestScore,
        phase: 'evaluation'
      });
    }
    
    // Check if target reached
    if (iterResult.score >= cfg.targetNQS) {
      iterationHistory.push({
        iteration,
        score: iterResult.score,
        status: 'target_reached'
      });
      break;
    }
    
    // Apply optimizations before next iteration
    if (iteration < cfg.maxIterations) {
      const optimized = applyConstraintOptimizations(
        iterResult.project, 
        iterResult.evalResult, 
        cfg
      );
      
      // Re-evaluate optimized version
      const optimizedResult = runIteration(optimized, iteration);
      
      if (optimizedResult.score > bestScore) {
        bestScore = optimizedResult.score;
        bestProject = JSON.parse(JSON.stringify(optimizedResult.project));
        bestEvalResult = optimizedResult.evalResult;
      }
      
      if (onProgress) {
        onProgress({
          iteration,
          maxIterations: cfg.maxIterations,
          score: optimizedResult.score,
          bestScore,
          phase: 'optimization'
        });
      }
    }
    
    iterationHistory.push({
      iteration,
      score: iterResult.score,
      status: iteration === cfg.maxIterations ? 'max_reached' : 'continue'
    });
  }
  
  return {
    success: bestProject !== null,
    project: bestProject,
    score: bestScore,
    evaluation: bestEvalResult,
    iterations: iterationHistory.length,
    config: cfg
  };
}

/**
 * Quick optimization with default settings
 * Convenience function for simple use cases
 */
export function quickOptimize(options = {}) {
  return optimizeStory(options, { maxIterations: 3, targetNQS: 0.70 });
}

// ============================================
// EXPORTS
// ============================================

export {
  ensureValidReferences,
  ensureMinimumElements,
  ensureEmotionalArcCoverage,
  normalizeCharacterTraits,
  ensureStructuralCompleteness,
  DEFAULT_CONFIG
};

export default { optimizeStory, quickOptimize, applyConstraintOptimizations };
