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
  const achilles = await import('achillesAgentLib/LLMAgents');
  LLMAgent = achilles.LLMAgent;
  agentAvailable = true;
  console.log('[LLM Provider] AchillesAgentLib loaded successfully');

  const llmClient = await import('achillesAgentLib/utils/LLMClient.mjs');
  listModelsFromCache = llmClient.listModelsFromCache;
} catch (err) {
  console.log('[LLM Provider] AchillesAgentLib not available:', err.message);
  console.log('[LLM Provider] LLM generation features will be disabled');
}

const ERROR_TEXT_PATTERNS = [
  /all model invocations failed/i,
  /\bapi error\b/i,
  /\brate limit\b/i,
  /\bquota\b/i,
  /missing api key/i,
  /invalid api key/i,
  /\bfetch failed\b/i,
  /\bmodel\b.{0,40}\bnot\b.{0,20}\b(available|found|configured)\b/i,
  /^claude\s+opus\b.{0,60}\b(not|cannot|can't|unavailable)\b/i
];

function compactText(value, max = 220) {
  const txt = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (txt.length <= max) return txt;
  return `${txt.slice(0, max)}...`;
}

function isErrorLikeLLMText(value) {
  const txt = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!txt) return false;
  if (txt.length > 400) return false;
  return ERROR_TEXT_PATTERNS.some(re => re.test(txt));
}

function ensureUsableLLMText(value, contextLabel = 'LLM response') {
  if (!value || typeof value !== 'string') {
    throw new Error('LLM returned empty or invalid response');
  }

  if (isErrorLikeLLMText(value)) {
    throw new Error(`${contextLabel}: ${compactText(value)}`);
  }

  return value;
}

function hasUnbalancedJsonBrackets(text) {
  const src = String(text ?? '');
  let inString = false;
  let escape = false;
  let curly = 0;
  let square = 0;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') curly += 1;
    else if (ch === '}') curly -= 1;
    else if (ch === '[') square += 1;
    else if (ch === ']') square -= 1;
  }

  return inString || curly !== 0 || square !== 0;
}

function isLikelyTruncatedJsonError(error, content) {
  const msg = String(error?.message || '').toLowerCase();
  if (
    msg.includes('unterminated string') ||
    msg.includes('unexpected end of json') ||
    msg.includes('unexpected end of input') ||
    msg.includes('unexpected end')
  ) {
    return true;
  }

  const txt = String(content ?? '').trim();
  if (!txt) return false;
  if (!(txt.startsWith('{') || txt.startsWith('[') || txt.startsWith('```'))) return false;
  return hasUnbalancedJsonBrackets(txt);
}

