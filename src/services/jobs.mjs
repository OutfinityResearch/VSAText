/**
 * Async Job Manager
 * Handles job queue and status tracking for long-running operations
 */

import crypto from 'crypto';
import { stores } from './store.mjs';

// Job status enum
const JOB_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Create a new job
 */
function createJob(type, params = {}) {
  const job = {
    job_id: `job_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    type,
    status: JOB_STATUS.QUEUED,
    params,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    progress: 0,
    result: null,
    error: null,
    output_refs: []
  };
  
  stores.generateJobs.set(job.job_id, job);
  return job;
}

/**
 * Start a job
 */
function startJob(jobId) {
  const job = stores.generateJobs.get(jobId);
  if (!job) return null;
  
  job.status = JOB_STATUS.RUNNING;
  job.started_at = new Date().toISOString();
  stores.generateJobs.set(jobId, job);
  
  return job;
}

/**
 * Update job progress
 */
function updateJobProgress(jobId, progress, message = null) {
  const job = stores.generateJobs.get(jobId);
  if (!job) return null;
  
  job.progress = Math.max(0, Math.min(100, progress));
  if (message) {
    job.progress_message = message;
  }
  stores.generateJobs.set(jobId, job);
  
  return job;
}

/**
 * Complete a job successfully
 */
function completeJob(jobId, result, outputRefs = []) {
  const job = stores.generateJobs.get(jobId);
  if (!job) return null;
  
  job.status = JOB_STATUS.COMPLETED;
  job.completed_at = new Date().toISOString();
  job.progress = 100;
  job.result = result;
  job.output_refs = outputRefs;
  stores.generateJobs.set(jobId, job);
  
  return job;
}

/**
 * Fail a job
 */
function failJob(jobId, error) {
  const job = stores.generateJobs.get(jobId);
  if (!job) return null;
  
  job.status = JOB_STATUS.FAILED;
  job.completed_at = new Date().toISOString();
  job.error = typeof error === 'string' ? error : error.message;
  stores.generateJobs.set(jobId, job);
  
  return job;
}

/**
 * Cancel a job
 */
function cancelJob(jobId) {
  const job = stores.generateJobs.get(jobId);
  if (!job) return null;
  if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED) {
    return null; // Cannot cancel finished jobs
  }
  
  job.status = JOB_STATUS.CANCELLED;
  job.completed_at = new Date().toISOString();
  stores.generateJobs.set(jobId, job);
  
  return job;
}

/**
 * Get job status
 */
function getJob(jobId) {
  return stores.generateJobs.get(jobId);
}

/**
 * List jobs with optional filtering
 */
function listJobs(filter = {}) {
  let jobs = stores.generateJobs.values();
  
  if (filter.type) {
    jobs = jobs.filter(j => j.type === filter.type);
  }
  if (filter.status) {
    jobs = jobs.filter(j => j.status === filter.status);
  }
  
  return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Run a job synchronously (for simple operations)
 * Returns the job after completion
 */
async function runJobSync(jobId, executor) {
  const job = startJob(jobId);
  if (!job) throw new Error('Job not found');
  
  try {
    const result = await executor(
      (progress, message) => updateJobProgress(jobId, progress, message)
    );
    return completeJob(jobId, result.result, result.output_refs || []);
  } catch (err) {
    return failJob(jobId, err);
  }
}

/**
 * Simple job queue processor (for async simulation)
 */
class JobQueue {
  constructor() {
    this.processing = false;
    this.executors = new Map();
  }
  
  registerExecutor(type, executor) {
    this.executors.set(type, executor);
  }
  
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    const queuedJobs = listJobs({ status: JOB_STATUS.QUEUED });
    
    for (const job of queuedJobs) {
      const executor = this.executors.get(job.type);
      if (executor) {
        await runJobSync(job.job_id, executor);
      }
    }
    
    this.processing = false;
  }
}

// Singleton queue instance
const jobQueue = new JobQueue();

export {
  JOB_STATUS,
  createJob,
  startJob,
  updateJobProgress,
  completeJob,
  failJob,
  cancelJob,
  getJob,
  listJobs,
  runJobSync,
  jobQueue
};
