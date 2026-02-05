/**
 * SCRIPTA LLM Generator Service
 * 
 * Integrates with AchillesAgentLib for LLM-based story generation.
 * Generates CNL specifications and story refinements.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to import AchillesAgentLib
let LLMAgent = null;
let agentAvailable = false;
let listModelsFromCache = null;
let defaultLLMInvokerStrategy = null;

try {
  const achillesPath = path.resolve(__dirname, '../../../AchillesAgentLib/index.mjs');
  const achilles = await import(achillesPath);
  LLMAgent = achilles.LLMAgent;
  agentAvailable = true;
  console.log('[LLM Generator] AchillesAgentLib loaded successfully');
  
  // Load LLMClient for model listing
  const llmClientPath = path.resolve(__dirname, '../../../AchillesAgentLib/utils/LLMClient.mjs');
  const llmClient = await import(llmClientPath);
  listModelsFromCache = llmClient.listModelsFromCache;
  defaultLLMInvokerStrategy = llmClient.defaultLLMInvokerStrategy;
} catch (err) {
  console.log('[LLM Generator] AchillesAgentLib not available:', err.message);
  console.log('[LLM Generator] LLM generation features will be disabled');
}

// ============================================
// SUPPORTED LANGUAGES
// ============================================

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English' },
  fr: { name: 'French', native: 'Français' },
  es: { name: 'Spanish', native: 'Español' },
  pt: { name: 'Portuguese', native: 'Português' },
  it: { name: 'Italian', native: 'Italiano' },
  de: { name: 'German', native: 'Deutsch' },
  ro: { name: 'Romanian', native: 'Română' }
};

// ============================================
// PROMPT TEMPLATES
// ============================================

const PROMPTS = {
  generateStory: (options) => `You are a story specification generator for SCRIPTA, a visual story composer.
Generate a story specification in CNL (Controlled Natural Language) format based on these parameters:

Genre: ${options.genre}
Length: ${options.length} (short=3-5 scenes, medium=8-12 scenes, long=15-20 scenes)
Number of characters: ${options.characters} (few=2-3, medium=4-6, many=7-10)
Tone: ${options.tone}
Complexity: ${options.complexity}
World rules: ${options.worldRules}
Story name: ${options.storyName || 'Untitled Story'}

Generate a complete story specification with:
1. Characters with archetypes (hero, mentor, shadow, ally, trickster) and traits
2. Locations with geography and atmosphere
3. Plot elements (objects, secrets, events) that drive the story
4. Relationships between characters
5. Chapter and scene structure
6. Key dialogues and their purposes

Output format - respond with valid JSON:
{
  "project": {
    "name": "Story Title",
    "libraries": {
      "characters": [{"id": "char_1", "name": "Name", "archetype": "hero", "traits": ["brave", "curious"]}],
      "locations": [{"id": "loc_1", "name": "Location", "geography": "forest", "characteristics": ["mysterious"]}],
      "objects": [{"id": "obj_1", "name": "Plot Element", "objectType": "artifact", "significance": "central"}],
      "relationships": [{"id": "rel_1", "fromId": "char_1", "toId": "char_2", "type": "mentor_student"}],
      "themes": [{"id": "theme_1", "name": "Redemption", "themeKey": "redemption"}],
      "moods": [{"id": "mood_1", "name": "Mysterious", "emotions": {"mystery": 3, "tension": 2}}],
      "worldRules": [{"id": "rule_1", "name": "Magic Rule", "category": "magic", "description": "Details"}],
      "dialogues": []
    },
    "structure": {
      "id": "book_1",
      "type": "book",
      "name": "Book",
      "title": "Story Title",
      "children": [
        {
          "id": "ch_1",
          "type": "chapter",
          "name": "Ch1",
          "title": "Chapter Title",
          "children": [
            {
              "id": "sc_1_1",
              "type": "scene",
              "name": "Sc1.1",
              "title": "Scene Title",
              "children": [
                {"id": "ref_1", "type": "character-ref", "name": "CharName", "refId": "char_1"},
                {"id": "ref_2", "type": "location-ref", "name": "LocName", "refId": "loc_1"}
              ]
            }
          ]
        }
      ]
    },
    "blueprint": {
      "arc": "heros_journey",
      "beatMappings": [],
      "tensionCurve": [],
      "subplots": []
    }
  }
}

Generate a coherent, engaging story that fits the genre and parameters.`,

  refineStory: (project, options) => `You are a story editor for SCRIPTA.
Review this story specification and suggest improvements:

Current story: ${project.name}
Genre: ${options.genre}

Current characters: ${JSON.stringify(project.libraries?.characters?.map(c => ({ name: c.name, archetype: c.archetype })))}
Current structure: ${project.structure?.children?.length || 0} chapters

Suggest improvements for:
1. Better scene titles that are evocative and genre-appropriate
2. Additional character traits that enhance their archetypes
3. Any missing plot elements that would strengthen the story

Output format - respond with valid JSON:
{
  "suggestions": {
    "sceneNames": { "scene_id": "New evocative title" },
    "characterTraits": { "char_id": ["additional_trait1", "additional_trait2"] },
    "plotElements": [{ "name": "New element", "type": "secret", "significance": "important" }]
  }
}`,

  generateNLFromCNL: (cnl, storyName, options) => {
    // Determine language instruction
    const langCode = options.language || 'en';
    const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
    const languageInstruction = langCode === 'en' 
      ? '' 
      : `\n\nIMPORTANT: Write the entire story in ${langInfo.name} (${langInfo.native}). All text, dialogue, and narration must be in ${langInfo.name}.`;
    
    // Custom prompt/instructions
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
- Show character emotions through actions and dialogue, not just telling
- Create smooth transitions between scenes
- Follow the chapter/scene structure from the CNL

IMPORTANT - USE ALL STORY ELEMENTS:
1. DIALOGUES: Include meaningful dialogue exchanges between characters in each chapter. Dialogue should reveal character personality, advance the plot, and create tension. Aim for at least 2-3 dialogue exchanges per chapter.
2. MOODS: Establish and transition between moods (atmospheres) as specified. Use sensory details, weather, lighting, and character reactions to convey the mood.
3. PATTERNS: If story patterns are specified (like "hero's journey", "rags to riches"), follow the pattern structure but implement it subtly through events, not explicitly naming it.
4. THEMES: Weave themes into the narrative through character choices, dialogue subtext, and symbolic elements - don't preach them directly.
5. WORLD RULES: If magical or special rules exist in this world, demonstrate them naturally through the story rather than explaining them.
6. WISDOM: If philosophical insights are specified, let characters discover them through experience, not exposition.

PACING INSTRUCTION:
- Don't rush! Build each scene with proper setup, development, and resolution.
- Let characters breathe, react, and interact naturally.
- Each chapter should feel complete while advancing the larger narrative.${languageInstruction}${customInstructions}

OUTPUT FORMAT (Markdown):
- Use "# ${storyName}" as the main title at the beginning
- Use "## Chapter X: Title" for chapter headers (h2)
- Use "### Scene Title" for scene breaks if needed (h3)
- Use "*text*" for emphasis and "**text**" for strong emphasis
- Use "> quote" for important quotes or epigraphs
- Use "---" for scene breaks or thematic pauses
- Write paragraphs separated by blank lines
- Format dialogue naturally within paragraphs
- Begin directly with the story - no meta-commentary
- Do not wrap the output in code blocks`;
  },

  // Prompt for improving an existing story version
  improveNLStory: (cnl, storyName, previousVersion, options) => {
    const langCode = options.language || 'en';
    const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
    const languageInstruction = langCode === 'en' 
      ? '' 
      : `\n\nIMPORTANT: Keep the story in ${langInfo.name} (${langInfo.native}). All text must remain in ${langInfo.name}.`;
    
    const customInstructions = options.customPrompt 
      ? `\n\nSPECIFIC IMPROVEMENT INSTRUCTIONS FROM AUTHOR:\n${options.customPrompt}` 
      : '';

    return `You are a skilled fiction editor and writer. Improve and enhance the following story while keeping its essence and structure intact.

STORY TITLE: ${storyName}

STORY SPECIFICATION (CNL) - The blueprint to follow:
${cnl}

CURRENT VERSION TO IMPROVE:
${previousVersion}

IMPROVEMENT GOALS:
1. Enhance prose quality - make descriptions more vivid and evocative
2. Deepen character voices - make dialogue more distinctive and natural
3. Strengthen emotional impact - show more, tell less
4. Improve pacing - ensure each scene has proper buildup and payoff
5. Add sensory details - sounds, smells, textures, lighting
6. Enhance transitions between scenes and chapters
7. Ensure all story elements from the CNL spec are properly utilized
8. Fix any awkward phrasing or repetitive language
${customInstructions}${languageInstruction}

IMPORTANT CONSTRAINTS:
- Maintain the same chapter/scene structure
- Keep the same characters and their essential traits
- Preserve the plot points and narrative arc
- Keep approximately the same length (you may expand up to 20% if it improves quality)
- Do not add new major plot elements not in the CNL spec

OUTPUT FORMAT (Markdown):
- Use "# ${storyName}" as the main title
- Use "## Chapter X: Title" for chapters
- Use "### Scene Title" for scene breaks
- Use *italics* and **bold** for emphasis
- Use > for quotes or epigraphs
- Use --- for scene breaks
- Output only the improved story, no commentary`;
  },

  // Prompt for generating a single scene (smaller, more reliable)
  generateScene: (sceneInfo, storyContext, options) => {
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
  },

  // Prompt for generating a single chapter
  generateChapter: (chapterInfo, storyContext, options) => {
    const langCode = options.language || 'en';
    const langInfo = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES.en;
    const languageInstruction = langCode === 'en' 
      ? '' 
      : `\n\nIMPORTANT: Write in ${langInfo.name} (${langInfo.native}). All text must be in ${langInfo.name}.`;
    
    const customInstructions = options.customPrompt 
      ? `\n\nADDITIONAL AUTHOR INSTRUCTIONS:\n${options.customPrompt}` 
      : '';

    // Build global elements section
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
1. DIALOGUE: Include at least 2-3 meaningful dialogue exchanges. Let characters speak naturally, revealing personality and advancing the plot.
2. MOOD: Establish the chapter's atmosphere through sensory details, not just stating emotions.
3. PACING: Don't rush! Build scenes properly:
   - Setup: Establish where we are and who's present
   - Development: Let events unfold naturally with character reactions
   - Resolution: Conclude with a hook or transition
4. GLOBAL ELEMENTS: Subtly incorporate themes and world rules - show, don't tell.
5. SHOW DON'T TELL: Demonstrate emotions through actions, dialogue, and body language.${languageInstruction}${customInstructions}

OUTPUT FORMAT (Markdown):
- Start with "## Chapter ${chapterInfo.number}: ${chapterInfo.title}" header (h2)
- Use "### Scene Title" for scene breaks if needed (h3)
- Use "*text*" for emphasis and "**text**" for strong emphasis
- Use "---" for scene breaks or thematic pauses
- Write paragraphs separated by blank lines
- No meta-commentary or explanations
- Do not wrap the output in code blocks`;
  }
};

// ============================================
// LLM GENERATION FUNCTIONS
// ============================================

/**
 * Generate a story specification using LLM
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated project data
 */
