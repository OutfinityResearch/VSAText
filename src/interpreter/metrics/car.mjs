/**
 * DS15 - Compliance Adherence Rate (CAR)
 *
 * Interpreter form: compute CAR over per-scene canonical texts (artifacts).
 * Strict CAR counts only "pass" as success.
 */

import {
  checkCliches,
  checkStereotypes,
  checkHarmfulContent,
  checkPII,
  checkOriginality,
  checkRepetition
} from '../../services/guardrails.mjs';

function summarizeFindings(findings) {
  const summary = { critical: 0, error: 0, warning: 0, info: 0 };
  for (const f of findings || []) {
    if (!f || !f.severity) { summary.info++; continue; }
    const s = String(f.severity).toLowerCase();
    if (s === 'critical') summary.critical++;
    else if (s === 'error') summary.error++;
    else if (s === 'warning') summary.warning++;
    else summary.info++;
  }
  let status = 'pass';
  if (summary.critical > 0) status = 'reject';
  else if (summary.error > 0) status = 'fail';
  else if (summary.warning > 0) status = 'warn';
  return { status, summary };
}

function runGuardrailsDeterministic(text, options = {}) {
  const policies = options.policies || ['bias', 'originality', 'pii', 'harmful', 'repetition'];
  const references = Array.isArray(options.references) ? options.references : [];

  const findings = [];

  for (const policy of policies) {
    switch (policy) {
      case 'bias':
        findings.push(...checkStereotypes(text));
        break;
      case 'originality':
        findings.push(...checkCliches(text));
        break;
      case 'pii':
        findings.push(...checkPII(text));
        break;
      case 'harmful':
        findings.push(...checkHarmfulContent(text));
        break;
      case 'repetition':
        findings.push(...checkRepetition(text));
        break;
      default:
        // Unknown policy: ignore
    }
  }

  if (references.length > 0) {
    findings.push(...checkOriginality(text, references));
  }

  const { status, summary } = summarizeFindings(findings);
  return { status, summary, findings };
}

export const metricCAR = {
  code: 'CAR',
  version: '1.0',
  threshold: 0.999,
  compute(ctx) {
    const world = ctx?.world;
    const sceneIds = world?.scenes?.ordered_ids || [];
    const policies = ctx?.options?.car_policies || ['bias', 'originality', 'pii', 'harmful', 'repetition'];
    const references = ctx?.corpora?.references || [];

    const perArtifact = [];
    let passes = 0;
    let warns = 0;

    for (const id of sceneIds) {
      const text = String(world?.scenes?.by_id?.[id]?.text || '').trim();
      const report = runGuardrailsDeterministic(text, { policies, references });
      perArtifact.push({ id, status: report.status, summary: report.summary });
      if (report.status === 'pass') passes++;
      if (report.status === 'pass' || report.status === 'warn') warns++;
    }

    const total = Math.max(1, perArtifact.length);
    const CAR_strict = passes / total;
    const CAR_lenient = warns / total;
    const pass = CAR_strict >= 0.999;

    return {
      value: CAR_strict,
      threshold: 0.999,
      pass,
      details: {
        CAR_strict,
        CAR_lenient,
        passes,
        total,
        policies,
        per_artifact: perArtifact
      }
    };
  }
};

export default metricCAR;

