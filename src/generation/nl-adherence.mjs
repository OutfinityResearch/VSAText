/**
 * SCRIPTA SDK - NL Adherence Helpers
 *
 * Pure utilities for checking and repairing adherence of NL output to CNL-derived policies.
 * Portable (browser + Node.js). No LLM calls here.
 */

function stripDiacritics(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function toComparable(text) {
  return stripDiacritics(text).toLowerCase();
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function uniquePreserveOrder(items) {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    const key = toComparable(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeForMatch(text) {
  return toComparable(text);
}

function buildNameRegex(nameComparable) {
  const pattern = escapeRegex(String(nameComparable || '').trim()).replace(/\s+/g, '\\s+');
  if (!pattern) return null;

  // Avoid JS \b because it's ASCII-centric; use a Unicode-ish boundary.
  // NOTE: uses capturing groups rather than lookbehind for compatibility.
  return new RegExp(`(^|[^\\p{L}\\p{N}])${pattern}($|[^\\p{L}\\p{N}])`, 'u');
}

function nameMentioned(text, name) {
  if (!text || !name) return false;

  const t = normalizeForMatch(text);
  const n = normalizeForMatch(name);
  const re = buildNameRegex(n);
  if (!re) return false;
  return re.test(t);
}

function buildKnownTokenSet(knownNames) {
  const tokens = new Set();
  for (const name of knownNames || []) {
    const norm = toComparable(name);
    if (!norm) continue;
    for (const part of norm.split(/[\s/]+/g)) {
      const p = part.trim();
      if (p.length < 2) continue;
      tokens.add(p);
    }
  }
  return tokens;
}

function sanitizeForNameScan(text) {
  let t = String(text || '');
  // Remove fenced code blocks
  t = t.replace(/```[\s\S]*?```/g, ' ');
  // Remove inline code
  t = t.replace(/`[^`]*`/g, ' ');
  return t;
}

function isLikelySentenceStart(text, index) {
  let i = index - 1;
  while (i >= 0 && /\s/.test(text[i])) i--;
  if (i < 0) return true;
  return /[.!?\n]/.test(text[i]);
}

function extractUnknownNameTokens(text, knownNames) {
  const cleaned = sanitizeForNameScan(text);
  const knownTokens = buildKnownTokenSet(knownNames);

  // A small multilingual stoplist for common sentence-start words and markdown headers.
  const stop = new Set([
    // English
    'the', 'a', 'an', 'and', 'but', 'or', 'in', 'on', 'at', 'to', 'from', 'with', 'without',
    'chapter', 'scene', 'prologue', 'epilogue',
    // Romanian (no diacritics)
    'in', 'la', 'cu', 'fara', 'si', 'dar', 'apoi', 'cand', 'care', 'ce', 'ca', 'din', 'spre',
    'capitolul', 'scena', 'prolog', 'epilog', 'intr', 'intrun', 'intr-o', 'intr-un',
    // French/Spanish/Italian/German common
    'le', 'la', 'les', 'un', 'une', 'el', 'los', 'las', 'una', 'uno', 'il', 'lo', 'gli', 'die', 'der', 'das'
  ]);

  const candidates = [];
  const counts = new Map();

  // Unicode-capitalized token, length >= 3, allowing Romanian apostrophes/dashes.
  const re = /\b\p{Lu}[\p{L}'’\-]{2,}\b/gu;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const token = m[0];
    const key = toComparable(token);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
    candidates.push({ token, key, index: m.index });
  }

  const out = [];
  const seen = new Set();

  for (const c of candidates) {
    if (knownTokens.has(c.key)) continue;
    if (stop.has(c.key)) continue;

    // If it appears only once and looks like a sentence-start token, ignore (reduces false positives).
    if ((counts.get(c.key) || 0) === 1 && isLikelySentenceStart(cleaned, c.index)) {
      continue;
    }

    if (seen.has(c.key)) continue;
    seen.add(c.key);
    out.push(c.token);
  }

  return out;
}

/**
 * Compute roster and name-drift violations for a scene.
 *
 * @param {string} text - Generated Markdown for the scene
 * @param {object} policy
 * @param {string[]} [policy.allowedCharacters]
 * @param {string[]} [policy.declaredCharacters]
 * @param {string[]} [policy.declaredEntityNames]
 * @returns {object} violations
 */
export function computeSceneRosterViolations(text, policy = {}) {
  const allowedCharacters = uniquePreserveOrder(policy.allowedCharacters || []);
  const declaredCharacters = uniquePreserveOrder(policy.declaredCharacters || []);
  const declaredEntityNames = uniquePreserveOrder(policy.declaredEntityNames || []);

  const allowedSet = new Set(allowedCharacters.map(toComparable));

  const mentionedDeclaredCharacters = declaredCharacters.filter(name => nameMentioned(text, name));
  const disallowedDeclaredCharacters = mentionedDeclaredCharacters.filter(
    name => !allowedSet.has(toComparable(name))
  );

  const missingAllowedCharacters = allowedCharacters.filter(
    name => !nameMentioned(text, name)
  );

  const knownNames = uniquePreserveOrder([
    ...declaredEntityNames,
    ...declaredCharacters,
    ...allowedCharacters
  ]);
  const unknownNameTokens = extractUnknownNameTokens(text, knownNames);

  const score =
    disallowedDeclaredCharacters.length +
    missingAllowedCharacters.length +
    unknownNameTokens.length;

  return {
    hasViolations: score > 0,
    score,
    disallowedDeclaredCharacters,
    missingAllowedCharacters,
    unknownNameTokens
  };
}

/**
 * Build an LLM prompt to rewrite a scene to comply with the roster policy.
 *
 * @param {object} params
 * @param {object} params.sceneInfo
 * @param {object} params.storyContext
 * @param {object} params.options
 * @param {string} params.draft - Draft scene markdown
 * @param {object} params.violations - computeSceneRosterViolations result
 * @param {string[]} params.allowedCharacters
 * @returns {string}
 */
export function buildSceneRosterRepairPrompt({
  sceneInfo,
  storyContext,
  options = {},
  draft,
  violations,
  allowedCharacters
}) {
  const langCode = options.language || 'en';
  const languageLine = langCode && langCode !== 'en'
    ? `\nLANGUAGE: ${langCode} (write the entire scene in this language)`
    : '';

  const customLine = options.customPrompt
    ? `\nADDITIONAL AUTHOR INSTRUCTIONS (still apply):\n${options.customPrompt}`
    : '';

  const disallowed = (violations?.disallowedDeclaredCharacters || []).slice(0, 12);
  const unknown = (violations?.unknownNameTokens || []).slice(0, 12);
  const missing = (violations?.missingAllowedCharacters || []).slice(0, 12);

  const removalList = uniquePreserveOrder([...disallowed, ...unknown]);

  const mustMentionLine = missing.length
    ? `\nMUST MENTION (at least once): ${missing.join(', ')}`
    : '';

  const removeLine = removalList.length
    ? `\nREMOVE/REPLACE (no named mentions): ${removalList.join(', ')}`
    : '';

  const allowedLine = allowedCharacters?.length
    ? `\nALLOWED CHARACTERS (ONLY these names): ${allowedCharacters.join(', ')}`
    : '\nALLOWED CHARACTERS: (see specification)';

  return `You are an editor enforcing strict adherence to a story specification.

STORY TITLE: ${storyContext?.storyName || 'Untitled Story'}${languageLine}

SCENE: "${sceneInfo?.title || 'Untitled Scene'}" (Chapter ${sceneInfo?.chapterNumber || '?'})${allowedLine}${mustMentionLine}${removeLine}

GROUND TRUTH - SCENE SPECIFICATION (CNL):
${sceneInfo?.cnl || '(missing scene CNL)'}

TASK:
- Rewrite the DRAFT SCENE so it follows the CNL exactly.
- Use ONLY the allowed character names (no other named people).
- Do NOT introduce any new named entities (people, places, organizations). If needed, use generic roles (e.g., "a guard", "the innkeeper") without names.
- Ensure every allowed character is mentioned at least once.
- Keep Markdown format.
- Start with the exact header: "### ${sceneInfo?.title || 'Untitled Scene'}"
- No meta-commentary. No code blocks.${customLine}

DRAFT SCENE (Markdown):
${draft}

REWRITE (Markdown only):`;
}

export default { computeSceneRosterViolations, buildSceneRosterRepairPrompt };

