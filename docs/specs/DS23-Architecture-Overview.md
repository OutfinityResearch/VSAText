# DS23 - Architecture Overview

**Document ID:** DS23  
**Version:** 1.1  
**Status:** Active  
**Last Updated:** 2026-04-03

## 1. Overview

SCRIPTA targets a browser-first architecture where the core authoring workflow can run client-side. The system supports collaboration between the human actor, the Author, and the supporting system actor, System Agents - AI.

The repository includes a minimal persistence server for project CRUD and a demo/research server that may also expose optional processing endpoints for generation and evaluation.

## 2. Architecture Principles

### 2.1 Browser-First Processing

CNL parsing, validation, planning support, and metrics are available as browser-compatible ES modules. The minimal server exposes persistence only. The demo server may expose processing endpoints for convenience when integrating remote generation or evaluation services.

### 2.2 Workflow-Oriented Architecture

The architecture is organized around the main SCRIPTA workflow:

`New Project -> Processing -> Blueprint -> CNL Editor -> NL Story -> Manuscript -> Metrics`

This means the architecture must support project creation, planning, formal specification, prose generation, revision, and evaluation as connected stages of one authoring flow rather than as isolated features.

### 2.3 Reusable Asset Support

The architecture must also support the Library system as a reusable asset layer. Library assets are applied into project state and then continue through planning, specification, generation, and refinement like any other project content.

## 3. Module Structure

```text
src/
├── index.mjs              # Browser-safe SDK entrypoint
├── index-node.mjs         # Full Node.js SDK entrypoint
├── cnl-parser/            # CNL parsing SDK
├── evaluate/              # Evaluation internals
├── generation/            # Story generation logic
├── services/              # Planning, verification, evaluation, review support
├── storage/               # Persistence layer
├── vsa/                   # VSA/HDC support
├── utils/                 # Shared utilities
└── server.mjs             # Minimal persistence server

demo/
├── index.html            # Browser UI
├── server.mjs            # Demo/research server
├── app/                  # Browser workflow modules
└── services/             # Demo-only server helpers
```

## 4. Logical Components

At the logical level, the architecture is composed of the following collaborating components:

| Component | Role |
|-----------|------|
| New Project and Processing | Create the project container and prepare initial project state |
| Planning Layer | Support story foundation and structural planning through pages such as `Blueprint` |
| Library Layer | Provide reusable narrative assets that can be applied into project state |
| CNL Layer | Build, edit, validate, import, and export the formal story specification |
| Generation Layer | Produce prose drafts from the current foundation and specification |
| Manuscript Layer | Support scene-level and chapter-level refinement |
| Evaluation Layer | Compute quality signals and diagnostics |
| Persistence Layer | Save and load projects |

## 5. Key Decisions

### 5.1 Processing APIs

For the minimal server (`src/server.mjs`), there are no business-logic APIs beyond persistence. Core parsing, planning, and evaluation logic remain available in the browser-compatible SDK.

For the demo server (`demo/server.mjs`), optional processing APIs may exist to support generation and evaluation during research and experimentation.

### 5.2 Persistence API

The persistence endpoints are:

```text
GET    /v1/projects
GET    /v1/projects/:id
POST   /v1/projects
PUT    /v1/projects/:id
DELETE /v1/projects/:id
GET    /health
```

### 5.3 Module Compatibility

Portable modules in `src/` are designed to work in both browser and Node.js environments. Node-only modules are used where filesystem or crypto support is required, such as persistence, audit support, or saved VSA indexes.

## 6. Data Flow

```text
Author
  |
  v
Browser UI
  |
  v
Project State <-> Library Assets
  |
  +-> Planning and Blueprint
  |
  +-> CNL Generation and Editing
  |
  +-> Draft Generation
  |
  +-> Manuscript Refinement
  |
  +-> Metrics and Diagnostics
  |
  v
Persistence Server
```

The Author interacts with the browser UI. System Agents - AI operate through the planning, CNL, generation, and evaluation layers to update project state and return results to the author. Project state may also be enriched through Library application. Persistence is handled through the project storage API.

## 7. SDK Usage

### 7.1 In Browser

```html
<script type="module">
  import { parseCNL } from './src/index.mjs';
  const result = parseCNL('Anna is protagonist');
  console.log(result.valid);
</script>
```

### 7.2 In Node.js

```javascript
import { parseCNL } from './src/cnl-parser/cnl-parser.mjs';

const result = parseCNL('Anna is protagonist');
console.log(result.valid);
```

### 7.3 In Node.js (Full SDK Entrypoint)

```javascript
import SDK, { parseCNL } from './src/index-node.mjs';

const result = parseCNL('Anna is protagonist');
console.log(result.valid);
console.log(SDK.environment);
```

## 8. Configuration

The runtime grammar used by the CNL parser is defined in `src/cnl-parser/cnl-parser-grammar.mjs`. Reusable vocabularies are defined under `src/vocabularies/`. Additional generation, evaluation, and VSA behavior is configured through the relevant source modules.

---

This document defines the architecture overview for the current SCRIPTA workflow and implementation model.
