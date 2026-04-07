<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzA3LVVzZS1DYXNlLURlZmluaXRpb24ubWQ=","title":"DS07-Use-Case-Definition","version":1,"updatedAt":"2026-04-07T08:11:32.428Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-8048f0ec-6a76-4057-beea-ba66cca4f653","title":"DS07 — Use Cases and Workflows","anchorId":"chapter-chapter-8048f0ec-6a76-4057-beea-ba66cca4f653"}} -->
<a id="chapter-chapter-8048f0ec-6a76-4057-beea-ba66cca4f653"></a>
# DS07 — Use Cases and Workflows
<!-- {"achilles-ide-paragraph":{"id":"paragraph-fae75d0f-67d7-4423-8640-1d02cfc0afd8","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-b4e2a0b1-49f3-45e6-afe1-c96faaa6e569","title":"Purpose","anchorId":"chapter-chapter-b4e2a0b1-49f3-45e6-afe1-c96faaa6e569"}} -->
<a id="chapter-chapter-b4e2a0b1-49f3-45e6-afe1-c96faaa6e569"></a>
## Purpose
<!-- {"achilles-ide-paragraph":{"id":"paragraph-744ffa3c-9581-4c76-8127-0fed01a83099","type":"markdown","title":"Paragraph 1"}} -->
This document defines the main user-facing workflows and use cases supported by SCRIPTA. Its role is to describe how authors move through the product, what they are trying to achieve at each stage, and what outcomes the system is expected to produce.

SCRIPTA combines guided planning, formal specification, prose generation, revision, and evaluation in one structured authoring environment.


<!-- {"achilles-ide-chapter":{"id":"chapter-8015dcdb-71c1-4620-8060-99ac1a26e0b9","title":"Actors","anchorId":"chapter-chapter-8015dcdb-71c1-4620-8060-99ac1a26e0b9"}} -->
<a id="chapter-chapter-8015dcdb-71c1-4620-8060-99ac1a26e0b9"></a>
## Actors
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e1de43d2-8ae6-4c8f-83fb-ec0224f9df6c","type":"markdown","title":"Paragraph 1"}} -->
The primary human actor is the Author, who defines story direction, reviews structure, generates drafts, and iterates on the result.

The supporting system actor is System Agents - AI, which prepare project state, generate and validate CNL, produce prose drafts, evaluate quality, and support iterative refinement.


<!-- {"achilles-ide-chapter":{"id":"chapter-dbacf837-15de-4c1b-bc94-57800f8c0bbe","title":"Workflow Stages","anchorId":"chapter-chapter-dbacf837-15de-4c1b-bc94-57800f8c0bbe"}} -->
<a id="chapter-chapter-dbacf837-15de-4c1b-bc94-57800f8c0bbe"></a>
### Workflow Stages
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d2c14d6e-fc2c-4463-a1a4-bf33cc617a96","type":"markdown","title":"Paragraph 1"}} -->
`New Project` initializes the project and captures the initial story direction.

`Processing` prepares the internal project foundation and the planning state needed for structural authoring.

`Blueprint` allows the author to shape arcs, beats, pacing, tension, and story progression.

`CNL Editor` exposes the formal story specification for review, editing, validation, import, and export.

`NL Story` generates prose from the project foundation and current specification.

`Manuscript` supports chapter-level and scene-level revision of the generated draft.

`Metrics` evaluates the result and helps the author decide what to improve next.


<!-- {"achilles-ide-chapter":{"id":"chapter-11e60704-6f14-47ff-bd2d-bdb63cdd2a22","title":"Alternative Workflows","anchorId":"chapter-chapter-11e60704-6f14-47ff-bd2d-bdb63cdd2a22"}} -->
<a id="chapter-chapter-11e60704-6f14-47ff-bd2d-bdb63cdd2a22"></a>
## Alternative Workflows
<!-- {"achilles-ide-paragraph":{"id":"paragraph-34af5296-2742-40a7-a356-364dcb040bf8","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-77cb8850-268b-44a6-af0f-68a68434565a","title":"Quick Start","anchorId":"chapter-chapter-77cb8850-268b-44a6-af0f-68a68434565a"}} -->
<a id="chapter-chapter-77cb8850-268b-44a6-af0f-68a68434565a"></a>
### Quick Start
<!-- {"achilles-ide-paragraph":{"id":"paragraph-f824b651-ed45-4c51-a917-3ec2ef788b7f","type":"markdown","title":"Paragraph 1"}} -->
This workflow supports rapid ideation. The author creates a project, moves through the guided structural flow, and generates a draft without spending much time in the full studio.


