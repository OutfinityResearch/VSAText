/**
 * SCRIPTA Name Generator
 * 
 * Generates random names for characters, locations, and objects
 * using configurable JSON data files.
 * 
 * Works in both Node.js and browser environments.
 */

// Detection of environment
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Cache for loaded data
const dataCache = {
  characters: null,
  locations: null,
  objects: null
};

/**
 * Load JSON data from file
 * @param {string} path - Path to JSON file
 * @returns {Promise<object>} Parsed JSON data
 */
async function loadJSON(path) {
  if (isNode) {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const fullPath = join(__dirname, '..', path);
    return JSON.parse(readFileSync(fullPath, 'utf-8'));
  } else {
    const response = await fetch(`/src/${path}`);
    return response.json();
  }
}

/**
 * Ensure data is loaded
 */
async function ensureData() {
  if (!dataCache.characters) {
    dataCache.characters = await loadJSON('data/characters/names.json');
  }
  if (!dataCache.locations) {
    dataCache.locations = await loadJSON('data/locations/names.json');
  }
  if (!dataCache.objects) {
    dataCache.objects = await loadJSON('data/objects/names.json');
  }
}

/**
 * Pick random item from array
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick N random items from array (without replacement)
 */
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Generate a random character name
 * @param {object} options - Generation options
 * @param {string} options.genre - Genre: 'fantasy', 'scifi', 'medieval', 'modern'
 * @param {string} options.gender - Gender: 'male', 'female', 'neutral'
 * @param {boolean} options.withSurname - Include surname
 * @param {boolean} options.withTitle - Include title
 * @returns {Promise<string>} Generated name
 */
export async function generateCharacterName(options = {}) {
  await ensureData();
  
  const {
    genre = 'fantasy',
    gender = pick(['male', 'female', 'neutral']),
    withSurname = Math.random() > 0.5,
    withTitle = Math.random() > 0.8
  } = options;
  
  const data = dataCache.characters;
  
  // Get first name
  let firstName;
  const genreNames = data[genre] || data.fantasy;
  const genderNames = genreNames[gender] || genreNames.neutral || genreNames.male;
  firstName = pick(genderNames);
  
  // Build full name
  let fullName = firstName;
  
  // Add surname
  if (withSurname) {
    const surnameCategory = genre === 'scifi' ? 'scifi' : 
                           genre === 'fantasy' ? 'fantasy' : 'common';
    const surnames = data.surnames[surnameCategory] || data.surnames.common;
    fullName += ' ' + pick(surnames);
  }
  
  // Add title
  if (withTitle) {
    const titleCategory = pick(Object.keys(data.titles));
    const title = pick(data.titles[titleCategory]);
    fullName = title + ' ' + fullName;
  }
  
  return fullName;
}

/**
 * Generate multiple character names
 * @param {number} count - Number of names to generate
 * @param {object} options - Generation options
 * @returns {Promise<string[]>} Array of generated names
 */
export async function generateCharacterNames(count, options = {}) {
  const names = [];
  for (let i = 0; i < count; i++) {
    names.push(await generateCharacterName(options));
  }
  return names;
}

/**
 * Generate a random location name
 * @param {object} options - Generation options
 * @param {string} options.genre - Genre: 'fantasy', 'scifi', 'medieval', 'horror'
 * @param {string} options.type - Type: 'settlement', 'natural', 'tavern', 'shop', 'temple'
 * @param {boolean} options.generated - Use procedural generation vs standalone names
 * @returns {Promise<string>} Generated name
 */
export async function generateLocationName(options = {}) {
  await ensureData();
  
  const {
    genre = 'fantasy',
    type = 'settlement',
    generated = Math.random() > 0.5
  } = options;
  
  const data = dataCache.locations;
  
  // Special types with descriptive names
  if (type === 'tavern') {
    return pick(data.descriptive.taverns);
  }
  if (type === 'shop') {
    return pick(data.descriptive.shops);
  }
  if (type === 'temple') {
    return pick(data.descriptive.temples);
  }
  
  // Use standalone names
  if (!generated) {
    const standaloneGenre = data.standalone[genre] || data.standalone.fantasy;
    return pick(standaloneGenre);
  }
  
  // Procedural generation
  const prefixCategory = pick(['nature', 'color', 'direction', 'age']);
  const prefix = pick(data.prefixes[prefixCategory]);
  
  const suffixCategory = type === 'natural' ? 'natural' : 
                        type === 'structure' ? 'structures' : 'settlements';
  const suffix = pick(data.suffixes[suffixCategory]);
  
  return prefix + suffix;
}

/**
 * Generate multiple location names
 * @param {number} count - Number of names to generate
 * @param {object} options - Generation options
 * @returns {Promise<string[]>} Array of generated names
 */
export async function generateLocationNames(count, options = {}) {
  const names = [];
  for (let i = 0; i < count; i++) {
    names.push(await generateLocationName(options));
  }
  return names;
}

/**
 * Generate a random object name
 * @param {object} options - Generation options
 * @param {string} options.type - Type: 'weapon', 'artifact', 'mundane', 'legendary'
 * @param {boolean} options.generated - Use procedural generation
 * @returns {Promise<string>} Generated name
 */
export async function generateObjectName(options = {}) {
  await ensureData();
  
  const {
    type = 'artifact',
    generated = Math.random() > 0.6
  } = options;
  
  const data = dataCache.objects;
  
  // Use predefined names
  if (!generated) {
    if (type === 'weapon') {
      return pick(data.named.weapons);
    }
    if (type === 'mundane') {
      return pick(data.named.mundane);
    }
    return pick(data.named.legendary);
  }
  
  // Procedural generation
  const prefixType = Math.random() > 0.5 ? 'materials' : 'qualities';
  const prefix = pick(data.prefixes[prefixType]);
  
  let baseName;
  if (type === 'weapon') {
    const weaponType = pick(Object.keys(data.weapons));
    baseName = pick(data.weapons[weaponType]);
  } else {
    const artifactType = pick(Object.keys(data.artifacts));
    baseName = pick(data.artifacts[artifactType]);
  }
  
  return prefix + ' ' + baseName;
}

/**
 * Generate multiple object names
 * @param {number} count - Number of names to generate
 * @param {object} options - Generation options
 * @returns {Promise<string[]>} Array of generated names
 */
export async function generateObjectNames(count, options = {}) {
  const names = [];
  for (let i = 0; i < count; i++) {
    names.push(await generateObjectName(options));
  }
  return names;
}

/**
 * Quick generation for common use cases
 */
export const quickGenerate = {
  async heroName() {
    return generateCharacterName({ genre: 'fantasy', withSurname: true, withTitle: false });
  },
  async villainName() {
    return generateCharacterName({ genre: 'fantasy', withSurname: true, withTitle: true });
  },
  async townName() {
    return generateLocationName({ type: 'settlement', generated: true });
  },
  async dungeonName() {
    return generateLocationName({ type: 'structure', genre: 'horror' });
  },
  async tavernName() {
    return generateLocationName({ type: 'tavern' });
  },
  async artifactName() {
    return generateObjectName({ type: 'legendary' });
  },
  async weaponName() {
    return generateObjectName({ type: 'weapon' });
  }
};

export default {
  generateCharacterName,
  generateCharacterNames,
  generateLocationName,
  generateLocationNames,
  generateObjectName,
  generateObjectNames,
  quickGenerate
};
