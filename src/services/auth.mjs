/**
 * API Key Authentication Service
 * Simple header-based API key validation
 */
import crypto from 'crypto';
import { stores } from './store.mjs';

const API_KEY_HEADER = 'x-api-key';
const MASTER_KEY_ENV = 'SCRIPTA_MASTER_KEY';

/**
 * Generate a new API key
 */
function generateApiKey(name, roles = ['author']) {
  const key = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const record = {
    id: `apikey_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    name,
    keyHash,
    roles,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    active: true
  };
  stores.apiKeys.set(record.id, record);
  return { id: record.id, key, roles };
}

/**
 * Validate API key from request
 * Returns { valid, keyRecord, error }
 */
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, keyRecord: null, error: 'missing_api_key' };
  }

  // Check master key from environment
  const masterKey = process.env[MASTER_KEY_ENV];
  if (masterKey && apiKey === masterKey) {
    return {
      valid: true,
      keyRecord: {
        id: 'master',
        name: 'Master Key',
        roles: ['admin', 'author', 'reviewer', 'compliance'],
        active: true
      },
      error: null
    };
  }

  // Check stored keys
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = stores.apiKeys.find(k => k.keyHash === keyHash && k.active);
  
  if (!keyRecord) {
    return { valid: false, keyRecord: null, error: 'invalid_api_key' };
  }

  // Update last used timestamp
  keyRecord.lastUsed = new Date().toISOString();
  stores.apiKeys.set(keyRecord.id, keyRecord);

  return { valid: true, keyRecord, error: null };
}

/**
 * Express-style middleware for API key authentication
 */
function authMiddleware(req) {
  const apiKey = req.headers[API_KEY_HEADER];
  return validateApiKey(apiKey);
}

/**
 * Check if keyRecord has required role
 */
function hasRole(keyRecord, requiredRole) {
  if (!keyRecord) return false;
  if (keyRecord.roles.includes('admin')) return true;
  return keyRecord.roles.includes(requiredRole);
}

/**
 * Revoke an API key
 */
function revokeApiKey(keyId) {
  const record = stores.apiKeys.get(keyId);
  if (record) {
    record.active = false;
    record.revokedAt = new Date().toISOString();
    stores.apiKeys.set(keyId, record);
    return true;
  }
  return false;
}

/**
 * List all API keys (without exposing actual keys)
 */
function listApiKeys() {
  return stores.apiKeys.values().map(k => ({
    id: k.id,
    name: k.name,
    roles: k.roles,
    active: k.active,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed
  }));
}

export {
  generateApiKey,
  validateApiKey,
  authMiddleware,
  hasRole,
  revokeApiKey,
  listApiKeys,
  API_KEY_HEADER
};
