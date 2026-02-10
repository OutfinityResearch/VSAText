/**
 * SCRIPTA Demo - CNL Annotation Helpers
 *
 * Shared helpers for editing/normalizing parser-compatible CNL annotations.
 */

const KNOWN_ANNOTATION_TYPES = new Set([
  'example',
  'hint',
  'style',
  'avoid',
  'voice',
  'subtext',
  'sensory',
  'pacing',
  'reference',
  'context',
  'contrast',
  'reveal'
]);

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function normalizeContent(content) {
  return String(content ?? '').trim();
}

/**
 * Normalize annotation objects to parser-compatible shape.
 * Unknown types are dropped.
 */
export function normalizeAnnotations(annotations) {
  if (!Array.isArray(annotations)) return [];

  const normalized = [];
  for (const ann of annotations) {
    const type = normalizeType(ann?.type);
    const content = normalizeContent(ann?.content);
    if (!KNOWN_ANNOTATION_TYPES.has(type) || !content) continue;
    normalized.push({ type, content });
  }
  return normalized;
}

/**
 * Parse editor text into annotation objects.
 *
 * Accepted line format:
 *   #type: content
 *   type: content
 */
export function parseAnnotationLines(text) {
  if (!text || !String(text).trim()) return [];

  const lines = String(text).split(/\r?\n/);
  const parsed = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const clean = line.startsWith('#') ? line.slice(1) : line;
    const match = clean.match(/^([a-z_]+)\s*:\s*(.+)$/i);
    if (!match) continue;

    parsed.push({
      type: normalizeType(match[1]),
      content: normalizeContent(match[2])
    });
  }

  return normalizeAnnotations(parsed);
}

/**
 * Format annotations for UI textarea editing.
 */
export function annotationsToEditorText(annotations) {
  const normalized = normalizeAnnotations(annotations);
  if (!normalized.length) return '';
  return normalized.map(a => `#${a.type}: ${a.content}`).join('\n');
}

/**
 * Format annotations for CNL output.
 *
 * Multi-line content is emitted as block annotation.
 */
export function annotationsToCnlLines(annotations, indent = '') {
  const lines = [];
  const normalized = normalizeAnnotations(annotations);

  for (const ann of normalized) {
    if (ann.content.includes('\n')) {
      lines.push(`${indent}#${ann.type}: begin`);
      for (const blockLine of ann.content.split('\n')) {
        lines.push(`${indent}${blockLine}`);
      }
      lines.push(`${indent}#${ann.type}: end`);
      continue;
    }

    lines.push(`${indent}#${ann.type}: ${ann.content}`);
  }

  return lines;
}

export const CNL_ANNOTATION_TYPES = [...KNOWN_ANNOTATION_TYPES];

export default {
  CNL_ANNOTATION_TYPES,
  normalizeAnnotations,
  parseAnnotationLines,
  annotationsToEditorText,
  annotationsToCnlLines
};
