# DS11 — CNL Syntax Reference

## 1. Purpose

This document provides the complete reference for SCRIPTA's Controlled Natural Language (CNL) syntax. SCRIPTA uses exclusively the **SVO (Subject-Verb-Object)** syntax which is both human-readable and machine-parseable.

## 2. Syntax Overview

### 2.1 Core Statement Types

```
// Entity declaration
Subject is Type
Anna is protagonist

// Property assignment
Subject has Property Value
Anna has trait courage

// Relationship
Subject relates to Target as Type
Anna relates to Marcus as sibling

// Constraints
Subject requires "value"
Subject forbids "value"
Subject must Action Target

// Ownership
Subject owns Object
Anna owns SilverKey

// Tone and limits
Subject has tone Value
Subject has max Property Count
Subject has min Property Count
```

### 2.2 Verb Categories

| Category | Verbs |
|----------|-------|
| **Core** | `is`, `has`, `relates`, `includes`, `references`, `describes` |
| **Constraint** | `requires`, `forbids`, `must`, `owns`, `applies` |
| **Action** | `targets`, `meets`, `discovers`, `enters`, `travels`, `decides`, `faces`, `threatens`, `arrives` |
| **Emotional** | `wants`, `fears`, `loves`, `hates`, `seeks`, `avoids`, `confronts`, `transforms`, `reveals` |

### 2.3 Extended Constraint Types

| Type | Syntax | AST Location |
|------|--------|--------------|
| requires | `X requires "Y"` | `ast.constraints.requires[]` |
| forbids | `X forbids "Y"` | `ast.constraints.forbids[]` |
| must | `X must action Y` | `ast.constraints.must[]` |
| tone | `X has tone Y` | `ast.constraints.tone[]` |
| max | `X has max prop N` | `ast.constraints.max[]` |
| min | `X has min prop N` | `ast.constraints.min[]` |

## 3. Parser AST Structure

### 3.1 Complete AST Shape

```javascript
{
  type: 'document',
  entities: {
    "Anna": {
      name: "Anna",
      type: "protagonist",
      types: ["protagonist"],
      properties: { archetype: "Hero" },
      traits: ["courage", "determination"],
      relationships: [{ target: "Marcus", type: "sibling", line: 5 }],
      line: 1
    }
  },
  groups: [
    {
      name: "Chapter1",
      type: "group",
      properties: { title: "The Beginning" },
      statements: [...],
      children: [...],
      startLine: 10,
      endLine: 25
    }
  ],
  statements: [...],
  relationships: [
    { from: "Anna", to: "Marcus", type: "sibling", line: 5 }
  ],
  ownership: [
    { owner: "Anna", owned: "SilverKey", line: 7 }
  ],
  references: [
    { from: "Chapter2", to: "Chapter1", type: "references", line: 30 }
  ],
  constraints: {
    requires: [{ subject: "Story", target: "happy ending", scope: "global", line: 3 }],
    forbids: [{ subject: "World", target: "explicit violence", scope: "global", line: 4 }],
    must: [{ subject: "Chapter_1", action: "introduce", target: "Anna", scope: "global", line: 5 }],
    tone: [{ subject: "Story", value: "hopeful", scope: "global", line: 6 }],
    max: [{ subject: "Story", what: "characters", count: 10, scope: "global", line: 7 }],
    min: [{ subject: "Story", what: "scenes", count: 5, scope: "global", line: 8 }]
  }
}
```

### 3.2 Extraction Functions

```javascript
import { 
  parseCNL,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups
} from './cnl-parser.mjs';

const result = parseCNL(cnlText);
const entities = extractEntities(result.ast);  // { characters, locations, themes, objects, other }
const constraints = extractConstraints(result.ast);  // { requires, forbids, must, tone, max, min }
const ownership = extractOwnership(result.ast);  // [{ owner, owned, line }]
```

## 4. Metrics Impact

### 4.1 CPSR (CNL Parse Success Rate)

Measures parser success on generated CNL:
```javascript
const result = parseCNL(generatedCnl);
const cpsr = result.valid ? 1.0 : 0.0;
```

### 4.2 CSA (Constraint Satisfaction Accuracy)

Uses structured constraints from AST:
```javascript
let satisfied = 0;
let total = 0;

for (const req of ast.constraints.requires) {
  total++;
  if (draftContains(req.target)) satisfied++;
}

for (const forbid of ast.constraints.forbids) {
  total++;
  if (!draftContains(forbid.target)) satisfied++;
}

const csa = total > 0 ? satisfied / total : 1.0;
```

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-02 | Unified CNL with SVO syntax only |
