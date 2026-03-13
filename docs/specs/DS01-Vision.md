# DS01 — SCRIPTA Vision

## What is SCRIPTA?

SCRIPTA (Structured Creative Writing Intelligent Platform for Textual Authoring) is a guided story development environment that helps authors move from project setup to formal specification, prose generation, and manuscript refinement.

SCRIPTA starts from a project and guides authors through Book Settings, Story Core, Narrative Design, Blueprint, Story Map, CNL Editor, NL Story, and Manuscript.

The platform is built around a dual representation:

- a visual, guided authoring experience for planning narrative intent
- a formal Controlled Natural Language (CNL) specification that the system can parse, validate, export, evaluate, and use for prose generation

The result is not only a story draft, but a reusable narrative specification that can support iteration, metrics, exports, and downstream tooling.

## The Core Idea

Authors build the hierarchical structure of a story in a guided, tree-oriented environment: chapters, scenes, beats, and narrative roles are shaped across dedicated planning steps rather than inside one generic editor.

They define characters, cast, world logic, themes, tone, and style; apply reusable templates and patterns from the Library; and iterate through the formal CNL specification to generate prose, review metrics, and refine the manuscript.

In practice, SCRIPTA combines five layers of work:

1. **Project foundation** - Start from `New Project` and capture the initial concept, title, length, genre intent, and seed ideas.
2. **Narrative planning** - Use `Book Settings`, `Story Core`, `Narrative Design`, `Blueprint`, and `Story Map` to define structure, conflict, cast, world, and thematic direction.
3. **Formal specification** - Review and edit the resulting specification in `CNL Editor`.
4. **Draft generation** - Produce narrative prose in `NL Story`.
5. **Editorial refinement** - Continue chapter and scene work in `Manuscript`.

## Product Workflow

SCRIPTA supports two authoring paths after a project is created in `New Project (Project Wizard)`.

### 1. Recommended full planning flow

`New Project (Project Wizard) -> Book Settings -> Story Core -> Narrative Design -> Blueprint -> Story Map -> CNL Editor -> NL Story -> Manuscript -> Metrics`

This flow works as follows:

1. **New Project (Project Wizard)** creates the project container and captures the initial story premise.
2. **Book Settings** establishes the editorial foundation of the book: cast, world, themes, tone, and style.
3. **Story Core** sharpens the central thematic idea, wisdom, and character transformation.
4. **Narrative Design** defines the main conflict, macro structure, escalation, and narrative constraints.
5. **Blueprint** turns intent into narrative architecture: arcs, beats, pacing, tension, and progression.
6. **Story Map** distributes the story into chapters and scenes and clarifies flow across the book.
7. **CNL Editor** exposes the formal specification that the system can parse, validate, and export.
8. **NL Story** generates the narrative draft from the specification and project foundation.
9. **Manuscript** becomes the working space for editorial refinement of chapters and scenes.
10. **Metrics** evaluate the specification and generated story for coherence, coverage, and narrative quality.

### 2. Shortcut for rapid generation

`New Project (Project Wizard) -> NL Story`

Authors can use the `Create Story` shortcut in `Story Core` to generate `NL Story` directly from the project foundation when they want a fast draft before completing the full planning flow.

This shortcut is useful for:

- quick ideation
- exploratory drafts
- validating whether the current foundation is strong enough to generate prose

The shortcut does not replace the full planning flow. It accelerates draft creation, but authors still return to planning, CNL refinement, and manuscript editing when they want better control and higher quality.

## Book Settings and Story Planning

The planning workflow is distributed across focused pages rather than one overloaded editor.

### Book Settings

`Book Settings` collects and organizes the main story inputs:

- **Story Core** - central theme, wisdom, story fundamentals, and character transformation
- **Narrative Design** - core conflict, macro structure, conflict escalation, and narrative constraints
- **Cast** - protagonist, antagonist, secondary characters, relationship types, and relationship dynamics
- **World** - locations, objects and artifacts, world rules, and world layers
- **Tone & Style** - stylistic direction for generated and edited prose

### Blueprint

`Blueprint` translates story intent into structural planning. It is where authors shape:

- narrative arcs
- beats
- turning logic
- tension
- pacing
- progression across the book

### Story Map

`Story Map` turns the structural plan into chapter and scene flow. It is the bridge between abstract planning and concrete story navigation.

## Entity Libraries

SCRIPTA includes reusable libraries that can be applied to the book, chapter, or scene level depending on category.

