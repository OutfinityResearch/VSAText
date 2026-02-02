# DS02 — System Architecture and API Specification

## 1. Architectural Philosophy

SCRIPTA follows a **browser-first architecture** where:

- **All processing happens in the browser** (CNL parsing, validation, metrics calculation)
- **Server is minimal** - only provides persistence (save/load projects)
- **API is high-level** - focused on projects and quality metrics, not implementation details

This design enables offline-capable editing, reduces server complexity, and keeps the author's creative data local.


## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Story Forge UI                                ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       ││
│  │  │   CNL     │ │  Metrics  │ │ Validator │ │  Editor   │       ││
│  │  │  Parser   │ │  Engine   │ │           │ │           │       ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       ││
│  │                         │                                        ││
│  │  ┌─────────────────────────────────────────────────────────────┐││
│  │  │              Project State (JSON)                           │││
│  │  │  { cnl_text, ast, entities, groups, metrics, generated }    │││
│  │  └─────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────┬────────────────────────────────┘
                                     │ Save/Load only
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVER                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                 Persistence Layer                                ││
│  │  POST /v1/projects      - Save project                          ││
│  │  GET  /v1/projects      - List projects                         ││
│  │  GET  /v1/projects/:id  - Load project                          ││
│  │  DELETE /v1/projects/:id - Delete project                       ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              JSON File Storage (/data)                          ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```


## 3. Project Data Model

A project is a single JSON document containing everything:

```json
{
  "id": "proj_abc123",
  "name": "The Storm Within",
  "created_at": "2024-01-15T10:00:00Z",
  "modified_at": "2024-01-15T12:00:00Z",
  
  "metadata": {
    "author": "Jane Doe",
    "genre": "Fantasy",
    "target_words": 80000,
    "themes": ["courage", "family", "redemption"],
    "tone": "hopeful"
  },
  
  "cnl": {
    "version": "1.0",
    "text": "... raw CNL text ...",
    "ast": { ... parsed AST ... }
  },
  
  "entities": {
    "characters": [...],
    "locations": [...],
    "objects": [...],
    "themes": [...]
  },
  
  "structure": {
    "groups": [...],
    "references": [...]
  },
  
  "generated": {
    "content": { ... generated text by group ... },
    "last_generated": "2024-01-15T11:00:00Z"
  },
  
  "metrics": {
    "last_evaluated": "2024-01-15T11:30:00Z",
    "scores": {
      "nqs": 0.78,
      "coherence": 0.85,
      "cad": 0.12,
      "car": 0.99,
      "originality": 0.82,
      "cpsr": 0.96,
      "csa": 0.98
    },
    "details": { ... }
  }
}
```


## 4. Quality Metrics

### 4.1 Core Metrics

| Metric | Code | Range | Target | Description |
|--------|------|-------|--------|-------------|
| **Narrative Quality Score** | NQS | 0-1 | >0.75 | Composite quality score combining coherence, constraints, and structure |
| **Coherence Score** | CS | 0-1 | >0.75 | Entity-based coherence + causal chain verification |
| **Character Attribute Drift** | CAD | 0-1 | <0.15 | Cosine distance between defined and inferred traits |
| **Compliance Adherence Rate** | CAR | 0-1 | >0.99 | Percentage passing ethical/legal guardrails |
| **Originality Index** | OI | 0-1 | >0.80 | Semantic distance from known tropes |
| **Emotional Arc Profile** | EAP | 0-1 | >0.70 | Correlation with target emotional trajectory |
| **Retrieval Quality** | RQ | 0-1 | >0.60 | Mean reciprocal rank for semantic search |
| **CNL Parse Success Rate** | CPSR | 0-1 | >0.95 | Parser success rate on input |
| **Constraint Satisfaction Accuracy** | CSA | 0-1 | >0.98 | Percentage of CNL constraints satisfied |

### 4.2 Metric Calculation (Browser-side)

All metrics are calculated in the browser using the project's CNL AST and generated content:

```javascript
// Example: Calculate CAD
function calculateCAD(entities, generatedContent) {
  let totalDrift = 0;
  let count = 0;
  
  for (const char of entities.characters) {
    const definedTraits = char.traits;
    const inferredTraits = extractTraitsFromText(generatedContent, char.name);
    const drift = cosineDrift(definedTraits, inferredTraits);
    totalDrift += drift;
    count++;
  }
  
  return count > 0 ? totalDrift / count : 0;
}
```


## 5. REST API Specification

### 5.1 Design Principles

- **Minimal endpoints** - only what server must do (persistence)
- **Project-centric** - projects are atomic units, no sub-resource endpoints
- **No authentication** - handled at infrastructure layer
- **Stateless** - no sessions

### 5.2 Endpoints

#### Projects (Persistence)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/projects` | List all projects (metadata only) |
| `POST` | `/v1/projects` | Create/save project |
| `GET` | `/v1/projects/:id` | Load full project |
| `PUT` | `/v1/projects/:id` | Update project |
| `DELETE` | `/v1/projects/:id` | Delete project |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |


