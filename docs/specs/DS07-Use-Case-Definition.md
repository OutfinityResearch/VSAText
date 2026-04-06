# DS07 — Use Cases and Workflows

## Purpose

This document defines the main user-facing workflows and use cases supported by SCRIPTA. Its role is to describe how authors move through the product, what they are trying to achieve at each stage, and what outcomes the system is expected to produce.

SCRIPTA combines guided planning, formal specification, prose generation, revision, and evaluation in one structured authoring environment.

## Actors

The primary human actor is the Author, who defines story direction, reviews structure, generates drafts, and iterates on the result.

The supporting system actor is System Agents - AI, which prepare project state, generate and validate CNL, produce prose drafts, evaluate quality, and support iterative refinement.

## Primary Workflows

SCRIPTA supports two main product workflows.

### Recommended Workflow

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story -> Manuscript -> Metrics`

This is the full guided workflow. It is intended for authors who want stronger structural control, iterative refinement, and quality feedback across the whole story lifecycle.

### Accelerated Workflow

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story`

This is a shorter path intended for faster draft generation. It is useful when the author wants to validate an idea quickly before investing in deeper editing and review.

### Workflow Stages

`New Project` initializes the project and captures the initial story direction.

`Processing` prepares the internal project foundation and the planning state needed for structural authoring.

`Blueprint` allows the author to shape arcs, beats, pacing, tension, and story progression.

`CNL Editor` exposes the formal story specification for review, editing, validation, import, and export.

`NL Story` generates prose from the project foundation and current specification.

`Manuscript` supports chapter-level and scene-level revision of the generated draft.

`Metrics` evaluates the result and helps the author decide what to improve next.

## Alternative Workflows

### Quick Start

This workflow supports rapid ideation. The author creates a project, moves through the guided structural flow, and generates a draft without spending much time in the full studio.

### Library-First Apply

This workflow begins in Library rather than in project planning. The author selects a reusable asset, applies it at `Book`, `Chapter`, or `Scene` scope when supported, and continues editing in the destination workflow.

### Reverse Engineering

This workflow starts from existing text rather than from an empty project. The system extracts usable story elements, and the author continues planning, refinement, and generation from that recovered structure.

### Comparison Mode

This workflow supports exploration through alternatives. The author generates or compares multiple variants and selects the preferred direction before continuing revision.

## Major Use Cases

### Use Case 1: Story Planning

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

### Use Case 2: Story Generation

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

### Use Case 3: Story Refinement and Evaluation

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

## Outputs and Outcomes

The workflow is successful when it produces a usable story foundation, a formal specification that can support generation, a prose draft aligned with the intended narrative direction, and a revision path supported by evaluation signals.

The expected product outcomes are:
- authors can move from idea to structured story plan
- authors can generate a draft from the current specification
- authors can improve drafts through editing and evaluation
- projects remain exportable and reusable across iteration cycles
