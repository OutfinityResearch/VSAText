/**
 * SCRIPTA Demo - Persistence
 * 
 * Save/Load projects to/from server.
 */

import { state, loadProjectState, resetProject } from './state.mjs';
import { $, openModal, closeModal, showNotification } from './utils.mjs';
import { renderTree } from './tree.mjs';
import { renderEntityGrid } from './entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from './views.mjs';
import { renderEmptyMetrics } from './metrics.mjs';
import { generateCNL } from './cnl.mjs';
import { updateGenerateButton } from './generation.mjs';
import { resetNLState } from './nl-generation.mjs';

export async function saveProject() {
  const projectData = {
    ...state.project,
    name: $('#project-name').value || 'Untitled Story'
  };
  state.project.name = projectData.name;
  
  try {
    const isUpdate = !!state.project.id;
    const url = isUpdate ? `/v1/projects/${state.project.id}` : '/v1/projects';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Save failed');
    }
    
    const result = await response.json();
    state.project.id = result.id;
    
    showNotification('Project saved successfully', 'success');
  } catch (err) {
    showNotification('Error saving project: ' + err.message, 'error');
  }
}

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
          <div class="empty-state-hint">Create a story and click Save</div>
        </div>`;
      return;
    }
    
    $('#load-modal-body').innerHTML = `
      <div class="entity-grid">
        ${projects.map(p => `
          <div class="entity-card" onclick="loadProject('${p.id}')" style="cursor:pointer;">
            <div class="entity-name">${p.name || 'Untitled'}</div>
            <div class="entity-type">${p.genre || 'Story'}</div>
            <div class="entity-desc" style="font-size:0.7rem;color:var(--text-faded);">
              ${p.entity_count || 0} entities · ${p.group_count || 0} groups
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

window.loadProject = async (id) => {
  try {
    const response = await fetch(`/v1/projects/${id}`);
    if (!response.ok) throw new Error('Failed to load project');
    
    const data = await response.json();
    const project = data.project;
    
    loadProjectState(project);
    
    $('#project-name').value = state.project.name;
    
    renderTree();
    ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
    renderRelationshipsView();
    renderEmotionalArcView();
    renderBlocksView();
    renderWorldRulesView();
    renderEmptyMetrics();
    
    closeModal('load-modal');
    showNotification('Project loaded', 'success');
  } catch (err) {
    showNotification('Error loading project: ' + err.message, 'error');
  }
};

window.deleteProjectFromServer = async (id) => {
  if (!confirm('Delete this project permanently?')) return;
  
  try {
    const response = await fetch(`/v1/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete');
    
    if (state.project.id === id) {
      state.project.id = null;
    }
    
    loadProjectsList();
    showNotification('Project deleted', 'success');
  } catch (err) {
    showNotification('Error deleting project: ' + err.message, 'error');
  }
};

/**
 * Check if current project has unsaved changes
 */
function hasUnsavedChanges() {
  // If no structure and no entities, nothing to save
  if (!state.project.structure) {
    const libs = state.project.libraries;
    const hasEntities = libs.characters.length > 0 || 
                       libs.locations.length > 0 || 
                       libs.objects.length > 0 ||
                       libs.themes.length > 0 ||
                       libs.worldRules.length > 0;
    if (!hasEntities) return false;
  }
  return true;
}

/**
 * Execute the actual new project reset
 */
function executeNewProject() {
  resetProject();
  $('#project-name').value = state.project.name;
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
  
  showNotification('New project created', 'success');
}

export function newProject() {
  // Check for unsaved changes
  if (hasUnsavedChanges()) {
    // Show nice confirmation dialog
    openModal('confirm-new-modal');
    
    // Setup button handlers
    const btnSave = $('#btn-confirm-save');
    const btnDiscard = $('#btn-confirm-discard');
    
    if (btnSave) {
      btnSave.onclick = async () => {
        closeModal('confirm-new-modal');
        await saveProject();
        executeNewProject();
      };
    }
    
    if (btnDiscard) {
      btnDiscard.onclick = () => {
        closeModal('confirm-new-modal');
        executeNewProject();
      };
    }
  } else {
    // No changes, just create new
    executeNewProject();
  }
}