export async function generateStoryWithLLM(options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available. Check AchillesAgentLib installation and API keys.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryGenerator',
    systemPrompt: 'You are a creative story specification generator. Always respond with valid JSON.'
  });
  
  const prompt = PROMPTS.generateStory(options);
  
  const response = await agent.complete({
    prompt,
    mode: 'deep',  // Use deeper reasoning for creative tasks
    maxTokens: 4000
  });
  
  // Parse the response
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Refine an existing story with LLM suggestions
 * @param {Object} project - Current project data
 * @param {Object} options - Original generation options
 * @returns {Promise<Object>} Suggestions for improvement
 */
export async function refineStoryWithLLM(project, options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryRefiner',
    systemPrompt: 'You are a story editor. Suggest improvements. Always respond with valid JSON.'
  });
  
  const prompt = PROMPTS.refineStory(project, options);
  
  const response = await agent.complete({
    prompt,
    mode: 'fast',  // Quick refinement suggestions
    maxTokens: 2000
  });
  
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Generate or improve a prose story from CNL specification
 * @param {string} cnl - CNL specification
 * @param {string} storyName - Name of the story
 * @param {Object} options - Generation options
 * @param {string} options.previousVersion - Previous version text (for improvement)
 * @param {boolean} options.isImprovement - Whether this is an improvement request
 * @returns {Promise<Object>} Object containing the generated story text
 */
