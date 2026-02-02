# SCRIPTA CNL - Controlled Natural Language

This folder contains the unified CNL system for SCRIPTA narrative specifications.

## Unified SVO Syntax

SCRIPTA uses a **Subject-Verb-Object** syntax that is both human-readable and machine-parseable:

```
Anna is protagonist
Anna has trait courage
Anna relates to Marcus as sibling
Scene_3 requires "storm"
World forbids "explicit violence"
```

## Files

- `validator.mjs` - Re-exports the unified parser from `demo/cnl-parser.mjs`
- `cli.mjs` - CLI wrapper for validation and export
- `examples.cnl` - Sample CNL file demonstrating all syntax features

## Usage

### CLI Validation
```bash
node src/cnl/cli.mjs examples.cnl
node src/cnl/cli.mjs examples.cnl summary
node src/cnl/cli.mjs examples.cnl markdown
```

### Programmatic Usage
```javascript
import { parseCNL, validateText } from './validator.mjs';

const result = parseCNL(`
  Anna is protagonist
  Anna has trait courage
`);

console.log(result.valid);  // true
console.log(result.ast.entities);  // { Anna: {...} }
```

## Syntax Reference

### Entity Declarations
```
<name> is <type>
```
Types: `protagonist`, `character`, `antagonist`, `mentor`, `ally`, `location`, `theme`, `artifact`, `object`

### Properties
```
<entity> has <property> <value>
<entity> has trait <trait_name>
<entity> has mood <mood_name>
```

### Relationships
```
<from> relates to <to> as <relationship_type>
```

### Constraints
```
<scope> requires "<element>"
<scope> forbids "<element>"
<scope> must introduce <entity>
<entity> has tone <tone>
```

### Groups (Structure)
```
<name> group begin
  <statements...>
<name> group end
```

## Migration from Predicate Syntax

Old predicate syntax is **deprecated**. Convert as follows:

| Old (Predicate) | New (SVO) |
|-----------------|-----------|
| `CHARACTER(Anna).` | `Anna is character` |
| `TRAIT(Anna, brave).` | `Anna has trait brave` |
| `RULE(Scene_3, must_include, "storm").` | `Scene_3 requires "storm"` |
| `RULE(World, forbid, "violence").` | `World forbids "violence"` |
