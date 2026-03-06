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
let activeGeneration = null;
let isRetryingFailedSections = false;
let retryController = null;
const DEFAULT_STORY_MODEL = 'copilot-gpt-4o';

function makeAbortError(message = 'Generation cancelled') {
  const err = new Error(message);
  err.name = 'AbortError';
  return err;
}

function isAbortError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const msg = String(err.message || '').toLowerCase();
  return msg.includes('abort') || msg.includes('cancel');
}

function ensureNotAborted(signal) {
  if (signal?.aborted) {
    throw makeAbortError();
  }
}

function startNLGenerationSession() {
  const controller = new AbortController();
  activeGeneration = {
    controller,
    cancelledByUser: false,
    previousStory: getGeneratedStory() || '',
    previousHasGeneratedNL: hasGeneratedNL
  };
  return activeGeneration;
}

function restoreBeforeGeneration(session) {
  if (!session) return;

  hasGeneratedNL = Boolean(session.previousHasGeneratedNL);

  if (session.previousStory && session.previousStory.trim().length > 0) {
    setGeneratedStory(session.previousStory);
    displayNLContent(session.previousStory);
    enablePreviewButton();
  } else {
    setGeneratedStory('');
    resetNLContent();
    $('#btn-nl-preview')?.setAttribute('disabled', 'disabled');
  }

  updateNLGenerateButton();
}

export function cancelNLGeneration(notify = true) {
  if (!isGenerating || !activeGeneration) return;
  if (activeGeneration.cancelledByUser) return;

  activeGeneration.cancelledByUser = true;
  try {
    activeGeneration.controller.abort();
  } catch {
    // Ignore abort errors.
  }

  if (notify) {
    showNotification?.('Stopping story generation...', 'warning');
  }
}

function cancelRetryGeneration(notify = true) {
  if (!isRetryingFailedSections || !retryController) return;
  try {
    retryController.abort();
  } catch {
    // Ignore abort errors.
  }
  if (notify) {
    showNotification?.('Stopping retry generation...', 'warning');
  }
}

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

function buildHookPromptInstructions() {
  const hooks = state.project?.blueprint?.hooks;
  if (!hooks || typeof hooks !== 'object') return '';

  const lines = [];
  const opening = hooks.opening || null;
  if (opening && (opening.hookText || opening.hookType || opening.sceneGoal)) {
    const openingTechniques = Array.isArray(opening.hookTechniques) ? opening.hookTechniques.filter(Boolean).join(', ') : '';
    const mainCharacter = (state.project?.libraries?.characters || []).find(c => c.id === opening.mainCharacterId)?.name || '';
    lines.push('OPENING HOOK (highest priority for story start):');
    if (opening.hookText) lines.push(`- Hook text: ${opening.hookText}`);
    if (opening.hookType) lines.push(`- Hook type: ${opening.hookType}`);
    lines.push(`- Emotional intensity: ${opening.emotionalIntensity || 3}/5`);
    if (mainCharacter) lines.push(`- Main character: ${mainCharacter}`);
    if (opening.keyObjectOrEvent) lines.push(`- Key object/event: ${opening.keyObjectOrEvent}`);
    if (opening.sceneGoal) lines.push(`- Scene goal: ${opening.sceneGoal}`);
    if (opening.sceneMood) lines.push(`- Scene mood: ${opening.sceneMood}`);
    if (opening.sceneTheme) lines.push(`- Scene theme: ${opening.sceneTheme}`);
    if (openingTechniques) lines.push(`- Technique: ${openingTechniques}`);
    if (opening.curiositySeeds) lines.push(`- Curiosity seeds: ${opening.curiositySeeds}`);
    if (opening.conflictStakes) lines.push(`- Conflict/stakes: ${opening.conflictStakes}`);
  }

  const midHooks = Array.isArray(hooks.mid) ? hooks.mid : [];
  const activeMidHooks = midHooks.filter(h => h && (h.hookText || h.hookType || h.sceneGoal));
  if (activeMidHooks.length) {
    lines.push('');
    lines.push('MID-STORY HOOKS (use to sustain momentum in middle sections):');
    activeMidHooks.slice(0, 5).forEach((hook, index) => {
      const techniques = Array.isArray(hook.hookTechniques) ? hook.hookTechniques.filter(Boolean).join(', ') : '';
      const mainCharacter = (state.project?.libraries?.characters || []).find(c => c.id === hook.mainCharacterId)?.name || '';
      lines.push(`- Mid Hook ${index + 1}:`);
      if (hook.hookText) lines.push(`  • Text: ${hook.hookText}`);
      if (hook.hookType) lines.push(`  • Type: ${hook.hookType}`);
      lines.push(`  • Emotional intensity: ${hook.emotionalIntensity || 3}/5`);
      if (mainCharacter) lines.push(`  • Main character: ${mainCharacter}`);
      if (hook.keyObjectOrEvent) lines.push(`  • Key object/event: ${hook.keyObjectOrEvent}`);
      if (hook.sceneGoal) lines.push(`  • Scene goal: ${hook.sceneGoal}`);
      if (hook.sceneMood) lines.push(`  • Scene mood: ${hook.sceneMood}`);
      if (hook.sceneTheme) lines.push(`  • Scene theme: ${hook.sceneTheme}`);
      if (techniques) lines.push(`  • Technique: ${techniques}`);
      if (hook.curiositySeeds) lines.push(`  • Curiosity seeds: ${hook.curiositySeeds}`);
      if (hook.conflictStakes) lines.push(`  • Conflict/stakes: ${hook.conflictStakes}`);
      if (hook.targetSceneId) lines.push(`  • Target scene: ${hook.targetSceneId}`);
      if (hook.targetBeatKey) lines.push(`  • Target beat: ${hook.targetBeatKey}`);
    });
  }

  return lines.join('\n').trim();
}

