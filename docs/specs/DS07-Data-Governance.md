# DS07 Data Governance — SCRIPTA

## 1. Data Categories
- Narrative Input Data: author prompts, specs, drafts.
- Model Training Data: public domain and licensed corpora.
- System Output Data: generated text, verification reports.
- Audit Data: execution traces and provenance metadata.
- CNL Data: structured constraints and parse artifacts.
- VSA Data: hypervector indices and semantic memory stores.

## 2. Ownership & Access
- Authors own narrative inputs and outputs (subject to policy).
- Publishers/studios access compliance reports.
- Legal/compliance access audit logs.

## 3. Data Handling Policies
- Data minimization and purpose limitation.
- PII detection and redaction before storage.
- Strong encryption at rest and in transit.
- Separate retention policies for CNL and VSA indices.

## 4. Provenance & Auditability
- Every output linked to:
  - spec_id, sop_id, agent versions, and input hashes.
- Audit logs are immutable and signed.

## 5. Retention & Deletion
- Configurable retention per tenant.
- Right-to-delete requests handled with logged actions.

## 6. Compliance Alignment
- Copyright compliance workflow integration.
- Ethical and bias assessment logs stored for review.

## 7. Open Issues
- Licensing terms for external corpora used in evaluation.
- Policies for reuse of generated text in training.
