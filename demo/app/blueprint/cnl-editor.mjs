/**
 * SCRIPTA Demo - CNL Editor for Blueprint
 * 
 * Text-based CNL editor with syntax highlighting for blueprint definitions.
 */

import state from '../state.mjs';
import { parseCNL } from '/src/cnl-parser/cnl-parser-core.mjs';
import { setBlueprintArc, updateBeatMapping, setTensionCurve, upsertDialogue, upsertSubplot } from '../state.mjs';

let editorContainer = null;
let editorTextarea = null;

/**
 * Initialize the CNL editor
 * @param {HTMLElement} container 
 */
export function initCnlEditor(container) {
  editorContainer = container;
  render();
}

/**
 * Render the CNL editor
 */
export function render() {
  if (!editorContainer) return;
  
  const cnlText = generateBlueprintCNL();
  
  editorContainer.innerHTML = `
    <div class="cnl-editor-container">
      <div class="cnl-toolbar">
        <span class="toolbar-title">Blueprint CNL Editor</span>
        <div class="toolbar-actions">
          <button id="cnl-parse" class="btn-small">Parse</button>
          <button id="cnl-format" class="btn-small">Format</button>
          <button id="cnl-clear" class="btn-small">Clear</button>
        </div>
      </div>
      
      <div class="cnl-editor-wrapper">
        <div class="line-numbers" id="line-numbers"></div>
        <textarea id="cnl-textarea" class="cnl-textarea" spellcheck="false">${escapeHtml(cnlText)}</textarea>
      </div>
      
      <div class="cnl-status" id="cnl-status">
        <span class="status-text">Ready</span>
      </div>
      
      <div class="cnl-errors" id="cnl-errors"></div>
      
      <div class="cnl-help">
        <details>
          <summary>CNL Syntax Reference</summary>
          <div class="help-content">
            ${renderSyntaxHelp()}
          </div>
        </details>
      </div>
    </div>
  `;
  
  editorTextarea = document.getElementById('cnl-textarea');
  updateLineNumbers();
  attachListeners();
}

/**
 * Generate CNL from current blueprint state
 */
