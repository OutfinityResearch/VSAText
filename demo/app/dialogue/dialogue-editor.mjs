/**
 * SCRIPTA Demo - Dialogue Editor
 * 
 * Editor for creating and editing dialogue outlines.
 */

import state from '../state.mjs';
import { upsertDialogue, removeDialogue, getDialogueById } from '../state.mjs';
import { generateId } from '../utils.mjs';
import { parseAnnotationLines, annotationsToEditorText } from '../cnl-annotations.mjs';

let editorContainer = null;
let selectedDialogueId = null;
let globalOpenHandlerAttached = false;

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

function getAllScenes() {
  const chapters = state.project?.structure?.children || [];
  const scenes = [];
  chapters.forEach(chapter => {
    (chapter?.children || []).forEach(scene => {
      if (scene?.type === 'scene') {
        scenes.push({ chapter, scene });
      }
    });
  });
  return scenes;
}

function getSceneContext(dialogue) {
  const sceneId = dialogue?.location?.sceneId;
  if (!sceneId) return null;
  const pair = getAllScenes().find(item => item.scene.id === sceneId);
  if (!pair) return null;
  return {
    sceneId,
    sceneName: pair.scene.name || pair.scene.title || sceneId,
    chapterName: pair.chapter?.name || pair.chapter?.title || pair.chapter?.id || 'Chapter',
    beatKey: dialogue?.beatKey || pair.scene?.beatKey || null
  };
}

function getDialogueSummary(dialogue, characters) {
  const participants = (dialogue.participants || [])
    .map(p => characters.find(c => c.id === p.characterId)?.name)
    .filter(Boolean);
  return {
    lineCount: (dialogue.exchanges || []).length,
    participantCount: participants.length,
    participantsLabel: participants.join(', ') || 'No participants yet'
  };
}

/**
 * Initialize the dialogue editor
 * @param {HTMLElement} container 
 */
export function initDialogueEditor(container) {
  editorContainer = container;
  if (!globalOpenHandlerAttached) {
    document.addEventListener('open-dialogue-editor', (event) => {
      const dialogueId = event?.detail?.dialogueId;
      if (dialogueId) selectedDialogueId = dialogueId;
      render();
    });
    globalOpenHandlerAttached = true;
  }
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
  const summary = getDialogueSummary(dialogue, characters);
  const sceneContext = getSceneContext(dialogue);
  
  return `
    <div class="dialogue-form">
      <div class="dialogue-form-header">
        <div>
          <div class="dialogue-eyebrow">Dialogue Workspace</div>
          <h3>${escapeHtml(PURPOSES[dialogue.purpose]?.label || 'Dialogue')}</h3>
        </div>
        <button id="close-dialogue-top" class="dialogue-close-btn" title="Close">×</button>
      </div>

      <div class="dialogue-hero">
        <div class="dialogue-hero-main">
          <div class="dialogue-hero-label">Participants</div>
          <div class="dialogue-hero-value">${escapeHtml(summary.participantsLabel)}</div>
          <div class="dialogue-hero-meta">
            <span>${summary.participantCount} participant${summary.participantCount === 1 ? '' : 's'}</span>
            <span>${summary.lineCount} line${summary.lineCount === 1 ? '' : 's'}</span>
            <span>${escapeHtml(dialogue.tone || 'tone not set')}</span>
          </div>
        </div>
        <div class="dialogue-hero-side">
          <div class="dialogue-stat">
            <span class="dialogue-stat-label">Purpose</span>
            <strong>${escapeHtml(PURPOSES[dialogue.purpose]?.label || dialogue.purpose || 'Dialogue')}</strong>
          </div>
          <div class="dialogue-stat">
            <span class="dialogue-stat-label">Tension</span>
            <strong>${escapeHtml(String(dialogue.tension || 3))}/5</strong>
          </div>
        </div>
      </div>

      <div class="dialogue-context-grid">
        <div class="dialogue-context-card">
          <span class="dialogue-context-label">Scene</span>
          <strong>${escapeHtml(sceneContext?.sceneName || 'Not attached to a scene')}</strong>
          <span class="dialogue-context-detail">${escapeHtml(sceneContext ? `${sceneContext.chapterName}${sceneContext.beatKey ? ` • ${sceneContext.beatKey}` : ''}` : 'Dialog remains editable before scene assignment.')}</span>
        </div>
        <div class="dialogue-context-card">
          <span class="dialogue-context-label">Editing Mode</span>
          <strong>Speaker-aware blocks</strong>
          <span class="dialogue-context-detail">Primary focus stays on ordered lines and speaker ownership.</span>
        </div>
      </div>
      
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
        <label>Dialogue Summary</label>
        <textarea id="dialogue-text" rows="4" placeholder="Write or edit the dialogue text...">${escapeHtml(dialogue.text || '')}</textarea>
      </div>

      <div class="form-section">
        <label>CNL Annotations</label>
        <textarea id="dialogue-annotations" rows="3" placeholder="#hint: Keep tension indirect&#10;#subtext: Loyalty conflict">${escapeHtml(annotationsToEditorText(dialogue.annotations || []))}</textarea>
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
        <label>Dialog Lines</label>
        <div class="exchanges-list" id="exchanges-list">
          ${renderExchanges(dialogue.exchanges || [], characters)}
        </div>
        <div class="form-actions-inline">
          <button id="add-exchange" class="btn-small">+ Add Line</button>
        </div>
      </div>
      
      <div class="form-actions">
        <button id="cancel-dialogue" class="btn">Cancel</button>
        <button id="save-dialogue" class="btn btn-primary">Save Changes</button>
      </div>
    </div>
  `;
}

