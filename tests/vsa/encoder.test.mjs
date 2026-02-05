/**
 * Tests for VSA Encoder
 * 
 * Tests: Text encoding, cosine similarity, determinism
 */

import { encodeText, cosine, bind, bundle, permute } from '../../src/vsa/encoder.mjs';

// Test: Same text produces same vector
export function testDeterministicEncoding() {
  const vec1 = encodeText('storm at sea', 128, 42);
  const vec2 = encodeText('storm at sea', 128, 42);
  
  for (let i = 0; i < vec1.length; i++) {
    if (vec1[i] !== vec2[i]) {
      throw new Error('Same text should produce identical vectors');
    }
  }
}

// Test: Different seeds produce different vectors
export function testDifferentSeedsDifferentVectors() {
  const vec1 = encodeText('hello world', 128, 42);
  const vec2 = encodeText('hello world', 128, 99);
  
  let same = true;
  for (let i = 0; i < vec1.length; i++) {
    if (vec1[i] !== vec2[i]) {
      same = false;
      break;
    }
  }
  
  if (same) {
    throw new Error('Different seeds should produce different vectors');
  }
}

// Test: Similar text has higher cosine similarity
export function testSimilarTextHigherSimilarity() {
  const vec1 = encodeText('storm at sea', 1000, 42);
  const vec2 = encodeText('storm at sea', 1000, 42);
  const vec3 = encodeText('calm sunny day', 1000, 42);
  
  const simSame = cosine(vec1, vec2);
  const simDiff = cosine(vec1, vec3);
  
  if (simSame < simDiff) {
    throw new Error('Same text should have higher similarity than different text');
  }
}

// Test: Cosine of identical vectors is 1
export function testCosineIdentical() {
  const vec = encodeText('test text', 128, 42);
  const sim = cosine(vec, vec);
  
  if (Math.abs(sim - 1.0) > 0.0001) {
    throw new Error(`Expected cosine of 1.0 for identical vectors, got ${sim}`);
  }
}

// Test: Vector has correct dimension
export function testVectorDimension() {
  const vec = encodeText('test', 256, 42);
  
  if (vec.length !== 256) {
    throw new Error(`Expected dimension 256, got ${vec.length}`);
  }
}

// Test: Empty text returns valid vector
export function testEmptyTextReturnsVector() {
  const vec = encodeText('', 128, 42);
  
  if (!vec || vec.length !== 128) {
    throw new Error('Empty text should return valid vector');
  }
}

// Test: Cosine handles edge cases
export function testCosineEdgeCases() {
  const sim1 = cosine(null, null);
  const sim2 = cosine([], []);
  const sim3 = cosine([1, 2], [1]);  // Different lengths
  
  if (sim1 !== 0) {
    throw new Error('Cosine of null should be 0');
  }
  if (sim2 !== 0) {
    throw new Error('Cosine of empty arrays should be 0');
  }
  if (sim3 !== 0) {
    throw new Error('Cosine of different length arrays should be 0');
  }
}

// Test: bind is element-wise multiplication (bipolar binding)
export function testBindElementwiseMultiply() {
  const a = [1, -1, 1];
  const b = [-1, -1, 1];
  const out = bind(a, b);

  const expected = [-1, 1, 1];
  for (let i = 0; i < expected.length; i++) {
    if (out[i] !== expected[i]) {
      throw new Error(`Expected bind()[${i}] to be ${expected[i]}, got ${out[i]}`);
    }
  }
}

// Test: bundle uses majority vote with +1 tie-break
export function testBundleMajorityVote() {
  const out = bundle([
    [1, 1, -1],
    [1, -1, -1],
    [-1, 1, -1]
  ]);

  const expected = [1, 1, -1];
  for (let i = 0; i < expected.length; i++) {
    if (out[i] !== expected[i]) {
      throw new Error(`Expected bundle()[${i}] to be ${expected[i]}, got ${out[i]}`);
    }
  }
}

// Test: permute performs a cyclic shift
export function testPermuteCyclicShift() {
  const out = permute([1, 2, 3, 4], 1);
  const expected = [4, 1, 2, 3];

  for (let i = 0; i < expected.length; i++) {
    if (out[i] !== expected[i]) {
      throw new Error(`Expected permute()[${i}] to be ${expected[i]}, got ${out[i]}`);
    }
  }
}
