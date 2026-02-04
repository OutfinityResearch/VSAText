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
export { loadProjects, saveProject, deleteProject } from './storage/projects.mjs';

// ============================================
// Node-only: Audit Chain
// ============================================
export { addAuditEntry, verifyChain, getAuditLog } from './services/audit.mjs';

// ============================================
// Node-only: Background Jobs
// ============================================
export { createJob, getJobStatus, listJobs } from './services/jobs.mjs';

// ============================================
// Node-only: File Store
// ============================================
export { saveToFile, loadFromFile } from './services/store.mjs';

// ============================================
// Node-only: VSA Index with Persistence
// ============================================
export { default as VsaIndex } from './vsa/index.mjs';

// ============================================
// Default export
// ============================================
import BrowserSDK from './index.mjs';

export default {
  ...BrowserSDK,
  version: '0.1.0',
  name: 'SCRIPTA SDK (Node.js)',
  environment: 'node'
};
