/**
 * SCRIPTA Demo - Tree Management
 * 
 * Story structure tree rendering, drag & drop, context menu.
 */

import { state } from './state.mjs';
import { $, $$, genId } from './utils.mjs';
import { updateStats } from './metrics.mjs';
import { generateCNL } from './cnl.mjs';
import { getChapterScenes } from './structure-navigation.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

let draggedNodeId = null;

const ARC_PHASE_PRESETS = {
  heros_journey: [
    { key: 'departure', label: 'Departure', beats: ['ordinary_world', 'call_to_adventure', 'refusal', 'meeting_mentor', 'crossing_threshold'] },
    { key: 'initiation', label: 'Initiation', beats: ['tests_allies_enemies', 'approach_cave'] },
    { key: 'ordeal_reward', label: 'Ordeal and Reward', beats: ['ordeal', 'reward'] },
    { key: 'return', label: 'Return', beats: ['road_back', 'resurrection', 'return_elixir'] }
  ],
  three_act: [
    { key: 'setup', label: 'Setup', beats: ['hook', 'setup', 'inciting_incident'] },
    { key: 'rising_action', label: 'Rising Action', beats: ['plot_point_1', 'rising_action', 'midpoint'] },
    { key: 'climax', label: 'Climax', beats: ['plot_point_2', 'climax'] },
    { key: 'resolution', label: 'Resolution', beats: ['resolution'] }
  ],
  save_the_cat: [
    { key: 'setup', label: 'Setup', beats: ['opening_image', 'theme_stated', 'setup', 'catalyst', 'debate'] },
    { key: 'promise', label: 'Promise of the Premise', beats: ['break_into_two', 'b_story', 'fun_and_games'] },
    { key: 'pressure', label: 'Pressure and Collapse', beats: ['midpoint', 'bad_guys_close_in', 'all_is_lost', 'dark_night'] },
    { key: 'finale', label: 'Finale', beats: ['break_into_three', 'finale', 'final_image'] }
  ],
  story_circle: [
    { key: 'comfort_need', label: 'Comfort and Need', beats: ['you', 'need'] },
    { key: 'entry_search', label: 'Entry and Search', beats: ['go', 'search'] },
    { key: 'gain_cost', label: 'Gain and Cost', beats: ['find', 'take'] },
    { key: 'return_change', label: 'Return and Change', beats: ['return', 'change'] }
  ],
  kishotenketsu: [
    { key: 'ki', label: 'Ki', beats: ['ki'] },
    { key: 'sho', label: 'Sho', beats: ['sho'] },
    { key: 'ten', label: 'Ten', beats: ['ten'] },
    { key: 'ketsu', label: 'Ketsu', beats: ['ketsu'] }
  ],
  five_act: [
    { key: 'exposition', label: 'Exposition', beats: ['exposition'] },
    { key: 'rising_action', label: 'Rising Action', beats: ['rising_action'] },
    { key: 'climax', label: 'Climax', beats: ['climax'] },
    { key: 'falling_action', label: 'Falling Action', beats: ['falling_action'] },
    { key: 'denouement', label: 'Denouement', beats: ['denouement'] }
  ],
  seven_point: [
    { key: 'opening', label: 'Opening', beats: ['hook', 'plot_turn_1'] },
    { key: 'pressure', label: 'Pressure', beats: ['pinch_1'] },
    { key: 'midpoint', label: 'Midpoint Shift', beats: ['midpoint'] },
    { key: 'dark_push', label: 'Dark Push', beats: ['pinch_2', 'plot_turn_2'] },
    { key: 'resolution', label: 'Resolution', beats: ['resolution'] }
  ]
};

function getTreeArcKey() {
  return state.project.blueprint?.arc || state.project.selectedArc || 'heros_journey';
}

function getTreeArcDefinition() {
  return VOCAB.NARRATIVE_ARCS?.[getTreeArcKey()] || VOCAB.NARRATIVE_ARCS?.heros_journey || null;
}

