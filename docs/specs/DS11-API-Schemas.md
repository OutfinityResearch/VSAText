# DS11 API JSON Schemas — SCRIPTA

## 1. Purpose
Provide JSON Schemas for SCRIPTA API requests and responses to enable validation, client generation, and auditability.

## 2. Location
Schemas are stored in `docs/schemas/api/`.

## 3. Schema Set
- `common.json` — shared types (IDs, audit, job status, implementation profile).
- `spec.json` — NarrativeSpec requests/responses.
- `sop.json` — SOP requests/responses.
- `plan.json` — plan creation and retrieval.
- `generate.json` — generation job requests/responses.
- `verify.json` — verification requests/responses.
- `guardrail.json` — guardrail check requests/responses.
- `evaluate.json` — evaluation requests/responses.
- `pipeline.json` — pipeline run requests/responses.
- `reverse.json` — reverse engineering requests/responses.
- `review.json` — literary review requests/responses.
- `research.json` — research query requests/responses.
- `explain.json` — explainability requests/responses.
- `reports.json` — compliance report requests/responses.
- `cnl.json` — CNL translate/validate requests/responses.
- `vsa.json` — VSA encode/index/search requests/responses.
- `audit.json` — audit log responses.

## 4. Versioning
- Schemas are aligned to API `/v1` and use JSON Schema Draft 2020-12.
- Each schema should be updated alongside API changes.

## 5. Implementation Profiles
All algorithmic requests accept `implementation_profile` with `mode: basic | vsa`.

## 6. Usage
- Validate requests before execution.
- Validate responses before persistence.
- Persist the schema version in audit logs.
- Example validation script: scripts/validate_examples.mjs
- Example stub generator: scripts/generate_example_stub.mjs
