<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzA5LVN0b3J5U3R1ZGlvLm1k","title":"DS09-StoryStudio","version":1,"updatedAt":"2026-04-08T08:13:47.179Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-55de43ae-8ca7-41e2-8441-94c27d2d32c7","title":"DS09 — Story Studio Interface","anchorId":"chapter-chapter-55de43ae-8ca7-41e2-8441-94c27d2d32c7"}} -->
<a id="chapter-chapter-55de43ae-8ca7-41e2-8441-94c27d2d32c7"></a>
# DS09 — Story Studio Interface
<!-- {"achilles-ide-paragraph":{"id":"paragraph-dac58d07-22cb-4bd2-8de1-a5244b288ee9","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-2450dd2e-7f43-4e2f-bd5d-fb5d1deb985a","title":"Overview","anchorId":"chapter-chapter-2450dd2e-7f43-4e2f-bd5d-fb5d1deb985a"}} -->
<a id="chapter-chapter-2450dd2e-7f43-4e2f-bd5d-fb5d1deb985a"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e08adb78-cccd-4ded-8d26-37b4991dfc1f","type":"markdown","title":"Paragraph 1"}} -->
Story Studio is SCRIPTA's visual interface for planning, drafting, refinement, and evaluation. This document describes the high-level UI concepts and the way authors move through the studio once a project has been created.

Story Studio is the working environment where the author and System Agents - AI collaborate across structure, specification, prose generation, manuscript refinement, and metrics.


<!-- {"achilles-ide-chapter":{"id":"chapter-cdf526ee-b5b9-4f43-88c8-bf3611c2a209","title":"Design Philosophy","anchorId":"chapter-chapter-cdf526ee-b5b9-4f43-88c8-bf3611c2a209"}} -->
<a id="chapter-chapter-cdf526ee-b5b9-4f43-88c8-bf3611c2a209"></a>
## Design Philosophy
<!-- {"achilles-ide-paragraph":{"id":"paragraph-46aab3ab-842e-42bc-ab91-b5179f64de40","type":"markdown","title":"Paragraph 1"}} -->
Story Studio is based on three principles. The first is visual-first authoring, where authors work through guided planning surfaces rather than writing raw formal language. The second is guided feedback, where planning, generation, and evaluation are explicit steps in the workflow. The third is browser-first execution, where most processing happens client-side and the server primarily handles persistence and optional research/demo processing.


<!-- {"achilles-ide-chapter":{"id":"chapter-959d914f-8f26-4037-bc40-12246f5f402a","title":"Main Layout","anchorId":"chapter-chapter-959d914f-8f26-4037-bc40-12246f5f402a"}} -->
<a id="chapter-chapter-959d914f-8f26-4037-bc40-12246f5f402a"></a>
## Main Layout
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d29862eb-1dc2-42df-9ab7-d502b0b297c9","type":"markdown","title":"Paragraph 1"}} -->
```text
┌────────────────────────────────────────────────────────────────────┐
│  Header: Project Name                           [New] [Save]       │
├──────────────┬────────────────────────────────┬────────────────────┤
│              │                                │                    │
│ Structure    │ Main Canvas                    │ Metrics Panel      │
│ Tree         │                                │                    │
│              │ Focused planning and drafting  │ Quality signals    │
│ Hierarchy    │ surfaces                        │ and diagnostics    │
│              │                                │                    │
├──────────────┴────────────────────────────────┴────────────────────┤
│ Footer: Stats                                         Version      │
└────────────────────────────────────────────────────────────────────┘
```


<!-- {"achilles-ide-chapter":{"id":"chapter-34ef1c7a-f743-48b6-82ec-a00930de396c","title":"Core Workflows","anchorId":"chapter-chapter-34ef1c7a-f743-48b6-82ec-a00930de396c"}} -->
<a id="chapter-chapter-34ef1c7a-f743-48b6-82ec-a00930de396c"></a>
## Core Workflows
<!-- {"achilles-ide-paragraph":{"id":"paragraph-bf9688a8-288f-4989-a0db-9640a1f34e61","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-7d11170d-7a2e-4c0f-9063-c2336eefd1f8","title":"Start New Story","anchorId":"chapter-chapter-7d11170d-7a2e-4c0f-9063-c2336eefd1f8"}} -->
<a id="chapter-chapter-7d11170d-7a2e-4c0f-9063-c2336eefd1f8"></a>
### Start New Story
<!-- {"achilles-ide-paragraph":{"id":"paragraph-a2bd72bd-5262-4e8d-bc59-45aae589b7bc","type":"markdown","title":"Paragraph 1"}} -->
The standard workflow starts in the `New Project` wizard, where the author defines the initial project direction. After the project is created, Story Studio becomes the main working environment for planning, specification review, prose generation, and revision.

