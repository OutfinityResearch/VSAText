# DS02 — System Architecture and API Specification

## 1. Architectural Overview

SCRIPTA is designed as a modular multi-agent system operating within the ACHILLES IDE environment. The architecture follows a pipeline flow where data passes through successive processing stages, each stage managed by a specialized agent or service.

The main system flow begins with the author defining a narrative specification. This specification contains characters, world rules, tone constraints, and desired narrative structure. The specification is then processed by a planning agent that generates a structured narrative plan, including the plot graph and scene list. Based on this plan, generation agents produce the actual text, scene by scene. The generated text passes through verification agents that compare it against the original specification, detecting any inconsistencies or constraint violations. Guardrail agents analyze the text for bias issues, originality, and potential plagiarism. Finally, the system produces compliance reports and records all operations in an immutable audit log.

This separation of responsibilities offers several advantages. Each agent can be developed, tested, and optimized independently. A verification agent can use deterministic rules, while a generation agent can use probabilistic models. Replacing an agent with an improved version does not affect the rest of the system as long as interfaces remain stable.

The main system components are the Spec Manager for CRUD operations on specifications and SOPs, the Planning Agent for converting creative intent into plot graphs, Generation Agents for producing text scene by scene, Verification Agents for validating coherence and consistency, Guardrail Agents for bias, originality and copyright checks, the Evaluation Engine for metrics computation and dashboards, the Audit Logger for immutable storage of events and provenance, the CNL Translator for converting natural language constraints to controlled format, and the VSA/HDC Module for hyperdimensional representations and semantic search.


## 2. Data Model and Core Entities

The system operates with a set of interconnected data entities representing the various artifacts of the creative process. Understanding these entities is essential for API usage.

The following table presents the main entities, their role in the system, and their relationships.

| Entity | Description | Relationships |
|--------|-------------|---------------|
| NarrativeSpec | The narrative specification containing title, synopsis, themes, characters, world rules, and CNL constraints | Referenced by Plan and verification reports |
| SOP | Standard Operating Procedure defining workflow steps, inputs, outputs, and guardrail policies | Orchestrates pipeline execution |
| Plan | The narrative plan generated from specification, containing plot graph, scene list, objectives, and narrative arcs | References a NarrativeSpec; used by GenerationJob |
| GenerationJob | The generation task with status (queued, running, completed, failed) and references to results | References a Plan; produces Draft artifacts |
| VerificationReport | The verification report containing list of checks performed and violations detected | References a NarrativeSpec and an artifact |
| AuditLogEntry | Audit log entry with event type, actor, timestamp, and payload hash | Records all system operations |
| ImplementationProfile | The implementation profile specifying algorithmic mode (basic or vsa) and parameters | Attached to requests for reproducibility |

The term "CRUD" is an acronym for Create, Read, Update, Delete, representing the four fundamental data manipulation operations. "SOP" (Standard Operating Procedure) means a standardized procedure defining the exact steps to follow to accomplish a task. In SCRIPTA's context, SOPs are written in SOP Lang, a declarative language specific to ACHILLES, and define how agents collaborate to produce a result.


## 3. REST API Specification

The SCRIPTA API follows REST principles and is organized by services corresponding to the main system functionalities. All endpoints use the version prefix /v1/ to allow API evolution without affecting existing clients.

The following table presents the main endpoints grouped by service, with accepted HTTP methods and functionality description.

