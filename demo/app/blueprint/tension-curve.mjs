/**
 * SCRIPTA Demo - Tension Curve Visualization
 * 
 * SVG-based tension curve display with interactive editing.
 */

import state from '../state.mjs';
import { setTensionCurve } from '../state.mjs';
import { getCurrentArcBeats, getTensionAtPosition } from './blueprint-state.mjs';

const CURVE_WIDTH = 600;
const CURVE_HEIGHT = 120;
const PADDING = 20;

let curveContainer = null;
let isDragging = false;
let dragPointIndex = -1;

/**
 * Render the tension curve
 * @param {HTMLElement} container 
 */
export function renderTensionCurve(container) {
  if (!container) return;
  curveContainer = container;
  
  const curve = state.project.blueprint.tensionCurve;
  const beats = getCurrentArcBeats();
  
  container.innerHTML = `
    <div class="tension-curve-wrapper">
      <div class="tension-label">Tension</div>
      <svg class="tension-svg" 
           width="${CURVE_WIDTH}" 
           height="${CURVE_HEIGHT}"
           viewBox="0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}">
        <!-- Grid -->
        ${renderGrid()}
        
        <!-- Beat markers -->
        ${renderBeatMarkers(beats)}
        
        <!-- Curve path -->
        ${renderCurvePath(curve)}
        
        <!-- Control points -->
        ${renderControlPoints(curve)}
      </svg>
      <div class="tension-actions">
        <button id="add-tension-point" class="btn-small">+ Add Point</button>
        <button id="reset-tension" class="btn-small">Reset</button>
      </div>
    </div>
  `;
  
  attachCurveListeners();
}

/**
 * Render background grid
 */
function renderGrid() {
  const lines = [];
  
  // Horizontal lines (tension levels 1-5)
  for (let t = 1; t <= 5; t++) {
    const y = tensionToY(t);
    lines.push(`
      <line x1="${PADDING}" y1="${y}" x2="${CURVE_WIDTH - PADDING}" y2="${y}" 
            class="grid-line" stroke-dasharray="3,3"/>
      <text x="${PADDING - 5}" y="${y + 4}" class="grid-label" text-anchor="end">${t}</text>
    `);
  }
  
  // Vertical lines (0%, 25%, 50%, 75%, 100%)
  for (let p = 0; p <= 1; p += 0.25) {
    const x = positionToX(p);
    lines.push(`
      <line x1="${x}" y1="${PADDING}" x2="${x}" y2="${CURVE_HEIGHT - PADDING}" 
            class="grid-line" stroke-dasharray="3,3"/>
      <text x="${x}" y="${CURVE_HEIGHT - 5}" class="grid-label" text-anchor="middle">${Math.round(p * 100)}%</text>
    `);
  }
  
  return `<g class="grid">${lines.join('')}</g>`;
}

/**
 * Render beat position markers
 */
function renderBeatMarkers(beats) {
  return `<g class="beat-markers">
    ${beats.map(beat => {
      const x = positionToX(beat.position);
      return `
        <line x1="${x}" y1="${PADDING}" x2="${x}" y2="${CURVE_HEIGHT - PADDING}" 
              class="beat-marker-line" stroke-dasharray="5,2"/>
        <circle cx="${x}" cy="${PADDING}" r="3" class="beat-marker-dot"/>
      `;
    }).join('')}
  </g>`;
}

/**
 * Render the curve path
 */
function renderCurvePath(curve) {
  if (!curve || curve.length < 2) {
    // Default curve if none defined
    const defaultCurve = [
      { position: 0, tension: 2 },
      { position: 0.5, tension: 4 },
      { position: 1, tension: 2 }
    ];
    return renderCurvePathFromPoints(defaultCurve);
  }
  
  return renderCurvePathFromPoints(curve);
}

/**
 * Generate SVG path from curve points
 */