The author then continues through `Processing`, `Blueprint`, `CNL Editor`, and `NL Story`. When a draft exists, the author can continue editing in `Manuscript` and review quality signals in `Metrics`.


<!-- {"achilles-ide-chapter":{"id":"chapter-39202b0d-ecd5-48c4-8f2b-0a215a0cef00","title":"Story Foundation","anchorId":"chapter-chapter-39202b0d-ecd5-48c4-8f2b-0a215a0cef00"}} -->
<a id="chapter-chapter-39202b0d-ecd5-48c4-8f2b-0a215a0cef00"></a>
### Story Foundation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d4c66233-9b08-4ac2-8316-76f8b108ab82","type":"markdown","title":"Paragraph 1"}} -->
Story Studio exposes the editorial planning layers needed to build a coherent story foundation. `Story Core` supports theme, wisdom, story fundamentals, and character transformation. `Narrative Design` supports conflict, macro structure, escalation logic, and constraints. `Cast` supports protagonist, antagonist, secondary characters, and relationship logic. `World` supports locations, objects, world rules, and world layers. `Tone & Style` supports language direction for generation and revision.


<!-- {"achilles-ide-chapter":{"id":"chapter-810de4b3-ef7f-486c-9d69-5f8f6c06106e","title":" Story Structure","anchorId":"chapter-chapter-810de4b3-ef7f-486c-9d69-5f8f6c06106e"}} -->
<a id="chapter-chapter-810de4b3-ef7f-486c-9d69-5f8f6c06106e"></a>
###  Story Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-59d55798-9976-4934-860f-13f941116d96","type":"markdown","title":"Paragraph 1"}} -->
The structure view helps authors move from macro planning to editable narrative units. Authors work with chapters, scenes, references, moods, blocks, and actions through a hierarchy that supports both planning and later manuscript work.

When a narrative arc has been selected in `Blueprint`, the structure tree should reflect the progression of that arc rather than remaining only a flat list of scenes. This helps the navigation layer communicate story progression directly.


<!-- {"achilles-ide-chapter":{"id":"chapter-424b48d4-246b-4d43-99c2-3c7f818f8423","title":"Manage Entities","anchorId":"chapter-chapter-424b48d4-246b-4d43-99c2-3c7f818f8423"}} -->
<a id="chapter-chapter-424b48d4-246b-4d43-99c2-3c7f818f8423"></a>
### Manage Entities
<!-- {"achilles-ide-paragraph":{"id":"paragraph-5bb2e474-f77b-42f9-8b78-2b04a7376767","type":"markdown","title":"Paragraph 1"}} -->
Story Studio exposes focused editing surfaces for the core project entities. Authors can define and refine cast members, locations, objects, world rules, themes, and structural elements through dedicated pages instead of one overloaded editor.


<!-- {"achilles-ide-chapter":{"id":"chapter-7c1bd5e3-0c35-4701-9520-080765d14d4c","title":"Define Relationships","anchorId":"chapter-chapter-7c1bd5e3-0c35-4701-9520-080765d14d4c"}} -->
<a id="chapter-chapter-7c1bd5e3-0c35-4701-9520-080765d14d4c"></a>
### Define Relationships
<!-- {"achilles-ide-paragraph":{"id":"paragraph-6e1f0dd1-32e2-4c8f-be05-83476ec45187","type":"markdown","title":"Paragraph 1"}} -->
Relationship work is handled primarily through the cast and planning surfaces. Authors can define relationship pairs, relationship type, and relationship dynamic, then refine how those relationships influence the project foundation and later drafting.


<!-- {"achilles-ide-chapter":{"id":"chapter-0f38ea3e-46d2-49f2-b56e-9dbdc6152471","title":"Plan Blueprint and Story Map","anchorId":"chapter-chapter-0f38ea3e-46d2-49f2-b56e-9dbdc6152471"}} -->
<a id="chapter-chapter-0f38ea3e-46d2-49f2-b56e-9dbdc6152471"></a>
### Plan Blueprint and Story Map
<!-- {"achilles-ide-paragraph":{"id":"paragraph-82e37b71-521e-4a9e-b94b-97fcabb1e8f7","type":"markdown","title":"Paragraph 1"}} -->
`Blueprint` is the main planning surface for arc selection, beat progression, tension, pacing, and story progression. Story mapping surfaces help connect chapters, scenes, turning points, and structural roles across the project.

Blueprint should influence not only internal planning logic but also how the resulting story becomes readable in the structure tree and other navigation layers.


