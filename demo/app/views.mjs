/**
 * SCRIPTA Demo - Views
 * 
 * Relationships, Emotional Arc, Blocks, World Rules views.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import { updateStats } from './metrics.mjs';
import VOCAB from '../../src/vocabularies/vocabularies.mjs';

// ==================== RELATIONSHIPS VIEW ====================
export function renderRelationshipsView() {
  const container = $('#relationships-view');
  const chars = state.project.libraries.characters;
  const rels = state.project.libraries.relationships;
  
  if (chars.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔗</div><div class="empty-state-text">No characters yet</div><div class="empty-state-hint">Add characters first to create relationships</div></div>`;
    return;
  }
  
  const width = container.clientWidth || 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.38;
  
  const archetypeColors = {
    hero: '#ffd166', mentor: '#9d4edd', shadow: '#e63946', ally: '#06d6a0',
    trickster: '#fb8500', herald: '#4cc9f0', shapeshifter: '#ff6b6b',
    threshold_guardian: '#a8dadc', mother: '#f4a261', father: '#2a9d8f',
    innocent: '#e9c46a', outcast: '#6c757d'
  };
  
  const nodes = chars.map((c, i) => {
    const angle = (i / chars.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...c,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      color: archetypeColors[c.archetype] || '#118ab2'
    };
  });
  
  let edgesHtml = `
    <defs>
      <marker id="arrowhead" markerWidth="12" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <polygon points="0 0, 12 5, 0 10" fill="var(--text-secondary)" />
      </marker>
    </defs>
  `;
  
  rels.forEach(r => {
    const from = nodes.find(n => n.id === r.fromId);
    const to = nodes.find(n => n.id === r.toId);
    if (!from || !to) return;
    const relType = VOCAB.RELATIONSHIP_TYPES[r.type];
    const color = relType?.color || '#8b949e';
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nodeRadius = 44;
    
    const startX = from.x + (dx / dist) * nodeRadius;
    const startY = from.y + (dy / dist) * nodeRadius;
    const endX = to.x - (dx / dist) * nodeRadius;
    const endY = to.y - (dy / dist) * nodeRadius;
    
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 12;
    
    edgesHtml += `<line class="graph-edge" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${color}" marker-end="url(#arrowhead)" />`;
    edgesHtml += `<text class="graph-edge-label" x="${midX}" y="${midY}" text-anchor="middle">${relType?.label || r.type}</text>`;
  });
  
  let nodesHtml = '';
  nodes.forEach(n => {
    nodesHtml += `<g class="graph-node" transform="translate(${n.x},${n.y})" onclick="editEntity('characters','${n.id}')">
      <circle r="40" fill="${n.color}" stroke="#1a1a2e" stroke-width="4" />
      <circle r="40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <text class="node-name" y="-2" text-anchor="middle">${n.name.length > 8 ? n.name.slice(0, 7) + '…' : n.name}</text>
      <text class="node-archetype" y="14" text-anchor="middle">${n.archetype || ''}</text>
    </g>`;
  });
  
  const legendItems = [
    { color: '#ffd166', label: 'Hero' }, { color: '#9d4edd', label: 'Mentor' },
    { color: '#e63946', label: 'Shadow' }, { color: '#06d6a0', label: 'Ally' },
    { color: '#fb8500', label: 'Trickster' }
  ];
  
  let html = `
    <div class="graph-container">
      <svg class="graph-svg" viewBox="0 0 ${width} ${height}">${edgesHtml}${nodesHtml}</svg>
      <div class="graph-controls">
        <button class="btn small" onclick="window.renderRelationshipsView()">Refresh</button>
      </div>
    </div>
    <div class="graph-legend">
      ${legendItems.map(l => `<div class="legend-item"><div class="legend-dot" style="background:${l.color}"></div>${l.label}</div>`).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:0.5rem 0;">
      <h3 style="font-family:var(--font-title);font-size:0.8rem;color:var(--text-muted);">Relationships (${rels.length})</h3>
      <button class="btn" onclick="addRelationship()">+ Add Relationship</button>
    </div>
  `;
  
  if (rels.length > 0) {
    html += `<div class="relationships-list">`;
    rels.forEach(r => {
      const from = chars.find(c => c.id === r.fromId);
      const to = chars.find(c => c.id === r.toId);
      const relType = VOCAB.RELATIONSHIP_TYPES[r.type];
      if (from && to) {
        html += `<div class="relationship-card" style="border-left-color:${relType?.color || '#8b949e'}">
          <span class="rel-from">${from.name}</span>
          <span class="rel-arrow">→</span>
          <span class="rel-type">${relType?.label || r.type}</span>
          <span class="rel-arrow">→</span>
          <span class="rel-to">${to.name}</span>
          <button class="rel-delete" onclick="deleteRelationship('${r.id}')" title="Delete">×</button>
        </div>`;
      }
    });
    html += `</div>`;
  }
  
  container.innerHTML = html;
}

window.renderRelationshipsView = renderRelationshipsView;

window.deleteRelationship = (id) => {
  state.project.libraries.relationships = state.project.libraries.relationships.filter(r => r.id !== id);
  renderRelationshipsView();
  generateCNL();
};

window.addRelationship = () => {
  const chars = state.project.libraries.characters;
  if (chars.length < 2) { alert('Need at least 2 characters'); return; }
  
  const relsByCategory = {};
  Object.entries(VOCAB.RELATIONSHIP_TYPES).forEach(([k, v]) => {
    if (!relsByCategory[v.category]) relsByCategory[v.category] = [];
    relsByCategory[v.category].push({ key: k, ...v });
  });
  
  $('#modal-title').textContent = 'Add Relationship';
  $('#modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">From</label>
      <select class="form-select" id="rel-from">${chars.map(c => `<option value="${c.id}">${c.name} (${c.archetype || ''})</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">To</label>
      <select class="form-select" id="rel-to">${chars.map((c, i) => `<option value="${c.id}" ${i === 1 ? 'selected' : ''}>${c.name} (${c.archetype || ''})</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label class="form-label">Relationship Type</label>
    <select class="form-select" id="rel-type">
      ${Object.entries(relsByCategory).map(([cat, types]) => 
        `<optgroup label="${cat.charAt(0).toUpperCase() + cat.slice(1)}">${types.map(t => 
          `<option value="${t.key}">${t.label}</option>`
        ).join('')}</optgroup>`
      ).join('')}
    </select></div>
    <div class="form-hint">Tip: Relationships appear as edges in the graph above</div>`;
  $('#btn-modal-save').onclick = () => {
    const fromId = $('#rel-from').value;
    const toId = $('#rel-to').value;
    const type = $('#rel-type').value;
    if (fromId === toId) { alert('Cannot create relationship with self'); return; }
    state.project.libraries.relationships.push({ id: genId(), fromId, toId, type });
    closeModal('entity-modal');
    renderRelationshipsView();
    generateCNL();
  };
  openModal('entity-modal');
};

// ==================== EMOTIONAL ARC VIEW ====================
export function renderEmotionalArcView() {
  const container = $('#emotionalarc-view');
  const arc = VOCAB.NARRATIVE_ARCS[state.project.selectedArc];
  const emotionalArc = state.project.libraries.emotionalArc;
  
  if (!arc) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-text">Select a narrative arc first</div></div>`;
    return;
  }
  
  let html = `
    <div style="margin-bottom:1rem;">
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">
        <strong>Emotional Arc</strong> defines the overall emotional journey of your story, independent of scene-level moods.
        Each beat in your narrative arc can have an associated emotional tone.
      </p>
      <p style="font-size:0.75rem;color:var(--text-muted);">
        Arc: <strong>${arc.label}</strong> - ${arc.desc}
      </p>
    </div>
    
    <div class="arc-timeline">
      <div class="arc-timeline-header">
        <span class="arc-timeline-title">Story Beats (${arc.beats.length})</span>
      </div>
      <div class="arc-beats">
  `;
  
  arc.beats.forEach((beat, i) => {
    const savedBeat = emotionalArc.find(e => e.beatKey === beat.key);
    const selectedMood = savedBeat?.moodPreset || '';
    
    html += `
      <div class="arc-beat">
        <div class="arc-beat-position">${Math.round(beat.position * 100)}%</div>
        <div class="arc-beat-label">${beat.label}</div>
        <div class="arc-beat-desc">${beat.desc}</div>
        <div class="arc-beat-mood">
          <select onchange="setArcBeatMood('${beat.key}', this.value)">
            <option value="">-- Select mood --</option>
            ${Object.entries(VOCAB.MOOD_PRESETS).map(([k, v]) => 
              `<option value="${k}" ${selectedMood === k ? 'selected' : ''}>${v.label}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <div style="margin-top:1rem;padding:0.8rem;background:var(--bg-surface);border-radius:4px;">
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;">Emotional Progression</div>
      <div style="display:flex;gap:0.3rem;height:40px;align-items:flex-end;">
        ${arc.beats.map(beat => {
          const savedBeat = emotionalArc.find(e => e.beatKey === beat.key);
          const preset = savedBeat ? VOCAB.MOOD_PRESETS[savedBeat.moodPreset] : null;
          const height = preset ? '100%' : '20%';
          const color = preset?.color || 'var(--bg-elevated)';
          return `<div style="flex:1;height:${height};background:${color};border-radius:2px;" title="${beat.label}: ${preset?.label || 'Not set'}"></div>`;
        }).join('')}
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

window.setArcBeatMood = (beatKey, moodPreset) => {
  const existing = state.project.libraries.emotionalArc.findIndex(e => e.beatKey === beatKey);
  if (existing >= 0) {
    if (moodPreset) {
      state.project.libraries.emotionalArc[existing].moodPreset = moodPreset;
    } else {
      state.project.libraries.emotionalArc.splice(existing, 1);
    }
  } else if (moodPreset) {
    state.project.libraries.emotionalArc.push({ id: genId(), beatKey, moodPreset });
  }
  renderEmotionalArcView();
  generateCNL();
};

// ==================== BLOCKS VIEW ====================
export function renderBlocksView() {
  const container = $('#blocks-view');
  const usedBlocks = getUsedBlocks();
  const phases = ['opening', 'transition', 'confrontation', 'resolution', 'micro'];
  const filter = state.blocksFilter;
  
  let html = `
    <div class="blocks-filter">
      <button class="btn small ${filter === 'all' ? 'active' : ''}" onclick="setBlocksFilter('all')">All</button>
      ${phases.map(p => `<button class="btn small ${filter === p ? 'active' : ''}" onclick="setBlocksFilter('${p}')">${p}</button>`).join('')}
    </div>
    <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">
      Narrative blocks are reusable story patterns. Click a block to see details. Add blocks to scenes via right-click menu in the tree.
    </p>
  `;
  
  const filteredPhases = filter === 'all' ? phases : [filter];
  
  filteredPhases.forEach(phase => {
    const phaseBlocks = Object.entries(VOCAB.NARRATIVE_BLOCKS).filter(([k, v]) => v.phase === phase);
    if (phaseBlocks.length === 0) return;
    
    html += `<div class="blocks-section">
      <div class="blocks-section-title">${phase} (${phaseBlocks.length})</div>
      <div class="entity-grid">
    `;
    
    phaseBlocks.forEach(([k, v]) => {
      const isUsed = usedBlocks.has(k);
      html += `
        <div class="block-card ${isUsed ? 'used' : ''}" onclick="showBlockDetails('${k}')">
          <div class="block-name">${v.label}${isUsed ? ' ✓' : ''}</div>
          <div class="block-desc">${v.desc}</div>
          <div class="block-meta">
            <span class="block-scope">${v.scope}</span>
            ${v.suggestedMoods.map(m => `<span class="entity-tag">${m}</span>`).join('')}
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  container.innerHTML = html;
}

function getUsedBlocks() {
  const used = new Set();
  function traverse(n) {
    if (!n) return;
    if (n.type === 'block-ref' && n.blockKey) used.add(n.blockKey);
    (n.children || []).forEach(traverse);
  }
  traverse(state.project.structure);
  return used;
}

window.setBlocksFilter = (filter) => {
  state.blocksFilter = filter;
  renderBlocksView();
};

window.showBlockDetails = (key) => {
  const block = VOCAB.NARRATIVE_BLOCKS[key];
  if (!block) return;
  
  $('#modal-title').textContent = block.label;
  $('#modal-body').innerHTML = `
    <div style="margin-bottom:1rem;">
      <div style="font-size:0.7rem;color:var(--entity-block);text-transform:uppercase;margin-bottom:0.3rem;">${block.phase} Phase</div>
      <p style="font-size:0.9rem;color:var(--text-primary);margin-bottom:0.5rem;">${block.desc}</p>
      <p style="font-size:0.75rem;color:var(--text-muted);">Scope: ${block.scope}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.3rem;">Suggested Moods</div>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${block.suggestedMoods.map(m => {
          const preset = VOCAB.MOOD_PRESETS[m];
          return `<span style="padding:0.3rem 0.6rem;background:${preset?.color || 'var(--bg-elevated)'};border-radius:4px;font-size:0.75rem;color:white;">${m}</span>`;
        }).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.3rem;">Related Themes</div>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${block.themes.map(t => `<span class="entity-tag">${t}</span>`).join('')}
      </div>
    </div>
  `;
  $('#btn-modal-save').style.display = 'none';
  openModal('entity-modal');
  setTimeout(() => { $('#btn-modal-save').style.display = ''; }, 100);
};

// ==================== WORLD RULES VIEW ====================
export function renderWorldRulesView() {
  const container = $('#worldrules-grid');
  const rules = state.project.libraries.worldRules;
  
  let html = '';
  
  if (rules.length > 0) {
    rules.forEach(r => {
      html += `
        <div class="rule-card" onclick="editWorldRule('${r.id}')">
          <div class="rule-category">${r.category}</div>
          <div class="rule-name">${r.name}</div>
          <div class="rule-desc">${r.description}</div>
          ${r.scope ? `<div class="rule-scope">Applies to: ${r.scope}</div>` : ''}
        </div>
      `;
    });
  }
  
  html += `<div class="add-entity-card" onclick="addWorldRule()"><div class="icon">+</div><span>Add World Rule</span></div>`;
  
  container.innerHTML = html;
}

window.addWorldRule = () => {
  state.editingEntity = null;
  showWorldRuleForm(null);
};

window.editWorldRule = (id) => {
  state.editingEntity = id;
  showWorldRuleForm(state.project.libraries.worldRules.find(r => r.id === id));
};

function showWorldRuleForm(r) {
  const isEdit = !!r;
  $('#modal-title').textContent = (isEdit ? 'Edit' : 'Add') + ' World Rule';
  
  const categories = ['physics', 'magic', 'society', 'technology', 'biology', 'time', 'geography', 'other'];
  
  let html = '';
  if (isEdit) {
    html += `<div style="display:flex;justify-content:flex-end;margin-bottom:0.8rem;">
      <button class="btn danger" onclick="deleteWorldRule('${r.id}')">Delete</button></div>`;
  }
  
  html += `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Rule Name</label>
      <input class="form-input" id="rule-name" value="${r?.name || ''}" placeholder="e.g., Inverse Gravity"></div>
      <div class="form-group"><label class="form-label">Category</label>
      <select class="form-select" id="rule-category">
        ${categories.map(c => `<option value="${c}" ${r?.category === c ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
      </select></div>
    </div>
    <div class="form-group"><label class="form-label">Description</label>
    <textarea class="form-textarea" id="rule-desc" placeholder="Describe how this rule works in your world...">${r?.description || ''}</textarea></div>
    <div class="form-group"><label class="form-label">Scope (optional)</label>
    <input class="form-input" id="rule-scope" value="${r?.scope || ''}" placeholder="e.g., Shadowrealm, Night time, Underground">
    <div class="form-hint">Where or when does this rule apply? Leave empty for global rules.</div></div>
  `;
  
  $('#modal-body').innerHTML = html;
  $('#btn-modal-save').onclick = () => {
    const name = $('#rule-name').value.trim();
    if (!name) { alert('Name is required'); return; }
    
    const rule = isEdit ? state.project.libraries.worldRules.find(x => x.id === state.editingEntity) : { id: genId() };
    rule.name = name;
    rule.category = $('#rule-category').value;
    rule.description = $('#rule-desc').value.trim();
    rule.scope = $('#rule-scope').value.trim();
    
    if (!isEdit) state.project.libraries.worldRules.push(rule);
    closeModal('entity-modal');
    renderWorldRulesView();
    updateStats();
    generateCNL();
  };
  openModal('entity-modal');
}

window.deleteWorldRule = (id) => {
  if (!confirm('Delete this rule?')) return;
  state.project.libraries.worldRules = state.project.libraries.worldRules.filter(r => r.id !== id);
  closeModal('entity-modal');
  renderWorldRulesView();
  updateStats();
  generateCNL();
};
