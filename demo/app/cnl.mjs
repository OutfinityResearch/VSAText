/**
 * SCRIPTA Demo - CNL Generation
 * 
 * UI wrapper for CNL generation using SDK serializer.
 * Handles edit mode, import/export, and DOM updates.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';
import { refreshAllViews, loadCNLIntoState } from './generation/generation-utils.mjs';
import { updateGenerateButton } from './generation/generation-improve.mjs';

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
    const editedText = cnlEditor.value;
    loadCNLIntoState(editedText).then(() => {
      cnlOutput.textContent = editedText;
      cnlEditor.style.display = 'none';
      cnlOutput.style.display = 'block';
      editBtn.textContent = 'Edit';
      editBtn.classList.remove('btn-edit-active');

      refreshAllViews();
      updateGenerateButton();
      window.showNotification?.('CNL parsed and applied to project state', 'success');
    }).catch((err) => {
      isEditMode = true;
      cnlEditor.style.display = 'block';
      cnlOutput.style.display = 'none';
      editBtn.textContent = 'View';
      editBtn.classList.add('btn-edit-active');
      cnlEditor.focus();
      window.showNotification?.(`CNL parse error: ${err.message}`, 'error');
    });
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

      await loadCNLIntoState(text);

      // Update CNL output display
      $('#cnl-output').textContent = text;
      if (isEditMode) {
        $('#cnl-editor').value = text;
      }

      refreshAllViews();
      updateGenerateButton();
      window.showNotification?.(`Imported and parsed: ${file.name}`, 'success');
    } catch (err) {
      window.showNotification?.('Error importing file: ' + err.message, 'error');
    }
  };
  
  input.click();
}
