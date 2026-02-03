# DS01 — SCRIPTA Vision

## What is SCRIPTA?

SCRIPTA (Structured Creative Writing Intelligent Platform for Textual Authoring) is a Visual Story Composer that lets authors build narrative specifications through an intuitive visual interface. Instead of writing formal specifications manually, authors compose stories visually, and the system auto-generates a Controlled Natural Language (CNL) representation.

Think of CNL as a programming language for narratives. The visual editor is like an IDE, and the CNL is the source code.

## The Core Idea

Authors work with a tree-based structure editor where they:

1. **Build structure** - Create chapters, scenes, and beats in a hierarchical tree
2. **Add entities** - Select characters, locations, and moods from reusable libraries
3. **Apply patterns** - Use story templates like "Hero's Call" with variable bindings
4. **Get metrics** - Receive real-time quality scores as they build

The system generates CNL automatically from this visual structure. The CNL can then be parsed, validated, and evaluated for quality metrics.

## System Flow

```
Visual Editor → CNL Generator → Parser → Metrics
     ↓              ↓             ↓         ↓
  Tree UI     SVO statements    AST     Quality scores
```

**Example flow:**
- Author adds "Anna" as protagonist with trait "courageous"
- System generates: `Anna is protagonist` and `Anna has trait courageous`
- Parser validates syntax
- Metrics engine checks coherence and constraints

## CNL as Programming Language

The CNL maps directly to programming concepts:

| Programming | Narrative |
|-------------|-----------|
| Source code | CNL specification |
| Parsing | CNL → AST |
| Execution | Metric calculation |
| Runtime errors | Constraint violations |
| Functions | Reusable patterns |
| Variables | Pattern placeholders ($hero, $location) |

## Entity Libraries

Authors build from reusable libraries:

- **Characters** - Named characters with traits and archetypes
- **Locations** - Places with atmosphere and connections
- **Moods** - Emotional registers applied to scenes
- **Patterns** - Story templates with variable slots
- **Props** - Significant objects
- **Themes** - Abstract narrative themes

## Quality Metrics

The system evaluates narrative quality through:

| Metric | What it measures | Target |
|--------|------------------|--------|
| CPSR | Parse success rate | > 95% |
| CSA | Constraint satisfaction | > 98% |
| Coherence | Entity consistency | > 75% |
| CAD | Character trait stability | < 15% |
| NQS | Overall narrative quality | > 75% |

## Technology

- Single HTML file UI with vanilla JavaScript
- Minimal Node.js persistence server
- JSON file storage
- Zero external dependencies for core functionality

## Success Criteria

1. Author creates complete story structure in under 30 minutes
2. New user becomes productive within 1 hour
3. Generated CNL parses with 100% success
4. Patterns are shareable across projects
5. Markdown export works correctly
