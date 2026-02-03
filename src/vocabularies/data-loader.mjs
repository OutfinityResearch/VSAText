/**
 * SCRIPTA Data Loader
 * 
 * Universal data loader that works in both Node.js and browser environments.
 * Loads JSON data files from src/data/ directory.
 */

// Environment detection
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Cache for loaded data
const cache = new Map();

/**
 * Load JSON data from a path relative to src/
 * @param {string} relativePath - Path relative to src/ directory
 * @returns {Promise<object>} Parsed JSON data
 */
export async function loadData(relativePath) {
  // Check cache first
  if (cache.has(relativePath)) {
    return cache.get(relativePath);
  }
  
  let data;
  
  if (isNode) {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const fullPath = join(__dirname, '..', relativePath);
    data = JSON.parse(readFileSync(fullPath, 'utf-8'));
  } else {
    // Browser: fetch from server
    const response = await fetch(`/src/${relativePath}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${relativePath}: ${response.status}`);
    }
    data = await response.json();
  }
  
  // Cache the result
  cache.set(relativePath, data);
  return data;
}

/**
 * Load multiple JSON files in parallel
 * @param {string[]} paths - Array of paths relative to src/
 * @returns {Promise<object[]>} Array of parsed JSON data
 */
export async function loadDataMultiple(paths) {
  return Promise.all(paths.map(p => loadData(p)));
}

/**
 * Clear the data cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Preload all vocabulary data files
 * @returns {Promise<void>}
 */
export async function preloadVocabularies() {
  const paths = [
    'data/characters/names.json',
    'data/characters/traits.json',
    'data/characters/archetypes.json',
    'data/characters/relationships.json',
    'data/locations/names.json',
    'data/locations/geography.json',
    'data/objects/names.json',
    'data/objects/types.json',
    'data/narrative/emotions.json',
    'data/narrative/arcs.json',
    'data/narrative/themes.json',
    'data/narrative/blocks.json',
    'data/narrative/actions.json'
  ];
  
  await loadDataMultiple(paths);
}

/**
 * Flatten nested objects with category keys into flat structure
 * Example: { moral: { courage: {...} } } => { courage: {..., category: 'moral'} }
 */
export function flattenWithCategory(nested) {
  const flat = {};
  for (const [category, items] of Object.entries(nested)) {
    if (category === 'meta') continue;
    for (const [key, value] of Object.entries(items)) {
      flat[key] = { ...value, category };
    }
  }
  return flat;
}

export default {
  loadData,
  loadDataMultiple,
  clearCache,
  preloadVocabularies,
  flattenWithCategory
};
