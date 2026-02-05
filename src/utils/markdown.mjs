/**
 * Simple Markdown to HTML parser
 * 
 * Portable utility for converting Markdown to HTML.
 * Works in both browser and Node.js environments.
 * 
 * Supports:
 * - Headers (# ## ###)
 * - Bold/Italic (** * __ _)
 * - Horizontal rules (--- ***)
 * - Blockquotes (>)
 * - Paragraphs (auto-wrapped)
 */

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Raw text
 * @returns {string} HTML-safe text
 */
export function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parse Markdown text to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export function parseMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Escape HTML first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');
  
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Paragraphs - wrap text blocks
  const lines = html.split('\n');
  const result = [];
  let currentParagraph = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if it's a block element
    if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>') || 
        trimmed.startsWith('<h3>') || trimmed.startsWith('<hr>') ||
        trimmed.startsWith('<blockquote>')) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        result.push('<p>' + currentParagraph.join(' ') + '</p>');
        currentParagraph = [];
      }
      result.push(trimmed);
    } else if (trimmed === '') {
      // Empty line = paragraph break
      if (currentParagraph.length > 0) {
        result.push('<p>' + currentParagraph.join(' ') + '</p>');
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmed);
    }
  }
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    result.push('<p>' + currentParagraph.join(' ') + '</p>');
  }
  
  // Merge consecutive blockquotes
  html = result.join('\n');
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');
  
  return html;
}

/**
 * Split HTML content into pages for book view
 * Each "page" is roughly 1800 characters for comfortable reading
 * @param {string} htmlContent - HTML content to split
 * @param {number} charsPerPage - Target characters per page (default 1800)
 * @returns {string[]} Array of HTML page contents
 */
export function splitIntoPages(htmlContent, charsPerPage = 1800) {
  const pages = [];
  
  // Use regex to extract elements (works in browser without DOM)
  const elementRegex = /<(h1|h2|h3|hr|p|blockquote)[^>]*>[\s\S]*?<\/\1>|<hr\s*\/?>/gi;
  const elements = htmlContent.match(elementRegex) || [];
  
  let currentPage = '';
  let currentLength = 0;
  
  for (const el of elements) {
    // Get text length (strip tags for counting)
    const textLength = el.replace(/<[^>]+>/g, '').length;
    
    // If it's a chapter header (h1, h2), start a new page
    if (el.match(/^<h[12]/i)) {
      if (currentPage.trim()) {
        pages.push(currentPage);
      }
      currentPage = el;
      currentLength = textLength;
    } 
    // If adding this element exceeds page limit, start new page
    else if (currentLength + textLength > charsPerPage && currentPage.trim()) {
      pages.push(currentPage);
      currentPage = el;
      currentLength = textLength;
    } 
    // Otherwise add to current page
    else {
      currentPage += el;
      currentLength += textLength;
    }
  }
  
  // Add remaining content
  if (currentPage.trim()) {
    pages.push(currentPage);
  }
  
  // Ensure even number of pages for book view
  if (pages.length % 2 !== 0) {
    pages.push('<p style="text-align: center; color: #8b5a2b; font-style: italic; margin-top: 40%;">- The End -</p>');
  }
  
  return pages;
}

export default { parseMarkdown, escapeHtml, splitIntoPages };