export async function generateNLFromCNL(cnl, storyName, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available. Configure AchillesAgentLib with a valid API key to generate narrative prose from CNL specifications.');
  }
  
  const isImprovement = options.isImprovement && options.previousVersion;
  
  const agent = new LLMAgent({
    name: isImprovement ? 'ScriptaStoryEditor' : 'ScriptaStoryWriter',
    systemPrompt: isImprovement 
      ? 'You are a skilled fiction editor. Improve stories while maintaining their essence. Output only the improved story text.'
      : 'You are a skilled fiction writer. Write compelling narrative prose based on story specifications. Output only the story text, no JSON or metadata.'
  });
  
  // Choose appropriate prompt based on improvement mode
  const prompt = isImprovement
    ? PROMPTS.improveNLStory(cnl, storyName, options.previousVersion, options)
    : PROMPTS.generateNLFromCNL(cnl, storyName, options);
  
  // Build complete options with optional model selection
  const completeOptions = {
    prompt,
    mode: 'deep',  // Use deeper reasoning for creative writing
    maxTokens: 8000  // Allow for longer stories
  };
  
  // Add model if specified
  if (options.model) {
    completeOptions.model = options.model;
  }
  
  const response = await agent.complete(completeOptions);
  
  // Check if response indicates truncation (finish_reason)
  if (response.finish_reason === 'length' || response.finishReason === 'length') {
    throw new Error('Story was truncated due to token limit. Try generating chapter by chapter.');
  }
  
  const content = response.content || response.text || response;
  
  if (!content || typeof content !== 'string') {
    throw new Error('LLM returned empty or invalid response');
  }
  
  const trimmedContent = content.trim();
  
  // Validate response has meaningful content
  if (trimmedContent.length < 500) {
    throw new Error(`Story content too short (${trimmedContent.length} chars). Generation may have failed.`);
  }
  
  // Check for truncated content (ends mid-word)
  const lastChar = trimmedContent.slice(-1);
  const last50 = trimmedContent.slice(-50);
  const endsWithIncompleteWord = /[a-zA-Z]$/.test(trimmedContent) && !['.', '!', '?', '"', "'", '—', '…', '*', '_', '\n'].includes(lastChar);
  
  if (endsWithIncompleteWord) {
    console.error(`[LLM Generator] Story truncated mid-word: "...${last50}"`);
    throw new Error('Story was truncated mid-word. LLM may have hit token limit.');
  }
  
  return { story: trimmedContent };
}

