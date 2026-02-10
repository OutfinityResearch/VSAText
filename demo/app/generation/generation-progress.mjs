/**
 * SCRIPTA Demo - Generation Progress Tracker
 *
 * Tracks generation phases, elapsed time, and adaptive ETA (seconds).
 * Phase timing averages are persisted locally to improve future estimates.
 */

const STORAGE_KEY = 'scripta.generation.phaseStats.v1';
const EWMA_ALPHA = 0.35;
const TICK_MS = 500;

const PHASE_PROFILES = {
  llm: [
    { key: 'connect', label: 'Connecting to LLM service', defaultSec: 2 },
    { key: 'request_specs', label: 'Generating CNL specs with LLM', defaultSec: 28 },
    { key: 'parse_response', label: 'Validating and parsing JSON response', defaultSec: 6 },
    { key: 'apply_result', label: 'Applying generated specs in editor', defaultSec: 2 }
  ],
  advanced: [
    { key: 'optimize', label: 'Optimizing specs against quality metrics', defaultSec: 8 },
    { key: 'refine', label: 'Applying optional LLM refinement', defaultSec: 5 },
    { key: 'apply_result', label: 'Applying optimized specs in editor', defaultSec: 2 }
  ],
  random: [
    { key: 'generate', label: 'Generating random specs', defaultSec: 1 }
  ]
};

function safeLoadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function safeSaveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors.
  }
}

function getPhaseProfile(strategy) {
  if (PHASE_PROFILES[strategy]) return PHASE_PROFILES[strategy];
  return PHASE_PROFILES.random;
}

function getExpectedSec(stats, strategy, phaseDef) {
  const value = stats?.[strategy]?.[phaseDef.key];
  if (Number.isFinite(value) && value > 0) return Math.max(1, value);
  return Math.max(1, phaseDef.defaultSec || 1);
}

function updatePhaseAverage(stats, strategy, phaseKey, durationSec) {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return;
  if (!stats[strategy]) stats[strategy] = {};
  const prev = stats[strategy][phaseKey];
  const next = Number.isFinite(prev)
    ? (prev * (1 - EWMA_ALPHA)) + (durationSec * EWMA_ALPHA)
    : durationSec;
  stats[strategy][phaseKey] = Math.max(0.5, next);
}

function makePhaseDef(phaseDefs, key, label) {
  const existing = phaseDefs.find(p => p.key === key);
  if (existing) return existing;
  return { key, label: label || key, defaultSec: 6 };
}

function isFn(value) {
  return typeof value === 'function';
}

export function createGenerationProgressTracker(strategy, onUpdate) {
  const phaseDefs = getPhaseProfile(strategy);
  const stats = safeLoadStats();
  const runStartedAt = Date.now();
  const completed = [];

  let activePhase = null;
  let timerId = null;
  let status = 'running';

  function toSec(ms) {
    return Math.max(0, ms / 1000);
  }

  function roundSec(sec) {
    return Math.max(0, Math.round(sec));
  }

  function computeSnapshot(now = Date.now()) {
    const elapsedSec = toSec(now - runStartedAt);
    const completedActualSec = completed.reduce((acc, item) => acc + item.durationSec, 0);

    const activeElapsedSec = activePhase ? toSec(now - activePhase.startedAt) : 0;
    const activeIdx = activePhase
      ? phaseDefs.findIndex(p => p.key === activePhase.key)
      : -1;

    const activeExpectedSec = activePhase
      ? getExpectedSec(stats, strategy, activePhase.phaseDef)
      : 0;
    const dynamicActiveExpectedSec = activePhase
      ? Math.max(activeExpectedSec, activeElapsedSec * 1.15)
      : 0;

    let futureExpectedSec = 0;
    if (activeIdx >= 0) {
      for (let i = activeIdx + 1; i < phaseDefs.length; i += 1) {
        futureExpectedSec += getExpectedSec(stats, strategy, phaseDefs[i]);
      }
    }

    const remainingCurrentSec = activePhase
      ? Math.max(0, dynamicActiveExpectedSec - activeElapsedSec)
      : 0;

    const estimatedTotalSec = completedActualSec
      + (activePhase ? Math.max(dynamicActiveExpectedSec, activeElapsedSec, 1) : 0)
      + futureExpectedSec;

    const estimatedDoneSec = completedActualSec
      + (activePhase ? Math.min(activeElapsedSec, activeExpectedSec) : 0);

    let progress = estimatedTotalSec > 0
      ? Math.round((estimatedDoneSec / estimatedTotalSec) * 100)
      : 0;

    if (status === 'completed') progress = 100;
    else if (status === 'running') progress = Math.max(1, Math.min(99, progress));
    else progress = Math.max(0, Math.min(99, progress));

    const etaSec = status === 'running'
      ? roundSec(remainingCurrentSec + futureExpectedSec)
      : 0;

    return {
      status,
      strategy,
      phaseKey: activePhase?.key || null,
      phaseLabel: activePhase?.label || null,
      elapsedSec: roundSec(elapsedSec),
      etaSec,
      progress
    };
  }

  function emit(now = Date.now()) {
    if (!isFn(onUpdate)) return;
    onUpdate(computeSnapshot(now));
  }

  function ensureTimer() {
    if (timerId) return;
    timerId = setInterval(() => emit(Date.now()), TICK_MS);
  }

  function stopTimer() {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
  }

  function finalizeActivePhase(now = Date.now(), persist = true) {
    if (!activePhase) return;
    const durationSec = Math.max(0.2, toSec(now - activePhase.startedAt));
    completed.push({ key: activePhase.key, durationSec });
    if (persist) {
      updatePhaseAverage(stats, strategy, activePhase.key, durationSec);
      safeSaveStats(stats);
    }
    activePhase = null;
  }

  function setPhase(key, label) {
    if (status !== 'running') return;
    if (!key) return;
    ensureTimer();

    const now = Date.now();
    if (activePhase && activePhase.key === key) {
      if (label) activePhase.label = label;
      emit(now);
      return;
    }

    finalizeActivePhase(now, true);
    const phaseDef = makePhaseDef(phaseDefs, key, label);
    activePhase = {
      key,
      label: label || phaseDef.label,
      phaseDef,
      startedAt: now
    };
    emit(now);
  }

  function complete(finalLabel = 'Generation complete') {
    if (status !== 'running') return;
    const now = Date.now();
    finalizeActivePhase(now, true);
    status = 'completed';
    stopTimer();
    if (isFn(onUpdate)) {
      onUpdate({
        status,
        strategy,
        phaseKey: 'complete',
        phaseLabel: finalLabel,
        elapsedSec: roundSec(toSec(now - runStartedAt)),
        etaSec: 0,
        progress: 100
      });
    }
  }

  function cancel(finalLabel = 'Generation cancelled') {
    if (status !== 'running') return;
    const now = Date.now();
    finalizeActivePhase(now, false);
    status = 'cancelled';
    stopTimer();
    if (isFn(onUpdate)) {
      onUpdate({
        status,
        strategy,
        phaseKey: 'cancelled',
        phaseLabel: finalLabel,
        elapsedSec: roundSec(toSec(now - runStartedAt)),
        etaSec: 0,
        progress: 0
      });
    }
  }

  return {
    setPhase,
    complete,
    cancel,
    getSnapshot: () => computeSnapshot(Date.now())
  };
}

export default {
  createGenerationProgressTracker
};
