/**
 * SCRIPTA SDK - NL (Natural Language) Story Generator
 * 
 * Generates prose from CNL specifications.
 * This module handles the generation strategy and error recovery.
 * Actual LLM calls are delegated to an injected provider.
 */

// ============================================
// SUPPORTED LANGUAGES
// ============================================

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English' },
  fr: { name: 'French', native: 'Français' },
  es: { name: 'Spanish', native: 'Español' },
  pt: { name: 'Portuguese', native: 'Português' },
  it: { name: 'Italian', native: 'Italiano' },
  de: { name: 'German', native: 'Deutsch' },
  ro: { name: 'Romanian', native: 'Română' }
};

// ============================================
// GENERATION RESULT TYPES
// ============================================

/**
 * @typedef {Object} GenerationSection
 * @property {string} id - Unique section identifier
 * @property {string} type - 'chapter' or 'scene'
 * @property {number} chapterNumber - Chapter number
 * @property {number} [sceneNumber] - Scene number (if type is 'scene')
 * @property {string} title - Section title
 * @property {string} cnl - CNL specification for this section
 * @property {string} [content] - Generated content (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {boolean} success - Whether generation succeeded
 * @property {number} [retryCount] - Number of retries attempted
 */

/**
 * @typedef {Object} GenerationResult
 * @property {boolean} success - Overall success
 * @property {string} fullStory - Complete generated story
 * @property {GenerationSection[]} sections - All sections with status
 * @property {GenerationSection[]} failedSections - Failed sections for retry
 * @property {Object} stats - Generation statistics
 */

// ============================================
// PROMPT TEMPLATES
// ============================================

/**
 * Build prompt for scene generation
 */
export function buildScenePrompt(sceneInfo, storyContext, options = {}) {
  const langCode = options.language || 'en';
  const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
  const languageInstruction = langCode === 'en' 
    ? '' 
    : `\n\nIMPORTANT: Write in ${langInfo.name} (${langInfo.native}). All text must be in ${langInfo.name}.`;
  
  const customInstructions = options.customPrompt 
    ? `\n\nADDITIONAL AUTHOR INSTRUCTIONS:\n${options.customPrompt}` 
    : '';

  return `You are a skilled fiction writer. Write ONLY Scene "${sceneInfo.title}" from Chapter ${sceneInfo.chapterNumber}: "${sceneInfo.chapterTitle}".

STORY TITLE: ${storyContext.storyName}

PREVIOUS CONTEXT:
${storyContext.previousSummary || 'This is the opening scene.'}

THIS SCENE'S SPECIFICATION:
${sceneInfo.cnl}

CHARACTERS IN THIS SCENE:
${sceneInfo.characters || 'See scene specification.'}

LOCATION:
${sceneInfo.location || 'See scene specification.'}

MOOD:
${sceneInfo.mood || 'Establish appropriate atmosphere.'}

WRITING GUIDELINES:
- Style: ${options.style || 'narrative'} prose
- Tone: ${options.tone || 'literary'}
- Length: ${options.sceneLength || '200-400 words'} for this scene
- Include at least 1-2 meaningful dialogue exchanges if characters are present
- End with a natural transition point

CRITICAL: Complete the scene fully. Never stop mid-sentence or mid-word.${languageInstruction}${customInstructions}

OUTPUT FORMAT (Markdown):
- Start with "### ${sceneInfo.title}" header (h3)
- Use paragraphs separated by blank lines
- No meta-commentary
- Do not wrap in code blocks`;
}

/**
 * Build prompt for chapter generation  
 */
