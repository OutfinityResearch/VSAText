/**
 * SCRIPTA Demo - NL Story Version Management
 * 
 * Handles loading, saving, and managing story versions.
 * Each version is stored with language and model metadata.
 */

import { state, setGeneratedStory, getGeneratedStory } from './state.mjs';
import { $, showNotification } from './utils.mjs';
import { parseMarkdown } from '../../src/utils/markdown.mjs';

const DEFAULT_STORY_MODEL = 'write';

function isPreferredModel(value, label = '') {
  const text = `${value || ''} ${label || ''}`.toLowerCase();
  return text === 'write' || text.includes('write (auto');
}

// Current loaded version info
let currentVersionFilename = null;
let currentVersionLanguage = null;
let currentVersionModel = null;
let cachedVersions = [];

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
  cachedVersions = [];
}

function getVersionChipLabel(version) {
  return version?.version ? `v${version.version}` : 'Version';
}

function renderVersionChips(selectedFilename = '') {
  const chipsContainer = $('#nl-version-chips');
  if (!chipsContainer) return;

  if (!cachedVersions.length) {
    chipsContainer.innerHTML = `
      <div class="nl-version-empty-state">
        <span class="nl-version-empty-text">No saved versions yet</span>
      </div>
    `;
    return;
  }

  const items = [
    `<button class="nl-version-chip nl-version-chip-new ${selectedFilename ? '' : 'active'}" type="button" data-version-filename="">+ New</button>`,
    ...cachedVersions.map(version => `
      <button
        class="nl-version-chip ${selectedFilename === version.filename ? 'active' : ''}"
        type="button"
        data-version-filename="${version.filename}"
        title="Version ${version.version || ''} - ${version.language || 'en'} - ${version.model || DEFAULT_STORY_MODEL}">
        ${getVersionChipLabel(version)}
      </button>
    `)
  ];

  chipsContainer.innerHTML = items.join('');
}

/**
 * Check if we can improve (same language+model as current version)
 * @param {boolean} hasGeneratedNL - Whether NL has been generated
 */
export function canImprove(hasGeneratedNL) {
  if (!hasGeneratedNL && !currentVersionFilename) return false;
  
  const selectedLang = $('#nl-language')?.value || 'en';
  const selectedModel = $('#nl-model')?.value || DEFAULT_STORY_MODEL;
  
  // If we have a loaded version, check if settings match
  if (currentVersionLanguage && currentVersionModel) {
    return selectedLang === currentVersionLanguage && 
           (selectedModel || DEFAULT_STORY_MODEL) === currentVersionModel;
  }

  // Fallback: if story exists but version metadata is unavailable,
  // allow improve instead of forcing "Create Story".
  return Boolean(hasGeneratedNL);
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
  cachedVersions = [];
  
  // Disable delete button
  if (deleteBtn) deleteBtn.disabled = true;
  renderVersionChips('');
  
  // Can't load versions without project ID
  if (!state.project.id) return;
  
  try {
    const response = await fetch(`/v1/projects/${encodeURIComponent(state.project.id)}/versions`);
    if (!response.ok) return;
    
    const data = await response.json();
    const versions = data.versions || [];
    cachedVersions = versions;
    
    if (versions.length === 0) {
      renderVersionChips('');
      return;
    }
    
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

    renderVersionChips(currentVersionFilename || '');
    
  } catch (err) {
    console.error('Failed to load story versions:', err);
    renderVersionChips('');
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
  const {
    updateNLGenerateButton,
    displayNLContent,
    enablePreviewButton,
    resetNLContent,
    setHasGeneratedNL,
    markCurrentStructureAsGenerationBaseline
  } = callbacks;
  const filename = typeof e === 'string' ? e : e?.target?.value || '';
  const deleteBtn = $('#btn-nl-delete-version');
  const versionSelect = $('#nl-version-select');
  if (versionSelect) versionSelect.value = filename;
  
  if (!filename) {
    // New generation selected - reset version tracking
    currentVersionFilename = null;
    currentVersionLanguage = null;
    currentVersionModel = null;
    setHasGeneratedNL(false);
    if (deleteBtn) deleteBtn.disabled = true;
    resetNLContent();
    updateNLGenerateButton();
    renderVersionChips('');
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
    currentVersionModel = data.model || DEFAULT_STORY_MODEL;
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
    markCurrentStructureAsGenerationBaseline?.();
    
    if (deleteBtn) deleteBtn.disabled = false;
    renderVersionChips(filename);
    
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
    renderVersionChips('');
    
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
    renderVersionChips(versionInfo.filename);
    
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
 * Load available models from server — tiers first, then writing-relevant models
 */
export async function loadAvailableModels() {
  try {
    const response = await fetch('/v1/models');
    if (!response.ok) return;

    const data = await response.json();
    const modelSelect = $('#nl-model');
    if (!modelSelect) return;

    modelSelect.innerHTML = '';

    let firstValue = null;

    // Tiers (recommended auto-select options)
    if (data.tiers?.length) {
      const tierGroup = document.createElement('optgroup');
      tierGroup.label = 'Recommended';
      data.tiers.forEach((tier, idx) => {
        const option = document.createElement('option');
        option.value = tier.name;
        option.textContent = tier.displayName || tier.name;
        tierGroup.appendChild(option);
        if (idx === 0) firstValue = option.value;
      });
      modelSelect.appendChild(tierGroup);
    }

    // Individual models filtered by writing-relevant tags
    if (data.models?.length) {
      const modelsGroup = document.createElement('optgroup');
      modelsGroup.label = 'Models';
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        const freeLabel = model.isFree ? ' (Free)' : '';
        option.textContent = `${model.displayName || model.name}${freeLabel}`;
        modelsGroup.appendChild(option);
        if (!firstValue) firstValue = option.value;
      });
      modelSelect.appendChild(modelsGroup);
    }

    // Auto-select: prefer 'write' tier, then first available option
    const preferredOption = Array.from(modelSelect.options).find(option =>
      option.value === DEFAULT_STORY_MODEL || isPreferredModel(option.value, option.textContent)
    );
    if (preferredOption) {
      modelSelect.value = preferredOption.value;
    } else if (firstValue) {
      modelSelect.value = firstValue;
    }

  } catch (err) {
    console.log('[NL Generation] Could not load models:', err.message);
  }
}