function getTreeArcPhaseDefinitions() {
  const arcKey = getTreeArcKey();
  const arc = getTreeArcDefinition();
  const preset = ARC_PHASE_PRESETS[arcKey];
  if (preset?.length) return preset;

  const beats = Array.isArray(arc?.beats) ? arc.beats : [];
  return beats.map(beat => ({
    key: beat.key,
    label: beat.label || beat.key,
    beats: [beat.key]
  }));
}

function getTreeChapterBeatKeyMap() {
  const mappings = Array.isArray(state.project.blueprint?.beatMappings) ? state.project.blueprint.beatMappings : [];
  const byChapterId = new Map();
  const beatsByKey = new Map((getTreeArcDefinition()?.beats || []).map(beat => [beat.key, beat]));

  for (const mapping of mappings) {
    if (!mapping?.chapterId || !mapping?.beatKey) continue;
    const beat = beatsByKey.get(mapping.beatKey);
    const position = Number.isFinite(beat?.position) ? beat.position : 1;
    const existing = byChapterId.get(mapping.chapterId);
    if (!existing || position < existing.position) {
      byChapterId.set(mapping.chapterId, { beatKey: mapping.beatKey, position });
    }
  }

  return byChapterId;
}

function getTreePhaseForBeatKey(beatKey) {
  const phases = getTreeArcPhaseDefinitions();
  return phases.find(phase => phase.beats.includes(beatKey)) || null;
}

function getTreePhaseGroups(book) {
  const chapters = (book?.children || []).filter(child => child?.type === 'chapter');
  if (!chapters.length) return [];

  const phaseOrder = getTreeArcPhaseDefinitions();
  const chapterBeatMap = getTreeChapterBeatKeyMap();
  const groups = new Map();

  phaseOrder.forEach(phase => {
    groups.set(phase.key, { ...phase, chapters: [] });
  });
  groups.set('unmapped', { key: 'unmapped', label: 'Unmapped', beats: [], chapters: [] });

  chapters.forEach((chapter, index) => {
    const beatKey = chapterBeatMap.get(chapter.id)?.beatKey || '';
    const phase = beatKey ? getTreePhaseForBeatKey(beatKey) : null;
    const target = phase || groups.get('unmapped');
    if (!groups.has(target.key)) {
      groups.set(target.key, { ...target, chapters: [] });
    }
    groups.get(target.key).chapters.push({ chapter, index });
  });

  return [...groups.values()].filter(group => group.chapters.length > 0);
}

function renderBookChildren(book, depth) {
  const nonChapterChildren = (book.children || []).filter(child => child?.type !== 'chapter');
  const phaseGroups = getTreePhaseGroups(book);

  const phaseMarkup = phaseGroups.map(group => `
    <div class="tree-phase-group">
      <div class="tree-phase-title">${group.label}</div>
      ${group.chapters.map(({ chapter }) => renderNode(chapter, depth + 1)).join('')}
    </div>
  `).join('');

  const remainderMarkup = nonChapterChildren.map(child => renderNode(child, depth + 1)).join('');
  if (!phaseMarkup && !remainderMarkup) return '';
  return `<div class="tree-children">${phaseMarkup}${remainderMarkup}</div>`;
}

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

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLibraryEntity(type, refId) {
  if (!refId) return null;
  if (type === 'character-ref') {
    return (state.project.libraries.characters || []).find(item => item.id === refId) || null;
  }
  if (type === 'location-ref') {
    return (state.project.libraries.locations || []).find(item => item.id === refId) || null;
  }
  if (type === 'dialogue-ref') {
    return (state.project.libraries.dialogues || []).find(item => item.id === refId) || null;
  }
  return null;
}