function generateBlueprintCNL() {
  const lines = [];
  const bp = state.project.blueprint;
  
  lines.push('// === BLUEPRINT ===');
  lines.push('');
  
  // Arc
  if (bp.arc) {
    lines.push(`Blueprint uses arc ${bp.arc}`);
  }
  lines.push('');
  
  // Beat mappings
  if (bp.beatMappings.length > 0) {
    lines.push('// Beat Mappings');
    for (const m of bp.beatMappings) {
      let line = `Beat ${m.beatKey} mapped to ${m.chapterId}`;
      if (m.sceneId) line += `.${m.sceneId}`;
      lines.push(line);
      if (m.tension) {
        lines.push(`${m.beatKey} has tension ${m.tension}`);
      }
    }
    lines.push('');
  }
  
  // Tension curve
  if (bp.tensionCurve.length > 0) {
    lines.push('// Tension Curve');
    for (const t of bp.tensionCurve) {
      lines.push(`Tension at ${t.position} is ${t.tension}`);
    }
    lines.push('');
  }
  
  // Dialogues
  const dialogues = state.project.libraries.dialogues;
  if (dialogues.length > 0) {
    lines.push('// === DIALOGUES ===');
    lines.push('');
    
    for (const d of dialogues) {
      const loc = d.location ? `${d.location.chapterId}${d.location.sceneId ? '.' + d.location.sceneId : ''}` : 'TBD';
      lines.push(`Dialogue ${d.id} at ${loc}`);
      if (d.purpose) lines.push(`${d.id} has purpose ${d.purpose}`);
      if (d.tone) lines.push(`${d.id} has tone ${d.tone}`);
      if (d.tension) lines.push(`${d.id} has tension ${d.tension}`);
      if (d.beatKey) lines.push(`${d.id} linked to beat ${d.beatKey}`);
      
      for (const p of d.participants || []) {
        lines.push(`${d.id} involves ${p.characterId} as ${p.role}`);
      }
      
      if (d.exchanges && d.exchanges.length > 0) {
        lines.push(`${d.id} exchange begin`);
        for (const ex of d.exchanges) {
          if (ex.intent) lines.push(`  ${ex.speakerId} says intent "${ex.intent}"`);
          if (ex.emotion) lines.push(`  ${ex.speakerId} says emotion ${ex.emotion}`);
          if (ex.sketch) lines.push(`  ${ex.speakerId} says sketch "${ex.sketch}"`);
        }
        lines.push(`${d.id} exchange end`);
      }
      lines.push('');
    }
  }
  
  // Subplots
  const subplots = bp.subplots;
  if (subplots.length > 0) {
    lines.push('// === SUBPLOTS ===');
    lines.push('');
    
    for (const s of subplots) {
      lines.push(`Subplot ${s.id} type ${s.type}`);
      for (const cid of s.characterIds || []) {
        lines.push(`${s.id} involves ${cid}`);
      }
      if (s.startBeat) lines.push(`${s.id} starts at beat ${s.startBeat}`);
      if (s.resolveBeat) lines.push(`${s.id} resolves at beat ${s.resolveBeat}`);
      for (const tp of s.touchpoints || []) {
        const loc = tp.sceneId ? `${tp.chapterId}.${tp.sceneId}` : tp.chapterId;
        lines.push(`${s.id} touchpoint ${loc} event "${tp.event}"`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Parse CNL and apply to state
 */
function parseCNLAndApply() {
  const text = editorTextarea.value;
  const result = parseCNL(text);
  
  const errorsDiv = document.getElementById('cnl-errors');
  const statusDiv = document.getElementById('cnl-status');
  
  if (!result.valid) {
    errorsDiv.innerHTML = `
      <div class="error-list">
        ${result.errors.map(e => `
          <div class="error-item">Line ${e.line}: ${e.message}</div>
        `).join('')}
      </div>
    `;
    statusDiv.innerHTML = `<span class="status-error">Errors: ${result.errors.length}</span>`;
    return;
  }
  
  // Apply parsed data to state
  const ast = result.ast;
  
  // Blueprint
  if (ast.blueprint.arc) {
    setBlueprintArc(ast.blueprint.arc);
  }
  
  for (const mapping of ast.blueprint.beatMappings) {
    updateBeatMapping(mapping.beatKey, mapping);
  }
  
  if (ast.blueprint.tensionCurve.length > 0) {
    setTensionCurve(ast.blueprint.tensionCurve);
  }
  
  // Dialogues
  for (const [id, dialogue] of Object.entries(ast.dialogues)) {
    upsertDialogue(dialogue);
  }
  
  // Subplots
  for (const [id, subplot] of Object.entries(ast.subplots)) {
    upsertSubplot(subplot);
  }
  
  errorsDiv.innerHTML = '';
  statusDiv.innerHTML = `<span class="status-success">Parsed successfully. Applied to blueprint.</span>`;
  
  document.dispatchEvent(new CustomEvent('blueprint-changed'));
}

/**
 * Update line numbers
 */
function updateLineNumbers() {
  const numbersDiv = document.getElementById('line-numbers');
  if (!numbersDiv || !editorTextarea) return;
  
  const lines = editorTextarea.value.split('\n').length;
  numbersDiv.innerHTML = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render syntax help
 */
function renderSyntaxHelp() {
  return `
    <table class="syntax-table">
      <tr><th>Pattern</th><th>Example</th></tr>
      <tr><td>Arc selection</td><td>Blueprint uses arc three_act</td></tr>
      <tr><td>Beat mapping</td><td>Beat midpoint mapped to Ch2.Sc1</td></tr>
      <tr><td>Beat tension</td><td>midpoint has tension 5</td></tr>
      <tr><td>Tension curve</td><td>Tension at 0.5 is 4</td></tr>
      <tr><td>Dialogue marker</td><td>Dialogue D1 at Ch2.Sc1</td></tr>
      <tr><td>Dialogue purpose</td><td>D1 has purpose reveal</td></tr>
      <tr><td>Dialogue tone</td><td>D1 has tone serious</td></tr>
      <tr><td>Dialogue participant</td><td>D1 involves Mentor as speaker</td></tr>
      <tr><td>Dialogue beat link</td><td>D1 linked to beat ordeal</td></tr>
      <tr><td>Exchange block</td><td>D1 exchange begin ... D1 exchange end</td></tr>
      <tr><td>Exchange line</td><td>Hero says intent "question the plan"</td></tr>
      <tr><td>Subplot</td><td>Subplot S1 type romance</td></tr>
      <tr><td>Subplot character</td><td>S1 involves Hero</td></tr>
      <tr><td>Subplot timing</td><td>S1 starts at beat midpoint</td></tr>
      <tr><td>Subplot touchpoint</td><td>S1 touchpoint Ch2 event "first kiss"</td></tr>
    </table>
  `;
}

/**
 * Attach event listeners
 */
function attachListeners() {
  // Parse button
  document.getElementById('cnl-parse')?.addEventListener('click', parseCNLAndApply);
  
  // Format button
  document.getElementById('cnl-format')?.addEventListener('click', () => {
    // Re-generate from state (this formats/cleans up)
    editorTextarea.value = generateBlueprintCNL();
    updateLineNumbers();
  });
  
  // Clear button
  document.getElementById('cnl-clear')?.addEventListener('click', () => {
    if (confirm('Clear all CNL content?')) {
      editorTextarea.value = '// === BLUEPRINT ===\n\n';
      updateLineNumbers();
    }
  });
  
  // Update line numbers on input
  editorTextarea?.addEventListener('input', updateLineNumbers);
  editorTextarea?.addEventListener('scroll', () => {
    const numbersDiv = document.getElementById('line-numbers');
    if (numbersDiv) numbersDiv.scrollTop = editorTextarea.scrollTop;
  });
  
  // Tab key handling
  editorTextarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorTextarea.selectionStart;
      const end = editorTextarea.selectionEnd;
      editorTextarea.value = editorTextarea.value.substring(0, start) + '  ' + editorTextarea.value.substring(end);
      editorTextarea.selectionStart = editorTextarea.selectionEnd = start + 2;
    }
  });
}

export default {
  initCnlEditor,
  render
};
