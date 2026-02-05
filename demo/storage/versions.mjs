/**
 * SCRIPTA Demo - Story Version Storage
 * 
 * Handles story version persistence.
 * Each version is stored as: v{NNN}_{lang}_{model}.md
 */

import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR, sanitizeFilename } from './projects.mjs';

/**
 * Parse version filename to extract metadata
 * Format: v{NNN}_{lang}_{model}.md
 */
export function parseVersionFilename(filename) {
  const match = filename.match(/^v(\d+)_([a-z]{2})_(.+)\.md$/);
  if (!match) return null;
  return {
    version: parseInt(match[1], 10),
    language: match[2],
    model: match[3],
    filename
  };
}

/**
 * List story versions for a project
 */
export function listStoryVersions(projectId) {
  const storiesDir = path.join(PROJECTS_DIR, sanitizeFilename(projectId) || '', 'stories');
  if (!fs.existsSync(storiesDir)) return [];
  
  const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md'));
  
  return files.map(filename => {
    const meta = parseVersionFilename(filename);
    if (!meta) return null;
    
    const filePath = path.join(storiesDir, filename);
    const stats = fs.statSync(filePath);
    
    return {
      ...meta,
      created_at: stats.birthtime.toISOString(),
      modified_at: stats.mtime.toISOString(),
      size: stats.size
    };
  }).filter(Boolean).sort((a, b) => b.version - a.version);
}

/**
 * Get next version number for a project
 */
export function getNextVersionNumber(projectId) {
  const versions = listStoryVersions(projectId);
  if (versions.length === 0) return 1;
  return Math.max(...versions.map(v => v.version)) + 1;
}

/**
 * Save a story version
 */
export function saveStoryVersion(projectId, content, language, model) {
  const projectDir = path.join(PROJECTS_DIR, sanitizeFilename(projectId) || '');
  const storiesDir = path.join(projectDir, 'stories');
  
  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir, { recursive: true });
  }
  
  const versionNum = getNextVersionNumber(projectId);
  const safeModel = sanitizeFilename(model) || 'default';
  const filename = `v${String(versionNum).padStart(3, '0')}_${language}_${safeModel}.md`;
  const filePath = path.join(storiesDir, filename);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  return {
    version: versionNum,
    language,
    model: safeModel,
    filename,
    created_at: new Date().toISOString()
  };
}

/**
 * Load a story version
 */
export function loadStoryVersion(projectId, filename) {
  const filePath = path.join(PROJECTS_DIR, sanitizeFilename(projectId) || '', 'stories', filename);
  if (!fs.existsSync(filePath)) return null;
  
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Delete a story version
 */
export function deleteStoryVersion(projectId, filename) {
  const filePath = path.join(PROJECTS_DIR, sanitizeFilename(projectId) || '', 'stories', filename);
  if (!fs.existsSync(filePath)) return false;
  
  fs.unlinkSync(filePath);
  return true;
}
