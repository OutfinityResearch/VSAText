/**
 * SCRIPTA Demo - Improve Story Functionality
 * 
 * Handles incremental story improvements based on detected changes.
 */

import { state, createSnapshot, detectChanges } from '../state.mjs';
import { $, openModal, closeModal } from '../utils.mjs';
import { renderTree } from '../tree.mjs';
import { renderEmptyMetrics } from '../metrics.mjs';

/**
 * Update the Generate button based on generation state
 */
export function updateGenerateButton() {
  const btn = $('#btn-generate');
  if (!btn) return;
  
  if (state.generation.hasGenerated) {
    btn.textContent = 'Improve Specs';
    btn.classList.remove('random');
    btn.classList.add('accent');
  } else {
    btn.textContent = 'Create Specs';
    btn.classList.add('random');
    btn.classList.remove('accent');
  }
  
  // Also update NL generate button
  updateNLGenerateButton();
}

/**
 * Show the improve story modal with change plan
 */
export function showImproveModal() {
  const changes = detectChanges();
  
  if (changes.length === 0) {
    openModal('generate-modal');
    return;
  }
  
  const planHTML = buildChangePlanHTML(changes);
  $('#improve-modal-body').innerHTML = planHTML;
  openModal('improve-modal');
}

/**
 * Build HTML for the change plan display
 * @param {Array} changes - Detected changes
 * @returns {string} HTML string
 */
function buildChangePlanHTML(changes) {
  let html = '<div class="improve-plan">';
  html += '<h3 style="margin-bottom: 1rem; color: var(--accent);">Detected Changes</h3>';
  
  for (const category of changes) {
    html += `<div class="change-category">
      <div class="change-category-header">${category.category}</div>
      <ul class="change-list">`;
    
    for (const item of category.items) {
      const actionClass = getActionClass(item.action);
      const actionIcon = getActionIcon(item.action);
      
      html += `<li class="${actionClass}">
        <span class="change-action">${actionIcon}</span>
        <span class="change-name">${item.name}</span>
      </li>`;
    }
    
    html += '</ul></div>';
  }
  
  html += `
    <div class="improve-actions">
      <p style="margin: 1rem 0; color: var(--text-secondary);">
        Based on these changes, regeneration will update affected scenes and dialogues while preserving your modifications.
      </p>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="btn" onclick="closeModal('improve-modal')">Cancel</button>
        <button class="btn" onclick="closeModal('improve-modal'); openModal('generate-modal')">Full Regenerate</button>
        <button class="btn primary" onclick="applyImprovements()">Apply Improvements</button>
      </div>
    </div>
  </div>`;
  
  return html;
}

function getActionClass(action) {
  switch (action) {
    case 'added': return 'change-added';
    case 'removed': return 'change-removed';
    default: return 'change-modified';
  }
}

function getActionIcon(action) {
  switch (action) {
    case 'added': return '+';
    case 'removed': return '-';
    default: return '~';
  }
}

/**
 * Apply incremental improvements based on detected changes
 */
export function applyImprovements() {
  const changes = detectChanges();
  
  for (const category of changes) {
    switch (category.category) {
      case 'Characters':
        updateScenesForCharacterChanges(category.items);
        break;
      case 'Locations':
        updateScenesForLocationChanges(category.items);
        break;
      case 'Dialogues':
        updateDialoguesForChanges(category.items);
        break;
      case 'Plot Elements':
        updateScenesForObjectChanges(category.items);
        break;
    }
  }
  
  // Update snapshot
  createSnapshot();
  
  // Refresh views
  renderTree();
  renderEmptyMetrics();
  
  closeModal('improve-modal');
}

/**
 * Update scenes when characters change
 */
function updateScenesForCharacterChanges(items) {
  if (!state.project.structure?.children) return;
  
  for (const change of items) {
    if (change.action === 'removed') {
      removeReferencesFromScenes('character-ref', change.item.id);
    }
  }
}

/**
 * Update scenes when locations change
 */
function updateScenesForLocationChanges(items) {
  if (!state.project.structure?.children) return;
  
  for (const change of items) {
    if (change.action === 'removed') {
      removeReferencesFromScenes('location-ref', change.item.id);
    }
  }
}

/**
 * Update scenes when objects change
 */
function updateScenesForObjectChanges(items) {
  if (!state.project.structure?.children) return;
  
  for (const change of items) {
    if (change.action === 'removed') {
      removeReferencesFromScenes('object-ref', change.item.id);
    }
  }
}

/**
 * Update dialogues when they change
 */
function updateDialoguesForChanges(items) {
  if (!state.project.structure?.children) return;
  
  for (const change of items) {
    if (change.action === 'removed') {
      removeReferencesFromScenes('dialogue-ref', change.item.id);
    }
  }
}

/**
 * Remove references of a specific type and ID from all scenes
 */
function removeReferencesFromScenes(refType, refId) {
  for (const chapter of state.project.structure.children) {
    for (const scene of chapter.children || []) {
      scene.children = (scene.children || []).filter(child => 
        child.type !== refType || child.refId !== refId
      );
    }
  }
}

// Register global functions for HTML onclick handlers
window.showImproveModal = showImproveModal;
window.applyImprovements = applyImprovements;

/**
 * Update the NL generate button based on generation state
 */
function updateNLGenerateButton() {
  const btn = $('#btn-nl-generate');
  if (!btn) return;
  
  if (state.generation.hasGeneratedNL) {
    btn.textContent = 'Improve Story';
    btn.classList.remove('random');
    btn.classList.add('accent');
  } else {
    btn.textContent = 'Create Story';
    btn.classList.add('random');
    btn.classList.remove('accent');
  }
}

export default {
  updateGenerateButton,
  showImproveModal,
  applyImprovements
};
