/**
 * SCRIPTA Demo - Persistence
 * 
 * Project persistence with folder-based storage and autosave.
 * Each project has its own folder with CNL and versioned story files.
 */

import { state, loadProjectState, resetProject } from './state.mjs';
import { $, openModal, closeModal, showNotification } from './utils.mjs';
import { renderTree } from './tree.mjs';
import { renderEntityGrid } from './entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from './views.mjs';
import { renderEmptyMetrics } from './metrics.mjs';
import { generateCNL } from './cnl.mjs';
import { updateGenerateButton } from './generation.mjs';
import { resetNLState, loadStoryVersions } from './nl-generation.mjs';

// Autosave interval in milliseconds
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
let autosaveTimer = null;
let lastSaveTime = 0;
let pendingChanges = false;

/**
 * Mark that there are pending changes to save
 */
export function markDirty() {
  pendingChanges = true;
}

/**
 * Save project to server (autosave or manual)
 */
export async function saveProject(silent = false) {
  // Can't save without a project ID (name)
  if (!state.project.id) {
    if (!silent) {
      showNotification('No project name set. Use New or Generate first.', 'info');
    }
    return false;
  }
  
  const projectData = {
    ...state.project,
    name: state.project.name || state.project.id,
    cnl: generateCNL() // Include CNL in save
  };
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(state.project.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      // Try POST if PUT fails (new project)
      const postResponse = await fetch('/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (!postResponse.ok) {
        const err = await postResponse.json();
        throw new Error(err.error?.message || 'Save failed');
      }
      
      const result = await postResponse.json();
      state.project.id = result.id;
    }
    
    lastSaveTime = Date.now();
    pendingChanges = false;
    
    if (!silent) {
      showNotification('Project saved', 'success');
    }
    
    return true;
  } catch (err) {
    if (!silent) {
      showNotification('Error saving project: ' + err.message, 'error');
    }
    console.error('Save error:', err);
    return false;
  }
}

/**
 * Autosave handler - saves if there are pending changes
 */
async function autosaveHandler() {
  if (pendingChanges && state.project.id) {
    console.log('[Autosave] Saving changes...');
    await saveProject(true);
  }
}

/**
 * Start autosave timer
 */
export function startAutosave() {
  if (autosaveTimer) return;
  autosaveTimer = setInterval(autosaveHandler, AUTOSAVE_INTERVAL);
  console.log('[Autosave] Started (interval: ' + AUTOSAVE_INTERVAL + 'ms)');
}

/**
 * Stop autosave timer
 */
export function stopAutosave() {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
    console.log('[Autosave] Stopped');
  }
}

/**
 * Get next available project name from server
 */
export async function getNextProjectName() {
  try {
    const response = await fetch('/v1/projects/next-number');
    if (!response.ok) return 'project_001';
    const data = await response.json();
    return data.defaultName || 'project_001';
  } catch {
    return 'project_001';
  }
}

/**
 * Load projects list and display modal
 */
