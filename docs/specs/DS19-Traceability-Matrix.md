# DS19 Traceability Matrix — Requirements ↔ APIs ↔ Tests ↔ Evals

## 1. Purpose
Provide a traceability matrix from SCRIPTA requirements (derived from the Use Case Deliverable) to:
- DS specifications
- API endpoints and JSON Schemas
- API examples
- Test coverage
- Evaluation examples (NL↔CNL)

## 2. Requirement ID Scheme
- BR-XX: Business requirement
- SR-XX: System (functional) requirement
- NFR-XX: Non-functional requirement

Status:
- Specified: described in DS files
- Implemented (stub): exists in code as a minimal dependency-free prototype
- Implemented (real): real algorithmic capability exists (not yet the case for most agents)

## 3. Traceability Entries

### BR-01 — Augmented Creativity / Productivity
- Description: Reduce time to reach a publishable draft while preserving human creative agency.
- DS: DS01, DS03, DS04, DS05
- API: /v1/plans, /v1/generate, /v1/review
- Schemas: plan.json, generate.json, review.json
- Examples: create_plan_*, generate_*, review_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_062, eval_070, eval_071
- Status: Specified; Implemented (stub)

### BR-02 — Compliance Layer (Legal/Ethical Risk Mitigation)
- Description: Provide compliance checks and evidence artifacts for due diligence.
- DS: DS07, DS08, DS05
- API: /v1/guardrail/check, /v1/reports/compliance, /v1/audit/logs
- Schemas: guardrail.json, reports.json, audit.json, common.json(ErrorResponse)
- Examples: guardrail_*, compliance_report_*, audit_*, *_error_*.json
- Tests: tests/tests.mjs:testExamplesValidatorCli, testServerEndpoints
- Evals: eval_004, eval_009, eval_056, eval_063, eval_066, eval_077, eval_082, eval_083, eval_093, eval_100
- Status: Specified; Implemented (stub)

### SR-01 — Specification-First Authoring
- Description: All generation and verification are bound to an explicit NarrativeSpec.
- DS: DS01, DS02, DS06
- API: POST /v1/specs, GET /v1/specs/{id}
- Schemas: spec.json
- Examples: create_spec_*, get_spec_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_001, eval_005, eval_015
- Status: Specified; Implemented (stub)

### SR-02 — Executable SOPs (Workflow Orchestration)
- Description: SOPs define multi-step procedures to orchestrate agents.
- DS: DS02, DS06, DS16
- API: POST /v1/sops, GET /v1/sops/{id}, POST /v1/pipelines/run, GET /v1/pipelines/{run_id}
- Schemas: sop.json, pipeline.json
- Examples: create_sop_*, get_sop_*, pipeline_run_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_085, eval_086
- Status: Specified; Implemented (stub)

### SR-03 — Planning (Plan-and-Write)
- Description: Generate a Plan (plot graph + scenes) from the spec.
- DS: DS04, DS06
- API: POST /v1/plans, GET /v1/plans/{id}
- Schemas: plan.json
- Examples: create_plan_*, get_plan_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_062
- Status: Specified; Implemented (stub)

### SR-04 — Narrative Generation (Scene-Level)
- Description: Generate prose scene-by-scene based on Plan + constraints.
- DS: DS02, DS04, DS06
- API: POST /v1/generate, GET /v1/generate/{job_id}
- Schemas: generate.json
- Examples: generate_*, get_generate_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_006, eval_028
- Status: Specified; Implemented (stub)

### SR-05 — Verification (Coherence & Consistency)
- Description: Check output against specs and reduce plot holes and character drift.
- DS: DS05, DS04, DS06
- API: POST /v1/verify, GET /v1/verify/{report_id}
- Schemas: verify.json
- Examples: verify_*, get_verify_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_018, eval_061, eval_073
- Status: Specified; Implemented (stub)

### SR-06 — Guardrails (Bias, Originality, Copyright)
- Description: Detect/flag violations and provide findings.
- DS: DS05, DS07
- API: POST /v1/guardrail/check, GET /v1/guardrail/report/{id}
- Schemas: guardrail.json
- Examples: guardrail_*, get_guardrail_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_019, eval_048, eval_066, eval_082, eval_093
- Status: Specified; Implemented (stub)

### SR-07 — Reverse Engineering
- Description: Extract specs/plans from existing text artifacts.
- DS: DS02, DS06
- API: POST /v1/reverse-engineer
- Schemas: reverse.json
- Examples: reverse_engineer_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_051, eval_052, eval_053, eval_097
- Status: Specified; Implemented (stub)