/**
 * Get current generation options from UI
 */
function getGenerationOptions() {
  const language = $('#nl-language')?.value || 'en';
  const model = $('#nl-model')?.value || DEFAULT_STORY_MODEL;
  const customPrompt = $('#nl-custom-prompt')?.value?.trim() || '';
  const hookPrompt = buildHookPromptInstructions();
  const mergedPrompt = [customPrompt, hookPrompt].filter(Boolean).join('\n\n');
  
  return {
    style: 'narrative',
    tone: 'literary',
    length: 'full',
    language,
    model,
    customPrompt: mergedPrompt || undefined
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
    cancelNLGeneration(true);
    return;
  }

  isGenerating = true;
  const session = startNLGenerationSession();
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
      await generateNLStoryStreaming(cnl, options, chapters, session.controller.signal);
    } else {
      // Use regular generation for single chapter or no structure
      await generateNLStorySingle(cnl, options, session.controller.signal);
    }
    
  } catch (err) {
    if (session.cancelledByUser || isAbortError(err)) {
      restoreBeforeGeneration(session);
      showNotification?.('Generation cancelled. In-progress output was discarded.', 'warning');
    } else {
      console.error('NL Generation error:', err);
      showNotification?.('Generation failed: ' + err.message, 'error');
      showNLErrorState(err.message);
    }
  } finally {
    isGenerating = false;
    activeGeneration = null;
    hideNLLoadingState();
  }
}

/**
 * Generate story using single API call (for simple stories)
 */
async function generateNLStorySingle(cnl, options, signal) {
  ensureNotAborted(signal);
  updateNLLoadingState('Connecting to LLM API...', 10);
  
  const response = await fetch('/v1/generate/nl-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cnl: cnl,
      storyName: state.project.name,
      options
    }),
    signal
  });
  ensureNotAborted(signal);
  
  updateNLLoadingState('Generating story...', 40);
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
    throw new Error(err.error?.message || `Server error: ${response.status}`);
  }
  
  const result = await response.json();
  ensureNotAborted(signal);
  
  if (!result.story) {
    throw new Error('No story generated. Check API configuration.');
  }
  
  updateNLLoadingState('Saving story version...', 85);
  
  // Save as a new version
  const language = options.language || 'en';
  const model = options.model || DEFAULT_STORY_MODEL;
  const versionInfo = await saveStoryVersion(result.story, language, model);
  if (!versionInfo) {
    setCurrentVersionInfo(null, language, model);
  }
  ensureNotAborted(signal);
  
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
  if (versionInfo) {
    showNotification?.('Story generated and saved!', 'success');
  } else {
    showNotification?.('Story generated. Version not saved, but Improve is available for current settings.', 'warning');
  }
}

