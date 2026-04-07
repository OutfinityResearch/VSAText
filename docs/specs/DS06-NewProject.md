<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzA2LU5ld1Byb2plY3QubWQ=","title":"DS06-NewProject","version":1,"updatedAt":"2026-04-07T07:05:20.650Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-060fa77f-3bc1-4cd2-af35-3c81c7dee22c","title":"DS06 — New Project","anchorId":"chapter-chapter-060fa77f-3bc1-4cd2-af35-3c81c7dee22c"}} -->
<a id="chapter-chapter-060fa77f-3bc1-4cd2-af35-3c81c7dee22c"></a>
# DS06 — New Project
<!-- {"achilles-ide-paragraph":{"id":"paragraph-189b88d0-c9a1-459c-9dc8-cf06998be2f2","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-496e0729-f17b-4bb8-ac6f-1d6bd052dc5b","title":"Overview","anchorId":"chapter-chapter-496e0729-f17b-4bb8-ac6f-1d6bd052dc5b"}} -->
<a id="chapter-chapter-496e0729-f17b-4bb8-ac6f-1d6bd052dc5b"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-999a50c8-bd0f-45ad-a7c3-885a9b87f101","type":"markdown","title":"Paragraph 1"}} -->
`New Project` is the product entry point for starting a new story in SCRIPTA. It is not only a utility for creating an empty container. It is the moment when the application captures initial author intent, initializes the project foundation, and places the user on the correct path toward story creation.

This document defines what `New Project` is supposed to do, what kind of information it collects, and how it should guide the user into the rest of the workflow.


<!-- {"achilles-ide-chapter":{"id":"chapter-8f487542-9861-4a28-b48a-a5ca2eaceee8","title":"Product Role","anchorId":"chapter-chapter-8f487542-9861-4a28-b48a-a5ca2eaceee8"}} -->
<a id="chapter-chapter-8f487542-9861-4a28-b48a-a5ca2eaceee8"></a>
## Product Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4fc7920a-b347-477d-927b-c0c2212772a9","type":"markdown","title":"Paragraph 1"}} -->
The purpose of `New Project` is to make the beginning of the story process feel guided rather than technical. A user starting a story should not need to understand the entire product model before they can begin. Instead, the product should ask for a small number of meaningful inputs, interpret those inputs intelligently, and prepare the project so that the next steps already feel coherent.

In that sense, `New Project` is both a creation step and an onboarding step. It gives the user a way to begin, but it also establishes the mental model for what happens next.