### SR-08 — Literary Review
- Description: Provide editorial feedback (pacing, clarity, etc.).
- DS: DS02, DS05
- API: POST /v1/review
- Schemas: review.json
- Examples: review_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_054, eval_055, eval_096
- Status: Specified; Implemented (stub)

### SR-09 — Research Support
- Description: Provide factual research with provenance that can be used in narrative/tutorial outputs.
- DS: DS02, DS07
- API: POST /v1/research/query
- Schemas: research.json
- Examples: research_query_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_041, eval_044
- Status: Specified; Implemented (stub)

### SR-10 — Explainability
- Description: Provide explanations and evidence for suggestions/violations.
- DS: DS02, DS05
- API: POST /v1/explain
- Schemas: explain.json
- Examples: explain_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_058, eval_084
- Status: Specified; Implemented (stub)

### SR-11 — Compliance Reporting
- Description: Produce consolidated compliance reports and link them to audit evidence.
- DS: DS07, DS08
- API: POST /v1/reports/compliance
- Schemas: reports.json
- Examples: compliance_report_*
- Tests: tests/tests.mjs:testServerEndpoints
- Evals: eval_056, eval_077, eval_100
- Status: Specified; Implemented (stub)

### SR-12 — Audit Log & Provenance
- Description: Capture pipeline runs and key events for traceability.
- DS: DS07, DS06
- API: GET /v1/audit/logs, GET /v1/audit/logs/{id}
- Schemas: audit.json
- Examples: audit_log_*
- Tests: scripts/validate_examples.mjs + tests/tests.mjs:testExamplesValidatorCli
- Evals: eval_057, eval_086
- Status: Specified; Implemented (stub)

### SR-13 — Controlled Natural Language (CNL)
- Description: Translate NL constraints to CNL and validate them.
- DS: DS09
- API: POST /v1/cnl/translate, POST /v1/cnl/validate
- Schemas: cnl.json
- Examples: cnl_translate_*, cnl_validate_*
- Tests: tests/tests.mjs:testCnlValidator, testEvalExamplesCnl
- Evals: all evals in docs/evals/scripta_nl_cnl.jsonl
- Status: Specified; Implemented (prototype validator + stub translate)

### SR-14 — VSA/HDC Retrieval & Indexing
- Description: Provide semantic indexing/retrieval primitives with a VSA/HDC option.
- DS: DS10, DS12
- API: POST /v1/vsa/encode, /v1/vsa/index, /v1/vsa/search
- Schemas: vsa.json
- Examples: vsa_*
- Tests: tests/tests.mjs:testVsaEncoderDeterministic
- Evals: eval_059, eval_060, eval_094, eval_095
- Status: Specified; Implemented (prototype)

### SR-15 — Evaluation Suite
- Description: Compute and track KPIs/metrics.
- DS: DS05
- API: POST /v1/evaluate, GET /v1/evaluate/{id}
- Schemas: evaluate.json
- Examples: evaluate_*, get_evaluate_*
- Tests: scripts/validate_examples.mjs
- Evals: eval_045, eval_090, eval_091
- Status: Specified; Implemented (stub)

### NFR-01 — Performance (Near Real-Time Feedback)
- Description: Near real-time feedback for interactive authoring.
- DS: DS06
- Evidence: Observability plan exists; no benchmarks yet.
- Tests: (none)
- Status: Specified; Not implemented

### NFR-02 — Scalability (Long-Form Authoring)
- Description: Support short and long-form narratives without unacceptable degradation.
- DS: DS06
- Evidence: Architectural intent; missing load tests.
- Tests: (none)
- Status: Specified; Not implemented

### NFR-03 — Security (AuthN/AuthZ)
- Description: Role-based access and tenant isolation.
- DS: DS02
- Evidence: API requirement stated; not implemented in stub.
- Tests: (none)
- Status: Specified; Not implemented

### NFR-04 — Reproducibility
- Description: Version pinning and parameter logging for repeatability.
- DS: DS02, DS10, DS12
- Evidence: implementation_profile exists in schemas; audit logging exists as stub.
- Tests: tests/tests.mjs:testExamplesValidatorCli
- Status: Specified; Implemented (partial/stub)

## 4. How to Use This Matrix
- When adding a new capability:
  1) add/adjust requirement(s)
  2) update DS specs
  3) add schemas + examples
  4) add tests
  5) add eval cases (NL + CNL)
