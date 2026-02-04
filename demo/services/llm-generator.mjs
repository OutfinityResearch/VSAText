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
 * Generate Natural Language prose story from CNL specification
 * @param {string} cnl - The CNL specification
 * @param {string} storyName - Story title
 * @param {Object} options - Generation options (style, tone, length, language, model, customPrompt)
 * @returns {Promise<Object>} Object containing the generated story text
 */
export async function generateNLFromCNL(cnl, storyName, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available. Configure AchillesAgentLib with a valid API key to generate narrative prose from CNL specifications.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryWriter',
    systemPrompt: 'You are a skilled fiction writer. Write compelling narrative prose based on story specifications. Output only the story text, no JSON or metadata.'
  });
  
  const prompt = PROMPTS.generateNLFromCNL(cnl, storyName, options);
  
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
  
  const content = response.content || response.text || response;
  
  // For NL generation, we expect plain text, not JSON
  return { story: content.trim() };
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
    systemPrompt: 'You are a skilled fiction writer. Write one chapter at a time. Output only the chapter text, no JSON or metadata.'
  });
  
  const prompt = PROMPTS.generateChapter(chapterInfo, storyContext, options);
  
  const completeOptions = {
    prompt,
    mode: 'deep',
    maxTokens: 2000
  };
  
  if (options.model) {
    completeOptions.model = options.model;
  }
  
  const response = await agent.complete(completeOptions);
  const content = response.content || response.text || response;
  
  return { chapter: content.trim() };
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
  isLLMAvailable,
  getAvailableModels,
  getSupportedLanguages,
  SUPPORTED_LANGUAGES
};
