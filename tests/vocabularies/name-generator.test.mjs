/**
 * Tests for Vocabularies - Name Generator
 * 
 * Tests: generateCharacterName, generateLocationName, generateObjectName
 */

import {
  generateCharacterName,
  generateCharacterNames,
  generateLocationName,
  generateLocationNames,
  generateObjectName,
  generateObjectNames,
  quickGenerate
} from '../../src/vocabularies/name-generator.mjs';

// Test: generateCharacterName returns a string
export async function testGenerateCharacterNameReturnsString() {
  const name = await generateCharacterName();
  
  if (typeof name !== 'string') {
    throw new Error('Character name should be a string');
  }
  if (name.length === 0) {
    throw new Error('Character name should not be empty');
  }
}

// Test: generateCharacterName respects genre option
export async function testGenerateCharacterNameRespectsGenre() {
  const fantasyName = await generateCharacterName({ genre: 'fantasy', withSurname: false, withTitle: false });
  const scifiName = await generateCharacterName({ genre: 'scifi', withSurname: false, withTitle: false });
  
  if (typeof fantasyName !== 'string' || fantasyName.length === 0) {
    throw new Error('Fantasy name should be valid');
  }
  if (typeof scifiName !== 'string' || scifiName.length === 0) {
    throw new Error('Scifi name should be valid');
  }
}

// Test: generateCharacterNames returns correct count
export async function testGenerateCharacterNamesCount() {
  const names = await generateCharacterNames(5);
  
  if (!Array.isArray(names)) {
    throw new Error('Should return an array');
  }
  if (names.length !== 5) {
    throw new Error(`Expected 5 names, got ${names.length}`);
  }
}

// Test: generateLocationName returns a string
export async function testGenerateLocationNameReturnsString() {
  const name = await generateLocationName();
  
  if (typeof name !== 'string') {
    throw new Error('Location name should be a string');
  }
  if (name.length === 0) {
    throw new Error('Location name should not be empty');
  }
}

// Test: generateLocationName respects type option
export async function testGenerateLocationNameRespectsType() {
  const tavern = await generateLocationName({ type: 'tavern' });
  const shop = await generateLocationName({ type: 'shop' });
  const temple = await generateLocationName({ type: 'temple' });
  
  if (typeof tavern !== 'string' || tavern.length === 0) {
    throw new Error('Tavern name should be valid');
  }
  if (typeof shop !== 'string' || shop.length === 0) {
    throw new Error('Shop name should be valid');
  }
  if (typeof temple !== 'string' || temple.length === 0) {
    throw new Error('Temple name should be valid');
  }
}

// Test: generateLocationNames returns correct count
export async function testGenerateLocationNamesCount() {
  const names = await generateLocationNames(3);
  
  if (!Array.isArray(names)) {
    throw new Error('Should return an array');
  }
  if (names.length !== 3) {
    throw new Error(`Expected 3 names, got ${names.length}`);
  }
}

// Test: generateObjectName returns a string
export async function testGenerateObjectNameReturnsString() {
  const name = await generateObjectName();
  
  if (typeof name !== 'string') {
    throw new Error('Object name should be a string');
  }
  if (name.length === 0) {
    throw new Error('Object name should not be empty');
  }
}

// Test: generateObjectName respects type option
export async function testGenerateObjectNameRespectsType() {
  const weapon = await generateObjectName({ type: 'weapon' });
  const artifact = await generateObjectName({ type: 'artifact' });
  const mundane = await generateObjectName({ type: 'mundane', generated: false });
  
  if (typeof weapon !== 'string' || weapon.length === 0) {
    throw new Error('Weapon name should be valid');
  }
  if (typeof artifact !== 'string' || artifact.length === 0) {
    throw new Error('Artifact name should be valid');
  }
  if (typeof mundane !== 'string' || mundane.length === 0) {
    throw new Error('Mundane name should be valid');
  }
}

// Test: generateObjectNames returns correct count
export async function testGenerateObjectNamesCount() {
  const names = await generateObjectNames(4);
  
  if (!Array.isArray(names)) {
    throw new Error('Should return an array');
  }
  if (names.length !== 4) {
    throw new Error(`Expected 4 names, got ${names.length}`);
  }
}

// Test: quickGenerate functions work
export async function testQuickGenerateFunctions() {
  const heroName = await quickGenerate.heroName();
  const villainName = await quickGenerate.villainName();
  const townName = await quickGenerate.townName();
  const tavernName = await quickGenerate.tavernName();
  const artifactName = await quickGenerate.artifactName();
  const weaponName = await quickGenerate.weaponName();
  
  const names = [heroName, villainName, townName, tavernName, artifactName, weaponName];
  
  for (const name of names) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('All quickGenerate functions should return valid strings');
    }
  }
}

// Test: Generated mode produces compound names
export async function testGeneratedModeProducesCompoundNames() {
  const name = await generateLocationName({ generated: true, type: 'settlement' });
  
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Generated name should be valid');
  }
  // Generated names combine prefix + suffix, so should be reasonably long
  if (name.length < 5) {
    throw new Error('Generated compound name should be at least 5 characters');
  }
}

// Test: Character name with title includes title
export async function testCharacterNameWithTitle() {
  const name = await generateCharacterName({ withTitle: true, withSurname: false });
  
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Name with title should be valid');
  }
  // Names with titles should have at least 2 parts (title + name)
  const parts = name.split(' ');
  if (parts.length < 2) {
    throw new Error('Name with title should have at least 2 parts');
  }
}

// Test: Character name with surname includes surname
export async function testCharacterNameWithSurname() {
  const name = await generateCharacterName({ withTitle: false, withSurname: true });
  
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Name with surname should be valid');
  }
  // Names with surnames should have at least 2 parts
  const parts = name.split(' ');
  if (parts.length < 2) {
    throw new Error('Name with surname should have at least 2 parts');
  }
}
