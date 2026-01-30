# DS18 SCRIPTA Use Case Deliverable (Draft)

## Executive Summary
SCRIPTA is a specification-driven, multi-agent co-creation system for creative writing inside the ACHILLES IDE. It aims to improve narrative coherence and author productivity while providing a compliance layer (auditability, bias/originality checks, explainability).

## Introduction
The rapid adoption of LLMs in creative writing creates risks around narrative quality, ethical integrity, and legal compliance. SCRIPTA addresses these by shifting from prompt-only generation to explicit specs, executable SOPs, continuous verification, and auditable provenance.

## Use Case Definition
See DS15 for actors, workflows, boundaries, and artifacts.

## Business and System Requirements
See DS01 (goals/scope), DS02 (API), DS06 (architecture).

## Non-functional Requirements
See DS01 and DS06 for performance/scalability/trustworthiness and observability.

## KPIs or Success Criteria
See DS01 (KPIs) and DS05 (evaluation suite).

## AI/ML Role in the System
See DS03 and DS06 for the division of responsibilities between generation, planning, verification, guardrails, and explainability.

## Relevant Stakeholders and Roles
See DS01 and DS15.

## Data Requirements
See DS07 for data categories, governance, provenance, and retention.

## ACHILLES Feature Alignment
See DS16.

## Validation Protocol
See DS08.

## References
See DS17.

## Traceability
See DS19 for requirement-to-API/test/eval mapping.

## Supporting Artifacts
- API schemas: docs/schemas/api/ (DS11)
- API examples: docs/examples/api/ (DS13)
- Evals (NL to CNL pairs): docs/evals/scripta_nl_cnl.jsonl
