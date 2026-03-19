/**
 * SCRIPTA Demo - Tree Management
 * 
 * Story structure tree rendering, drag & drop, context menu.
 */

import { state } from './state.mjs';
import { $, $$, genId } from './utils.mjs';
import { updateStats } from './metrics.mjs';
import { generateCNL } from './cnl.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

let draggedNodeId = null;

/**
 * Map node types to their corresponding tabs and entity types
 */
const NODE_TO_TAB = {
  'character-ref': { tab: 'characters', entityType: 'characters' },
  'location-ref': { tab: 'backdrop', entityType: 'locations' },
  'object-ref': { tab: 'backdrop', entityType: 'objects' },
  'mood-ref': { tab: 'moods', entityType: 'moods' },
  'dialogue-ref': { tab: 'dialogues', entityType: null },
  'dialogue': { tab: 'dialogues', entityType: null },
  'block-ref': { tab: 'blocks', entityType: null },
  'action': { tab: null, entityType: null }
};

// ==================== TREE RENDERING ====================
export function renderTree() {
  const c = $('#tree-container');
  if (!c) return;
  if (!state.project.structure) {
    c.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📖</div><div class="empty-state-text">No story generated yet</div><div class="empty-state-hint">Generate a story to populate the project structure.</div></div>';
    document.dispatchEvent(new CustomEvent('structure-changed'));
    return;
  }
  c.innerHTML = renderNode(state.project.structure);
  updateStats();
  generateCNL();
  document.dispatchEvent(new CustomEvent('structure-changed'));
}

function renderNode(n, d = 0) {
  const icons = {
    book: '📖', chapter: '📑', scene: '🎬',
    'character-ref': '👤', 'location-ref': '📍', 'object-ref': '🗝️',
    'mood-ref': '🎭', 'block-ref': '✨', 'action': '⚡',
    'dialogue': '💬', 'dialogue-ref': '💬'
  };
  const sel = state.selectedNode === n.id ? 'selected' : '';
  let label = n.title || n.name || n.type;
  
  if (n.type === 'action' && n.actionData) {
    const act = VOCAB.ACTIONS[n.actionData.action];
    label = `${n.actionData.subject} ${act?.label || n.actionData.action} ${n.actionData.target || ''}`.trim();
  }
  
  // Dialogue node rendering
  if (n.type === 'dialogue' && n.dialogueData) {
    const purpose = n.dialogueData.purpose || 'dialogue';
    const participants = n.dialogueData.exchanges?.map(e => e.speakerId).filter(Boolean).slice(0, 2).join(', ');
    label = `[${purpose}] ${participants || 'dialogue'}`;
  }
  
  // Dialogue reference rendering
  if (n.type === 'dialogue-ref' && n.refId) {
    const dialogue = state.project.libraries.dialogues.find(d => d.id === n.refId);
    if (dialogue) {
      label = `💬 ${dialogue.purpose || 'Dialogue'}`;
    }
  }
  
  const canDrag = !['book'].includes(n.type);
  let ch = '';
  if (n.children?.length) {
    ch = `<div class="tree-children">${n.children.map(x => renderNode(x, d + 1)).join('')}</div>`;
  }
  
  // Allow direct navigation from project structure for manuscript nodes and entity refs.
  const isNavigableNode = ['book', 'chapter', 'scene'].includes(n.type) || Boolean(NODE_TO_TAB[n.type]);
  const navigateOnClick = isNavigableNode ? 'true' : 'false';
  const nodeClass = isNavigableNode ? 'tree-node clickable-leaf' : 'tree-node';
  
  return `<div class="${nodeClass}" data-id="${n.id}" data-type="${n.type}" draggable="${canDrag}" 
    ondragstart="handleDragStart(event,'${n.id}')" ondragend="handleDragEnd(event)"
    ondragover="handleDragOver(event,'${n.id}')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event,'${n.id}')">
    <div class="tree-node-content ${sel}" onclick="selectNode('${n.id}',${navigateOnClick})" oncontextmenu="showCtx(event,'${n.id}')">
      <span class="tree-icon">${icons[n.type] || '•'}</span>
      <span class="tree-label">${label}</span>
      <span class="tree-type">${n.type}</span>
    </div>${ch}</div>`;
}

