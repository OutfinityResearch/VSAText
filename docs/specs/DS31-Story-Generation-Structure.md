<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzMxLUFyYy1TdHJ1Y3R1cmVkLUdlbmVyYXRlZC1TdG9yeS5tZA==","title":"DS31-Arc-Structured-Generated-Story","version":1,"updatedAt":"2026-04-08T11:19:40.548Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-arc-structured-story","title":"DS31 — Story Generation Structure","anchorId":"chapter-ds31-arc-structured-story"}} -->
<a id="chapter-ds31-arc-structured-story"></a>
# DS31 — Story Generation Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-a0c334be-078f-4617-9628-f351dfe2e1c5","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-overview","title":"Overview","anchorId":"chapter-ds31-overview"}} -->
<a id="chapter-ds31-overview"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-f0560edf-66cf-47e7-98b8-236614a284ab","type":"markdown","title":"Paragraph 1"}} -->
This document defines how SCRIPTA should organize and display the generated story according to the narrative arc selected in `Blueprint`.

At the moment, generated story output can still appear as a generic sequence of chapters and scenes. That is structurally valid, but it underuses one of the strongest planning assets already present in the product: the selected arc and its beat logic. If the product already knows the narrative arc, the generated story should not be presented as if that arc does not exist.

The purpose of this document is to make the selected arc the primary organizational rule for the generated story view. The story should be grouped into arc-aware narrative sections rather than shown only as a flat manuscript outline.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-product-role","title":"Product Role","anchorId":"chapter-ds31-product-role"}} -->
<a id="chapter-ds31-product-role"></a>
## Product Role
<!-- {"achilles-ide-paragraph":{"id":"paragraph-580fa823-98da-4731-b724-2ee58c2f9167","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA already allows the author to choose a narrative arc in `Blueprint`, define or inspect beat mappings, and generate story structure and prose from that planning model. The missing link is presentation: the generated story should visibly reflect the arc that guided its creation.

The intended relationship is:

`Blueprint Arc -> Beat Mappings -> Generated Structure -> Arc-Aware Story Presentation`

This matters because the generated story should be readable not only as text, but as narrative progression. The author should be able to open the story and immediately understand where the setup lives, where escalation begins, where the central turn happens, and how the story resolves.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-rationale","title":"Rationale","anchorId":"chapter-ds31-rationale"}} -->
<a id="chapter-ds31-rationale"></a>
## Rationale
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d0adab50-d43f-42db-b5a5-53dedbcc2212","type":"markdown","title":"Paragraph 1"}} -->
A generic chapter list is useful as a manuscript container, but it is not the strongest editorial view for a story that was generated from an explicit structural model. If the selected arc is already shaping the beat sequence, then the generated story should surface that logic directly.

This improves several things at once:

- readability of the generated story as a progression instead of a flat list
- alignment between `Blueprint` and `Manuscript`
- easier navigation for authors who want to revise one narrative phase at a time
- stronger confidence that the generated story actually follows the selected arc

This is not decorative relabeling. It is a structural presentation rule.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-core-rule","title":"Core Rule","anchorId":"chapter-ds31-core-rule"}} -->
<a id="chapter-ds31-core-rule"></a>
## Core Rule
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4c348127-1d37-42c7-bdf9-e8bd485ea359","type":"markdown","title":"Paragraph 1"}} -->
The narrative arc selected in `Blueprint` becomes the primary grouping rule for the generated story.

The generated story should not be presented only as:

```text
Chapter 1
Chapter 2
Chapter 3
```

Instead, it should be presented as:

```text
Arc Phase
  -> Chapter
    -> Scene
```

or, where chapter grouping is shallow or unnecessary:

```text
Arc Phase
  -> Scene
```

The exact visual depth may vary by workspace, but the first visible grouping principle should be the arc phase, not the raw chapter index.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-source-of-truth","title":"Source of Truth","anchorId":"chapter-ds31-source-of-truth"}} -->
<a id="chapter-ds31-source-of-truth"></a>
## Source of Truth
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2ea07138-aba9-4374-a89b-d19891930864","type":"markdown","title":"Paragraph 1"}} -->
The arc-aware grouping must be derived from data the project already owns. The source of truth is:

- `project.selectedArc` or `project.blueprint.arc`
- `project.blueprint.beatMappings`
- scene and chapter identifiers already present in generated structure or manuscript state

The story view should not invent a separate phase model disconnected from `Blueprint`. If a scene is mapped to a beat, and that beat belongs to an arc phase, then the scene belongs to that phase in the generated story presentation.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-grouping-model","title":"Grouping Model","anchorId":"chapter-ds31-grouping-model"}} -->
<a id="chapter-ds31-grouping-model"></a>
## Grouping Model
<!-- {"achilles-ide-paragraph":{"id":"paragraph-57acbec2-bbff-4770-8439-0c9292b6358e","type":"markdown","title":"Paragraph 1"}} -->
The grouping model should be deterministic and arc-aware.

Each supported narrative arc defines a sequence of phases. Examples:

- `Hero's Journey`: `Ordinary World`, `Call to Adventure`, `Tests`, `Ordeal`, `Return`
- `Three Act Structure`: `Setup`, `Rising Action`, `Climax`, `Falling Action`, `Resolution`
- `Kishotenketsu`: `Ki`, `Sho`, `Ten`, `Ketsu`
- `Seven Point Structure`: the corresponding seven structural turns of that model

Each beat in the selected arc belongs to one phase. Each scene mapped to that beat therefore inherits the phase of that beat.

The generated story view should then group all mapped scenes by phase, while preserving chapter and scene order inside each phase.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-display-structure","title":"Display Structure","anchorId":"chapter-ds31-display-structure"}} -->
<a id="chapter-ds31-display-structure"></a>
## Display Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-10f44d66-b6d4-439a-8618-935a74eac2b6","type":"markdown","title":"Paragraph 1"}} -->
The recommended display model is:

```text
Narrative Arc
  Phase A
    Chapter 1
      Scene 1
      Scene 2
  Phase B
    Chapter 2
      Scene 3
```

This should preserve the readability of chapters while making phase progression explicit.

When multiple chapters contribute scenes to the same phase, the phase group should contain those chapters in their original narrative order. The system should not reorder scenes arbitrarily just to flatten the grouping.

The story should therefore remain both:

- arc-readable
- manuscript-readable


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-unmapped","title":"Unmapped Scenes","anchorId":"chapter-ds31-unmapped"}} -->
<a id="chapter-ds31-unmapped"></a>
## Unmapped Scenes
<!-- {"achilles-ide-paragraph":{"id":"paragraph-1c173542-2a3c-47a5-81ea-311418761306","type":"markdown","title":"Paragraph 1"}} -->
Not every generated or manually edited scene may have a valid beat mapping at all times. The system therefore needs a stable fallback strategy.

If a scene has no beat mapping, it should be placed into an explicit fallback group such as:

- `Unmapped`
- `Unassigned`
- `Needs Beat Mapping`

The product should not silently hide such scenes. Unmapped scenes are structurally important because they indicate either incomplete planning or drift between structure and blueprint.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-workspace-impact","title":"Workspace Impact","anchorId":"chapter-ds31-workspace-impact"}} -->
<a id="chapter-ds31-workspace-impact"></a>
## Workspace Impact
<!-- {"achilles-ide-paragraph":{"id":"paragraph-83303b04-1181-45bd-abb1-27bde98fb159","type":"markdown","title":"Paragraph 1"}} -->
This feature affects presentation in at least three places:

1. `Manuscript`
The generated story should be grouped by arc phase instead of only by chapter sequence.

2. `Story Map`
The story map should use the same phase grouping language so that navigation remains consistent.

3. `Structure / Navigator`
Where appropriate, the structure view should expose the same arc-aware grouping or at least allow the user to understand how chapters and scenes map to the selected arc.

The internal structural model does not need to stop being `Book -> Chapter -> Scene`. The arc-aware rule is primarily a presentation and navigation layer built on top of the existing model.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-data-shape","title":"Data Shape","anchorId":"chapter-ds31-data-shape"}} -->
<a id="chapter-ds31-data-shape"></a>
## Data Shape
<!-- {"achilles-ide-paragraph":{"id":"paragraph-cd727d47-5bc2-4ddb-a95c-524a1189eadb","type":"markdown","title":"Paragraph 1"}} -->
The implementation should keep the base project structure stable and derive an arc-aware view model from it.

A suitable derived shape is:

```javascript
{
  arc: 'hero_journey',
  phases: [
    {
      key: 'ordinary-world',
      label: 'Ordinary World',
      chapters: [
        {
          id: 'ch_1',
          title: 'Chapter 1',
          scenes: [
            { id: 'sc_1', title: 'Scene 1', beatKey: 'ordinary_world' }
          ]
        }
      ]
    }
  ],
  unmapped: []
}
```

This shape should be derived, not persisted as a second authoritative project structure.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-behavior-on-arc-change","title":"Behavior on Arc Change","anchorId":"chapter-ds31-behavior-on-arc-change"}} -->
<a id="chapter-ds31-behavior-on-arc-change"></a>
## Behavior on Arc Change
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e4e6fa1c-a0ec-4314-b4bb-1277f2a50f43","type":"markdown","title":"Paragraph 1"}} -->
If the author changes the selected arc in `Blueprint`, the generated story presentation should be recalculated from the new arc definition and the current beat mappings.

This does not necessarily mean that prose, chapter text, or scene text must be regenerated immediately. It means the grouping view must be recomputed using the new arc logic.

If the new arc invalidates previous mappings, the product should preserve visibility of the problem rather than faking coherence. Scenes that can no longer be mapped should move into the fallback `Unmapped` group until the user repairs the mapping.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-ux-intent","title":"UX Intent","anchorId":"chapter-ds31-ux-intent"}} -->
<a id="chapter-ds31-ux-intent"></a>
## UX Intent
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0afc41ab-fdef-4ca0-8b4b-4c34e8392864","type":"markdown","title":"Paragraph 1"}} -->
The arc-aware generated story should feel like a narrative document, not a raw file browser. The author should be able to scan the story by dramatic movement rather than by technical storage order.

This means the grouping labels must feel editorially meaningful. The visual treatment should make it obvious that the current section is a phase of the arc, not just another arbitrary heading. The UI should help the user answer questions such as:

- Where does the story leave setup and enter escalation?
- Which scenes belong to the central confrontation?
- Where is the resolution cluster?
- Which scenes are not structurally mapped yet?


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-validation","title":"Validation","anchorId":"chapter-ds31-validation"}} -->
<a id="chapter-ds31-validation"></a>
## Validation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-4e2434bf-b83f-472c-8947-08c109fdef40","type":"markdown","title":"Paragraph 1"}} -->
The grouping engine should satisfy the following rules:

- every mapped scene appears in exactly one arc phase
- chapter and scene order remain stable inside a phase
- no scene is silently dropped
- unmapped scenes remain visible
- grouping is derived from `Blueprint` rather than duplicated manually

This feature should also make structural problems easier to see. If a beat mapping points to a scene that no longer exists, or if scenes exist without beat coverage, the arc-aware view should expose that mismatch clearly.


<!-- {"achilles-ide-chapter":{"id":"chapter-ds31-success","title":"Success Criteria","anchorId":"chapter-ds31-success"}} -->
<a id="chapter-ds31-success"></a>
## Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-1666321a-4d70-4594-91ea-b692d2da2e2c","type":"markdown","title":"Paragraph 1"}} -->
This feature succeeds when the generated story is no longer perceived as a generic chapter list, when the selected arc becomes visibly legible in the story presentation, and when authors can navigate the generated story by narrative phase rather than by raw structure alone.

It also succeeds when the feature preserves architectural clarity: one stable base structure, one derived arc-aware presentation model, and one consistent narrative language shared across `Blueprint`, `Manuscript`, and `Story Map`.

