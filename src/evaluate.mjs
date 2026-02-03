/**
 * SCRIPTA SDK - Unified Evaluation Entrypoint
 *
 * Single entrypoint for evaluating a CNL specification.
 * Parses CNL, extracts entities, and runs all available metrics.
 *
 * Usage:
 *   import { evaluateCNL } from './src/evaluate.mjs';
 *   const result = evaluateCNL(cnlText);
 */

import { parseCNL } from './cnl-parser/cnl-parser.mjs';
import {
  calculateCAD,
  calculateCoherence,
  calculateReadability,
  calculateEmotionalArcMatch
} from './services/evaluation.mjs';
import { runGuardrailCheck } from './services/guardrails.mjs';

import { extractEntitiesFromAST } from './evaluate/extract-entities.mjs';
import { calculateStructureMetrics } from './evaluate/structure-metrics.mjs';
import {
  calculateCompleteness,
  calculateCoherenceMetrics,
  calculateCharacterDrift,
  calculateOriginality,
  calculateExplainability,
  calculateParseSuccess,
  calculateCharacterContinuity,
  calculateLocationLogic,
  calculateSceneCompleteness,
  calculateNarrativeQualityScore
} from './evaluate/metrics.mjs';

/**
 * Main evaluation entrypoint
 *
 * @param {string} cnl - The CNL specification text
 * @param {Object} options - Optional configuration
 * @param {string} options.prose - Optional generated prose for text-based metrics
 * @param {string} options.targetArc - Target emotional arc pattern
 * @returns {Object} Complete evaluation results as JSON
 */
export function evaluateCNL(cnl, options = {}) {
  const startTime = Date.now();

  // Parse CNL
  let parseResult;
  try {
    parseResult = parseCNL(cnl);
  } catch (err) {
    return {
      success: false,
      error: 'parse_error',
      message: err.message,
      evaluatedAt: new Date().toISOString()
    };
  }

  const ast = parseResult.ast || parseResult.structure || {};

  // Extract entities from AST
  const rawEntities = ast.entities || {};
  const entities = extractEntitiesFromAST(rawEntities, ast);

  // Calculate structure metrics
  const structure = calculateStructureMetrics(ast, entities);

  const arcName = ast.blueprint?.arc || parseResult.arc || null;

  // Calculate all metrics
  const metrics = {
    completeness: calculateCompleteness(structure.counts),
    coherence: calculateCoherenceMetrics(ast, entities, structure.refs, structure.counts),
    characterDrift: calculateCharacterDrift(entities),
    originality: calculateOriginality(ast, entities, structure.counts),
    explainability: calculateExplainability(entities, arcName),
    parseSuccess: calculateParseSuccess(cnl, parseResult),
    characterContinuity: calculateCharacterContinuity(ast, entities),
    locationLogic: calculateLocationLogic(ast, entities),
    sceneCompleteness: calculateSceneCompleteness(ast)
  };

  // Text-based metrics (if prose provided)
  if (options.prose && options.prose.length > 100) {
    metrics.textCoherence = calculateCoherence(options.prose);
    metrics.readability = calculateReadability(options.prose);

    if (entities.characters?.length > 0) {
      metrics.textCharacterDrift = calculateCAD(options.prose, entities.characters);
    }

    if (options.targetArc) {
      metrics.emotionalArcMatch = calculateEmotionalArcMatch(
        options.prose,
        options.targetArc
      );
    }
  }

  // Calculate composite NQS
  const nqs = calculateNarrativeQualityScore(metrics);

  // Run guardrail checks if prose available
  let guardrails = null;
  if (options.prose) {
    try {
      guardrails = runGuardrailCheck(options.prose);
    } catch (e) {
      guardrails = { error: e.message };
    }
  }

  return {
    success: true,
    evaluatedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,

    // Summary
    summary: {
      nqs: nqs.score,
      interpretation: nqs.interpretation,
      passed: nqs.passed
    },

    // Structure counts
    structure: structure.counts,
    references: structure.refs,

    // Detailed metrics
    metrics: {
      nqs,
      ...metrics
    },

    // Guardrails (if prose provided)
    guardrails,

    // Entities summary
    entities: {
      characters: (entities.characters || []).map(c => ({
        name: c.name,
        archetype: c.archetype,
        traits: c.traits
      })),
      locations: (entities.locations || []).map(l => ({
        name: l.name,
        geography: l.geography
      })),
      themes: entities.themes || [],
      relationshipCount: (entities.relationships || []).length,
      worldRuleCount: (entities.world_rules || []).length
    }
  };
}

/**
 * Quick evaluation - returns just the NQS score.
 */
export function quickEvaluate(cnl) {
  const result = evaluateCNL(cnl);
  if (!result.success) {
    return { score: 0, error: result.message };
  }
  return {
    score: result.summary.nqs,
    interpretation: result.summary.interpretation,
    passed: result.summary.passed
  };
}

export default { evaluateCNL, quickEvaluate };

