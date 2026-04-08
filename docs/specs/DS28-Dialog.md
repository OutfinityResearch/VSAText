<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzI4LURpYWxvZy5tZA==","title":"DS28-Dialog","version":2,"updatedAt":"2026-04-08T09:54:24.444Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-dialog","title":"DS28 — Dialog","anchorId":"chapter-ds28-dialog"}} -->
<a id="chapter-ds28-dialog"></a>
# DS28 — Dialog
<!-- {"achilles-ide-paragraph":{"id":"paragraph-c78996c7-63fb-4ce2-b32d-49899d732b29","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-what-dialog-is","title":"Overview","anchorId":"chapter-ds28-what-dialog-is"}} -->
<a id="chapter-ds28-what-dialog-is"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-02d80602-844b-4e90-b020-0939dc69fd30","type":"markdown","title":"Paragraph 1"}} -->
This document defines the role of dialog in SCRIPTA and the way dialog should be handled as part of scene authoring.

In SCRIPTA, dialog should not be treated as filler text or as a late cosmetic layer. It is one of the clearest surfaces through which character voice, conflict, information control, emotional pressure, and scene progression become visible on the page. A strong dialog system must therefore preserve two things at once: freedom at line level and structure at story level.

The purpose of this document is to define dialog as a first-class scene element. It should remain editable, tied to speakers, connected to scene logic, and capable of informing later prose generation and revision without becoming rigid or overly technical.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-why-it-matters","title":"Editorial Role","anchorId":"chapter-ds28-why-it-matters"}} -->
<a id="chapter-ds28-why-it-matters"></a>
## Editorial Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-16b58834-4462-4c79-9545-e71ef7e6ce85","type":"markdown","title":"Paragraph 1"}} -->
Dialog sits between planning and prose. It is not as abstract as beat design, but it is not only final manuscript text either. In product terms, dialog belongs to the scene layer, where narrative intent starts turning into concrete exchange between characters.

This matters because many scene problems are not failures of premise but failures of exchange. A scene may contain the right participants and the right idea, yet still feel flat if nobody speaks with force, pressure, restraint, or subtext. Dialog gives the author a direct place to repair that weakness.

The intended relationship is:

`Create Story -> Scene Structure -> Dialog -> NL Story -> Manuscript`


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-how-authors-work","title":"Authoring Model","anchorId":"chapter-ds28-how-authors-work"}} -->
<a id="chapter-ds28-how-authors-work"></a>
## Authoring Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4cb86f48-3216-4267-a4a9-35acb497a940","type":"markdown","title":"Paragraph 1"}} -->
The author should be able to work with dialog directly inside the scene workflow. In practice, this means being able to add a new line, refine an existing one, remove a weak exchange, change the speaker, or reorder lines so the scene gains better rhythm and dramatic force.

The base interaction should remain lightweight. The author selects or confirms the speaker and writes the line. Where useful, the system may also capture richer local context such as intent, beat association, or conversational outcome, but the first step should remain fast enough to support real writing flow.

Generated dialog and manually written dialog should both remain editable. If a line exists in the scene, the author should be able to rewrite it, reassign it, move it, or remove it. These are not cosmetic operations. They affect pacing, power balance, emotional tone, and character perception.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-scene-structure","title":"Structural Model","anchorId":"chapter-ds28-scene-structure"}} -->
<a id="chapter-ds28-scene-structure"></a>
## Structural Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4f95d7c9-292e-470f-a955-1e5d1d9b76e5","type":"markdown","title":"Paragraph 1"}} -->
Dialog should be treated as a scene component rather than as a global project entity. A line belongs to a specific scene and exists because one or more characters are interacting under local narrative conditions.

For that reason, dialog should be stored and edited as a structured sequence of exchanges inside the scene rather than as an undifferentiated text paragraph. Even if the interface feels natural and writer-friendly, the underlying model should preserve line order, speaker identity, and scene attachment. Without that structure, the product loses too much meaning once scenes begin to change repeatedly.

