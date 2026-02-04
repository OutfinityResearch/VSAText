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
  const strategyRadio = document.querySelector('input[name="gen-strategy"]:checked');
  const strategy = strategyRadio ? strategyRadio.value : 'random';
  
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
