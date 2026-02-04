/**
 * SCRIPTA Demo - NL (Natural Language) Story Generation
 * 
 * Generates prose story from CNL specifications using LLM API.
 * Supports Markdown output and book-style preview.
 */

import { state, setGeneratedStory, getGeneratedStory } from './state.mjs';
import { generateCNL } from './cnl.mjs';
import { $ } from './utils.mjs';

// Track NL generation state
let isGenerating = false;
let hasGeneratedNL = false;

// Book preview state
let bookPages = [];
let currentBookPage = 0;

/**
 * Get NL generation state
 */
export function getNLGenerationState() {
  return { isGenerating, hasGeneratedNL };
}

/**
 * Simple Markdown to HTML parser
 */
function parseMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Escape HTML first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Paragraphs - wrap text blocks
  const lines = html.split('\n');
  let result = [];
  let currentParagraph = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if it's a block element
    if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>') || 
        trimmed.startsWith('<h3>') || trimmed.startsWith('<hr>') ||
        trimmed.startsWith('<blockquote>')) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        result.push('<p>' + currentParagraph.join(' ') + '</p>');
        currentParagraph = [];
      }
      result.push(trimmed);
    } else if (trimmed === '') {
      // Empty line = paragraph break
      if (currentParagraph.length > 0) {
        result.push('<p>' + currentParagraph.join(' ') + '</p>');
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmed);
    }
  }
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    result.push('<p>' + currentParagraph.join(' ') + '</p>');
  }
  
  // Merge consecutive blockquotes
  html = result.join('\n');
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');
  
  return html;
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
    
    // Get options from UI
    const options = getGenerationOptions();
    
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
    window.showNotification?.('Generation failed: ' + err.message, 'error');
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
  
  updateNLLoadingState('Rendering story...', 90);
  
  // Store and display the generated story (raw markdown)
  setGeneratedStory(result.story);
  displayNLContent(result.story);
  
  // Update state
  hasGeneratedNL = true;
  updateNLGenerateButton();
  enablePreviewButton();
  
  // Success notification
  window.showNotification?.('Story generated successfully!', 'success');
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
        setGeneratedStory(fullStory);
        displayNLContent(fullStory);
        hasGeneratedNL = true;
        updateNLGenerateButton();
        enablePreviewButton();
        window.showNotification?.('Story generated successfully!', 'success');
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
      window.showNotification?.(`Error in Chapter ${event.chapterNumber}: ${event.error}`, 'error');
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

/**
 * Append a chapter to the live display during streaming (legacy, kept for compatibility)
 */
