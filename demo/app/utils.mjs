/**
 * SCRIPTA Demo - Utility Functions
 */

// DOM helpers
export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

// ID generation
export const genId = (prefix = 'id') => prefix + '_' + Math.random().toString(36).substr(2, 8);
export const generateId = genId; // Alias for compatibility

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

// Notification system
let notificationContainer = null;

export function showNotification(message, type = 'info', duration = 4000) {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('notification-fade');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  return notification;
}

window.showNotification = showNotification;
