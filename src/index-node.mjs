/**
 * SCRIPTA SDK - Node.js Full Entrypoint
 * 
 * This entrypoint includes all SDK functionality including
 * Node-specific features (file system, crypto).
 * 
 * For browser usage, import from './index.mjs' instead.
 */

// Re-export everything from browser-safe entrypoint
export * from './index.mjs';

// ============================================
// Node-only: Storage
// ============================================
export {
  initStorage,
  generateId,
  listProjects,
  listProjects as loadProjects,
  loadProject,
  saveProject,
  deleteProject,
  exportProject,
  importProject
} from './storage/projects.mjs';

// ============================================
// Node-only: Audit Chain
// ============================================
export {
  addAuditEntry,
  verifyEntry,
  verifyChain,
  getAuditLog,
  getAuditTrail,
  getAuditByType,
  getAuditByTimeRange,
  generateAuditReport,
  AUDIT_EVENTS
} from './services/audit.mjs';

// ============================================
// Node-only: Background Jobs
// ============================================
export {
  JOB_STATUS,
  createJob,
  startJob,
  updateJobProgress,
  completeJob,
  failJob,
  cancelJob,
  getJob,
  getJob as getJobStatus,
  listJobs,
  runJobSync,
  jobQueue
} from './services/jobs.mjs';

// ============================================
// Node-only: File Store
// ============================================
export { saveToFile, loadFromFile, JsonStore, stores, DATA_DIR } from './services/store.mjs';

// ============================================
// Node-only: VSA Index with Persistence
// ============================================
export { default as VsaIndex } from './vsa/index.mjs';

// ============================================
// Default export
// ============================================
import * as Portable from './index.mjs';
import * as Projects from './storage/projects.mjs';
import * as Audit from './services/audit.mjs';
import * as Jobs from './services/jobs.mjs';
import * as Store from './services/store.mjs';
import VsaIndex from './vsa/index.mjs';

function withoutDefault(mod) {
  const { default: _ignored, ...rest } = mod;
  return rest;
}

export default {
  ...withoutDefault(Portable),
  ...withoutDefault(Projects),
  ...withoutDefault(Audit),
  ...withoutDefault(Jobs),
  ...withoutDefault(Store),
  VsaIndex,
  version: '0.1.0',
  name: 'SCRIPTA SDK (Node.js)',
  environment: 'node'
};
