/**
 * Tests for CNL Serializer
 *
 * Tests: serializeToCNL output is compatible with the unified parser.
 */

import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';
import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Dot scene IDs are not quoted and groups parse correctly
export function testSerializeParsePreservesDotSceneGroups() {
  const project = {
    name: 'Test Story',
    selectedArc: 'heros_journey',
    libraries: {
      characters: [
        { id: 'c1', name: 'Hero', archetype: 'hero', traits: [] },
        { id: 'c2', name: 'Villain', archetype: 'shadow', traits: [] }
      ],
      relationships: [],
      locations: [],
      objects: [],
      moods: [],
      themes: [],
      worldRules: [],
      dialogues: [],
      emotionalArc: [],
      wisdom: [],
      patterns: []
    },
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    structure: {
      id: 'book_1',
      type: 'book',
      name: 'Book',
      title: 'Test Story',
      children: [
        {
          id: 'ch_1',
          type: 'chapter',
          name: 'Ch1',
          title: '',
          children: [
            {
              id: 'sc_1_1',
              type: 'scene',
              name: 'Sc1.1',
              title: '',
              children: []
            }
          ]
        }
      ]
    }
  };

  const cnl = serializeToCNL(project);

  if (cnl.includes('"Sc1.1" group begin')) {
    throw new Error('Expected dot scene ID not to be quoted in group begin');
  }
  if (!cnl.includes('Sc1.1 group begin')) {
    throw new Error('Expected CNL to include "Sc1.1 group begin"');
  }

  const parsed = parseCNL(cnl);
  const scene = parsed.ast.groups?.[0]?.children?.[0]?.children?.[0];
  if (!scene || scene.name !== 'Sc1.1') {
    throw new Error(`Expected parsed scene group name 'Sc1.1', got '${scene?.name}'`);
  }
}

// Test: Actions starting with is_* are serialized as a single verb token
export function testSerializeIsDefeatedByAsSingleTokenVerb() {
  const project = {
    name: 'Test Actions',
    selectedArc: 'heros_journey',
    libraries: {
      characters: [
        { id: 'c1', name: 'Hero', archetype: 'hero', traits: [] },
        { id: 'c2', name: 'Villain', archetype: 'shadow', traits: [] }
      ],
      relationships: [],
      locations: [],
      objects: [],
      moods: [],
      themes: [],
      worldRules: [],
      dialogues: [],
      emotionalArc: [],
      wisdom: [],
      patterns: []
    },
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    structure: {
      id: 'book_1',
      type: 'book',
      name: 'Book',
      title: 'Test Actions',
      children: [
        {
          id: 'ch_1',
          type: 'chapter',
          name: 'Ch1',
          title: '',
          children: [
            {
              id: 'sc_1_1',
              type: 'scene',
              name: 'Sc1.1',
              title: '',
              children: [
                {
                  id: 'act_1',
                  type: 'action',
                  name: 'Hero is_defeated_by Villain',
                  actionData: { subject: 'Hero', action: 'is_defeated_by', target: 'Villain' }
                }
              ]
            }
          ]
        }
      ]
    }
  };

  const cnl = serializeToCNL(project);

  if (!cnl.includes('Hero is_defeated_by Villain')) {
    throw new Error('Expected action line to contain "is_defeated_by"');
  }
  if (cnl.includes('Hero is defeated by Villain')) {
    throw new Error('Expected action line not to expand is_defeated_by into "is defeated by"');
  }
}

