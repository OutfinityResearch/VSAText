<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzI5LVNjZW5lLUVkaXRvci5tZA==","title":"DS29-Scene-Editor","version":3,"updatedAt":"2026-04-08T15:48:00.000Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-scene-editor","title":"DS29 — Scene Editor","anchorId":"chapter-ds29-scene-editor"}} -->
<a id="chapter-ds29-scene-editor"></a>
# DS29 — Scene Editor

<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-what-it-is","title":"Overview","anchorId":"chapter-ds29-what-it-is"}} -->
<a id="chapter-ds29-what-it-is"></a>
## Overview

This document defines the role of the Scene Editor in SCRIPTA and the way the scene page should function as a local editorial workspace.

The Scene Editor is where planning becomes concrete. It is the place in which characters enter and leave, locations gain dramatic function, actions become explicit, dialog acquires tension, and local scene purpose becomes visible. For that reason, the Scene Editor should not feel like a loose collection of unrelated controls. It should feel like a coherent workspace for shaping scene behavior.

The purpose of this document is to define that workspace at product level so that the scene can be edited as a structured narrative unit rather than as a blank surface or a stack of detached popups.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-why-it-matters","title":"Editorial Role","anchorId":"chapter-ds29-why-it-matters"}} -->
<a id="chapter-ds29-why-it-matters"></a>
## Editorial Role

SCRIPTA already defines story foundation, cast, world, and higher-level structure through workflows such as `New Project`, `Processing`, and `Blueprint`. The Scene Editor exists after that foundation has been established. Its role is to let the author work inside a specific scene with enough depth to refine what actually happens there.

This matters because a story can be well planned and still weak in execution at scene level. A scene may be present in structure but unclear in participants, inert in action, vague in setting, or flat in dialog. The Scene Editor is the place where that gap gets repaired.

The intended relationship is:

`Create Story -> Blueprint -> Scene Editor -> CNL Update -> NL Story -> Manuscript`


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-how-authors-work","title":"Authoring Model","anchorId":"chapter-ds29-how-authors-work"}} -->
<a id="chapter-ds29-how-authors-work"></a>
## Authoring Model

The author should be able to open a scene and understand it quickly. The page should make it easy to answer basic questions such as who is present, where the scene happens, what changes during the scene, what is said, what is done, and how the scene contributes to the larger story.

The product should support direct interventions. An author may discover that one important character is missing, that the setting needs sharper atmosphere, that the scene lacks decisive action, or that dialog is structurally present but dramatically weak. These repairs should happen from the scene workspace or its immediate structural controls. The user should not need to hunt across unrelated workflows just to fix one scene.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-scene-structure","title":"Scene Model","anchorId":"chapter-ds29-scene-structure"}} -->
<a id="chapter-ds29-scene-structure"></a>
## Scene Model

A scene should be treated as the smallest major editorial unit in which narrative change becomes visible. It is not merely a container for text. It is the place where characters act, locations matter, information is revealed or withheld, relationships shift, and tension either rises, releases, or redirects.

For that reason, the Scene Editor should present the scene as a structured narrative unit with interior components rather than as a blank page. Those components should include scene identity and purpose, characters, location, actions, and dialog. The exact implementation may evolve, but the conceptual model should remain stable.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-workspace","title":"Workspace Architecture","anchorId":"chapter-ds29-workspace"}} -->
<a id="chapter-ds29-workspace"></a>
## Workspace Architecture

The Scene Editor should be a full-page workspace dedicated to one selected scene. A strong baseline layout is a left-side structural context panel, a central editing surface, and a right-side impact or diagnostic panel.

The structural context panel should help the author understand where the scene sits inside the chapter, arc phase, or beat progression. The central workspace should hold the editable scene components themselves. The right-side panel should surface warnings, completeness signals, and downstream implications such as outdated prose or missing assignments.

This matters because the author needs both local and global orientation at the same time. A scene is not isolated from the rest of the story, but it also cannot be edited well if the workspace remains too abstract.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-components","title":"Scene Composition","anchorId":"chapter-ds29-components"}} -->
<a id="chapter-ds29-components"></a>
## Scene Composition

The scene page should bring together the main scene components in one coherent flow. Scene identity and purpose give the author a clear understanding of what the scene is meant to accomplish. Characters define who is present and who drives tension. Location defines where the exchange happens and what environmental logic shapes it. Actions define what materially occurs. Dialog gives the scene voice, friction, and social movement.

These components should not feel like separate tools loosely stacked on top of one another. They should feel like connected dimensions of one scene. The author should be able to move between them naturally without losing context.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-editor-behavior","title":"Interaction Model","anchorId":"chapter-ds29-editor-behavior"}} -->
<a id="chapter-ds29-editor-behavior"></a>
## Interaction Model

The Scene Editor should behave as a stable workspace rather than as a stack of popups. When the author enters a scene, the product should give enough space to understand and revise the scene as a whole. Secondary actions such as selecting an existing character, selecting a location, or inserting a line of dialog may still use lightweight controls where appropriate, but the core editing experience should remain anchored in the full scene page.

In the current implementation, scene-level character attachment through structure tools follows a two-step rule. If project characters already exist, the user is shown a selection modal and the chosen character is attached to the scene as a `character-ref`. If no project characters exist yet, the system should route the author into the dedicated character editor so a project-level character can be created first.

The page should not force a rigid order of work. Some authors will begin with dialog. Others will fix participants first. Others will clarify purpose or action before anything else. The product should support that editorial flexibility without losing structure.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-sync","title":"Synchronization","anchorId":"chapter-ds29-sync"}} -->
<a id="chapter-ds29-sync"></a>
## Synchronization

The Scene Editor should preserve coherence between scene state and the wider project. Characters attached to the scene must remain valid project characters. The same rule applies to locations. Dialog lines should preserve valid speaker associations. Action and scene notes should remain tied to the correct scene identity.

When the author edits the scene, the project state should update first, and derived structured representations should remain aligned automatically. Ordinary scene editing should not force the user to manually repair CNL or other downstream layers.

Scene-level character use must remain distinct from character authoring. A scene may reference a project character, but that reference should not redefine the character object itself. Deleting a scene reference should therefore not delete the project character.

If manuscript text already exists, the same distinction used elsewhere in SCRIPTA should remain in place. Structural scene state should update immediately, but existing prose should not be silently rewritten in that same moment. The scene may instead be marked for refresh, rewrite, or regeneration. Later prose operations should then use the updated scene state as the source of truth.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds29-success","title":"Success Criteria","anchorId":"chapter-ds29-success"}} -->
<a id="chapter-ds29-success"></a>
## Success Criteria

The Scene Editor succeeds when an author can open a scene and immediately understand its current state, revise its participants and setting without confusion, refine actions and dialog in context, and trust that those edits remain aligned with the wider project. It also succeeds when the page feels like a premium editorial workspace rather than a fragmented collection of low-level tools.
