<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzI2LUNoYXJhY3Rlci1BZGQtYW5kLUVkaXQubWQ=","title":"DS26-Character-Add-and-Edit","version":3,"updatedAt":"2026-04-08T11:47:44.653Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-character-add-edit","title":"DS26 — Character-Add-and-Edit","anchorId":"chapter-ds26-character-add-edit"}} -->
<a id="chapter-ds26-character-add-edit"></a>
# DS26 — Character-Add-and-Edit
<!-- {"achilles-ide-paragraph":{"id":"paragraph-76c187ea-64e9-4887-931d-c4b4f72d3618","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-overview","title":"Overview","anchorId":"chapter-ds26-overview"}} -->
<a id="chapter-ds26-overview"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0659f947-cc88-40dc-b59c-d6603d7fe7da","type":"markdown","title":"Paragraph 1"}} -->
This document defines the current SCRIPTA behavior for adding new characters and editing existing characters inside a project that already contains generated story structure, generated scenes, or generated cast members.

The feature exists because story generation is the beginning of editorial work, not its end. A generated cast may be useful, but it is not automatically complete, precise, or fully aligned with author intent. Authors need a way to introduce a missing character, strengthen a weak one, correct role or motivation, and connect those decisions back into the story foundation without damaging the project.

Character management in SCRIPTA is implemented as structural editing. When a character is added or changed, the result updates project state, generated CNL, relationship state, and downstream evaluation inputs. Existing prose is not rewritten automatically.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-product-role","title":"Product Role","anchorId":"chapter-ds26-product-role"}} -->
<a id="chapter-ds26-product-role"></a>
## Product Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-6c76c637-a1e8-412f-869f-f2a2919f1c14","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA prepares an initial narrative foundation through `New Project`, `Processing`, and the planning flow. By the time the user begins deeper refinement, the project may already contain a first cast, a set of scenes, and the early logic of the story. The role of `Add Character` and `Edit Character` is to preserve authorial control after that automatic preparation has already happened.

The implemented sequence is:

`Create Story -> Generated Scenes and Characters -> Add Character / Edit Character -> CNL Update -> NL Story / Manuscript`

This sequence matters because character work in SCRIPTA is not isolated from the rest of the system. Characters influence structure, dialogue, actions, relationships, scene references, coverage, coherence, and later revision quality. The product therefore treats character editing as part of story definition rather than as optional metadata.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-design-intent","title":"Design Intent","anchorId":"chapter-ds26-design-intent"}} -->
<a id="chapter-ds26-design-intent"></a>
## Design Intent
<!-- {"achilles-ide-paragraph":{"id":"paragraph-86369c03-c274-43ce-b9bc-cc2a1c15e201","type":"markdown","title":"Paragraph 1"}} -->
The experience is designed as an editorial workspace rather than a modal-heavy CRUD flow. Existing cast members remain editable, and new characters can be introduced without resetting the story.

The product currently communicates three core ideas. First, generated characters are editable and not locked. Second, a new character can be introduced from Cast, from the dedicated character editor, and from scene-driven structural flows. Third, character changes update structure immediately while prose refresh remains explicit and separate.

The overall goal is not to simulate a database editor. The goal is to let the author reshape the people who carry the story while keeping the formal and textual layers of the project coherent.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-scope","title":"Scope","anchorId":"chapter-ds26-scope"}} -->
<a id="chapter-ds26-scope"></a>
## Scope
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0c64b401-d302-42aa-a0f8-9c5ed29fbc01","type":"markdown","title":"Paragraph 1"}} -->
This document covers the implemented user-facing behavior for adding a new character to an existing project, editing a character that is already present in that project, attaching characters to scenes through structure tools, and synchronizing those edits into the formal narrative state. It also defines how those changes affect later prose generation and revision.

This document does not define the full cast-generation strategy used during `Create Story`, portrait generation, search-based cast management, or automatic manuscript rewrite after character edits. Its focus is narrower and practical: once a project already exists, how the author adds and refines the cast without breaking the rest of the story.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-core-scenarios","title":"Core User Scenarios","anchorId":"chapter-ds26-core-scenarios"}} -->
<a id="chapter-ds26-core-scenarios"></a>
## Core User Scenarios
<!-- {"achilles-ide-paragraph":{"id":"paragraph-21ead8d6-cd84-4d53-86c6-f9837b3c85d0","type":"markdown","title":"Paragraph 1"}} -->
The primary use cases are straightforward. An author may review generated scenes and notice that an important supporting character is missing. Another author may like the generated structure but feel that the protagonist is too generic, the antagonist too weak, or the supporting cast too thin. In other cases, the story may already work structurally, but a character needs a stronger role, clearer motivation, sharper traits, or different relationship context.

