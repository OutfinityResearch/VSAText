# DS06 — New Project

## Overview

`New Project` is the product entry point for starting a new story in SCRIPTA. It is not only a utility for creating an empty container. It is the moment when the application captures initial author intent, initializes the project foundation, and places the user on the correct path toward story creation.

This document defines what `New Project` is supposed to do, what kind of information it collects, and how it should guide the user into the rest of the workflow.

## Product Role

The purpose of `New Project` is to make the beginning of the story process feel guided rather than technical. A user starting a story should not need to understand the entire product model before they can begin. Instead, the product should ask for a small number of meaningful inputs, interpret those inputs intelligently, and prepare the project so that the next steps already feel coherent.

In that sense, `New Project` is both a creation step and an onboarding step. It gives the user a way to begin, but it also establishes the mental model for what happens next.

The intended sequence is simple:

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story`

This order matters because it reflects the internal logic of the product. First the story foundation is established, then the structure is reviewed, then the prose is generated.

## Design Intent

`New Project` should feel light, guided, and premium. The user should not be faced with a large form or a technical setup screen. The experience should collect only the inputs that genuinely matter at the beginning and defer deeper control until later.

The design principle here is progressive disclosure. The wizard should capture the essential story direction first and treat advanced controls as optional. This keeps the beginning approachable without removing depth from the system.

At the same time, `New Project` should not behave like a superficial title prompt. It should gather enough information for the system to create a meaningful story foundation rather than just a blank project shell.

## Wizard Experience

The `New Project` flow is built as a short guided wizard. Each step has a distinct role in establishing the project.

The first step is about strategy. The user chooses how the project should be initialized, whether through a more exploratory mode, an LLM-assisted mode, or a more controlled setup. This decision influences how the project foundation will be prepared.

The second step captures the visible identity and broad editorial direction of the project. This is where the user defines the project name, story length, genre, and tone. These are not deep structural decisions, but they create the immediate shape of the story concept.

The third step moves closer to the actual story. Here the user provides core ideas, constraints, and a thematic pathway. This is where the wizard stops being administrative and starts becoming creative. The goal is to capture enough narrative intent that the system can build a coherent foundation.

The fourth step handles final settings. This includes language and model selection, as well as optional advanced guidance such as narrative style and mood. These advanced inputs should remain secondary and should default to `AI Choice`, allowing the flow to remain light for most users while still supporting more deliberate direction when needed.

## What the Wizard Captures

The wizard is expected to collect the initial premise of the project in a form that the system can use immediately. It captures the project identity, broad editorial direction, story seed material, and execution preferences. In practical terms, this includes the name of the project, the intended length, genre and tone direction, core ideas, constraints, thematic pathway, generation strategy, language, model, and optional advanced settings such as narrative style and mood.

These fields should not be treated as isolated form values. Together, they form the initial creative brief that the application uses to prepare the project.

## What Happens After Create Project

When the user clicks `Create Project`, the application should not immediately open the full editor and leave the user to decide what to do next. Instead, this action should trigger a short but meaningful system transition.

The project container is created and persisted. The internal project foundation is prepared. The hidden specification layer may be built in the background. The structural basis needed for `Blueprint` is prepared. The CNL representation is generated as part of that same initialization chain.

From the user's perspective, this should feel like the system is building the story foundation rather than merely saving a file.

This is why a processing stage belongs naturally to the `New Project` experience. It acknowledges that creation in SCRIPTA is not instant in the shallow sense. The product is preparing something more structured than an empty document.

## Relationship to Hidden Specification

`New Project` may create an internal specification layer as part of project initialization, but that layer should remain in the background. The user does not need to see a separate low-level specification screen at this point, especially if that screen would appear empty, overly technical, or disconnected from the user's intent.

The system needs the internal foundation, but the user needs clarity. For that reason, the hidden specification should remain an implementation detail of the creation process, while `Blueprint` and `CNL Editor` serve as the visible review layers.

This distinction is important. A product can be structurally sophisticated without forcing that structure to appear as raw complexity in the first-run experience.

## Transition Into Planning

After project creation, the correct next destination is not the full studio and not prose generation. The correct next destination is the structural planning flow.

That is why `Blueprint` should be the first major review surface after `Processing`. `Blueprint` tells the user what kind of story is being built. `CNL Editor` then makes that structure explicit in formal form. `NL Story` becomes meaningful only after those two layers are in place.

This creates a clean internal logic for the product:

- `New Project` begins the story
- `Processing` prepares the story foundation
- `Blueprint` defines the story
- `CNL Editor` exposes the structure
- `NL Story` executes the text

The clarity of the product depends on preserving this sequence.

## User Experience Goal

The first impression of `New Project` should be that the product understands how stories begin. The user should feel that they are being asked the right questions, in the right order, and that the system is helping shape the material into something coherent.

If the wizard works well, the user should never feel that they have merely opened a blank technical workspace. Instead, they should feel that the application has taken their intent seriously and transformed it into a prepared story foundation.

This is the moment when SCRIPTA starts to differentiate itself from a general-purpose writing interface. It is not just opening a document. It is beginning a structured story process.

## Relationship to Other Specifications

`DS06` defines the start of the workflow. It connects directly to `DS25`, which defines the guided transition from project creation to first story generation, and to `DS04`, which defines the formal CNL layer that emerges from the initialized project state.

Together, these specifications describe how the user moves from intention, to structure, to formal representation, and finally to prose.

## Success Criteria

`New Project` succeeds when the user can start a meaningful story without needing to understand the entire system upfront, when the product captures enough information to produce a coherent project foundation, and when the next step after creation feels obvious rather than confusing.

It also succeeds when the user experiences the beginning of the product as guided and deliberate, not as a jump into a crowded editing environment.
