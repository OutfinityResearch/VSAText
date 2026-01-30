# DS16 ACHILLES Feature Alignment — SCRIPTA

## 1. Purpose
Provide a traceability-style alignment between SCRIPTA requirements and ACHILLES platform features.

## 2. Alignment Matrix

| ACHILLES Feature | SCRIPTA Requirement | Evidence in Repo | Notes |
|---|---|---|---|
| SOP Lang (Executable SOPs) | Specification-first, reproducible workflows | DS02 API, DS06 Architecture | SOP schema exists; real SOP execution is currently stubbed. |
| Specification-Driven Structure | Encode plot, characters, constraints as formal artifacts | DS01 Vision, DS02 API, spec.json/plan.json | Specs/plans modeled and validated via schemas. |
| MAS Orchestration | Modular multi-agent pipeline with replaceable components | DS06 Architecture, DS02 pipelines | Pipeline APIs exist; server provides a stub runner. |
| IDE as Compliance Layer | Built-in auditability and compliance reporting | DS07 Data Governance, DS02 Audit + Reports | Audit schemas + compliance report schemas; algorithms are stubs. |
| Immutable Audit Log | Trace provenance of contributions and decisions | audit.json + examples + server stub | Cryptographic immutability not implemented in stub. |
| Formal Verification Engine Integration | Enforce narrative constraints, reduce drift | DS05 Evaluation Suite, DS02 verify | Verification exists as API surface; formal proof artifacts not defined yet. |
| Trustworthy AI Modules (WP1/WP4) | Bias and stereotype mitigation | DS05 metrics, guardrail API | Detection/scoring models are placeholders; evals include bias constraints. |
| XAI Methods (WP5) | Explain suggestions and violations | DS02 explain, explain.json + examples | Explain endpoint exists; needs evidence linking to audit artifacts. |
| Efficient Inference (WP3) | Near real-time feedback | DS06 Observability | Targets and benchmarking plan needed. |

## 3. Gaps to Close
- Formal verification artifacts: define constraint language, proof/violation objects, and storage.
- Audit log integrity: define signing, hashing, and retention rules.
- Concrete KPI-feature traceability: add requirement IDs and link to eval datasets.
