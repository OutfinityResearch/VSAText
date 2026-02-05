/**
 * SCRIPTA SDK - NL Generation Continuation Helpers
 *
 * Handles repair of outputs that look truncated (e.g., end mid-sentence).
 * This is kept separate to keep nl-generator.mjs smaller and focused.
 */

function getTail(text, maxChars) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxChars) return text;
  return text.slice(-maxChars);
}

function needsSpaceBetween(a, b) {
  if (!a || !b) return false;
  const last = a.slice(-1);
  const first = b.slice(0, 1);
  if (/\s/.test(last) || /\s/.test(first)) return false;
  // If the base ends with a letter, assume we may be mid-word and avoid forcing a space.
  if (/\p{L}$/u.test(last)) return false;

  // Otherwise, add a separator only when the base ends with punctuation/closers
  // and the continuation begins with a word character.
  if (/[.!?;:,"')\]\}]/.test(last) && /[0-9A-Za-z]/.test(first)) return true;
  return false;
}

function joinText(base, extra) {
  if (!base) return extra || '';
  if (!extra) return base;
  return base + (needsSpaceBetween(base, extra) ? ' ' : '') + extra;
}

function buildContinuationPrompt({ sectionLabel, options = {}, existingTextTail }) {
  const langCode = options.language || 'en';
  const languageLine = langCode && langCode !== 'en'
    ? `\nLANGUAGE: ${langCode} (continue in this language)`
    : '';

  const customLine = options.customPrompt
    ? `\nCUSTOM INSTRUCTIONS (still apply):\n${options.customPrompt}`
    : '';

  return `You are continuing a Markdown story section that ended abruptly.

SECTION: ${sectionLabel}${languageLine}

TASK:
- Continue exactly from where the text ends.
- Do NOT repeat any existing text.
- Do NOT add a new title or chapter/scene header.
- Keep the same voice, tense, and formatting.
- Finish with a complete ending sentence.
${customLine}

EXISTING TEXT (tail):
${existingTextTail}

CONTINUE (Markdown):`;
}

/**
 * Generate text, and if validation reports truncation, ask the LLM to continue and append.
 *
 * @param {Object} params
 * @param {Object} params.llmProvider - Provider with generateText(prompt, options)
 * @param {string} params.prompt - Initial prompt
 * @param {Object} params.llmCallOptions - Options for initial call (maxTokens, timeout, model)
 * @param {Object} params.continuationCallOptions - Options for continuation calls
 * @param {Function} params.validate - (text) => { valid, error, truncated? }
 * @param {string} params.sectionLabel - Human-friendly section name for prompts
 * @param {Object} params.options - Generation options (language, customPrompt)
 * @param {number} [params.maxContinuations=2] - Max continuation attempts
 * @returns {Promise<string>}
 */
export async function generateTextWithContinuation({
  llmProvider,
  prompt,
  llmCallOptions,
  continuationCallOptions,
  validate,
  sectionLabel,
  options,
  maxContinuations = 2
}) {
  const baseText = await llmProvider.generateText(prompt, llmCallOptions);
  let combined = (baseText || '').trimEnd();

  let check = validate(combined);
  if (check?.valid) return combined;
  if (!check?.truncated) throw new Error(check?.error || 'Generation failed validation');

  for (let i = 0; i < maxContinuations; i++) {
    const tail = getTail(combined, 1200);
    const continuationPrompt = buildContinuationPrompt({
      sectionLabel,
      options,
      existingTextTail: tail
    });

    const extra = await llmProvider.generateText(continuationPrompt, continuationCallOptions);
    combined = joinText(combined, (extra || '').trimEnd());

    check = validate(combined);
    if (check?.valid) return combined;
    if (!check?.truncated) throw new Error(check?.error || 'Generation failed validation');
  }

  throw new Error(check?.error || 'Content truncated');
}