/**
 * Render dialogue exchanges (outline)
 */
function renderExchanges(exchanges, characters) {
  if (!exchanges || exchanges.length === 0) {
    return '<p class="empty-state">No dialog lines yet. Add the first exchange below.</p>';
  }
  
  return exchanges.map((ex, idx) => `
    <div class="exchange-row" data-index="${idx}">
      <div class="exchange-header">
        <div class="exchange-header-main">
          <span class="exchange-index">Line ${idx + 1}</span>
          <select class="exchange-speaker">
            <option value="">-- Speaker --</option>
            ${characters.map(c => `<option value="${c.id}" ${ex.speakerId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="exchange-tools">
          <button class="btn-move-exchange" data-index="${idx}" data-direction="-1" title="Move up">↑</button>
          <button class="btn-move-exchange" data-index="${idx}" data-direction="1" title="Move down">↓</button>
          <button class="btn-remove-exchange" data-index="${idx}" title="Remove line">×</button>
        </div>
      </div>
      <div class="field exchange-primary-field">
        <label>Spoken Line</label>
        <textarea class="exchange-sketch" rows="3" placeholder="Write the spoken line or outline the exchange...">${escapeHtml(ex.sketch || '')}</textarea>
      </div>
      <div class="exchange-fields">
        <div class="exchange-secondary-grid">
        <div class="field">
          <label>Intent</label>
          <input type="text" class="exchange-intent" value="${escapeHtml(ex.intent || '')}" placeholder="What they want to convey...">
        </div>
        <div class="field">
          <label>Conflict Type</label>
          <input type="text" class="exchange-conflict-type" value="${escapeHtml(ex.conflictType || '')}" placeholder="internal, interpersonal, ideological, strategic">
        </div>
        <div class="field">
          <label>Emotion</label>
          <input type="text" class="exchange-emotion" value="${escapeHtml(ex.emotion || '')}" placeholder="How they feel...">
        </div>
        <div class="field">
          <label>Subtext</label>
          <input type="text" class="exchange-subtext" value="${escapeHtml(ex.subtext || '')}" placeholder="What is implied but unsaid...">
        </div>
        <div class="field">
          <label>Information</label>
          <input type="text" class="exchange-information" value="${escapeHtml(ex.information || '')}" placeholder="New/clarified information">
        </div>
        <div class="field">
          <label>Relationship Between Characters</label>
          <input type="text" class="exchange-relationship-between" value="${escapeHtml(ex.relationshipBetweenCharacters || '')}" placeholder="Trust shift, rupture, alliance...">
        </div>
        <div class="field">
          <label>Power</label>
          <input type="text" class="exchange-power" value="${escapeHtml(ex.power || '')}" placeholder="Who controls the interaction now">
        </div>
        <div class="field">
          <label>Emotion Shift</label>
          <input type="text" class="exchange-emotion-shift" value="${escapeHtml(ex.emotionShift || '')}" placeholder="Calm -> Anger, Hope -> Fear">
        </div>
        <div class="field">
          <label>Story Direction</label>
          <input type="text" class="exchange-story-direction" value="${escapeHtml(ex.storyDirection || '')}" placeholder="How this changes next events">
        </div>
        <div class="field">
          <label>Reader Perception</label>
          <input type="text" class="exchange-reader-perception" value="${escapeHtml(ex.readerPerception || '')}" placeholder="How reader interpretation changes">
        </div>
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
  dialogue.text = document.getElementById('dialogue-text')?.value || '';

  // CNL annotations
  dialogue.annotations = parseAnnotationLines(
    document.getElementById('dialogue-annotations')?.value || ''
  );
  
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
    const conflictType = row.querySelector('.exchange-conflict-type')?.value;
    const emotion = row.querySelector('.exchange-emotion')?.value;
    const subtext = row.querySelector('.exchange-subtext')?.value;
    const information = row.querySelector('.exchange-information')?.value;
    const relationshipBetweenCharacters = row.querySelector('.exchange-relationship-between')?.value;
    const power = row.querySelector('.exchange-power')?.value;
    const emotionShift = row.querySelector('.exchange-emotion-shift')?.value;
    const storyDirection = row.querySelector('.exchange-story-direction')?.value;
    const readerPerception = row.querySelector('.exchange-reader-perception')?.value;
    const sketch = row.querySelector('.exchange-sketch')?.value;
    
    if (
      speakerId || intent || conflictType || emotion || subtext || information ||
      relationshipBetweenCharacters || power || emotionShift || storyDirection ||
      readerPerception || sketch
    ) {
      dialogue.exchanges.push({
        speakerId,
        intent,
        conflictType,
        emotion,
        subtext,
        information,
        relationshipBetweenCharacters,
        power,
        emotionShift,
        storyDirection,
        readerPerception,
        sketch
      });
    }
  });
  
  return dialogue;
}

