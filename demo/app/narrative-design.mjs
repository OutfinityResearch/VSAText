/**
 * SCRIPTA Demo - Narrative Design (Macro)
 *
 * Narrative design workspace:
 * - Core conflict
 * - Protagonist journey
 * - Macro structure
 * - Conflict escalation
 * - Narrative constraints
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { getOrderedChapters } from './structure-navigation.mjs';
import VOCAB from '../../src/vocabularies/vocabularies.mjs';

const TURNING_POINTS = ['None', 'Inciting Incident', 'First Plot Point', 'Midpoint', 'Second Plot Point', 'Climax', 'Resolution'];
const STRUCTURE_ROLES = ['Setup', 'Escalation', 'Crisis', 'Finale'];
const CONFLICT_TYPES = ['Internal', 'Interpersonal', 'External', 'Societal', 'Existential'];
const ESCALATION_PATTERNS = ['Wave', 'Spiral', 'Linear', 'Step', 'Cliff'];
const RESOLUTION_PATHS = ['Victory', 'Sacrifice', 'Tragic fall', 'Bittersweet ending', 'Reconciliation', 'Ambiguous'];
const STRUCTURE_MODELS = Object.entries(VOCAB.NARRATIVE_ARCS || {})
  .filter(([, arc]) => (arc?.scope || 'work') === 'work')
  .map(([key, arc]) => ({
    key,
    label: String(arc?.label || key)
  }));
const DEFAULT_STRUCTURE_MODEL = STRUCTURE_MODELS.find(model => model.key === 'three_act')?.key || STRUCTURE_MODELS[0]?.key || 'three_act';

let draggedChapterId = null;

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function chapterTitle(index) {
  return `Chapter ${index + 1}`;
}

function normalizeStructureModel(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_STRUCTURE_MODEL;
  const byKey = STRUCTURE_MODELS.find(model => model.key === raw);
  if (byKey) return byKey.key;
  const byLabel = STRUCTURE_MODELS.find(model => model.label === raw);
  if (byLabel) return byLabel.key;
  return DEFAULT_STRUCTURE_MODEL;
}

function ensureMacroDesign() {
  if (!state.project.blueprint) state.project.blueprint = {};
  const existing = state.project.blueprint.macroDesign || {};

  let chapters = Array.isArray(existing.chapters) ? existing.chapters : [];
  if (!chapters.length) {
    const structureChapters = getOrderedChapters(state.project.structure);
    chapters = structureChapters.map((chapter, index) => ({
      id: chapter.id || uid('ch'),
      title: String(chapter.title || chapter.name || chapterTitle(index)),
      turningPoint: 'None',
      role: STRUCTURE_ROLES[Math.min(index, STRUCTURE_ROLES.length - 1)] || 'Setup'
    }));
  }

  state.project.blueprint.macroDesign = {
    chapters: chapters.map((chapter, index) => ({
      id: chapter.id || uid('ch'),
      title: String(chapter.title || chapterTitle(index)),
      turningPoint: TURNING_POINTS.includes(chapter.turningPoint) ? chapter.turningPoint : 'None',
      role: STRUCTURE_ROLES.includes(chapter.role) ? chapter.role : 'Setup'
    })),
    coreConflict: {
      centralConflict: String(existing.coreConflict?.centralConflict || ''),
      resolutionPath: RESOLUTION_PATHS.includes(existing.coreConflict?.resolutionPath) ? existing.coreConflict.resolutionPath : 'Victory'
    },
    macroStructure: {
      structureModel: normalizeStructureModel(existing.macroStructure?.structureModel)
    },
    conflictPlan: {
      conflictType: CONFLICT_TYPES.includes(existing.conflictPlan?.conflictType) ? existing.conflictPlan.conflictType : 'Interpersonal',
      escalationPattern: ESCALATION_PATTERNS.includes(existing.conflictPlan?.escalationPattern) ? existing.conflictPlan.escalationPattern : 'Wave',
      stakesGrowth: String(existing.conflictPlan?.stakesGrowth || '')
    },
    chapterEscalation: Array.isArray(existing.chapterEscalation) ? existing.chapterEscalation : []
  };

  return state.project.blueprint.macroDesign;
}

function syncMacroDesign() {
  const macro = ensureMacroDesign();

  const escalationById = new Map(
    macro.chapterEscalation
      .filter(item => item?.chapterId)
      .map(item => [item.chapterId, item])
  );
  macro.chapterEscalation = macro.chapters.map((chapter, index) => {
    const existing = escalationById.get(chapter.id) || {};
    return {
      chapterId: chapter.id,
      tension: Number.isFinite(existing.tension) ? existing.tension : Math.min(5, 2 + index),
      note: String(existing.note || '')
    };
  });

  return macro;
}

function ensureNarrativeConstraints() {
  const libraries = state.project.libraries || (state.project.libraries = {});
  const frameworkProfile = libraries.frameworkProfile || (libraries.frameworkProfile = {});
  const dramaticModel = frameworkProfile.dramaticModel || (frameworkProfile.dramaticModel = {});
  const constraints = dramaticModel.constraints || {};

  dramaticModel.constraints = {
    nonLinear: Boolean(constraints.nonLinear),
    moralAmbiguity: Boolean(constraints.moralAmbiguity),
    multiplePOV: Boolean(constraints.multiplePOV),
    unreliableNarrator: Boolean(constraints.unreliableNarrator)
  };

  return dramaticModel.constraints;
}

function reorderChapters(macro, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const sourceIndex = macro.chapters.findIndex(ch => ch.id === sourceId);
  const targetIndex = macro.chapters.findIndex(ch => ch.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const moved = macro.chapters.splice(sourceIndex, 1)[0];
  macro.chapters.splice(targetIndex, 0, moved);
}

function renderOptions(options, selected) {
  return options.map(option => `<option value="${esc(option)}" ${selected === option ? 'selected' : ''}>${esc(option)}</option>`).join('');
}

function renderKeyedOptions(options, selected) {
  return options
    .map(option => `<option value="${esc(option.key)}" ${selected === option.key ? 'selected' : ''}>${esc(option.label)}</option>`)
    .join('');
}

function renderCoreConflict(macro) {
  return `
    <section class="nd-section">
      <div class="nd-section-head">
        <h3>Core Conflict</h3>
        <p>Define the central struggle of the story and the broad shape of its ending.</p>
      </div>
      <div class="nd-grid nd-core-conflict-grid">
        <label class="nd-field nd-core-conflict-field">
          <span>Central Conflict</span>
          <input type="text" id="nd-central-conflict" value="${esc(macro.coreConflict.centralConflict)}" placeholder="A knight must overthrow a corrupt king.">
        </label>
        <label class="nd-field nd-core-resolution-field">
          <span>Resolution Path</span>
          <select id="nd-resolution-path">${renderOptions(RESOLUTION_PATHS, macro.coreConflict.resolutionPath)}</select>
        </label>
      </div>
    </section>
  `;
}

function renderMacroStructure(macro) {
  return `
    <section class="nd-section">
      <div class="nd-section-head">
        <h3>Macro Structure</h3>
        <p>Choose the structure model, then map turning points across chapters.</p>
      </div>
      <div class="nd-grid nd-grid-2">
        <label class="nd-field">
          <span>Structure Model</span>
          <select id="nd-structure-model">${renderKeyedOptions(STRUCTURE_MODELS, macro.macroStructure.structureModel)}</select>
        </label>
      </div>
      <div class="nd-chapter-list" id="nd-chapter-list">
        ${macro.chapters.length ? macro.chapters.map((chapter, index) => `
          <article class="nd-chapter-row" draggable="true" data-chapter-id="${esc(chapter.id)}">
            <div class="nd-drag-handle" title="Drag to reorder">⋮⋮</div>
            <div class="nd-chapter-fields">
              <label class="nd-field">
                <span>Title</span>
                <input type="text" data-chapter-field="title" data-chapter-id="${esc(chapter.id)}" value="${esc(chapter.title || chapterTitle(index))}">
              </label>
              <label class="nd-field">
                <span>Turning Point</span>
                <select data-chapter-field="turningPoint" data-chapter-id="${esc(chapter.id)}">
                  ${renderOptions(TURNING_POINTS, chapter.turningPoint)}
                </select>
              </label>
              <label class="nd-field">
                <div class="nd-field-head nd-field-head-inline">
                  <span>Role</span>
                  <button
                    class="nd-remove-chapter"
                    type="button"
                    aria-label="Remove chapter"
                    title="Remove chapter"
                    data-remove-chapter="${esc(chapter.id)}"
                    onclick="window.removeNarrativeDesignChapter('${esc(chapter.id)}')"
                  >X</button>
                </div>
                <div class="nd-role-row">
                  <select data-chapter-field="role" data-chapter-id="${esc(chapter.id)}">
                    ${renderOptions(STRUCTURE_ROLES, chapter.role)}
                  </select>
                </div>
              </label>
            </div>
          </article>
        `).join('') : `
          <div class="nd-empty">No chapters yet. Add macro chapters to define structure.</div>
        `}
      </div>
      <div class="nd-actions">
        <button class="btn" type="button" id="btn-nd-add-chapter" onclick="window.addNarrativeDesignChapter()">+ Add Chapter</button>
      </div>
    </section>
  `;
}

function escalationPoints(macro) {
  if (!macro.chapters.length) return '';
  const width = 420;
  const height = 120;
  return macro.chapters.map((chapter, index) => {
    const row = macro.chapterEscalation.find(item => item.chapterId === chapter.id);
    const tension = Number(row?.tension) || 3;
    const x = macro.chapters.length === 1 ? width / 2 : Math.round((index / (macro.chapters.length - 1)) * width);
    const y = Math.round(height - ((tension - 1) / 4) * (height - 10));
    return `${x},${y}`;
  }).join(' ');
}

function renderConflictPlan(macro) {
  return `
    <section class="nd-section">
      <div class="nd-section-head">
        <h3>Conflict Escalation</h3>
        <p>Define how conflict intensifies and how stakes expand across the story.</p>
      </div>
      <div class="nd-grid nd-grid-3">
        <label class="nd-field">
          <span>Conflict Type</span>
          <select id="nd-conflict-type">${renderOptions(CONFLICT_TYPES, macro.conflictPlan.conflictType)}</select>
        </label>
        <label class="nd-field">
          <span>Escalation Pattern</span>
          <select id="nd-escalation-pattern">${renderOptions(ESCALATION_PATTERNS, macro.conflictPlan.escalationPattern)}</select>
        </label>
        <label class="nd-field">
          <span>Stakes Growth</span>
          <input type="text" id="nd-stakes-growth" value="${esc(macro.conflictPlan.stakesGrowth)}" placeholder="Personal -> Kingdom -> World">
        </label>
      </div>

      ${macro.chapters.length ? `
        <div class="nd-graph-shell">
          <svg class="nd-graph" viewBox="0 0 420 120" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="115" x2="420" y2="115" class="nd-axis" />
            <line x1="0" y1="8" x2="0" y2="115" class="nd-axis" />
            <polyline points="${escalationPoints(macro)}" class="nd-line" />
          </svg>
          <div class="nd-graph-labels">
            <span>X: Chapters</span>
            <span>Y: Tension Level</span>
          </div>
        </div>
        <div class="nd-escalation-list">
          ${macro.chapters.map((chapter, index) => {
            const row = macro.chapterEscalation.find(item => item.chapterId === chapter.id);
            const tension = Number(row?.tension) || 3;
            return `
              <article class="nd-escalation-row">
                <div class="nd-row-top">
                  <strong>${esc(chapter.title || chapterTitle(index))}</strong>
                  <span>${tension}/5</span>
                </div>
                <input type="range" min="1" max="5" step="1" value="${tension}" data-tension-chapter="${esc(chapter.id)}">
              </article>
            `;
          }).join('')}
        </div>
      ` : `<div class="nd-empty">Add chapters first to model tension progression.</div>`}
    </section>
  `;
}

function renderNarrativeDesign() {
  const macro = syncMacroDesign();
  const constraints = ensureNarrativeConstraints();
  return `
    <div class="nd-layout">
      <div class="nd-header">
        <div>
          <h2>Narrative Design</h2>
          <p>Shape the narrative logic of the book: conflict, journey, structure, escalation, and storytelling constraints.</p>
        </div>
        <span class="nd-autosave">Autosave On</span>
      </div>
      ${renderCoreConflict(macro)}
      ${renderMacroStructure(macro)}
      ${renderConflictPlan(macro)}
      <section class="nd-section">
        <div class="nd-section-head">
          <h3>Narrative Constraints</h3>
          <p>Define how the story is told, not what happens in it.</p>
        </div>
        <div class="nd-grid nd-grid-2">
          <label class="nd-check-card">
            <input type="checkbox" id="nd-constraint-nonlinear" ${constraints.nonLinear ? 'checked' : ''}>
            <div>
              <strong>Non-linear timeline</strong>
              <p>Allow chronology shifts, flashbacks, and out-of-order reveals.</p>
            </div>
          </label>
          <label class="nd-check-card">
            <input type="checkbox" id="nd-constraint-moral-ambiguity" ${constraints.moralAmbiguity ? 'checked' : ''}>
            <div>
              <strong>Moral ambiguity</strong>
              <p>Allow ethically gray choices without a clean moral resolution.</p>
            </div>
          </label>
          <label class="nd-check-card">
            <input type="checkbox" id="nd-constraint-multiple-pov" ${constraints.multiplePOV ? 'checked' : ''}>
            <div>
              <strong>Multiple POV</strong>
              <p>Tell the story through more than one viewpoint character.</p>
            </div>
          </label>
          <label class="nd-check-card">
            <input type="checkbox" id="nd-constraint-unreliable-narrator" ${constraints.unreliableNarrator ? 'checked' : ''}>
            <div>
              <strong>Unreliable narrator</strong>
              <p>Allow distortion, omission, or bias in the telling voice.</p>
            </div>
          </label>
        </div>
      </section>
    </div>
  `;
}

function bindChapterDnd(container) {
  const macro = ensureMacroDesign();
  const rows = container.querySelectorAll('.nd-chapter-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', () => {
      draggedChapterId = row.getAttribute('data-chapter-id');
      row.classList.add('is-dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('is-dragging');
      draggedChapterId = null;
      rows.forEach(item => item.classList.remove('is-drag-over'));
    });
    row.addEventListener('dragover', event => {
      event.preventDefault();
      row.classList.add('is-drag-over');
    });
    row.addEventListener('dragleave', () => {
      row.classList.remove('is-drag-over');
    });
    row.addEventListener('drop', event => {
      event.preventDefault();
      const targetId = row.getAttribute('data-chapter-id');
      reorderChapters(macro, draggedChapterId, targetId);
      renderNarrativeDesignMacroView();
    });
  });
}

function bindEvents(container) {
  const macro = ensureMacroDesign();
  const constraints = ensureNarrativeConstraints();

  bindChapterDnd(container);

  container.addEventListener('click', event => {
    const removeBtn = event.target.closest('[data-remove-chapter]');
    if (removeBtn) {
      event.preventDefault();
      event.stopPropagation();
      const chapterId = removeBtn.getAttribute('data-remove-chapter');
      macro.chapters = macro.chapters.filter(ch => ch.id !== chapterId);
      macro.chapterEscalation = macro.chapterEscalation.filter(item => item.chapterId !== chapterId);
      renderNarrativeDesignMacroView();
    }
  });

  container.querySelectorAll('[data-chapter-field]').forEach(field => {
    field.addEventListener('input', () => {
      const chapterId = field.getAttribute('data-chapter-id');
      const key = field.getAttribute('data-chapter-field');
      const chapter = macro.chapters.find(ch => ch.id === chapterId);
      if (!chapter || !key) return;
      chapter[key] = field.value;
    });
    field.addEventListener('change', () => {
      const chapterId = field.getAttribute('data-chapter-id');
      const key = field.getAttribute('data-chapter-field');
      const chapter = macro.chapters.find(ch => ch.id === chapterId);
      if (!chapter || !key) return;
      chapter[key] = field.value;
    });
  });

  container.querySelector('#nd-conflict-type')?.addEventListener('change', event => {
    macro.conflictPlan.conflictType = event.target.value;
  });
  container.querySelector('#nd-escalation-pattern')?.addEventListener('change', event => {
    macro.conflictPlan.escalationPattern = event.target.value;
  });
  container.querySelector('#nd-central-conflict')?.addEventListener('input', event => {
    macro.coreConflict.centralConflict = event.target.value;
  });
  container.querySelector('#nd-resolution-path')?.addEventListener('change', event => {
    macro.coreConflict.resolutionPath = event.target.value;
  });
  container.querySelector('#nd-structure-model')?.addEventListener('change', event => {
    macro.macroStructure.structureModel = event.target.value;
  });
  container.querySelector('#nd-stakes-growth')?.addEventListener('input', event => {
    macro.conflictPlan.stakesGrowth = event.target.value;
  });

  container.querySelector('#nd-constraint-nonlinear')?.addEventListener('change', event => {
    constraints.nonLinear = Boolean(event.target.checked);
  });

  container.querySelector('#nd-constraint-moral-ambiguity')?.addEventListener('change', event => {
    constraints.moralAmbiguity = Boolean(event.target.checked);
  });
  container.querySelector('#nd-constraint-multiple-pov')?.addEventListener('change', event => {
    constraints.multiplePOV = Boolean(event.target.checked);
  });
  container.querySelector('#nd-constraint-unreliable-narrator')?.addEventListener('change', event => {
    constraints.unreliableNarrator = Boolean(event.target.checked);
  });

  container.querySelectorAll('[data-tension-chapter]').forEach(slider => {
    slider.addEventListener('input', () => {
      const chapterId = slider.getAttribute('data-tension-chapter');
      const row = macro.chapterEscalation.find(item => item.chapterId === chapterId);
      if (!row) return;
      row.tension = Number(slider.value) || 3;
      renderNarrativeDesignMacroView();
    });
  });
}

export function renderNarrativeDesignMacroView() {
  const container = $('#narrative-design-view');
  if (!container) return;
  container.innerHTML = renderNarrativeDesign();
  bindEvents(container);
}

window.addNarrativeDesignChapter = () => {
  const macro = ensureMacroDesign();
  const index = macro.chapters.length;
  macro.chapters.push({
    id: uid('ch'),
    title: chapterTitle(index),
    turningPoint: 'None',
    role: STRUCTURE_ROLES[Math.min(index, STRUCTURE_ROLES.length - 1)] || 'Setup'
  });
  renderNarrativeDesignMacroView();
};

window.removeNarrativeDesignChapter = (chapterId) => {
  const macro = ensureMacroDesign();
  if (!chapterId) return;
  macro.chapters = macro.chapters.filter(ch => ch.id !== chapterId);
  macro.chapterEscalation = macro.chapterEscalation.filter(item => item.chapterId !== chapterId);
  renderNarrativeDesignMacroView();
};

export default { renderNarrativeDesignMacroView };
