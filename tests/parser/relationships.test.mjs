/**
 * Tests for CNL Parser - Relationships
 * 
 * Tests: Relationship parsing in both syntaxes
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: DS11 syntax "relates to ... as ..."
export function testRelationshipDS11Syntax() {
  const cnl = `
Hero is hero
Maria is mentor
Hero relates to Maria as mentor_student
`;
  
  const result = parseCNL(cnl);
  const rels = result.ast.relationships;
  
  if (rels.length !== 1) {
    throw new Error(`Expected 1 relationship, got ${rels.length}`);
  }
  if (rels[0].from !== 'Hero' || rels[0].to !== 'Maria') {
    throw new Error('Relationship from/to incorrect');
  }
  if (rels[0].type !== 'mentor_student') {
    throw new Error(`Expected type 'mentor_student', got '${rels[0].type}'`);
  }
}

// Test: DS10 shorthand syntax with underscore
export function testRelationshipDS10Shorthand() {
  const cnl = `
Anna is hero
Gandalf is mentor
Anna mentor_student Gandalf
`;
  
  const result = parseCNL(cnl);
  const rel = result.ast.relationships.find(r =>
    r.from === 'Anna' && r.to === 'Gandalf' && r.type === 'mentor_student'
  );
  
  if (!rel) {
    throw new Error('Expected relationship from DS10 shorthand');
  }
}

// Test: Relationships are added to entity
export function testRelationshipAddedToEntity() {
  const cnl = `
Hero is hero
Villain is shadow
Hero relates to Villain as rivals
`;
  
  const result = parseCNL(cnl);
  const hero = result.ast.entities['Hero'];
  
  if (!hero.relationships || hero.relationships.length === 0) {
    throw new Error('Expected relationship on Hero entity');
  }
  if (hero.relationships[0].target !== 'Villain') {
    throw new Error('Expected relationship target to be Villain');
  }
}

// Test: Emotional verbs create implicit relationships
export function testEmotionalVerbRelationship() {
  const cnl = `
Hero is hero
Dragon is villain
Hero fears Dragon
`;
  
  const result = parseCNL(cnl);
  const rels = result.ast.relationships;
  
  const fearRel = rels.find(r => r.type === 'fears');
  if (!fearRel) {
    throw new Error('Expected implicit relationship from emotional verb');
  }
}
