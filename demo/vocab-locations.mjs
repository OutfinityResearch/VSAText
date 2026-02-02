/**
 * SCRIPTA Vocabulary - Locations Module
 * 
 * Location geography, time periods, and characteristics.
 */

// ============================================
// LOCATION GEOGRAPHY
// ============================================
export const LOCATION_GEOGRAPHY = {
  // Natural
  forest: { label: 'Forest', desc: 'Dense woodland with ancient trees', category: 'natural' },
  mountain: { label: 'Mountain', desc: 'High peaks reaching toward the sky', category: 'natural' },
  ocean: { label: 'Ocean', desc: 'Vast body of water, mysterious depths', category: 'natural' },
  desert: { label: 'Desert', desc: 'Arid wasteland of sand or rock', category: 'natural' },
  river: { label: 'River', desc: 'Flowing water, often a boundary or path', category: 'natural' },
  cave: { label: 'Cave', desc: 'Underground space, hidden secrets', category: 'natural' },
  island: { label: 'Island', desc: 'Land surrounded by water, isolated', category: 'natural' },
  swamp: { label: 'Swamp', desc: 'Murky wetland, treacherous terrain', category: 'natural' },
  plains: { label: 'Plains', desc: 'Open grassland, endless horizons', category: 'natural' },
  jungle: { label: 'Jungle', desc: 'Dense tropical vegetation, teeming life', category: 'natural' },
  tundra: { label: 'Tundra', desc: 'Frozen wasteland, harsh conditions', category: 'natural' },
  volcano: { label: 'Volcano', desc: 'Fiery mountain, destructive power', category: 'natural' },
  
  // Built
  castle: { label: 'Castle', desc: 'Fortified noble residence, power center', category: 'built' },
  village: { label: 'Village', desc: 'Small rural community, simple life', category: 'built' },
  city: { label: 'City', desc: 'Large urban center, hub of activity', category: 'built' },
  temple: { label: 'Temple', desc: 'Sacred religious structure', category: 'built' },
  ruins: { label: 'Ruins', desc: 'Remnants of past civilization', category: 'built' },
  tower: { label: 'Tower', desc: 'Tall isolated structure, often magical', category: 'built' },
  prison: { label: 'Prison', desc: 'Place of confinement and punishment', category: 'built' },
  market: { label: 'Market', desc: 'Trading hub, diverse people gather', category: 'built' },
  palace: { label: 'Palace', desc: 'Grand royal residence, luxury', category: 'built' },
  tavern: { label: 'Tavern', desc: 'Place of rest, stories, and meetings', category: 'built' },
  
  // Liminal (in-between)
  crossroads: { label: 'Crossroads', desc: 'Junction of paths, place of choice', category: 'liminal' },
  bridge: { label: 'Bridge', desc: 'Crossing between two realms', category: 'liminal' },
  threshold: { label: 'Threshold', desc: 'Doorway between worlds', category: 'liminal' },
  shore: { label: 'Shore', desc: 'Where land meets water', category: 'liminal' },
  borderland: { label: 'Borderland', desc: 'Edge between territories', category: 'liminal' }
};

// ============================================
// LOCATION TIME PERIODS
// ============================================
export const LOCATION_TIME = {
  ancient: { label: 'Ancient', desc: 'Thousands of years in the past, early civilizations' },
  medieval: { label: 'Medieval', desc: 'Middle ages, feudal societies' },
  renaissance: { label: 'Renaissance', desc: 'Period of cultural rebirth and discovery' },
  industrial: { label: 'Industrial', desc: 'Age of machines and factories' },
  modern: { label: 'Modern', desc: 'Contemporary era, current technology' },
  future: { label: 'Future', desc: 'Advanced technology, speculative' },
  timeless: { label: 'Timeless', desc: 'Outside normal time, mythic' },
  post_apocalyptic: { label: 'Post-Apocalyptic', desc: 'After civilization collapse' }
};

