/**
 * SCRIPTA Demo - Book Preview Modal
 * 
 * Displays generated story in a book-style page-by-page view.
 * Uses SDK markdown utilities for parsing and pagination.
 */

import { state } from './state.mjs';
import { getGeneratedStory } from './state.mjs';
import { $, showNotification } from './utils.mjs';
import { parseMarkdown, splitIntoPages } from '../../src/utils/markdown.mjs';

// Book preview state
let bookPages = [];
let currentBookPage = 0;

/**
 * Open book preview modal
 */
export function openBookPreview() {
  const story = getGeneratedStory();
  if (!story) {
    showNotification?.('No story to preview. Generate a story first.', 'info');
    return;
  }
  
  const modal = $('#book-preview-modal');
  if (!modal) return;
  
  // Set title
  const titleEl = $('#book-preview-title');
  if (titleEl) {
    titleEl.textContent = state.project.name || 'Untitled Story';
  }
  
  // Parse markdown and split into pages
  const htmlContent = parseMarkdown(story);
  bookPages = splitIntoPages(htmlContent);
  currentBookPage = 0;
  
  // Render first spread
  renderBookSpread();
  
  // Show modal
  modal.classList.add('active');
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleBookKeyNav);
}

/**
 * Close book preview modal
 */
export function closeBookPreview() {
  const modal = $('#book-preview-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.removeEventListener('keydown', handleBookKeyNav);
}

/**
 * Render current book spread (two pages)
 */
function renderBookSpread() {
  const leftContent = $('#book-page-left-content');
  const rightContent = $('#book-page-right-content');
  const leftNum = $('#book-page-left-num');
  const rightNum = $('#book-page-right-num');
  const indicator = $('#book-page-indicator');
  const prevBtn = $('#book-prev-btn');
  const nextBtn = $('#book-next-btn');
  
  // Left page
  if (leftContent && bookPages[currentBookPage]) {
    leftContent.innerHTML = bookPages[currentBookPage];
  } else if (leftContent) {
    leftContent.innerHTML = '';
  }
  
  // Right page
  if (rightContent && bookPages[currentBookPage + 1]) {
    rightContent.innerHTML = bookPages[currentBookPage + 1];
  } else if (rightContent) {
    rightContent.innerHTML = '';
  }
  
  // Page numbers
  if (leftNum) leftNum.textContent = currentBookPage + 1;
  if (rightNum) rightNum.textContent = currentBookPage + 2;
  
  // Page indicator
  if (indicator) {
    indicator.textContent = `Pages ${currentBookPage + 1}-${Math.min(currentBookPage + 2, bookPages.length)} of ${bookPages.length}`;
  }
  
  // Enable/disable navigation buttons
  if (prevBtn) prevBtn.disabled = currentBookPage === 0;
  if (nextBtn) nextBtn.disabled = currentBookPage + 2 >= bookPages.length;
}

/**
 * Go to previous page spread
 */
export function bookPrevPage() {
  if (currentBookPage > 0) {
    currentBookPage -= 2;
    renderBookSpread();
  }
}

/**
 * Go to next page spread
 */
export function bookNextPage() {
  if (currentBookPage + 2 < bookPages.length) {
    currentBookPage += 2;
    renderBookSpread();
  }
}

/**
 * Handle keyboard navigation in book preview
 */
function handleBookKeyNav(e) {
  if (!$('#book-preview-modal')?.classList.contains('active')) return;
  
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    bookPrevPage();
    e.preventDefault();
  } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    bookNextPage();
    e.preventDefault();
  } else if (e.key === 'Escape') {
    closeBookPreview();
    e.preventDefault();
  }
}

/**
 * Reset book preview state
 */
export function resetBookPreview() {
  bookPages = [];
  currentBookPage = 0;
}

// Expose functions globally for onclick handlers
if (typeof window !== 'undefined') {
  window.bookPrevPage = bookPrevPage;
  window.bookNextPage = bookNextPage;
}
