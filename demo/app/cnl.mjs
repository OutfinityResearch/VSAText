/**
 * SCRIPTA Demo - CNL Generation
 * 
 * UI wrapper for CNL generation using SDK serializer.
 * Handles edit mode, import/export, and DOM updates.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';

// Track edit mode state
let isEditMode = false;

/**
 * Toggle between view and edit mode for CNL
 */
export function toggleEditMode() {
  const cnlOutput = $('#cnl-output');
  const cnlEditor = $('#cnl-editor');
  const editBtn = $('#btn-edit-cnl');
  
  if (!cnlOutput || !cnlEditor || !editBtn) return;
  
  isEditMode = !isEditMode;
  
  if (isEditMode) {
    // Switch to edit mode
    cnlEditor.value = cnlOutput.textContent;
    cnlOutput.style.display = 'none';
    cnlEditor.style.display = 'block';
    editBtn.textContent = 'View';
    editBtn.classList.add('btn-edit-active');
    cnlEditor.focus();
  } else {
    // Switch back to view mode
    cnlOutput.textContent = cnlEditor.value;
    cnlEditor.style.display = 'none';
    cnlOutput.style.display = 'block';
    editBtn.textContent = 'Edit';
    editBtn.classList.remove('btn-edit-active');
    
    // TODO: Parse edited CNL and update state
    window.showNotification?.('CNL updated (parsing not yet implemented)', 'info');
  }
}

/**
 * Get current edit mode state
 */
export function getEditMode() {
  return isEditMode;
}

/**
 * Generate CNL from current project state and update DOM
 * 
 * This is the main entry point for the demo. It:
 * 1. Calls SDK serializer with current project
 * 2. Updates the DOM with generated CNL
 * 3. Returns the CNL string for other uses
 * 
 * @returns {string} Generated CNL
 */
export function generateCNL() {
  // Use SDK serializer
  const cnl = serializeToCNL(state.project);
  
  // Update DOM
  const cnlOutput = $('#cnl-output');
  if (cnlOutput) {
    cnlOutput.textContent = cnl;
  }
  
  return cnl;
}

/**
 * Export CNL to file
 */
export function exportCNL() {
  const cnl = generateCNL();
  const blob = new Blob([cnl], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (state.project.name || 'story').replace(/[^a-z0-9]/gi, '_') + '.cnl';
  a.click();
}

/**
 * Import CNL from file
 */
export function importCNL() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.cnl,.txt';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      
      // Update CNL output display
      $('#cnl-output').textContent = text;
      
      // Show success notification
      window.showNotification?.(`Imported: ${file.name}`, 'success');
      
      // TODO: Parse CNL and update state
      // This would require a CNL parser to convert text back to project state
      
    } catch (err) {
      window.showNotification?.('Error importing file: ' + err.message, 'error');
    }
  };
  
  input.click();
}
