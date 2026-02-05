/**
 * SCRIPTA Demo - NL (Natural Language) Story Generation
 * 
 * Generates prose story from CNL specifications using LLM API.
 * Supports Markdown output, streaming generation, and version management.
 */

import { state, setGeneratedStory, getGeneratedStory } from './state.mjs';
import { generateCNL } from './cnl.mjs';
import { $, showNotification } from './utils.mjs';
import { parseMarkdown, escapeHtml } from '../../src/utils/markdown.mjs';
import { openBookPreview, closeBookPreview, resetBookPreview } from './book-preview.mjs';
import {
  loadStoryVersions,
  onVersionSelect,
  deleteCurrentVersion,
  saveStoryVersion,
  loadAvailableModels,
  canImprove,
  resetVersionState,
  setCurrentVersionInfo
} from './nl-versions.mjs';

// Track NL generation state
let isGenerating = false;
let hasGeneratedNL = false;

// Lazy import for persistence to avoid circular dependency
let persistenceModule = null;
async function getPersistence() {
  if (!persistenceModule) {
    persistenceModule = await import('./persistence.mjs');
  }
  return persistenceModule;
}

/**
 * Get NL generation state
 */
export function getNLGenerationState() {
  return { isGenerating, hasGeneratedNL };
}

/**
 * Set hasGeneratedNL state (used by version callbacks)
 */
function setHasGeneratedNL(value) {
  hasGeneratedNL = value;
}

/**
 * Get current generation options from UI
 */
function getGenerationOptions() {
  const language = $('#nl-language')?.value || 'en';
  const model = $('#nl-model')?.value || '';
  const customPrompt = $('#nl-custom-prompt')?.value?.trim() || '';
  
  return {
    style: 'narrative',
    tone: 'literary',
    length: 'full',
    language,
    model: model || undefined,
    customPrompt: customPrompt || undefined
  };
}

/**
 * Extract chapters from project structure for streaming generation
 */
function extractChaptersFromProject() {
  const structure = state.project?.structure;
  if (!structure?.children?.length) return [];
  
  return structure.children.map((chapter, idx) => ({
    number: idx + 1,
    title: chapter.title || chapter.name || `Chapter ${idx + 1}`,
    scenes: chapter.children?.length || 0
  }));
}

/**
 * Generate NL story from current CNL specification
 * Uses SSE streaming for chapter-by-chapter progress
 * If improving, includes previous version text for LLM reference
 */
export async function generateNLStory() {
  if (isGenerating) {
    showNotification?.('Generation already in progress', 'info');
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
    
    // Get options from UI
    const options = getGenerationOptions();
    
    // Check if this is an improvement (same language+model)
    const isImprovement = canImprove(hasGeneratedNL);
    if (isImprovement) {
      // Include previous version text for improvement
      const previousStory = getGeneratedStory();
      if (previousStory) {
        options.previousVersion = previousStory;
        options.isImprovement = true;
      }
    }
    
    // Check if we have chapters for streaming
    const chapters = extractChaptersFromProject();
    
    if (chapters.length > 1) {
      // Use streaming generation for multi-chapter stories
      await generateNLStoryStreaming(cnl, options, chapters);
    } else {
      // Use regular generation for single chapter or no structure
      await generateNLStorySingle(cnl, options);
    }
    
  } catch (err) {
    console.error('NL Generation error:', err);
    showNotification?.('Generation failed: ' + err.message, 'error');
    showNLErrorState(err.message);
  } finally {
    isGenerating = false;
    hideNLLoadingState();
  }
}

/**
 * Generate story using single API call (for simple stories)
 */
