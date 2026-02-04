/**
 * SCRIPTA Demo - Main Entry Point
 * 
 * Initializes the application and sets up event handlers.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal } from './utils.mjs';
import { renderTree, findNode, addChild } from './tree.mjs';
import { renderEntityGrid, showSelectModal, showBlockModal, showActionModal } from './entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from './views.mjs';
import { evaluateMetrics, renderEmptyMetrics, initMetrics } from './metrics.mjs';
import { exportCNL, importCNL, toggleEditMode } from './cnl.mjs';
import { saveProject, loadProjectsList, newProject } from './persistence.mjs';
import { setupContextMenu } from './context-menu.mjs';

// Blueprint imports
import { loadBlueprintData } from './blueprint/blueprint-state.mjs';
import { initTimeline, render as renderTimeline } from './blueprint/timeline.mjs';
import { initTemplates } from './blueprint/templates.mjs';

// Dialogue imports
import { initDialogueEditor } from './dialogue/dialogue-editor.mjs';

// Wisdom and Patterns imports
import { renderWisdomView } from './entities-wisdom.mjs';
import { renderPatternsView } from './entities-patterns.mjs';

// Import to register generation functions
import './generation.mjs';
import { updateGenerateButton } from './generation.mjs';

// NL generation
import { generateNLStory, resetNLState } from './nl-generation.mjs';

// Wizard
import { openWizard } from './wizard.mjs';

// Eval runner
import { initEvalRunner } from './eval-runner.mjs';

let currentBlueprintView = 'timeline';

// ==================== INITIALIZATION ====================
async function init() {
  // Load blueprint data
  await loadBlueprintData();
  
  // Setup context menu
  setupContextMenu();
  
  // Header buttons
  $('#btn-save').onclick = saveProject;
  $('#btn-load').onclick = loadProjectsList;
  $('#btn-generate').onclick = () => {
    if (state.generation.hasGenerated) {
      window.showImproveModal();
    } else {
      openModal('generate-modal');
    }
  };
  $('#btn-new').onclick = newProject;
  $('#btn-evaluate').onclick = evaluateMetrics;
  $('#btn-docs')?.addEventListener('click', () => window.open('/docs/theory/index.html', '_blank'));
  
  // Zoom controls
  setupZoomControls();
  
  // CNL tab buttons
  $('#btn-edit-cnl').onclick = toggleEditMode;
  $('#btn-export-cnl').onclick = exportCNL;
  $('#btn-import-cnl').onclick = importCNL;
  
  // NL tab buttons
  $('#btn-nl-generate').onclick = generateNLStory;
  $('#btn-nl-copy').onclick = copyNLContent;
  $('#btn-nl-export').onclick = exportNLContent;
  
  // Add button with contextual menu
  $('#btn-add-root').onclick = (e) => {
    e.stopPropagation();
    showAddMenu(e);
  };
  
  // Close add menu on click outside
  document.addEventListener('click', () => {
    $('#add-menu')?.classList.remove('open');
  });
  
  // Tab switching
  $$('.tab').forEach(tab => {
    tab.onclick = () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      $(`#view-${tab.dataset.view}`).classList.add('active');
      
      // Render view-specific content
      if (tab.dataset.view === 'relationships') renderRelationshipsView();
      if (tab.dataset.view === 'emotionalarc') renderEmotionalArcView();
      if (tab.dataset.view === 'blocks') renderBlocksView();
      if (tab.dataset.view === 'worldrules') renderWorldRulesView();
      if (tab.dataset.view === 'blueprint') initBlueprintView();
      if (tab.dataset.view === 'templates') initTemplatesView();
      if (tab.dataset.view === 'dialogues') initDialogueEditor($('#dialogues-container'));
      if (tab.dataset.view === 'wisdom') renderWisdomView();
      if (tab.dataset.view === 'patterns') renderPatternsView();
    };
  });
  
  // Listen for blueprint changes
  document.addEventListener('blueprint-changed', () => {
    renderTimeline();
  });
  
  // Initial render
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderTree();
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
  
  // Initialize eval runner
  initEvalRunner();
}

/**
 * Initialize Blueprint view (Timeline only now)
 */
function initBlueprintView() {
  const content = $('#blueprint-content');
  if (!content) return;
  initTimeline(content);
}

/**
 * Initialize Templates view (now a main tab)
 */
