/**
 * Tests for generation annotations integration
 *
 * Tests: LLM/random annotation merge and CNL serialization visibility.
 */

import { createProject } from '../../src/models/project.mjs';
import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';
import { applyGenerationAnnotations } from '../../demo/app/generation/generation-annotations.mjs';

// Test: LLM strategy keeps LLM annotations and always adds guidance layers
export function testApplyGenerationAnnotationsMergesLayers() {
  const project = createProject('Annotation Test');

  applyGenerationAnnotations(project, {
    strategy: 'llm',
    options: { tone: 'tense', length: 'short', complexity: 'complex' },
    llmAnnotations: [
      { type: 'hint', content: 'Keep betrayal clues subtle until midpoint.' },
      { type: 'subtext', content: 'Hide fear behind confident dialogue.' }
    ]
  });

  const global = project.cnlAnnotations?.global || [];
  if (global.length < 10) {
    throw new Error(`Expected merged annotations, got ${global.length}`);
  }

  const hasLlmHint = global.some(a => a.type === 'hint' && a.content.includes('betrayal clues'));
  if (!hasLlmHint) {
    throw new Error('Expected custom LLM hint annotation to be preserved');
  }

  const hasRichGuidance = global.some(a => ['voice', 'sensory', 'reveal', 'subtext'].includes(a.type));
  if (!hasRichGuidance) {
    throw new Error('Expected predefined rich guidance annotations to be included');
  }
}

// Test: Generated CNL always contains annotation lines after merge
export function testSerializedCNLContainsMergedAnnotations() {
  const project = createProject('CNL Annotation Visibility');

  applyGenerationAnnotations(project, {
    strategy: 'llm',
    options: { tone: 'mysterious' },
    llmAnnotations: [{ type: 'style', content: 'Prefer concise noir phrasing with high contrast imagery.' }]
  });

  const cnl = serializeToCNL(project);
  if (!cnl.includes('#hint:')) {
    throw new Error('Expected #hint annotations in serialized CNL');
  }
  if (!cnl.includes('Prefer concise noir phrasing with high contrast imagery.')) {
    throw new Error('Expected LLM-specific annotation text in serialized CNL');
  }
}

