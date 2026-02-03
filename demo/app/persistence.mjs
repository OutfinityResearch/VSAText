/**
 * SCRIPTA Demo - Persistence
 * 
 * Save/Load projects to/from server.
 */

import { state, loadProjectState, resetProject } from './state.mjs';
import { $, openModal, closeModal } from './utils.mjs';
import { renderTree } from './tree.mjs';
import { renderEntityGrid } from './entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from './views.mjs';
import { evaluateMetrics, renderEmptyMetrics } from './metrics.mjs';
import { generateCNL } from './cnl.mjs';

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
    
    alert(`Project saved! ID: ${result.id}`);
  } catch (err) {
    alert('Error saving project: ' + err.message);
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
    evaluateMetrics();
    
    closeModal('load-modal');
  } catch (err) {
    alert('Error loading project: ' + err.message);
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
  } catch (err) {
    alert('Error deleting project: ' + err.message);
  }
};

export function newProject() {
  if (!confirm('Create new project? All unsaved changes will be lost.')) return;
  resetProject();
  $('#project-name').value = state.project.name;
  renderTree();
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
}