- **Characters** - reusable character templates with archetypes, traits, and relationship potential
- **Cast** - project-specific instantiated roles such as protagonist, antagonist, and secondary characters
- **World** - locations, world rules, and setting logic that define where the story happens and how the world behaves
- **Themes** - reusable thematic directions that can prefill ideological conflict, moral questions, transformation logic, and wisdom
- **Tone & Style** - tonal guidance and stylistic direction for prose generation
- **Patterns** - reusable narrative templates, plot motifs, and structural fragments
- **Objects (Props)** - meaningful items, artifacts, symbolic objects, and plot-relevant resources

The library system is bidirectional:

- authors can open Library from an editor page and apply a template
- authors can browse Library directly and choose where to apply an item: `Book`, `Chapter`, or `Scene`, depending on category

## CNL as a Narrative Programming Layer

Think of CNL as the formal source code of the story.

The visual workflow produces CNL automatically. The CNL specification then supports:

- iterative updates as planning changes
- parser validation
- export and interchange
- metrics and verification
- NL Story generation

The CNL specification supports iterative updates, validation, export, and powers NL Story generation.

This gives SCRIPTA a programming-like workflow for narrative design:

| Programming Concept | SCRIPTA Equivalent |
|---------------------|--------------------|
| Source code | CNL specification |
| IDE | Guided editor workflow |
| Parser | CNL parser |
| AST | Interpreted story model |
| Build validation | Constraint and structure validation |
| Reusable functions | Patterns and templates |
| Runtime feedback | Metrics, warnings, and evaluation |

## Quality Metrics

The current application focuses on practical story-quality metrics that reflect both the specification and the generated draft.

| Metric | What it measures | Recommended target |
|--------|------------------|--------------------|
| Coherence | Internal consistency of entities, references, structure, and prose logic | `>= 0.75` |
| Coverage | How completely the draft uses the planned story elements from the specification | `>= 0.80` |
| NQS | Composite narrative quality score used to summarize overall story performance | `>= 0.75` for good drafts, `>= 0.85` for strong drafts |
| Optional supporting metrics | Additional measures such as emotional arc coverage, relationship coverage, or structure completeness | Context-dependent |

### Metric Notes

- **Coherence** checks whether the story holds together: character references, entity reuse, structural continuity, and causal flow.
- **Coverage** checks whether important planned elements actually appear in the story.
- **NQS** is the main summary score used to compare drafts and generation strategies.
- **Supporting metrics** can be used in deeper evaluation passes, but Coherence, Coverage, and NQS are the primary product-facing measures.

## Generation Strategies

SCRIPTA supports multiple generation strategies depending on speed, availability, and quality goals.

| Strategy | Typical latency | Typical NQS | Best use |
|----------|-----------------|-------------|----------|
| Random | Instant | `65-80%` | Rapid ideation, fast prototypes, broad exploration |
| LLM | `10-30s` | `75-90%` | More creative and nuanced drafts |
| Advanced | `5-15s` | `80-95%` | Optimized output with stronger structural quality |

### Strategy Guidance

- **Random** is best when the author wants immediate output and many quick variations.
- **LLM** is best when the author wants richer prose and more nuanced interpretation of the foundation.
- **Advanced** is best when the author wants stronger metric performance and better structural optimization.

The `Create Story` shortcut in `Story Core` is designed to support these generation modes without forcing the author through every planning page first.

## Technology

SCRIPTA uses a lightweight architecture designed for portability and maintainability:

- browser-based UI built with HTML, CSS, and vanilla JavaScript modules
- a minimal Node.js backend for persistence and project operations
- JSON-based project storage
- portable CNL parsing, evaluation, and generation logic in the SDK
- support for CNL generation, CNL export, and NL Story export

The system uses a minimal Node.js backend for persistence, JSON storage, and supports CNL and NL Story generation and export.

## Core Documentation

The core documentation set that supports the product includes:

- **Conceptual Model & Glossary** - mental model, terminology, and page relationships
- **CNL Language Reference** - syntax, semantics, and usage examples
- **End-to-End Example** - complete walkthrough from setup to prose
- **Metrics Overview** - interpretation of story quality signals
- **Generation Strategies** - Random, LLM, and Advanced generation modes
- **CNL Editor Guide** - how the formal specification is reviewed and edited in the product

These documents ensure that the product workflow, the user-facing documentation, and the technical specifications remain aligned.

## Success Criteria

SCRIPTA succeeds when:

1. Authors can build a solid story foundation in under 30 minutes.
2. New users become productively oriented within 1 hour.
3. Generated CNL parses successfully in all valid project exports.
4. Patterns and templates are reusable and shareable across projects.
5. CNL export and Markdown export work reliably.
6. NL Story generation is functional and useful for first-draft creation.
7. The workflow from planning to specification to prose is understandable without requiring manual CNL authoring.