/**
 * Generate a single chapter from CNL specification
 * @param {Object} chapterInfo - Chapter info (number, title, cnl, characters, locations)
 * @param {Object} storyContext - Story context (storyName, previousSummary)
 * @param {Object} options - Generation options (style, tone, language, model, customPrompt)
 * @returns {Promise<Object>} Object containing the generated chapter text
 */
export async function generateChapter(chapterInfo, storyContext, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaChapterWriter',
    systemPrompt: 'You are a skilled fiction writer. Write one chapter at a time. Output only the chapter text in Markdown format, no JSON or metadata. CRITICAL: Always complete the chapter fully - never stop mid-sentence, mid-word, or mid-paragraph. End with a complete thought.'
  });
  
  const prompt = PROMPTS.generateChapter(chapterInfo, storyContext, options);
  
  const completeOptions = {
    prompt,
    mode: 'deep',
    maxTokens: 6000  // Increased further for longer chapters
  };
  
  if (options.model) {
    completeOptions.model = options.model;
  }
  
  const response = await agent.complete(completeOptions);
  
  // Check if response indicates truncation (finish_reason)
  if (response.finish_reason === 'length' || response.finishReason === 'length') {
    throw new Error('Chapter was truncated due to token limit. Try a shorter chapter or different model.');
  }
  
  const content = response.content || response.text || response;
  
  if (!content || typeof content !== 'string') {
    throw new Error('LLM returned empty or invalid response');
  }
  
  const trimmedContent = content.trim();
  
  // Minimum length check
  if (trimmedContent.length < 200) {
    throw new Error(`Chapter content too short (${trimmedContent.length} chars). Generation may have failed.`);
  }
  
  // Check for truncated content (ends mid-word or mid-sentence)
  const lastChar = trimmedContent.slice(-1);
  const properEndings = ['.', '!', '?', '"', "'", '—', '…', '*', '_', '\n'];
  
  // More aggressive truncation detection
  const last50 = trimmedContent.slice(-50);
  const endsWithIncompleteWord = /[a-zA-Z]$/.test(trimmedContent) && !properEndings.includes(lastChar);
  const endsWithOpenQuote = (trimmedContent.match(/"/g) || []).length % 2 !== 0;
  
  if (endsWithIncompleteWord) {
    console.error(`[LLM Generator] Chapter truncated mid-word: "...${last50}"`);
    throw new Error('Chapter was truncated mid-word. LLM may have hit token limit.');
  }
  
  if (endsWithOpenQuote) {
    console.warn(`[LLM Generator] Chapter may have unclosed quotes: "...${last50}"`);
    // Don't throw - might be intentional stylistic choice
  }
  
  if (!properEndings.includes(lastChar)) {
    console.warn(`[LLM Generator] Chapter ends unusually: "...${last50}"`);
    // Log but don't throw - some valid content may end with special chars
  }
  
  return { chapter: trimmedContent };
}

/**
 * Generate a single scene from CNL specification (smaller, more reliable than chapters)
 * @param {Object} sceneInfo - Scene info (title, chapterNumber, chapterTitle, cnl, characters, location, mood)
 * @param {Object} storyContext - Story context (storyName, previousSummary)
 * @param {Object} options - Generation options (style, tone, language, model, customPrompt)
 * @returns {Promise<Object>} Object containing the generated scene text
 */
export async function generateScene(sceneInfo, storyContext, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaSceneWriter',
    systemPrompt: 'You are a skilled fiction writer. Write one scene at a time. Output only the scene text in Markdown format. CRITICAL: Always complete the scene fully - never stop mid-sentence or mid-word.'
  });
  
  const prompt = PROMPTS.generateScene(sceneInfo, storyContext, options);
  
  const completeOptions = {
    prompt,
    mode: 'deep',
    maxTokens: 2000  // Smaller for scenes
  };
  
  if (options.model) {
    completeOptions.model = options.model;
  }
  
  const response = await agent.complete(completeOptions);
  
  // Check if response indicates truncation
  if (response.finish_reason === 'length' || response.finishReason === 'length') {
    throw new Error('Scene was truncated due to token limit.');
  }
  
  const content = response.content || response.text || response;
  
  if (!content || typeof content !== 'string') {
    throw new Error('LLM returned empty or invalid response');
  }
  
  const trimmedContent = content.trim();
  
  // Minimum length check (scenes are shorter)
  if (trimmedContent.length < 100) {
    throw new Error(`Scene content too short (${trimmedContent.length} chars).`);
  }
  
  // Check for truncated content
  const lastChar = trimmedContent.slice(-1);
  const properEndings = ['.', '!', '?', '"', "'", '—', '…', '*', '_', '\n'];
  const endsWithIncompleteWord = /[a-zA-Z]$/.test(trimmedContent) && !properEndings.includes(lastChar);
  
  if (endsWithIncompleteWord) {
    const last50 = trimmedContent.slice(-50);
    console.error(`[LLM Generator] Scene truncated mid-word: "...${last50}"`);
    throw new Error('Scene was truncated mid-word.');
  }
  
  return { scene: trimmedContent };
}

