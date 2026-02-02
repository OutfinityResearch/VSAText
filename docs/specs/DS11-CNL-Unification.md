# DS11 — CNL Unification and Migration Guide

## 1. Purpose

This document describes the unification of SCRIPTA's Controlled Natural Language (CNL) into a single, coherent syntax. It serves as:

1. **Migration guide** from deprecated predicate-style CNL
2. **Reference** for the unified SVO (Subject-Verb-Object) syntax
3. **Implementation notes** for parser and service updates

## 2. Historical Context

### 2.1 The Two-Dialect Problem

Prior to this unification, SCRIPTA had two incompatible CNL dialects:

| Dialect | Location | Syntax Example |
|---------|----------|----------------|
| **SVO CNL** | `demo/cnl-parser*.mjs`, UI | `Anna is protagonist` |
| **Predicate DSL** | `src/cnl/grammar.ebnf`, services | `CHARACTER(Anna).` |

This caused:
- Parser mismatches (services used predicate, parser expected SVO)
- Broken CPSR/CSA metrics
- Confusion in documentation
- Import/export inconsistencies

### 2.2 Decision: SVO CNL Only

We chose to keep **SVO CNL** because:
- More human-readable
- Already used by the Visual Story Composer
- Natural for writers (mirrors Indo-European sentence structure)
- Parser fully implemented and tested

**Deprecated files (deleted):**
- `src/cnl/grammar.ebnf`
- `src/cnl/rules-parser.mjs`
- Predicate-style examples

## 3. Unified CNL Syntax Summary

### 3.1 Core Statement Types

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

### 3.2 New Verbs Added (v2.0)

| Verb | Purpose | Example |
|------|---------|---------|
| `must` | Obligation constraint | `Chapter_1 must introduce Anna` |
| `owns` | Ownership relation | `Anna owns SilverKey` |
| `applies` | Rule scoping | `Rule applies to Scene_3` |

### 3.3 Extended Constraint Types

| Type | Syntax | AST Location |
|------|--------|--------------|
| requires | `X requires "Y"` | `ast.constraints.requires[]` |
| forbids | `X forbids "Y"` | `ast.constraints.forbids[]` |
| must | `X must action Y` | `ast.constraints.must[]` |
| tone | `X has tone Y` | `ast.constraints.tone[]` |
| max | `X has max prop N` | `ast.constraints.max[]` |
| min | `X has min prop N` | `ast.constraints.min[]` |

## 4. Migration from Predicate DSL

### 4.1 Conversion Table

| Predicate Style | SVO Style |
|-----------------|-----------|
| `CHARACTER(Anna).` | `Anna is character` |
| `TRAIT(Anna, brave).` | `Anna has trait brave` |
| `GOAL(Anna, save, "brother").` | `Anna wants "save brother"` |
| `RULE(Scene_3, must_include, "storm").` | `Scene_3 requires "storm"` |
| `RULE(World, forbid, "violence").` | `World forbids "violence"` |
| `RULE(Story, tone, hopeful).` | `Story has tone hopeful` |
| `RULE(Story, max_characters, 10).` | `Story has max characters 10` |
| `FORMAT(Screenplay, acts, 3).` | `Story has format screenplay` |
| `GUARDRAIL(Text, forbid_phrase, "cliche").` | `Story forbids "cliche"` |

### 4.2 Migration Script

For existing projects with predicate CNL in `data/projects.json`:

```javascript
function migratePredicate(predicateCnl) {
  const lines = predicateCnl.split('\n');
  const svoLines = [];
  
  for (const line of lines) {
    const match = line.match(/^(\w+)\(([^)]+)\)\.$/);
    if (!match) continue;
    
    const [, pred, argsStr] = match;
    const args = argsStr.split(',').map(a => a.trim().replace(/^"|"$/g, ''));
    
    switch (pred.toUpperCase()) {
      case 'CHARACTER':
        svoLines.push(`${args[0]} is character`);
        break;
      case 'TRAIT':
        svoLines.push(`${args[0]} has trait ${args[1]}`);
        break;
      case 'RULE':
        if (args[1] === 'must_include') {
          svoLines.push(`${args[0]} requires "${args[2]}"`);
        } else if (args[1] === 'forbid') {
          svoLines.push(`${args[0]} forbids "${args[2]}"`);
        } else if (args[1] === 'tone') {
          svoLines.push(`${args[0]} has tone ${args[2]}`);
        }
        break;
      case 'TONE':
        svoLines.push(`${args[0]} has tone ${args[1]}`);
        break;
    }
  }
  
  return svoLines.join('\n');
}
```

## 5. Parser AST Structure

### 5.1 Complete AST Shape

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

### 5.2 Extraction Functions

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

## 6. Service Updates Required

### 6.1 cnl-translator.mjs

**Before:** Generated predicate style
```javascript
// Old output: CHARACTER(Anna).\nTRAIT(Anna, brave).
```

**After:** Generate SVO style
```javascript
// New output: Anna is character\nAnna has trait brave
```

### 6.2 verification.mjs

**Before:** Parsed constraints with regex looking for `RULE(...)`

**After:** Use parsed AST
```javascript
const result = parseCNL(cnlText);
for (const req of result.ast.constraints.requires) {
  // Check if req.target is present in draft
}
```

### 6.3 planning.mjs

**Before:** Expected `constraints` array with predicate format

**After:** Use AST constraint structures directly

## 7. Metrics Impact

### 7.1 CPSR (CNL Parse Success Rate)

Now measured correctly because parser and generated CNL use same syntax:
```javascript
const result = parseCNL(generatedCnl);
const cpsr = result.valid ? 1.0 : 0.0;
```

### 7.2 CSA (Constraint Satisfaction Accuracy)

Now uses structured constraints:
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

## 8. Backward Compatibility

### 8.1 Legacy Data

Projects saved with predicate CNL (`data/projects.json`) need migration:
1. Detect predicate format (lines matching `WORD(args).`)
2. Convert using migration function
3. Re-save with SVO format

### 8.2 API Responses

The API continues to return CNL text, but now in SVO format exclusively.

## 9. Implementation Checklist

- [x] Delete predicate parser files
- [x] Extend SVO parser with new verbs
- [x] Update DS04 specification
- [x] Create this migration guide (DS11)
- [ ] Refactor cnl-translator.mjs
- [ ] Refactor verification.mjs
- [ ] Refactor planning.mjs
- [ ] Migrate data/projects.json
- [ ] Update eval dataset
- [ ] Update API examples

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-02 | Unified CNL, removed predicate DSL |
| 1.0.0 | 2026-01-30 | Initial dual-dialect system |
