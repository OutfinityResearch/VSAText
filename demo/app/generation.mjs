/**
 * SCRIPTA Demo - Story Generation
 * 
 * Main entry point for story generation.
 * Orchestrates different generation strategies.
 */

import { $, closeModal, showNotification } from './utils.mjs';
import { TEMPLATES } from './generation/generation-config.mjs';
import { generateRandom } from './generation/generation-random.mjs';
import { generateLLM } from './generation/generation-llm.mjs';
import { generateAdvanced } from './generation/generation-advanced.mjs';
import { updateGenerateButton, showImproveModal, applyImprovements } from './generation/generation-improve.mjs';

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
// MAIN GENERATION DISPATCHER
// ============================================

window.executeGenerate = async () => {
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
  
  // Close modal for random (instant), keep open for async strategies
  if (strategy === 'random') {
    closeModal('generate-modal');
  }
  
  try {
    switch (strategy) {
      case 'llm':
        await generateLLM(options);
        closeModal('generate-modal');
        break;
        
      case 'advanced':
        await generateAdvanced(options);
        closeModal('generate-modal');
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
        generateRandom(options);
        break;
    }
  } catch (err) {
    console.error('Generation error:', err);
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
