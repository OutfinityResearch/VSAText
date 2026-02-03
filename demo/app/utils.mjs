/**
 * SCRIPTA Demo - Utility Functions
 */

// DOM helpers
export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

// ID generation
export const genId = () => 'id_' + Math.random().toString(36).substr(2, 8);

// Array helpers
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, Math.min(n, arr.length));

// Modal helpers
export function openModal(id) {
  document.getElementById(id).classList.add('open');
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Format identifier for CNL
export function fid(n) {
  return n && (n.includes(' ') || /[^a-zA-Z0-9_]/.test(n)) ? `"${n}"` : n;
}

// Make modal helpers globally accessible
window.openModal = openModal;
window.closeModal = closeModal;