/**
 * Validate participant roles for two-person dialogues.
 * A dialogue with exactly two participants cannot have identical roles.
 */
function validateParticipantRoles(dialogue) {
  const participants = (dialogue?.participants || []).filter(p => p?.characterId);
  if (participants.length !== 2) return true;

  const [first, second] = participants;
  if (first.role && second.role && first.role === second.role) {
    const roleLabel = first.role;
    const message = `Invalid dialogue setup: with 2 participants, roles must differ. Both are set to "${roleLabel}".`;
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error');
    } else {
      alert(message);
    }
    return false;
  }

  return true;
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
      text: '',
      participants: [],
      tone: null,
      tension: 3,
      beatKey: null,
      location: null,
      exchanges: [],
      annotations: []
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

  // Remove participant
  document.querySelectorAll('.btn-remove-participant').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index, 10);
      const dialogue = getDialogueById(selectedDialogueId);
      if (!dialogue || Number.isNaN(index)) return;
      dialogue.participants = (dialogue.participants || []).filter((_, i) => i !== index);
      upsertDialogue(dialogue);
      render();
    });
  });
  
  // Add exchange
  document.getElementById('add-exchange')?.addEventListener('click', () => {
    const dialogue = getDialogueById(selectedDialogueId);
    if (dialogue) {
      dialogue.exchanges = dialogue.exchanges || [];
      const fallbackSpeakerId = dialogue.participants?.find(p => p.role === 'speaker' && p.characterId)?.characterId
        || dialogue.participants?.[0]?.characterId
        || '';
      dialogue.exchanges.push({
        speakerId: fallbackSpeakerId,
        intent: '',
        conflictType: '',
        emotion: '',
        subtext: '',
        information: '',
        relationshipBetweenCharacters: '',
        power: '',
        emotionShift: '',
        storyDirection: '',
        readerPerception: '',
        sketch: ''
      });
      upsertDialogue(dialogue);
      render();
    }
  });

  document.querySelectorAll('.btn-move-exchange').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index, 10);
      const direction = parseInt(btn.dataset.direction, 10);
      const dialogue = getDialogueById(selectedDialogueId);
      if (!dialogue || Number.isNaN(index) || Number.isNaN(direction)) return;
      const exchanges = [...(dialogue.exchanges || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= exchanges.length) return;
      const [item] = exchanges.splice(index, 1);
      exchanges.splice(targetIndex, 0, item);
      dialogue.exchanges = exchanges;
      upsertDialogue(dialogue);
      render();
    });
  });

  // Remove exchange
  document.querySelectorAll('.btn-remove-exchange').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index, 10);
      const dialogue = getDialogueById(selectedDialogueId);
      if (!dialogue || Number.isNaN(index)) return;
      dialogue.exchanges = (dialogue.exchanges || []).filter((_, i) => i !== index);
      upsertDialogue(dialogue);
      render();
    });
  });
  
  // Save
  document.getElementById('save-dialogue')?.addEventListener('click', () => {
    const dialogue = collectFormData();
    if (dialogue) {
      if (!validateParticipantRoles(dialogue)) return;
      upsertDialogue(dialogue);
      document.dispatchEvent(new CustomEvent('dialogue-changed'));
      window.showNotification?.('Dialogue saved.', 'success');
    }
  });
  
  // Cancel
  document.getElementById('cancel-dialogue')?.addEventListener('click', () => {
    selectedDialogueId = null;
    render();
  });

  // Close (top-right)
  document.getElementById('close-dialogue-top')?.addEventListener('click', () => {
    selectedDialogueId = null;
    render();
  });
}

export default {
  initDialogueEditor,
  render
};
