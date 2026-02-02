# Agent Guidelines

- All user interactions (input/output) are in Romanian.
- All artifacts saved on disk (code, comments, documentation, specs) are always in English.
- All implementation code is Node.js using .mjs files with no external dependencies.

## File Size Guidelines

- **Recommended**: Files should have less than 500 lines of code.
- **Maximum**: 700 lines in exceptional cases when logic cannot be split.
- **Refactoring**: When a file exceeds 500 lines, split it into logical modules.
- **Naming**: Split modules should use descriptive suffixes (e.g., `vocab-characters.mjs`, `vocab-locations.mjs`).
