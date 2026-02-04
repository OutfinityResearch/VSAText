/**
 * Tests for CNL Parser - Blueprint Elements
 * 
 * Tests: Beat mappings, tension curve, dialogues, subplots
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Blueprint arc is parsed
export function testBlueprintArc() {
  const cnl = 'Blueprint uses arc heros_journey';
  const result = parseCNL(cnl);
  
  if (result.ast.blueprint.arc !== 'heros_journey') {
    throw new Error(`Expected arc 'heros_journey', got '${result.ast.blueprint.arc}'`);
  }
}

// Test: Beat mappings are parsed
export function testBeatMappings() {
  const cnl = `
Beat midpoint mapped to Ch1.Sc1
Beat climax mapped to Ch2.Sc3
`;
  
  const result = parseCNL(cnl);
  const mappings = result.ast.blueprint.beatMappings;
  
  if (mappings.length !== 2) {
    throw new Error(`Expected 2 beat mappings, got ${mappings.length}`);
  }
  
  const midpoint = mappings.find(m => m.beatKey === 'midpoint');
  if (!midpoint || midpoint.chapterId !== 'Ch1' || midpoint.sceneId !== 'Sc1') {
    throw new Error('Midpoint mapping incorrect');
  }
}

// Test: Beat properties (mood/notes) are stored on blueprint.beatProperties
export function testBeatPropertiesMoodAndNotes() {
  const cnl = `
Blueprint uses arc heros_journey
Beat ordeal mapped to Ch3.Sc6
ordeal has tension 5
ordeal has mood desperate
ordeal has note "All is lost moment"
`;

  const result = parseCNL(cnl);
  const props = result.ast.blueprint?.beatProperties?.ordeal;
  if (!props) throw new Error('Expected beatProperties.ordeal');
  if (props.mood !== 'desperate') {
    throw new Error(`Expected mood 'desperate', got '${props.mood}'`);
  }
  if (!Array.isArray(props.notes) || props.notes.length !== 1) {
    throw new Error('Expected exactly one note for ordeal');
  }
  if (!String(props.notes[0]).includes('All is lost')) {
    throw new Error('Expected note content to be preserved');
  }
}

// Test: Tension curve is parsed
export function testTensionCurve() {
  const cnl = `
Tension at 0.5 is 4
Tension at 0.8 is 7
`;
  
  const result = parseCNL(cnl);
  const curve = result.ast.blueprint.tensionCurve;
  
  if (curve.length !== 2) {
    throw new Error(`Expected 2 tension points, got ${curve.length}`);
  }
  if (curve[0].position !== 0.5 || curve[0].tension !== 4) {
    throw new Error('First tension point incorrect');
  }
}

// Test: Dialogues are parsed
export function testDialogueParsing() {
  const cnl = `
Dialogue D1 at Ch1.Sc1
D1 has purpose exposition
D1 has tone neutral
D1 involves Hero as speaker
`;
  
  const result = parseCNL(cnl);
  const dialogues = result.ast.dialogues;
  
  if (!dialogues['D1']) {
    throw new Error('Expected dialogue D1');
  }
  if (dialogues['D1'].purpose !== 'exposition') {
    throw new Error(`Expected purpose 'exposition', got '${dialogues['D1'].purpose}'`);
  }
  if (dialogues['D1'].participants.length === 0) {
    throw new Error('Expected participants');
  }
}

// Test: Subplots are parsed
export function testSubplotParsing() {
  const cnl = `
Subplot S1 type romance
S1 involves Hero
S1 starts at beat midpoint
`;
  
  const result = parseCNL(cnl);
  const subplots = result.ast.subplots;
  
  if (!subplots['S1']) {
    throw new Error('Expected subplot S1');
  }
  if (subplots['S1'].type !== 'romance') {
    throw new Error(`Expected type 'romance', got '${subplots['S1'].type}'`);
  }
}
