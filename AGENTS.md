# Agent Guidelines

- All user interactions (input/output) are in Romanian.
- All artifacts saved on disk (code, comments, documentation, specs) are always in English.
- All implementation code is Node.js using .mjs files with no external dependencies.

## File Size Guidelines

- **Recommended**: Files should have less than 500 lines of code.
- **Maximum**: 700 lines in exceptional cases when logic cannot be split.
- **Refactoring**: When a file exceeds 500 lines, split it into logical modules.
- **Naming**: Split modules should use descriptive suffixes (e.g., `vocab-characters.mjs`, `vocab-locations.mjs`).

## SDK Structure

The SDK (`src/`) is organized into portable and backend-only modules:

### Portable Modules (Browser + Node)
These modules work in both browser and Node.js environments with no dependencies:

```
src/
├── index.mjs              # Browser-safe SDK entrypoint
├── cnl-parser/            # CNL parsing (fully portable)
├── evaluate/              # Evaluation metrics (portable)
├── evaluate.mjs           # Main evaluation entrypoint
├── generation/            # Story generation logic (portable)
├── services/              # Core services (mostly portable)
│   ├── evaluation.mjs
│   ├── verification.mjs
│   ├── guardrails.mjs
│   ├── planning.mjs
│   ├── literary-review.mjs
│   └── cnl-translator.mjs
├── vocabularies/          # Vocabulary definitions (portable)
├── vsa/
│   └── encoder.mjs        # VSA encoder (portable, uses pure JS hash)
└── utils/                 # Utility functions (portable)
```

### Backend-Only Modules (Node.js)
These modules require Node.js built-ins (`fs`, `crypto`) and cannot run in browser:

```
src/
├── index-node.mjs         # Full SDK with Node-only features
├── node/                  # Node-specific modules
│   ├── file-store.mjs     # File system operations
│   └── crypto-utils.mjs   # Cryptographic operations
├── storage/               # Persistence (requires fs)
├── services/
│   ├── jobs.mjs           # Background jobs (requires crypto)
│   ├── audit.mjs          # Audit chain (requires crypto)
│   └── store.mjs          # Storage service (requires fs)
└── vsa/
    └── index.mjs          # VSA index with file persistence (requires fs)
```

### Import Guidelines

**Browser/Universal code:**
```javascript
import { parseCNL, evaluateCNL } from './src/index.mjs';
```

**Node.js code (with file/crypto access):**
```javascript
import SDK from './src/index-node.mjs';
```

## Testing Guidelines

### Test Organization

Tests are organized by use case in the `tests/` directory:

```
tests/
├── run.mjs                # Test runner
├── parser/                # CNL parser tests
│   ├── basic-parsing.test.mjs
│   ├── groups.test.mjs
│   ├── relationships.test.mjs
│   ├── blueprint.test.mjs
│   └── constraints.test.mjs
├── evaluation/            # Evaluation tests
│   ├── metrics.test.mjs
│   ├── structure.test.mjs
│   └── entities.test.mjs
├── generation/            # Generation tests
│   ├── random.test.mjs
│   └── optimization.test.mjs
├── verification/          # Verification tests
│   └── constraints.test.mjs
├── guardrails/            # Guardrail tests
│   └── content-safety.test.mjs
└── vsa/                   # VSA encoder tests
    └── encoder.test.mjs
```

### Test Principles

1. **One test, one purpose**: Each test function should verify a single behavior.
2. **Descriptive names**: Test names should describe what is being tested.
3. **Small and focused**: Tests should be under 50 lines each.
4. **No shared state**: Tests should not depend on each other.

### Bug-Driven Testing

**When fixing a significant bug:**

1. First, write a failing test that reproduces the bug.
2. Fix the bug.
3. Verify the test now passes.
4. Commit both the test and the fix together.

This ensures bugs don't regress and documents the expected behavior.

### Test File Template

```javascript
/**
 * Tests for [component name]
 * 
 * Tests: [brief description of what is tested]
 */

import { functionToTest } from '../../src/path/to/module.mjs';

// Test: [description]
export function testSpecificBehavior() {
  const input = '...';
  const result = functionToTest(input);
  
  if (result.expected !== 'value') {
    throw new Error('Expected X but got Y');
  }
}

// Test: [description]  
export function testAnotherBehavior() {
  // ...
}
```

### Running Tests

```bash
npm test              # Run all tests
node tests/run.mjs    # Run all tests directly
```

## Demo vs SDK

### SDK Responsibilities (`src/`)
- CNL parsing and validation
- Evaluation and metrics calculation
- Story generation algorithms
- Verification and guardrails
- Vocabularies and archetypes

### Demo Responsibilities (`demo/`)
- Web UI (HTML/CSS/JavaScript)
- HTTP API endpoints (thin wrappers around SDK)
- Project persistence (using SDK storage)
- User interaction and state management

**The demo should NOT contain business logic.** All generation, evaluation, and verification logic belongs in the SDK.

## Documentation Guidelines

### Documentation Structure

Documentation is organized in `docs/theory/`:

```
docs/theory/
├── index.html                 # Main documentation hub with navigation
├── doc-styles.css             # Shared styles
├── content/                   # Documentation pages
│   ├── overview.html          # SCRIPTA overview
│   ├── conceptual-model.html  # Mental model, glossary, tab relationships
│   ├── cnl-language.html      # CNL syntax reference
│   ├── end-to-end.html        # Complete workflow example
│   │
│   ├── tab-*.html             # Editor tab guides (16 pages)
│   │   ├── tab-cnl.html       # CNL Editor tab
│   │   ├── tab-nl.html        # Natural Language generation
│   │   ├── tab-blueprint.html # Story planning
│   │   ├── tab-characters.html# Character definitions
│   │   └── ...                # (one page per UI tab)
│   │
│   ├── *-theory.html          # Deep theory pages
│   │   ├── character-theory.html   # Jungian archetypes
│   │   ├── narrative-theory.html   # Story structure
│   │   ├── pattern-theory.html     # Master plots
│   │   └── ...
│   │
│   ├── generation.html        # Generation strategies
│   ├── metrics.html           # Metrics overview
│   └── metrics-reference.html # Detailed metrics reference
```

### Documentation Principles

1. **One page per tab**: Each UI tab has a dedicated `tab-*.html` guide.
2. **Theory separate from guides**: Deep theory lives in `*-theory.html` files.
3. **No legacy content**: All documentation is current and maintained.
4. **Consistent structure**: Each tab guide includes:
   - What the tab does
   - When to use it
   - Properties table
   - Step-by-step usage
   - CNL output examples
   - Metrics impact
   - Best practices
   - Related links

### Adding New Documentation

When adding new features:

1. Update the relevant `tab-*.html` guide.
2. Add new vocabulary terms to `conceptual-model.html` glossary.
3. Update `index.html` sidebar if adding new pages.
4. Link related pages using `data-page` attributes for SPA navigation.