### 5.3 Request/Response Examples

#### List Projects

```http
GET /v1/projects
```

```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "name": "The Storm Within",
      "genre": "Fantasy",
      "modified_at": "2024-01-15T12:00:00Z",
      "metrics_summary": { "nqs": 0.78 }
    },
    {
      "id": "proj_def456",
      "name": "Murder at Midnight",
      "genre": "Mystery",
      "modified_at": "2024-01-14T09:00:00Z",
      "metrics_summary": { "nqs": 0.82 }
    }
  ]
}
```

#### Save Project

```http
POST /v1/projects
Content-Type: application/json

{
  "name": "The Storm Within",
  "metadata": { ... },
  "cnl": { "text": "...", "ast": {...} },
  "entities": { ... },
  "structure": { ... },
  "generated": { ... },
  "metrics": { ... }
}
```

```json
{
  "id": "proj_abc123",
  "saved_at": "2024-01-15T12:00:00Z"
}
```

#### Load Project

```http
GET /v1/projects/proj_abc123
```

```json
{
  "project": {
    "id": "proj_abc123",
    "name": "The Storm Within",
    ... full project data ...
  }
}
```


## 6. Browser-Side Components

### 6.1 CNL Parser

Parses CNL text into AST:

```javascript
class CNLParser {
  parse(text) → { entities, groups, statements, errors }
  validate(ast) → { valid, errors, warnings }
  serialize(ast) → string
}
```

### 6.2 Metrics Engine

Calculates all quality metrics:

```javascript
class MetricsEngine {
  calculateAll(project) → MetricsReport
  calculateNQS(project) → number
  calculateCoherence(project) → number
  calculateCAD(project) → number
  calculateCAR(project) → number
  calculateOriginality(project) → number
  calculateEAP(project) → number
  calculateCSPR(project) → number
  calculateCSA(project) → number
}
```

### 6.3 Content Generator

Generates narrative content from CNL spec:

```javascript
class ContentGenerator {
  generateGroup(group, context) → string
  generateAll(project) → { [groupId]: string }
}
```

### 6.4 Reference Resolver

Resolves cross-references in CNL:

```javascript
class ReferenceResolver {
  resolve(reference, scope, project) → Entity | Group | null
  validateReferences(project) → { valid, unresolved }
}
```


## 7. Data Flow

### 7.1 Editing Flow

```
User edits CNL text
       ↓
CNL Parser validates & builds AST
       ↓
Reference Resolver checks @references
       ↓
UI updates entity/group views
       ↓
Auto-save to local storage (optional)
```

### 7.2 Generation Flow

```
User clicks "Generate"
       ↓
Content Generator processes groups
       ↓
Generated content stored in project.generated
       ↓
Metrics Engine calculates scores
       ↓
UI displays content + metrics
```

### 7.3 Save/Load Flow

```
User clicks "Save"
       ↓
Browser serializes full project JSON
       ↓
POST /v1/projects → Server
       ↓
Server stores in /data/projects.json
       ↓
Response with project ID
```


## 8. Error Handling

### 8.1 API Errors

```json
{
  "error": {
    "code": "not_found",
    "message": "Project not found",
    "details": { "id": "proj_invalid" }
  }
}
```

| Code | HTTP | Description |
|------|------|-------------|
| `not_found` | 404 | Resource doesn't exist |
| `invalid_data` | 422 | Malformed project data |
| `storage_error` | 500 | Failed to persist |

### 8.2 CNL Parsing Errors

Returned in AST, not via API:

```json
{
  "ast": null,
  "errors": [
    { "line": 5, "message": "Unclosed group: Chapter1", "severity": "error" },
    { "line": 12, "message": "Unknown reference: @Chapter3", "severity": "warning" }
  ]
}
```


## 9. Storage Format

### 9.1 Server Storage

Single JSON file per project in `/data/`:

```
/data/
  projects/
    proj_abc123.json
    proj_def456.json
  index.json  (project list with metadata only)
```

### 9.2 Browser Storage

Projects can be cached in localStorage for offline work:

```javascript
localStorage.setItem('scripta_project_abc123', JSON.stringify(project));
localStorage.setItem('scripta_current', 'proj_abc123');
```


## 10. Future Considerations

### 10.1 Potential Additions

- WebSocket for real-time collaboration
- Export to various formats (Markdown, DOCX, Fountain)
- Import from existing manuscripts
- Version history / undo stack
- Project templates

### 10.2 Scaling Path

For larger deployments:
- Replace file storage with database
- Add CDN for static assets
- Implement proper backup/restore
