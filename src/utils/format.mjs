/**
 * SCRIPTA SDK - Formatting Utilities
 * 
 * Portable formatting functions for CNL and other string operations.
 * Works in both browser and Node.js environments.
 */

/**
 * Format identifier for CNL output.
 * Wraps names containing spaces or special characters in quotes.
 * 
 * @param {string} name - The identifier to format
 * @returns {string} Formatted identifier (quoted if needed)
 * 
 * @example
 * formatId('hero')        // 'hero'
 * formatId('Dark Knight') // '"Dark Knight"'
 * formatId('test@123')    // '"test@123"'
 */
export function formatId(name) {
  if (!name) return '';
  // Quote if contains spaces or non-alphanumeric characters (except underscore)
  return (name.includes(' ') || /[^a-zA-Z0-9_]/.test(name)) ? `"${name}"` : name;
}

/**
 * Alias for formatId (backwards compatibility)
 */
export const fid = formatId;

/**
 * Escape special characters in a string for CNL output.
 * Escapes quotes and backslashes.
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

/**
 * Generate a random ID with optional prefix.
 * 
 * @param {string} prefix - ID prefix (default: 'id')
 * @returns {string} Generated ID
 */
export function generateId(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).substr(2, 8);
}

export default { formatId, fid, escapeString, generateId };
