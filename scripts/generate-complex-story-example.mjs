/**
 * Generate a complete story artifact plus auto-generated CNL from a fully
 * structured Project object.
 */

import fs from 'node:fs';
import path from 'node:path';

import { createProject } from '../src/models/project.mjs';
import { serializeToCNL } from '../src/services/cnl-serializer.mjs';
import { parseCNL } from '../src/cnl-parser/cnl-parser.mjs';
import { evaluateCNL } from '../src/evaluate.mjs';

const OUTPUT_DIR = path.resolve('artifacts');
const BASE_NAME = 'the-bell-of-the-drowned-library';

function ref(type, name, extras = {}) {
  return { type: `${type}-ref`, name, ...extras };
}

function action(subject, verb, target, annotations = []) {
  return {
    type: 'action',
    actionData: { subject, action: verb, target },
    annotations
  };
}

function scene(name, title, annotations, children) {
  return { type: 'scene', name, title, annotations, children };
}

function chapter(name, title, annotations, children) {
  return { type: 'chapter', name, title, annotations, children };
}

function buildProject() {
  const project = createProject('The Bell of the Drowned Library');
  project.selectedArc = 'rebirth';

  project.cnlAnnotations.global = [
    { type: 'voice', content: 'Write with tactile maritime detail, restrained lyricism, and emotionally precise dialogue.' },
    { type: 'style', content: 'Each scene must contain action, consequence, and a change in leverage between characters.' },
    { type: 'subtext', content: 'The public conflict is about the harbor, but the intimate conflict is about inherited guilt and earned trust.' }
  ];

  project.blueprint = {
    arc: 'rebirth',
    beatMappings: [
      { beatKey: 'inciting_incident', chapterId: 'Ch1', sceneId: 'Sc1.1', tension: 2, notes: 'Mara finds the page that reopens her father’s disgrace.' },
      { beatKey: 'debate', chapterId: 'Ch1', sceneId: 'Sc1.2', tension: 3, notes: 'Daria explains the ledger and the cost of the bell.' },
      { beatKey: 'first_threshold', chapterId: 'Ch1', sceneId: 'Sc1.3', tension: 4, notes: 'Iacob forces Mara to choose sides in public.' },
      { beatKey: 'midpoint_revelation', chapterId: 'Ch2', sceneId: 'Sc2.1', tension: 4, notes: 'The clocktower chamber proves official tampering.' },
      { beatKey: 'betrayal_and_truth', chapterId: 'Ch2', sceneId: 'Sc2.2', tension: 5, notes: 'Andrei confesses his debt and Mara nearly loses him.' },
      { beatKey: 'all_is_lost', chapterId: 'Ch2', sceneId: 'Sc2.3', tension: 5, notes: 'Daria is arrested and the harbor is sealed.' },
      { beatKey: 'climax', chapterId: 'Ch3', sceneId: 'Sc3.2', tension: 5, notes: 'The harbor hears the truth and Mara pays the bell’s price.' },
      { beatKey: 'resolution', chapterId: 'Ch3', sceneId: 'Sc3.3', tension: 2, notes: 'The harbor survives with a changed memory and a clearer record.' }
    ],
    tensionCurve: [
      { position: 0.1, tension: 2 },
      { position: 0.3, tension: 4 },
      { position: 0.55, tension: 5 },
      { position: 0.8, tension: 5 },
      { position: 1.0, tension: 2 }
    ],
    subplots: [
      {
        id: 'SP1',
        name: 'Broken Trust',
        type: 'loyalty',
        characterIds: ['c_mara', 'c_andrei'],
        startBeat: 'debate',
        resolveBeat: 'resolution',
        touchpoints: [
          { chapterId: 'Ch1', sceneId: 'Sc1.3', event: 'Andrei hides his ties to Iacob.' },
          { chapterId: 'Ch2', sceneId: 'Sc2.2', event: 'Andrei admits the truth and asks Mara to judge him by what he does next.' },
          { chapterId: 'Ch3', sceneId: 'Sc3.3', event: 'Mara trusts Andrei with rebuilding the archive gates.' }
        ]
      },
      {
        id: 'SP2',
        name: 'Buried Record',
        type: 'mystery',
        characterIds: ['c_mara', 'c_daria', 'c_iacob'],
        startBeat: 'inciting_incident',
        resolveBeat: 'climax',
        touchpoints: [
          { chapterId: 'Ch1', sceneId: 'Sc1.1', event: 'A page from the ledger names Mara’s father as a traitor.' },
          { chapterId: 'Ch2', sceneId: 'Sc2.1', event: 'The secret chamber reveals official seals on the altered tide books.' },
          { chapterId: 'Ch3', sceneId: 'Sc3.2', event: 'The living water repeats Iacob’s own orders back to the harbor.' }
        ]
      }
    ]
  };

  project.libraries = {
    characters: [
      {
        id: 'c_mara',
        name: 'Mara',
        archetype: 'protagonist',
        traits: ['observant', 'resilient', 'compassionate'],
        motivation: 'Clear her father’s name and keep the harbor from being sacrificed for profit.',
        backstory: 'A former dockside mapmaker whose family was ruined after the archive fire.',
        objectives: 'Decode the Tide Ledger, expose the forgery, and ring the Storm Bell before the surge arrives.',
        secrets: 'She once altered a minor shipping record to buy medicine for her mother and has feared becoming like the officials she hates.'
      },
      {
        id: 'c_andrei',
        name: 'Andrei',
        archetype: 'ally',
        traits: ['loyal', 'skeptical', 'resourceful'],
        motivation: 'Protect his younger sister and keep the harbor machinery running through the storm season.',
        backstory: 'A mechanic raised in the dock wards who survived by taking dangerous contracts from powerful men.',
        objectives: 'Repair the floodgates, repay his debt, and keep Mara alive even when she is furious with him.',
        secrets: 'He has been repairing devices for Iacob in exchange for medicine and legal protection for his sister.'
      },
      {
        id: 'c_daria',
        name: 'Daria',
        archetype: 'mentor',
        traits: ['precise', 'patient', 'fearless'],
        motivation: 'Restore the drowned archive and keep memory from being rewritten by the state.',
        backstory: 'The last apprentice archivist who escaped the night the old library sank below the quay.',
        objectives: 'Teach Mara how to read the ledger and force the harbor to witness its own history.',
        secrets: 'She hid one surviving ledger page inside Mara’s father’s compass case because she did not know whom to trust.'
      },
      {
        id: 'c_iacob',
        name: 'Iacob',
        archetype: 'antagonist',
        traits: ['calculating', 'charming', 'ruthless'],
        motivation: 'Seize the renewal funds, clear the old quarter, and centralize power under his office.',
        backstory: 'A dock orphan who climbed into office by mastering paperwork, patronage, and fear.',
        objectives: 'Confiscate the ledger, silence Daria, and turn the coming storm into a pretext for total control.',
        secrets: 'He ordered the archive flooding years ago to destroy proof that the magistrate’s office stole emergency grain.'
      }
    ],
    locations: [
      {
        id: 'l_harbor',
        name: 'Glass Harbor',
        geography: 'coast',
        time: 'industrial_afterstorm',
        characteristics: ['tide mirrors', 'salt cranes', 'cracked quay lamps']
      },
      {
        id: 'l_breakwater',
        name: 'North Breakwater',
        geography: 'seawall',
        time: 'industrial_afterstorm',
        characteristics: ['wind-cut stone', 'rusted chains', 'echoing surf tunnels']
      },
      {
        id: 'l_archive',
        name: 'Drowned Archive',
        geography: 'ruin',
        time: 'industrial_afterstorm',
        characteristics: ['submerged stacks', 'green glass vaults', 'breathing tide vents']
      },
      {
        id: 'l_clocktower',
        name: 'Clocktower Reservoir',
        geography: 'tower',
        time: 'industrial_afterstorm',
        characteristics: ['hidden gears', 'brass conduits', 'floodgate controls']
      },
      {
        id: 'l_market',
        name: 'Salt Market',
        geography: 'bazaar',
        time: 'industrial_afterstorm',
        characteristics: ['canvas stalls', 'fish smoke', 'public notice wall']
      }
    ],
    objects: [
      {
        id: 'o_ledger',
        name: 'TideLedger',
        objectType: 'artifact',
        significance: 'high',
        function: 'Records tidal memory and repeats spoken truth when opened near seawater.',
        symbolism: 'The difference between memory and official history.',
        ownerId: 'c_daria'
      },
      {
        id: 'o_key',
        name: 'BrassKey',
        objectType: 'artifact',
        significance: 'high',
        function: 'Unlocks the drowned archive chamber and the bell tower hatch.',
        symbolism: 'Permission to enter the truth others buried.',
        ownerId: 'c_mara'
      },
      {
        id: 'o_bell',
        name: 'StormBell',
        objectType: 'artifact',
        significance: 'high',
        function: 'Can redirect a surge tide when rung by someone who yields a cherished memory.',
        symbolism: 'Salvation purchased with remembrance.'
      },
      {
        id: 'o_lamp',
        name: 'SignalLamp',
        objectType: 'tool',
        significance: 'medium',
        function: 'Synchronizes the floodgate crews during blackwater storms.',
        symbolism: 'Practical trust between workers.'
      }
    ],
    moods: [
      { id: 'm_watchful', name: 'watchful', emotions: { caution: 4, hope: 2 } },
      { id: 'm_tense', name: 'tense', emotions: { fear: 3, anger: 4 } },
      { id: 'm_defiant', name: 'defiant', emotions: { resolve: 5, anger: 3 } },
      { id: 'm_elegiac', name: 'elegiac', emotions: { grief: 4, tenderness: 3 } },
      { id: 'm_hopeful', name: 'hopeful', emotions: { relief: 4, trust: 3 } }
    ],
    emotionalArc: [
      { beatKey: 'inciting_incident', moodPreset: 'watchful' },
      { beatKey: 'first_threshold', moodPreset: 'tense' },
      { beatKey: 'all_is_lost', moodPreset: 'elegiac' },
      { beatKey: 'climax', moodPreset: 'defiant' },
      { beatKey: 'resolution', moodPreset: 'hopeful' }
    ],
    themes: [
      { id: 't_truth', name: 'truth' },
      { id: 't_sacrifice', name: 'sacrifice' },
      { id: 't_trust', name: 'trust' }
    ],
    relationships: [
      { id: 'r1', fromId: 'c_mara', toId: 'c_daria', type: 'mentor_student' },
      { id: 'r2', fromId: 'c_mara', toId: 'c_andrei', type: 'fractured_allies' },
      { id: 'r3', fromId: 'c_andrei', toId: 'c_iacob', type: 'debtor_enemy' },
      { id: 'r4', fromId: 'c_daria', toId: 'c_iacob', type: 'ideological_rivals' }
    ],
    worldRules: [
      {
        name: 'Seawater repeats spoken truth when a Tide Ledger is opened within earshot of the tide.',
        category: 'memory',
        description: 'The harbor cannot be lied to once the living ledger is opened beside moving salt water.',
        scope: 'World'
      },
      {
        name: 'The Storm Bell can turn a surge only if the ringer gives up a cherished memory permanently.',
        category: 'magic',
        description: 'The bell answers sacrifice, not authority or bloodline.',
        scope: 'World'
      },
      {
        name: 'Official seals command the floodgates, but forged seals leave metallic residue on brass mechanisms.',
        category: 'governance',
        description: 'Power in the harbor is material and traceable if someone looks closely enough.',
        scope: 'World'
      }
    ],
    worldLayers: {
      societies: [
        { name: 'Tidemakers Guild', values: 'precision, mutual aid, inherited skill', pressure: 'being replaced by magistrate contractors' }
      ],
      history: [
        { event: 'Archive Flooding', legacy: 'officially blamed on Mara’s father', hidden_truth: 'ordered to erase grain theft records' }
      ],
      rules: [
        { custom: 'Memory magic works only near saltwater and exact spoken testimony.' }
      ],
      economy: [
        { resource: 'storm reconstruction funds', contest: 'captured by Iacob through emergency decrees' }
      ],
      conflicts: [
        { public: 'old harbor residents versus redevelopment office', private: 'Mara versus the fear of resembling her father’s accusers' }
      ]
    },
    dialogues: [
      {
        id: 'D1',
        purpose: 'revelation',
        tone: 'measured',
        tension: 3,
        beatKey: 'debate',
        location: { chapterId: 'Ch1', sceneId: 'Sc1.2' },
        participants: [
          { characterId: 'c_mara', role: 'speaker' },
          { characterId: 'c_daria', role: 'speaker' }
        ],
        exchanges: [
          {
            speakerId: 'c_daria',
            intent: 'Explain the ledger’s power and warn Mara that the truth has a cost.',
            emotion: 'grave',
            subtext: 'Daria tests whether Mara is strong enough to inherit the archive.',
            storyDirection: 'Moves the mystery into deliberate action.',
            sketch: 'The harbor remembers more faithfully than the magistrate ever will.'
          },
          {
            speakerId: 'c_mara',
            intent: 'Demand proof that her father was framed.',
            emotion: 'wounded',
            subtext: 'She fears hope more than disappointment.',
            storyDirection: 'Turns grief into a mission.',
            sketch: 'If the water knows the truth, then I am done bowing to paper.'
          }
        ]
      },
      {
        id: 'D2',
        purpose: 'conflict',
        tone: 'raw',
        tension: 5,
        beatKey: 'betrayal_and_truth',
        location: { chapterId: 'Ch2', sceneId: 'Sc2.2' },
        participants: [
          { characterId: 'c_mara', role: 'speaker' },
          { characterId: 'c_andrei', role: 'speaker' },
          { characterId: 'c_daria', role: 'listener' }
        ],
        exchanges: [
          {
            speakerId: 'c_andrei',
            intent: 'Confess his debt to Iacob before someone else uses it against Mara.',
            emotion: 'ashamed',
            subtext: 'He expects abandonment and chooses honesty anyway.',
            storyDirection: 'Breaks the alliance so it can be rebuilt on truth.',
            sketch: 'I sold him hours, not souls, but I know how little that difference looks from the outside.'
          },
          {
            speakerId: 'c_mara',
            intent: 'Force Andrei to answer whether he endangered Daria.',
            emotion: 'furious',
            subtext: 'She hears her father’s accusers in every excuse.',
            storyDirection: 'Raises personal stakes before the public climax.',
            sketch: 'You do not get to call silence mercy when silence is what buried us the first time.'
          }
        ]
      },
      {
        id: 'D3',
        purpose: 'confrontation',
        tone: 'public',
        tension: 5,
        beatKey: 'climax',
        location: { chapterId: 'Ch3', sceneId: 'Sc3.2' },
        participants: [
          { characterId: 'c_mara', role: 'speaker' },
          { characterId: 'c_iacob', role: 'speaker' },
          { characterId: 'c_andrei', role: 'listener' },
          { characterId: 'c_daria', role: 'listener' }
        ],
        exchanges: [
          {
            speakerId: 'c_iacob',
            intent: 'Reassert authority and shame Mara into surrender.',
            emotion: 'cold',
            subtext: 'He believes official language is stronger than lived memory.',
            storyDirection: 'Gives the antagonist enough rope to condemn himself.',
            sketch: 'Cities survive because someone is willing to be cruel on schedule.'
          },
          {
            speakerId: 'c_mara',
            intent: 'Speak the hidden record aloud before the whole harbor.',
            emotion: 'defiant',
            subtext: 'She stops pleading for permission and claims witness instead.',
            storyDirection: 'Triggers the magical proof and moral victory.',
            sketch: 'Then let the tide decide whether cruelty is governance or cowardice.'
          }
        ]
      }
    ],
    wisdom: [
      {
        id: 'w1',
        label: 'Truth requires a witness',
        category: 'ethics',
        insight: 'Facts hidden in private can be denied; truth becomes durable when a community hears it together.',
        application: 'The climax must move from secret evidence to public testimony.',
        examples: 'The ledger repeats the spoken confession for the crowd at the bell tower.'
      }
    ],
    patterns: [
      {
        id: 'p1',
        label: 'Buried Ledger',
        patternType: 'mystery_revelation',
        description: 'A hidden record resurfaces and forces both private guilt and public corruption into the open.',
        structure: ['buried accusation', 'dangerous investigation', 'betrayal', 'public revelation', 'costly restoration'],
        keyQuestion: 'Who controls history when memory itself can testify?',
        examples: 'The archive, ledger, and bell form a chain from evidence to consequence.'
      }
    ]
  };

  project.structure = {
    type: 'book',
    name: 'Book',
    title: 'The Bell of the Drowned Library',
    annotations: [
      { type: 'hint', content: 'Keep the chapter rhythm tight: discovery, pressure, exposure, sacrifice, renewal.' }
    ],
    children: [
      chapter('Ch1', 'Ashes Under Salt', [
        { type: 'context', content: 'This chapter reopens an old wound and turns rumor into investigation.' }
      ], [
        scene('Sc1.1', 'The Name on the Wharf', [
          { type: 'hint', content: 'Open with harsh weather, labor detail, and the emotional shock of the ledger page.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('location', 'North Breakwater'),
          ref('location', 'Glass Harbor'),
          ref('object', 'BrassKey'),
          action('Mara', 'inspects', 'washed ledger page'),
          action('Andrei', 'warns', 'Mara'),
          action('Mara', 'decides', 'find Daria')
        ]),
        scene('Sc1.2', 'Vaults That Breathe', [
          { type: 'reveal', content: 'Daria confirms that the ledger can make seawater echo truth.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Daria'),
          ref('location', 'Drowned Archive'),
          ref('object', 'TideLedger'),
          ref('dialogue', 'D1', { refId: 'D1' }),
          action('Daria', 'reveals', 'TideLedger'),
          action('Mara', 'asks', 'Daria'),
          action('Daria', 'guides', 'Mara')
        ]),
        scene('Sc1.3', 'A Public Offer', [
          { type: 'contrast', content: 'Make the market loud and public so Iacob’s calm feels threatening.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('character', 'Iacob'),
          ref('location', 'Salt Market'),
          ref('object', 'SignalLamp'),
          action('Iacob', 'offers', 'Mara'),
          action('Mara', 'refuses', 'Iacob'),
          action('Andrei', 'conceals', 'debt')
        ])
      ]),
      chapter('Ch2', 'Water Remembers', [
        { type: 'context', content: 'This chapter turns suspicion into proof and fractures the main alliance.' }
      ], [
        scene('Sc2.1', 'The Chamber Behind the Gears', [
          { type: 'sensory', content: 'Use metallic residue, cold spray, and gear noise to ground the reveal.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('location', 'Clocktower Reservoir'),
          ref('object', 'BrassKey'),
          ref('object', 'SignalLamp'),
          action('Mara', 'unlocks', 'hidden chamber'),
          action('Andrei', 'discovers', 'forged seal residue'),
          action('Mara', 'collects', 'proof')
        ]),
        scene('Sc2.2', 'Debts in Open Air', [
          { type: 'subtext', content: 'Mara’s anger is really terror that trust always hides a bill.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('character', 'Daria'),
          ref('location', 'Drowned Archive'),
          ref('dialogue', 'D2', { refId: 'D2' }),
          action('Andrei', 'confesses', 'debt'),
          action('Mara', 'accuses', 'Andrei'),
          action('Daria', 'demands', 'focus')
        ]),
        scene('Sc2.3', 'The Harbor Closes', [
          { type: 'pacing', content: 'Accelerate sharply: arrests, shouted orders, machinery, running feet.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Daria'),
          ref('character', 'Iacob'),
          ref('location', 'Glass Harbor'),
          ref('object', 'SignalLamp'),
          action('Iacob', 'arrests', 'Daria'),
          action('Iacob', 'seizes', 'floodgates'),
          action('Mara', 'steals', 'SignalLamp')
        ])
      ]),
      chapter('Ch3', 'When the Bell Answers', [
        { type: 'context', content: 'This chapter resolves both the civic and intimate conflicts through public witness and sacrifice.' }
      ], [
        scene('Sc3.1', 'Before the Surge', [
          { type: 'voice', content: 'The storm should feel physical and logistical, not abstract.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('character', 'Daria'),
          ref('location', 'Clocktower Reservoir'),
          ref('object', 'BrassKey'),
          action('Mara', 'frees', 'Daria'),
          action('Andrei', 'signals', 'crews'),
          action('Daria', 'prepares', 'TideLedger')
        ]),
        scene('Sc3.2', 'The Bell Tower Witness', [
          { type: 'hint', content: 'The climax must combine public dialogue, magical proof, and Mara’s irreversible choice.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('character', 'Daria'),
          ref('character', 'Iacob'),
          ref('location', 'North Breakwater'),
          ref('object', 'TideLedger'),
          ref('object', 'StormBell'),
          ref('dialogue', 'D3', { refId: 'D3' }),
          action('Mara', 'opens', 'TideLedger'),
          action('Iacob', 'confesses', 'orders'),
          action('Mara', 'rings', 'StormBell')
        ]),
        scene('Sc3.3', 'Dawn Over the Quay', [
          { type: 'avoid', content: 'Do not erase the cost of Mara’s sacrifice; recovery should feel earned and incomplete.' }
        ], [
          ref('character', 'Mara'),
          ref('character', 'Andrei'),
          ref('character', 'Daria'),
          ref('location', 'Glass Harbor'),
          action('Harbor', 'survives', 'surge'),
          action('Iacob', 'loses', 'office'),
          action('Mara', 'accepts', 'silence')
        ])
      ])
    ]
  };

  return project;
}

function buildStoryMarkdown() {
  return `# The Bell of the Drowned Library

## Chapter 1: Ashes Under Salt

### Scene 1: The Name on the Wharf

By dawn the sea had thrown half the night onto the stones of North Breakwater: weed, splintered crate wood, a dead lantern, a white page swollen with brine. Mara nearly stepped over it on her way to count cracked mooring posts. Then she saw her family name written in the old archive hand, dark even under the salt.

She crouched in the spray and peeled the page from the stone. The ink shimmered. Her father’s name stood beside the word sabotage.

Andrei came up the seawall carrying a wrench and a lamp hood under one arm. “If that is another repair order,” he said, “throw it back. The harbor’s full enough of bad instructions.”

Mara held the page where he could see it. “It came from the water.”

His expression changed first to confusion, then to caution. “That script is archive script.”

“It names my father.”

Wind snapped her coat against her knees. Below them the tide struck the breakwater and hissed through the surf tunnels like breath dragged through teeth. Mara felt the old humiliation return with the smell of wet metal: neighbors lowering their voices when she passed, officials saying regret with tidy mouths while her mother sold furniture to buy coal.

Andrei looked out toward the drowned quarter. “If the sea is returning records, it means someone disturbed the lower vaults.”

Mara closed her hand around the BrassKey she wore at her belt, the one object her father had left her untouched by auction or mildew. “Then I am done waiting for mercy,” she said. “I’m going to Daria.”

“Mara.” He caught her sleeve for one instant, not enough to stop her. “Storm crews are hearing the surge may arrive two tides early. Whatever you dig up, dig fast.”

“Then keep the harbor alive long enough for me to prove what they did.”

She left him with the wind and the machinery and started toward the flooded ruins where memory still breathed under glass.

### Scene 2: Vaults That Breathe

The Drowned Archive was entered through a tilted service chapel, down a stair where barnacles crusted the handrail and seawater flashed between each broken step. Daria waited below with a lantern hooded in blue cloth. She seemed to belong to the vaults, narrow and steady and resistant to rot.

When Mara showed her the page, Daria did not gasp. She only lifted her chin, as though one more betrayal had finally arrived on schedule.

“You knew this writing,” Mara said.

“I knew it would return one day,” Daria answered. She led Mara into a chamber lined with green glass cases drowned to the waist. From a metal box she drew a ledger banded in swollen leather. “This is the Tide Ledger. It does not preserve whatever is written. It preserves whatever was spoken in truth when the record was made.”

Mara stared. “You are telling me water can testify.”

“In this harbor, yes.” Daria set the ledger on a stone plinth slick with tide. “But not for cowards, and never for free.”

Mara’s laugh came out brittle. “I have paid for other people’s lies for fifteen years. I can afford another price.”

Daria’s eyes sharpened. “Do not say that until you know the cost.”

They opened the ledger together. Seawater moved in the vents beneath the floor. Somewhere in the dark, a pipe sang.

“The harbor remembers more faithfully than the magistrate ever will,” Daria said.

Mara laid the salvaged page against the open book. “If the water knows the truth, then I am done bowing to paper.”

Daria nodded once, grave and almost proud. “Then read with care. The ledger can reveal a crime. The Storm Bell can stop the surge. But the bell only answers sacrifice. If you go forward, you may save the city and lose something you thought could never be taken.”

“I already lost my father.”

“No,” Daria said softly. “You lost the public version of him. That is not always the same thing.”

Together they traced the ledger marks until a route emerged: the Clocktower Reservoir, the old floodgate controls, and a missing page hidden under seal.

### Scene 3: A Public Offer

Salt Market was loud enough to make intimidation seem polite. Fish smoke, argument, haggling, hammer blows from coppersmith stalls: everything collided under wet canvas roofs while notice runners nailed fresh decrees to the public wall. Iacob stood beside the largest posting board in a dark coat untouched by spray, as if even weather observed his rank.

“Mara,” he called, with the easy warmth of a man greeting an equal instead of the daughter of a disgrace. “Word reaches me you are asking inconvenient questions.”

She did not bow. “That depends on whom the questions inconvenience.”

His smile held. “The harbor is under emergency authority. People are frightened. Old rumors will not steady them.”

Andrei had arrived behind her carrying the SignalLamp he used for night crews. Mara saw the instant of recognition between him and Iacob, small and poisonous. Andrei looked away too quickly.

Iacob extended a sealed paper. “Give me whatever page you found. I will issue a formal statement clearing your father of negligence. Your family gets peace. The city keeps order.”

“You are selling me a clean lie in exchange for a dirty truth.”

“I am offering survival.” His voice dropped. “Choose quickly. Floodgate command will be centralized by tonight.”

Mara let the paper remain between them, untouched. “If you could clear my father with a stroke of ink, then ink is what buried him.”

For the first time, Iacob’s expression thinned. “You are not as practical as your father was.”

“Then he learned practicality from the wrong men.”

She turned and left before anger could do what fear had not. Behind her, market noise surged again. Beside her, Andrei walked in silence.

Only when they reached the alley of net menders did she stop. “How do you know him?”

Andrei adjusted the lamp handle until his knuckles whitened. “The harbor is small.”

It was not an answer. Mara heard that too. She said nothing, and the absence between them grew large enough to walk inside.

## Chapter 2: Water Remembers

### Scene 1: The Chamber Behind the Gears

The Clocktower Reservoir shook with the labor of the city. Gears taller than houses turned behind iron grates. Brass conduits sweated. Water hammered through stone throats toward the floodgates. Mara and Andrei climbed maintenance stairs no magistrate ever used, all the way to a narrow landing where the old control wall had been plated over.

The BrassKey fit a lock buried under corrosion.

“That should not be there,” Andrei muttered.

“And yet you sound unsurprised.”

He gave her a flat look that asked for time she did not intend to give him. The key turned. The plate released. Behind it waited a cavity no larger than a pantry and far more dangerous. Shelves held waxed orders stamped with emergency seals. A ledger page lay pinned beneath a glass weight. Brass on the lock housing was dusted with a metallic silver film.

Andrei touched the residue and swore. “Forged seal powder. Cheap, but effective if no one inspects the machinery afterward.”

Mara gathered the orders with careful hands. Several authorized grain transfers to private warehouses. One redirected funds meant for seawall repairs. Another named her father as the officer responsible for falsifying inspections.

“These dates overlap the archive flooding,” she said.

Andrei lifted the glass weight. Under it was a magistrate memo signed by Iacob’s predecessor and countersigned by Iacob as witness.

“Not witness,” Mara said. “Participant.”

Water boomed through the conduits, and for a moment the whole chamber felt like the inside of a heart. She packed the papers into oilcloth. They had proof now, but proof only mattered if they could keep it alive longer than the men it threatened.

### Scene 2: Debts in Open Air

They returned to the Drowned Archive by a maintenance causeway while rain started in cold slanting lines. Daria spread the stolen orders beside the Tide Ledger and read with the furious stillness of a surgeon discovering rot under clean bandages.

“This is enough to hang an office,” she said.

“If we live long enough to open the ledger beside moving water,” Mara answered.

Andrei did not set down the SignalLamp. He stood as if prepared either to flee or to confess, and Mara suddenly knew which one would hurt more.

“Before you decide what to do,” he said, “there is something I should have said in the market.”

Mara’s chest tightened. “Now?”

“Now, because if I wait, I become exactly the man you think I am.”

Rain tapped the glass overhead. Daria glanced up once, then returned to the papers without intervening.

Andrei looked at Mara, not pleading, only braced. “I sold him hours, not souls, but I know how little that difference looks from the outside. My sister needed medicine. Iacob had the permits. He hired me to repair sealed devices, floodgate relays, bell winches. I never saw these papers until today.”

Mara felt heat rush into her face. “And when were you planning to mention that the man hunting us knew the shape of your hands?”

“When I had something better than shame to offer.”

She stepped toward him. “You do not get to call silence mercy when silence is what buried us the first time.”

He took the blow without retreating. “Then strike me with the whole truth. I deserve it. But listen after. I came here. I opened the chamber. I am still here.”

Daria finally looked up. “Both of you are spending time the tide has already claimed.”

Mara pressed her hands against the table until the wood bit her palms. Anger wanted simplicity. The evidence on the planks denied it. Andrei had helped power the machine that hurt them. He had also just handed her the wrench that might break it.

“If you stay,” she said at last, “you stay under orders. No more omissions.”

His answer was immediate. “Understood.”

Trust did not return. But it changed shape enough to become usable.

### Scene 3: The Harbor Closes

The first emergency bells rang before dusk. By the time Mara, Daria, and Andrei reached the main quay, Iacob’s guards had already occupied the floodgate stairs and posted closure notices on every warehouse door. Workers shouted across the water. Families ran bundles toward upper streets. Crane arms swung like black metronomes over the chaos.

Iacob stood on a customs platform reading decrees through a speaking horn.

“By emergency order,” he declared, “all archival materials are subject to confiscation. All unauthorized personnel are barred from the breakwater and bell tower.”

“Unauthorized,” Daria said, with quiet contempt. “Meaning everyone who remembers.”

Two guards recognized her before Mara could pull her back. They moved quickly, expertly, as if the arrest had long been drafted.

“Archivist Daria,” one said, “you are charged with incitement and theft of state documents.”

Mara lunged. Andrei caught her arm before she could be clubbed senseless. Daria, astonishingly calm, thrust the Tide Ledger into Mara’s hands while the guards seized her.

“North Breakwater,” Daria said. “Moving water. Public witness. Do not waste me.”

Iacob’s gaze found Mara across the platform. He did not smile this time. He simply nodded to the sealed tower stairs where the StormBell waited above the surge line.

Andrei shoved the SignalLamp into Mara’s hands. “Take it.”

“What about you?”

“Somebody has to misdirect the crews and keep the west gates from locking fully.”

She almost asked why she should trust him. The answer would have cost time and pride and perhaps the city. Instead she gripped the lamp.

“Meet me at the breakwater,” she said.

“I will.”

The harbor lights came up one by one in the rain, small defiant stars under a sky that meant to drown them.

## Chapter 3: When the Bell Answers

### Scene 1: Before the Surge

Night made the Clocktower Reservoir monstrous. Water climbed the gauge columns too fast. Crew whistles shrilled. Andrei moved through the lower platforms signaling loyal workers with lamp codes no office had ever bothered to learn. Mara used the BrassKey on the detention hatch above the relay room, where Daria had been held under guard between machinery inspections.

The key turned. The bolt slipped. Daria stepped out with wet hair plastered to her temples and fury intact.

“I take it they still underestimate old women with filing habits,” she said.

“You are not old.”

“Tonight I am ancient enough to be useful. Did Andrei come through?”

Below them the SignalLamp flashed twice, paused, then twice again. Floodgate crews shifted at hidden instruction. Wheel locks disengaged on the western sluice.

“He did,” Mara said.

Daria took the TideLedger and tucked it inside oilcloth. “Good. Then we move now. Once the surge strikes, the bell tower stairs will become a river.”

They ran through spray and iron thunder toward North Breakwater, where workers and residents were already gathering despite the closure orders. Panic had made them brave.

### Scene 2: The Bell Tower Witness

The sea rose black and glassy under the tower. Foam climbed the lower stones. Iacob waited on the bell platform with two guards and the composure of a man who still believed procedure outranked weather.

“You are late,” he called as Mara, Daria, and Andrei came onto the wet stairs before the crowd. “And spectacularly unqualified.”

Mara held the ledger against her chest. “That has never stopped your office.”

His eyes flicked to the gathering people below, then to Andrei. “You disappoint me.”

Andrei answered without heat. “You taught me exactly how expensive obedience becomes.”

Iacob spread one hand toward the surge. “Cities survive because someone is willing to be cruel on schedule. You think truth feeds flood crews? You think innocence keeps walls standing?”

Mara climbed one step higher so the wind would carry her voice. “Then let the tide decide whether cruelty is governance or cowardice.”

She opened the TideLedger.

Salt water struck the lower stones. The pages shuddered. Mara read the hidden orders aloud: grain diverted, seawall funds stolen, archive witnesses reassigned, her father ordered to certify false inspections under threat of prison. Then she read the final note, the one authorizing flood charges in the archive lower vault.

For one suspended second, nothing happened.

Then the sea answered in voices.

Not ghosts, not exactly. The tide took the spoken words and sent them back magnified through every culvert and stairwell. Iacob’s own younger voice came roaring from the waterline, crisp with official impatience: “Open the lower gates. The books go first. If Vale protests, record him as unstable and remove him.”

The crowd below went still.

Mara looked at Iacob. His certainty had finally cracked. That was the moment when power left him: not when the proof appeared, but when everyone heard it at once.

The surge hit the outer wall with a force that shook the bell frame. Daria seized Mara’s wrist.

“Now,” she said. “The bell.”

Mara stared up at the StormBell, green with salt and old lightning. “What does it take?”

Daria’s face changed, grief moving through discipline. “A cherished memory. Not a token. Something foundational.”

Below them the first overflow rushed across the lower quay. Andrei met Mara’s gaze and said nothing, which was kinder than courage.

She reached for the bell rope.

At once she knew what the harbor asked. Not her father’s name. Not the abstract idea of him. It wanted the sound of his voice on the last morning before disgrace, when he had tied the BrassKey at her belt and told her that maps were promises made visible.

Mara nearly let go.

Then she saw children in the crowd lifted onto carts above the waterline, workers bracing winches with bleeding hands, Daria holding the ledger open against the storm, Andrei already turning toward the floodgates before the bell had even answered.

She rang it.

The note rolled through the harbor like a struck horizon. Tide lines shifted. Water that had been climbing bent sideways into the diversion channels. Winches screamed. Gates slammed in sequence. The surge split around the old quarter instead of through it.

Mara dropped to one knee, gasping. In the space the bell left behind, something intimate and irreplaceable was gone. She remembered her father’s face. She remembered the weight of his hand on her shoulder. But when she reached for his voice, there was only silence, clean and merciless.

The harbor lived.

### Scene 3: Dawn Over the Quay

Morning found Glass Harbor exhausted, soaked, and still standing. The lower warehouses had taken water, but the dwellings behind the old quay remained intact. Workers moved like survivors of a battle they had won without ever being allowed to call it one.

Iacob was led through the market under guard, stripped of coat clasps and office seals. No one threw stones. Contempt had become too complete for theater.

Daria stood beside a stack of salvaged record boxes while volunteers carried archive fragments into a dry warehouse newly promised to public use.

“The council wants testimony,” she said.

Mara watched sunlight catch on floodwater in the street ruts. “They can have it.”

“And your memory?”

Mara touched the BrassKey at her belt. “I know what he did. I know what he tried to teach me. Perhaps that has to be enough.”

Andrei approached with grease on his sleeves and an expression careful as a fresh bandage. “West gate crews are asking whether the archive will need new hinges.”

Mara looked at him for a long moment. Trust did not return because a city survived. But there are forms of forgiveness that begin as assigned work.

“Yes,” she said. “And better locks.”

One corner of his mouth lifted, tired and disbelieving. “That sounds almost like faith.”

“Do not rush the miracle.”

He accepted that with a small nod. Together they looked over the harbor: cracked, breathing, no longer governed by silence alone.

The city would remember the public confession, the bell, the redirected tide. Mara knew some absences would remain private forever. Yet when the morning wind crossed the quay, it carried no shame with it. Only salt, labor, and the beginning of repair.
`;
}

function buildAnalysisMarkdown(parseResult, evaluation) {
  const counts = evaluation?.structure || {};
  const nqs = evaluation?.summary?.nqs ?? 0;

  return `# Create Story Analysis

## Current flow in this repository

- The demo button Create Story calls the NL generation flow in demo/app/nl-generation.mjs.
- That flow uses generateCNL() from demo/app/cnl.mjs, which delegates to the canonical serializer serializeToCNL(project) in src/services/cnl-serializer.mjs.
- The true source of story control is therefore the structured Project object: characters, locations, objects, blueprint beats, dialogues, subplots, world rules, and the book/chapter/scene tree.
- Prose quality depends on scene-level grounding. The repository review in review_codex.md notes that story drift happens when chapter/scene CNL is incomplete or not passed into streaming generation.

## Why this example is stronger than a minimal spec

- Every major narrative layer is present before prose: world rules, themes, wisdom, patterns, relationships, objects, moods, dialogues, beat mappings, tension curve, subplots, and explicit scene actions.
- Each scene contains local references plus action lines, so the CNL acts as deterministic ground truth rather than a loose summary.
- Dialogue metadata is separated into a dialogue library and linked back into scenes through dialogue-ref nodes, which mirrors the project model used by the app.
- The final prose is intentionally aligned with the same chapter/scene outline, which makes verification possible.

## Verification snapshot

- Parse valid: ${Boolean(parseResult?.valid)}
- Parse errors: ${parseResult?.errors?.length || 0}
- Narrative Quality Score: ${nqs}
- Characters: ${counts.characters || 0}
- Locations: ${counts.locations || 0}
- Objects: ${counts.objects || 0}
- Themes: ${counts.themes || 0}
- Scenes: ${counts.scenes || 0}
- Dialogues: ${counts.dialogues || 0}

## Short qualitative assessment

- Coherence: strong, because each chapter advances the same civic mystery and the same intimate trust conflict.
- Dialogue complexity: moderate to high, because the dialogue lines carry intent, subtext, emotional shifts, and public/private leverage changes.
- Auto-completion effectiveness: strong, because the CNL covers the required narrative fields instead of leaving chapters or scenes as empty shells.
`;
}

function main() {
  const project = buildProject();
  const cnl = serializeToCNL(project);
  const parseResult = parseCNL(cnl);

  if (!parseResult.valid) {
    const errorText = (parseResult.errors || []).map(err => `${err.line || '?'}: ${err.message}`).join('\n');
    throw new Error(`Generated CNL is invalid:\n${errorText}`);
  }

  const storyMarkdown = buildStoryMarkdown();
  const evaluation = evaluateCNL(cnl, { prose: storyMarkdown, targetArc: 'rebirth' });
  const analysisMarkdown = buildAnalysisMarkdown(parseResult, evaluation);
  const bundleMarkdown = `${analysisMarkdown}\n\n---\n\n${storyMarkdown}\n\n---\n\n# Auto-generated CNL\n\n\`\`\`cnl\n${cnl}\n\`\`\`\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${BASE_NAME}.cnl`), cnl, 'utf8');
  fs.writeFileSync(path.join(OUTPUT_DIR, `${BASE_NAME}.story.md`), bundleMarkdown, 'utf8');

  const summary = {
    outputDir: OUTPUT_DIR,
    cnlFile: path.join(OUTPUT_DIR, `${BASE_NAME}.cnl`),
    storyFile: path.join(OUTPUT_DIR, `${BASE_NAME}.story.md`),
    parseValid: parseResult.valid,
    parseErrors: parseResult.errors?.length || 0,
    nqs: evaluation?.summary?.nqs ?? null,
    structure: evaluation?.structure || null
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