export async function loadProjectsList() {
  $('#load-modal-body').innerHTML = '<div class="empty-state"><div class="empty-state-text">Loading...</div></div>';
  openModal('load-modal');
  
  try {
    const response = await fetch('/v1/projects');
    if (!response.ok) throw new Error('Failed to load projects');
    
    const data = await response.json();
    const projects = data.projects || [];
    
    if (projects.length === 0) {
      $('#load-modal-body').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <div class="empty-state-text">No saved projects</div>
          <div class="empty-state-hint">Create a story to get started</div>
        </div>`;
      return;
    }
    
    $('#load-modal-body').innerHTML = `
      <div class="entity-grid">
        ${projects.map(p => `
          <div class="entity-card" onclick="loadProject('${p.id}')" style="cursor:pointer;">
            <div class="entity-name">${p.name || p.id}</div>
            <div class="entity-type">${p.genre || 'Story'}</div>
            <div class="entity-desc" style="font-size:0.7rem;color:var(--text-faded);">
              ${p.entity_count || 0} entities · ${p.group_count || 0} chapters
              ${p.version_count ? `· ${p.version_count} versions` : ''}
            </div>
            <div class="entity-tags">
              <span class="entity-tag">${new Date(p.modified_at).toLocaleDateString()}</span>
              ${p.metrics_summary?.nqs ? `<span class="entity-tag">NQS: ${(p.metrics_summary.nqs * 100).toFixed(0)}%</span>` : ''}
            </div>
            <button class="btn danger small" onclick="event.stopPropagation(); deleteProjectFromServer('${p.id}')" style="margin-top:0.5rem;">Delete</button>
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    $('#load-modal-body').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Error loading projects</div>
        <div class="empty-state-hint">${err.message}</div>
      </div>`;
  }
}

/**
 * Load a project by ID
 */
window.loadProject = async (id) => {
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error('Failed to load project');
    
    const data = await response.json();
    const project = data.project;
    
    loadProjectState(project);
    
    $('#project-name').value = state.project.name || state.project.id;
    
    renderTree();
    ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
    renderRelationshipsView();
    renderEmotionalArcView();
    renderBlocksView();
    renderWorldRulesView();
    renderEmptyMetrics();
    
    // Load story versions for this project
    loadStoryVersions();
    
    closeModal('load-modal');
    showNotification('Project loaded', 'success');
    pendingChanges = false;
  } catch (err) {
    showNotification('Error loading project: ' + err.message, 'error');
  }
};

/**
 * Delete a project
 */
window.deleteProjectFromServer = async (id) => {
  if (!confirm('Delete this project permanently? This will also delete all story versions.')) return;
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete');
    
    if (state.project.id === id) {
      state.project.id = null;
      state.project.name = 'Untitled Story';
      pendingChanges = false;
    }
    
    loadProjectsList();
    showNotification('Project deleted', 'success');
  } catch (err) {
    showNotification('Error deleting project: ' + err.message, 'error');
  }
};

/**
 * Show project name dialog and return promise with the name
 */
export function showProjectNameDialog(title = 'Project Name') {
  return new Promise(async (resolve) => {
    // Get default name from server
    const defaultName = await getNextProjectName();
    
    const titleEl = $('#project-name-modal-title');
    if (titleEl) titleEl.textContent = title;
    
    const input = $('#new-project-name-input');
    if (input) {
      input.value = defaultName;
      input.select();
    }
    
    openModal('project-name-modal');
    
    // Focus input after modal opens
    setTimeout(() => input?.focus(), 100);
    
    // Setup handlers
    const confirmBtn = $('#btn-project-name-confirm');
    const modal = $('#project-name-modal');
    
    const handleConfirm = () => {
      const name = input?.value?.trim() || defaultName;
      closeModal('project-name-modal');
      cleanup();
      resolve(name);
    };
    
    const handleCancel = () => {
      closeModal('project-name-modal');
      cleanup();
      resolve(null);
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    const cleanup = () => {
      confirmBtn?.removeEventListener('click', handleConfirm);
      input?.removeEventListener('keydown', handleKeydown);
      modal?.removeEventListener('click', handleOverlayClick);
    };
    
    const handleOverlayClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };
    
    confirmBtn?.addEventListener('click', handleConfirm);
    input?.addEventListener('keydown', handleKeydown);
    modal?.addEventListener('click', handleOverlayClick);
  });
}

/**
 * Execute the actual new project reset
 */
function executeNewProject(projectName) {
  resetProject();
  
  state.project.id = projectName;
  state.project.name = projectName;
  
  $('#project-name').value = projectName;
  renderTree();
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
  generateCNL();
  
  // Reset generation state and update buttons
  updateGenerateButton();
  resetNLState();
  
  // Save immediately to create the folder
  saveProject(true);
  
  showNotification(`Project "${projectName}" created`, 'success');
  pendingChanges = false;
}

/**
 * Create new project - autosaves current, then shows dialog for new name
 */
export async function newProject() {
  // Autosave current project if it exists and has changes
  if (state.project.id && pendingChanges) {
    await saveProject(true);
  }
  
  // Show dialog for new project name
  const projectName = await showProjectNameDialog('New Project');
  if (projectName) {
    executeNewProject(projectName);
  }
}

/**
 * Initialize persistence - setup autosave and beforeunload
 */
export function initPersistence() {
  // Start autosave
  startAutosave();
  
  // Save before closing
  window.addEventListener('beforeunload', (e) => {
    if (pendingChanges && state.project.id) {
      // Try to save (async, might not complete)
      saveProject(true);
      
      // Show warning
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  });
  
  // Mark dirty on any state change (delegate to specific modules)
  console.log('[Persistence] Initialized with autosave');
}
