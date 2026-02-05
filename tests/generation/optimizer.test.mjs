/**
 * Tests for src/generation/optimizer.mjs
 * 
 * Tests: optimizeStory, applyConstraintOptimizations, constraint functions
 */

import {
  optimizeStory,
  quickOptimize,
  applyConstraintOptimizations,
  ensureValidReferences,
  ensureMinimumElements,
  ensureEmotionalArcCoverage,
  normalizeCharacterTraits,
  ensureStructuralCompleteness
} from '../../src/generation/optimizer.mjs';

// Test: ensureValidReferences removes invalid refs
export function testEnsureValidReferencesRemovesInvalid() {
  const project = {
    libraries: {
      characters: [{ id: 'c1', name: 'Hero' }],
      locations: [{ id: 'l1', name: 'Forest' }],
      moods: []
    },
    structure: {
      children: [{
        children: [{
          children: [
            { type: 'character-ref', refId: 'c1' },
            { type: 'character-ref', refId: 'invalid' },
            { type: 'location-ref', refId: 'l1' },
            { type: 'location-ref', refId: 'invalid' }
          ]
        }]
      }]
    }
  };
  
  const result = ensureValidReferences(project);
  const sceneChildren = result.structure.children[0].children[0].children;
  
  if (sceneChildren.length !== 2) {
    throw new Error(`Expected 2 valid refs, got ${sceneChildren.length}`);
  }
}

// Test: ensureValidReferences is immutable
export function testEnsureValidReferencesImmutable() {
  const project = {
    libraries: { characters: [], locations: [], moods: [] },
    structure: { children: [] }
  };
  
  const result = ensureValidReferences(project);
  
  if (result === project) {
    throw new Error('Should return new object');
  }
}

// Test: ensureMinimumElements adds missing
export function testEnsureMinimumElementsAddsMissing() {
  const project = {
    libraries: {
      characters: [],
      locations: [],
      moods: []
    }
  };
  
  const result = ensureMinimumElements(project);
  
  if (result.libraries.characters.length < 1) {
    throw new Error('Expected at least 1 character');
  }
  if (result.libraries.locations.length < 1) {
    throw new Error('Expected at least 1 location');
  }
  if (result.libraries.moods.length < 1) {
    throw new Error('Expected at least 1 mood');
  }
}

// Test: ensureMinimumElements preserves existing
export function testEnsureMinimumElementsPreservesExisting() {
  const project = {
    libraries: {
      characters: [{ id: 'c1', name: 'Hero' }],
      locations: [{ id: 'l1', name: 'Forest' }],
      moods: [{ id: 'm1', name: 'Dark' }]
    }
  };
  
  const result = ensureMinimumElements(project);
  
  if (result.libraries.characters[0].id !== 'c1') {
    throw new Error('Should preserve existing character');
  }
}

// Test: ensureEmotionalArcCoverage adds moods
export function testEnsureEmotionalArcCoverageAddsMoods() {
  const project = {
    libraries: {
      emotionalArc: [],
      moods: [{ id: 'm1', name: 'Dark' }]
    },
    blueprint: {
      beatMappings: [
        { beatKey: 'call' },
        { beatKey: 'ordeal' }
      ]
    }
  };
  
  const result = ensureEmotionalArcCoverage(project);
  
  if (result.libraries.emotionalArc.length < 2) {
    throw new Error('Expected mood assignments for beats');
  }
}

// Test: normalizeCharacterTraits limits traits
export function testNormalizeCharacterTraitsLimitsTraits() {
  const project = {
    libraries: {
      characters: [{
        id: 'c1',
        name: 'Hero',
        traits: ['a', 'b', 'c', 'd', 'e', 'f'] // 6 traits
      }]
    }
  };
  
  const result = normalizeCharacterTraits(project);
  
  if (result.libraries.characters[0].traits.length > 4) {
    throw new Error('Expected max 4 traits');
  }
}

// Test: normalizeCharacterTraits ensures at least one
export function testNormalizeCharacterTraitsEnsuresOne() {
  const project = {
    libraries: {
      characters: [{
        id: 'c1',
        name: 'Hero',
        traits: []
      }]
    }
  };
  
  const result = normalizeCharacterTraits(project);
  
  if (result.libraries.characters[0].traits.length < 1) {
    throw new Error('Expected at least 1 trait');
  }
}

