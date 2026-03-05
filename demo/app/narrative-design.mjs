/**
 * SCRIPTA Demo - Narrative Design (Macro)
 *
 * Minimal macro planning workspace:
 * - Macro Structure (chapters only, no scenes)
 * - Conflict Escalation Plan
 * - Character Arcs Overview
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { getOrderedChapters } from './structure-navigation.mjs';

const TURNING_POINTS = ['None', 'Inciting Incident', 'First Plot Point', 'Midpoint', 'Second Plot Point', 'Climax', 'Resolution'];
const STRUCTURE_ROLES = ['Setup', 'Escalation', 'Crisis', 'Finale'];
const CONFLICT_TYPES = ['Internal', 'Interpersonal', 'External', 'Societal', 'Existential'];
const ESCALATION_PATTERNS = ['Linear', 'Wave', 'Spiral', 'Step', 'Cliff'];
const RESOLUTION_PATHS = ['Victory', 'Pyrrhic Victory', 'Sacrifice', 'Reconciliation', 'Ambiguous'];
const CHARACTER_ROLES = ['Protagonist', 'Antagonist', 'Supporting'];
const ARC_TYPES = ['Positive', 'Negative', 'Flat'];

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

function getCastCharacters() {
  return Array.isArray(state.project.libraries?.characters)
    ? state.project.libraries.characters
    : [];
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
    conflictPlan: {
      conflictType: CONFLICT_TYPES.includes(existing.conflictPlan?.conflictType) ? existing.conflictPlan.conflictType : 'Interpersonal',
      escalationPattern: ESCALATION_PATTERNS.includes(existing.conflictPlan?.escalationPattern) ? existing.conflictPlan.escalationPattern : 'Wave',
      resolutionPath: RESOLUTION_PATHS.includes(existing.conflictPlan?.resolutionPath) ? existing.conflictPlan.resolutionPath : 'Victory'
    },
    chapterEscalation: Array.isArray(existing.chapterEscalation) ? existing.chapterEscalation : [],
    characterArcs: Array.isArray(existing.characterArcs) ? existing.characterArcs : [],
    narrativeInputs: {
      protagonistArc: String(existing.narrativeInputs?.protagonistArc || ''),
      subplots: String(existing.narrativeInputs?.subplots || ''),
      conflictAndResolution: String(existing.narrativeInputs?.conflictAndResolution || '')
    }
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

  const cast = getCastCharacters();
  const arcsByCharacterId = new Map(
    macro.characterArcs
      .filter(item => item?.characterId)
      .map(item => [item.characterId, item])
  );
  macro.characterArcs = cast.map(character => {
    const existing = arcsByCharacterId.get(character.id) || {};
    return {
      characterId: character.id,
      characterName: character.name || character.id,
      role: CHARACTER_ROLES.includes(existing.role) ? existing.role : 'Supporting',
      arcType: ARC_TYPES.includes(existing.arcType) ? existing.arcType : 'Positive',
      beforeState: String(existing.beforeState || ''),
      afterState: String(existing.afterState || ''),
      valueShift: Number.isFinite(existing.valueShift) ? existing.valueShift : 50,
      chapterIds: Array.isArray(existing.chapterIds) ? existing.chapterIds.filter(id => macro.chapters.some(ch => ch.id === id)) : []
    };
  });

  return macro;
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

function renderMacroStructure(macro) {
  return `
    <section class="nd-section">
      <div class="nd-section-head">
        <h3>Macro Structure</h3>
        <p>Story skeleton only: chapters, turning points, structural role.</p>
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
                <span>Role</span>
                <select data-chapter-field="role" data-chapter-id="${esc(chapter.id)}">
                  ${renderOptions(STRUCTURE_ROLES, chapter.role)}
                </select>
              </label>
            </div>
            <button class="btn small danger" type="button" data-remove-chapter="${esc(chapter.id)}">Remove</button>
          </article>
        `).join('') : `
          <div class="nd-empty">No chapters yet. Add macro chapters to define structure.</div>
        `}
      </div>
      <div class="nd-actions">
        <button class="btn" type="button" id="btn-nd-add-chapter">+ Add Chapter</button>
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
        <h3>Conflict Escalation Plan</h3>
        <p>Model dramatic progression at chapter level.</p>
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
          <span>Resolution Path</span>
          <select id="nd-resolution-path">${renderOptions(RESOLUTION_PATHS, macro.conflictPlan.resolutionPath)}</select>
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

function renderCharacterArcs(macro) {
  return `
    <section class="nd-section">
      <div class="nd-section-head">
        <h3>Character Arcs Overview</h3>
        <p>Align character evolution with macro structure.</p>
      </div>
      ${macro.characterArcs.length ? `
        <div class="nd-character-list">
          ${macro.characterArcs.map(arc => `
            <article class="nd-character-card">
              <div class="nd-card-head">
                <strong>${esc(arc.characterName)}</strong>
              </div>
              <div class="nd-grid nd-grid-2">
                <label class="nd-field">
                  <span>Role</span>
                  <select data-arc-field="role" data-character-id="${esc(arc.characterId)}">
                    ${renderOptions(CHARACTER_ROLES, arc.role)}
                  </select>
                </label>
                <label class="nd-field">
                  <span>Arc Type</span>
                  <select data-arc-field="arcType" data-character-id="${esc(arc.characterId)}">
                    ${renderOptions(ARC_TYPES, arc.arcType)}
                  </select>
                </label>
              </div>
              <div class="nd-grid nd-grid-2">
                <label class="nd-field">
                  <span>Before State</span>
                  <input type="text" data-arc-field="beforeState" data-character-id="${esc(arc.characterId)}" value="${esc(arc.beforeState)}">
                </label>
                <label class="nd-field">
                  <span>After State</span>
                  <input type="text" data-arc-field="afterState" data-character-id="${esc(arc.characterId)}" value="${esc(arc.afterState)}">
                </label>
              </div>
              <label class="nd-field">
                <span>Value Shift (${Number(arc.valueShift) || 50})</span>
                <input type="range" min="0" max="100" step="1" value="${Number(arc.valueShift) || 50}" data-arc-field="valueShift" data-character-id="${esc(arc.characterId)}">
              </label>
              <div class="nd-mini-timeline">
                <span>Start</span>
                <div class="nd-mini-track"><div class="nd-mini-progress" style="width:${Number(arc.valueShift) || 50}%"></div></div>
                <span>Transformation</span>
                <div class="nd-mini-track"><div class="nd-mini-progress nd-mini-progress-end" style="width:100%"></div></div>
                <span>End</span>
              </div>
              <div class="nd-chapter-checks">
                <span>Appears in chapters:</span>
                <div class="nd-check-list">
                  ${macro.chapters.length ? macro.chapters.map((chapter, index) => `
                    <label class="nd-check-item">
                      <input
                        type="checkbox"
                        data-arc-chapter="${esc(arc.characterId)}"
                        value="${esc(chapter.id)}"
                        ${arc.chapterIds.includes(chapter.id) ? 'checked' : ''}
                      >
                      ${esc(chapter.title || chapterTitle(index))}
                    </label>
                  `).join('') : '<span class="nd-empty-inline">No chapters</span>'}
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      ` : `<div class="nd-empty">No characters available. Add characters in Cast.</div>`}
    </section>
  `;
}

function renderNarrativeDesign() {
  const macro = syncMacroDesign();
  return `
    <div class="nd-layout">
      <div class="nd-header">
        <div>
          <h2>Narrative Design</h2>
          <p>Macro-only planning workspace. No scene tree in this view.</p>
        </div>
        <span class="nd-autosave">Autosave On</span>
      </div>
      <section class="nd-section">
        <div class="nd-section-head">
          <h3>Narrative Inputs</h3>
          <p>High-level inputs synced from Narrative Structure in Create Specs.</p>
        </div>
        <div class="nd-grid nd-grid-3">
          <label class="nd-field">
            <span>Protagonist Arc</span>
            <input type="text" data-narrative-input="protagonistArc" value="${esc(macro.narrativeInputs.protagonistArc)}" placeholder="Ex: fall -> awakening -> leadership">
          </label>
          <label class="nd-field">
            <span>Subplots</span>
            <input type="text" data-narrative-input="subplots" value="${esc(macro.narrativeInputs.subplots)}" placeholder="Ex: rivalry, family debt, hidden alliance">
          </label>
          <label class="nd-field">
            <span>Conflict & Resolution</span>
            <input type="text" data-narrative-input="conflictAndResolution" value="${esc(macro.narrativeInputs.conflictAndResolution)}" placeholder="Ex: moral duel resolved by sacrifice">
          </label>
        </div>
      </section>
      ${renderMacroStructure(macro)}
      ${renderConflictPlan(macro)}
      ${renderCharacterArcs(macro)}
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

  container.querySelectorAll('[data-narrative-input]').forEach(field => {
    const handler = () => {
      const key = field.getAttribute('data-narrative-input');
      if (!key || !macro.narrativeInputs) return;
      macro.narrativeInputs[key] = field.value;
    };
    field.addEventListener('input', handler);
    field.addEventListener('change', handler);
  });

  bindChapterDnd(container);

  container.addEventListener('click', event => {
    const addBtn = event.target.closest('#btn-nd-add-chapter');
    if (addBtn) {
      event.preventDefault();
      const index = macro.chapters.length;
      macro.chapters.push({
        id: uid('ch'),
        title: chapterTitle(index),
        turningPoint: 'None',
        role: STRUCTURE_ROLES[Math.min(index, STRUCTURE_ROLES.length - 1)] || 'Setup'
      });
      renderNarrativeDesignMacroView();
      return;
    }

    const removeBtn = event.target.closest('[data-remove-chapter]');
    if (removeBtn) {
      event.preventDefault();
      const chapterId = removeBtn.getAttribute('data-remove-chapter');
      macro.chapters = macro.chapters.filter(ch => ch.id !== chapterId);
      macro.chapterEscalation = macro.chapterEscalation.filter(item => item.chapterId !== chapterId);
      macro.characterArcs.forEach(arc => {
        arc.chapterIds = arc.chapterIds.filter(id => id !== chapterId);
      });
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
  container.querySelector('#nd-resolution-path')?.addEventListener('change', event => {
    macro.conflictPlan.resolutionPath = event.target.value;
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

  container.querySelectorAll('[data-arc-field]').forEach(field => {
    const handler = () => {
      const characterId = field.getAttribute('data-character-id');
      const key = field.getAttribute('data-arc-field');
      const arc = macro.characterArcs.find(item => item.characterId === characterId);
      if (!arc || !key) return;
      arc[key] = key === 'valueShift' ? Number(field.value) || 0 : field.value;
      if (key === 'valueShift') renderNarrativeDesignMacroView();
    };
    field.addEventListener('input', handler);
    field.addEventListener('change', handler);
  });

  container.querySelectorAll('[data-arc-chapter]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const characterId = checkbox.getAttribute('data-arc-chapter');
      const chapterId = checkbox.value;
      const arc = macro.characterArcs.find(item => item.characterId === characterId);
      if (!arc) return;
      if (checkbox.checked) {
        if (!arc.chapterIds.includes(chapterId)) arc.chapterIds.push(chapterId);
      } else {
        arc.chapterIds = arc.chapterIds.filter(id => id !== chapterId);
      }
    });
  });
}

export function renderNarrativeDesignMacroView() {
  const container = $('#narrative-design-view');
  if (!container) return;
  container.innerHTML = renderNarrativeDesign();
  bindEvents(container);
}

export default { renderNarrativeDesignMacroView };