function renderCurvePathFromPoints(points) {
  const sorted = [...points].sort((a, b) => a.position - b.position);
  
  if (sorted.length === 0) return '';
  if (sorted.length === 1) {
    const x = positionToX(sorted[0].position);
    const y = tensionToY(sorted[0].tension);
    return `<circle cx="${x}" cy="${y}" r="4" class="curve-single-point"/>`;
  }
  
  // Build smooth curve using cubic bezier
  let d = `M ${positionToX(sorted[0].position)} ${tensionToY(sorted[0].tension)}`;
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    const x1 = positionToX(prev.position);
    const y1 = tensionToY(prev.tension);
    const x2 = positionToX(curr.position);
    const y2 = tensionToY(curr.tension);
    
    // Simple curve with control points
    const cx1 = x1 + (x2 - x1) * 0.4;
    const cx2 = x1 + (x2 - x1) * 0.6;
    
    d += ` C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
  }
  
  return `<path d="${d}" class="tension-curve-path" fill="none"/>`;
}

/**
 * Render draggable control points
 */
function renderControlPoints(curve) {
  if (!curve || curve.length === 0) return '';
  
  return `<g class="control-points">
    ${curve.map((point, idx) => {
      const x = positionToX(point.position);
      const y = tensionToY(point.tension);
      return `
        <circle cx="${x}" cy="${y}" r="8" 
                class="control-point" 
                data-index="${idx}"
                data-position="${point.position}"
                data-tension="${point.tension}"/>
      `;
    }).join('')}
  </g>`;
}

/**
 * Convert position (0-1) to X coordinate
 */
function positionToX(position) {
  return PADDING + position * (CURVE_WIDTH - 2 * PADDING);
}

/**
 * Convert X coordinate to position (0-1)
 */
function xToPosition(x) {
  return Math.max(0, Math.min(1, (x - PADDING) / (CURVE_WIDTH - 2 * PADDING)));
}

/**
 * Convert tension (1-5) to Y coordinate
 */
function tensionToY(tension) {
  // Invert because Y grows downward
  return CURVE_HEIGHT - PADDING - ((tension - 1) / 4) * (CURVE_HEIGHT - 2 * PADDING);
}

/**
 * Convert Y coordinate to tension (1-5)
 */
function yToTension(y) {
  const normalized = (CURVE_HEIGHT - PADDING - y) / (CURVE_HEIGHT - 2 * PADDING);
  return Math.max(1, Math.min(5, Math.round(1 + normalized * 4)));
}

/**
 * Attach event listeners for curve interaction
 */
function attachCurveListeners() {
  const svg = curveContainer?.querySelector('.tension-svg');
  if (!svg) return;
  
  // Control point dragging
  svg.addEventListener('mousedown', (e) => {
    const point = e.target.closest('.control-point');
    if (point) {
      isDragging = true;
      dragPointIndex = parseInt(point.dataset.index);
      e.preventDefault();
    }
  });
  
  svg.addEventListener('mousemove', (e) => {
    if (!isDragging || dragPointIndex < 0) return;
    
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const position = xToPosition(x);
    const tension = yToTension(y);
    
    // Update the curve point
    const curve = [...state.project.blueprint.tensionCurve];
    if (curve[dragPointIndex]) {
      curve[dragPointIndex] = { position, tension };
      setTensionCurve(curve);
      renderTensionCurve(curveContainer);
    }
  });
  
  svg.addEventListener('mouseup', () => {
    isDragging = false;
    dragPointIndex = -1;
  });
  
  svg.addEventListener('mouseleave', () => {
    isDragging = false;
    dragPointIndex = -1;
  });
  
  // Add point button
  const addBtn = document.getElementById('add-tension-point');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const curve = [...state.project.blueprint.tensionCurve];
      // Add point at middle with default tension
      curve.push({ position: 0.5, tension: 3 });
      curve.sort((a, b) => a.position - b.position);
      setTensionCurve(curve);
      renderTensionCurve(curveContainer);
    });
  }
  
  // Reset button
  const resetBtn = document.getElementById('reset-tension');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setTensionCurve([
        { position: 0, tension: 2 },
        { position: 0.25, tension: 3 },
        { position: 0.5, tension: 5 },
        { position: 0.75, tension: 3 },
        { position: 1, tension: 2 }
      ]);
      renderTensionCurve(curveContainer);
    });
  }
}

export default {
  renderTensionCurve
};