function appendChapterToDisplay(chapterContent) {
  const chapterHtml = parseMarkdown(chapterContent || '');
  appendNLStreamingContent(chapterHtml, false);
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
 * Update loading state for chapter-by-chapter generation
 */
function updateNLLoadingStateChapter(message, detailText, progress) {
  const statusEl = $('.nl-loading-status');
  const progressBar = $('.nl-progress-bar');
  const textEl = $('.nl-loading-text');
  
  if (textEl) textEl.textContent = message;
  if (statusEl) statusEl.textContent = detailText;
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
  bookPages = [];
  currentBookPage = 0;
  
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
  
  // Disable preview button
  $('#btn-nl-preview')?.setAttribute('disabled', 'disabled');
  
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

// ============================================
// BOOK PREVIEW FUNCTIONALITY
// ============================================

/**
 * Split content into pages for book view
 * Each "page" is roughly 1500 characters for comfortable reading
 */
function splitIntoPages(htmlContent) {
  const CHARS_PER_PAGE = 1800;
  const pages = [];
  
  // Create a temporary container to work with the content
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  
  // Get all top-level elements
  const elements = Array.from(temp.children);
  let currentPage = '';
  let currentLength = 0;
  
  for (const el of elements) {
    const elHtml = el.outerHTML;
    const elLength = el.textContent.length;
    
    // If it's a chapter header (h1, h2), start a new page
    if (el.tagName === 'H1' || el.tagName === 'H2') {
      if (currentPage.trim()) {
        pages.push(currentPage);
      }
      currentPage = elHtml;
      currentLength = elLength;
    } 
    // If adding this element exceeds page limit, start new page
    else if (currentLength + elLength > CHARS_PER_PAGE && currentPage.trim()) {
      pages.push(currentPage);
      currentPage = elHtml;
      currentLength = elLength;
    } 
    // Otherwise add to current page
    else {
      currentPage += elHtml;
      currentLength += elLength;
    }
  }
  
  // Add remaining content
  if (currentPage.trim()) {
    pages.push(currentPage);
  }
  
  // Ensure even number of pages for book view
  if (pages.length % 2 !== 0) {
    pages.push('<p style="text-align: center; color: #8b5a2b; font-style: italic; margin-top: 40%;">— The End —</p>');
  }
  
  return pages;
}

/**
 * Open book preview modal
 */
export function openBookPreview() {
  const story = getGeneratedStory();
  if (!story) {
    window.showNotification?.('No story to preview. Generate a story first.', 'info');
    return;
  }
  
  const modal = $('#book-preview-modal');
  if (!modal) return;
  
  // Set title
  const titleEl = $('#book-preview-title');
  if (titleEl) {
    titleEl.textContent = state.project.name || 'Untitled Story';
  }
  
  // Parse markdown and split into pages
  const htmlContent = parseMarkdown(story);
  bookPages = splitIntoPages(htmlContent);
  currentBookPage = 0;
  
  // Render first spread
  renderBookSpread();
  
  // Show modal
  modal.classList.add('active');
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleBookKeyNav);
}

/**
 * Close book preview modal
 */
export function closeBookPreview() {
  const modal = $('#book-preview-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.removeEventListener('keydown', handleBookKeyNav);
}

/**
 * Render current book spread (two pages)
 */
function renderBookSpread() {
  const leftContent = $('#book-page-left-content');
  const rightContent = $('#book-page-right-content');
  const leftNum = $('#book-page-left-num');
  const rightNum = $('#book-page-right-num');
  const indicator = $('#book-page-indicator');
  const prevBtn = $('#book-prev-btn');
  const nextBtn = $('#book-next-btn');
  
  // Left page
  if (leftContent && bookPages[currentBookPage]) {
    leftContent.innerHTML = bookPages[currentBookPage];
  } else if (leftContent) {
    leftContent.innerHTML = '';
  }
  
  // Right page
  if (rightContent && bookPages[currentBookPage + 1]) {
    rightContent.innerHTML = bookPages[currentBookPage + 1];
  } else if (rightContent) {
    rightContent.innerHTML = '';
  }
  
  // Page numbers
  if (leftNum) leftNum.textContent = currentBookPage + 1;
  if (rightNum) rightNum.textContent = currentBookPage + 2;
  
  // Page indicator
  if (indicator) {
    indicator.textContent = `Pages ${currentBookPage + 1}-${Math.min(currentBookPage + 2, bookPages.length)} of ${bookPages.length}`;
  }
  
  // Enable/disable navigation buttons
  if (prevBtn) prevBtn.disabled = currentBookPage === 0;
  if (nextBtn) nextBtn.disabled = currentBookPage + 2 >= bookPages.length;
}

/**
 * Go to previous page spread
 */
window.bookPrevPage = function() {
  if (currentBookPage > 0) {
    currentBookPage -= 2;
    renderBookSpread();
  }
};

/**
 * Go to next page spread
 */
window.bookNextPage = function() {
  if (currentBookPage + 2 < bookPages.length) {
    currentBookPage += 2;
    renderBookSpread();
  }
};

/**
 * Handle keyboard navigation in book preview
 */
function handleBookKeyNav(e) {
  if (!$('#book-preview-modal')?.classList.contains('active')) return;
  
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    window.bookPrevPage();
    e.preventDefault();
  } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    window.bookNextPage();
    e.preventDefault();
  } else if (e.key === 'Escape') {
    closeBookPreview();
    e.preventDefault();
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Load available models from server
 */
async function loadAvailableModels() {
  try {
    const response = await fetch('/v1/models');
    if (!response.ok) return;
    
    const data = await response.json();
    const modelSelect = $('#nl-model');
    if (!modelSelect) return;
    
    // Clear existing options except default
    modelSelect.innerHTML = '<option value="">Default (auto)</option>';
    
    // Add deep models (preferred for creative writing)
    if (data.models?.deep?.length) {
      const deepGroup = document.createElement('optgroup');
      deepGroup.label = 'Deep (Creative)';
      data.models.deep.forEach(model => {
        const option = document.createElement('option');
        option.value = model.qualifiedName || model.name;
        option.textContent = `${model.name} (${model.provider})`;
        deepGroup.appendChild(option);
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
    
  } catch (err) {
    console.log('[NL Generation] Could not load models:', err.message);
  }
}

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
  
  // Load available models
  loadAvailableModels();
}

// Export for external use
export default generateNLStory;