async function generateNLStorySingle(cnl, options) {
  updateNLLoadingState('Connecting to LLM API...', 10);
  
  const response = await fetch('/v1/generate/nl-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cnl: cnl,
      storyName: state.project.name,
      options
    })
  });
  
  updateNLLoadingState('Generating story...', 40);
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
    throw new Error(err.error?.message || `Server error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.story) {
    throw new Error('No story generated. Check API configuration.');
  }
  
  updateNLLoadingState('Saving story version...', 85);
  
  // Save as a new version
  const language = options.language || 'en';
  const model = options.model || 'default';
  await saveStoryVersion(result.story, language, model);
  
  updateNLLoadingState('Rendering story...', 95);
  
  // Store and display the generated story (raw markdown)
  setGeneratedStory(result.story);
  displayNLContent(result.story);
  
  // Update state
  hasGeneratedNL = true;
  updateNLGenerateButton();
  enablePreviewButton();
  
  // Mark project as dirty (lazy import)
  const persistence = await getPersistence();
  persistence.markDirty();
  
  // Success notification
  showNotification?.('Story generated and saved!', 'success');
}

/**
 * Generate story using SSE streaming (chapter by chapter)
 */
async function generateNLStoryStreaming(cnl, options, chapters) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      cnl,
      storyName: state.project.name,
      options,
      chapters
    });
    
    // We need to use fetch with POST and manually handle SSE
    // because EventSource only supports GET
    fetch('/v1/generate/nl-story/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody
    }).then(async response => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
        throw new Error(err.error?.message || `Server error: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullStory = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              handleStreamEvent(event, (story) => { fullStory = story; });
            } catch (e) {
              console.warn('Failed to parse SSE event:', e);
            }
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.startsWith('data: ')) {
        try {
          const event = JSON.parse(buffer.slice(6));
          handleStreamEvent(event, (story) => { fullStory = story; });
        } catch (e) {
          // Ignore
        }
      }
      
      if (fullStory) {
        // Save as a new version
        const language = options.language || 'en';
        const model = options.model || 'default';
        await saveStoryVersion(fullStory, language, model);
        
        setGeneratedStory(fullStory);
        displayNLContent(fullStory);
        hasGeneratedNL = true;
        updateNLGenerateButton();
        enablePreviewButton();
        
        // Mark project as dirty (lazy import)
        const persistence = await getPersistence();
        persistence.markDirty();
        
        showNotification?.('Story generated and saved!', 'success');
      }
      
      resolve();
      
    }).catch(reject);
  });
}

/**
 * Handle SSE stream events
 */
let streamingChapterCount = 0;

