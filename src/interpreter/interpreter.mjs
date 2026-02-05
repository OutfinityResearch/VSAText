/**
 * Metrics Interpreter (DS12)
 *
 * Public API:
 * - interpretCNL(cnlText, options) -> deterministic report
 *
 * This module is portable (browser + Node) and has no external dependencies.
 */

import { parseCNL } from '../cnl-parser/cnl-parser.mjs';
import { sha256Hex } from '../utils/sha256.mjs';
import { buildWorldModel } from './world-model.mjs';
import { deriveSemanticDiagnostics } from './semantic-diagnostics.mjs';
import { runMetrics } from './metric-runner.mjs';

const DEFAULT_METRICS = [
  'CS',
  'CAD',
  'CAR',
  'OI',
  'EAP',
  'XAI',
  'RQ',
  'CPSR',
  'CSA',
  'NQS',
  'NQS_AUTO'
];

function nowIso(options) {
  if (options?.includeTimestamps) return new Date().toISOString();
  return null;
}

function normalizeMetricSet(metricSet) {
  if (Array.isArray(metricSet) && metricSet.length > 0) {
    return metricSet.map(c => String(c).trim().toUpperCase()).filter(Boolean);
  }
  return [...DEFAULT_METRICS];
}

function summarizeMetricResults(results) {
  const failed = [];
  const skipped = [];

  for (const r of results || []) {
    if (!r || !r.code) continue;
    if (r.pass === false) failed.push(r.code);
    else if (r.pass == null) skipped.push(r.code);
  }

  return {
    pass: failed.length === 0,
    failed,
    skipped
  };
}

/**
 * Interpret a CNL document and compute metric results.
 */
export function interpretCNL(cnlText, options = {}) {
  const cnl = String(cnlText ?? '');
  const seed = Number.isFinite(options.seed) ? options.seed : 42;
  const profile = String(options.profile || 'vsa').toLowerCase();
  const metricSet = normalizeMetricSet(options.metric_set);

  const parseResult = parseCNL(cnl);
  const ast = parseResult.ast || {};

  const diagnostics = {
    parse: {
      valid: !!parseResult.valid,
      errors: Array.isArray(parseResult.errors) ? [...parseResult.errors] : [],
      warnings: Array.isArray(parseResult.warnings) ? [...parseResult.warnings] : []
    },
    semantic: {
      valid: true,
      errors: [],
      warnings: []
    }
  };

  const world = buildWorldModel(ast, options);
  diagnostics.semantic = deriveSemanticDiagnostics(ast, world, options);

  const ctx = {
    interpreter_version: '1.0',
    profile,
    seed,
    cnl_text: cnl,
    options: { ...options, seed, profile, metric_set: metricSet },
    corpora: options.corpora && typeof options.corpora === 'object' ? options.corpora : {},
    human: options.human && typeof options.human === 'object' ? options.human : null,
    ast,
    diagnostics,
    world
  };

  const results = runMetrics(ctx, metricSet);
  const summary = summarizeMetricResults(results);

  const report = {
    interpreter_version: '1.0',
    profile,
    seed,
    cnl_hash: `sha256:${sha256Hex(cnl)}`,
    diagnostics,
    world: {
      entities: { count: world.entities.count, by_type: world.entities.by_type },
      scenes: { count: world.scenes.count, ordered_ids: world.scenes.ordered_ids },
      events: { count: world.events.count, by_scene: world.events.by_scene },
      constraints: { count: world.constraints.count, by_type: world.constraints.by_type },
      texts: { token_count: world.texts.token_count, by_scene: world.texts.by_scene }
    },
    metrics: {
      results,
      summary: {
        ...summary,
        computed_at: nowIso(options)
      }
    }
  };

  // Optional debug payload (non-normative, can be large).
  if (options?.debug) {
    const { _internal, ...worldPublic } = world || {};
    report._ast = ast;
    report._world = worldPublic;
  }

  return report;
}

export default { interpretCNL };