export function buildChapterPrompt(chapterInfo, storyContext, options = {}) {
  const langCode = options.language || 'en';
  const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
  const languageInstruction = langCode === 'en' 
    ? '' 
    : `\n\nIMPORTANT: Write in ${langInfo.name} (${langInfo.native}). All text must be in ${langInfo.name}.`;
  
  const customInstructions = options.customPrompt 
    ? `\n\nADDITIONAL AUTHOR INSTRUCTIONS:\n${options.customPrompt}` 
    : '';

  const globalElements = storyContext.globalElements || {};
  const globalSection = `
GLOBAL STORY ELEMENTS (use subtly throughout):
- Themes: ${globalElements.themes || 'See story specification'}
- World Rules: ${globalElements.worldRules || 'Standard reality'}
- Patterns: ${globalElements.patterns || 'Natural story flow'}
- Overall Mood Arc: ${globalElements.moodArc || 'Follow scene moods'}`;

  return `You are a skilled fiction writer. Write ONLY Chapter ${chapterInfo.number}: "${chapterInfo.title}" of this story.

STORY TITLE: ${storyContext.storyName}

PREVIOUS CHAPTERS SUMMARY:
${storyContext.previousSummary || 'This is the first chapter.'}
${globalSection}

THIS CHAPTER'S SPECIFICATION:
${chapterInfo.cnl}

CHARACTERS IN THIS CHAPTER:
${chapterInfo.characters || 'See chapter specification.'}

LOCATIONS:
${chapterInfo.locations || 'See chapter specification.'}

MOODS FOR THIS CHAPTER:
${chapterInfo.moods || 'Establish appropriate atmosphere based on events.'}

DIALOGUES TO INCLUDE:
${chapterInfo.dialogues || 'Create natural dialogue exchanges between characters present.'}

WRITING GUIDELINES:
- Style: ${options.style || 'narrative'} prose
- Tone: ${options.tone || 'literary'}
- Length: ${options.chapterLength || '400-800 words'} for this chapter
- Maintain consistency with previous chapters
- End the chapter with a hook or transition to the next

IMPORTANT - CHAPTER CONSTRUCTION:
1. DIALOGUE: Include at least 2-3 meaningful dialogue exchanges.
2. MOOD: Establish the chapter's atmosphere through sensory details.
3. PACING: Don't rush! Build scenes properly.
4. SHOW DON'T TELL: Demonstrate emotions through actions and dialogue.${languageInstruction}${customInstructions}

OUTPUT FORMAT (Markdown):
- Start with "## Chapter ${chapterInfo.number}: ${chapterInfo.title}" header (h2)
- Use "### Scene Title" for scene breaks if needed (h3)
- Use paragraphs separated by blank lines
- No meta-commentary
- Do not wrap in code blocks`;
}

/**
 * Build prompt for full story generation
 */
export function buildFullStoryPrompt(cnl, storyName, options = {}) {
  const langCode = options.language || 'en';
  const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
  const languageInstruction = langCode === 'en' 
    ? '' 
    : `\n\nIMPORTANT: Write the entire story in ${langInfo.name} (${langInfo.native}).`;
  
  const customInstructions = options.customPrompt 
    ? `\n\nADDITIONAL AUTHOR INSTRUCTIONS:\n${options.customPrompt}` 
    : '';

  return `You are a skilled fiction writer. Transform this story specification (CNL format) into compelling narrative prose.

STORY TITLE: ${storyName}

STORY SPECIFICATION (CNL):
${cnl}

WRITING GUIDELINES:
- Style: ${options.style || 'narrative'} prose
- Tone: ${options.tone || 'literary'} 
- Length: ${options.length === 'short' ? '500-1000 words' : options.length === 'full' ? '2000-4000 words' : '1000-2000 words'}
- Write in third person past tense unless the CNL specifies otherwise
- Include vivid descriptions of locations and characters
- Show character emotions through actions and dialogue
- Create smooth transitions between scenes
- Follow the chapter/scene structure from the CNL

IMPORTANT - USE ALL STORY ELEMENTS:
1. DIALOGUES: Include meaningful dialogue exchanges in each chapter.
2. MOODS: Establish and transition between moods as specified.
3. THEMES: Weave themes into the narrative through character choices.
4. WORLD RULES: Demonstrate them naturally through the story.${languageInstruction}${customInstructions}

OUTPUT FORMAT (Markdown):
- Use "# ${storyName}" as the main title at the beginning
- Use "## Chapter X: Title" for chapter headers (h2)
- Use "### Scene Title" for scene breaks if needed (h3)
- Use paragraphs separated by blank lines
- Begin directly with the story - no meta-commentary
- Do not wrap the output in code blocks`;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate generated content is complete (not truncated)
 */
export function validateContent(content, minLength = 100) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Empty or invalid response' };
  }
  
  const trimmed = content.trim();
  
  if (trimmed.length < minLength) {
    return { valid: false, error: `Content too short (${trimmed.length} chars, min ${minLength})` };
  }
  
  // Check for truncation (ends mid-word)
  const lastChar = trimmed.slice(-1);
  const properEndings = ['.', '!', '?', '"', "'", '—', '…', '*', '_', '\n'];
  const endsWithIncompleteWord = /[a-zA-Z]$/.test(trimmed) && !properEndings.includes(lastChar);
  
  if (endsWithIncompleteWord) {
    return { valid: false, error: 'Content truncated mid-word', truncated: true };
  }
  
  return { valid: true };
}

// ============================================
// STREAMING STORY GENERATOR
// ============================================

