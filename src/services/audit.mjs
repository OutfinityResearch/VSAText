/**
 * Audit Service with HMAC Signatures
 * Provides immutable, cryptographically signed audit logs
 */

import crypto from 'crypto';
import { stores } from './store.mjs';

// Secret key for HMAC (in production, use environment variable)
const HMAC_SECRET = process.env.SCRIPTA_AUDIT_SECRET || 'scripta-audit-secret-key-change-in-production';

/**
 * Calculate HMAC signature for an audit entry
 */
function calculateSignature(entry) {
  const payload = JSON.stringify({
    id: entry.id,
    event_type: entry.event_type,
    actor: entry.actor,
    timestamp: entry.timestamp,
    payload_hash: entry.payload_hash,
    prev_signature: entry.prev_signature
  });
  
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Calculate hash of a payload object
 */
function hashPayload(payload) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 16);
}

/**
 * Get the last audit entry's signature (for chaining)
 */
function getLastSignature() {
  const entries = stores.audit.values();
  if (entries.length === 0) return '0000000000000000';
  
  // Sort by timestamp descending and get latest
  const sorted = entries.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  return sorted[0].signature || '0000000000000000';
}

/**
 * Create a new audit log entry
 */
function addAuditEntry(eventType, actor, payload = {}, metadata = {}) {
  const entry = {
    id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    event_type: eventType,
    actor: actor,
    timestamp: new Date().toISOString(),
    payload_hash: hashPayload(payload),
    prev_signature: getLastSignature(),
    metadata: {
      ip: metadata.ip || null,
      user_agent: metadata.user_agent || null,
      correlation_id: metadata.correlation_id || crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    }
  };
  
  // Calculate and add signature
  entry.signature = calculateSignature(entry);
  
  stores.audit.set(entry.id, entry);
  return entry;
}

/**
 * Verify an audit entry's signature
 */
function verifyEntry(entry) {
  const expectedSignature = calculateSignature(entry);
  return {
    valid: entry.signature === expectedSignature,
    expected: expectedSignature,
    actual: entry.signature
  };
}

/**
 * Verify the entire audit chain
 */
function verifyChain() {
  const entries = stores.audit.values().sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  const results = {
    valid: true,
    total_entries: entries.length,
    verified: 0,
    failures: []
  };
  
  let prevSignature = '0000000000000000';
  
  for (const entry of entries) {
    // Verify this entry's signature
    const sigValid = verifyEntry(entry);
    if (!sigValid.valid) {
      results.valid = false;
      results.failures.push({
        id: entry.id,
        error: 'Invalid signature',
        expected: sigValid.expected,
        actual: sigValid.actual
      });
    }
    
    // Verify chain linkage
    if (entry.prev_signature !== prevSignature) {
      results.valid = false;
      results.failures.push({
        id: entry.id,
        error: 'Chain broken',
        expected_prev: prevSignature,
        actual_prev: entry.prev_signature
      });
    }
    
    prevSignature = entry.signature;
    results.verified++;
  }
  
  return results;
}

/**
 * Get audit entries for a specific resource
 */
function getAuditTrail(resourceId) {
  return stores.audit.filter(entry => 
    entry.payload_hash?.includes(resourceId) ||
    entry.event_type?.includes(resourceId) ||
    entry.metadata?.correlation_id === resourceId
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Get audit entries by event type
 */
function getAuditByType(eventType) {
  return stores.audit.filter(entry => 
    entry.event_type === eventType || entry.event_type.startsWith(eventType)
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get audit entries within a time range
 */
function getAuditByTimeRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return stores.audit.filter(entry => {
    const ts = new Date(entry.timestamp);
    return ts >= start && ts <= end;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Generate a compliance-ready audit report
 */
function generateAuditReport(filter = {}) {
  let entries = stores.audit.values();
  
  if (filter.start_time) {
    entries = entries.filter(e => new Date(e.timestamp) >= new Date(filter.start_time));
  }
  if (filter.end_time) {
    entries = entries.filter(e => new Date(e.timestamp) <= new Date(filter.end_time));
  }
  if (filter.event_type) {
    entries = entries.filter(e => e.event_type.startsWith(filter.event_type));
  }
  if (filter.actor) {
    entries = entries.filter(e => e.actor === filter.actor);
  }
  
  entries = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  const chainVerification = verifyChain();
  
  return {
    report_id: `audit_report_${Date.now()}`,
    generated_at: new Date().toISOString(),
    filter,
    total_entries: entries.length,
    chain_verification: {
      valid: chainVerification.valid,
      verified: chainVerification.verified,
      failures: chainVerification.failures.length
    },
    entries: entries.map(e => ({
      id: e.id,
      event_type: e.event_type,
      actor: e.actor,
      timestamp: e.timestamp,
      signature_valid: verifyEntry(e).valid
    })),
    signature: crypto.createHmac('sha256', HMAC_SECRET)
      .update(JSON.stringify({ entries: entries.map(e => e.id), generated_at: new Date().toISOString() }))
      .digest('hex')
  };
}

// Event type constants
const AUDIT_EVENTS = {
  SPEC_CREATED: 'spec.created',
  SPEC_UPDATED: 'spec.updated',
  SPEC_DELETED: 'spec.deleted',
  SOP_CREATED: 'sop.created',
  SOP_UPDATED: 'sop.updated',
  PLAN_CREATED: 'plan.created',
  GENERATE_STARTED: 'generate.started',
  GENERATE_COMPLETED: 'generate.completed',
  GENERATE_FAILED: 'generate.failed',
  VERIFY_COMPLETED: 'verify.completed',
  GUARDRAIL_COMPLETED: 'guardrail.completed',
  EVALUATE_COMPLETED: 'evaluate.completed',
  PIPELINE_STARTED: 'pipeline.started',
  PIPELINE_COMPLETED: 'pipeline.completed',
  PIPELINE_FAILED: 'pipeline.failed',
  REVIEW_COMPLETED: 'review.completed',
  RESEARCH_QUERY: 'research.query',
  REVERSE_ENGINEER: 'reverse_engineer.completed',
  COMPLIANCE_REPORT: 'report.compliance',
  AUTH_SUCCESS: 'auth.success',
  AUTH_FAILURE: 'auth.failure'
};

export {
  addAuditEntry,
  verifyEntry,
  verifyChain,
  getAuditTrail,
  getAuditByType,
  getAuditByTimeRange,
  generateAuditReport,
  hashPayload,
  AUDIT_EVENTS
};
