# CNL Prototype

This folder contains a minimal Controlled Natural Language prototype.

## Files
- grammar.ebnf: minimal grammar definition.
- validator.mjs: simple validator for line-based CNL statements.
- cli.mjs: CLI wrapper for validation.
- examples.cnl: sample constraints.

## Usage

```bash
node src/cnl/validator.mjs src/cnl/examples.cnl
```

The validator prints a JSON report with parsed statements and errors.

## CLI

```bash
node src/cnl/cli.mjs --file src/cnl/examples.cnl
node src/cnl/cli.mjs --text "CHARACTER(Anna)."
```
