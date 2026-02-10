/**
 * SCRIPTA Demo - LLM Provider Adapter
 *
 * Thin adapter that connects SDK NL generation with AchillesAgentLib.
 * This module provides the LLM provider interface expected by the SDK.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import {
  SUPPORTED_LANGUAGES,
  buildFullStoryPrompt,
  validateContent,
  generateStoryByScenes,
  generateStoryByChapters,
  regenerateFailedSections
} from '../../src/generation/nl-generator.mjs';
import { generateTextWithContinuation } from '../../src/generation/nl-generator-continuation.mjs';

import {
  buildJsonRepairPrompt,
  buildSpecsPrompt,
  normalizeSpecsProject,
  parseLLMJson
} from './llm-specs-json.mjs';

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

    const content = response?.content || response?.text || response;

    if (!content || typeof content !== 'string') {
      throw new Error('LLM returned empty or invalid response');
    }

    // Some providers return a finish reason; prefer returning partial content so
    // the SDK continuation logic can attempt a repair.
    if (response?.finish_reason === 'length' || response?.finishReason === 'length') {
      return content;
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

  const content = await generateTextWithContinuation({
    llmProvider,
    prompt,
    llmCallOptions: { maxTokens: 8000, timeout: 120000, model: options.model },
    continuationCallOptions: { maxTokens: 2400, timeout: 60000, model: options.model },
    validate: (text) => validateContent(text, 500),
    sectionLabel: `Full story "${storyName}"`,
    maxContinuations: 4,
    options
  });

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
      onChapterStart: callbacks.onChapterStart || callbacks.onSceneStart,
      onChapterComplete: callbacks.onChapterComplete || callbacks.onSceneComplete,
      onChapterError: callbacks.onChapterError || callbacks.onSceneError,
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
// SPECS JSON (Create Specs → With LLM)
// ============================================

function parseJSONResponse(content) {
  try {
    return parseLLMJson(content);
  } catch (err) {
    console.error('Failed to parse LLM response as JSON:', err.message);
    throw new Error('Invalid JSON response from LLM');
  }
}

function normalizeLLMAnnotations(value) {
  const allowed = new Set([
    'example', 'hint', 'style', 'avoid', 'voice', 'subtext',
    'sensory', 'pacing', 'reference', 'context', 'contrast', 'reveal'
  ]);

  const items = Array.isArray(value) ? value : [];
  const out = [];
  const seen = new Set();

  for (const item of items) {
    const type = String(item?.type || '').trim().toLowerCase();
    const content = String(item?.content ?? '').trim();
    if (!allowed.has(type) || !content) continue;

    const key = `${type}::${content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type, content });
  }

  return out;
}

function buildAnnotationPrompt(options, project) {
  const chars = (project?.libraries?.characters || []).slice(0, 8).map(c => c.name).filter(Boolean);
  const locs = (project?.libraries?.locations || []).slice(0, 6).map(l => l.name).filter(Boolean);
  const themes = (project?.libraries?.themes || []).slice(0, 6).map(t => t.name).filter(Boolean);
  const arc = project?.selectedArc || project?.blueprint?.arc || 'heros_journey';

  return `Generate CNL guidance annotations for narrative prose generation.

Return JSON only:
{
  "annotations": [
    { "type": "hint", "content": "..." },
    { "type": "style", "content": "..." }
  ]
}

Rules:
- 8 to 12 annotations.
- Use only types: hint, style, avoid, voice, subtext, sensory, pacing, reveal.
- Content must be precise, actionable, and consistent with declared entities.
- No markdown, no commentary.

Context:
- Story name: ${options?.storyName || options?.title || project?.name || 'Untitled Story'}
- Genre: ${options?.genre || 'unknown'}
- Tone: ${options?.tone || 'balanced'}
- Length: ${options?.length || 'medium'}
- Complexity: ${options?.complexity || 'medium'}
- Arc: ${arc}
- Characters: ${chars.join(', ') || 'none'}
- Locations: ${locs.join(', ') || 'none'}
- Themes: ${themes.join(', ') || 'none'}
`;
}

async function generateLLMAnnotations(options, project) {
  if (!agentAvailable) return [];

  const agent = new LLMAgent({
    name: 'ScriptaAnnotationGenerator',
    systemPrompt: 'You generate concise CNL annotations for story generation guidance. Return valid JSON only.'
  });

  const prompt = buildAnnotationPrompt(options, project);
  const completeOptions = {
    prompt,
    mode: 'fast',
    maxTokens: 1800
  };

  if (options?.model) {
    completeOptions.model = options.model;
  }

  try {
    const response = await agent.complete(completeOptions);
    const content = response?.content || response?.text || response;
    const parsed = parseJSONResponse(content);
    const annotations = normalizeLLMAnnotations(parsed?.annotations);
    return annotations;
  } catch (err) {
    console.warn('[LLM Provider] Annotation generation failed:', err?.message || err);
    return [];
  }
}

async function repairJsonWithLLM({ model, originalContent }) {
  const agent = new LLMAgent({
    name: 'ScriptaJSONRepair',
    systemPrompt: 'You repair JSON. Return valid JSON only. No markdown. No commentary.'
  });

  const completeOptions = {
    prompt: buildJsonRepairPrompt(originalContent),
    mode: 'fast',
    maxTokens: 5000
  };

  if (model) completeOptions.model = model;

  const response = await agent.complete(completeOptions);
  return response?.content || response?.text || response;
}

/**
 * Generate story specification as a project JSON payload
 */