/**
 * Wrapper with retry logic for generation functions
 * @param {Function} generatorFn - The generation function to call
 * @param {Array} args - Arguments to pass to the function
 * @param {number} maxRetries - Maximum number of retries (default 1)
 * @param {number} timeout - Timeout in ms (default 60000)
 * @returns {Promise<Object>} Result from the generation function
 */
export async function withRetry(generatorFn, args, maxRetries = 1, timeout = 60000) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Generation timed out')), timeout);
      });
      
      // Race between generation and timeout
      const result = await Promise.race([
        generatorFn(...args),
        timeoutPromise
      ]);
      
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[LLM Generator] Attempt ${attempt + 1} failed:`, err.message);
      
      // Don't retry on certain errors
      if (err.message.includes('API key') || 
          err.message.includes('not available') ||
          err.message.includes('authentication')) {
        throw err;
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  throw lastError;
}

/**
 * Get list of available LLM models
 * @returns {Object} Object with fast and deep model arrays
 */
export function getAvailableModels() {
  if (!agentAvailable || !listModelsFromCache) {
    return { fast: [], deep: [], available: false };
  }
  
  try {
    const models = listModelsFromCache();
    return {
      fast: models.fast.map(m => ({
        name: m.name,
        provider: m.providerKey,
        qualifiedName: m.qualifiedName || `${m.providerKey}/${m.name}`
      })),
      deep: models.deep.map(m => ({
        name: m.name,
        provider: m.providerKey,
        qualifiedName: m.qualifiedName || `${m.providerKey}/${m.name}`
      })),
      available: true
    };
  } catch (err) {
    console.error('[LLM Generator] Error getting models:', err.message);
    return { fast: [], deep: [], available: false };
  }
}

/**
 * Get supported languages
 * @returns {Object} Object with language codes and names
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
function parseJSONResponse(content) {
  if (typeof content !== 'string') {
    return content;
  }
  
  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  }
  
  // Try to find JSON object in response
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    content = content.substring(jsonStart, jsonEnd + 1);
  }
  
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse LLM response as JSON:', err.message);
    throw new Error('Invalid JSON response from LLM');
  }
}

/**
 * Check if LLM is available
 */
export function isLLMAvailable() {
  return agentAvailable;
}

export default {
  generateStoryWithLLM,
  refineStoryWithLLM,
  generateNLFromCNL,
  generateChapter,
  generateScene,
  withRetry,
  isLLMAvailable,
  getAvailableModels,
  getSupportedLanguages,
  SUPPORTED_LANGUAGES
};
