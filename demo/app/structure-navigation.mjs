/**
 * SCRIPTA Demo - Structure Navigation Helpers
 *
 * Robust chapter/scene extraction for mixed or legacy structures.
 */

function toText(value) {
  return String(value || '').trim();
}

function getNodeLabel(node) {
  return toText(node?.title) || toText(node?.name);
}

function extractNumericOrder(label) {
  const match = String(label || '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}

function looksLikeChapter(node) {
  const label = getNodeLabel(node);
  return /^(ch|chapter)\b/i.test(label);
}

function looksLikeScene(node) {
  const label = getNodeLabel(node);
  return /^(sc|scene)\b/i.test(label);
}

function hasSceneChildren(node) {
  if (!Array.isArray(node?.children)) return false;
  return node.children.some(child => {
    const childType = String(child?.type || '').toLowerCase();
    return childType === 'scene' || looksLikeScene(child);
  });
}

function isLikelySceneChild(node) {
  const nodeType = String(node?.type || '').toLowerCase();
  if (nodeType === 'scene') return true;
  if (looksLikeScene(node)) return true;

  if (!Array.isArray(node?.children) || node.children.length === 0) {
    // In some imported projects, scenes may be leaf nodes without explicit type.
    return true;
  }

  const sceneChildTypes = new Set([
    'character-ref',
    'location-ref',
    'object-ref',
    'mood-ref',
    'block-ref',
    'action',
    'dialogue',
    'dialogue-ref'
  ]);
  return node.children.some(child => sceneChildTypes.has(String(child?.type || '').toLowerCase()));
}

function collectChapterCandidates(node, chapters = [], parentType = null) {
  if (!node) return chapters;

  const nodeType = String(node.type || '').toLowerCase();
  const isChapterNode = nodeType === 'chapter' || (parentType === 'book' && (looksLikeChapter(node) || hasSceneChildren(node)));
  if (isChapterNode) chapters.push(node);

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectChapterCandidates(child, chapters, nodeType || null);
    }
  }

  return chapters;
}

export function getOrderedChapters(structure) {
  if (!structure) return [];
  const chapterCandidates = collectChapterCandidates(structure);
  const chaptersById = new Map();
  for (const chapter of chapterCandidates) {
    if (!chapter?.id || chaptersById.has(chapter.id)) continue;
    chaptersById.set(chapter.id, chapter);
  }

  const chapters = Array.from(chaptersById.values()).sort((a, b) => {
    const aOrder = extractNumericOrder(getNodeLabel(a));
    const bOrder = extractNumericOrder(getNodeLabel(b));
    return aOrder - bOrder;
  });

  if (chapters.length > 0) return chapters;
  return Array.isArray(structure.children) ? structure.children : [];
}

export function getChapterScenes(chapter) {
  if (!Array.isArray(chapter?.children)) return [];
  return chapter.children.filter(isLikelySceneChild);
}

