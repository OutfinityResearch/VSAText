/**
 * SCRIPTA Demo - Metrics Display
 * 
 * Uses SDK evaluation locally in browser.
 * Metrics panel is empty until Evaluate is clicked.
 */

import { state } from './state.mjs';
import { $, showNotification } from './utils.mjs';
import { countType } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import { evaluateCNL } from '../../src/evaluate.mjs';

export function updateStats() {
  $('#stat-chars').textContent = state.project.libraries.characters.length;
  $('#stat-locs').textContent = state.project.libraries.locations.length;
  $('#stat-scenes').textContent = countType(state.project.structure, 'scene');
  $('#stat-rules').textContent = state.project.libraries.worldRules.length;
}

/**
 * Evaluate metrics using local SDK evaluation
 * Runs entirely in browser - no server call needed
 */
export async function evaluateMetrics() {
  const metricsContent = $('#metrics-content');
  
  // Show loading state
  metricsContent.innerHTML = `
    <div class="metrics-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Evaluating...</div>
    </div>
  `;
  
  // Generate CNL
  const cnl = generateCNL();
  
  if (!cnl || cnl.trim().length < 50) {
    renderEmptyMetrics('No specification to evaluate. Generate a story first.');
    return;
  }
  
  try {
    // Use local SDK evaluation (runs in browser)
    const result = evaluateCNL(cnl, {
      prose: state.generation?.generatedStory || null,
      targetArc: state.project.selectedArc || null
    });
    
    console.log('[Evaluate] Local SDK result:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Evaluation failed');
    }
    
    // Render results
    renderServerMetrics(result);
    
  } catch (err) {
    console.error('[Evaluate] Error:', err);
    metricsContent.innerHTML = `
      <div class="metrics-error">
        <div class="error-icon">!</div>
        <div class="error-text">Evaluation failed</div>
        <div class="error-detail">${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render metrics from evaluation result
 */
function renderServerMetrics(result) {
  const m = result.metrics;
  const structure = result.structure;
  const refs = result.references;
  
  let html = '';
  
  // NQS Summary
  const nqs = m.nqs;
  const nqsClass = nqs.score >= 0.70 ? 'good' : nqs.score >= 0.50 ? 'warn' : 'bad';
  
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Narrative Quality Score</div>
    <div class="nqs-display ${nqsClass}">
      <div class="nqs-score">${(nqs.score * 100).toFixed(0)}%</div>
      <div class="nqs-label">${nqs.interpretation}</div>
    </div>
    <div class="metric-bar large"><div class="metric-bar-fill" style="width:${nqs.score * 100}%;background:var(--accent-${nqsClass === 'good' ? 'emerald' : nqsClass === 'warn' ? 'amber' : 'rose'})"></div></div>
  </div>`;
  
  // Core Metrics
  const coreMetrics = [
    { key: 'completeness', name: 'Completeness', desc: 'Required elements present' },
    { key: 'coherence', name: 'Coherence', desc: 'Entity usage & structure' },
    { key: 'originality', name: 'Originality', desc: 'Variety of elements' },
    { key: 'explainability', name: 'Explainability', desc: 'Documentation level' }
  ];
  
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Core Metrics</div>
    ${coreMetrics.map(d => {
      const metric = m[d.key];
      if (!metric) return '';
      const v = metric.score || 0;
      const passed = metric.passed;
      const cls = passed ? 'good' : v >= (metric.threshold || 0.5) * 0.7 ? 'warn' : 'bad';
      return `<div class="metric-card">
        <div class="metric-header"><span class="metric-name">${d.name}</span><span class="metric-value ${cls}">${(v * 100).toFixed(0)}%</span></div>
        <div class="metric-bar"><div class="metric-bar-fill" style="width:${v * 100}%;background:var(--accent-${cls === 'good' ? 'emerald' : cls === 'warn' ? 'amber' : 'rose'})"></div></div>
        <div class="metric-detail">${d.desc}</div>
      </div>`;
    }).join('')}
  </div>`;
  
  // Coherence Analysis
  const coherenceMetrics = [
    { key: 'characterContinuity', name: 'Character Continuity', desc: 'Characters in multiple scenes' },
    { key: 'locationLogic', name: 'Location Logic', desc: 'Locations are reused' },
    { key: 'sceneCompleteness', name: 'Scene Completeness', desc: 'Scenes have who/where/what' }
  ];
  
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Coherence Analysis</div>
    <div class="metrics-section-hint">Detects random or incoherent generation</div>
    ${coherenceMetrics.map(d => {
      const metric = m[d.key];
      if (!metric) return '';
      const v = metric.score || 0;
      const passed = metric.passed;
      const cls = passed ? 'good' : v >= (metric.threshold || 0.5) * 0.6 ? 'warn' : 'bad';
      const icon = cls === 'good' ? 'OK' : cls === 'warn' ? '!' : 'X';
      return `<div class="metric-card">
        <div class="metric-header"><span class="metric-name">${d.name}</span><span class="metric-value ${cls}">${(v * 100).toFixed(0)}%</span></div>
        <div class="metric-bar"><div class="metric-bar-fill" style="width:${v * 100}%;background:var(--accent-${cls === 'good' ? 'emerald' : cls === 'warn' ? 'amber' : 'rose'})"></div></div>
        <div class="metric-detail"><span class="metric-icon ${cls}">${icon}</span> ${d.desc}</div>
      </div>`;
    }).join('')}
  </div>`;
  
  // Structure
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Structure</div>
    <div class="metric-breakdown">
      Chapters: ${structure.chapters}<br>
      Scenes: ${structure.scenes}<br>
      Actions: ${structure.actions}<br>
      Blocks: ${structure.blocks}<br>
      Dialogues: ${structure.dialogues}
    </div>
  </div>`;
  
  // Entities
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Entities</div>
    <div class="metric-breakdown">
      Characters: ${structure.characters} (refs: ${refs.characters})<br>
      Locations: ${structure.locations} (refs: ${refs.locations})<br>
      Relationships: ${structure.relationships}<br>
      Themes: ${structure.themes}<br>
      World Rules: ${structure.worldRules}<br>
      Wisdom: ${structure.wisdom}<br>
      Patterns: ${structure.patterns}
    </div>
  </div>`;
  
  // Parse info
  const parseMetric = m.parseSuccess;
  if (parseMetric) {
    const parseClass = parseMetric.passed ? 'good' : 'warn';
    html += `<div class="metrics-section">
      <div class="metrics-section-title">CNL Parse</div>
      <div class="metric-card">
        <div class="metric-header"><span class="metric-name">Parse Success</span><span class="metric-value ${parseClass}">${(parseMetric.score * 100).toFixed(0)}%</span></div>
        <div class="metric-detail">${parseMetric.validLines}/${parseMetric.totalLines} lines valid</div>
      </div>
    </div>`;
  }
  
  // Character Drift
  const cadMetric = m.characterDrift;
  if (cadMetric && cadMetric.details?.length > 0) {
    html += `<div class="metrics-section">
      <div class="metrics-section-title">Character Details</div>
      <div class="metric-breakdown">
        ${cadMetric.details.map(c => 
          `<div class="char-detail">${c.name} <span class="char-archetype">${c.archetype || 'character'}</span> - ${c.traitCount} traits</div>`
        ).join('')}
      </div>
    </div>`;
  }
  
  // Processing info
  html += `<div class="metrics-footer">
    <span>Evaluated: ${new Date(result.evaluatedAt).toLocaleTimeString()}</span>
    <span>${result.processingTimeMs}ms (local)</span>
  </div>`;
  
  $('#metrics-content').innerHTML = html;
}

/**
 * Render empty metrics panel
 */
export function renderEmptyMetrics(message = null) {
  $('#metrics-content').innerHTML = `
    <div class="empty-state" style="padding:1.5rem;">
      <div class="empty-state-icon">Scale</div>
      <div class="empty-state-text">Not Evaluated</div>
      <div class="empty-state-hint">${message || 'Click <strong>Evaluate</strong> button to analyze story quality'}</div>
    </div>
  `;
}

/**
 * Initialize metrics panel as empty
 */
export function initMetrics() {
  renderEmptyMetrics();
}
