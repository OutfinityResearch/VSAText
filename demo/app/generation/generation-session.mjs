/**
 * SCRIPTA Demo - Generation Session Controller
 *
 * Manages generation UI state, cancellation, and adaptive progress dialogs.
 */

import { $, openModal, closeModal, showNotification } from '../utils.mjs';
import { createGenerationProgressTracker } from './generation-progress.mjs';

let isGeneratingSpecs = false;
let activeGeneration = null;

function showGeneratingState(strategyName, canCancel = true) {
  isGeneratingSpecs = true;

  const sidebarBtn = $('#btn-generate');
  if (sidebarBtn) {
    sidebarBtn.disabled = true;
    sidebarBtn.classList.add('loading');
  }

  const modalBtn = $('#btn-generate-execute');
  if (modalBtn) {
    modalBtn.disabled = true;
    modalBtn.dataset.originalText = modalBtn.textContent;
    modalBtn.textContent = `Generating (${strategyName})...`;
    modalBtn.classList.add('loading');
  }

  const cancelBtn = $('#btn-generate-cancel');
  if (cancelBtn) {
    cancelBtn.dataset.originalText = cancelBtn.textContent;
    cancelBtn.textContent = canCancel ? 'Stop Generation' : 'Cancel';
    cancelBtn.classList.toggle('danger', canCancel);
    cancelBtn.disabled = false;
  }

  const closeBtn = document.querySelector('#generate-modal .modal-close');
  if (closeBtn) {
    closeBtn.disabled = true;
  }

  document.querySelectorAll('input[name="gen-strategy"]').forEach(r => {
    r.disabled = true;
  });

  document.querySelectorAll('#generate-modal-body .btn.small').forEach(b => {
    b.disabled = true;
  });

  const modalBody = $('#generate-modal-body');
  if (modalBody && !modalBody.querySelector('.generation-loading-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'generation-loading-overlay';
    overlay.innerHTML = `
      <div class="generation-loading-content">
        <div class="nl-spinner"></div>
        <div class="generation-loading-text">Generating specs with ${strategyName}...</div>
        <div class="generation-loading-hint">This may take a moment</div>
      </div>
    `;
    modalBody.appendChild(overlay);
  }
}

function hideGeneratingState() {
  isGeneratingSpecs = false;

  const sidebarBtn = $('#btn-generate');
  if (sidebarBtn) {
    sidebarBtn.disabled = false;
    sidebarBtn.classList.remove('loading');
  }

  const modalBtn = $('#btn-generate-execute');
  if (modalBtn) {
    modalBtn.disabled = false;
    if (modalBtn.dataset.originalText) {
      modalBtn.textContent = modalBtn.dataset.originalText;
    }
    modalBtn.classList.remove('loading');
  }

  const cancelBtn = $('#btn-generate-cancel');
  if (cancelBtn) {
    cancelBtn.disabled = false;
    if (cancelBtn.dataset.originalText) {
      cancelBtn.textContent = cancelBtn.dataset.originalText;
    }
    cancelBtn.classList.remove('danger');
  }

  const closeBtn = document.querySelector('#generate-modal .modal-close');
  if (closeBtn) {
    closeBtn.disabled = false;
  }

  document.querySelectorAll('input[name="gen-strategy"]').forEach(r => {
    r.disabled = false;
  });

  document.querySelectorAll('#generate-modal-body .btn.small').forEach(b => {
    b.disabled = false;
  });

  const overlay = document.querySelector('.generation-loading-overlay');
  if (overlay) overlay.remove();
}

function showBlockingLLMDialog() {
  const title = $('#generation-progress-title');
  const phase = $('#generation-progress-phase');
  const elapsed = $('#generation-progress-elapsed');
  const eta = $('#generation-progress-eta');
  const bar = $('#generation-progress-bar');
  const hint = $('#generation-progress-hint');

  if (title) title.textContent = 'Generating Specs with LLM';
  if (phase) phase.textContent = 'Initializing...';
  if (elapsed) elapsed.textContent = '0s';
  if (eta) eta.textContent = '--';
  if (bar) bar.style.width = '1%';
  if (hint) hint.textContent = 'Building initial CNL specification.';

  openModal('generation-progress-modal');
}

function hideBlockingLLMDialog() {
  closeModal('generation-progress-modal');
}

function updateBlockingLLMDialog(snapshot) {
  const phase = $('#generation-progress-phase');
  const elapsed = $('#generation-progress-elapsed');
  const eta = $('#generation-progress-eta');
  const bar = $('#generation-progress-bar');
  const hint = $('#generation-progress-hint');

  if (phase && snapshot?.phaseLabel) {
    phase.textContent = snapshot.phaseLabel;
  }
  if (elapsed) {
    elapsed.textContent = `${snapshot?.elapsedSec ?? 0}s`;
  }
  if (eta) {
    eta.textContent = snapshot?.status === 'running'
      ? `${snapshot?.etaSec ?? 0}s`
      : '0s';
  }
  if (bar) {
    const pct = Math.max(0, Math.min(100, Number(snapshot?.progress || 0)));
    bar.style.width = `${pct}%`;
  }

  if (hint) {
    if (snapshot?.status === 'cancelled') {
      hint.textContent = 'Cancelling generation...';
    } else if (snapshot?.status === 'completed') {
      hint.textContent = 'Generation finished.';
    } else {
      hint.textContent = 'ETA adapts based on measured phase durations.';
    }
  }
}

function createGenerationSession(strategy, strategyName) {
  const controller = new AbortController();

  const session = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    strategy,
    strategyName,
    controller,
    cancelled: false,
    finished: false,
    tracker: createGenerationProgressTracker(strategy, (snapshot) => {
      if (strategy === 'llm') {
        updateBlockingLLMDialog(snapshot);
      }
    }),
    onPhase(phase) {
      if (this.finished || this.cancelled) return;
      if (!phase?.key) return;
      this.tracker?.setPhase(phase.key, phase.label);
    },
    isCancelled() {
      return this.cancelled || this.controller.signal.aborted;
    }
  };

  activeGeneration = session;
  return session;
}

