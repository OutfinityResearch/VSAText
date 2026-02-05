/**
 * Tests for Node.js Full SDK Entrypoint
 *
 * Tests: `src/index-node.mjs` is importable and exposes expected exports.
 */

import SDK, { parseCNL, VsaIndex, saveToFile, loadFromFile, getAuditLog } from '../../src/index-node.mjs';

// Test: index-node.mjs can be imported and basic exports exist
export async function testIndexNodeImportable() {
  if (!SDK || SDK.environment !== 'node') {
    throw new Error('Expected default SDK export with environment="node"');
  }
  if (typeof parseCNL !== 'function') {
    throw new Error('Expected parseCNL to be exported as a function');
  }
  if (typeof VsaIndex !== 'function') {
    throw new Error('Expected VsaIndex to be exported');
  }
  if (typeof saveToFile !== 'function' || typeof loadFromFile !== 'function') {
    throw new Error('Expected saveToFile/loadFromFile to be exported');
  }
  if (typeof getAuditLog !== 'function') {
    throw new Error('Expected getAuditLog to be exported');
  }

  const result = parseCNL('Anna is protagonist');
  if (!result || result.valid !== true) {
    throw new Error('Expected parseCNL to validate a simple declaration');
  }
}