// ==================== NODE OPERATIONS ====================

/**
 * Select a node in the tree and optionally navigate to its corresponding tab/entity
 * @param {string} id - Node ID to select
 * @param {boolean} navigate - Whether to navigate to the entity tab (default: true)
 */
export function selectNode(id, navigate = true) {
  state.selectedNode = id;
  
  const node = findNode(id);
  if (node?.type === 'action') {
    setTimeout(() => {
      window.editNodeProps?.(node);
    }, 50);
  }

  if (node && navigate) {
    if (node.type === 'book' || node.type === 'chapter' || node.type === 'scene') {
      const chapterId = node.type === 'chapter'
        ? node.id
        : (node.type === 'scene' ? findParent(node.id)?.id || null : null);
      const sceneId = node.type === 'scene' ? node.id : null;
      window.openManuscriptNode?.(chapterId, sceneId);
      renderTree();
      return;
    }

    const mapping = NODE_TO_TAB[node.type];
    if (mapping && mapping.tab) {
      // Navigate to the corresponding tab
      window.switchToTab?.(mapping.tab);

      if (node.type === 'dialogue-ref' && node.refId) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('open-dialogue-editor', { detail: { dialogueId: node.refId } }));
        }, 50);
      }
      
      // If this is a reference node with an entity, open the entity editor
      if (mapping.entityType && node.refId) {
        // Small delay to ensure tab is rendered
        setTimeout(() => {
          window.editEntity?.(mapping.entityType, node.refId);
        }, 50);
      }
    }
  }
  
  renderTree();
}

export function findNode(id, n = state.project.structure) {
  if (!n) return null;
  if (n.id === id) return n;
  for (const c of n.children || []) {
    const f = findNode(id, c);
    if (f) return f;
  }
  return null;
}

export function findParent(id, n = state.project.structure, p = null) {
  if (!n) return null;
  if (n.id === id) return p;
  for (const c of n.children || []) {
    const f = findParent(id, c, n);
    if (f) return f;
  }
  return null;
}

function isDescendant(node, ancestorId) {
  if (node.id === ancestorId) return true;
  for (const c of node.children || []) {
    if (isDescendant(c, ancestorId)) return true;
  }
  return false;
}

export function addChild(parent, template) {
  if (!parent.children) parent.children = [];
  parent.children.push({ ...template, id: genId() });
  renderTree();
}

// ==================== DRAG & DROP ====================
window.handleDragStart = (e, id) => {
  draggedNodeId = id;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
};

window.handleDragEnd = (e) => {
  e.target.classList.remove('dragging');
  $$('.tree-node.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedNodeId = null;
};

window.handleDragOver = (e, targetId) => {
  e.preventDefault();
  if (draggedNodeId && draggedNodeId !== targetId) {
    e.target.closest('.tree-node')?.classList.add('drag-over');
  }
};

window.handleDragLeave = (e) => {
  e.target.closest('.tree-node')?.classList.remove('drag-over');
};

window.handleDrop = (e, targetId) => {
  e.preventDefault();
  e.target.closest('.tree-node')?.classList.remove('drag-over');
  if (!draggedNodeId || draggedNodeId === targetId) return;
  
  const draggedNode = findNode(draggedNodeId);
  const targetNode = findNode(targetId);
  const draggedParent = findParent(draggedNodeId);
  
  if (!draggedNode || !targetNode || !draggedParent) return;
  if (isDescendant(targetNode, draggedNodeId)) return;
  
  draggedParent.children = draggedParent.children.filter(c => c.id !== draggedNodeId);
  if (!targetNode.children) targetNode.children = [];
  targetNode.children.push(draggedNode);
  renderTree();
};

window.selectNode = (id, navigate = true) => selectNode(id, navigate);

export function getUsedBlocks() {
  const used = new Set();
  function traverse(n) {
    if (!n) return;
    if (n.type === 'block-ref' && n.blockKey) used.add(n.blockKey);
    (n.children || []).forEach(traverse);
  }
  traverse(state.project.structure);
  return used;
}

export function countType(n, t) {
  if (!n) return 0;
  let c = n.type === t ? 1 : 0;
  (n.children || []).forEach(ch => c += countType(ch, t));
  return c;
}