<!-- {"achilles-ide-chapter":{"id":"chapter-905eba53-c4b9-4b7a-8ab9-2a28932fe0a4","title":"Library-First Apply","anchorId":"chapter-chapter-905eba53-c4b9-4b7a-8ab9-2a28932fe0a4"}} -->
<a id="chapter-chapter-905eba53-c4b9-4b7a-8ab9-2a28932fe0a4"></a>
### Library-First Apply
<!-- {"achilles-ide-paragraph":{"id":"paragraph-528c77bf-d543-4a26-b383-49e523f4e555","type":"markdown","title":"Paragraph 1"}} -->
This workflow begins in Library rather than in project planning. The author selects a reusable asset, applies it at `Book`, `Chapter`, or `Scene` scope when supported, and continues editing in the destination workflow.


<!-- {"achilles-ide-chapter":{"id":"chapter-3c438111-6738-4eb4-b728-f4bf9b59bb73","title":"Reverse Engineering","anchorId":"chapter-chapter-3c438111-6738-4eb4-b728-f4bf9b59bb73"}} -->
<a id="chapter-chapter-3c438111-6738-4eb4-b728-f4bf9b59bb73"></a>
### Reverse Engineering
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ef559431-3081-4fe4-8e80-31414d09a05d","type":"markdown","title":"Paragraph 1"}} -->
This workflow starts from existing text rather than from an empty project. The system extracts usable story elements, and the author continues planning, refinement, and generation from that recovered structure.


<!-- {"achilles-ide-chapter":{"id":"chapter-0898dc50-903c-4dc4-9af5-3e08a80fd85d","title":"Comparison Mode","anchorId":"chapter-chapter-0898dc50-903c-4dc4-9af5-3e08a80fd85d"}} -->
<a id="chapter-chapter-0898dc50-903c-4dc4-9af5-3e08a80fd85d"></a>
### Comparison Mode
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0b6c6abd-1aba-481e-b80a-fbb345fc04e2","type":"markdown","title":"Paragraph 1"}} -->
This workflow supports exploration through alternatives. The author generates or compares multiple variants and selects the preferred direction before continuing revision.


<!-- {"achilles-ide-chapter":{"id":"chapter-d5f39d6e-c8ee-41de-b84a-f060ca582d00","title":"Major Use Cases","anchorId":"chapter-chapter-d5f39d6e-c8ee-41de-b84a-f060ca582d00"}} -->
<a id="chapter-chapter-d5f39d6e-c8ee-41de-b84a-f060ca582d00"></a>
## Major Use Cases
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ccd12d79-6998-451c-92c5-4ff2dc4b2477","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-f46cc76a-df6d-457a-a672-16608725e956","title":"Use Case 1: Story Planning","anchorId":"chapter-chapter-f46cc76a-df6d-457a-a672-16608725e956"}} -->
<a id="chapter-chapter-f46cc76a-df6d-457a-a672-16608725e956"></a>
### Use Case 1: Story Planning
<!-- {"achilles-ide-paragraph":{"id":"paragraph-13f6f3ac-dcfb-4d4c-8191-5c5e244d7498","type":"markdown","title":"Paragraph 1"}} -->
| Field | Value |
|-------|-------|
| Goal | Build a coherent story foundation before prose generation. |
| Primary Actor | Author |
| Supporting Actor | System Agents - AI |
| Inputs | Project idea, initial story direction, constraints, and planning choices. |

