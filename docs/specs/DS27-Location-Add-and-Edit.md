<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzI3LUxvY2F0aW9uLUFkZC1hbmQtRWRpdC5tZA==","title":"DS27-Location-Add-and-Edit","version":2,"updatedAt":"2026-04-08T18:20:00.000Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-location-add-edit","title":"DS27 — Location-Add-and-Edit","anchorId":"chapter-ds27-location-add-edit"}} -->
<a id="chapter-ds27-location-add-edit"></a>
# DS27 — Location-Add-and-Edit
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2e31dc7e-4b91-4ed8-a990-7608031d96f0","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-overview","title":"Overview","anchorId":"chapter-ds27-overview"}} -->
<a id="chapter-ds27-overview"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-96b397b2-3d33-48bf-99ef-b355350a2962","type":"markdown","title":"Paragraph 1"}} -->
This document defines how SCRIPTA should support adding new locations and editing existing locations inside a project that already contains generated scenes, generated world context, or generated structural story material.

Locations in SCRIPTA are not decorative labels. They shape atmosphere, movement, continuity, world logic, and the credibility of scene action. A generated story may already contain useful locations, but those locations may still need correction, sharpening, or extension. The author may also discover that the generated world is missing an important setting entirely. The purpose of this feature is to support that refinement without forcing the user to rebuild the story foundation from scratch.

For that reason, location editing should be treated as part of narrative structure. When a location is added or changed, the result should influence project state, scene references, CNL, and later prose operations rather than remaining a detached piece of metadata.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-product-role","title":"Product Role","anchorId":"chapter-ds27-product-role"}} -->
<a id="chapter-ds27-product-role"></a>
## Product Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-cdf8f866-4481-4050-8e0e-c0977e5d859c","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA creates an initial world and structure through `New Project`, `Processing`, and story generation. By the time the author begins refinement, the project may already contain scenes that refer to places, setting assumptions, and a first location set. The role of `Add Location` and `Edit Location` is to give the author control over those spaces after the initial story has already taken shape.

The intended sequence is:

`Create Story -> Generated Scenes and Locations -> Add Location / Edit Location -> CNL Update -> NL Story / Manuscript`

This sequence matters because location editing is not separate from narrative quality. The places in which scenes occur influence coherence, continuity, object usage, relationship staging, and the plausibility of the story world. The product should therefore treat location work as structural editorial refinement.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-design-intent","title":"Design Intent","anchorId":"chapter-ds27-design-intent"}} -->
<a id="chapter-ds27-design-intent"></a>
## Design Intent
<!-- {"achilles-ide-paragraph":{"id":"paragraph-93115a86-c5ef-4361-8773-41fbba6c56f5","type":"markdown","title":"Paragraph 1"}} -->
The experience should feel composed, intentional, and trustworthy. When an author notices that a generated location is too generic, incorrectly named, or not rich enough to support the scene, the product should make refinement feel straightforward. When the story needs a new place, the author should be able to introduce it quickly without losing confidence in the consistency of the rest of the project.

The design intent is to make setting refinement feel editorial rather than technical. Generated locations should be editable. New locations should be easy to introduce where the story requires them. Changes to existing places should remain visible when they affect scenes or prose that already exist. Above all, the product should preserve the distinction between structural world updates and optional textual regeneration.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-scope","title":"Scope","anchorId":"chapter-ds27-scope"}} -->
<a id="chapter-ds27-scope"></a>
## Scope
<!-- {"achilles-ide-paragraph":{"id":"paragraph-86fe0a59-4e88-4af7-b543-b1867f5c383d","type":"markdown","title":"Paragraph 1"}} -->
This document covers the behavior for adding a new location to an existing project, editing a location that already exists in that project, attaching locations to generated scenes, and synchronizing those decisions into the formal narrative state. It also defines how location changes should influence later generation and revision workflows.

This document does not define map rendering, visual geography systems, image assets, or a full world encyclopedia model. Its concern is more immediate and product-facing: once the story already exists in structured form, how should authors refine the spaces in which that story happens?


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-core-scenarios","title":"Core User Scenarios","anchorId":"chapter-ds27-core-scenarios"}} -->
<a id="chapter-ds27-core-scenarios"></a>
## Core User Scenarios
<!-- {"achilles-ide-paragraph":{"id":"paragraph-c5394bf7-5e3d-4197-87a4-f24ca7d67380","type":"markdown","title":"Paragraph 1"}} -->
The main use cases are practical. An author may realize that a generated scene needs a location that does not yet exist in the project. Another may decide that a generated setting is too vague and needs clearer atmosphere, function, or world context. In some cases, two locations may have been implicitly conflated by the system and now need to be separated. In others, a location may already be structurally present but require stronger integration with characters, objects, or world rules.

