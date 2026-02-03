/**
 * SCRIPTA Demo - Timeline Component
 * 
 * Visual timeline for narrative beats with drag-and-drop.
 */

import state from '../state.mjs';
import { updateBeatMapping, setBlueprintArc } from '../state.mjs';
import { getArcs, getArc, getCurrentArcBeats, getTensionAtPosition } from './blueprint-state.mjs';
import { renderTensionCurve } from './tension-curve.mjs';

let draggedBeat = null;
let timelineContainer = null;

/**
 * Initialize the timeline component
 * @param {HTMLElement} container - Container element
 */
export function initTimeline(container) {
  timelineContainer = container;
  render();
}

/**
 * Render the timeline
 */
export function render() {
  if (!timelineContainer) return;
  
  const arc = getArc(state.project.blueprint.arc || state.project.selectedArc);
  const beats = arc?.beats || [];
  const mappings = state.project.blueprint.beatMappings;
  
  // Calculate minimum width needed - at least 120px per beat to avoid overlap
  const minWidthPerBeat = 120;
  const minTrackWidth = Math.max(800, beats.length * minWidthPerBeat);
  
  timelineContainer.innerHTML = `
    <div class="timeline-header">
      <label>Narrative Arc:</label>
      <select id="arc-select" class="arc-select">
        ${renderArcOptions()}
      </select>
      <span class="timeline-info">${beats.length} beats</span>
    </div>
    
    <div class="timeline-scroll-container">
      <div class="timeline-track-wrapper" style="min-width: ${minTrackWidth}px;">
        <div class="timeline-track" id="timeline-track">
          ${beats.map(beat => renderBeat(beat, mappings)).join('')}
        </div>
        <div class="timeline-markers">
          ${renderTimeMarkers()}
        </div>
      </div>
    </div>
    
    <div class="tension-curve-container" id="tension-curve">
      <!-- Tension curve will be rendered here -->
    </div>
    
    <div class="beat-mappings" id="beat-mappings">
      <h4>Beat Mappings</h4>
      ${renderMappingsList(beats, mappings)}
    </div>
  `;
  
  attachEventListeners();
  renderTensionCurve(document.getElementById('tension-curve'));
}

/**
 * Render arc selection options
 */
function renderArcOptions() {
  const arcs = getArcs();
  const selected = state.project.blueprint.arc || state.project.selectedArc;
  
  return Object.entries(arcs)
    .filter(([key, arc]) => arc.scope === 'work')
    .map(([key, arc]) => `
      <option value="${key}" ${key === selected ? 'selected' : ''}>
        ${arc.label} (${arc.beats?.length || 0} beats)
      </option>
    `).join('');
}

/**
 * Render a single beat on the timeline
 */
function renderBeat(beat, mappings) {
  const mapping = mappings.find(m => m.beatKey === beat.key);
  const left = (beat.position * 100).toFixed(1);
  const tension = mapping?.tension || getTensionAtPosition(beat.position);
  const isMapped = !!mapping?.chapterId;
  
  return `
    <div class="timeline-beat ${isMapped ? 'mapped' : ''}" 
         data-beat="${beat.key}"
         data-position="${beat.position}"
         style="left: ${left}%"
         draggable="true"
         title="${beat.label}: ${beat.desc || ''}">
      <div class="beat-marker tension-${tension}"></div>
      <div class="beat-label">${beat.key.replace(/_/g, ' ')}</div>
      ${isMapped ? `<div class="beat-mapping">${mapping.chapterId}</div>` : ''}
    </div>
  `;
}

/**
 * Render time markers (0%, 25%, 50%, 75%, 100%)
 */
function renderTimeMarkers() {
  return [0, 0.25, 0.5, 0.75, 1].map(pos => `
    <div class="time-marker" style="left: ${pos * 100}%">
      <span>${Math.round(pos * 100)}%</span>
    </div>
  `).join('');
}

/**
 * Render beat mappings list
 */
function renderMappingsList(beats, mappings) {
  return `
    <div class="mappings-list">
      ${beats.map(beat => {
        const mapping = mappings.find(m => m.beatKey === beat.key);
        return `
          <div class="mapping-row" data-beat="${beat.key}">
            <span class="mapping-beat">${beat.label}</span>
            <span class="mapping-arrow">→</span>
            <select class="mapping-chapter" data-beat="${beat.key}">
              <option value="">-- Select Chapter --</option>
              ${renderChapterOptions(mapping?.chapterId)}
            </select>
            <input type="number" class="mapping-tension" 
                   data-beat="${beat.key}"
                   min="1" max="5" 
                   value="${mapping?.tension || ''}"
                   placeholder="T">
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render chapter options from structure
 */
function renderChapterOptions(selectedId) {
  const structure = state.project.structure;
  if (!structure) return '<option value="">No structure</option>';
  
  const chapters = structure.children || [];
  return chapters.map(ch => `
    <option value="${ch.id}" ${ch.id === selectedId ? 'selected' : ''}>
      ${ch.name || ch.id}
    </option>
  `).join('');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Arc selection
  const arcSelect = document.getElementById('arc-select');
  if (arcSelect) {
    arcSelect.addEventListener('change', (e) => {
      setBlueprintArc(e.target.value);
      render();
    });
  }
  
  // Drag and drop for beats
  const track = document.getElementById('timeline-track');
  if (track) {
    track.addEventListener('dragstart', handleDragStart);
    track.addEventListener('dragend', handleDragEnd);
    track.addEventListener('dragover', handleDragOver);
    track.addEventListener('drop', handleDrop);
  }
  
  // Chapter mapping changes
  document.querySelectorAll('.mapping-chapter').forEach(select => {
    select.addEventListener('change', (e) => {
      const beatKey = e.target.dataset.beat;
      updateBeatMapping(beatKey, { chapterId: e.target.value });
      render();
    });
  });
  
  // Tension changes
  document.querySelectorAll('.mapping-tension').forEach(input => {
    input.addEventListener('change', (e) => {
      const beatKey = e.target.dataset.beat;
      const tension = parseInt(e.target.value);
      if (tension >= 1 && tension <= 5) {
        updateBeatMapping(beatKey, { tension });
        render();
      }
    });
  });
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
  const beatEl = e.target.closest('.timeline-beat');
  if (!beatEl) return;
  
  draggedBeat = beatEl.dataset.beat;
  beatEl.classList.add('dragging');
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
  const beatEl = e.target.closest('.timeline-beat');
  if (beatEl) beatEl.classList.remove('dragging');
  draggedBeat = null;
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
}

/**
 * Handle drop - update beat position
 */
function handleDrop(e) {
  e.preventDefault();
  if (!draggedBeat) return;
  
  const track = document.getElementById('timeline-track');
  const rect = track.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const newPosition = Math.max(0, Math.min(1, x / rect.width));
  
  // Note: This updates visual position, but narrative beats have fixed positions
  // In a full implementation, this could reorder beats or show a warning
  console.log(`Beat ${draggedBeat} dropped at position ${newPosition.toFixed(2)}`);
}

export default {
  initTimeline,
  render
};
