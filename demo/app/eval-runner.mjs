/**
 * SCRIPTA Evaluation Runner UI
 * 
 * Opens the evaluation page in a new tab.
 */

// ============================================
// Initialize - Button opens new tab
// ============================================

export function initEvalRunner() {
  const btn = document.getElementById('btn-run-eval');
  if (btn) {
    btn.addEventListener('click', () => {
      // Open eval page in new tab, auto-run evaluation
      window.open('/eval.html?auto', '_blank');
    });
  }
}