/**
 * Generate story scene by scene with streaming callbacks
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.cnl - Full CNL specification
 * @param {string} params.storyName - Story name
 * @param {Object} params.options - Generation options
 * @param {Array} params.scenes - Scene definitions [{chapterNumber, chapterTitle, sceneNumber, title, cnl, ...}]
 * @param {Object} callbacks - Streaming callbacks
 * @param {Function} callbacks.onStart - Called when generation starts
 * @param {Function} callbacks.onSceneStart - Called when a scene starts generating
 * @param {Function} callbacks.onSceneComplete - Called when a scene completes
 * @param {Function} callbacks.onSceneError - Called when a scene fails
 * @param {Function} callbacks.onComplete - Called when all generation is done
 * @param {Object} llmProvider - LLM provider with generateText(prompt, options) method
 * @returns {Promise<GenerationResult>}
 */
export async function generateStoryByScenes(params, callbacks, llmProvider) {
  const { cnl, storyName, options = {}, scenes = [] } = params;
  const { onStart, onSceneStart, onSceneComplete, onSceneError, onComplete } = callbacks;
  
  if (!llmProvider || typeof llmProvider.generateText !== 'function') {
    throw new Error('LLM provider with generateText method is required');
  }
  
  const result = {
    success: true,
    fullStory: '',
    sections: [],
    failedSections: [],
    stats: { total: scenes.length, completed: 0, failed: 0, retried: 0 }
  };
  
  // Notify start
  onStart?.({ totalScenes: scenes.length, storyName });
  
  let previousSummary = '';
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const sceneId = `ch${scene.chapterNumber}_sc${scene.sceneNumber || i + 1}`;
    
    const section = {
      id: sceneId,
      type: 'scene',
      chapterNumber: scene.chapterNumber,
      sceneNumber: scene.sceneNumber || i + 1,
      title: scene.title,
      cnl: scene.cnl,
      success: false,
      retryCount: 0
    };
    
    onSceneStart?.({
      sceneId,
      sceneNumber: i + 1,
      totalScenes: scenes.length,
      chapterNumber: scene.chapterNumber,
      title: scene.title,
      progress: Math.round((i / scenes.length) * 100)
    });
    
    // Try generating with retry
    let success = false;
    let lastError = null;
    
    for (let attempt = 0; attempt <= 1; attempt++) { // 1 retry
      try {
        const prompt = buildScenePrompt(
          {
            title: scene.title,
            chapterNumber: scene.chapterNumber,
            chapterTitle: scene.chapterTitle,
            cnl: scene.cnl,
            characters: scene.characters,
            location: scene.location,
            mood: scene.mood
          },
          { storyName, previousSummary },
          options
        );
        
        const content = await llmProvider.generateText(prompt, {
          maxTokens: 2000,
          timeout: 60000
        });
        
        const validation = validateContent(content, 100);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        section.content = content.trim();
        section.success = true;
        section.retryCount = attempt;
        success = true;
        
        // Update context for next scene
        previousSummary += `\n${scene.title}: ${content.substring(0, 150)}...`;
        
        if (attempt > 0) {
          result.stats.retried++;
        }
        
        break;
      } catch (err) {
        lastError = err;
        section.retryCount = attempt + 1;
        
        // Don't retry on certain errors
        if (err.message.includes('API key') || 
            err.message.includes('authentication') ||
            err.message.includes('not available')) {
          break;
        }
        
        // Wait before retry
        if (attempt < 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    
    if (success) {
      result.stats.completed++;
      result.fullStory += (result.fullStory ? '\n\n' : '') + section.content;
      
      onSceneComplete?.({
        sceneId,
        sceneNumber: i + 1,
        content: section.content,
        progress: Math.round(((i + 1) / scenes.length) * 100)
      });
    } else {
      result.stats.failed++;
      section.error = lastError?.message || 'Unknown error';
      result.failedSections.push(section);
      
      // Add placeholder with CNL reference
      const failurePlaceholder = `\n\n### ${scene.title}\n\n[Generation failed: ${section.error}]\n\n<!-- CNL for retry:\n${scene.cnl}\n-->`;
      result.fullStory += failurePlaceholder;
      
      onSceneError?.({
        sceneId,
        sceneNumber: i + 1,
        title: scene.title,
        error: section.error,
        cnl: scene.cnl,
        progress: Math.round(((i + 1) / scenes.length) * 100)
      });
    }
    
    result.sections.push(section);
  }
  
  result.success = result.stats.failed === 0;
  
  onComplete?.(result);
  
  return result;
}

/**
 * Generate story chapter by chapter
 */
export async function generateStoryByChapters(params, callbacks, llmProvider) {
  const { cnl, storyName, options = {}, chapters = [] } = params;
  const { onStart, onChapterStart, onChapterComplete, onChapterError, onComplete } = callbacks;
  
  if (!llmProvider || typeof llmProvider.generateText !== 'function') {
    throw new Error('LLM provider with generateText method is required');
  }
  
  const result = {
    success: true,
    fullStory: '',
    sections: [],
    failedSections: [],
    stats: { total: chapters.length, completed: 0, failed: 0, retried: 0 }
  };
  
  onStart?.({ totalChapters: chapters.length, storyName });
  
  let previousSummary = '';
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterId = `ch${i + 1}`;
    
    const section = {
      id: chapterId,
      type: 'chapter',
      chapterNumber: i + 1,
      title: chapter.title,
      cnl: chapter.cnl,
      success: false,
      retryCount: 0
    };
    
    onChapterStart?.({
      chapterId,
      chapterNumber: i + 1,
      totalChapters: chapters.length,
      title: chapter.title,
      progress: Math.round((i / chapters.length) * 100)
    });
    
    let success = false;
    let lastError = null;
    
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const prompt = buildChapterPrompt(
          {
            number: i + 1,
            title: chapter.title,
            cnl: chapter.cnl,
            characters: chapter.characters,
            locations: chapter.locations,
            moods: chapter.moods,
            dialogues: chapter.dialogues
          },
          { storyName, previousSummary },
          options
        );
        
        const content = await llmProvider.generateText(prompt, {
          maxTokens: 6000,
          timeout: 90000
        });
        
        const validation = validateContent(content, 200);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        section.content = content.trim();
        section.success = true;
        section.retryCount = attempt;
        success = true;
        
        previousSummary += `\nChapter ${i + 1}: ${chapter.title} - ${content.substring(0, 200)}...`;
        
        if (attempt > 0) result.stats.retried++;
        
        break;
      } catch (err) {
        lastError = err;
        section.retryCount = attempt + 1;
        
        if (err.message.includes('API key') || 
            err.message.includes('authentication') ||
            err.message.includes('not available')) {
          break;
        }
        
        if (attempt < 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    
    if (success) {
      result.stats.completed++;
      result.fullStory += (result.fullStory ? '\n\n' : '') + section.content;
      
      onChapterComplete?.({
        chapterId,
        chapterNumber: i + 1,
        content: section.content,
        progress: Math.round(((i + 1) / chapters.length) * 100)
      });
    } else {
      result.stats.failed++;
      section.error = lastError?.message || 'Unknown error';
      result.failedSections.push(section);
      
      const failurePlaceholder = `\n\n## Chapter ${i + 1}: ${chapter.title}\n\n[Generation failed: ${section.error}]\n\n<!-- CNL for retry:\n${chapter.cnl}\n-->`;
      result.fullStory += failurePlaceholder;
      
      onChapterError?.({
        chapterId,
        chapterNumber: i + 1,
        title: chapter.title,
        error: section.error,
        cnl: chapter.cnl,
        progress: Math.round(((i + 1) / chapters.length) * 100)
      });
    }
    
    result.sections.push(section);
  }
  
  result.success = result.stats.failed === 0;
  
  onComplete?.(result);
  
  return result;
}

/**
 * Regenerate specific failed sections
 */
export async function regenerateFailedSections(failedSections, storyContext, options, llmProvider) {
  const results = [];
  
  for (const section of failedSections) {
    const isScene = section.type === 'scene';
    const prompt = isScene
      ? buildScenePrompt(
          { title: section.title, chapterNumber: section.chapterNumber, cnl: section.cnl },
          storyContext,
          options
        )
      : buildChapterPrompt(
          { number: section.chapterNumber, title: section.title, cnl: section.cnl },
          storyContext,
          options
        );
    
    try {
      const content = await llmProvider.generateText(prompt, {
        maxTokens: isScene ? 2000 : 6000,
        timeout: isScene ? 60000 : 90000
      });
      
      const validation = validateContent(content, isScene ? 100 : 200);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      results.push({
        ...section,
        content: content.trim(),
        success: true,
        error: null
      });
    } catch (err) {
      results.push({
        ...section,
        success: false,
        error: err.message
      });
    }
  }
  
  return results;
}

export default {
  SUPPORTED_LANGUAGES,
  buildScenePrompt,
  buildChapterPrompt,
  buildFullStoryPrompt,
  validateContent,
  generateStoryByScenes,
  generateStoryByChapters,
  regenerateFailedSections
};