// Test: ensureStructuralCompleteness adds character to scene
export function testEnsureStructuralCompletenessAddsCharacter() {
  const project = {
    libraries: {
      characters: [{ id: 'c1', name: 'Hero', archetype: 'hero' }],
      locations: [{ id: 'l1', name: 'Forest' }],
      moods: []
    },
    structure: {
      children: [{
        type: 'chapter',
        children: [{
          type: 'scene',
          children: [] // Empty scene
        }]
      }]
    }
  };
  
  const result = ensureStructuralCompleteness(project);
  const sceneChildren = result.structure.children[0].children[0].children;
  
  const hasCharRef = sceneChildren.some(c => c.type === 'character-ref');
  if (!hasCharRef) {
    throw new Error('Expected character reference added');
  }
}

// Test: ensureStructuralCompleteness adds scene to empty chapter
export function testEnsureStructuralCompletenessAddsScene() {
  const project = {
    libraries: {
      characters: [],
      locations: [],
      moods: []
    },
    structure: {
      children: [{
        type: 'chapter',
        name: 'Ch1',
        children: [] // Empty chapter
      }]
    }
  };
  
  const result = ensureStructuralCompleteness(project);
  
  if (result.structure.children[0].children.length < 1) {
    throw new Error('Expected scene added to chapter');
  }
}

// Test: applyConstraintOptimizations with low scores
export function testApplyConstraintOptimizationsWithLowScores() {
  const project = {
    libraries: {
      characters: [],
      locations: [],
      moods: [],
      emotionalArc: []
    },
    structure: { children: [] },
    blueprint: { beatMappings: [] }
  };
  
  const evalResult = {
    success: true,
    metrics: {
      coherence: { score: 0.3 },
      completeness: { score: 0.3 },
      explainability: { score: 0.3 },
      characterDrift: { score: 0.3 }
    }
  };
  
  const result = applyConstraintOptimizations(project, evalResult);
  
  // Should have added elements
  if (result.libraries.characters.length < 1) {
    throw new Error('Expected characters added');
  }
}

// Test: applyConstraintOptimizations with good scores
export function testApplyConstraintOptimizationsWithGoodScores() {
  const project = {
    libraries: {
      characters: [{ id: 'c1', name: 'Hero' }],
      locations: [],
      moods: [],
      emotionalArc: []
    },
    structure: { children: [] },
    blueprint: { beatMappings: [] }
  };
  
  const evalResult = {
    success: true,
    metrics: {
      coherence: { score: 0.9 },
      completeness: { score: 0.9 },
      explainability: { score: 0.9 },
      characterDrift: { score: 0.9 }
    }
  };
  
  const result = applyConstraintOptimizations(project, evalResult);
  
  // Should preserve existing
  if (result.libraries.characters[0].id !== 'c1') {
    throw new Error('Should preserve existing character');
  }
}

// Test: optimizeStory returns valid result
export function testOptimizeStoryReturnsResult() {
  const result = optimizeStory(
    { genre: 'fantasy', tone: 'balanced', chars: 'few', length: 'short' },
    { maxIterations: 1, targetNQS: 0.5 }
  );
  
  if (!result) {
    throw new Error('Expected result object');
  }
  if (typeof result.success !== 'boolean') {
    throw new Error('Expected success boolean');
  }
  if (typeof result.score !== 'number') {
    throw new Error('Expected score number');
  }
}

// Test: optimizeStory calls progress callback
export function testOptimizeStoryProgressCallback() {
  let progressCalled = false;
  
  optimizeStory(
    { genre: 'fantasy' },
    { maxIterations: 1 },
    (progress) => {
      progressCalled = true;
      if (typeof progress.iteration !== 'number') {
        throw new Error('Expected iteration number');
      }
    }
  );
  
  if (!progressCalled) {
    throw new Error('Progress callback should be called');
  }
}

// Test: quickOptimize convenience function
export function testQuickOptimize() {
  const result = quickOptimize({ genre: 'fantasy' });
  
  if (!result) {
    throw new Error('Expected result');
  }
  if (!result.project) {
    throw new Error('Expected project in result');
  }
}