**Main Flow**  
1. The author creates a project in the `New Project` wizard.
2. System Agents - AI prepare the internal project foundation.
3. The author reviews and refines the story structure in `Blueprint`.
4. System Agents - AI prepare the formal specification.
5. The author reviews or adjusts the specification in `CNL Editor`.

**Outputs**  
Project foundation, structural plan, and formal CNL specification.

**Outcome**  
The project contains a structured narrative foundation ready for generation.


<!-- {"achilles-ide-chapter":{"id":"chapter-b15a9fc0-7e5f-4f5d-80e7-1269ae6655d7","title":"Use Case 2: Story Generation","anchorId":"chapter-chapter-b15a9fc0-7e5f-4f5d-80e7-1269ae6655d7"}} -->
<a id="chapter-chapter-b15a9fc0-7e5f-4f5d-80e7-1269ae6655d7"></a>
### Use Case 2: Story Generation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e04c969b-f7b5-473b-8279-badf94134891","type":"markdown","title":"Paragraph 1"}} -->
| Field | Value |
|-------|-------|
| Goal | Generate a prose draft from the current story foundation and specification. |
| Primary Actor | Author |
| Supporting Actor | System Agents - AI |
| Inputs | Project foundation, current CNL specification, and selected generation strategy. |

**Main Flow**  
1. The author completes structural review.
2. The author opens `NL Story`.
3. The author selects a generation strategy.
4. System Agents - AI read the current project foundation and specification.
5. System Agents - AI generate a prose draft.
6. The author reviews the result and decides whether to continue, improve, or regenerate.

**Outputs**  
Generated prose draft aligned with the current narrative plan.

**Outcome**  
The project contains a first draft that can be reviewed and refined.


<!-- {"achilles-ide-chapter":{"id":"chapter-14c07aca-73ac-4bca-8d5b-0c246933cce3","title":"Use Case 3: Story Refinement and Evaluation","anchorId":"chapter-chapter-14c07aca-73ac-4bca-8d5b-0c246933cce3"}} -->
<a id="chapter-chapter-14c07aca-73ac-4bca-8d5b-0c246933cce3"></a>
### Use Case 3: Story Refinement and Evaluation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d039eee7-c731-42dd-8219-c300cf9dde74","type":"markdown","title":"Paragraph 1"}} -->
| Field | Value |
|-------|-------|
| Goal | Improve the story through editing, formal review, and metric-guided iteration. |
| Primary Actor | Author |
| Supporting Actor | System Agents - AI |
| Inputs | Current draft, current specification, and evaluation signals. |

**Main Flow**  
1. The author reviews or adjusts the specification.
2. The author edits content in `Manuscript`.
3. The author runs evaluation.
4. System Agents - AI report quality and coherence signals.
5. The author identifies weak areas and revises the story.
6. The author returns to planning, specification, or manuscript editing as needed.
7. The author exports final assets when satisfied.

**Outputs**  
Revised draft, updated specification, evaluation results, and exportable assets.

**Outcome**  
The story becomes more coherent, complete, and production-ready.


<!-- {"achilles-ide-chapter":{"id":"chapter-4b72c262-e742-48e0-8347-61c31f413298","title":"Outputs and Outcomes","anchorId":"chapter-chapter-4b72c262-e742-48e0-8347-61c31f413298"}} -->
<a id="chapter-chapter-4b72c262-e742-48e0-8347-61c31f413298"></a>
## Outputs and Outcomes
<!-- {"achilles-ide-paragraph":{"id":"paragraph-2624b5b5-cfea-46b7-a123-755fd1274e1f","type":"markdown","title":"Paragraph 1"}} -->
The workflow is successful when it produces a usable story foundation, a formal specification that can support generation, a prose draft aligned with the intended narrative direction, and a revision path supported by evaluation signals.

The expected product outcomes are:
- authors can move from idea to structured story plan
- authors can generate a draft from the current specification
- authors can improve drafts through editing and evaluation
- projects remain exportable and reusable across iteration cycles

