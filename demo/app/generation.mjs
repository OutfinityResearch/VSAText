/**
 * SCRIPTA Demo - Story Generation
 * 
 * Main entry point for story generation.
 * Orchestrates different generation strategies.
 */

import { $, closeModal, showNotification } from './utils.mjs';
import { state } from './state.mjs';
import { TEMPLATES } from './generation/generation-config.mjs';
import { generateRandom } from './generation/generation-random.mjs';
import { generateLLM } from './generation/generation-llm.mjs';
import { generateAdvanced } from './generation/generation-advanced.mjs';
import { updateGenerateButton, showImproveModal, applyImprovements } from './generation/generation-improve.mjs';
import { showProjectNameDialog, saveProject, markDirty } from './persistence.mjs';

// Track generation state
let isGeneratingSpecs = false;

// ============================================
// TEMPLATE APPLICATION
// ============================================

window.applyTemplate = (templateKey) => {
  const t = TEMPLATES[templateKey];
  if (!t) return;
  
  $('#gen-genre').value = t.genre;
  $('#gen-length').value = t.length;
  $('#gen-chars').value = t.chars;
  $('#gen-tone').value = t.tone;
  $('#gen-complexity').value = t.complexity;
  $('#gen-rules').value = t.rules;
};

// ============================================
// LLM SETTINGS (Create Specs modal)
// ============================================

let llmModelsLoaded = false;
let llmModelsLoadPromise = null;

function getSelectedGenStrategy() {
  const strategyRadio = document.querySelector('input[name="gen-strategy"]:checked');
  return strategyRadio ? strategyRadio.value : 'random';
}

async function loadLLMModelsForSpecs() {
  if (llmModelsLoaded) return;
  if (llmModelsLoadPromise) return llmModelsLoadPromise;

  llmModelsLoadPromise = (async () => {
    const modelSelect = $('#gen-llm-model');
    const hintEl = $('#gen-llm-model-hint');
    if (!modelSelect) return;

    modelSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Default (auto)</option>';
    if (hintEl) hintEl.textContent = 'Loading models from server...';

    try {
      const response = await fetch('/v1/models');
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (!data.llmAvailable) {
        if (hintEl) hintEl.textContent = 'LLM not available on server.';
        return;
      }

      let firstDeepModelValue = null;

      if (data.models?.deep?.length) {
        const deepGroup = document.createElement('optgroup');
        deepGroup.label = 'Deep (Creative)';
        data.models.deep.forEach((model, idx) => {
          const option = document.createElement('option');
          option.value = model.qualifiedName || model.name;
          option.textContent = `${model.name} (${model.provider})`;
          deepGroup.appendChild(option);
          if (idx === 0) firstDeepModelValue = option.value;
        });
        modelSelect.appendChild(deepGroup);
      }

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

      if (firstDeepModelValue) modelSelect.value = firstDeepModelValue;
      llmModelsLoaded = true;
      if (hintEl) hintEl.textContent = 'Models loaded.';
      modelSelect.disabled = false;
    } catch (err) {
      if (hintEl) hintEl.textContent = `Could not load models: ${err.message}`;
    }
  })();

  return llmModelsLoadPromise;
}

function updateGenerateModalStrategyPanels() {
  const strategy = getSelectedGenStrategy();
  const llmSettings = $('#gen-llm-settings');

  if (llmSettings) {
    llmSettings.style.display = strategy === 'llm' ? 'block' : 'none';
  }

  if (strategy === 'llm') {
    loadLLMModelsForSpecs();
  }
}

function initGenerateModalLLMSettings() {
  if (!document.getElementById('generate-modal')) return;

  document.querySelectorAll('input[name="gen-strategy"]').forEach(radio => {
    radio.addEventListener('change', updateGenerateModalStrategyPanels);
  });

  updateGenerateModalStrategyPanels();
}

initGenerateModalLLMSettings();

// ============================================
// UI BLOCKING DURING GENERATION
// ============================================

/**
 * Show loading state in generate modal
 */