/**
 * Generate story using SSE streaming (chapter by chapter)
 */
async function generateNLStoryStreaming(cnl, options, chapters, signal) {
  ensureNotAborted(signal);

  const requestBody = JSON.stringify({
    cnl,
    storyName: state.project.name,
    options,
    chapters
  });
  
  // We need to use fetch with POST and manually handle SSE
  // because EventSource only supports GET
  const response = await fetch('/v1/generate/nl-story/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
    signal
  });
  ensureNotAborted(signal);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Server error' } }));
    throw new Error(err.error?.message || `Server error: ${response.status}`);
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    throw new Error('Streaming response not available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullStory = '';

  while (true) {
    ensureNotAborted(signal);
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Process SSE events
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const payload = line.slice(6);
      let event = null;
      try {
        event = JSON.parse(payload);
      } catch (e) {
        console.warn('Failed to parse SSE event:', e);
        continue;
      }

      const fatalError = handleStreamEvent(event, (story) => { fullStory = story; });
      if (fatalError) {
        throw fatalError;
      }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    try {
      const event = JSON.parse(buffer.slice(6));
      const fatalError = handleStreamEvent(event, (story) => { fullStory = story; });
      if (fatalError) throw fatalError;
    } catch (e) {
      if (!isAbortError(e)) {
        console.warn('Failed to parse trailing SSE event:', e);
      } else {
        throw e;
      }
    }
  }

  ensureNotAborted(signal);

  if (fullStory) {
    // Save as a new version
    const language = options.language || 'en';
    const model = options.model || DEFAULT_STORY_MODEL;
    const versionInfo = await saveStoryVersion(fullStory, language, model);
    if (!versionInfo) {
      setCurrentVersionInfo(null, language, model);
    }
    ensureNotAborted(signal);
    
    setGeneratedStory(fullStory);
    displayNLContent(fullStory);
    hasGeneratedNL = true;
    updateNLGenerateButton();
    enablePreviewButton();
    
    // Mark project as dirty (lazy import)
    const persistence = await getPersistence();
    persistence.markDirty();
    
    if (versionInfo) {
      showNotification?.('Story generated and saved!', 'success');
    } else {
      showNotification?.('Story generated. Version not saved, but Improve is available for current settings.', 'warning');
    }
  }
}

/**
 * Handle SSE stream events
 */
let streamingChapterCount = 0;
let failedSections = []; // Track failed sections for retry