function handleStreamEvent(event, setFullStory) {
  switch (event.type) {
    case 'start':
      streamingChapterCount = 0;
      const totalChapters = event.totalChapters || 1;
      const estMinutes = Math.ceil((event.estimatedTotal || 15000) / 60000);
      // Switch to streaming view
      showNLStreamingState();
      updateNLStreamingProgress(
        `Starting... (${totalChapters} chapters)`,
        0,
        `~${estMinutes} min total`
      );
      break;
      
    case 'chapter_start':
      updateNLStreamingProgress(
        `Writing Chapter ${event.chapterNumber}: ${event.chapterTitle}`,
        event.progress || 0,
        `~${Math.ceil((event.estimated || 10000) / 1000)}s`
      );
      break;
      
    case 'chapter_complete':
      streamingChapterCount++;
      updateNLStreamingProgress(
        `Chapter ${event.chapterNumber} complete`,
        event.progress || 0,
        `${Math.ceil((event.elapsed || 0) / 1000)}s`
      );
      // Append chapter content to display - show the actual text!
      const chapterHtml = parseMarkdown(event.content || '');
      appendNLStreamingContent(chapterHtml, streamingChapterCount === 1);
      break;
      
    case 'chapter_error':
      showNotification?.(`Error in Chapter ${event.chapterNumber}: ${event.error}`, 'error');
      appendNLStreamingContent(`<p class="nl-error-inline">Error generating chapter ${event.chapterNumber}: ${escapeHtml(event.error)}</p>`, false);
      break;
      
    case 'complete':
      updateNLStreamingProgress(
        `Complete! ${event.totalChapters} chapters`,
        100,
        ''
      );
      if (event.fullStory) {
        setFullStory(event.fullStory);
      }
      break;
      
    case 'error':
      throw new Error(event.message || 'Generation failed');
  }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

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
  $('#btn-nl-preview')?.setAttribute('disabled', 'disabled');
  
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
 * Show streaming state - split view with progress and live content
 */
function showNLStreamingState() {
  const content = $('#nl-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="nl-streaming-container">
      <div class="nl-streaming-header">
        <div class="nl-streaming-progress-section">
          <div class="nl-streaming-status">
            <span class="nl-streaming-chapter">Starting...</span>
            <span class="nl-streaming-time"></span>
          </div>
          <div class="nl-loading-progress">
            <div class="nl-progress-bar" style="width: 0%"></div>
          </div>
        </div>
      </div>
      <div class="nl-streaming-content nl-markdown-content">
        <div class="nl-streaming-placeholder">
          <div class="nl-spinner"></div>
          <div>Waiting for first chapter...</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update streaming progress header
 */
function updateNLStreamingProgress(chapterInfo, progress, timeInfo) {
  const chapterEl = $('.nl-streaming-chapter');
  const timeEl = $('.nl-streaming-time');
  const progressBar = $('.nl-progress-bar');
  
  if (chapterEl) chapterEl.textContent = chapterInfo;
  if (timeEl) timeEl.textContent = timeInfo || '';
  if (progressBar) progressBar.style.width = `${progress}%`;
}

/**
 * Append streaming content (chapter text)
 */
function appendNLStreamingContent(htmlContent, isFirst = false) {
  const container = $('.nl-streaming-content');
  if (!container) return;
  
  // Remove placeholder on first content
  if (isFirst) {
    const placeholder = container.querySelector('.nl-streaming-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  // Append the new content
  container.innerHTML += htmlContent;
  
  // Scroll to show new content
  container.scrollTop = container.scrollHeight;
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
 * Enable preview button when story is available
 */
function enablePreviewButton() {
  const btn = $('#btn-nl-preview');
  if (btn) {
    btn.removeAttribute('disabled');
  }
}

/**
 * Display generated NL content (renders Markdown)
 */
function displayNLContent(story) {
  const content = $('#nl-content');
  if (!content) return;
  
  // Parse markdown to HTML
  const renderedHtml = parseMarkdown(story);
  
  content.innerHTML = `
    <div class="nl-story-content">
      <div class="nl-story-header">
        <h2 class="nl-story-title">${escapeHtml(state.project.name)}</h2>
        <div class="nl-story-meta">Generated on ${new Date().toLocaleDateString()}</div>
      </div>
      <div class="nl-story-body nl-markdown-content">
        ${renderedHtml}
      </div>
    </div>
  `;
  
  // Enable preview button
  enablePreviewButton();
}

/**
 * Show error state
 */
function showNLErrorState(errorMessage) {
  const content = $('#nl-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="nl-error-state">
      <div class="icon">Warning</div>
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
 * - "Create Story" when no version exists with current language+model
 * - "Improve Story" when a version exists with same language+model
 */
export function updateNLGenerateButton() {
  const btn = $('#btn-nl-generate');
  if (!btn) return;
  
  btn.textContent = canImprove(hasGeneratedNL) ? 'Improve Story' : 'Create Story';
}

/**
 * Reset NL content to empty state
 */
function resetNLContent() {
  const content = $('#nl-content');
  if (content) {
    content.innerHTML = `
      <div class="nl-empty-state">
        <div class="icon">Book</div>
        <div>No story generated yet</div>
        <div style="font-size: 0.9rem; color: var(--text-faded);">
          Create your specs first, then click "Create Story" to generate prose
        </div>
      </div>
    `;
  }
}

/**
 * Reset NL generation state (called on new project)
 */
export function resetNLState() {
  hasGeneratedNL = false;
  isGenerating = false;
  resetVersionState();
  resetBookPreview();
  
  // Reset version selector
  const versionSelect = $('#nl-version-select');
  if (versionSelect) {
    versionSelect.innerHTML = '<option value="">-- New Generation --</option>';
  }
  
  const deleteBtn = $('#btn-nl-delete-version');
  if (deleteBtn) deleteBtn.disabled = true;
  
  resetNLContent();
  
  // Disable preview button
  $('#btn-nl-preview')?.setAttribute('disabled', 'disabled');
  
  updateNLGenerateButton();
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize NL generation event handlers
 */
export function initNLGeneration() {
  // Preview button handler
  const previewBtn = $('#btn-nl-preview');
  if (previewBtn) {
    previewBtn.addEventListener('click', openBookPreview);
  }
  
  // Close book preview when clicking overlay
  const modal = $('#book-preview-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBookPreview();
      }
    });
  }
  
  // Version select handler
  const versionSelect = $('#nl-version-select');
  if (versionSelect) {
    versionSelect.addEventListener('change', (e) => onVersionSelect(e, {
      updateNLGenerateButton,
      displayNLContent,
      enablePreviewButton,
      resetNLContent,
      setHasGeneratedNL
    }));
  }
  
  // Delete version button
  const deleteBtn = $('#btn-nl-delete-version');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteCurrentVersion(resetNLContent));
  }
  
  // Language/Model change handlers - update button text
  const langSelect = $('#nl-language');
  const modelSelect = $('#nl-model');
  
  if (langSelect) {
    langSelect.addEventListener('change', updateNLGenerateButton);
  }
  if (modelSelect) {
    modelSelect.addEventListener('change', updateNLGenerateButton);
  }
  
  // Load available models
  loadAvailableModels();
}

// Re-export for external use
export { loadStoryVersions, openBookPreview, closeBookPreview };
export default generateNLStory;
