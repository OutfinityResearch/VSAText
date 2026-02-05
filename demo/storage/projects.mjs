/**
 * SCRIPTA Demo - Project Storage
 * 
 * Handles project persistence using folder-based structure.
 * Each project has its own folder:
 *   projects/{project_name}/
 *     ├── project.json     # Full project state
 *     ├── story.cnl        # Generated CNL
 *     └── stories/         # Generated story versions
 */

import fs from 'fs';
import path from 'path';

// Default data directory
const DATA_DIR = process.env.SCRIPTA_DATA_DIR || '/tmp/scripta_storage';
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

// Ensure directories exist
export function ensureDirectories() {
  [DATA_DIR, PROJECTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

/**
 * Sanitize a string to be used as a filename
 */
export function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return null;
  return name
    .trim()
    .toLowerCase()
    .replace(/[<>:"/\\|?*]/g, '')    // Remove invalid chars
    .replace(/\s+/g, '_')            // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, '')       // Keep only word chars, dash, underscore, dot
    .substring(0, 100);              // Limit length
}

/**
 * Get project folder path
 */
export function getProjectDir(projectName) {
  const safeName = sanitizeFilename(projectName);
  if (!safeName) return null;
  return path.join(PROJECTS_DIR, safeName);
}

/**
 * Get next available project number (project_001, project_002, etc.)
 */
export function getNextProjectNumber() {
  if (!fs.existsSync(PROJECTS_DIR)) return 1;
  
  const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  // Find existing project_XXX patterns
  const projectNumbers = dirs
    .map(name => {
      const match = name.match(/^project_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  
  if (projectNumbers.length === 0) return 1;
  return Math.max(...projectNumbers) + 1;
}

/**
 * Generate default project name
 */
export function generateDefaultProjectName() {
  const num = getNextProjectNumber();
  return `project_${String(num).padStart(3, '0')}`;
}

/**
 * List all projects with metadata
 */
export function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  
  const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  const projects = dirs.map(dirName => {
    const projectPath = path.join(PROJECTS_DIR, dirName, 'project.json');
    try {
      if (!fs.existsSync(projectPath)) return null;
      const data = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
      
      // Count story versions
      const storiesDir = path.join(PROJECTS_DIR, dirName, 'stories');
      let versionCount = 0;
      if (fs.existsSync(storiesDir)) {
        versionCount = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md')).length;
      }
      
      return {
        id: dirName,
        name: data.name || dirName,
        genre: data.metadata?.genre || '',
        modified_at: data.modified_at || data.created_at,
        created_at: data.created_at,
        metrics_summary: data.metrics?.scores ? { nqs: data.metrics.scores.nqs } : null,
        group_count: data.structure?.children?.length || 0,
        entity_count: Object.values(data.libraries || {}).flat().length,
        version_count: versionCount
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  // Sort by modified_at descending (most recent first)
  projects.sort((a, b) => {
    const dateA = new Date(a.modified_at || 0);
    const dateB = new Date(b.modified_at || 0);
    return dateB - dateA;
  });
  
  return projects;
}

/**
 * Load a project by ID (folder name)
 */
export function loadProject(id) {
  const projectDir = path.join(PROJECTS_DIR, sanitizeFilename(id) || '');
  const projectPath = path.join(projectDir, 'project.json');
  
  if (!fs.existsSync(projectPath)) return null;
  
  try {
    const project = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
    project.id = id; // Ensure ID matches folder name
    return project;
  } catch {
    return null;
  }
}

/**
 * Save a project (creates folder structure)
 */
export function saveProject(project) {
  // Use provided name or generate default
  const projectName = sanitizeFilename(project.name) || generateDefaultProjectName();
  const projectDir = path.join(PROJECTS_DIR, projectName);
  const storiesDir = path.join(projectDir, 'stories');
  
  // Create directories
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir, { recursive: true });
  }
  
  // Update project metadata
  project.id = projectName;
  project.modified_at = new Date().toISOString();
  if (!project.created_at) project.created_at = project.modified_at;
  
  // Save project.json
  const projectPath = path.join(projectDir, 'project.json');
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  // Save CNL if available
  if (project.cnl) {
    const cnlPath = path.join(projectDir, 'story.cnl');
    fs.writeFileSync(cnlPath, project.cnl, 'utf-8');
  }
  
  return projectName;
}

/**
 * Delete a project (removes entire folder)
 */
export function deleteProject(id) {
  const projectDir = path.join(PROJECTS_DIR, sanitizeFilename(id) || '');
  if (!fs.existsSync(projectDir)) return false;
  
  // Remove directory recursively
  fs.rmSync(projectDir, { recursive: true, force: true });
  return true;
}

// Export paths for external use
export { PROJECTS_DIR, DATA_DIR };