function handleStreamEvent(event, setFullStory) {
  switch (event.type) {
    case 'start':
      streamingChapterCount = 0;
      failedSections = [];
      const totalScenes = event.totalScenes || event.totalChapters || 1;
      // Switch to streaming view
      showNLStreamingState();
      updateNLStreamingProgress(
        `Starting... (${totalScenes} sections)`,
        0,
        ''
      );
      break;
    
    case 'scene_start': {
      const label = event.sceneNumber != null
        ? 'Scene'
        : (event.chapterNumber != null ? 'Chapter' : 'Scene');
      const number = event.sceneNumber ?? event.chapterNumber ?? '';
      const title = event.title || event.chapterTitle || '';
      updateNLStreamingProgress(
        `Writing ${label} ${number}: ${title}`.trim(),
        event.progress || 0,
        ''
      );
      break;
    }
      
    case 'chapter_start':
      updateNLStreamingProgress(
        `Writing Chapter ${event.chapterNumber}: ${event.chapterTitle || ''}`,
        event.progress || 0,
        ''
      );
      break;
    
    case 'scene_complete': {
      streamingChapterCount++;
      const label = event.sceneNumber != null
        ? 'Scene'
        : (event.chapterNumber != null ? 'Chapter' : 'Scene');
      const number = event.sceneNumber ?? event.chapterNumber ?? '';
      updateNLStreamingProgress(
        `${label} ${number} complete`.trim(),
        event.progress || 0,
        ''
      );
      const sceneHtml = parseMarkdown(event.content || '');
      appendNLStreamingContent(sceneHtml, streamingChapterCount === 1);
      break;
    }
      
    case 'chapter_complete':
      streamingChapterCount++;
      updateNLStreamingProgress(
        `Chapter ${event.chapterNumber} complete`,
        event.progress || 0,
        ''
      );
      const chapterHtml = parseMarkdown(event.content || '');
      appendNLStreamingContent(chapterHtml, streamingChapterCount === 1);
      break;
    
    case 'scene_error': {
      const label = event.sceneNumber != null
        ? 'Scene'
        : (event.chapterNumber != null ? 'Chapter' : 'Scene');
      const number = event.sceneNumber ?? event.chapterNumber ?? '';

      showNotification?.(`Error in ${label} ${number}: ${event.error}`, 'error');
      failedSections.push({
        id: `scene_${event.sceneNumber ?? event.chapterNumber ?? ''}`,
        type: 'scene',
        chapterNumber: event.chapterNumber,
        sceneNumber: event.sceneNumber,
        title: event.title,
        error: event.error,
        cnl: event.cnl
      });
      appendNLStreamingContent(renderFailedSection(event, 'scene'), false);
      break;
    }
      
    case 'chapter_error':
      showNotification?.(`Error in Chapter ${event.chapterNumber}: ${event.error}`, 'error');
      failedSections.push({
        id: `chapter_${event.chapterNumber}`,
        type: 'chapter',
        chapterNumber: event.chapterNumber,
        title: event.title,
        error: event.error,
        cnl: event.cnl
      });
      appendNLStreamingContent(renderFailedSection(event, 'chapter'), false);
      break;
      
    case 'complete':
      updateNLStreamingProgress(
        event.success ? `Complete!` : `Completed with ${event.stats?.failed || failedSections.length} errors`,
        100,
        ''
      );
      if (event.fullStory) {
        setFullStory(event.fullStory);
      }
      // Show retry button if there are failed sections
      if (event.failedSections?.length > 0 || failedSections.length > 0) {
        showRetryButton(event.failedSections || failedSections);
      }
      break;
      
    case 'error':
      return new Error(event.message || 'Generation failed');
  }

  return null;
}

/**
 * Render a failed section with CNL info and retry option
 */
function renderFailedSection(event, type) {
  const isScene = type === 'scene';
  const isChapterFallback = isScene && event.sceneNumber == null && event.chapterNumber != null;
  const label = isChapterFallback ? 'Chapter' : (isScene ? 'Scene' : 'Chapter');
  const number = isScene
    ? (event.sceneNumber ?? event.chapterNumber ?? '')
    : (event.chapterNumber ?? '');
  const title = `${label} ${number}: ${event.title || 'Untitled'}`.trim();
  
  const cnlPreview = event.cnl 
    ? escapeHtml(event.cnl.substring(0, 300)) + (event.cnl.length > 300 ? '...' : '')
    : 'No CNL available';
  
  return `
    <div class="nl-failed-section" data-section-id="${type}_${event.sceneNumber || event.chapterNumber || ''}">
      <div class="nl-failed-header">
        <span class="nl-failed-icon">!</span>
        <span class="nl-failed-title">${escapeHtml(title)}</span>
      </div>
      <div class="nl-failed-error">${escapeHtml(event.error)}</div>
      <details class="nl-failed-cnl">
        <summary>Show CNL specification</summary>
        <pre>${cnlPreview}</pre>
      </details>
    </div>
  `;
}

/**
 * Show retry button for failed sections
 */
function showRetryButton(sections) {
  const container = $('.nl-streaming-content') || $('#nl-content');
  if (!container) return;
  
  const retryHtml = `
    <div class="nl-retry-section">
      <div class="nl-retry-info">
        <strong>${sections.length} section(s) failed to generate.</strong>
        You can retry generating these sections or continue with the current story.
      </div>
      <button class="btn primary" onclick="retryFailedSections()">
        Retry Failed Sections (${sections.length})
      </button>
    </div>
  `;
  
  container.innerHTML += retryHtml;
  
  // Store failed sections globally for retry
  window._failedSections = sections;
}

/**
 * Retry generating failed sections
 */
