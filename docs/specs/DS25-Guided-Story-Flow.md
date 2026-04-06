# DS25 — Guided Story Flow

## Overview

This document proposes a guided flow that begins immediately after a user creates a new project and continues until the first story draft is generated. The goal is to make the product easier to understand at the beginning, reduce the sense of clutter, and delay the full Story Studio workspace until it becomes useful rather than overwhelming.

At the moment, the application risks feeling like a collection of tabs that the user must decode alone. This is especially problematic right after `New Project`, when the user should feel guided, not exposed to the entire system at once. The purpose of the guided story flow is to solve that problem by making the first experience feel intentional, calm, and progressive.

## Product Rationale

The first minutes in the product matter more than any later editing capability. If the user creates a new project and immediately sees a large number of tabs, the interface can feel heavier than it needs to be. Even when the underlying capabilities are strong, the product may appear fragmented because the user is asked to understand too many things before the core story has even begun to exist.

The proposed solution is to separate the early creation experience from the full studio experience. In the beginning, the user should be guided through a small number of essential steps. Only after the first story draft exists should the complete Story Studio workspace become visible.

This creates two distinct product moments. The first is a guided creative path that helps the user move from intention to first draft. The second is a full editing environment for refinement, restructuring, and deeper control.

## Guided Mode and Studio Mode

The product should begin in a limited, guided mode immediately after `New Project`. In this mode, the user sees only the steps required to move from setup to the first generated story. The interface should communicate a clear sequence and a clear next action at every moment.

Once the first story draft has been generated successfully, the product may transition into full studio mode. That is the point where the broader workspace becomes meaningful. The user now has something concrete to edit, compare, refine, and expand, so the presence of additional tabs is no longer confusing in the same way.

This means the product stops behaving like an all-at-once editor and starts behaving like a system that reveals complexity only when that complexity becomes useful.

## Intended Flow

The proposed path is straightforward:

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story -> Open Full Studio`

This flow should feel like a creative progression, not like navigation between unrelated screens.

### Processing

Immediately after the user clicks `Create Project`, the application should not open the full editor. Instead, it should present a dedicated processing state with a clear message such as `Generating story foundation...`.

This stage is important because it communicates that the system is doing meaningful work before prose generation begins. In the background, the application may create the project container, prepare the internal foundation or hidden specification state, build the initial structural planning layer, and generate CNL. The user does not need to see every technical detail, but they should understand that the story is being prepared, not merely opened.

### Blueprint

Once processing is complete, the user should arrive in `Blueprint`. This is the first visible planning layer and should function as the place where the story becomes structurally understandable.

Here, the user should be able to review the broad architecture of the story: the chosen narrative arc, the major beats, the movement across chapters and scenes, the conflict progression, and the overall pacing logic. The purpose of this step is not to overwhelm the user with configuration, but to help them understand the shape of the story before the story is written.

At this stage, the main actions should remain simple and decisive. The user should be able to accept the plan, regenerate it, or edit it. The screen should communicate that Blueprint defines the story.

### CNL Editor

After Blueprint is accepted, the user should move into `CNL Editor`. This step should expose the formal structure used by the system, but in a way that remains readable and product-oriented.

The screen should make clear that CNL is the structural representation of the story, not a separate creative step competing with Blueprint. It should show the formal result of the planning work: beat mappings, hooks, dialogues, chapter and scene organization, and the CNL representation itself. Raw CNL may still be visible, but it should not dominate the experience unless the user explicitly wants that level of detail.

The purpose of this review is confidence. The user should feel that the structure is now precise enough to support prose generation.

### NL Story

Only after Blueprint and CNL have been reviewed should the user arrive in `NL Story`. This is the first stage where prose is generated. At this point, the user should understand that the application is no longer planning the story but executing it into text.

This distinction matters. Blueprint defines the story. CNL Editor exposes the structure. NL Story turns that structure into prose.

That sequence is one of the core product ideas and should be visible in the experience itself, not only in documentation.

### Open Full Studio

After the first story draft exists, the application should offer a transition into the complete workspace. This could be presented as a clear action such as `Open Full Studio`.

Only now should the larger tab set appear. At this moment, the user has enough context for those tools to feel empowering instead of noisy. The full studio becomes a second-layer experience: valuable, but not necessary during the first guided journey.

## Navigation Strategy

During the guided flow, the left navigation should remain intentionally limited. The user should see only the steps that matter in the current journey: `Blueprint`, `CNL Editor`, and `NL Story`. Internal processing states may exist, but they should not create extra visible destinations that feel abstract or unfinished.

This limited navigation is not a restriction for its own sake. It is a clarity tool. The user should never wonder which of ten tabs they are supposed to open next. The interface itself should answer that question.

Once the first story draft has been created, the product may expand into full navigation. At that point, more advanced tabs such as `Story Fundamentals`, `Theme`, `Dramatic Model`, `Narrative Design`, `Cast`, `Character Transformation`, `World`, and `Tone & Style` can appear. Their value is much easier to understand when they are presented as refinement tools rather than first-contact decisions.

## UX Intent

This flow should make the product feel curated rather than technical. The design should favor clarity before control, sequence before abundance, and progressive disclosure before full exposure. The user should feel that the application knows where they are in the process and is helping them move forward.

This is also a positioning decision. A product that opens in guided mode communicates confidence. It says: here is the path, here is what happens next, and here is when deeper control becomes useful. That is a stronger first impression than showing every capability at once and expecting the user to infer the intended order.

## Relationship to Existing Specifications

This document complements `DS06` by extending the post-creation experience of `New Project`. It also relates directly to `DS04`, since the guided flow places `CNL Editor` in a clear review position after `Blueprint`, and to `DS09`, since the studio interface would now exist in two modes: a limited guided mode and a full studio mode.

In that sense, this document is less about one screen and more about product choreography. It defines how the user moves from project creation into story creation, and when the full application should reveal itself.

## Success Criteria

The proposed guided story flow succeeds if a new user no longer feels overwhelmed immediately after creating a project, if the order `Blueprint -> CNL Editor -> NL Story` becomes obvious in practice, and if the application feels more like a guided creative system than a flat collection of tabs.

It also succeeds if the full studio feels like a second phase of the experience rather than a requirement for getting started. In that version of the product, complexity still exists, but it arrives at the right time.
