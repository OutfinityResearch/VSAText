# DS02 — System Architecture

## Browser-First Design

SCRIPTA runs primarily in the browser. All CNL parsing, validation, and metrics calculation happens client-side. The server exists only to save and load projects as JSON files.

This design means the application works offline, keeps author data local, and requires minimal server infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     BROWSER                          │
│  ┌─────────────────────────────────────────────────┐│
│  │ Story Forge UI                                  ││
│  │  CNL Parser → Metrics Engine → Validator        ││
│  │                     ↓                           ││
│  │         Project State (JSON in memory)          ││
│  └──────────────────────┬──────────────────────────┘│
└─────────────────────────┼───────────────────────────┘
                          │ Save/Load
                          ▼
┌─────────────────────────────────────────────────────┐
│                     SERVER                           │
│  /v1/projects (CRUD) → JSON files in /data/projects │
└─────────────────────────────────────────────────────┘
```

## Project Data Model

A project is a single JSON document containing all narrative data:

```json
{
  "id": "proj_abc123",
  "name": "The Storm Within",
  "metadata": {
    "author": "Jane Doe",
    "genre": "Fantasy",
    "themes": ["courage", "family"],
    "tone": "hopeful"
  },
  "cnl": {
    "text": "Anna is protagonist\nAnna has trait courage",
    "ast": { }
  },
  "entities": {
    "characters": [...],
    "locations": [...]
  },
  "structure": {
    "groups": [...]
  },
  "metrics": {
    "scores": { "nqs": 0.78, "coherence": 0.85, "cad": 0.12 }
  }
}
```

## REST API

The server provides only these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/projects` | List all projects |
| POST | `/v1/projects` | Save new project |
| GET | `/v1/projects/:id` | Load project |
| PUT | `/v1/projects/:id` | Update project |
| DELETE | `/v1/projects/:id` | Delete project |
| GET | `/health` | Health check |

No authentication is built in. Handle that at the infrastructure layer if needed.

## Browser Components

The browser loads these JavaScript modules:

**CNL Parser** - Parses CNL text into an AST with entities, groups, and constraints.

**Metrics Engine** - Calculates quality scores (NQS, coherence, CAD, etc.) from the AST and any generated content.

**Reference Resolver** - Validates that @references in CNL point to existing entities.

All modules are ES6 and work in both browser and Node.js.

## Data Flow

**Editing:** User edits → Parser validates → AST updates → UI refreshes

**Saving:** Browser serializes project JSON → POST to server → Server writes file

**Loading:** GET from server → Browser receives JSON → Parser rebuilds AST

## Error Handling

API errors return JSON with code and message:

```json
{
  "error": {
    "code": "not_found",
    "message": "Project not found"
  }
}
```

CNL parsing errors are returned in the parse result, not through the API.

## Storage

Projects are stored as individual JSON files in `/data/projects/`:

```
/data/projects/
  proj_abc123.json
  proj_def456.json
```

Browser can cache projects in localStorage for offline work.