function initTemplatesView() {
  const container = $('#templates-container');
  if (!container) return;
  initTemplates(container);
}

// ==================== TAB SWITCHING UTILITY ====================
/**
 * Switch to a specific tab programmatically
 * @param {string} viewName - The data-view value of the tab to switch to
 */
export function switchToTab(viewName) {
  const tab = $(`.tab[data-view="${viewName}"]`);
  if (!tab) return;
  
  $$('.tab').forEach(t => t.classList.remove('active'));
  $$('.view').forEach(v => v.classList.remove('active'));
  tab.classList.add('active');
  $(`#view-${viewName}`).classList.add('active');
  
  // Render view-specific content
  if (viewName === 'relationships') renderRelationshipsView();
  if (viewName === 'emotionalarc') renderEmotionalArcView();
  if (viewName === 'blocks') renderBlocksView();
  if (viewName === 'worldrules') renderWorldRulesView();
  if (viewName === 'blueprint') initBlueprintView();
  if (viewName === 'templates') initTemplatesView();
  if (viewName === 'dialogues') initDialogueEditor($('#dialogues-container'));
  if (viewName === 'wisdom') renderWisdomView();
  if (viewName === 'patterns') renderPatternsView();
}

// Make switchToTab available globally for tree navigation
window.switchToTab = switchToTab;

// ==================== ADD MENU (Plus Button) ====================

/**
 * Show contextual add menu based on selected node
 */
function showAddMenu(e) {
  const menu = $('#add-menu');
  if (!menu) return;
  
  const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
  const hasStructure = !!state.project.structure;
  
  let items = [];
  
  if (!hasStructure) {
    // No structure - only option is to create a book
    items.push({ a: 'add-book', l: '📖 Add Book', desc: 'Create story structure' });
  } else if (!selectedNode) {
    // Has structure but nothing selected - show message
    items.push({ a: 'hint', l: 'Select a node first', disabled: true });
    items.push({ a: 'div' });
    items.push({ a: 'add-chapter-root', l: '📑 Add Chapter to Book' });
  } else {
    // Show options based on selected node type
    const type = selectedNode.type;
    
    if (type === 'book' || type === 'chapter') {
      items.push({ a: 'add-chapter', l: '📑 Add Chapter' });
      items.push({ a: 'add-scene', l: '🎬 Add Scene' });
    }
    
    if (type === 'scene') {
      items.push({ a: 'add-char', l: '👤 Add Character' });
      items.push({ a: 'add-loc', l: '📍 Add Location' });
      items.push({ a: 'add-obj', l: '🗝️ Add Object' });
      items.push({ a: 'add-mood', l: '🎭 Add Mood' });
      items.push({ a: 'div' });
      items.push({ a: 'add-block', l: '✨ Add Narrative Block' });
      items.push({ a: 'add-action', l: '⚡ Add Action' });
      items.push({ a: 'add-dialogue', l: '💬 Add Dialogue' });
    }
    
    // For leaf nodes, show parent's options
    if (['character-ref', 'location-ref', 'object-ref', 'mood-ref', 'block-ref', 'action', 'dialogue', 'dialogue-ref'].includes(type)) {
      items.push({ a: 'hint', l: `Selected: ${selectedNode.name || type}`, disabled: true });
      items.push({ a: 'div' });
      items.push({ a: 'add-sibling-hint', l: 'Select a scene to add elements', disabled: true });
    }
  }
  
  if (items.length === 0) {
    items.push({ a: 'hint', l: 'No actions available', disabled: true });
  }
  
  menu.innerHTML = items.map(i => {
    if (i.a === 'div') return '<div class="add-menu-divider"></div>';
    if (i.disabled) return `<div class="add-menu-item disabled">${i.l}</div>`;
    return `<div class="add-menu-item" data-action="${i.a}">${i.l}${i.desc ? `<span class="add-menu-desc">${i.desc}</span>` : ''}</div>`;
  }).join('');
  
  // Position menu below the button
  const btn = $('#btn-add-root');
  const rect = btn.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.classList.add('open');
}

// Handle add menu item clicks
document.addEventListener('click', e => {
  const item = e.target.closest('.add-menu-item');
  if (!item || item.classList.contains('disabled')) return;
  
  const action = item.dataset.action;
  handleAddMenuAction(action);
  $('#add-menu')?.classList.remove('open');
});

