/**
 * SCRIPTA Demo - NL Story Version Management
 * 
 * Handles loading, saving, and managing story versions.
 * Each version is stored with language and model metadata.
 */

import { state, setGeneratedStory, getGeneratedStory } from './state.mjs';
import { $, showNotification } from './utils.mjs';
import { parseMarkdown } from '../../src/utils/markdown.mjs';

// Current loaded version info
let currentVersionFilename = null;
let currentVersionLanguage = null;
let currentVersionModel = null;

// Lazy import for persistence to avoid circular dependency
let persistenceModule = null;
async function getPersistence() {
  if (!persistenceModule) {
    persistenceModule = await import('./persistence.mjs');
  }
  return persistenceModule;
}

/**
 * Get current version info
 */
export function getCurrentVersionInfo() {
  return {
    filename: currentVersionFilename,
    language: currentVersionLanguage,
    model: currentVersionModel
  };
}

/**
 * Set current version info
 */
export function setCurrentVersionInfo(filename, language, model) {
  currentVersionFilename = filename;
  currentVersionLanguage = language;
  currentVersionModel = model;
}

/**
 * Reset version state
 */
export function resetVersionState() {
  currentVersionFilename = null;
  currentVersionLanguage = null;
  currentVersionModel = null;
}

/**
 * Check if we can improve (same language+model as current version)
 * @param {boolean} hasGeneratedNL - Whether NL has been generated
 */
export function canImprove(hasGeneratedNL) {
  if (!hasGeneratedNL && !currentVersionFilename) return false;
  
  const selectedLang = $('#nl-language')?.value || 'en';
  const selectedModel = $('#nl-model')?.value || 'default';
  
  // If we have a loaded version, check if settings match
  if (currentVersionLanguage && currentVersionModel) {
    return selectedLang === currentVersionLanguage && 
           (selectedModel || 'default') === currentVersionModel;
  }
  
  return false;
}

/**
 * Load story versions for current project
 */
export async function loadStoryVersions() {
  const versionSelect = $('#nl-version-select');
  const deleteBtn = $('#btn-nl-delete-version');
  
  if (!versionSelect) return;
  
  // Clear existing options
  versionSelect.innerHTML = '<option value="">-- New Generation --</option>';
  currentVersionFilename = null;
  
  // Disable delete button
  if (deleteBtn) deleteBtn.disabled = true;
  
  // Can't load versions without project ID
  if (!state.project.id) return;
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(state.project.id)}/versions`);
    if (!response.ok) return;
    
    const data = await response.json();
    const versions = data.versions || [];
    
    if (versions.length === 0) return;
    
    // Language names for display
    const langNames = {
      en: 'English', fr: 'French', es: 'Spanish', pt: 'Portuguese',
      it: 'Italian', de: 'German', ro: 'Romanian'
    };
    
    // Add options for each version
    versions.forEach(v => {
      const option = document.createElement('option');
      option.value = v.filename;
      option.textContent = `v${v.version} - ${langNames[v.language] || v.language} - ${v.model}`;
      versionSelect.appendChild(option);
    });
    
  } catch (err) {
    console.error('Failed to load story versions:', err);
  }
}

/**
 * Handle version selection change
 * @param {Function} updateNLGenerateButton - Callback to update generate button
 * @param {Function} displayNLContent - Callback to display content
 * @param {Function} enablePreviewButton - Callback to enable preview
 * @param {Function} resetNLContent - Callback to reset content
 */
export async function onVersionSelect(e, callbacks) {
  const { updateNLGenerateButton, displayNLContent, enablePreviewButton, resetNLContent, setHasGeneratedNL } = callbacks;
  
  const filename = e.target.value;
  const deleteBtn = $('#btn-nl-delete-version');
  
  if (!filename) {
    // New generation selected - reset version tracking
    currentVersionFilename = null;
    currentVersionLanguage = null;
    currentVersionModel = null;
    setHasGeneratedNL(false);
    if (deleteBtn) deleteBtn.disabled = true;
    resetNLContent();
    updateNLGenerateButton();
    return;
  }
  
  if (!state.project.id) return;
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(state.project.id)}/versions/${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error('Failed to load version');
    
    const data = await response.json();
    
    // Display the story
    setGeneratedStory(data.content);
    displayNLContent(data.content);
    
    // Track current version info
    currentVersionFilename = filename;
    currentVersionLanguage = data.language || 'en';
    currentVersionModel = data.model || 'default';
    setHasGeneratedNL(true);
    
    // Update UI to match version's language and model
    const langSelect = $('#nl-language');
    const modelSelect = $('#nl-model');
    if (langSelect && currentVersionLanguage) {
      langSelect.value = currentVersionLanguage;
    }
    if (modelSelect && currentVersionModel) {
      // Try to set the model, might not exist in options
      const modelOption = Array.from(modelSelect.options).find(
        opt => opt.value === currentVersionModel || opt.value === ''
      );
      if (modelOption) {
        modelSelect.value = currentVersionModel;
      }
    }
    
    updateNLGenerateButton();
    enablePreviewButton();
    
    if (deleteBtn) deleteBtn.disabled = false;
    
  } catch (err) {
    showNotification('Error loading version: ' + err.message, 'error');
  }
}

/**
 * Delete current story version
 * @param {Function} resetNLContent - Callback to reset content
 */
export async function deleteCurrentVersion(resetNLContent) {
  if (!currentVersionFilename || !state.project.id) return;
  
  if (!confirm('Delete this story version permanently?')) return;
  
  try {
    const response = await fetch(
      `/v1/projects/${encodeURIComponent(state.project.id)}/versions/${encodeURIComponent(currentVersionFilename)}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) throw new Error('Failed to delete version');
    
    showNotification('Version deleted', 'success');
    
    // Reload versions list
    await loadStoryVersions();
    
    // Reset content
    resetNLContent();
    
  } catch (err) {
    showNotification('Error deleting version: ' + err.message, 'error');
  }
}