The intended sequence is simple:

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story`

This order matters because it reflects the internal logic of the product. First the story foundation is established, then the structure is reviewed, then the prose is generated.


<!-- {"achilles-ide-chapter":{"id":"chapter-42f27150-a619-4796-ba73-5733b76576a2","title":"Design Intent","anchorId":"chapter-chapter-42f27150-a619-4796-ba73-5733b76576a2"}} -->
<a id="chapter-chapter-42f27150-a619-4796-ba73-5733b76576a2"></a>
## Design Intent
<!-- {"achilles-ide-paragraph":{"id":"paragraph-b44be87a-b0e9-4d5f-bc56-65730919ea0a","type":"markdown","title":"Paragraph 1"}} -->
`New Project` should feel light, guided, and premium. The user should not be faced with a large form or a technical setup screen. The experience should collect only the inputs that genuinely matter at the beginning and defer deeper control until later.

The design principle here is progressive disclosure. The wizard should capture the essential story direction first and treat advanced controls as optional. This keeps the beginning approachable without removing depth from the system.

At the same time, `New Project` should not behave like a superficial title prompt. It should gather enough information for the system to create a meaningful story foundation rather than just a blank project shell.


<!-- {"achilles-ide-chapter":{"id":"chapter-b19bcdd8-57ff-4909-99d5-08b7115c862c","title":"Wizard Experience","anchorId":"chapter-chapter-b19bcdd8-57ff-4909-99d5-08b7115c862c"}} -->
<a id="chapter-chapter-b19bcdd8-57ff-4909-99d5-08b7115c862c"></a>
## Wizard Experience
<!-- {"achilles-ide-paragraph":{"id":"paragraph-6d45f32e-d7a1-40e3-ac23-a93f102e3528","type":"markdown","title":"Paragraph 1"}} -->
The `New Project` flow is built as a short guided wizard. Each step has a distinct role in establishing the project.

The first step is about strategy. The user chooses how the project should be initialized, whether through a more exploratory mode, an LLM-assisted mode, or a more controlled setup. This decision influences how the project foundation will be prepared.

The second step captures the visible identity and broad editorial direction of the project. This is where the user defines the project name, story length, genre, and tone. These are not deep structural decisions, but they create the immediate shape of the story concept.

The third step moves closer to the actual story. Here the user provides core ideas, constraints, and a thematic pathway. This is where the wizard stops being administrative and starts becoming creative. The goal is to capture enough narrative intent that the system can build a coherent foundation.

The fourth step handles final settings. This includes language and model selection, as well as optional advanced guidance such as narrative style and mood. These advanced inputs should remain secondary and should default to `AI Choice`, allowing the flow to remain light for most users while still supporting more deliberate direction when needed.

The wizard is expected to collect the initial premise of the project in a form that the system can use immediately. It captures the project identity, broad editorial direction, story seed material, and execution preferences. In practical terms, this includes the name of the project, the intended length, genre and tone direction, core ideas, constraints, thematic pathway, generation strategy, language, model, and optional advanced settings such as narrative style and mood. These fields should not be treated as isolated form values. Together, they form the initial creative brief that the application uses to prepare the project.


<!-- {"achilles-ide-chapter":{"id":"chapter-62f55b59-f7b4-4057-aa18-133d0f686269","title":"Project Launch","anchorId":"chapter-chapter-62f55b59-f7b4-4057-aa18-133d0f686269"}} -->
<a id="chapter-chapter-62f55b59-f7b4-4057-aa18-133d0f686269"></a>
## Project Launch
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ea16a4f7-a692-43db-94f1-f7f3bf7c0258","type":"markdown","title":"Paragraph 1"}} -->
When the user clicks `Create Project`, the application should not immediately open the full editor and leave the user to decide what to do next. Instead, this action should trigger a short but meaningful system transition.

The project container is created and persisted. The internal project foundation is prepared. The hidden specification layer may be built in the background. The structural basis needed for `Blueprint` is prepared. The CNL representation is generated as part of that same initialization chain.

From the user's perspective, this should feel like the system is building the story foundation rather than merely saving a file.

This is why a processing stage belongs naturally to the `New Project` experience. It acknowledges that creation in SCRIPTA is not instant in the shallow sense. The product is preparing something more structured than an empty document.


<!-- {"achilles-ide-chapter":{"id":"chapter-ee1e015d-462c-4136-94d3-2f481fd71242","title":"Relationship to Hidden Specification","anchorId":"chapter-chapter-ee1e015d-462c-4136-94d3-2f481fd71242"}} -->
<a id="chapter-chapter-ee1e015d-462c-4136-94d3-2f481fd71242"></a>
## Relationship to Hidden Specification
<!-- {"achilles-ide-paragraph":{"id":"paragraph-243a6642-2c64-4c7f-9443-192e5308171d","type":"markdown","title":"Paragraph 1"}} -->
`New Project` may create an internal specification layer as part of project initialization, but that layer should remain in the background. The user does not need to see a separate low-level specification screen at this point, especially if that screen would appear empty, overly technical, or disconnected from the user's intent.

The system needs the internal foundation, but the user needs clarity. For that reason, the hidden specification should remain an implementation detail of the creation process, while `Blueprint` and `CNL Editor` serve as the visible review layers.

This distinction is important. A product can be structurally sophisticated without forcing that structure to appear as raw complexity in the first-run experience.


<!-- {"achilles-ide-chapter":{"id":"chapter-70eb2573-1434-4c36-b3e3-3217b7e38406","title":"Transition Into Planning","anchorId":"chapter-chapter-70eb2573-1434-4c36-b3e3-3217b7e38406"}} -->
<a id="chapter-chapter-70eb2573-1434-4c36-b3e3-3217b7e38406"></a>
## Transition Into Planning
<!-- {"achilles-ide-paragraph":{"id":"paragraph-95086445-3ce4-46ba-9367-d63c164028ae","type":"markdown","title":"Paragraph 1"}} -->
After project creation, the correct next destination is not the full studio and not prose generation. The correct next destination is the structural planning flow.

That is why `Blueprint` should be the first major review surface after `Processing`. `Blueprint` tells the user what kind of story is being built. `CNL Editor` then makes that structure explicit in formal form. `NL Story` becomes meaningful only after those two layers are in place.

This creates a clean internal logic for the product:

- `New Project` begins the story
- `Processing` prepares the story foundation
- `Blueprint` defines the story
- `CNL Editor` exposes the structure
- `NL Story` executes the text

The clarity of the product depends on preserving this sequence.


<!-- {"achilles-ide-chapter":{"id":"chapter-322755f8-d5de-439d-8f3d-d1066335ea6e","title":"User Experience Goal","anchorId":"chapter-chapter-322755f8-d5de-439d-8f3d-d1066335ea6e"}} -->
<a id="chapter-chapter-322755f8-d5de-439d-8f3d-d1066335ea6e"></a>
## User Experience Goal
<!-- {"achilles-ide-paragraph":{"id":"paragraph-5ef8b45b-3bbb-46e7-89f9-c1e899ad2a59","type":"markdown","title":"Paragraph 1"}} -->
The first impression of `New Project` should be that the product understands how stories begin. The user should feel that they are being asked the right questions, in the right order, and that the system is helping shape the material into something coherent.

If the wizard works well, the user should never feel that they have merely opened a blank technical workspace. Instead, they should feel that the application has taken their intent seriously and transformed it into a prepared story foundation.

This is the moment when SCRIPTA starts to differentiate itself from a general-purpose writing interface. It is not just opening a document. It is beginning a structured story process.


<!-- {"achilles-ide-chapter":{"id":"chapter-c00ec8d9-3be3-472e-b7db-7ae9a2fdeb76","title":"Relationship to Other Specifications","anchorId":"chapter-chapter-c00ec8d9-3be3-472e-b7db-7ae9a2fdeb76"}} -->
<a id="chapter-chapter-c00ec8d9-3be3-472e-b7db-7ae9a2fdeb76"></a>
## Relationship to Other Specifications
<!-- {"achilles-ide-paragraph":{"id":"paragraph-1739f892-f01f-4e1f-8f70-e3b6d72a363a","type":"markdown","title":"Paragraph 1"}} -->
`DS06` defines the start of the workflow. It connects directly to `DS25`, which defines the guided transition from project creation to first story generation, and to `DS04`, which defines the formal CNL layer that emerges from the initialized project state.

Together, these specifications describe how the user moves from intention, to structure, to formal representation, and finally to prose.


<!-- {"achilles-ide-chapter":{"id":"chapter-520a59cf-92f0-4a91-8de4-94f6696e5d3e","title":"Success Criteria","anchorId":"chapter-chapter-520a59cf-92f0-4a91-8de4-94f6696e5d3e"}} -->
<a id="chapter-chapter-520a59cf-92f0-4a91-8de4-94f6696e5d3e"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4d3c8c6e-6d7a-47dd-84af-08c2828f825f","type":"markdown","title":"Paragraph 1"}} -->
`New Project` succeeds when the user can start a meaningful story without needing to understand the entire system upfront, when the product captures enough information to produce a coherent project foundation, and when the next step after creation feels obvious rather than confusing.

It also succeeds when the user experiences the beginning of the product as guided and deliberate, not as a jump into a crowded editing environment.

