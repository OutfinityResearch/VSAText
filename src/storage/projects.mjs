/**
 * SCRIPTA Project Storage Module
 * 
 * Pure JavaScript module for project persistence.
 * Works with Node.js fs, can be adapted for browser IndexedDB.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Default data directory (can be overridden)
let DATA_DIR = null;
let PROJECTS_DIR = null;

/**
 * Initialize storage with data directory
 */
export function initStorage(dataDir) {
  DATA_DIR = dataDir;
  PROJECTS_DIR = path.join(dataDir, 'projects');
  
  // Ensure directories exist
  [DATA_DIR, PROJECTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

/**
 * Generate unique project ID
 */
export function generateId() {
  return `proj_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Get sanitized project file path
 */
function getProjectPath(id) {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(PROJECTS_DIR, `${safeId}.json`);
}

/**
 * List all projects (metadata only)
 */
export function listProjects() {
  if (!PROJECTS_DIR || !fs.existsSync(PROJECTS_DIR)) return [];
  
  const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), 'utf-8'));
      return {
        id: data.id,
        name: data.name || 'Untitled',
        genre: data.metadata?.genre || '',
        modified_at: data.modified_at || data.created_at,
        metrics_summary: data.metrics?.scores ? { nqs: data.metrics.scores.nqs } : null,
        group_count: data.structure?.groups?.length || 0,
        entity_count: Object.values(data.entities || {}).flat().length
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Load a project by ID
 */
export function loadProject(id) {
  const filepath = getProjectPath(id);
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Save a project (creates or updates)
 */
export function saveProject(project) {
  if (!project.id) project.id = generateId();
  project.modified_at = new Date().toISOString();
  if (!project.created_at) project.created_at = project.modified_at;
  
  const filepath = getProjectPath(project.id);
  fs.writeFileSync(filepath, JSON.stringify(project, null, 2), 'utf-8');
  return project.id;
}

/**
 * Delete a project by ID
 */
export function deleteProject(id) {
  const filepath = getProjectPath(id);
  if (!fs.existsSync(filepath)) return false;
  fs.unlinkSync(filepath);
  return true;
}

/**
 * Export project to JSON string
 */
export function exportProject(id) {
  const project = loadProject(id);
  if (!project) return null;
  return JSON.stringify(project, null, 2);
}

/**
 * Import project from JSON string
 */
export function importProject(jsonString, newId = null) {
  try {
    const project = JSON.parse(jsonString);
    if (newId) project.id = newId;
    return saveProject(project);
  } catch {
    return null;
  }
}

export default {
  initStorage,
  generateId,
  listProjects,
  loadProject,
  saveProject,
  deleteProject,
  exportProject,
  importProject
};