export function isGenerationInProgress() {
  return isGeneratingSpecs;
}

export function startGenerationSession(strategy, strategyName) {
  const session = createGenerationSession(strategy, strategyName);
  showGeneratingState(strategyName, true);
  if (strategy === 'llm') {
    showBlockingLLMDialog();
  }
  return session;
}

export function finishGenerationSession(session, outcome = 'success', notifyCancel = false) {
  if (!session || session.finished) return;
  session.finished = true;

  if (outcome === 'success') {
    session.tracker?.complete('Generation complete');
  } else if (outcome === 'cancelled') {
    session.tracker?.cancel('Generation cancelled');
  } else {
    session.tracker?.cancel('Generation failed');
  }

  hideBlockingLLMDialog();
  hideGeneratingState();

  if (activeGeneration && activeGeneration.id === session.id) {
    activeGeneration = null;
  }

  if (notifyCancel) {
    showNotification('Generation cancelled. The in-progress result was discarded.', 'warning');
  }
}

export function cancelActiveGeneration(notify = true) {
  const session = activeGeneration;
  if (!session || session.finished || session.cancelled) return;

  session.cancelled = true;
  try {
    session.controller.abort();
  } catch {
    // Ignore abort errors.
  }

  finishGenerationSession(session, 'cancelled', notify);
}

function handleGenerateModalCancel() {
  if (isGeneratingSpecs) {
    cancelActiveGeneration(true);
    return;
  }
  closeModal('generate-modal');
}

export function initGenerationModalActions() {
  const cancelBtn = $('#btn-generate-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = handleGenerateModalCancel;
  }

  const progressCancelBtn = $('#btn-generation-progress-cancel');
  if (progressCancelBtn) {
    progressCancelBtn.onclick = () => cancelActiveGeneration(true);
  }
}

window.cancelActiveGeneration = () => cancelActiveGeneration(true);
window.handleGenerateModalCancel = handleGenerateModalCancel;

export default {
  isGenerationInProgress,
  startGenerationSession,
  finishGenerationSession,
  cancelActiveGeneration,
  initGenerationModalActions
};

