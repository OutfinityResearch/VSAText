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
import './generation/generation-improve.mjs';
import {
  isGenerationInProgress,
  startGenerationSession,
  finishGenerationSession,
  initGenerationModalActions
} from './generation/generation-session.mjs';

function isAbortError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const msg = String(err.message || '').toLowerCase();
  return msg.includes('abort') || msg.includes('cancel');
}

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
initGenerationModalActions();

// ============================================
// MAIN GENERATION DISPATCHER
// ============================================

window.executeGenerate = async () => {
  // Prevent double execution
  if (isGenerationInProgress()) {
    showNotification('Generation already in progress', 'info');
    return;
  }
  
  // If no project ID, ask for project name first
  if (!state.project.id) {
    const { showProjectNameDialog } = await import('./persistence.mjs');
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

  let session = null;
  let shouldPersist = false;
  let markDirty = null;
  let saveProject = null;

  try {
    switch (strategy) {
      case 'llm':
        session = startGenerationSession('llm', strategyNames.llm);
        closeModal('generate-modal');
        session.onPhase({ key: 'connect', label: 'Connecting to LLM API...' });
        await generateLLM(options, {
          signal: session.controller.signal,
          isCancelled: () => session.isCancelled(),
          onPhase: (phase) => session.onPhase(phase)
        });
        finishGenerationSession(session, 'success');
        shouldPersist = true;
        showNotification('Specs generated with LLM', 'success');
        break;
        
      case 'advanced':
        session = startGenerationSession('advanced', strategyNames.advanced);
        session.onPhase({ key: 'optimize', label: 'Running SDK optimizer...' });
        await generateAdvanced(options, {
          signal: session.controller.signal,
          isCancelled: () => session.isCancelled(),
          onPhase: (phase) => session.onPhase(phase)
        });
        finishGenerationSession(session, 'success');
        closeModal('generate-modal');
        shouldPersist = true;
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
        shouldPersist = true;
        showNotification('Specs generated', 'success');
        break;
    }
    
    if (shouldPersist) {
      if (!markDirty || !saveProject) {
        ({ markDirty, saveProject } = await import('./persistence.mjs'));
      }
      // Mark as dirty and trigger autosave
      markDirty();
      saveProject(true); // silent save
    }
    
  } catch (err) {
    if (isAbortError(err)) {
      if (session && !session.finished) {
        finishGenerationSession(session, 'cancelled', false);
      }
      return;
    }

    console.error('Generation error:', err);
    if (session && !session.finished) {
      finishGenerationSession(session, 'failed', false);
    }
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
