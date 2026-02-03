/**
 * SCRIPTA Demo - NL (Natural Language) Story Generation
 * 
 * Generates prose story from CNL specifications using LLM API.
 */

import { state, setGeneratedStory } from './state.mjs';
import { generateCNL } from './cnl.mjs';
import { $ } from './utils.mjs';

// Track NL generation state
let isGenerating = false;
let hasGeneratedNL = false;

/**
 * Get NL generation state
 */
export function getNLGenerationState() {
  return { isGenerating, hasGeneratedNL };
}

/**
 * Generate NL story from current CNL specification
 */
export async function generateNLStory() {
  if (isGenerating) {
    window.showNotification?.('Generation already in progress', 'info');
    return;
  }
  
  // Block interface
  isGenerating = true;
  showNLLoadingState();
  
  try {
    // Get current CNL
    const cnl = generateCNL();
    
    if (!cnl || cnl.trim().length < 50) {
      throw new Error('No sufficient specs to generate story. Create specs first.');
    }
    
    updateNLLoadingState('Connecting to LLM API...', 10);
    
    // Call server API for NL generation
    const response = await fetch('/v1/generate/nl-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cnl: cnl,
        storyName: state.project.name,
        options: {
          style: 'narrative',
          tone: 'literary',
          length: 'full'
        }
      })
    });
    
    updateNLLoadingState('Processing response...', 60);
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
      throw new Error(err.error?.message || `Server error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.story) {
      throw new Error('No story generated. Check API configuration.');
    }
    
    updateNLLoadingState('Rendering story...', 90);
    
    // Store and display the generated story
    setGeneratedStory(result.story);
    displayNLContent(result.story);
    
    // Update state
    hasGeneratedNL = true;
    updateNLGenerateButton();
    
    // Success notification
    window.showNotification?.('Story generated successfully!', 'success');
    
  } catch (err) {
    console.error('NL Generation error:', err);
    window.showNotification?.('Generation failed: ' + err.message, 'error');
    showNLErrorState(err.message);
  } finally {
    isGenerating = false;
    hideNLLoadingState();
  }
}

/**
 * Show loading state in NL tab
 */
function showNLLoadingState() {
  const btn = $('#btn-nl-generate');
  const content = $('#nl-content');
  
  if (btn) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Generating...';
  }
  
  // Disable other NL buttons
  $('#btn-nl-copy')?.setAttribute('disabled', 'disabled');
  $('#btn-nl-export')?.setAttribute('disabled', 'disabled');
  
  if (content) {
    content.innerHTML = `
      <div class="nl-loading-state">
        <div class="nl-spinner"></div>
        <div class="nl-loading-text">Generating story...</div>
        <div class="nl-loading-progress">
          <div class="nl-progress-bar" style="width: 0%"></div>
        </div>
        <div class="nl-loading-status">Initializing...</div>
      </div>
    `;
  }
}

/**
 * Update loading progress
 */
function updateNLLoadingState(message, progress) {
  const statusEl = $('.nl-loading-status');
  const progressBar = $('.nl-progress-bar');
  
  if (statusEl) statusEl.textContent = message;
  if (progressBar) progressBar.style.width = `${progress}%`;
}

/**
 * Hide loading state
 */
function hideNLLoadingState() {
  const btn = $('#btn-nl-generate');
  
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (btn.dataset.originalText) {
      btn.textContent = hasGeneratedNL ? 'Improve Story' : 'Create Story';
    }
  }
  
  // Re-enable other buttons
  $('#btn-nl-copy')?.removeAttribute('disabled');
  $('#btn-nl-export')?.removeAttribute('disabled');
}

/**
 * Display generated NL content
 */
function displayNLContent(story) {
  const content = $('#nl-content');
  if (!content) return;
  
  // Format the story with paragraphs
  const paragraphs = story.split('\n\n').filter(p => p.trim());
  const formattedHtml = paragraphs.map(p => {
    // Check if it's a chapter/section header
    if (p.match(/^(Chapter|Part|Section|Prologue|Epilogue)/i)) {
      return `<h3 class="nl-chapter-title">${escapeHtml(p)}</h3>`;
    }
    return `<p class="nl-paragraph">${escapeHtml(p)}</p>`;
  }).join('');
  
  content.innerHTML = `
    <div class="nl-story-content">
      <div class="nl-story-header">
        <h2 class="nl-story-title">${escapeHtml(state.project.name)}</h2>
        <div class="nl-story-meta">Generated on ${new Date().toLocaleDateString()}</div>
      </div>
      <div class="nl-story-body">
        ${formattedHtml}
      </div>
    </div>
  `;
}

/**
 * Show error state
 */
function showNLErrorState(errorMessage) {
  const content = $('#nl-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="nl-error-state">
      <div class="icon">⚠️</div>
      <div class="nl-error-title">Generation Failed</div>
      <div class="nl-error-message">${escapeHtml(errorMessage)}</div>
      <div class="nl-error-hint">
        Make sure:
        <ul>
          <li>Server is running with LLM API configured</li>
          <li>You have created specs (CNL) first</li>
          <li>API keys are valid</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Update NL generate button text based on state
 */
export function updateNLGenerateButton() {
  const btn = $('#btn-nl-generate');
  if (!btn) return;
  
  btn.textContent = hasGeneratedNL ? 'Improve Story' : 'Create Story';
}

/**
 * Reset NL generation state (called on new project)
 */
export function resetNLState() {
  hasGeneratedNL = false;
  isGenerating = false;
  
  const content = $('#nl-content');
  if (content) {
    content.innerHTML = `
      <div class="nl-empty-state">
        <div class="icon">📖</div>
        <div>No story generated yet</div>
        <div style="font-size: 0.9rem; color: var(--text-faded);">
          Create your specs first, then click "Create Story" to generate prose
        </div>
      </div>
    `;
  }
  
  updateNLGenerateButton();
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export for external use
export default generateNLStory;
