/**
 * SCRIPTA Demo - Dialogue Editor
 * 
 * Editor for creating and editing dialogue outlines.
 */

import state from '../state.mjs';
import { upsertDialogue, removeDialogue, getDialogueById } from '../state.mjs';
import { generateId } from '../utils.mjs';

let editorContainer = null;
let selectedDialogueId = null;

// Dialogue purposes with descriptions
const PURPOSES = {
  revelation: { label: 'Revelation', desc: 'Revealing hidden information', icon: '💡' },
  confrontation: { label: 'Confrontation', desc: 'Direct conflict between characters', icon: '⚔️' },
  bonding: { label: 'Bonding', desc: 'Building relationships', icon: '🤝' },
  exposition: { label: 'Exposition', desc: 'Explaining world or background', icon: '📖' },
  conflict: { label: 'Conflict', desc: 'Disagreement or tension', icon: '⚡' },
  confession: { label: 'Confession', desc: 'Admitting feelings or mistakes', icon: '💭' },
  negotiation: { label: 'Negotiation', desc: 'Bargaining or making deals', icon: '🤞' },
  farewell: { label: 'Farewell', desc: 'Parting or goodbye', icon: '👋' },
  deception: { label: 'Deception', desc: 'Intentionally misleading', icon: '🎭' },
  comic_relief: { label: 'Comic Relief', desc: 'Lightening the mood', icon: '😄' },
  planning: { label: 'Planning', desc: 'Strategizing or preparing', icon: '📋' },
  interrogation: { label: 'Interrogation', desc: 'Extracting information', icon: '🔍' }
};

const TONES = [
  'serious', 'playful', 'tense', 'intimate', 'angry', 'cold', 'warm',
  'nervous', 'sarcastic', 'melancholic', 'determined', 'curious',
  'threatening', 'vulnerable', 'diplomatic', 'excited'
];

/**
 * Initialize the dialogue editor
 * @param {HTMLElement} container 
 */
export function initDialogueEditor(container) {
  editorContainer = container;
  render();
}

/**
 * Render the dialogue editor
 */
export function render() {
  if (!editorContainer) return;
  
  const dialogues = state.project.libraries.dialogues;
  
  editorContainer.innerHTML = `
    <div class="dialogue-editor">
      <div class="dialogue-sidebar">
        <div class="sidebar-header">
          <h3>Dialogues</h3>
          <button id="add-dialogue-btn" class="btn-small">+ New</button>
        </div>
        <div class="dialogue-list">
          ${dialogues.length === 0 
            ? '<p class="empty-state">No dialogues yet</p>'
            : dialogues.map(d => renderDialogueItem(d)).join('')
          }
        </div>
      </div>
      
      <div class="dialogue-main">
        ${selectedDialogueId 
          ? renderDialogueForm(getDialogueById(selectedDialogueId))
          : '<div class="no-selection"><p>Select a dialogue to edit or create a new one</p></div>'
        }
      </div>
    </div>
  `;
  
  attachListeners();
}

/**
 * Render dialogue list item
 */
function renderDialogueItem(dialogue) {
  const purpose = PURPOSES[dialogue.purpose] || { label: dialogue.purpose, icon: '💬' };
  const isSelected = dialogue.id === selectedDialogueId;
  
  return `
    <div class="dialogue-item ${isSelected ? 'selected' : ''}" data-id="${dialogue.id}">
      <span class="item-icon">${purpose.icon}</span>
      <div class="item-info">
        <span class="item-purpose">${purpose.label}</span>
        ${dialogue.beatKey ? `<span class="item-beat">@ ${dialogue.beatKey}</span>` : ''}
      </div>
      <button class="btn-delete" data-id="${dialogue.id}" title="Delete">×</button>
    </div>
  `;
}

/**
 * Render dialogue edit form
 */