The user experience, however, should remain simple. The author should feel that they are editing a living exchange inside the scene, not filling out a formal schema.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-connections","title":"Narrative Relationships","anchorId":"chapter-ds28-connections"}} -->
<a id="chapter-ds28-connections"></a>
## Narrative Relationships
<!-- {"achilles-ide-paragraph":{"id":"paragraph-267091ba-5613-471e-be8f-018573d00e5e","type":"markdown","title":"Paragraph 1"}} -->
Dialog only makes sense in relation to other scene elements. It is closely connected to characters because every spoken line carries voice, attitude, restraint, intimacy, deception, or conflict. If a line belongs to a speaker, that relationship should remain explicit and reliable.

Dialog is also connected to scene purpose. A conversation may reveal information, escalate pressure, redirect tension, delay action, expose contradiction, or crystallize a decision. The goal is not merely to make speech sound natural. The goal is to make visible what the exchange does to the scene.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-interface","title":"Interface Structure","anchorId":"chapter-ds28-interface"}} -->
<a id="chapter-ds28-interface"></a>
## Interface Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ds28-interface-1","type":"markdown","title":"Paragraph 1"}} -->
Dialog should appear as a dedicated section inside the `Scene Editor`, not as a detached global page and not as a narrow popup workflow. The author should be able to revise exchanges while still seeing the surrounding scene context, including participants, setting, actions, and local purpose.

The baseline interaction should be built around an ordered sequence of dialog blocks. Each block should make speaker ownership immediately legible and should present the spoken line in a form that is easy to scan and revise. The structure should privilege clarity first: who speaks, what is said, and where the exchange sits in the sequence.

The interface should support direct manipulation without becoming noisy. The author should be able to add a new line, insert a line between existing ones, remove a line, reorder lines, and change the speaker without leaving the scene page. If richer metadata such as local intent, beat association, or emotional pressure is present, it should remain secondary to the primary writing surface rather than competing with it.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-editor-behavior","title":"Workspace Behavior","anchorId":"chapter-ds28-editor-behavior"}} -->
<a id="chapter-ds28-editor-behavior"></a>
## Workspace Behavior
<!-- {"achilles-ide-paragraph":{"id":"paragraph-55087b97-abf1-4357-bac4-4a4e336d78f0","type":"markdown","title":"Paragraph 1"}} -->
Dialog should be edited inside the `Scene Editor` rather than in a detached global workspace. A strong baseline interaction is a dedicated section inside the scene page where dialog appears as an ordered sequence of editable line blocks.

Each line should be easy to scan. The author should be able to understand quickly who speaks, what is said, and how the exchange progresses. Adding, removing, and reordering lines should remain straightforward and should not require leaving the scene context.

The editing experience should feel editorial rather than technical. The product should preserve structure for the system while presenting clarity for the author.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-sync","title":"Synchronization","anchorId":"chapter-ds28-sync"}} -->
<a id="chapter-ds28-sync"></a>
## Synchronization
<!-- {"achilles-ide-paragraph":{"id":"paragraph-6f140f86-47bd-4456-9dc4-91c6efb0758e","type":"markdown","title":"Paragraph 1"}} -->
The validation model should remain light but meaningful. Every line should belong to a valid scene. A line should also have a valid speaker association unless the product explicitly supports unattributed or narrator-only lines in a later version. Line order should remain stable after editing.

When dialog changes, the structured scene representation should update immediately. Derived representations should treat the edited dialog as the current source of truth. Ordinary scene editing should not force the user to manually repair downstream structures.

If prose has already been generated, the same distinction used elsewhere in SCRIPTA should remain in place. Structural scene state should update immediately, but existing prose should not be silently rewritten in that same moment. The scene may instead be marked for refresh, rewrite, or regeneration. Later prose operations should then use the latest dialog structure as part of the source of truth.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds28-success","title":"Success Criteria","anchorId":"chapter-ds28-success"}} -->
<a id="chapter-ds28-success"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-af103fea-be9a-4fc4-89e7-4bf6834b647c","type":"markdown","title":"Paragraph 1"}} -->
This feature succeeds when an author can add and revise dialog naturally inside a scene, keep speaker ownership clear, reshape exchanges without losing structural context, and trust that the edited dialog remains aligned with characters, scenes, and later prose operations. It also succeeds when dialog feels like a genuine writing surface rather than a fragile technical widget.
