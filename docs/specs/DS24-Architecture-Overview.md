# DS24 - Architecture Overview

**Document ID:** DS24  
**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-02-02

## 1. Overview

SCRIPTA targets a **browser-first architecture** where core processing can run client-side. The repository includes:

- A **minimal persistence server** (`src/server.mjs`) for project CRUD only.
- A **research/demo server** (`demo/server.mjs`) that also exposes optional processing endpoints for evaluation and LLM-backed generation.

## 2. Architecture Principles

### 2.1 Browser-First Processing
- CNL parsing, validation, and metrics are available as browser-compatible ES modules.
- The **minimal server** exposes persistence only.
- The **demo server** may expose processing endpoints for convenience when integrating with remote LLMs.

### 2.2 Module Structure
```
src/
├── cnl-parser/           # CNL parsing SDK
│   ├── cnl-parser.mjs    # Main entry point
│   ├── cnl-parser-core.mjs
│   ├── cnl-parser-grammar.mjs
│   ├── cnl-parser-extensions.mjs
│   └── cnl-parser-generators.mjs
│
├── vocabularies/         # Narrative vocabularies
│   ├── vocabularies.mjs  # Aggregator
│   ├── vocab-characters.mjs
│   ├── vocab-locations.mjs
│   ├── vocab-narrative.mjs
│   └── vocab-actions.mjs
│
├── vsa/                  # Vector Symbolic Architecture
│   ├── index.mjs
│   └── encoder.mjs
│
├── evaluate/             # CNL evaluation internals
│   ├── extract-entities.mjs
│   ├── structure-metrics.mjs
│   └── metrics.mjs
│
├── utils/
│   └── ids.mjs            # Browser-safe ID helpers
│
├── services/             # Business logic (browser-compatible)
│   ├── planning.mjs
│   ├── verification.mjs
│   ├── evaluation.mjs
│   └── ...
│
├── storage/              # Persistence layer
│   └── projects.mjs      # Project CRUD operations
│
├── cnl/                  # CLI tools and re-exports
│   ├── validator.mjs
│   └── cli.mjs
│
├── evaluate.mjs          # Unified CNL evaluator entrypoint
└── server.mjs            # Minimal persistence server

demo/
├── index.html            # Story Forge UI
├── server.mjs            # Combined static + persistence server
├── app/                  # Browser UI modules
└── services/             # Demo-only server helpers
```

## 3. Key Decisions

### 3.1 Processing APIs (Minimal vs Demo)
For the minimal server (`src/server.mjs`), there are no business-logic APIs:
- ~~`POST /v1/cnl/validate`~~ - use `parseCNL()` in browser
- ~~`POST /v1/plans`~~ - use `generatePlan()` in browser
- ~~`POST /v1/verify`~~ - use `verifyAgainstSpec()` in browser

For the demo server (`demo/server.mjs`), optional processing APIs exist to support LLM integration and evaluation during research:
- `POST /v1/evaluate`
- `POST /v1/generate/*`
- `GET /v1/run-eval` (batch evaluation)

### 3.2 Persistence API
The persistence endpoints are:
```
GET    /v1/projects          # List projects
GET    /v1/projects/:id      # Get project
POST   /v1/projects          # Create project
PUT    /v1/projects/:id      # Update project
DELETE /v1/projects/:id      # Delete project
GET    /health               # Health check
```

### 3.3 Module Compatibility
All modules in `src/` are designed to work in both environments:
- **Browser:** `<script type="module" src="...">` or dynamic import
- **Node.js:** Standard ES module import

Modules avoid Node.js-specific APIs (fs, path, crypto) in browser entrypoints.
Node-only modules exist for server-side functionality (examples):
- `src/storage/projects.mjs` (filesystem persistence)
- `src/services/store.mjs` (filesystem-backed stores)
- `src/services/audit.mjs` (HMAC/crypto audit logging)
- `src/services/jobs.mjs` (server job runner)
- `src/vsa/index.mjs` and `src/cnl/cli.mjs` (CLI utilities)

## 4. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  UI Layer   │→ │  CNL Parser  │→ │  Services        │   │
│  │  (HTML/JS)  │  │  (SDK)       │  │  (evaluation,    │   │
│  │             │  │              │  │   verification)  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         ↓                                    ↓              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Project State (in-memory)               │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓ Save                          ↑ Load             │
└─────────│───────────────────────────────│──────────────────┘
          ↓                               ↑
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /v1/projects (CRUD only)                             │  │
│  │  - JSON file storage                                  │  │
│  │  - No business logic                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 5. SDK Usage

### 5.1 In Browser
```html
<script type="module">
  import { parseCNL, extractEntities } from './src/cnl-parser/cnl-parser.mjs';
  
  const result = parseCNL('Anna is protagonist');
  console.log(result.valid, extractEntities(result.ast));
</script>
```

### 5.2 In Node.js
```javascript
import { parseCNL, extractEntities } from './src/cnl-parser/cnl-parser.mjs';

const result = parseCNL('Anna is protagonist');
console.log(result.valid, extractEntities(result.ast));
```

## 6. Configuration

The runtime grammar used by the CNL parser is defined in:
- `src/cnl-parser/cnl-parser-grammar.mjs`

Vocabularies are defined under:
- `src/vocabularies/`

---

*This document supersedes DS02-API.md for architecture decisions.*