// ============================================
// LOCATION CHARACTERISTICS
// ============================================
export const LOCATION_CHARACTERISTICS = {
  // Atmosphere
  sacred: { label: 'Sacred', desc: 'Holy, spiritual significance', category: 'atmosphere' },
  cursed: { label: 'Cursed', desc: 'Under dark magical influence', category: 'atmosphere' },
  haunted: { label: 'Haunted', desc: 'Spirits or memories linger', category: 'atmosphere' },
  enchanted: { label: 'Enchanted', desc: 'Magical properties, wonder', category: 'atmosphere' },
  abandoned: { label: 'Abandoned', desc: 'Empty, forgotten by people', category: 'atmosphere' },
  bustling: { label: 'Bustling', desc: 'Full of activity and people', category: 'atmosphere' },
  serene: { label: 'Serene', desc: 'Peaceful, calming presence', category: 'atmosphere' },
  oppressive: { label: 'Oppressive', desc: 'Heavy, suffocating feeling', category: 'atmosphere' },
  
  // Danger Level
  safe: { label: 'Safe', desc: 'Protected, low threat', category: 'danger' },
  dangerous: { label: 'Dangerous', desc: 'High risk of harm', category: 'danger' },
  treacherous: { label: 'Treacherous', desc: 'Hidden dangers, deceptive', category: 'danger' },
  forbidden: { label: 'Forbidden', desc: 'Entry prohibited, taboo', category: 'danger' },
  
  // Access
  hidden: { label: 'Hidden', desc: 'Concealed, hard to find', category: 'access' },
  isolated: { label: 'Isolated', desc: 'Remote, cut off from world', category: 'access' },
  central: { label: 'Central', desc: 'Hub, many paths converge', category: 'access' },
  underground: { label: 'Underground', desc: 'Below the surface', category: 'access' },
  elevated: { label: 'Elevated', desc: 'High above ground level', category: 'access' },
  
  // Resources
  abundant: { label: 'Abundant', desc: 'Rich in resources', category: 'resources' },
  barren: { label: 'Barren', desc: 'Lacking resources, sparse', category: 'resources' },
  contested: { label: 'Contested', desc: 'Multiple parties claim it', category: 'resources' }
};

// ============================================
// LOCATION NAME LISTS
// ============================================
export const LOCATION_NAMES = [
  'Thornwood', 'Crystalfall', 'Shadowmere', 'Stormhold', 'Dawnshire',
  'Nighthaven', 'Irongate', 'Silverpeak', 'Misthollow', 'Dragonspire',
  'Ravenwatch', 'Goldenvale', 'Frostmoor', 'Sunstone', 'Darkwater',
  'Moonridge', 'Emberdale', 'Starfall', 'Windholm', 'Ashford',
  'Blackthorn', 'Whitecrest', 'Redcliff', 'Greenveil', 'Bluehaven'
];

// ============================================
// OBJECT TYPES (for props/items)
// ============================================
export const OBJECT_TYPES = {
  weapon: { label: 'Weapon', desc: 'Tool of combat or defense', icon: '⚔️' },
  artifact: { label: 'Artifact', desc: 'Object of power or ancient origin', icon: '🔮' },
  key: { label: 'Key', desc: 'Object that unlocks access', icon: '🗝️' },
  gift: { label: 'Gift', desc: 'Given by mentor or ally', icon: '🎁' },
  symbol: { label: 'Symbol', desc: 'Represents abstract concept', icon: '⚜️' },
  container: { label: 'Container', desc: 'Holds something important', icon: '📦' },
  vehicle: { label: 'Vehicle', desc: 'Means of transportation', icon: '🚢' },
  document: { label: 'Document', desc: 'Written information', icon: '📜' },
  clothing: { label: 'Clothing', desc: 'Wearable with significance', icon: '👘' },
  jewelry: { label: 'Jewelry', desc: 'Precious ornament', icon: '💍' }
};

export const OBJECT_SIGNIFICANCE = {
  minor: { label: 'Minor', desc: 'Background detail, mentioned in passing' },
  important: { label: 'Important', desc: 'Affects plot, has narrative weight' },
  central: { label: 'Central', desc: 'Key to the story, major plot element' },
  macguffin: { label: 'MacGuffin', desc: 'Everyone wants it, drives the plot' }
};

export const OBJECT_NAMES = [
  'The Silver Key', 'Ancient Map', 'Crystal Orb', 'Enchanted Blade', 'Sacred Tome',
  'Dragon Scale', 'Phoenix Feather', 'Shadow Cloak', 'Crown of Stars', 'Ring of Power',
  'Sunstone Amulet', 'Moonlight Dagger', 'Stormcaller Staff', 'Iron Crown', 'Jade Mirror',
  'Obsidian Compass', 'Golden Chalice', 'Raven Quill', 'Thunder Hammer', 'Frost Scepter'
];