export async function generateStoryWithLLM(options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available.');
  }

  const { systemPrompt, prompt } = buildSpecsPrompt({
    promptKey: options.promptKey,
    options
  });

  const agent = new LLMAgent({
    name: 'ScriptaStoryGenerator',
    systemPrompt
  });

  const completeOptions = {
    prompt,
    mode: 'deep',
    maxTokens: 6500
  };
  if (options.model) completeOptions.model = options.model;

  const response = await agent.complete(completeOptions);
  const content = response?.content || response?.text || response;

  let parsed;
  try {
    parsed = parseJSONResponse(content);
  } catch {
    const repairedText = await repairJsonWithLLM({
      model: options.model,
      originalContent: content
    });
    parsed = parseJSONResponse(repairedText);
  }

  const projectName = options.storyName || options.title || 'Untitled Story';
  const project = normalizeSpecsProject(parsed, projectName);
  if (!project) {
    throw new Error('LLM returned JSON but no project payload was found.');
  }

  const annotations = await generateLLMAnnotations(options, project);

  return { project, annotations };
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
    systemPrompt: 'You are a story editor. Return valid JSON only (no markdown, no commentary).'
  });

  const safeGenre = options?.genre || 'unknown';
  const safeName = project?.name || 'Untitled Story';
  const model = options?.model;

  const characters = (project?.libraries?.characters || [])
    .filter(c => c && typeof c === 'object')
    .slice(0, 12)
    .map(c => ({
      id: c.id,
      name: c.name,
      archetype: c.archetype,
      traits: Array.isArray(c.traits) ? c.traits.slice(0, 8) : []
    }));

  const collectScenes = () => {
    const structure = project?.structure;
    if (!structure || typeof structure !== 'object') return [];
    const chapters = Array.isArray(structure.children) ? structure.children : [];
    return chapters.slice(0, 12).map(ch => ({
      id: ch.id,
      name: ch.name,
      title: ch.title,
      scenes: (Array.isArray(ch.children) ? ch.children : []).slice(0, 20).map(sc => ({
        id: sc.id,
        name: sc.name,
        title: sc.title
      }))
    }));
  };

  const prompt = `Review this story specification and suggest compact, high-impact improvements.

Hard rules:
- Output JSON only. No markdown. No code blocks. No comments.
- Use double quotes for keys and strings.
- No trailing commas.

Return this exact shape:
{
  "suggestions": {
    "sceneNames": { "<sceneId>": "New scene title", "...": "..." },
    "characterTraits": { "<characterId>": ["trait1","trait2"], "...": [] },
    "plotElements": [{ "name": "Element", "description": "1-2 sentences" }]
  }
}

Story:
- Name: ${safeName}
- Genre: ${safeGenre}

Characters (IDs matter for characterTraits keys):
${JSON.stringify(characters)}

Structure (scene IDs matter for sceneNames keys):
${JSON.stringify(collectScenes())}
`;

  const completeOptions = {
    prompt,
    mode: 'fast',
    maxTokens: 2500
  };
  if (model) completeOptions.model = model;

  const response = await agent.complete(completeOptions);
  const content = response?.content || response?.text || response;

  let parsed;
  try {
    parsed = parseJSONResponse(content);
  } catch {
    const repairedText = await repairJsonWithLLM({
      model,
      originalContent: content
    });
    parsed = parseJSONResponse(repairedText);
  }

  const suggestions = (parsed && typeof parsed === 'object')
    ? (parsed.suggestions && typeof parsed.suggestions === 'object' ? parsed.suggestions : parsed)
    : { raw: parsed };

  return { suggestions };
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
