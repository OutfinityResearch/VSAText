# Scripts

## validate_examples.mjs
Validate JSON examples against API schemas.

```bash
node scripts/validate_examples.mjs
```

Runs with no external dependencies.

## generate_example_stub.mjs
Generate a minimal example JSON from a schema definition.

```bash
node scripts/generate_example_stub.mjs --schema docs/schemas/api/spec.json --def CreateSpecRequest
```