function getNodeDisplayLabel(node) {
  if (!node) return '';

  if (node.type === 'action' && node.actionData) {
    const act = VOCAB.ACTIONS[node.actionData.action];
    return `${node.actionData.subject} ${act?.label || node.actionData.action} ${node.actionData.target || ''}`.trim();
  }

  if (node.type === 'dialogue' && node.dialogueData) {
    const purpose = node.dialogueData.purpose || 'dialogue';
    const participants = node.dialogueData.exchanges?.map(e => e.speakerId).filter(Boolean).slice(0, 2).join(', ');
    return `[${purpose}] ${participants || 'dialogue'}`;
  }

  if ((node.type === 'character-ref' || node.type === 'location-ref' || node.type === 'dialogue-ref') && node.refId) {
    const entity = getLibraryEntity(node.type, node.refId);
    if (node.type === 'dialogue-ref' && entity) {
      return `💬 ${entity.purpose || entity.title || entity.name || 'Dialogue'}`;
    }
    if (entity?.name) return entity.name;
  }

  return node.title || node.name || node.type;
}

function collectChapterSceneEntries(chapter) {
  return getChapterScenes(chapter);
}

function collectNodesFromScenes(scenes, predicate, { dedupeByRef = false } = {}) {
  const collected = [];
  const seenRefs = new Set();

  for (const scene of scenes) {
    for (const child of scene.children || []) {
      if (!predicate(child)) continue;
      if (dedupeByRef && child.refId) {
        if (seenRefs.has(child.refId)) continue;
        seenRefs.add(child.refId);
      }
      collected.push(child);
    }
  }

  return collected;
}

function renderChapterGroup(title, nodes, depth, options = {}) {
  if (!nodes.length) return '';
  const { open = false, renderOptions = {} } = options;
  return `
    <details class="tree-subgroup" ${open ? 'open' : ''}>
      <summary class="tree-subgroup-summary">${esc(title)} <span class="tree-subgroup-count">${nodes.length}</span></summary>
      <div class="tree-group-children">
        ${nodes.map(node => renderNode(node, depth + 1, renderOptions)).join('')}
      </div>
    </details>
  `;
}

function renderChapterChildren(chapter, depth) {
  const scenes = collectChapterSceneEntries(chapter);
  const characters = collectNodesFromScenes(scenes, child => child?.type === 'character-ref', { dedupeByRef: true });
  const locations = collectNodesFromScenes(scenes, child => child?.type === 'location-ref', { dedupeByRef: true });
  const actions = collectNodesFromScenes(scenes, child => child?.type === 'action');
  const dialogs = collectNodesFromScenes(scenes, child => child?.type === 'dialogue' || child?.type === 'dialogue-ref');

  const groupsMarkup = [
    renderChapterGroup('Scenes', scenes, depth, { open: true, renderOptions: { suppressChildren: true } }),
    renderChapterGroup('Characters', characters, depth),
    renderChapterGroup('Locations', locations, depth),
    renderChapterGroup('Actions', actions, depth),
    renderChapterGroup('Dialogs', dialogs, depth)
  ].join('');

  if (!groupsMarkup) return '';
  return `<div class="tree-children">${groupsMarkup}</div>`;
}

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

function renderNode(n, d = 0, options = {}) {
  const { suppressChildren = false } = options;
  const icons = {
    book: '📖', chapter: '📑', scene: '🎬',
    'character-ref': '👤', 'location-ref': '📍', 'object-ref': '🗝️',
    'mood-ref': '🎭', 'block-ref': '✨', 'action': '⚡',
    'dialogue': '💬', 'dialogue-ref': '💬'
  };
  const sel = state.selectedNode === n.id ? 'selected' : '';
  let label = getNodeDisplayLabel(n);
  
  const canDrag = !['book'].includes(n.type);
  let ch = '';
  if (suppressChildren) {
    ch = '';
  } else if (n.type === 'book') {
    ch = renderBookChildren(n, d);
  } else if (n.type === 'chapter') {
    ch = renderChapterChildren(n, d);
  } else if (n.children?.length) {
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
