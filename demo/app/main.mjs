/**
 * SCRIPTA Demo - Main Entry Point
 * 
 * Initializes the application and sets up event handlers.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal } from './utils.mjs';
import { renderTree } from './tree.mjs';
import { renderEntityGrid } from './entities.mjs';
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
  $('#btn-docs')?.addEventListener('click', () => window.open('/docs/index.html', '_blank'));
  
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
  
  // Add root book button
  $('#btn-add-root').onclick = () => {
    if (!state.project.structure) {
      state.project.structure = {
        id: genId(),
        type: 'book',
        name: 'Book',
        title: state.project.name,
        children: []
      };
      renderTree();
    }
  };
  
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
