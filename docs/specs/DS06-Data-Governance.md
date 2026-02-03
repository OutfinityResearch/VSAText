# DS06 — Data Governance and Storage

## 1. Data Categories and Ownership

The SCRIPTA system handles multiple categories of data with different storage requirements. Clear categorization is essential for maintaining data integrity and providing a consistent user experience.

### 1.1 Data Categories

| Category | Description | Owner | Storage |
|----------|-------------|-------|---------|
| Projects | Story project configurations (all-in-one) | Author | projects/{id}.json |
| Audit Log | Operation history | System | audit.json |


## 2. Storage Architecture

### 2.1 File-Based Persistence

SCRIPTA uses a simple JSON file-based storage system for maximum portability and zero external dependencies. All data is stored in the `/data` directory.

```
data/
├── projects.json       # Story projects
├── characters.json     # Character library
├── locations.json      # Location library
├── specs.json          # Narrative specifications
├── plans.json          # Generated plans
├── drafts.json         # Generated content
├── evaluation_reports.json
├── verify_reports.json
├── guardrail_reports.json
├── reviews.json
├── audit.json          # Immutable audit log
└── vsa_index.json      # Semantic search index
```

### 2.2 JsonStore Implementation

Each store provides:
- **get(id)**: Retrieve item by ID
- **set(id, value)**: Create or update item
- **delete(id)**: Remove item
- **values()**: Get all items
- **filter(predicate)**: Query items
- **find(predicate)**: Find single item

All modifications are immediately persisted to disk with in-memory caching for read performance.


## 3. Data Structures

### 3.1 Project Structure

```json
{
  "id": "proj_abc123",
  "title": "The Storm Within",
  "format": "novel",
  "synopsis": "A story about courage",
  "pattern": "three_act",
  "elements": {
    "characters": ["char_id1", "char_id2"],
    "locations": ["loc_id1"],
    "themes": ["courage", "family"],
    "tone": "hopeful"
  },
  "cnl_constraints": "Anna is protagonist\\nAnna has trait courageous",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

### 3.2 Character Structure

```json
{
  "id": "char_abc123",
  "name": "Anna",
  "archetype": "hero",
  "traits": ["courageous", "determined", "protective"],
  "goals": [
    { "action": "protect", "target": "brother" }
  ],
  "relationships": [
    { "character": "char_xyz789", "type": "sibling" }
  ],
  "backstory": "Grew up in a coastal village...",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### 3.3 Plan Structure

```json
{
  "id": "plan_abc123",
  "project_id": "proj_abc123",
  "structure": "three_act",
  "scenes": [
    {
      "id": "scene_001",
      "number": 1,
      "act": "act_1",
      "act_name": "Setup",
      "type": "introduction",
      "summary": "Introduce protagonist and their world",
      "characters": ["Anna"],
      "estimated_words": 750
    }
  ],
  "arcs": [...],
  "metadata": {
    "total_scenes": 9,
    "estimated_words": 25000,
    "character_count": 2
  },
  "created_at": "2024-01-15T10:00:00Z"
}
```

### 3.4 Draft Structure

```json
{
  "id": "draft_abc123",
  "plan_id": "plan_abc123",
  "scene_id": "scene_001",
  "content": "The salt-laden wind whipped through Anna's hair...",
  "word_count": 847,
  "created_at": "2024-01-15T10:00:00Z"
}
```


## 4. Audit Logging

### 4.1 Audit Entry Structure

```json
{
  "id": "audit_abc123",
  "timestamp": "2024-01-15T10:00:00Z",
  "event": "project.created",
  "actor": "system",
  "payload": { "project_id": "proj_abc123" },
  "previous_hash": "...",
  "signature": "..."
}
```

### 4.2 Audit Events

| Event | Description |
|-------|-------------|
| project.created | New project created |
| spec.created | Specification created |
| plan.created | Plan generated |
| generate.started | Content generation started |
| generate.completed | Content generation finished |
| verify.completed | Verification check completed |
| guardrail.completed | Guardrail check completed |
| evaluate.completed | Evaluation completed |
| review.completed | Literary review completed |

### 4.3 Chain Integrity

Audit entries are cryptographically chained:
- Each entry includes hash of previous entry
- Chain verification detects tampering
- API endpoint `/v1/audit/verify` checks chain integrity


## 5. Data Retention

### 5.1 Retention Policy

| Category | Default Retention | Notes |
|----------|-------------------|-------|
| Projects | Indefinite | Until author deletes |
| Characters | Indefinite | Reusable across projects |
| Locations | Indefinite | Reusable across projects |
| Plans | With project | Deleted when project deleted |
| Drafts | With project | Deleted when project deleted |
| Reports | 90 days | Auto-cleanup after period |
| Audit Logs | 1 year | Required for compliance |

### 5.2 Deletion Behavior

When a project is deleted:
1. Project record is removed
2. Associated plans are deleted
3. Associated drafts are deleted
4. Reports referencing project are marked for cleanup
5. Audit entries are preserved (payload anonymized)


## 6. Configuration

### 6.1 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SCRIPTA_DATA_DIR | ./data | Storage directory path |

### 6.2 Customization

The storage directory can be changed by setting the `SCRIPTA_DATA_DIR` environment variable:

```bash
SCRIPTA_DATA_DIR=/path/to/storage node demo/server.mjs
```
