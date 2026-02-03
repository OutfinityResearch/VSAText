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
import { evaluateMetrics, renderEmptyMetrics } from './metrics.mjs';
import { exportCNL } from './cnl.mjs';
import { saveProject, loadProjectsList, newProject } from './persistence.mjs';
import { setupContextMenu } from './context-menu.mjs';

// Import to register generation functions
import './generation.mjs';

// ==================== INITIALIZATION ====================
function init() {
  // Setup context menu
  setupContextMenu();
  
  // Header buttons
  $('#btn-save').onclick = saveProject;
  $('#btn-load').onclick = loadProjectsList;
  $('#btn-generate').onclick = () => openModal('generate-modal');
  $('#btn-new').onclick = newProject;
  $('#btn-export').onclick = exportCNL;
  $('#btn-evaluate').onclick = evaluateMetrics;
  
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
    };
  });
  
  // Initial render
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderTree();
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
}

// Run initialization
init();
