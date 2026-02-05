/**
 * Tests for DS12 Metrics Interpreter
 *
 * Tests: world model derivation + core normative metrics (CPSR/CSA/CS).
 */

import { interpretCNL } from '../../src/interpreter/interpreter.mjs';

function getMetric(report, code) {
  const m = (report?.metrics?.results || []).find(r => r.code === code);
  if (!m) throw new Error(`Missing metric ${code}`);
  return m;
}

// Test: Interpreter returns basic report shape
export function testInterpreterProducesReport() {
  const cnl = [
    'Anna is protagonist',
    'Forest is location',
    '',
    'Book group begin',
    '  Sc1 group begin',
    '    Sc1 includes character Anna',
    '    Sc1 includes location Forest',
    '    Anna decides leave',
    '  Sc1 group end',
    'Book group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['CPSR', 'CSA', 'CS'] });

  if (report.interpreter_version !== '1.0') throw new Error('Expected interpreter_version 1.0');
  if (!report.diagnostics?.parse?.valid) throw new Error('Expected parse.valid true');
  if (report.world?.scenes?.count !== 1) throw new Error('Expected 1 scene');
  if (getMetric(report, 'CPSR').value !== 1) throw new Error('Expected CPSR=1');
}

// Test: CS is 0 when adjacent scenes have no overlapping entities
export function testCoherenceScoreZeroWhenNoOverlap() {
  const cnl = [
    'Anna is protagonist',
    'Forest is location',
    'Bob is character',
    'Castle is location',
    '',
    'Book group begin',
    '  Sc1 group begin',
    '    Sc1 includes character Anna',
    '    Sc1 includes location Forest',
    '    Anna decides leave',
    '  Sc1 group end',
    '  Sc2 group begin',
    '    Sc2 includes character Bob',
    '    Sc2 includes location Castle',
    '    Bob decides wait',
    '  Sc2 group end',
    'Book group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['CSA', 'CS'] });
  const cs = getMetric(report, 'CS');
  if (cs.value !== 0) {
    throw new Error(`Expected CS=0, got ${cs.value}`);
  }
  if (cs.pass !== false) throw new Error('Expected CS pass=false');
}

// Test: CS causal chain scores 1.0 when cause->effect pattern exists for shared entity
export function testCoherenceScoreCausalChainFullScore() {
  const cnl = [
    'Anna is protagonist',
    'Forest is location',
    '',
    'Book group begin',
    '  Sc1 group begin',
    '    Sc1 includes character Anna',
    '    Sc1 includes location Forest',
    '    Anna threatens "storm"',
    '  Sc1 group end',
    '  Sc2 group begin',
    '    Sc2 includes character Anna',
    '    Sc2 includes location Forest',
    '    Anna escapes "storm"',
    '  Sc2 group end',
    'Book group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['CSA', 'CS'] });
  const cs = getMetric(report, 'CS');
  const ccPairs = cs.details?.pairs?.cc || [];
  if (ccPairs.length !== 1 || ccPairs[0].score !== 1.0) {
    throw new Error('Expected CC_i = 1.0 for the single adjacent pair');
  }
}

// Test: CSA detects a violated forbids constraint, and CS penalizes it via LVP
export function testCsaViolationPenalizesCoherence() {
  const cnl = [
    'Story forbids "violence"',
    'Anna is protagonist',
    'Forest is location',
    '',
    'Book group begin',
    '  Sc1 group begin',
    '    Sc1 includes character Anna',
    '    Sc1 includes location Forest',
    '    Sc1 describes "A scene of violence."',
    '  Sc1 group end',
    'Book group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['CSA', 'CS'] });
  const csa = getMetric(report, 'CSA');
  if (csa.value !== 0) throw new Error(`Expected CSA=0, got ${csa.value}`);

  const cs = getMetric(report, 'CS');
  if (Math.abs(cs.value - 0.6) > 1e-9) {
    throw new Error(`Expected CS=0.6 with one CSA violation, got ${cs.value}`);
  }
}

// Test: OI is skipped when no trope corpus is provided
export function testOriginalityIndexSkippedWithoutCorpus() {
  const cnl = [
    'Anna is protagonist',
    'Forest is location',
    '',
    'Sc1 group begin',
    '  Sc1 includes character Anna',
    '  Sc1 includes location Forest',
    '  Sc1 describes "A storm gathers."',
    'Sc1 group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['OI'] });
  const oi = getMetric(report, 'OI');
  if (oi.value !== null) throw new Error('Expected OI.value to be null when skipped');
  if (oi.pass !== null) throw new Error('Expected OI.pass to be null when skipped');
}

// Test: EAP uses mood preset valence when mood is set on a scene
export function testEmotionalArcUsesMoodPreset() {
  const cnl = [
    'Book group begin',
    '  Sc1 group begin',
    '    Sc1 has mood melancholic',
    '    Sc1 describes "Quiet rain fell."',
    '  Sc1 group end',
    '  Sc2 group begin',
    '    Sc2 has mood triumphant',
    '    Sc2 describes "Victory at last."',
    '  Sc2 group end',
    'Book group end'
  ].join('\n');

  const report = interpretCNL(cnl, { metric_set: ['EAP'] });
  const eap = getMetric(report, 'EAP');
  const v0 = eap.details?.measured_scene_valence?.[0];
  if (v0?.source?.kind !== 'preset') {
    throw new Error('Expected scene valence source to be mood preset');
  }
}