function renderDialogueForm(dialogue) {
  if (!dialogue) return '<div class="error">Dialogue not found</div>';
  
  const characters = state.project.libraries.characters;
  
  return `
    <div class="dialogue-form">
      <h3>Edit Dialogue</h3>
      
      <div class="form-section">
        <label>Purpose</label>
        <div class="purpose-grid">
          ${Object.entries(PURPOSES).map(([key, p]) => `
            <label class="purpose-option ${dialogue.purpose === key ? 'selected' : ''}">
              <input type="radio" name="purpose" value="${key}" ${dialogue.purpose === key ? 'checked' : ''}>
              <span class="purpose-icon">${p.icon}</span>
              <span class="purpose-label">${p.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-section">
          <label>Tone</label>
          <select id="dialogue-tone">
            <option value="">-- Select tone --</option>
            ${TONES.map(t => `<option value="${t}" ${dialogue.tone === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-section">
          <label>Tension (1-5)</label>
          <input type="range" id="dialogue-tension" min="1" max="5" value="${dialogue.tension || 3}">
          <span id="tension-display">${dialogue.tension || 3}</span>
        </div>
      </div>
      
      <div class="form-section">
        <label>Participants</label>
        <div class="participants-list">
          ${(dialogue.participants || []).map((p, idx) => `
            <div class="participant-row" data-index="${idx}">
              <select class="participant-character">
                <option value="">-- Character --</option>
                ${characters.map(c => `<option value="${c.id}" ${p.characterId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <select class="participant-role">
                <option value="speaker" ${p.role === 'speaker' ? 'selected' : ''}>Speaker</option>
                <option value="listener" ${p.role === 'listener' ? 'selected' : ''}>Listener</option>
                <option value="participant" ${p.role === 'participant' ? 'selected' : ''}>Participant</option>
              </select>
              <button class="btn-remove-participant" data-index="${idx}">×</button>
            </div>
          `).join('')}
          <button id="add-participant" class="btn-small">+ Add Participant</button>
        </div>
      </div>
      
      <div class="form-section">
        <label>Dialogue Outline (Exchanges)</label>
        <div class="exchanges-list" id="exchanges-list">
          ${renderExchanges(dialogue.exchanges || [], characters)}
        </div>
        <button id="add-exchange" class="btn-small">+ Add Exchange</button>
      </div>
      
      <div class="form-actions">
        <button id="save-dialogue" class="btn btn-primary">Save Changes</button>
        <button id="cancel-dialogue" class="btn">Cancel</button>
      </div>
    </div>
  `;
}

/**
 * Render dialogue exchanges (outline)
 */
function renderExchanges(exchanges, characters) {
  if (!exchanges || exchanges.length === 0) {
    return '<p class="empty-state">No exchanges yet. Add dialogue lines below.</p>';
  }
  
  return exchanges.map((ex, idx) => `
    <div class="exchange-row" data-index="${idx}">
      <div class="exchange-header">
        <select class="exchange-speaker">
          <option value="">-- Speaker --</option>
          ${characters.map(c => `<option value="${c.id}" ${ex.speakerId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <button class="btn-remove-exchange" data-index="${idx}">×</button>
      </div>
      <div class="exchange-fields">
        <div class="field">
          <label>Intent</label>
          <input type="text" class="exchange-intent" value="${escapeHtml(ex.intent || '')}" placeholder="What they want to convey...">
        </div>
        <div class="field">
          <label>Emotion</label>
          <input type="text" class="exchange-emotion" value="${escapeHtml(ex.emotion || '')}" placeholder="How they feel...">
        </div>
        <div class="field">
          <label>Sketch (placeholder line)</label>
          <textarea class="exchange-sketch" rows="2" placeholder="[Schematic replica...]">${escapeHtml(ex.sketch || '')}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Collect form data
 */
function collectFormData() {
  const dialogue = getDialogueById(selectedDialogueId);
  if (!dialogue) return null;
  
  // Purpose
  const purposeInput = document.querySelector('input[name="purpose"]:checked');
  dialogue.purpose = purposeInput?.value || dialogue.purpose;
  
  // Tone
  dialogue.tone = document.getElementById('dialogue-tone')?.value || null;
  
  // Tension
  dialogue.tension = parseInt(document.getElementById('dialogue-tension')?.value) || null;
  
  // Participants
  dialogue.participants = [];
  document.querySelectorAll('.participant-row').forEach(row => {
    const characterId = row.querySelector('.participant-character')?.value;
    const role = row.querySelector('.participant-role')?.value;
    if (characterId) {
      dialogue.participants.push({ characterId, role });
    }
  });
  
  // Exchanges
  dialogue.exchanges = [];
  document.querySelectorAll('.exchange-row').forEach(row => {
    const speakerId = row.querySelector('.exchange-speaker')?.value;
    const intent = row.querySelector('.exchange-intent')?.value;
    const emotion = row.querySelector('.exchange-emotion')?.value;
    const sketch = row.querySelector('.exchange-sketch')?.value;
    
    if (speakerId || intent || sketch) {
      dialogue.exchanges.push({ speakerId, intent, emotion, sketch });
    }
  });
  
  return dialogue;
}

/**
 * Attach event listeners
 */
function attachListeners() {
  // Select dialogue
  document.querySelectorAll('.dialogue-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) return;
      selectedDialogueId = item.dataset.id;
      render();
    });
  });
  
  // Delete dialogue
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this dialogue?')) {
        removeDialogue(btn.dataset.id);
        if (selectedDialogueId === btn.dataset.id) selectedDialogueId = null;
        render();
      }
    });
  });
  
  // Add new dialogue
  document.getElementById('add-dialogue-btn')?.addEventListener('click', () => {
    const newId = generateId('dlg');
    upsertDialogue({
      id: newId,
      purpose: 'revelation',
      participants: [],
      tone: null,
      tension: 3,
      beatKey: null,
      location: null,
      exchanges: []
    });
    selectedDialogueId = newId;
    render();
  });
  
  // Purpose selection
  document.querySelectorAll('input[name="purpose"]').forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll('.purpose-option').forEach(opt => opt.classList.remove('selected'));
      input.closest('.purpose-option').classList.add('selected');
    });
  });
  
  // Tension slider
  document.getElementById('dialogue-tension')?.addEventListener('input', (e) => {
    document.getElementById('tension-display').textContent = e.target.value;
  });
  
  // Add participant
  document.getElementById('add-participant')?.addEventListener('click', () => {
    const dialogue = getDialogueById(selectedDialogueId);
    if (dialogue) {
      dialogue.participants = dialogue.participants || [];
      dialogue.participants.push({ characterId: '', role: 'speaker' });
      upsertDialogue(dialogue);
      render();
    }
  });
  
  // Add exchange
  document.getElementById('add-exchange')?.addEventListener('click', () => {
    const dialogue = getDialogueById(selectedDialogueId);
    if (dialogue) {
      dialogue.exchanges = dialogue.exchanges || [];
      dialogue.exchanges.push({ speakerId: '', intent: '', emotion: '', sketch: '' });
      upsertDialogue(dialogue);
      render();
    }
  });
  
  // Save
  document.getElementById('save-dialogue')?.addEventListener('click', () => {
    const dialogue = collectFormData();
    if (dialogue) {
      upsertDialogue(dialogue);
      document.dispatchEvent(new CustomEvent('dialogue-changed'));
      alert('Dialogue saved!');
    }
  });
  
  // Cancel
  document.getElementById('cancel-dialogue')?.addEventListener('click', () => {
    selectedDialogueId = null;
    render();
  });
}

export default {
  initDialogueEditor,
  render
};