In each of these situations, the author should be able to act locally and confidently, without redoing the entire story generation process just to fix the places where events unfold.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-add-location","title":"Add Location","anchorId":"chapter-ds27-add-location"}} -->
<a id="chapter-ds27-add-location"></a>
## Add Location
<!-- {"achilles-ide-paragraph":{"id":"paragraph-de8e4517-ea07-4c1b-94b5-b36aeef5ba6b","type":"markdown","title":"Paragraph 1"}} -->
`Add Location` should allow the author to introduce a new setting into a project that already contains structure and scene material. That action may begin from the `Locations` or `World` page, from a generated scene, or from the structure tree. No matter where it starts, the product should create the same project-level location entity.

The initial creation step should remain lightweight. The user should be able to establish a usable location with the minimum information needed to make that place valid in the story. A visible name is essential, and a basic type or category should be available so the system understands whether the location is, for example, a settlement, interior space, landscape, institution, or another narrative setting type. Richer detail such as atmosphere, short description, world layer, narrative function, or local constraints should remain easy to add immediately afterward, but those details should not block the first save.

`Add Location` must open an explicit creation state rather than silently selecting an existing location. In the current implementation this means the location editor opens with a new draft on the right side, while the existing project locations remain visible in the left-side list. Saving from that state must create a new project-level location entity. It must never overwrite the first location in the list just because no explicit selection was made.

When the user adds a location from inside a scene, the system should first create the location at project level if it does not already exist and then attach that location to the selected scene as a scene reference. The distinction is important for the same reason it is important with characters: the location belongs to the wider project, while its use inside a scene belongs to local story structure.

Adding a location to a generated scene should update the structural story state immediately, but it should not silently rewrite existing prose. That location should instead become available for later rewrite, regeneration, or verification.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-edit-location","title":"Edit Location","anchorId":"chapter-ds27-edit-location"}} -->
<a id="chapter-ds27-edit-location"></a>
## Edit Location
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e1f996eb-a151-4fec-81a5-c913b562cd07","type":"markdown","title":"Paragraph 1"}} -->
`Edit Location` should allow the author to refine any location already present in the project, including locations originally created during automatic story generation. A generated setting should remain fully editable and should never feel frozen because it came from the system.

The editable surface should cover the dimensions of a location that meaningfully shape the story. This includes identity, category, descriptive profile, atmosphere, world-layer placement, constraints, narrative function, and the way the location connects to scenes, characters, or objects. The product should not force the user into a rigid taxonomy, but it should make these editorial dimensions easy to understand and refine.

`Edit Location` must remain clearly distinct from `Add Location`. Selecting a location from the list should place the editor in edit mode for that specific entity. Saving from that state must preserve the stable identity of the selected location and update that location in place rather than creating a duplicate or modifying some other item.

This is especially important for generated stories, where the location set may be structurally useful but too generic to carry tone or continuity convincingly. A generated location may need a stronger name, sharper atmosphere, clearer social function, or better distinction from another nearby place. The author should be able to make that refinement directly, with confidence that the rest of the system will remain aligned.

Location edits should have visible structural consequences. They affect project state, CNL, scene references, and later prose guidance. If a location change makes some existing scene text less accurate, the system should keep the edit and surface the impact clearly rather than hiding the inconsistency.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-scene-assignment","title":"Location-to-Scene Assignment","anchorId":"chapter-ds27-scene-assignment"}} -->
<a id="chapter-ds27-scene-assignment"></a>
## Location-to-Scene Assignment
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ee359f2f-599b-46b6-b4ea-03f9d042ef61","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA should clearly separate the project-level location definition from the use of that location inside a specific scene. A location may exist in the project without being active in every scene, and a scene may reference one or more locations without redefining them.

The author should be able to attach an existing location to a scene, introduce a new location directly from scene context, remove a scene-level location reference without deleting the project-level location, and inspect where a given location is currently used across the story. This protects the project from destructive behavior. Removing one scene reference should never erase a location that still matters elsewhere.

The assignment model should also help the author understand spatial continuity. When editing a location, it should be easy to see where that location appears and where it does not.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-ui-structure","title":"UI Structure","anchorId":"chapter-ds27-ui-structure"}} -->
<a id="chapter-ds27-ui-structure"></a>
## UI Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2e13c428-91ee-4eb0-a342-eb88609d4297","type":"markdown","title":"Paragraph 1"}} -->
The interface should support quick adjustments and deeper setting refinement with equal clarity. A strong baseline layout is a left-side location list, a central location editor, and a right-side usage and impact panel.

The current implementation uses a two-column workspace rather than a three-panel layout. The left column is `Location List`. The right column is the dedicated `Location Setup` editor for the currently selected or newly created location. This matches the editorial pattern already used for characters and keeps navigation and editing visible at the same time.

The list should present all project locations in a way that makes them easy to scan and compare. It should help the user find a place quickly, recognize the selected location immediately, and understand key metadata such as geography, era, or definition density without opening every entry.

