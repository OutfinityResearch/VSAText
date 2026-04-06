# DS01 — SCRIPTA Vision

## What is SCRIPTA?

SCRIPTA (Structured Creative Writing Intelligent Platform for Textual Authoring) is a guided story development environment that helps authors move from project setup to formal specification, prose generation, and manuscript refinement.

SCRIPTA starts from the `New Project` wizard and guides authors through project foundation, structural planning in `Blueprint`, formal review in `CNL Editor`, prose generation in `NL Story`, and editorial refinement in `Manuscript`.

The platform is built around a dual representation: a visual, guided authoring experience for planning narrative intent, and a formal Controlled Natural Language (CNL) specification that the system can parse, validate, export, evaluate, and use for prose generation.

The result is not only a story draft, but a reusable narrative specification that supports iteration, evaluation, export, and downstream tooling.

## The Core Idea

Authors build the hierarchical structure of a story in a guided environment where chapters, scenes, beats, characters, world elements, and thematic direction are shaped across focused planning surfaces rather than inside one generic editor.

SCRIPTA combines five layers of work. The first layer is project foundation, where the author starts in `New Project` and defines the initial concept, title, length, genre intent, and seed ideas. The second layer is narrative planning, led by `Blueprint`, where the author defines structure, conflict, pacing, beats, cast, world, and thematic direction. The third layer is formal specification, where the resulting structure is reviewed and refined in `CNL Editor`. The fourth layer is draft generation in `NL Story`. The fifth layer is editorial refinement in `Manuscript`.

## Product Workflow

SCRIPTA supports two authoring paths after a project is created in the `New Project` wizard.

### Recommended Full Workflow

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story -> Manuscript -> Metrics`

This is the full guided workflow. It is intended for authors who want stronger structural control, iterative refinement, and explicit quality feedback.

The workflow begins in `New Project`, where the project container and initial story premise are created. `Processing` prepares the internal project foundation and the planning state. `Blueprint` translates intent into narrative structure. `CNL Editor` exposes the formal specification for review and validation. `NL Story` generates prose from the current foundation and specification. `Manuscript` supports chapter-level and scene-level revision. `Metrics` evaluates quality and helps authors decide what to improve next.

### Accelerated Workflow

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story`

This shorter workflow supports rapid draft generation. It is useful when the author wants to validate a story direction quickly before investing in deeper review and revision.

The accelerated workflow does not replace the full planning flow. It shortens the distance to prose generation, but authors can still return to `Blueprint`, `CNL Editor`, `Manuscript`, and `Metrics` when they want stronger control and higher quality.

## New Project and Story Planning

The planning workflow is distributed across focused pages rather than one overloaded editor.

### New Project

`New Project` is the guided entry point for story creation. It captures the initial premise, strategy, length, language, model, and seed ideas, then opens the processing and planning flow.

### Foundation Inputs

The foundation workflow organizes the main story inputs. `Story Core` defines the central theme, wisdom, story fundamentals, and character transformation. `Narrative Design` defines core conflict, macro structure, escalation logic, and narrative constraints. `Cast` defines protagonist, antagonist, secondary characters, relationship types, and relationship dynamics. `World` defines locations, objects, world rules, and world layers. `Tone & Style` defines stylistic direction for generated and edited prose.

### Blueprint

`Blueprint` is the main planning surface after project creation. It allows authors to shape arcs, beats, tension, pacing, hooks, and progression across the story.

### CNL Editor

`CNL Editor` turns the current project state into a formal narrative specification. It exposes the structure produced by the planning workflow in a machine-readable and exportable form.

## Library System

SCRIPTA includes a Library system with reusable narrative assets that can support planning and drafting workflows. These assets may be applied at `Book`, `Chapter`, or `Scene` scope depending on category and use case.

The Library supports structured reuse without replacing project-level control. Once applied, Library content becomes part of the editable project state. The Library system and reusable asset model are defined separately from the workflow itself.

## CNL as a Narrative Programming Layer

Think of CNL as the formal source code of the story.

The visual workflow produces CNL automatically from the project state, especially from `Blueprint`. The CNL specification then supports iterative updates, parser validation, export and interchange, metrics and verification, and NL Story generation.

This gives SCRIPTA a programming-like workflow for narrative design:

| Programming Concept | SCRIPTA Equivalent |
|---------------------|--------------------|
| Source code | CNL specification |
| IDE | Guided editor workflow |
| Parser | CNL parser |
| AST | Interpreted story model |
| Build validation | Constraint and structure validation |
| Reusable functions | Reusable patterns and templates |
| Runtime feedback | Metrics, warnings, and evaluation |

## Quality Metrics

The current application focuses on practical story-quality metrics that reflect both the specification and the generated draft.

| Metric | What it measures | Recommended target |
|--------|------------------|--------------------|
| Coherence | Internal consistency of entities, references, structure, and prose logic | `>= 0.75` |
| Coverage | How completely the draft uses the planned story elements from the specification | `>= 0.80` |
| NQS | Composite narrative quality score used to summarize overall story performance | `>= 0.75` for good drafts, `>= 0.85` for strong drafts |
| Optional supporting metrics | Additional measures such as emotional arc coverage, relationship coverage, or structure completeness | Context-dependent |

Coherence checks whether the story holds together across references, structure, and causal flow. Coverage checks whether important planned elements actually appear in the story. NQS summarizes overall performance and helps compare drafts and generation strategies.

## Generation Strategies

SCRIPTA supports multiple generation strategies depending on speed, availability, and quality goals.

| Strategy | Typical latency | Typical NQS | Best use |
|----------|-----------------|-------------|----------|
| Random | Instant | `65-80%` | Rapid ideation and quick prototypes |
| LLM | `10-30s` | `75-90%` | Richer and more nuanced drafts |
| Advanced | `5-15s` | `80-95%` | Stronger structural optimization and metric performance |

These strategies support both careful planning and fast structural iteration without requiring manual CNL authoring.

## Technology

SCRIPTA uses a lightweight architecture designed for portability and maintainability. The user interface is browser-based and built with HTML, CSS, and vanilla JavaScript modules. The platform uses a minimal Node.js backend for persistence and project operations. Project data is stored as JSON. Core CNL parsing, evaluation, and generation logic live in the SDK and are designed to remain portable across browser and Node.js environments.

## Core Documentation

The core documentation set that supports the product includes the conceptual model and glossary, the CNL language reference, the new project flow, the guided story workflows, the library system, the generation strategies, and the architecture overview.

These documents ensure that the product vision, user-facing workflow, and technical structure remain aligned.

## Success Criteria

SCRIPTA succeeds when authors can build a strong story foundation quickly, generate drafts from formal specification without writing CNL manually, improve results through guided refinement and evaluation, and reuse narrative assets across projects without losing control over the final story.