function handleAddMenuAction(action) {
  const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
  
  if (action === 'add-book') {
    state.project.structure = {
      id: genId(),
      type: 'book',
      name: 'Book',
      title: state.project.name,
      children: []
    };
    renderTree();
    return;
  }
  
  if (action === 'add-chapter-root') {
    const book = state.project.structure;
    if (book) {
      addChild(book, { type: 'chapter', name: `Ch${(book.children?.length || 0) + 1}`, title: '', children: [] });
    }
    return;
  }
  
  if (!selectedNode) return;
  
  if (action === 'add-chapter') {
    addChild(selectedNode, { type: 'chapter', name: `Ch${(selectedNode.children?.length || 0) + 1}`, title: '', children: [] });
  }
  if (action === 'add-scene') {
    addChild(selectedNode, { type: 'scene', name: `Sc${(selectedNode.children?.length || 0) + 1}`, title: '', children: [] });
  }
  if (action === 'add-char') showSelectModal('characters', selectedNode);
  if (action === 'add-loc') showSelectModal('locations', selectedNode);
  if (action === 'add-obj') showSelectModal('objects', selectedNode);
  if (action === 'add-mood') showSelectModal('moods', selectedNode);
  if (action === 'add-block') showBlockModal(selectedNode);
  if (action === 'add-action') showActionModal(selectedNode);
  if (action === 'add-dialogue') {
    // Switch to dialogues tab to create a dialogue
    switchToTab('dialogues');
    window.showNotification?.('Create a dialogue, then add it to the scene', 'info');
  }
}

// Run initialization
init();

// ==================== NL HELPERS ====================
function copyNLContent() {
  const content = $('#nl-content');
  if (!content) return;
  
  const text = content.innerText || content.textContent;
  if (!text || text.includes('No story generated yet')) {
    window.showNotification?.('No story to copy', 'info');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    window.showNotification?.('Story copied to clipboard', 'success');
  }).catch(() => {
    window.showNotification?.('Failed to copy', 'error');
  });
}

function exportNLContent() {
  const content = $('#nl-content');
  if (!content) return;
  
  const text = content.innerText || content.textContent;
  if (!text || text.includes('No story generated yet')) {
    window.showNotification?.('No story to export', 'info');
    return;
  }
  
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (state.project.name || 'story').replace(/[^a-z0-9]/gi, '_') + '.txt';
  a.click();
}

// ==================== ZOOM CONTROLS ====================
// Reasonable steps: 80%, 90%, 100% (default), 110%, 120%, 130%, 140%
const ZOOM_LEVELS = [0.80, 0.90, 1.0, 1.10, 1.20, 1.30, 1.40];
const ZOOM_DEFAULT = 1.0;
const ZOOM_STORAGE_KEY = 'scripta-zoom-level';

function setupZoomControls() {
  const btnZoomIn = $('#btn-zoom-in');
  const btnZoomOut = $('#btn-zoom-out');
  const btnZoomReset = $('#btn-zoom-reset');
  const zoomLevel = $('#zoom-level');
  
  if (!btnZoomIn || !btnZoomOut || !zoomLevel) return;
  
  // Load saved zoom level or use default
  const savedZoom = localStorage.getItem(ZOOM_STORAGE_KEY);
  if (savedZoom) {
    applyZoom(parseFloat(savedZoom));
  } else {
    applyZoom(ZOOM_DEFAULT);
  }
  
  btnZoomIn.onclick = () => changeZoom(1);
  btnZoomOut.onclick = () => changeZoom(-1);
  btnZoomReset.onclick = () => applyZoom(ZOOM_DEFAULT);
}

function changeZoom(direction) {
  const root = document.documentElement;
  const currentScale = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1.0;
  
  // Find current index
  let currentIndex = ZOOM_LEVELS.findIndex(z => Math.abs(z - currentScale) < 0.01);
  if (currentIndex === -1) currentIndex = ZOOM_LEVELS.indexOf(1.0);
  
  const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, currentIndex + direction));
  applyZoom(ZOOM_LEVELS[newIndex]);
}

function applyZoom(scale) {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', scale);
  
  const zoomLevel = $('#zoom-level');
  if (zoomLevel) {
    zoomLevel.textContent = Math.round(scale * 100) + '%';
  }
  
  // Save to localStorage
  localStorage.setItem(ZOOM_STORAGE_KEY, scale.toString());
}