In all of these situations, the user should be able to act locally and confidently. The product should not force regeneration of the entire story just because one character needs to be introduced or refined.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-add-character","title":"Add Character","anchorId":"chapter-ds26-add-character"}} -->
<a id="chapter-ds26-add-character"></a>
## Add Character
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d54c22d8-3455-44bd-a84e-37730717941c","type":"markdown","title":"Paragraph 1"}} -->
`Add Character` allows the author to introduce a new narrative participant into a project that already has structure and story material. In the current implementation, the action can begin from the `Cast` page, from the dedicated character editor sidebar, from primary-role actions in Cast, or from scene / structure flows.

The creation flow is intentionally light but opens directly into the full character editor. New characters start with a generated default name, a role, archetype, arc type, and an empty editable profile. The author can immediately define traits, motivation, description, backstory, and annotations before saving.

When the user adds a character from a structure scene, the current behavior is split:

- If project characters already exist, the structure flow opens a selection modal so the user can attach an existing project character to the selected scene as a `character-ref`.
- If no project characters exist yet, the system routes directly into the dedicated `character-editor` view so the user can create one first.

This distinction is important because a character belongs to the whole project, while a scene uses that character in a local structural context.

Adding a character does not silently rewrite existing prose. It updates the structural story state first. That updated state then becomes available for later generation, rewrite, verification, or editorial refresh.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-edit-character","title":"Edit Character","anchorId":"chapter-ds26-edit-character"}} -->
<a id="chapter-ds26-edit-character"></a>
## Edit Character
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2f1d9000-535d-4f06-ba97-5b62e24c0731","type":"markdown","title":"Paragraph 1"}} -->
`Edit Character` allows the author to refine any character already present in the project, including characters originally created by the system during story generation. A generated origin does not imply that the character is locked or second-class.

This editing flow is implemented as a full workspace view, not as a popup. Character refinement is treated as a dedicated page-level editor so the author has enough space to understand identity, role, relationships, and downstream impact in one coherent environment.

The current editable surface covers identity, role, archetype, arc type, traits, physical description, motivation, short backstory, and CNL annotations. Relationships are shown as a read-only downstream section inside the same editor. Impact is shown as a separate informational section. The current page does not expose a dedicated editable relationship builder inside the character editor itself.

This matters especially for generated projects. The system may produce a cast that is structurally useful but emotionally thin, too generic, or not quite aligned with the author's story instincts. Editing must therefore support not only correction but strengthening. A generated protagonist may need clearer desire. A supporting character may need stronger dramatic purpose. A conflict role may need to be reassigned. The product should support those changes without making the user feel that they are fighting the underlying system.

