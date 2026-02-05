/**
 * SCRIPTA Demo - LLM Provider Adapter
 * 
 * Thin adapter that connects SDK NL generation with AchillesAgentLib.
 * This module provides the LLM provider interface expected by the SDK.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Import SDK NL generator
import {
  SUPPORTED_LANGUAGES,
  buildFullStoryPrompt,
  validateContent,
  generateStoryByScenes,
  generateStoryByChapters,
  regenerateFailedSections
} from '../../src/generation/nl-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// ACHILLES LLM AGENT INTEGRATION
// ============================================

let LLMAgent = null;
let agentAvailable = false;
let listModelsFromCache = null;

try {
  const achillesPath = path.resolve(__dirname, '../../../AchillesAgentLib/index.mjs');
  const achilles = await import(achillesPath);
  LLMAgent = achilles.LLMAgent;
  agentAvailable = true;
  console.log('[LLM Provider] AchillesAgentLib loaded successfully');
  
  const llmClientPath = path.resolve(__dirname, '../../../AchillesAgentLib/utils/LLMClient.mjs');
  const llmClient = await import(llmClientPath);
  listModelsFromCache = llmClient.listModelsFromCache;
} catch (err) {
  console.log('[LLM Provider] AchillesAgentLib not available:', err.message);
  console.log('[LLM Provider] LLM generation features will be disabled');
}

// ============================================
// LLM PROVIDER (for SDK integration)
// ============================================

/**
 * LLM Provider that implements the interface expected by SDK
 */
const llmProvider = {
  /**
   * Generate text using LLM
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Options (maxTokens, timeout, model)
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    if (!agentAvailable) {
      throw new Error('LLM not available. Configure AchillesAgentLib with API keys.');
    }
    
    const agent = new LLMAgent({
      name: 'ScriptaGenerator',
      systemPrompt: 'You are a skilled fiction writer. Output only the story text in Markdown format. Never stop mid-sentence or mid-word. Always complete your response fully.'
    });
    
    const completeOptions = {
      prompt,
      mode: 'deep',
      maxTokens: options.maxTokens || 4000
    };
    
    if (options.model) {
      completeOptions.model = options.model;
    }
    
    // Create timeout wrapper
    const timeoutMs = options.timeout || 60000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Generation timed out')), timeoutMs);
    });
    
    const response = await Promise.race([
      agent.complete(completeOptions),
      timeoutPromise
    ]);
    
    // Check for truncation
    if (response.finish_reason === 'length' || response.finishReason === 'length') {
      throw new Error('Response truncated due to token limit');
    }
    
    const content = response.content || response.text || response;
    
    if (!content || typeof content !== 'string') {
      throw new Error('LLM returned empty or invalid response');
    }
    
    return content;
  }
};

// ============================================
// HIGH-LEVEL API (used by server routes)
// ============================================

/**
 * Check if LLM is available
 */
export function isLLMAvailable() {
  return agentAvailable;
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Get available LLM models
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
    console.error('[LLM Provider] Error getting models:', err.message);
    return { fast: [], deep: [], available: false };
  }
}

/**
 * Generate full story from CNL (single call, no streaming)
 */
export async function generateNLFromCNL(cnl, storyName, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM not available. Configure API keys.');
  }
  
  const prompt = buildFullStoryPrompt(cnl, storyName, options);
  
  const content = await llmProvider.generateText(prompt, {
    maxTokens: 8000,
    timeout: 120000,
    model: options.model
  });
  
  const validation = validateContent(content, 500);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return { story: content.trim() };
}

/**
 * Generate story by chapters with callbacks for streaming
 */
export async function generateStoryStreaming(params, callbacks) {
  if (!agentAvailable) {
    throw new Error('LLM not available. Configure API keys.');
  }
  
  // Use scene-level generation for better reliability
  if (params.scenes && params.scenes.length > 0) {
    return generateStoryByScenes(params, callbacks, llmProvider);
  }
  
  // Fall back to chapter-level
  if (params.chapters && params.chapters.length > 0) {
    return generateStoryByChapters(params, {
      onStart: callbacks.onStart,
      onChapterStart: callbacks.onSceneStart || callbacks.onChapterStart,
      onChapterComplete: callbacks.onSceneComplete || callbacks.onChapterComplete,
      onChapterError: callbacks.onSceneError || callbacks.onChapterError,
      onComplete: callbacks.onComplete
    }, llmProvider);
  }
  
  // No structure, generate full story
  const result = await generateNLFromCNL(params.cnl, params.storyName, params.options);
  
  callbacks.onComplete?.({
    success: true,
    fullStory: result.story,
    sections: [{ id: 'full', type: 'full', success: true, content: result.story }],
    failedSections: [],
    stats: { total: 1, completed: 1, failed: 0, retried: 0 }
  });
  
  return {
    success: true,
    fullStory: result.story,
    sections: [],
    failedSections: [],
    stats: { total: 1, completed: 1, failed: 0, retried: 0 }
  };
}

/**
 * Regenerate specific failed sections
 */
export async function retryFailedSections(failedSections, storyContext, options) {
  if (!agentAvailable) {
    throw new Error('LLM not available. Configure API keys.');
  }
  
  return regenerateFailedSections(failedSections, storyContext, options, llmProvider);
}

// ============================================
// LEGACY API (for backwards compatibility)
// ============================================

/**
 * Generate CNL specification with LLM (legacy)
 */
export async function generateStoryWithLLM(options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryGenerator',
    systemPrompt: 'You are a creative story specification generator. Always respond with valid JSON.'
  });
  
  // Build prompt for CNL generation (not NL story)
  const prompt = `Generate a story specification in JSON format for:
Genre: ${options.genre}
Length: ${options.length}
Characters: ${options.characters}
Tone: ${options.tone}
Complexity: ${options.complexity}
World rules: ${options.worldRules}
Story name: ${options.storyName || 'Untitled Story'}

Output valid JSON with project structure including characters, locations, objects, and chapter/scene structure.`;
  
  const response = await agent.complete({
    prompt,
    mode: 'deep',
    maxTokens: 4000
  });
  
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Refine story with LLM (legacy)
 */
export async function refineStoryWithLLM(project, options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryRefiner',
    systemPrompt: 'You are a story editor. Suggest improvements. Always respond with valid JSON.'
  });
  
  const prompt = `Review this story specification and suggest improvements:
Current story: ${project.name}
Genre: ${options.genre}
Current characters: ${JSON.stringify(project.libraries?.characters?.map(c => ({ name: c.name, archetype: c.archetype })))}

Output JSON with suggestions for scene names, character traits, and plot elements.`;
  
  const response = await agent.complete({
    prompt,
    mode: 'fast',
    maxTokens: 2000
  });
  
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Parse JSON from LLM response
 */
function parseJSONResponse(content) {
  if (typeof content !== 'string') return content;
  
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) content = jsonMatch[1].trim();
  
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

export default {
  isLLMAvailable,
  getSupportedLanguages,
  getAvailableModels,
  generateNLFromCNL,
  generateStoryStreaming,
  retryFailedSections,
  generateStoryWithLLM,
  refineStoryWithLLM,
  SUPPORTED_LANGUAGES
};
