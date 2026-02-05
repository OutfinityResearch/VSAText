/**
 * Metrics Interpreter - Metric Runner (DS12 plugin model)
 *
 * Deterministically runs a selected metric set with explicit dependencies.
 */

import { METRIC_REGISTRY } from './metrics/registry.mjs';

function topoSort(codes, depsOf) {
  const out = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(code) {
    if (visited.has(code)) return;
    if (visiting.has(code)) {
      throw new Error(`Cyclic metric dependency detected at "${code}"`);
    }
    visiting.add(code);
    for (const dep of depsOf(code)) visit(dep);
    visiting.delete(code);
    visited.add(code);
    out.push(code);
  }

  for (const c of codes) visit(c);
  return out;
}

function safeClone(x) {
  if (x == null || typeof x !== 'object') return x;
  try {
    return JSON.parse(JSON.stringify(x));
  } catch {
    return x;
  }
}

export function runMetrics(ctx, metricSet) {
  const requested = Array.isArray(metricSet) ? metricSet : [];
  const known = requested.filter(code => METRIC_REGISTRY[code]);

  const order = topoSort(known, (code) => {
    const plugin = METRIC_REGISTRY[code];
    const deps = Array.isArray(plugin?.dependsOn) ? plugin.dependsOn : [];
    return deps.filter(d => METRIC_REGISTRY[d]);
  });

  const byCode = {};
  const results = [];

  for (const code of order) {
    const plugin = METRIC_REGISTRY[code];
    if (!plugin) continue;

    const ctxForMetric = {
      ...ctx,
      metrics: byCode
    };

    let out;
    try {
      out = plugin.compute(ctxForMetric);
    } catch (err) {
      out = {
        value: null,
        threshold: plugin.threshold ?? null,
        pass: false,
        details: { status: 'error', message: err?.message || String(err), stack: err?.stack || null }
      };
    }

    const result = {
      code,
      version: String(plugin.version || '1.0'),
      value: out?.value ?? null,
      threshold: out?.threshold ?? plugin.threshold ?? null,
      pass: typeof out?.pass === 'boolean' ? out.pass : (out?.pass == null ? null : Boolean(out.pass)),
      details: safeClone(out?.details ?? {})
    };

    results.push(result);
    byCode[code] = result;
  }

  // Preserve the requested ordering where possible (but dependencies come first).
  results.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
  return results;
}

export default { runMetrics };

