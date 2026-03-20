# Create Story Analysis

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

- Parse valid: true
- Parse errors: 0
- Narrative Quality Score: 0.9134430226497274
- Characters: 4
- Locations: 5
- Objects: 0
- Themes: 3
- Scenes: 9
- Dialogues: 3

## Short qualitative assessment

- Coherence: strong, because each chapter advances the same civic mystery and the same intimate trust conflict.
- Dialogue complexity: moderate to high, because the dialogue lines carry intent, subtext, emotional shifts, and public/private leverage changes.
- Auto-completion effectiveness: strong, because the CNL covers the required narrative fields instead of leaving chapters or scenes as empty shells.


---

# The Bell of the Drowned Library

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


---

# Auto-generated CNL

```cnl
// Auto-generated CNL
// The Bell of the Drowned Library
// Arc: rebirth

#hint: Treat this CNL as a deterministic specification. Do not invent new plot events, characters, or world rules.
#hint: Use SVO statements as ground truth (WHAT). Use #example/#voice/#subtext/#style annotations to guide prose (HOW).
#avoid: Adding named entities that are not declared or included in scenes.
#voice: Write with tactile maritime detail, restrained lyricism, and emotionally precise dialogue.
#style: Each scene must contain action, consequence, and a change in leverage between characters.
#subtext: The public conflict is about the harbor, but the intimate conflict is about inherited guilt and earned trust.

// === BLUEPRINT ===
Blueprint uses arc rebirth

// Beat Mappings
Beat inciting_incident mapped to Ch1.Sc1.1
inciting_incident has tension 2
inciting_incident has note "Mara finds the page that reopens her father’s disgrace."
Beat debate mapped to Ch1.Sc1.2
debate has tension 3
debate has note "Daria explains the ledger and the cost of the bell."
Beat first_threshold mapped to Ch1.Sc1.3
first_threshold has tension 4
first_threshold has note "Iacob forces Mara to choose sides in public."
Beat midpoint_revelation mapped to Ch2.Sc2.1
midpoint_revelation has tension 4
midpoint_revelation has note "The clocktower chamber proves official tampering."
Beat betrayal_and_truth mapped to Ch2.Sc2.2
betrayal_and_truth has tension 5
betrayal_and_truth has note "Andrei confesses his debt and Mara nearly loses him."
Beat all_is_lost mapped to Ch2.Sc2.3
all_is_lost has tension 5
all_is_lost has note "Daria is arrested and the harbor is sealed."
Beat climax mapped to Ch3.Sc3.2
climax has tension 5
climax has note "The harbor hears the truth and Mara pays the bell’s price."
Beat resolution mapped to Ch3.Sc3.3
resolution has tension 2
resolution has note "The harbor survives with a changed memory and a clearer record."

// Beat Moods
inciting_incident has mood watchful
first_threshold has mood tense
all_is_lost has mood elegiac
climax has mood defiant
resolution has mood hopeful

// Tension Curve
Tension at 0.1 is 2
Tension at 0.3 is 4
Tension at 0.55 is 5
Tension at 0.8 is 5
Tension at 1 is 2

// === DIALOGUES ===
Dialogue D1 at Ch1.Sc1.2
D1 has purpose revelation
D1 has tone measured
D1 has tension 3
D1 linked to beat debate
D1 involves Mara as speaker
D1 involves Daria as speaker
D1 exchange begin
  Daria says intent "Explain the ledger’s power and warn Mara that the truth has a cost."
  Daria says emotion grave
  Daria says subtext "Daria tests whether Mara is strong enough to inherit the archive."
  Daria says story_direction "Moves the mystery into deliberate action."
  Daria says sketch "The harbor remembers more faithfully than the magistrate ever will."
  Mara says intent "Demand proof that her father was framed."
  Mara says emotion wounded
  Mara says subtext "She fears hope more than disappointment."
  Mara says story_direction "Turns grief into a mission."
  Mara says sketch "If the water knows the truth, then I am done bowing to paper."
D1 exchange end

Dialogue D2 at Ch2.Sc2.2
D2 has purpose conflict
D2 has tone raw
D2 has tension 5
D2 linked to beat betrayal_and_truth
D2 involves Mara as speaker
D2 involves Andrei as speaker
D2 involves Daria as listener
D2 exchange begin
  Andrei says intent "Confess his debt to Iacob before someone else uses it against Mara."
  Andrei says emotion ashamed
  Andrei says subtext "He expects abandonment and chooses honesty anyway."
  Andrei says story_direction "Breaks the alliance so it can be rebuilt on truth."
  Andrei says sketch "I sold him hours, not souls, but I know how little that difference looks from the outside."
  Mara says intent "Force Andrei to answer whether he endangered Daria."
  Mara says emotion furious
  Mara says subtext "She hears her father’s accusers in every excuse."
  Mara says story_direction "Raises personal stakes before the public climax."
  Mara says sketch "You do not get to call silence mercy when silence is what buried us the first time."
D2 exchange end

Dialogue D3 at Ch3.Sc3.2
D3 has purpose confrontation
D3 has tone public
D3 has tension 5
D3 linked to beat climax
D3 involves Mara as speaker
D3 involves Iacob as speaker
D3 involves Andrei as listener
D3 involves Daria as listener
D3 exchange begin
  Iacob says intent "Reassert authority and shame Mara into surrender."
  Iacob says emotion cold
  Iacob says subtext "He believes official language is stronger than lived memory."
  Iacob says story_direction "Gives the antagonist enough rope to condemn himself."
  Iacob says sketch "Cities survive because someone is willing to be cruel on schedule."
  Mara says intent "Speak the hidden record aloud before the whole harbor."
  Mara says emotion defiant
  Mara says subtext "She stops pleading for permission and claims witness instead."
  Mara says story_direction "Triggers the magical proof and moral victory."
  Mara says sketch "Then let the tide decide whether cruelty is governance or cowardice."
D3 exchange end

// === SUBPLOTS ===
Subplot SP1 type loyalty
SP1 involves Mara
SP1 involves Andrei
SP1 starts at beat debate
SP1 resolves at beat resolution
SP1 touchpoint Ch1.Sc1.3 event "Andrei hides his ties to Iacob."
SP1 touchpoint Ch2.Sc2.2 event "Andrei admits the truth and asks Mara to judge him by what he does next."
SP1 touchpoint Ch3.Sc3.3 event "Mara trusts Andrei with rebuilding the archive gates."

Subplot SP2 type mystery
SP2 involves Mara
SP2 involves Daria
SP2 involves Iacob
SP2 starts at beat inciting_incident
SP2 resolves at beat climax
SP2 touchpoint Ch1.Sc1.1 event "A page from the ledger names Mara’s father as a traitor."
SP2 touchpoint Ch2.Sc2.1 event "The secret chamber reveals official seals on the altered tide books."
SP2 touchpoint Ch3.Sc3.2 event "The living water repeats Iacob’s own orders back to the harbor."

// === WORLD RULES ===
World is setting
R1 is world_rule
R1 has text "Seawater repeats spoken truth when a Tide Ledger is opened within earshot of the tide."
R1 has category memory
R1 has description "The harbor cannot be lied to once the living ledger is opened beside moving salt water."
#hint: Treat this rule as inviolable unless an explicit exception is specified.
R1 applies to World
World includes rule R1

R2 is world_rule
R2 has text "The Storm Bell can turn a surge only if the ringer gives up a cherished memory permanently."
R2 has category magic
R2 has description "The bell answers sacrifice, not authority or bloodline."
#hint: Treat this rule as inviolable unless an explicit exception is specified.
R2 applies to World
World includes rule R2

R3 is world_rule
R3 has text "Official seals command the floodgates, but forged seals leave metallic residue on brass mechanisms."
R3 has category governance
R3 has description "Power in the harbor is material and traceable if someone looks closely enough."
#hint: Treat this rule as inviolable unless an explicit exception is specified.
R3 applies to World
World includes rule R3


// === WORLD LAYERS ===
// Societies/Cultures
SO1 is world_layer
SO1 has category societies
SO1 has name "Tidemakers Guild"
SO1 has values "precision, mutual aid, inherited skill"
SO1 has pressure "being replaced by magistrate contractors"

// History/Timeline
HI1 is world_layer
HI1 has category history
HI1 has event "Archive Flooding"
HI1 has legacy "officially blamed on Mara’s father"
HI1 has hidden_truth "ordered to erase grain theft records"

// Rules of the World
RU1 is world_layer
RU1 has category rules
RU1 has custom "Memory magic works only near saltwater and exact spoken testimony."

// Economy/Resources
EC1 is world_layer
EC1 has category economy
EC1 has resource "storm reconstruction funds"
EC1 has contest "captured by Iacob through emergency decrees"

// Conflicts/Tensions
CO1 is world_layer
CO1 has category conflicts
CO1 has public "old harbor residents versus redevelopment office"
CO1 has private "Mara versus the fear of resembling her father’s accusers"


// Characters
Mara is protagonist
Mara has trait observant
Mara has trait resilient
Mara has trait compassionate
Mara has motivation "Clear her father’s name and keep the harbor from being sacrificed for profit."
Mara has backstory "A former dockside mapmaker whose family was ruined after the archive fire."
Mara has goals "Decode the Tide Ledger, expose the forgery, and ring the Storm Bell before the surge arrives."
Mara has secrets "She once altered a minor shipping record to buy medicine for her mother and has feared becoming like the officials she hates."
Andrei is ally
Andrei has trait loyal
Andrei has trait skeptical
Andrei has trait resourceful
Andrei has motivation "Protect his younger sister and keep the harbor machinery running through the storm season."
Andrei has backstory "A mechanic raised in the dock wards who survived by taking dangerous contracts from powerful men."
Andrei has goals "Repair the floodgates, repay his debt, and keep Mara alive even when she is furious with him."
Andrei has secrets "He has been repairing devices for Iacob in exchange for medicine and legal protection for his sister."
Daria is mentor
Daria has trait precise
Daria has trait patient
Daria has trait fearless
Daria has motivation "Restore the drowned archive and keep memory from being rewritten by the state."
Daria has backstory "The last apprentice archivist who escaped the night the old library sank below the quay."
Daria has goals "Teach Mara how to read the ledger and force the harbor to witness its own history."
Daria has secrets "She hid one surviving ledger page inside Mara’s father’s compass case because she did not know whom to trust."
Iacob is antagonist
Iacob has trait calculating
Iacob has trait charming
Iacob has trait ruthless
Iacob has motivation "Seize the renewal funds, clear the old quarter, and centralize power under his office."
Iacob has backstory "A dock orphan who climbed into office by mastering paperwork, patronage, and fear."
Iacob has goals "Confiscate the ledger, silence Daria, and turn the coming storm into a pretext for total control."
Iacob has secrets "He ordered the archive flooding years ago to destroy proof that the magistrate’s office stole emergency grain."

// Relationships
Mara relates to Daria as mentor_student
Mara relates to Andrei as fractured_allies
Andrei relates to Iacob as debtor_enemy
Daria relates to Iacob as ideological_rivals

// Locations
"Glass Harbor" is location
"Glass Harbor" has geography coast
"Glass Harbor" has era industrial_afterstorm
"Glass Harbor" has characteristic tide mirrors
"Glass Harbor" has characteristic salt cranes
"Glass Harbor" has characteristic cracked quay lamps
"North Breakwater" is location
"North Breakwater" has geography seawall
"North Breakwater" has era industrial_afterstorm
"North Breakwater" has characteristic wind-cut stone
"North Breakwater" has characteristic rusted chains
"North Breakwater" has characteristic echoing surf tunnels
"Drowned Archive" is location
"Drowned Archive" has geography ruin
"Drowned Archive" has era industrial_afterstorm
"Drowned Archive" has characteristic submerged stacks
"Drowned Archive" has characteristic green glass vaults
"Drowned Archive" has characteristic breathing tide vents
"Clocktower Reservoir" is location
"Clocktower Reservoir" has geography tower
"Clocktower Reservoir" has era industrial_afterstorm
"Clocktower Reservoir" has characteristic hidden gears
"Clocktower Reservoir" has characteristic brass conduits
"Clocktower Reservoir" has characteristic floodgate controls
"Salt Market" is location
"Salt Market" has geography bazaar
"Salt Market" has era industrial_afterstorm
"Salt Market" has characteristic canvas stalls
"Salt Market" has characteristic fish smoke
"Salt Market" has characteristic public notice wall

// Objects
TideLedger is artifact
TideLedger has significance high
TideLedger has function "Records tidal memory and repeats spoken truth when opened near seawater."
TideLedger has symbolism "The difference between memory and official history."
Daria owns TideLedger
BrassKey is artifact
BrassKey has significance high
BrassKey has function "Unlocks the drowned archive chamber and the bell tower hatch."
BrassKey has symbolism "Permission to enter the truth others buried."
Mara owns BrassKey
StormBell is artifact
StormBell has significance high
StormBell has function "Can redirect a surge tide when rung by someone who yields a cherished memory."
StormBell has symbolism "Salvation purchased with remembrance."
SignalLamp is tool
SignalLamp has significance medium
SignalLamp has function "Synchronizes the floodgate crews during blackwater storms."
SignalLamp has symbolism "Practical trust between workers."

// Scene Moods
watchful is mood
watchful has emotion caution 4
watchful has emotion hope 2
tense is mood
tense has emotion fear 3
tense has emotion anger 4
defiant is mood
defiant has emotion resolve 5
defiant has emotion anger 3
elegiac is mood
elegiac has emotion grief 4
elegiac has emotion tenderness 3
hopeful is mood
hopeful has emotion relief 4
hopeful has emotion trust 3

// Themes
Story has theme truth as primary
Story has theme sacrifice as secondary
Story has theme trust as secondary

// === WISDOM ===
W1 is wisdom
W1 has label "Truth requires a witness"
W1 has category ethics
W1 has insight "Facts hidden in private can be denied; truth becomes durable when a community hears it together."
#hint: Demonstrate wisdom through action and consequence, not lectures.
W1 has application "The climax must move from secret evidence to public testimony."
W1 has examples "The ledger repeats the spoken confession for the crowd at the bell tower."
Story includes wisdom W1


// === STORY PATTERNS ===
P1 is pattern
P1 has label "Buried Ledger"
P1 has type mystery_revelation
#hint: Patterns constrain plot shape; avoid random twists that break the declared pattern.
P1 has description "A hidden record resurfaces and forces both private guilt and public corruption into the open."
P1 has structure "buried accusation > dangerous investigation > betrayal > public revelation > costly restoration"
P1 has key_question "Who controls history when memory itself can testify?"
P1 has examples "The archive, ledger, and bell form a chain from evidence to consequence."
Story includes pattern P1


// Structure
Book group begin
  Book has title "The Bell of the Drowned Library"
  #hint: Keep the chapter rhythm tight: discovery, pressure, exposure, sacrifice, renewal.
  Ch1 group begin
    Ch1 has title "Ashes Under Salt"
    #context: This chapter reopens an old wound and turns rumor into investigation.
    Sc1.1 group begin
      Sc1.1 has title "The Name on the Wharf"
      #hint: Open with harsh weather, labor detail, and the emotional shock of the ledger page.
      Sc1.1 includes character Mara
      Sc1.1 includes character Andrei
      Sc1.1 includes location "North Breakwater"
      Sc1.1 includes location "Glass Harbor"
      Sc1.1 includes object BrassKey
      Mara inspects "washed ledger page"
      Andrei warns Mara
      Mara decides "find Daria"
    Sc1.1 group end
    Sc1.2 group begin
      Sc1.2 has title "Vaults That Breathe"
      #reveal: Daria confirms that the ledger can make seawater echo truth.
      Sc1.2 includes character Mara
      Sc1.2 includes character Daria
      Sc1.2 includes location "Drowned Archive"
      Sc1.2 includes object TideLedger
      Sc1.2 includes dialogue D1
      Daria reveals TideLedger
      Mara asks Daria
      Daria guides Mara
    Sc1.2 group end
    Sc1.3 group begin
      Sc1.3 has title "A Public Offer"
      #contrast: Make the market loud and public so Iacob’s calm feels threatening.
      Sc1.3 includes character Mara
      Sc1.3 includes character Andrei
      Sc1.3 includes character Iacob
      Sc1.3 includes location "Salt Market"
      Sc1.3 includes object SignalLamp
      Iacob offers Mara
      Mara refuses Iacob
      Andrei conceals debt
    Sc1.3 group end
  Ch1 group end
  Ch2 group begin
    Ch2 has title "Water Remembers"
    #context: This chapter turns suspicion into proof and fractures the main alliance.
    Sc2.1 group begin
      Sc2.1 has title "The Chamber Behind the Gears"
      #sensory: Use metallic residue, cold spray, and gear noise to ground the reveal.
      Sc2.1 includes character Mara
      Sc2.1 includes character Andrei
      Sc2.1 includes location "Clocktower Reservoir"
      Sc2.1 includes object BrassKey
      Sc2.1 includes object SignalLamp
      Mara unlocks "hidden chamber"
      Andrei discovers "forged seal residue"
      Mara collects proof
    Sc2.1 group end
    Sc2.2 group begin
      Sc2.2 has title "Debts in Open Air"
      #subtext: Mara’s anger is really terror that trust always hides a bill.
      Sc2.2 includes character Mara
      Sc2.2 includes character Andrei
      Sc2.2 includes character Daria
      Sc2.2 includes location "Drowned Archive"
      Sc2.2 includes dialogue D2
      Andrei confesses debt
      Mara accuses Andrei
      Daria demands focus
    Sc2.2 group end
    Sc2.3 group begin
      Sc2.3 has title "The Harbor Closes"
      #pacing: Accelerate sharply: arrests, shouted orders, machinery, running feet.
      Sc2.3 includes character Mara
      Sc2.3 includes character Daria
      Sc2.3 includes character Iacob
      Sc2.3 includes location "Glass Harbor"
      Sc2.3 includes object SignalLamp
      Iacob arrests Daria
      Iacob seizes floodgates
      Mara steals SignalLamp
    Sc2.3 group end
  Ch2 group end
  Ch3 group begin
    Ch3 has title "When the Bell Answers"
    #context: This chapter resolves both the civic and intimate conflicts through public witness and sacrifice.
    Sc3.1 group begin
      Sc3.1 has title "Before the Surge"
      #voice: The storm should feel physical and logistical, not abstract.
      Sc3.1 includes character Mara
      Sc3.1 includes character Andrei
      Sc3.1 includes character Daria
      Sc3.1 includes location "Clocktower Reservoir"
      Sc3.1 includes object BrassKey
      Mara frees Daria
      Andrei signals crews
      Daria prepares TideLedger
    Sc3.1 group end
    Sc3.2 group begin
      Sc3.2 has title "The Bell Tower Witness"
      #hint: The climax must combine public dialogue, magical proof, and Mara’s irreversible choice.
      Sc3.2 includes character Mara
      Sc3.2 includes character Andrei
      Sc3.2 includes character Daria
      Sc3.2 includes character Iacob
      Sc3.2 includes location "North Breakwater"
      Sc3.2 includes object TideLedger
      Sc3.2 includes object StormBell
      Sc3.2 includes dialogue D3
      Mara opens TideLedger
      Iacob confesses orders
      Mara rings StormBell
    Sc3.2 group end
    Sc3.3 group begin
      Sc3.3 has title "Dawn Over the Quay"
      #avoid: Do not erase the cost of Mara’s sacrifice; recovery should feel earned and incomplete.
      Sc3.3 includes character Mara
      Sc3.3 includes character Andrei
      Sc3.3 includes character Daria
      Sc3.3 includes location "Glass Harbor"
      Harbor survives surge
      Iacob loses office
      Mara accepts silence
    Sc3.3 group end
  Ch3 group end
Book group end

```
