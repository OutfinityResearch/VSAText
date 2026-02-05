/**
 * Tests for Planning Service
 *
 * Tests: extractSceneRequirementsFromSpec handles max/min constraints correctly.
 */

import { extractSceneRequirementsFromSpec } from '../../src/services/planning.mjs';

// Test: Extracts max/min/tone/must constraints for Scene_N
export function testExtractSceneRequirementsMaxMin() {
  const spec = {
    cnl_constraints: `
Scene_3 has max words 1000
Scene_3 has min tension 5
Scene_3 has tone tense
Scene_3 requires storm
Scene_3 forbids violence
Scene_3 must introduce Villain
`
  };

  const reqs = extractSceneRequirementsFromSpec(spec);
  const r3 = reqs[3];

  if (!r3) throw new Error('Expected requirements for Scene_3');
  if (r3.max.words !== 1000) throw new Error(`Expected max.words=1000, got ${r3.max.words}`);
  if (r3.min.tension !== 5) throw new Error(`Expected min.tension=5, got ${r3.min.tension}`);
  if (r3.tone !== 'tense') throw new Error(`Expected tone=tense, got ${r3.tone}`);
  if (!r3.must_include.includes('storm')) throw new Error('Expected must_include to contain "storm"');
  if (!r3.must_exclude.includes('violence')) throw new Error('Expected must_exclude to contain "violence"');

  const hasIntroduce = r3.must_actions.some(a => a.action === 'introduce' && a.target === 'Villain');
  if (!hasIntroduce) throw new Error('Expected must_actions to include { action: introduce, target: Villain }');
}