function showGeneratingState(strategyName) {
  isGeneratingSpecs = true;
  
  // Disable sidebar button
  const sidebarBtn = $('#btn-generate');
  if (sidebarBtn) {
    sidebarBtn.disabled = true;
    sidebarBtn.classList.add('loading');
  }
  
  // Disable modal Generate button and show loading
  const modalBtn = $('#generate-modal .modal-footer .btn.primary');
  if (modalBtn) {
    modalBtn.disabled = true;
    modalBtn.dataset.originalText = modalBtn.textContent;
    modalBtn.textContent = `Generating (${strategyName})...`;
    modalBtn.classList.add('loading');
  }
  
  // Disable all strategy radio buttons
  document.querySelectorAll('input[name="gen-strategy"]').forEach(r => {
    r.disabled = true;
  });
  
  // Disable template buttons
  document.querySelectorAll('#generate-modal-body .btn.small').forEach(b => {
    b.disabled = true;
  });
  
  // Add loading overlay to modal body
  const modalBody = $('#generate-modal-body');
  if (modalBody && !modalBody.querySelector('.generation-loading-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'generation-loading-overlay';
    overlay.innerHTML = `
      <div class="generation-loading-content">
        <div class="nl-spinner"></div>
        <div class="generation-loading-text">Generating specs with ${strategyName}...</div>
        <div class="generation-loading-hint">This may take a moment</div>
      </div>
    `;
    modalBody.appendChild(overlay);
  }
}

/**
 * Hide loading state
 */
function hideGeneratingState() {
  isGeneratingSpecs = false;
  
  // Re-enable sidebar button
  const sidebarBtn = $('#btn-generate');
  if (sidebarBtn) {
    sidebarBtn.disabled = false;
    sidebarBtn.classList.remove('loading');
  }
  
  // Re-enable modal Generate button
  const modalBtn = $('#generate-modal .modal-footer .btn.primary');
  if (modalBtn) {
    modalBtn.disabled = false;
    if (modalBtn.dataset.originalText) {
      modalBtn.textContent = modalBtn.dataset.originalText;
    }
    modalBtn.classList.remove('loading');
  }
  
  // Re-enable strategy radio buttons
  document.querySelectorAll('input[name="gen-strategy"]').forEach(r => {
    r.disabled = false;
  });
  
  // Re-enable template buttons
  document.querySelectorAll('#generate-modal-body .btn.small').forEach(b => {
    b.disabled = false;
  });
  
  // Remove loading overlay
  const overlay = document.querySelector('.generation-loading-overlay');
  if (overlay) overlay.remove();
}

// ============================================
// MAIN GENERATION DISPATCHER
// ============================================

window.executeGenerate = async () => {
  // Prevent double execution
  if (isGeneratingSpecs) {
    showNotification('Generation already in progress', 'info');
    return;
  }
  
  // If no project ID, ask for project name first
  if (!state.project.id) {
    closeModal('generate-modal');
    const projectName = await showProjectNameDialog('Create Specs - Enter Project Name');
    if (!projectName) {
      return; // User cancelled
    }
    
    state.project.id = projectName;
    state.project.name = projectName;
    $('#project-name').value = projectName;
  }
  
	  const options = {
	    genre: $('#gen-genre').value,
	    length: $('#gen-length').value,
	    chars: $('#gen-chars').value,
	    tone: $('#gen-tone').value,
	    complexity: $('#gen-complexity').value,
	    rules: $('#gen-rules').value
	  };
  
	  // Get selected strategy
	  const strategy = getSelectedGenStrategy();

	  // Add LLM settings if needed
	  if (strategy === 'llm') {
	    options.model = $('#gen-llm-model')?.value || undefined;
	    options.promptKey = $('#gen-llm-prompt')?.value || 'strict_project_json';
	    options.customPrompt = $('#gen-llm-custom-prompt')?.value?.trim() || undefined;
	  }
  
  // Strategy display names
  const strategyNames = {
    random: 'Random',
    llm: 'LLM',
    advanced: 'Advanced',
    wizard: 'Wizard'
  };
  
  try {
    switch (strategy) {
      case 'llm':
        showGeneratingState(strategyNames.llm);
        await generateLLM(options);
        hideGeneratingState();
        closeModal('generate-modal');
        showNotification('Specs generated with LLM', 'success');
        break;
        
      case 'advanced':
        showGeneratingState(strategyNames.advanced);
        await generateAdvanced(options);
        hideGeneratingState();
        closeModal('generate-modal');
        showNotification('Specs generated with Advanced optimization', 'success');
        break;
      
      case 'wizard':
        // Open wizard modal popup
        closeModal('generate-modal');
        if (typeof window.openWizard === 'function') {
          window.openWizard();
        } else {
          showNotification('Wizard not available', 'error');
        }
        break;
        
      case 'random':
      default:
        closeModal('generate-modal');
        generateRandom(options);
        showNotification('Specs generated', 'success');
        break;
    }
    
    // Mark as dirty and trigger autosave
    markDirty();
    saveProject(true); // silent save
    
  } catch (err) {
    console.error('Generation error:', err);
    hideGeneratingState();
    closeModal('generate-modal');
    showNotification('Generation failed: ' + err.message, 'error');
  }
};

// ============================================
// RE-EXPORTS
// ============================================

// Export for use by other modules
export { generateRandom as generateStory } from './generation/generation-random.mjs';
export { updateGenerateButton } from './generation/generation-improve.mjs';

// Re-export strategies for direct use
export { generateRandom, generateLLM, generateAdvanced };

// Re-export config for external access
export { TEMPLATES, GENRE_CONFIG, NARRATIVE_ARCS } from './generation/generation-config.mjs';