<!-- {"achilles-ide-chapter":{"id":"chapter-616f539f-3ddf-49ec-950e-064bf46bf6b8","title":"Add World Rules","anchorId":"chapter-chapter-616f539f-3ddf-49ec-950e-064bf46bf6b8"}} -->
<a id="chapter-chapter-616f539f-3ddf-49ec-950e-064bf46bf6b8"></a>
### Add World Rules
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d2000821-e89f-4b3e-9add-bc581f259a04","type":"markdown","title":"Paragraph 1"}} -->
World rules define special logic that governs the narrative world, such as magic systems, technology constraints, physical laws, or social structures. These rules become part of the project foundation and may influence both specification and generation.


<!-- {"achilles-ide-chapter":{"id":"chapter-b9588d2e-b2eb-4b05-8e24-32cb76da79ec","title":"Evaluate Quality","anchorId":"chapter-chapter-b9588d2e-b2eb-4b05-8e24-32cb76da79ec"}} -->
<a id="chapter-chapter-b9588d2e-b2eb-4b05-8e24-32cb76da79ec"></a>
### Evaluate Quality
<!-- {"achilles-ide-paragraph":{"id":"paragraph-8e162146-5c20-4f9c-b9a2-c6a5fa6df9c6","type":"markdown","title":"Paragraph 1"}} -->
Story Studio provides quality review through the `Metrics` surface. The primary product-facing signals are Coverage, Coherence, and NQS, supported by additional diagnostics such as CAD, CAR, CSA, emotional arc, relationship signals, and structure diagnostics.

Evaluation should help the author understand what to improve next rather than acting as a passive score display.


<!-- {"achilles-ide-chapter":{"id":"chapter-7ea5d743-6008-463d-aab1-90dde5fb247a","title":"Export","anchorId":"chapter-chapter-7ea5d743-6008-463d-aab1-90dde5fb247a"}} -->
<a id="chapter-chapter-7ea5d743-6008-463d-aab1-90dde5fb247a"></a>
### Export
<!-- {"achilles-ide-paragraph":{"id":"paragraph-a65aad00-45c3-4dec-83f5-a9506160afc2","type":"markdown","title":"Paragraph 1"}} -->
Story Studio should support export of formal and narrative artifacts such as CNL and story text so authors can archive, reuse, or continue work in other environments.


<!-- {"achilles-ide-chapter":{"id":"chapter-aecd8d4b-e1b6-4a2b-a35d-9d027639e815","title":"Library Apply Workflow","anchorId":"chapter-chapter-aecd8d4b-e1b6-4a2b-a35d-9d027639e815"}} -->
<a id="chapter-chapter-aecd8d4b-e1b6-4a2b-a35d-9d027639e815"></a>
## Library Apply Workflow
<!-- {"achilles-ide-paragraph":{"id":"paragraph-bc42ce84-4f27-4b59-a343-e41faeecf58d","type":"markdown","title":"Paragraph 1"}} -->
The Library workflow may begin inside Story Studio or from the Library entry point itself. The author selects a reusable asset, reviews it, applies it at `Book`, `Chapter`, or `Scene` scope when supported, and continues refinement in the destination page.

Story Studio treats Library application as an acceleration mechanism, not as a locked template system. Once applied, Library content becomes part of the editable project state.


<!-- {"achilles-ide-chapter":{"id":"chapter-cd318078-4178-4b9a-9ed6-6f7226317b6f","title":"Data Flow","anchorId":"chapter-chapter-cd318078-4178-4b9a-9ed6-6f7226317b6f"}} -->
<a id="chapter-chapter-cd318078-4178-4b9a-9ed6-6f7226317b6f"></a>
## Data Flow
<!-- {"achilles-ide-paragraph":{"id":"paragraph-520246ee-a127-44e6-8c1f-a5de7c209ab9","type":"markdown","title":"Paragraph 1"}} -->
```text
User Action -> State Update -> CNL Generation -> Metric Calculation -> UI Refresh
     |
     -> Save -> Server (/v1/projects)
```

Most computation is client-side. The server handles persistence and may support optional processing endpoints in research/demo environments.


<!-- {"achilles-ide-chapter":{"id":"chapter-8d5600e0-e7c6-487e-abf7-861e416ac074","title":"Success Criteria","anchorId":"chapter-chapter-8d5600e0-e7c6-487e-abf7-861e416ac074"}} -->
<a id="chapter-chapter-8d5600e0-e7c6-487e-abf7-861e416ac074"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ca31d51b-555c-4c69-94b3-66bf5fa17f33","type":"markdown","title":"Paragraph 1"}} -->
Story Studio is successful when a new user can create a coherent story foundation quickly, navigate the planning and drafting surfaces without confusion, generate a useful draft from the current specification, understand quality feedback through the metrics workflow, and export usable artifacts without breaking the authoring flow.

