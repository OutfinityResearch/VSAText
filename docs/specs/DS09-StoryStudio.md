# DS09 — Story Studio Interface

## Overview

Story Studio is SCRIPTA's visual interface for planning, drafting, refinement, and evaluation. This document describes the high-level UI concepts and the way authors move through the studio once a project has been created.

Story Studio is the working environment where the author and System Agents - AI collaborate across structure, specification, prose generation, manuscript refinement, and metrics.

## Design Philosophy

Story Studio is based on three principles. The first is visual-first authoring, where authors work through guided planning surfaces rather than writing raw formal language. The second is guided feedback, where planning, generation, and evaluation are explicit steps in the workflow. The third is browser-first execution, where most processing happens client-side and the server primarily handles persistence and optional research/demo processing.

## Main Layout

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

## Core Workflows

### Start New Story

The standard workflow starts in the `New Project` wizard, where the author defines the initial project direction. After the project is created, Story Studio becomes the main working environment for planning, specification review, prose generation, and revision.

The author then continues through `Processing`, `Blueprint`, `CNL Editor`, and `NL Story`. When a draft exists, the author can continue editing in `Manuscript` and review quality signals in `Metrics`.

### Build Story Foundation

Story Studio exposes the editorial planning layers needed to build a coherent story foundation. `Story Core` supports theme, wisdom, story fundamentals, and character transformation. `Narrative Design` supports conflict, macro structure, escalation logic, and constraints. `Cast` supports protagonist, antagonist, secondary characters, and relationship logic. `World` supports locations, objects, world rules, and world layers. `Tone & Style` supports language direction for generation and revision.

### Build Story Structure

The structure view helps authors move from macro planning to editable narrative units. Authors work with chapters, scenes, references, moods, blocks, and actions through a hierarchy that supports both planning and later manuscript work.

When a narrative arc has been selected in `Blueprint`, the structure tree should reflect the progression of that arc rather than remaining only a flat list of scenes. This helps the navigation layer communicate story progression directly.

### Manage Entities

Story Studio exposes focused editing surfaces for the core project entities. Authors can define and refine cast members, locations, objects, world rules, themes, and structural elements through dedicated pages instead of one overloaded editor.

### Define Relationships

Relationship work is handled primarily through the cast and planning surfaces. Authors can define relationship pairs, relationship type, and relationship dynamic, then refine how those relationships influence the project foundation and later drafting.

### Plan Blueprint and Story Map

`Blueprint` is the main planning surface for arc selection, beat progression, tension, pacing, and story progression. Story mapping surfaces help connect chapters, scenes, turning points, and structural roles across the project.

Blueprint should influence not only internal planning logic but also how the resulting story becomes readable in the structure tree and other navigation layers.

### Add World Rules

World rules define special logic that governs the narrative world, such as magic systems, technology constraints, physical laws, or social structures. These rules become part of the project foundation and may influence both specification and generation.

### Evaluate Quality

Story Studio provides quality review through the `Metrics` surface. The primary product-facing signals are Coverage, Coherence, and NQS, supported by additional diagnostics such as CAD, CAR, CSA, emotional arc, relationship signals, and structure diagnostics.

Evaluation should help the author understand what to improve next rather than acting as a passive score display.

### Export

Story Studio should support export of formal and narrative artifacts such as CNL and story text so authors can archive, reuse, or continue work in other environments.

## Library Apply Workflow

The Library workflow may begin inside Story Studio or from the Library entry point itself. The author selects a reusable asset, reviews it, applies it at `Book`, `Chapter`, or `Scene` scope when supported, and continues refinement in the destination page.

Story Studio treats Library application as an acceleration mechanism, not as a locked template system. Once applied, Library content becomes part of the editable project state.

## Data Flow

```text
User Action -> State Update -> CNL Generation -> Metric Calculation -> UI Refresh
     |
     -> Save -> Server (/v1/projects)
```

Most computation is client-side. The server handles persistence and may support optional processing endpoints in research/demo environments.

## Success Criteria

Story Studio is successful when a new user can create a coherent story foundation quickly, navigate the planning and drafting surfaces without confusion, generate a useful draft from the current specification, understand quality feedback through the metrics workflow, and export usable artifacts without breaking the authoring flow.
