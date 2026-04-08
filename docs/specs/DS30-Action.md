<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzMwLUFjdGlvbi5tZA==","title":"DS30-Action","version":2,"updatedAt":"2026-04-08T09:34:13.106Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-action","title":"DS30 — Action","anchorId":"chapter-ds30-action"}} -->
<a id="chapter-ds30-action"></a>
# DS30 — Action
<!-- {"achilles-ide-paragraph":{"id":"paragraph-c7b18735-c410-43ff-80e3-5e48efc51975","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-what-it-is","title":"Overview","anchorId":"chapter-ds30-what-it-is"}} -->
<a id="chapter-ds30-what-it-is"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-7f61150b-72f1-47be-9623-b4772c84c6e3","type":"markdown","title":"Paragraph 1"}} -->
This document defines the role of action in SCRIPTA and the way action should be handled as part of scene authoring.

In SCRIPTA, action should not be treated as a secondary detail hidden somewhere inside prose. Action is one of the clearest carriers of narrative change. It turns intention into consequence, moves characters and objects through space, reveals decisions, and gives scenes material direction. A scene may have the right characters and the right setting, yet still feel inert if nothing decisive happens. For that reason, action should exist as an explicit and editable part of the scene model.

The purpose of this document is to establish action as a first-class scene element. It should remain readable, editable, and connected to character presence, setting, local purpose, and later prose generation.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-why-it-matters","title":"Editorial Role","anchorId":"chapter-ds30-why-it-matters"}} -->
<a id="chapter-ds30-why-it-matters"></a>
## Editorial Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-b5e3ada4-e1e8-4503-902c-53cf2600ecac","type":"markdown","title":"Paragraph 1"}} -->
Action sits at the point where scene design becomes event. It belongs to the same editorial layer as dialog, character presence, and location, but it answers a different question. Dialog tells us what is said. Character presence tells us who is there. Location tells us where the scene unfolds. Action tells us what actually happens.

This matters in product terms because many weak scenes are structurally present but dramatically inactive. They contain setup, description, and speech, but they lack event pressure. The action layer gives the author a direct place to repair that weakness without having to rewrite the entire scene from scratch.

The intended relationship is:

`Create Story -> Scene Structure -> Action -> NL Story -> Manuscript`


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-how-authors-work","title":"Authoring Model","anchorId":"chapter-ds30-how-authors-work"}} -->
<a id="chapter-ds30-how-authors-work"></a>
## Authoring Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ce23992c-fbc8-49c3-860d-ee7be7566a98","type":"markdown","title":"Paragraph 1"}} -->
The author should be able to work with action directly inside the scene workflow. In practice, this means being able to add a new event, refine an existing one, remove a weak or redundant movement, or reorder actions so the scene gains stronger rhythm and causality.

The base interaction should remain lightweight. The author identifies who performs the action and what materially happens. Where useful, the system may also capture an affected target, an object, or a short note about consequence. Richer context may be added later, but the first step should remain fast enough to support actual writing flow.

Generated actions and manually added actions should both remain editable. If an action already exists in the scene, the author should be able to change who performs it, change what happens, change the target or affected element, or move that action to a different position in the sequence. These are not cosmetic adjustments. They affect pacing, agency, dramatic emphasis, and causality.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-scene-structure","title":"Structural Model","anchorId":"chapter-ds30-scene-structure"}} -->
<a id="chapter-ds30-scene-structure"></a>
## Structural Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ece63573-bf03-4738-995a-38c18a4f78ec","type":"markdown","title":"Paragraph 1"}} -->
Action should be treated as a scene component rather than as a global project entity. A scene action exists because someone does something somewhere under specific narrative conditions. It belongs to the local logic of the scene.

For that reason, actions should be stored and edited as a structured sequence of events inside the scene rather than being left entirely implicit in one body of text. Even if the interface remains natural and writer-friendly, the underlying model should preserve event order, actor identity, and scene attachment. Without that structure, action becomes too difficult to track once scenes begin changing repeatedly.

The user experience, however, should remain simple. The author should feel that they are editing the event flow of the scene, not filling out a technical diagram.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-relationships","title":"Narrative Relationships","anchorId":"chapter-ds30-relationships"}} -->
<a id="chapter-ds30-relationships"></a>
## Narrative Relationships
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e2c78ac4-2438-427e-b3cf-2a43f266389f","type":"markdown","title":"Paragraph 1"}} -->
Action only makes sense in relation to other scene elements. It is strongly connected to characters, because action is one of the clearest surfaces through which agency becomes visible. Who acts, who hesitates, who initiates, and who responds are all central to scene meaning.

Action is also connected to location. A confrontation, discovery, chase, exchange, or gesture happens somewhere, and that setting changes how the event reads. The same action does not carry the same tone or plausibility in a market, a prison corridor, a ruined chapel, or a flooded archive.

Finally, action is connected to scene purpose. An event may escalate conflict, trigger a reveal, force a choice, shift power, confirm danger, or move a character across a threshold. The goal is not simply to record motion. The goal is to make visible what the scene materially does.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-editor-behavior","title":"Workspace Behavior","anchorId":"chapter-ds30-editor-behavior"}} -->
<a id="chapter-ds30-editor-behavior"></a>
## Workspace Behavior
<!-- {"achilles-ide-paragraph":{"id":"paragraph-52a711ae-fd65-4462-889c-3ed538b8978a","type":"markdown","title":"Paragraph 1"}} -->
Action should be edited inside the `Scene Editor` rather than in a detached global workspace. A strong baseline interaction is a dedicated section inside the scene page where actions appear as an ordered sequence of editable event blocks.

Each action should be easy to scan. The author should be able to understand quickly who acts, what happens, and how the event sequence progresses. Adding, removing, and reordering actions should remain straightforward and should not require leaving the scene context.

The editing experience should feel editorial rather than technical. The product should preserve structure for the system while presenting clarity for the author.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-sync","title":"Synchronization","anchorId":"chapter-ds30-sync"}} -->
<a id="chapter-ds30-sync"></a>
## Synchronization
<!-- {"achilles-ide-paragraph":{"id":"paragraph-c749d90c-e89d-45f9-aa89-48333c3ca350","type":"markdown","title":"Paragraph 1"}} -->
The validation model should remain light but meaningful. Every action should belong to a valid scene. If the action identifies an actor, that actor should be valid in project state. If the action depends on scene location, that location context should remain consistent with the wider scene definition. Event order should remain stable after editing.

When action changes, the structured scene representation should update immediately. Derived representations should treat the edited action flow as the current source of truth. Ordinary scene editing should not force the user to manually repair downstream structures.

If prose has already been generated, the same distinction used elsewhere in SCRIPTA should remain in place. Structural scene state should update immediately, but existing prose should not be silently rewritten in that same moment. The scene may instead be marked for refresh, rewrite, or regeneration. Later prose operations should then use the latest action sequence as part of the source of truth.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds30-success","title":"Success Criteria","anchorId":"chapter-ds30-success"}} -->
<a id="chapter-ds30-success"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-bff1fdc4-2008-4f67-855e-814f1b60d365","type":"markdown","title":"Paragraph 1"}} -->
This feature succeeds when an author can inspect and refine what happens in a scene without confusion, strengthen agency and causality through action editing, and trust that those edits remain aligned with characters, location, scene purpose, and later prose operations. It also succeeds when action feels like a genuine editorial layer rather than an invisible byproduct of generated text.
