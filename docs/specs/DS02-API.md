# DS02 API Specification — SCRIPTA

## 1. Overview
The SCRIPTA API provides a specification-driven workflow for creative writing, enabling planning, generation, verification, and compliance reporting via ACHILLES multi-agent orchestration.

## 2. API Principles
- Specification-first: all generation is tied to explicit SOPs and narrative specs.
- Auditable: every request produces traceable execution artifacts.
- Modular: agents are composable and replaceable.
- Deterministic controls: verification agents enforce constraints.

## 3. Services
- Spec Service: manage narrative specs and SOPs.
- Planning Service: derive story plans from user intent.
- Generation Service: produce prose from plans and specs.
- Verification Service: validate coherence and constraints.
- Guardrail Service: bias, originality, and plagiarism checks.
- Evaluation Service: compute metrics and KPIs.
- Audit Service: immutable logs and provenance.
- Orchestration Service: run pipelines and manage agents.
- CNL Service: convert natural language constraints into Controlled Natural Language (CNL).
- VSA Service: hyperdimensional indexing and semantic retrieval primitives.

## 4. Authentication & Authorization
- OAuth2 or API key for external clients.
- Role-based access: Author, Workflow Developer, Compliance Reviewer, Admin.
- All calls require tenant_id and project_id.

## 5. Core Data Models (Simplified)
- NarrativeSpec: id, title, synopsis, themes, constraints, characters, world_rules.
- SOP: id, name, version, steps[], inputs, outputs, policy_guardrails.
- Plan: id, spec_id, plot_graph, scenes[], goals, arcs.
- GenerationJob: id, plan_id, status, output_refs.
- VerificationReport: id, spec_id, checks[], violations[]
- AuditLogEntry: id, event_type, actor, timestamp, payload_hash
- ImplementationProfile: id, name, mode (basic|vsa), description, parameters

## 6. Endpoints (REST, versioned)
### 6.1 Specs & SOPs
- POST /v1/specs
- GET /v1/specs/{id}
- PUT /v1/specs/{id}
- POST /v1/sops
- GET /v1/sops/{id}
- POST /v1/sops/{id}:validate

### 6.2 Planning
- POST /v1/plans (input: spec_id, planning_params)
- GET /v1/plans/{id}

### 6.3 Generation
- POST /v1/generate (input: plan_id, scene_id, style, constraints)
- GET /v1/generate/{job_id}

### 6.4 Verification
- POST /v1/verify (input: spec_id, artifact_ref)
- GET /v1/verify/{report_id}

### 6.5 Guardrails
- POST /v1/guardrail/check (input: artifact_ref, policies)
- GET /v1/guardrail/report/{id}

### 6.6 Evaluation
- POST /v1/evaluate (input: artifact_ref, metrics[])
- GET /v1/evaluate/{id}

### 6.7 Audit
- GET /v1/audit/logs?project_id=...
- GET /v1/audit/logs/{id}

### 6.8 Orchestration
- POST /v1/pipelines/run (input: sop_id, spec_id)
- GET /v1/pipelines/{run_id}

### 6.9 CNL
- POST /v1/cnl/translate (input: nl_text, context)
- POST /v1/cnl/validate (input: cnl_text)

### 6.10 VSA
- POST /v1/vsa/encode (input: text, schema)
- POST /v1/vsa/index (input: vectors[], ids[])
- POST /v1/vsa/search (input: query_vector, top_k)

## 7. Async Job Model
Long operations return job_id with status: queued, running, completed, failed. Clients can poll or subscribe to events (SSE/webhook).

## 8. Implementation Profiles (Basic vs VSA/HDC)
All algorithmic endpoints accept an optional implementation_profile parameter:
- basic: conventional embeddings or rule-based heuristics.
- vsa: hyperdimensional representations (VSA/HDC) for semantic indexing, binding, and similarity.
Default behavior is basic unless a VSA profile is specified. Reports include the profile used for reproducibility.

## 9. Error Model
Standard error format:
- code, message, details, correlation_id

## 10. Versioning & Compatibility
- Semantic versioning by /v1, /v2.
- SOP version pinning for reproducibility.

## 11. Security & Compliance
- Audit logs immutable and signed.
- PII redaction hooks.
- Provenance tags embedded in outputs.

## 12. Observability
- Tracing per pipeline run.
- Per-agent latency, token usage, and verification outcomes.

## 13. Open Questions
- Final SOP Lang schema for specs and plan graphs.
- Licensing strategy for external corpora used in guardrails.
- Formal verification engine interface.
- CNL grammar standardization and validation rules.
- VSA/HDC vector dimensionality and binding operators selection.

## 14. JSON Schemas
Detailed request/response schemas are defined in docs/schemas/api/ (see DS11).