Character edits have visible consequences. They affect project state, CNL, relationship state, generation guidance, and evaluation inputs. Existing prose is left unchanged until the user explicitly regenerates or rewrites text.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-scene-assignment","title":"Character-to-Scene Assignment","anchorId":"chapter-ds26-scene-assignment"}} -->
<a id="chapter-ds26-scene-assignment"></a>
## Character-to-Scene Assignment
<!-- {"achilles-ide-paragraph":{"id":"paragraph-a9cab8fd-1ce6-466c-866d-b41a68326dae","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA clearly distinguishes between a project-level character definition and the use of that character inside a specific scene. A character may exist in the project without appearing in every scene, and a scene may reference several characters without redefining them.

The author can attach an existing project character to a structure scene through the selection modal. The dedicated editor also exposes a relationship summary for the selected character. Scene-level character usage remains separate from the character definition itself, which protects the story from accidental destructive edits. Removing a character reference from one scene should not erase that character from the larger cast if the character still matters elsewhere.

The current implementation partially supports narrative presence visibility. The editor shows relationship context and impact messaging, but it does not yet render a full scene-usage index inside the character page.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-ui-structure","title":"UI Structure","anchorId":"chapter-ds26-ui-structure"}} -->
<a id="chapter-ds26-ui-structure"></a>
## UI Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-99108ecb-b1ae-42c7-b890-c26954ddb0d3","type":"markdown","title":"Paragraph 1"}} -->
The interface supports both rapid intervention and deeper refinement. `Edit Character` opens as a full-page workspace rather than as a popup. The current structure is a left-side character list, a compact add button under the list title, and a main editor column that contains the selected character header, the editable form, a read-only relationships section, and an impact section.

The list shows all project characters, including both generated and user-added entries. Each list item shows the character name plus a compact metadata line with role and trait count. The current implementation does not include search.

The central editor is intentionally focused. The current header is visually minimal and centers on the selected character name. The form supports the main editorial dimensions that are currently implemented: identity, role, archetype, arc type, traits, physical description, motivation, backstory, and annotations.

The downstream sections currently implemented are:

- `Relationships`: a read-only list of currently defined project relationships for the selected character
- `Impact`: a structural reminder that edits update project state and CNL immediately, while prose remains unchanged until rewrite or regeneration

The current page does not yet include a dedicated scene coverage panel, stale prose marker, or unresolved-gap diagnostics.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-data-model","title":"Data Model","anchorId":"chapter-ds26-data-model"}} -->
<a id="chapter-ds26-data-model"></a>
## Data Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-9645c289-0e1b-4037-9752-4a739e0fd4e4","type":"markdown","title":"Paragraph 1"}} -->
At product level, this feature operates on two linked concepts: the project character and the scene-level character reference.

The project character is the reusable narrative entity. In the current implementation it preserves a stable identifier, visible name, source flag such as `user`, role, archetype, arc type, traits, description, motivation, backstory, and annotations. Relationship records are stored separately in the project relationship collection.

The scene-level reference is narrower. It links a specific scene to an existing project character through a `character-ref` node. This separation is necessary because a character belongs to the project, while scene usage belongs to the structure of the story.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-validation","title":"Validation and Synchronization","anchorId":"chapter-ds26-validation"}} -->
<a id="chapter-ds26-validation"></a>
## Validation and Synchronization
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2ae4ea78-3d74-4ba6-8579-842dd7058418","type":"markdown","title":"Paragraph 1"}} -->
The system enforces a small number of rules that protect coherence without making the editing flow rigid. Every character has a stable identity. A character must have a valid name. Scene references point to existing project characters. A rename preserves identity rather than producing a duplicate entity. Removing a scene-level reference must not silently delete the underlying character if that character still belongs to the project.

The product currently favors immediate save over heavy validation. Non-blocking editorial warnings described here remain future-facing rather than fully implemented in the current page.

Synchronization with CNL happens automatically as part of the visual workflow. When a character is added or edited, the system updates project state first and then keeps generated CNL aligned with that change. Ordinary editing in the visual interface does not require manual repair of the formal representation.

The current implementation also preserves character traits across Cast/editor synchronization boundaries, so traits selected in the dedicated character editor are not lost when the Cast page rehydrates its role-based controls.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-generated-prose","title":"Interaction with Generated Prose","anchorId":"chapter-ds26-generated-prose"}} -->
<a id="chapter-ds26-generated-prose"></a>
## Interaction with Generated Prose
<!-- {"achilles-ide-paragraph":{"id":"paragraph-07dc9b7c-8957-45b7-bba8-9da09d3bf96d","type":"markdown","title":"Paragraph 1"}} -->
Character changes may happen after prose has already been generated. The product should therefore maintain a clear distinction between the current structural truth of the project and the current textual output.

When the user adds or edits a character, the structural state and the specification update immediately. Existing prose is not rewritten silently in the same moment. Later prose operations use the latest character state as the source of truth.

This makes the workflow predictable. The author remains in control of when textual refresh happens, while the system remains honest about what has changed structurally.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds26-success","title":"Success Criteria","anchorId":"chapter-ds26-success"}} -->
<a id="chapter-ds26-success"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4ec2bcc9-669f-4f11-81ca-1f06a1a8348c","type":"markdown","title":"Paragraph 1"}} -->
This feature succeeds when an author can introduce a new character into a generated project without confusion, edit generated characters as freely as manually added ones, attach characters to scenes without breaking structure, and trust that project state and CNL stay aligned. It also succeeds when the system preserves a clear boundary between structural editing and optional prose regeneration, so that the experience feels controlled rather than fragile.


