/**
 * Tests for src/utils/markdown.mjs
 * 
 * Tests: parseMarkdown, escapeHtml, splitIntoPages
 */

import { parseMarkdown, escapeHtml, splitIntoPages } from '../../src/utils/markdown.mjs';

// Test: escapeHtml basic
export function testEscapeHtmlBasic() {
  const result = escapeHtml('<script>alert("xss")</script>');
  if (result.includes('<script>')) {
    throw new Error('HTML should be escaped');
  }
  if (!result.includes('&lt;script&gt;')) {
    throw new Error('Expected escaped tags');
  }
}

// Test: escapeHtml empty
export function testEscapeHtmlEmpty() {
  if (escapeHtml('') !== '') {
    throw new Error('Empty string should return empty');
  }
  if (escapeHtml(null) !== '') {
    throw new Error('Null should return empty string');
  }
}

// Test: parseMarkdown headers
export function testParseMarkdownHeaders() {
  const result = parseMarkdown('# Title\n## Subtitle');
  if (!result.includes('<h1>Title</h1>')) {
    throw new Error('Expected h1 tag');
  }
  if (!result.includes('<h2>Subtitle</h2>')) {
    throw new Error('Expected h2 tag');
  }
}

// Test: parseMarkdown bold and italic
export function testParseMarkdownBoldItalic() {
  const result = parseMarkdown('**bold** and *italic*');
  if (!result.includes('<strong>bold</strong>')) {
    throw new Error('Expected strong tag');
  }
  if (!result.includes('<em>italic</em>')) {
    throw new Error('Expected em tag');
  }
}

// Test: parseMarkdown paragraphs
export function testParseMarkdownParagraphs() {
  const result = parseMarkdown('First paragraph.\n\nSecond paragraph.');
  const pCount = (result.match(/<p>/g) || []).length;
  if (pCount !== 2) {
    throw new Error(`Expected 2 paragraphs, got ${pCount}`);
  }
}

// Test: parseMarkdown horizontal rule
export function testParseMarkdownHR() {
  const result = parseMarkdown('Before\n---\nAfter');
  if (!result.includes('<hr>')) {
    throw new Error('Expected hr tag');
  }
}

// Test: parseMarkdown escapes HTML
export function testParseMarkdownEscapesHtml() {
  const result = parseMarkdown('Text with <script> tag');
  if (result.includes('<script>')) {
    throw new Error('HTML should be escaped');
  }
}

// Test: parseMarkdown empty
export function testParseMarkdownEmpty() {
  if (parseMarkdown('') !== '') {
    throw new Error('Empty string should return empty');
  }
  if (parseMarkdown(null) !== '') {
    throw new Error('Null should return empty string');
  }
}

// Test: splitIntoPages basic
export function testSplitIntoPagesBasic() {
  const html = '<h1>Title</h1><p>Some content here.</p><p>More content.</p>';
  const pages = splitIntoPages(html, 100);
  
  if (!Array.isArray(pages)) {
    throw new Error('Expected array of pages');
  }
  if (pages.length === 0) {
    throw new Error('Expected at least one page');
  }
}

// Test: splitIntoPages ensures even pages
export function testSplitIntoPagesEvenCount() {
  const html = '<p>Short content</p>';
  const pages = splitIntoPages(html);
  
  if (pages.length % 2 !== 0) {
    throw new Error('Page count should be even for book view');
  }
}

// Test: splitIntoPages new page on chapter
export function testSplitIntoPagesChapterBreak() {
  const html = '<p>First chapter content.</p><h2>Chapter 2</h2><p>Second chapter content.</p>';
  const pages = splitIntoPages(html, 50);
  
  // Should have multiple pages
  if (pages.length < 2) {
    throw new Error('Expected chapter break to create new page');
  }
}
