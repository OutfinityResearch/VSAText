# DS24 - Architecture Overview

**Document ID:** DS24  
**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-02-02

## 1. Overview

SCRIPTA uses a **browser-first architecture** where all processing happens client-side. The server is minimal and handles only persistence.

## 2. Architecture Principles

### 2.1 Browser-First Processing
- All CNL parsing, validation, and metrics calculation runs in the browser
- No HTTP APIs for business logic - only persistence
- Same JavaScript modules work in both browser and Node.js

### 2.2 Module Structure
```
src/
├── cnl-parser/           # CNL parsing SDK
│   ├── cnl-parser.mjs    # Main entry point
│   ├── cnl-parser-core.mjs
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
├── services/             # Business logic (browser-compatible)
│   ├── planning.mjs
│   ├── verification.mjs
│   ├── evaluation.mjs
│   └── ...
│
├── storage/              # Persistence layer
│   └── projects.mjs      # Project CRUD operations
│
├── configs/              # Configuration files
│   └── cnl-grammar.json  # Grammar definitions
│
├── cnl/                  # CLI tools and re-exports
│   ├── validator.mjs
│   └── cli.mjs
│
└── server.mjs            # Minimal persistence server

demo/
├── index.html            # Story Forge UI
├── server.mjs            # Combined static + persistence server
├── cnl-parser.mjs        # Re-export from src/
└── vocabularies.mjs      # Re-export from src/
```

## 3. Key Decisions

### 3.1 No HTTP APIs for Processing
- ~~`POST /v1/cnl/validate`~~ - Use `parseCNL()` directly in browser
- ~~`POST /v1/plans`~~ - Use `generatePlan()` directly in browser
- ~~`POST /v1/verify`~~ - Use `verifyAgainstSpec()` directly in browser

### 3.2 Only Persistence API
The only HTTP endpoints are for project storage:
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

Modules avoid Node.js-specific APIs (fs, path, crypto) except in:
- `src/storage/projects.mjs` - File system operations
- `src/server.mjs` - HTTP server

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

Grammar and vocabulary definitions are stored in JSON configs:
- `src/configs/cnl-grammar.json` - Verbs, modifiers, entity types

This allows customization without code changes.

## 7. Migration from Previous Architecture

### Removed
- HTTP APIs for CNL validation, translation, planning, verification
- Predicate DSL (`CHARACTER(Anna).`) - replaced with SVO CNL
- Duplicate server files

### Kept
- Persistence API (`/v1/projects`)
- All business logic (now as browser-compatible modules)

## 8. Future Considerations

- **IndexedDB Storage:** Browser-native persistence without server
- **Service Workers:** Offline-first capability
- **WebAssembly:** VSA operations for performance

---

*This document supersedes DS02-API.md for architecture decisions.*
