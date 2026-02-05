/**
 * Tests for src/generation/cnl-scene-slicer.mjs
 *
 * Tests: scene slicing + roster extraction from CNL groups
 */

import { sliceCnlToScenes } from '../../src/generation/cnl-scene-slicer.mjs';

// Test: slices a single scene and extracts roster
export function testSliceCnlToScenesBasic() {
  const cnl = [
    'Anna is protagonist',
    'Bob is character',
    'Forest is location',
    '',
    'Book group begin',
    '  Ch1 group begin',
    '    Ch1 has title "Beginnings"',
    '    Sc1.1 group begin',
    '      Sc1.1 has title "Arrival"',
    '      Sc1.1 includes character Anna',
    '      Sc1.1 includes location Forest',
    '      Anna attacks Bob',
    '    Sc1.1 group end',
    '  Ch1 group end',
    'Book group end'
  ].join('\n');

  const { scenes } = sliceCnlToScenes(cnl);
  if (scenes.length !== 1) throw new Error(`Expected 1 scene, got ${scenes.length}`);

  const sc = scenes[0];
  if (!sc.cnl.includes('Sc1.1 group begin')) throw new Error('Expected scene CNL slice');
  if (sc.chapterNumber !== 1) throw new Error('Expected chapterNumber=1');
  if (sc.sceneNumber !== 1) throw new Error('Expected sceneNumber=1');

  // Includes roster + expands by referenced entities (Bob appears in an action)
  if (!sc.allowedCharacters.includes('Anna')) throw new Error('Expected Anna allowed');
  if (!sc.allowedCharacters.includes('Bob')) throw new Error('Expected Bob allowed via statement expansion');
  if (sc.location !== 'Forest') throw new Error(`Expected location Forest, got ${sc.location}`);
}
