/**
 * Tests for NL generation continuation helpers
 *
 * Tests: Repairs truncated outputs by requesting continuation.
 */

import { generateTextWithContinuation } from '../../src/generation/nl-generator-continuation.mjs';
import { validateContent } from '../../src/generation/nl-generator.mjs';

// Test: Continuation fixes "truncated mid-word"
export async function testContinuationRepairsTruncatedOutput() {
  const calls = [];

  const llmProvider = {
    async generateText(prompt) {
      calls.push(prompt);
      if (calls.length === 1) return 'Hello worl';
      return 'd.';
    }
  };

  const text = await generateTextWithContinuation({
    llmProvider,
    prompt: 'Write something.',
    llmCallOptions: { maxTokens: 10, timeout: 1000 },
    continuationCallOptions: { maxTokens: 10, timeout: 1000 },
    validate: (t) => validateContent(t, 5),
    sectionLabel: 'Chapter 1: "Test"',
    options: { language: 'en' },
    maxContinuations: 2
  });

  if (text !== 'Hello world.') {
    throw new Error(`Expected repaired text, got: ${JSON.stringify(text)}`);
  }

  if (calls.length !== 2) {
    throw new Error(`Expected 2 LLM calls, got ${calls.length}`);
  }
}

// Test: Non-truncation validation errors are not retried
export async function testNonTruncationValidationErrorDoesNotRetry() {
  const calls = [];

  const llmProvider = {
    async generateText(prompt) {
      calls.push(prompt);
      return 'Ok.';
    }
  };

  let didThrow = false;
  try {
    await generateTextWithContinuation({
      llmProvider,
      prompt: 'Write something.',
      llmCallOptions: { maxTokens: 10, timeout: 1000 },
      continuationCallOptions: { maxTokens: 10, timeout: 1000 },
      validate: (t) => validateContent(t, 100), // too short, but not "truncated"
      sectionLabel: 'Scene "Test" (Chapter 1)',
      options: { language: 'en' },
      maxContinuations: 2
    });
  } catch (err) {
    didThrow = true;
    if (!String(err.message || '').includes('Content too short')) {
      throw new Error(`Expected 'Content too short' error, got: ${err.message}`);
    }
  }

  if (!didThrow) {
    throw new Error('Expected function to throw');
  }

  if (calls.length !== 1) {
    throw new Error(`Expected 1 LLM call, got ${calls.length}`);
  }
}