The current `Location Setup` editor is intentionally narrower than the broader conceptual model. It focuses on the fields that are already implemented and synchronized: location name, geography, era or time period, characteristics, and CNL annotations. This is enough to support a premium refinement workflow without pretending that a larger world encyclopedia system already exists.

An impact panel is not currently implemented as a dedicated third column. Instead, the current page includes a lightweight impact section inside the main editor area. The document should treat richer usage and dependency surfacing as a future enhancement rather than describing it as already shipped.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-data-model","title":"Data Model","anchorId":"chapter-ds27-data-model"}} -->
<a id="chapter-ds27-data-model"></a>
## Data Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-fabf5cde-4c26-4d7f-b0a4-a43aa6daf138","type":"markdown","title":"Paragraph 1"}} -->
At product level, this feature also depends on two linked concepts: the project location and the scene-level location reference.

The project location is the reusable narrative setting entity. It should preserve a stable identifier, a visible name, a source flag such as `generated` or `user`, and the editorial information that defines what sort of place it is and how it functions in the story. That information may include category, description, atmosphere, world layer, narrative function, constraints, and connections to other entities.

The scene-level reference is narrower. It links a specific scene to an existing project location and may optionally carry a local scene-specific function or note. The distinction is necessary because the location belongs to the project world, while the scene reference belongs to the local staging of events.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-validation","title":"Validation and Synchronization","anchorId":"chapter-ds27-validation"}} -->
<a id="chapter-ds27-validation"></a>
## Validation and Synchronization
<!-- {"achilles-ide-paragraph":{"id":"paragraph-3ba622d5-7a26-4902-9cca-b18667fff291","type":"markdown","title":"Paragraph 1"}} -->
The system should enforce only the rules necessary to protect coherence. Every location should have a stable identity and a valid name. Scene references must always point to an existing project location. A rename should preserve identity rather than producing accidental duplication. Removing a location from one scene must not automatically delete that location from the project if it remains relevant elsewhere.

The editor flow must also preserve the distinction between creation state and selection state. If the user clicks `Add Location`, the next save must create a new entity. If the user selects an existing location, the next save must update that entity. The product should never infer edit mode from list fallback alone, because that creates accidental overwrite behavior and breaks trust.

The product should also support non-blocking warnings where appropriate. A location may be technically valid while still being editorially weak. The system may warn when a location is too generic, never used in any scene, nearly duplicates another place, or no longer matches assumptions already present in generated prose.

Synchronization with CNL should happen as part of the normal visual workflow. When a location is added or edited, the project state should update first and the generated CNL should remain aligned with that change. The user should not be forced into manual repair of the formal representation after ordinary setting edits.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-generated-prose","title":"Interaction with Generated Prose","anchorId":"chapter-ds27-generated-prose"}} -->
<a id="chapter-ds27-generated-prose"></a>
## Interaction with Generated Prose
<!-- {"achilles-ide-paragraph":{"id":"paragraph-f6ffbe55-06e1-46d0-abf7-8f122ba514dc","type":"markdown","title":"Paragraph 1"}} -->
Location edits may happen after prose already exists, so the product should maintain the same clarity here that it does for characters. Structural truth and current textual output are related, but they are not the same thing.

When the user adds or edits a location, the structural state and specification should update immediately. Existing prose should not be silently rewritten in that same moment. If a location change affects scenes or chapters that already contain text, those areas may be marked for rewrite, regeneration, or verification. Later prose operations should then use the updated location state as the source of truth.

This keeps the workflow honest and predictable. The system reflects the user's structural decision immediately, while the author remains in control of when the manuscript itself changes.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-success","title":"Success Criteria","anchorId":"chapter-ds27-success"}} -->
<a id="chapter-ds27-success"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0765aa06-da68-49c4-a98a-cc5d03d115bd","type":"markdown","title":"Paragraph 1"}} -->
This feature succeeds when an author can add a new location to a generated project without confusion, refine generated locations without fear of damaging structure, attach locations to scenes in a controlled way, and trust that the project state and CNL will remain aligned. It also succeeds when the product keeps a clear boundary between structural setting edits and optional prose regeneration, so that the experience feels deliberate and premium. In the current UI, success also specifically means that `Add Location` creates a new location draft reliably, `Edit Location` updates the selected location reliably, and the left-side list plus right-side editor pattern remains stable across repeated edits.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds27-non-goals","title":"Non-Goals","anchorId":"chapter-ds27-non-goals"}} -->
<a id="chapter-ds27-non-goals"></a>
## Non-Goals
<!-- {"achilles-ide-paragraph":{"id":"paragraph-8213c7c6-ad9d-4700-9043-0b79a55d1b08","type":"markdown","title":"Paragraph 1"}} -->
This document does not define a map editor, a geography simulation system, a visual world atlas, or automatic manuscript rewriting after every location change. Its purpose is more focused: to define a premium, reliable workflow for adding and refining locations inside an already generated story project.