/**
 * Save generated story as a new version
 */
export async function saveStoryVersion(content, language, model) {
  if (!state.project.id) {
    // Need to create project first
    const persistence = await getPersistence();
    const projectName = await persistence.showProjectNameDialog('Save Story - Enter Project Name');
    if (!projectName) return null;
    
    state.project.id = projectName;
    state.project.name = projectName;
    $('#project-name').value = projectName;
    
    // Save the project first
    await persistence.saveProject(true);
  }
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(state.project.id)}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, language, model })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to save version');
    }
    
    const versionInfo = await response.json();
    
    // Reload versions list
    await loadStoryVersions();
    
    // Select the new version
    const versionSelect = $('#nl-version-select');
    if (versionSelect) {
      versionSelect.value = versionInfo.filename;
      currentVersionFilename = versionInfo.filename;
      const deleteBtn = $('#btn-nl-delete-version');
      if (deleteBtn) deleteBtn.disabled = false;
    }
    
    // Update current version tracking
    currentVersionLanguage = language;
    currentVersionModel = model;
    
    return versionInfo;
    
  } catch (err) {
    console.error('Failed to save story version:', err);
    showNotification('Error saving story: ' + err.message, 'error');
    return null;
  }
}

/**
 * Load available models from server and auto-select first deep model
 */
export async function loadAvailableModels() {
  try {
    const response = await fetch('/v1/models');
    if (!response.ok) return;
    
    const data = await response.json();
    const modelSelect = $('#nl-model');
    if (!modelSelect) return;
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    let firstDeepModelValue = null;
    
    // Add deep models first (preferred for creative writing)
    if (data.models?.deep?.length) {
      const deepGroup = document.createElement('optgroup');
      deepGroup.label = 'Deep (Creative)';
      data.models.deep.forEach((model, idx) => {
        const option = document.createElement('option');
        option.value = model.qualifiedName || model.name;
        option.textContent = `${model.name} (${model.provider})`;
        deepGroup.appendChild(option);
        // Remember first deep model
        if (idx === 0) {
          firstDeepModelValue = option.value;
        }
      });
      modelSelect.appendChild(deepGroup);
    }
    
    // Add fast models
    if (data.models?.fast?.length) {
      const fastGroup = document.createElement('optgroup');
      fastGroup.label = 'Fast';
      data.models.fast.forEach(model => {
        const option = document.createElement('option');
        option.value = model.qualifiedName || model.name;
        option.textContent = `${model.name} (${model.provider})`;
        fastGroup.appendChild(option);
      });
      modelSelect.appendChild(fastGroup);
    }
    
    // Auto-select first deep model (best for creative writing)
    if (firstDeepModelValue) {
      modelSelect.value = firstDeepModelValue;
    }
    
  } catch (err) {
    console.log('[NL Generation] Could not load models:', err.message);
  }
}