| Service | Endpoint | Method | Functionality |
|---------|----------|--------|---------------|
| Specs | /v1/specs | POST | Creates a new narrative specification |
| Specs | /v1/specs/{id} | GET, PUT | Reads or updates an existing specification |
| Planning | /v1/plans | POST | Generates a narrative plan from a specification |
| Planning | /v1/plans/{id} | GET | Reads an existing plan |
| Generation | /v1/generate | POST | Starts a text generation task |
| Generation | /v1/generate/{job_id} | GET | Checks status of a generation task |
| Verification | /v1/verify | POST | Verifies an artifact against specification |
| Guardrail | /v1/guardrail/check | POST | Runs compliance checks |
| Evaluation | /v1/evaluate | POST | Computes quality metrics |
| Review | /v1/review | POST | Gets automated editorial feedback |
| Research | /v1/research/query | POST | Queries the knowledge base |
| Explainability | /v1/explain | POST | Generates explanations for decisions |
| Compliance | /v1/reports/compliance | POST | Generates compliance report |
| Audit | /v1/audit/logs | GET | Lists audit log entries |
| CNL | /v1/cnl/translate | POST | Translates natural language to CNL |
| CNL | /v1/cnl/validate | POST | Validates CNL text |
| VSA | /v1/vsa/encode | POST | Encodes text into hypervector |
| VSA | /v1/vsa/search | POST | Searches the hyperdimensional index |

Long-running operations (generation, evaluation, pipelines) return a job identifier with status that can be periodically queried. Clients can use polling or subscribe to events through Server-Sent Events (SSE) for real-time notifications.

The error format is standardized across all endpoints and includes an error code, descriptive message, additional details, and a correlation identifier for debugging. HTTP codes used are 200 for success, 201 for successful creation, 400 for invalid request, 401 for missing authentication, 403 for insufficient authorization, 404 for nonexistent resource, and 422 for semantically invalid data.


## 4. Authentication, Implementation Profiles, and Auditability

API security relies on authentication through API keys transmitted in the x-api-key header. The system supports four roles with different permissions: Author for creation and generation operations, Workflow Developer for defining and modifying SOPs, Compliance Reviewer for access to reports and audit logs, and Admin for system administration and API key management.

All algorithmic requests accept an optional implementation_profile parameter specifying the desired implementation variant. The value "basic" selects conventional implementations based on embeddings and rules, while "vsa" selects implementations based on hyperdimensional computing. If the parameter is missing, the system uses the basic variant. The selected profile is recorded in the audit log for reproducibility.

The audit log captures all significant system operations. Each entry contains the event type, actor identity (user or agent), precise timestamp, cryptographic hash of input and output data, and references to involved artifacts. The log is designed to be immutable, meaning entries once written cannot be modified or deleted. This immutability is essential for legal compliance, providing incontestable evidence of the creative process.

System observability includes distributed tracing for each pipeline execution, latency and error metrics per agent, token consumption and cost tracking, and performance comparison between basic and VSA variants. This data enables identifying performance bottlenecks, optimizing resource allocation, and empirically validating different algorithmic approaches.


## 5. Repository Structure and Code Organization

The SCRIPTA source code is organized to reflect the modular system architecture. The docs/specs/ directory contains design specifications (DS documents). The docs/schemas/api/ directory contains JSON schemas for validating API requests and responses. The docs/examples/api/ directory contains concrete examples of requests and responses for each endpoint.

The src/ directory contains the actual implementations. The src/services/ subdirectory includes API services for specifications, plans, verification, guardrails, and audit. The src/cnl/ subdirectory contains the CNL grammar, parser, and validator. The src/vsa/ subdirectory contains the implementation of hyperdimensional encoding and search. The src/server.mjs file is the HTTP server with no external dependencies, used for tests and demonstrations.

The tests/ directory contains unit tests for each service, integration tests for complete pipelines, and regression tests for metrics and guardrails. The docs/evals/ directory contains evaluation datasets, including natural language and CNL pairs for testing translation.

The testing strategy includes unit tests for each agent in isolation, integration tests for complete flows from specification to generated text, regression tests to ensure modifications do not degrade metrics, and A/B tests for comparing basic and VSA variants. All tests are automated and run on every code change to detect problems as early as possible.

This organization allows teams to work independently on different components, facilitates onboarding of new developers who can quickly understand the system structure, and supports gradual evolution of each module without destabilizing the entire system.