async function completeWithTimeout(agent, completeOptions, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Generation timed out')), timeoutMs);
  });

  return Promise.race([
    agent.complete(completeOptions),
    timeoutPromise
  ]);
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

    const desiredMaxTokens = Number.isFinite(options.maxTokens) ? Number(options.maxTokens) : 4000;
    const baseCompleteOptions = {
      prompt,
      mode: 'deep',
      maxTokens: desiredMaxTokens,
      params: {
        max_tokens: desiredMaxTokens,
        max_completion_tokens: desiredMaxTokens
      }
    };

    const timeoutMs = options.timeout || 60000;

    const runCompletion = async (modelOverride) => {
      const completeOptions = { ...baseCompleteOptions };
      if (modelOverride) completeOptions.model = modelOverride;
      const response = await completeWithTimeout(agent, completeOptions, timeoutMs);
      const content = ensureUsableLLMText(
        response?.content || response?.text || response,
        'LLM provider returned an error message instead of generated content'
      );
      return { response, content };
    };

    try {
      const { response, content } = await runCompletion(options.model);

      // Some providers return a finish reason; prefer returning partial content so
      // the SDK continuation logic can attempt a repair.
      if (response?.finish_reason === 'length' || response?.finishReason === 'length') {
        return content;
      }

      return content;
    } catch (err) {
      if (!options.model) throw err;

      console.warn('[LLM Provider] Selected model failed, retrying with provider auto-selection:', err?.message || err);
      const { response, content } = await runCompletion(undefined);
      if (response?.finish_reason === 'length' || response?.finishReason === 'length') {
        return content;
      }
      return content;
    }
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
    const ALLOWED_PROVIDER = 'soul_gateway';
    const HIDDEN_MODELS = new Set([
      'kImi-k2.5', 'kimi-k2.5',
      'openrouter-gemini-3.1-pro', 'openrouter-gpt-5.3-codex',
      'copilot-opus-4.6',
    ]);
    // Copilot models included in Pro+ that don't consume premium requests
    const FREE_MODELS = new Set([
      'copilot-gpt-4o', 'copilot-gpt-4.1', 'copilot-gpt-5-mini',
    ]);
    const filterProvider = list => list
      .filter(m => m.providerKey === ALLOWED_PROVIDER && !HIDDEN_MODELS.has(m.name))
      .map(m => ({
        name: m.name,
        provider: m.providerKey,
        qualifiedName: m.qualifiedName || `${m.providerKey}/${m.name}`,
        free: FREE_MODELS.has(m.name),
      }));
    return {
      fast: filterProvider(models.fast),
      deep: filterProvider(models.deep),
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
  ensureUsableLLMText(
    typeof content === 'string' ? content : String(content ?? ''),
    'LLM provider returned an error message instead of JSON payload'
  );

  try {
    return parseLLMJson(content);
  } catch (err) {
    const preview = compactText(content, 180);
    console.error('Failed to parse LLM response as JSON:', err.message);
    throw new Error(
      preview
        ? `Invalid JSON response from LLM. Preview: ${preview}`
        : 'Invalid JSON response from LLM'
    );
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

function buildAnnotationPrompt(options, project, strict = false) {
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
- ${strict ? 'Exactly 10 annotations.' : '8 to 12 annotations.'}
- Use only types: hint, style, avoid, voice, subtext, sensory, pacing, reveal.
- Content must be precise, actionable, and consistent with declared entities.
- Keep each annotation under 160 characters.
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

async function parseLLMAnnotationPayload(content, model) {
  let parsed = null;
  try {
    parsed = parseJSONResponse(content);
  } catch (err) {
    if (isErrorLikeLLMText(content)) {
      throw err;
    }
    const repairedText = await repairJsonWithLLM({
      model,
      originalContent: content
    });
    parsed = parseJSONResponse(repairedText);
  }

  const annotations = normalizeLLMAnnotations(parsed?.annotations);
  return annotations.slice(0, 12);
}

async function generateLLMAnnotations(options, project) {
  if (!agentAvailable) return [];

  const agent = new LLMAgent({
    name: 'ScriptaAnnotationGenerator',
    systemPrompt: 'You generate concise CNL annotations for story generation guidance. Return valid JSON only.'
  });

  const desiredMaxTokens = 1800;
  const prompts = [
    buildAnnotationPrompt(options, project, false),
    buildAnnotationPrompt(options, project, true)
  ];

  let best = [];

  for (let i = 0; i < prompts.length; i += 1) {
    const completeOptions = {
      prompt: prompts[i],
      mode: 'fast',
      maxTokens: desiredMaxTokens,
      params: {
        max_tokens: desiredMaxTokens,
        max_completion_tokens: desiredMaxTokens
      }
    };

    if (options?.model) {
      completeOptions.model = options.model;
    }

    try {
      const response = await agent.complete(completeOptions);
      const content = response?.content || response?.text || response;
      const annotations = await parseLLMAnnotationPayload(content, options?.model);

      if (annotations.length > best.length) {
        best = annotations;
      }

      if (annotations.length >= 8) {
        return annotations;
      }
    } catch (err) {
      console.warn('[LLM Provider] Annotation generation attempt failed:', err?.message || err);
    }
  }

  return best;
}

async function repairJsonWithLLM({ model, originalContent }) {
  const agent = new LLMAgent({
    name: 'ScriptaJSONRepair',
    systemPrompt: 'You repair JSON. Return valid JSON only. No markdown. No commentary.'
  });

  const desiredMaxTokens = 7000;
  const completeOptions = {
    prompt: buildJsonRepairPrompt(originalContent),
    mode: 'fast',
    maxTokens: desiredMaxTokens,
    params: {
      max_tokens: desiredMaxTokens,
      max_completion_tokens: desiredMaxTokens
    }
  };

  if (model) completeOptions.model = model;

  const response = await agent.complete(completeOptions);
  return response?.content || response?.text || response;
}

async function continueJsonWithLLM({ model, originalContent, reason = '' }) {
  const agent = new LLMAgent({
    name: 'ScriptaJSONContinuation',
    systemPrompt: 'Continue truncated JSON exactly where it ended. Return continuation text only, no markdown, no explanation.'
  });

  const tail = String(originalContent || '').slice(-2200);
  const desiredMaxTokens = 3000;
  const prompt = `The JSON output below appears truncated (${reason || 'incomplete'}).

Continue it from exactly where it ends.

Rules:
- Return only the continuation text.
- Do not repeat previous text.
- Do not add markdown or commentary.
- Ensure final combined text is valid JSON.

TRUNCATED JSON TAIL:
${tail}
`;

  const completeOptions = {
    prompt,
    mode: 'fast',
    maxTokens: desiredMaxTokens,
    params: {
      max_tokens: desiredMaxTokens,
      max_completion_tokens: desiredMaxTokens
    }
  };
  if (model) completeOptions.model = model;

  const response = await agent.complete(completeOptions);
  return ensureUsableLLMText(
    response?.content || response?.text || response,
    'LLM provider returned an error message instead of JSON continuation'
  );
}

async function requestSpecsContent(agent, { prompt, mode = 'deep', maxTokens = 6500, model = null } = {}) {
  const desiredMaxTokens = Number.isFinite(maxTokens) ? Number(maxTokens) : 6500;
  const completeOptions = {
    prompt,
    mode,
    maxTokens: desiredMaxTokens,
    params: {
      max_tokens: desiredMaxTokens,
      max_completion_tokens: desiredMaxTokens
    }
  };
  if (model) completeOptions.model = model;
  const response = await agent.complete(completeOptions);
  return ensureUsableLLMText(
    response?.content || response?.text || response,
    'LLM provider returned an error message instead of story specs JSON'
  );
}

async function parseSpecsPayload(content, modelForRepair) {
  let workingContent = content;

  try {
    return parseJSONResponse(workingContent);
  } catch (err) {
    if (isErrorLikeLLMText(workingContent)) {
      throw err;
    }

    if (isLikelyTruncatedJsonError(err, workingContent)) {
      const reason = String(err?.message || 'truncated_json');
      for (let i = 0; i < 2; i += 1) {
        try {
          const continuation = await continueJsonWithLLM({
            model: modelForRepair,
            originalContent: workingContent,
            reason
          });
          workingContent = `${workingContent}${continuation}`;
          return parseJSONResponse(workingContent);
        } catch (continueErr) {
          if (!isLikelyTruncatedJsonError(continueErr, workingContent)) {
            break;
          }
        }
      }
    }

    const repairedText = await repairJsonWithLLM({
      model: modelForRepair,
      originalContent: workingContent
    });
    return parseJSONResponse(repairedText);
  }
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

  const projectName = options.storyName || options.title || 'Untitled Story';
  const minimalPrompt = buildSpecsPrompt({
    promptKey: 'minimal_project_json',
    options
  }).prompt;

  const attempts = [
    { label: 'selected-model', model: options.model || null, prompt },
    { label: 'auto-model', model: null, prompt },
    { label: 'minimal-auto', model: null, prompt: minimalPrompt }
  ];

  let project = null;
  let lastError = null;
  const attemptedKeys = new Set();

  for (const attempt of attempts) {
    const key = `${attempt.model || 'auto'}::${attempt.prompt === prompt ? 'main' : 'minimal'}`;
    if (attemptedKeys.has(key)) continue;
    attemptedKeys.add(key);

    try {
      const content = await requestSpecsContent(agent, {
        prompt: attempt.prompt,
        mode: 'deep',
        maxTokens: 9000,
        model: attempt.model
      });

      const parsed = await parseSpecsPayload(content, attempt.model || options.model || null);
      project = normalizeSpecsProject(parsed, projectName);
      if (!project) {
        throw new Error('LLM returned JSON but no project payload was found.');
      }
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[LLM Provider] Specs generation attempt "${attempt.label}" failed:`, err?.message || err);
    }
  }

  if (!project) {
    throw lastError || new Error('LLM failed to generate valid story specs JSON.');
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