window.retryFailedSections = async function() {
  const sections = window._failedSections;
  if (!sections || !sections.length) {
    showNotification?.('No failed sections to retry', 'info');
    return;
  }

  if (isRetryingFailedSections) {
    cancelRetryGeneration(true);
    return;
  }

  const retryBtn = document.querySelector('.nl-retry-section .btn');
  if (retryBtn) {
    retryBtn.disabled = false;
    retryBtn.classList.add('danger');
    retryBtn.textContent = 'Stop Retry';
  }

  isRetryingFailedSections = true;
  retryController = new AbortController();

  try {
    const response = await fetch('/v1/generate/nl-story/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        failedSections: sections,
        storyName: state.project.name,
        options: getGenerationOptions()
      }),
      signal: retryController.signal
    });
    
    if (!response.ok) {
      throw new Error('Retry request failed');
    }
    
    const data = await response.json();
    
    // Update display with retried content
    let successCount = 0;
    for (const result of data.results) {
      if (result.success) {
        successCount++;
        // Replace failed section placeholder with new content
        const sectionEl = document.querySelector(`[data-section-id="${result.id}"]`);
        if (sectionEl) {
          const newHtml = parseMarkdown(result.content);
          sectionEl.outerHTML = newHtml;
        }
        
        // Update stored story
        const currentStory = getGeneratedStory() || '';
        const placeholder = `[Generation failed: ${result.error || result.id}]`;
        if (currentStory.includes(placeholder)) {
          setGeneratedStory(currentStory.replace(placeholder, result.content));
        }
      }
    }
    
    // Remove retry section if all succeeded
    const stillFailed = data.results.filter(r => !r.success);
    if (stillFailed.length === 0) {
      document.querySelector('.nl-retry-section')?.remove();
      showNotification?.(`All ${successCount} sections regenerated successfully!`, 'success');
    } else {
      showNotification?.(`${successCount} sections regenerated, ${stillFailed.length} still failed`, 'warning');
      window._failedSections = stillFailed;
    }
    
  } catch (err) {
    if (isAbortError(err)) {
      showNotification?.('Retry cancelled.', 'warning');
      return;
    }

    console.error('Retry error:', err);
    showNotification?.('Retry failed: ' + err.message, 'error');
  } finally {
    isRetryingFailedSections = false;
    retryController = null;
    const activeRetryBtn = document.querySelector('.nl-retry-section .btn');
    if (activeRetryBtn) {
      activeRetryBtn.disabled = false;
      activeRetryBtn.classList.remove('danger');
      const remaining = window._failedSections?.length || sections.length;
      activeRetryBtn.textContent = `Retry Failed Sections (${remaining})`;
    }
  }
};

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
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.classList.add('danger');
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Stop Story';
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
        <button class="btn danger" id="btn-nl-stop-inline">Stop Generation</button>
      </div>
    `;

    bindNLStopButton();
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
          <div class="nl-streaming-actions">
            <button class="btn danger small" id="btn-nl-stop-inline">Stop Generation</button>
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

  bindNLStopButton();
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
    btn.classList.remove('danger');
    updateNLGenerateButton();
  }
  
  // Re-enable other buttons
  $('#btn-nl-copy')?.removeAttribute('disabled');
  $('#btn-nl-export')?.removeAttribute('disabled');
}

function bindNLStopButton() {
  const inlineStopBtn = $('#btn-nl-stop-inline');
  if (inlineStopBtn) {
    inlineStopBtn.onclick = () => cancelNLGeneration(true);
  }
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

  if (isGenerating) {
    btn.textContent = 'Stop Story';
    btn.classList.add('danger');
    return;
  }

  btn.classList.remove('danger');
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
  if (isGenerating) {
    cancelNLGeneration(false);
  }
  if (isRetryingFailedSections) {
    cancelRetryGeneration(false);
  }

  hasGeneratedNL = false;
  isGenerating = false;
  activeGeneration = null;
  isRetryingFailedSections = false;
  retryController = null;
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

window.cancelNLGeneration = () => cancelNLGeneration(true);

// Re-export for external use
export { loadStoryVersions, openBookPreview, closeBookPreview };
export default generateNLStory;
