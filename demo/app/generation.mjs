/**
 * SCRIPTA Demo - Story Generation
 * 
 * Main entry point for story generation.
 * Orchestrates different generation strategies.
 */

import { $, closeModal, showNotification } from './utils.mjs';
import { state } from './state.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
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

let selectedQuickTemplateKey = null;

function isAbortError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const msg = String(err.message || '').toLowerCase();
  return msg.includes('abort') || msg.includes('cancel');
}

function updateQuickTemplateSelectionUI() {
  document.querySelectorAll('[data-template-key]').forEach(btn => {
    const isSelected = btn.dataset.templateKey === selectedQuickTemplateKey;
    btn.classList.toggle('is-selected', isSelected);
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
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
  selectedQuickTemplateKey = templateKey;
  updateQuickTemplateSelectionUI();
};

function getMultiSelectValues(id) {
  const el = $(id);
  if (!el) return [];
  return Array.from(el.selectedOptions || []).map(opt => opt.value);
}

function getSingleSelectValueAsArray(id) {
  const value = $(id)?.value || '';
  return value ? [value] : [];
}

function populateWorldDropdownOptions() {
  const geographySelect = $('#gen-geography');
  if (geographySelect) {
    const previous = geographySelect.value;
    const preferredGeographyKeys = [
      'city',
      'village',
      'forest',
      'mountain',
      'ocean',
      'desert',
      'river',
      'island',
      'castle',
      'ruins'
    ];
    const optionsHtml = Object.entries(VOCAB.LOCATION_GEOGRAPHY || {})
      .filter(([key]) => preferredGeographyKeys.includes(key))
      .sort(([, a], [, b]) => String(a?.label || '').localeCompare(String(b?.label || '')))
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
      .join('');
    geographySelect.innerHTML = optionsHtml;
    if (previous && geographySelect.querySelector(`option[value="${previous}"]`)) {
      geographySelect.value = previous;
    }
  }

  const objectTypeSelect = $('#gen-object-types');
  if (objectTypeSelect) {
    const previous = objectTypeSelect.value;
    // Keep a focused list of 10 common object types for a cleaner, friendlier UI.
    const preferredObjectTypeKeys = [
      'artifact',
      'weapon',
      'key',
      'document',
      'secret',
      'evidence',
      'identity',
      'promise',
      'deadline',
      'relic'
    ];
    const filteredObjectTypes = Object.entries(VOCAB.OBJECT_TYPES || {})
      .filter(([key]) => preferredObjectTypeKeys.includes(key));
    const optionsHtml = filteredObjectTypes
      .sort(([, a], [, b]) => String(a?.label || '').localeCompare(String(b?.label || '')))
      .map(([key, item]) => `<option value="${key}">${item.icon ? `${item.icon} ` : ''}${item.label}</option>`)
      .join('');
    objectTypeSelect.innerHTML = optionsHtml;
    if (previous && objectTypeSelect.querySelector(`option[value="${previous}"]`)) {
      objectTypeSelect.value = previous;
    }
  }
}

function closeMultiDropdowns(except = null) {
  document.querySelectorAll('.multi-dropdown.open').forEach(dropdown => {
    if (dropdown !== except) {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.multi-dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function enhanceMultiSelectDropdown(selectEl) {
  if (!selectEl || selectEl.dataset.enhancedMultiDropdown === 'true') return;

  selectEl.dataset.enhancedMultiDropdown = 'true';
  selectEl.classList.add('multi-dropdown-native');

  const wrapper = document.createElement('div');
  wrapper.className = 'multi-dropdown';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'multi-dropdown-toggle';
  toggle.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'multi-dropdown-panel';

  const options = Array.from(selectEl.options || []);

  const updateToggleLabel = () => {
    const selected = options.filter(opt => opt.selected).map(opt => opt.textContent.trim());
    const fullLabel = selected.length ? selected.join(', ') : 'Select options';
    if (selected.length <= 2) {
      toggle.textContent = fullLabel;
    } else {
      toggle.textContent = `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`;
    }
    toggle.title = fullLabel;
  };

  options.forEach((opt, idx) => {
    const row = document.createElement('label');
    row.className = 'multi-dropdown-option';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(opt.selected);
    checkbox.value = opt.value;
    checkbox.id = `${selectEl.id || selectEl.className.replace(/\s+/g, '_')}_multi_${idx}`;

    checkbox.addEventListener('change', () => {
      opt.selected = checkbox.checked;
      updateToggleLabel();
    });

    const text = document.createElement('span');
    text.textContent = opt.textContent;

    row.appendChild(checkbox);
    row.appendChild(text);
    panel.appendChild(row);
  });

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const willOpen = !wrapper.classList.contains('open');
    closeMultiDropdowns(wrapper);
    wrapper.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(panel);
  selectEl.insertAdjacentElement('afterend', wrapper);
  updateToggleLabel();
}

function initMultiSelectDropdowns() {
  document.querySelectorAll('#generate-modal select[multiple]').forEach(enhanceMultiSelectDropdown);
}

function getRelationshipValues() {
  const values = [];
  const primary = $('#gen-relationships')?.value;
  if (primary) values.push(primary);
  document.querySelectorAll('#gen-relationship-list .gen-relationship-type').forEach(select => {
    if (select.value) values.push(select.value);
  });
  return Array.from(new Set(values));
}

function initRelationshipsUI() {
  const selectEl = document.getElementById('gen-relationships');
  const addBtn = document.getElementById('btn-add-relationship');
  const listEl = document.getElementById('gen-relationship-list');
  if (!selectEl || !addBtn || !listEl) return;

  const buildOptionsHtml = () => Array.from(selectEl.options || [])
    .map(opt => `<option value="${opt.value}">${opt.textContent}</option>`)
    .join('');

  const createRelationshipRow = (selectedValue = '') => {
    const row = document.createElement('div');
    row.className = 'spec-relationship-item';
    row.innerHTML = `
      <button class="spec-secondary-delete" type="button" title="Delete relationship" aria-label="Delete relationship">×</button>
      <select class="form-select gen-relationship-type">${buildOptionsHtml()}</select>
    `;
    const rowSelect = row.querySelector('.gen-relationship-type');
    if (selectedValue && rowSelect.querySelector(`option[value="${selectedValue}"]`)) {
      rowSelect.value = selectedValue;
    }
    const removeBtn = row.querySelector('.spec-secondary-delete');
    removeBtn.onclick = () => {
      row.remove();
    };
    return row;
  };

  addBtn.onclick = () => {
    const row = createRelationshipRow(selectEl.value || 'alliance');
    listEl.appendChild(row);
    const rowSelect = row.querySelector('.gen-relationship-type');
    rowSelect?.focus();
    showNotification('Relationship selector added.', 'success');
  };
}

function createSecondaryCharacterRow(removable = true) {
  const row = document.createElement('div');
  row.className = `spec-secondary-item${removable ? '' : ' no-delete'}`;
  row.innerHTML = `
    ${removable ? '<button class="spec-secondary-delete" type="button" title="Delete character" aria-label="Delete character">×</button>' : ''}
    <div class="spec-secondary-fields">
      <div class="form-group">
        <label class="form-label">Archetype</label>
        <select class="form-select gen-secondary-archetype">
          <option value="ally">Ally</option>
          <option value="mentor">Mentor</option>
          <option value="guardian">Guardian</option>
          <option value="trickster">Trickster</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Traits</label>
        <select class="form-select gen-secondary-traits" multiple size="6">
          <option value="bold">Bold</option>
          <option value="reserved">Reserved</option>
          <option value="witty">Witty</option>
          <option value="fearful">Fearful</option>
          <option value="pragmatic">Pragmatic</option>
          <option value="loyal">Loyal</option>
          <option value="protective">Protective</option>
          <option value="skeptical">Skeptical</option>
          <option value="ambitious">Ambitious</option>
          <option value="idealistic">Idealistic</option>
          <option value="sarcastic">Sarcastic</option>
          <option value="reckless">Reckless</option>
          <option value="patient">Patient</option>
        </select>
      </div>
    </div>
  `;
  if (removable) {
    row.querySelector('.spec-secondary-delete')?.addEventListener('click', () => row.remove());
  }
  enhanceMultiSelectDropdown(row.querySelector('.gen-secondary-traits'));
  return row;
}

function initSecondaryCharactersUI() {
  const listEl = $('#gen-secondary-characters');
  const addBtn = $('#btn-add-secondary-character');
  if (!listEl || !addBtn) return;
  if (listEl.children.length === 0) {
    listEl.appendChild(createSecondaryCharacterRow(false));
  }
  addBtn.onclick = () => {
    listEl.appendChild(createSecondaryCharacterRow());
  };
}

function initQuickTemplateCards() {
  document.querySelectorAll('[data-template-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.applyTemplate(btn.dataset.templateKey);
    });
  });
  updateQuickTemplateSelectionUI();
}

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

      const DEFAULT_MODEL = 'copilot-gpt-4o';
      let defaultModelValue = null;
      let firstDeepModelValue = null;

      const addModelOption = (group, model) => {
        const option = document.createElement('option');
        option.value = model.qualifiedName || model.name;
        const freeLabel = model.free ? ' (Free)' : '';
        option.textContent = `${model.name}${freeLabel}`;
        group.appendChild(option);
        if (model.name === DEFAULT_MODEL) defaultModelValue = option.value;
      };

      if (data.models?.deep?.length) {
        const deepGroup = document.createElement('optgroup');
        deepGroup.label = 'Deep (Creative)';
        data.models.deep.forEach((model, idx) => {
          addModelOption(deepGroup, model);
          if (idx === 0) firstDeepModelValue = model.qualifiedName || model.name;
        });
        modelSelect.appendChild(deepGroup);
      }

      if (data.models?.fast?.length) {
        const fastGroup = document.createElement('optgroup');
        fastGroup.label = 'Fast';
        data.models.fast.forEach(model => addModelOption(fastGroup, model));
        modelSelect.appendChild(fastGroup);
      }

      modelSelect.value = defaultModelValue || firstDeepModelValue || '';
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
initSecondaryCharactersUI();
populateWorldDropdownOptions();
initMultiSelectDropdowns();
initRelationshipsUI();
initQuickTemplateCards();
document.addEventListener('click', (event) => {
  if (!event.target.closest('.multi-dropdown')) {
    closeMultiDropdowns();
  }
});

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
	    rules: $('#gen-rules').value,
      theme: $('#gen-theme')?.value?.trim() || '',
      wisdom: $('#gen-wisdom')?.value?.trim() || '',
      protagonist: {
        archetype: $('#gen-protagonist-archetype')?.value || '',
        traits: getMultiSelectValues('#gen-protagonist-traits')
      },
      antagonist: {
        archetype: $('#gen-antagonist-archetype')?.value || '',
        traits: getMultiSelectValues('#gen-antagonist-traits')
      },
      secondaryCharacters: Array.from(document.querySelectorAll('.spec-secondary-item')).map((item, idx) => ({
        id: `secondary_${idx + 1}`,
        archetype: item.querySelector('.gen-secondary-archetype')?.value || '',
        traits: Array.from(item.querySelector('.gen-secondary-traits')?.selectedOptions || []).map(opt => opt.value)
      })),
      relationships: getRelationshipValues(),
      world: {
        geography: getSingleSelectValueAsArray('#gen-geography'),
        timePeriod: $('#gen-time-period')?.value || '',
        objects: {
          types: getSingleSelectValueAsArray('#gen-object-types'),
          importance: $('#gen-object-importance')?.value || ''
        }
      },
      narrativeStructure: {
        protagonistArc: $('#gen-protagonist-arc')?.value || '',
        subplots: $('#gen-subplots-arc')?.value || '',
        conflictAndResolution: $('#gen-conflict-resolution')?.value || ''
      }
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
