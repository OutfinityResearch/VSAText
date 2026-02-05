/**
 * DS20 - CNL Parse Success Rate (CPSR)
 *
 * Interpreter form: a single artifact contributes 1 attempt.
 * - value = 1 if parse+semantic are valid (and in strict mode, no warnings)
 * - value = 0 otherwise
 */

export const metricCPSR = {
  code: 'CPSR',
  version: '1.0',
  threshold: 0.95,
  compute(ctx) {
    const strict = !!ctx?.options?.strict;
    const parse = ctx?.diagnostics?.parse || {};
    const semantic = ctx?.diagnostics?.semantic || {};

    const parseOk = !!parse.valid;
    const semanticOk = !!semantic.valid;

    const warnCount = (parse.warnings?.length || 0) + (semantic.warnings?.length || 0);
    const ok = parseOk && semanticOk && (!strict || warnCount === 0);

    const value = ok ? 1 : 0;
    return {
      value,
      threshold: 0.95,
      pass: value >= 0.95,
      details: {
        strict,
        parse_valid: parseOk,
        semantic_valid: semanticOk,
        warning_count: warnCount,
        error_count: (parse.errors?.length || 0) + (semantic.errors?.length || 0)
      }
    };
  }
};

export default metricCPSR;

