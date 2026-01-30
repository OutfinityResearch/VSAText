# DS13 API Examples — SCRIPTA

## 1. Purpose
Provide concrete JSON examples for the SCRIPTA API.

## 2. Location
Examples are stored in `docs/examples/api/`.

## 3. Example Files
- `create_spec_request.json`
- `create_spec_response.json`
- `get_spec_response.json`
- `create_sop_request.json`
- `create_sop_response.json`
- `get_sop_response.json`
- `create_plan_request.json`
- `create_plan_response.json`
- `get_plan_response.json`
- `generate_request.json`
- `generate_response.json`
- `get_generate_response.json`
- `verify_request.json`
- `verify_response.json`
- `get_verify_response.json`
- `guardrail_request.json`
- `guardrail_response.json`
- `get_guardrail_response.json`
- `evaluate_request.json`
- `evaluate_response.json`
- `get_evaluate_response.json`
- `pipeline_run_request.json`
- `pipeline_run_response.json`
- `get_pipeline_run_response.json`
- `cnl_translate_request.json`
- `cnl_translate_response.json`
- `cnl_validate_request.json`
- `cnl_validate_response.json`
- `vsa_encode_request.json`
- `vsa_encode_response.json`
- `vsa_index_request.json`
- `vsa_index_response.json`
- `vsa_search_request.json`
- `vsa_search_response.json`
- `audit_log_response.json`
- `audit_log_list_response.json`
- `error_response.json`
- `reverse_engineer_request.json`
- `reverse_engineer_response.json`
- `review_request.json`
- `review_response.json`
- `research_query_request.json`
- `research_query_response.json`
- `explain_request.json`
- `explain_response.json`
- `compliance_report_request.json`
- `compliance_report_response.json`

## 5. Error Examples (Per Endpoint)
Error examples use the common ErrorResponse schema and follow this pattern:
- `<resource>_error_401.json`
- `<resource>_error_403.json`
- `<resource>_error_404.json`
- `<resource>_error_422.json`

Resources covered: spec, sop, plan, generate, verify, guardrail, evaluate, pipeline, cnl, vsa, audit.

## 4. Notes
- `implementation_profile` is optional unless a VSA/HDC variant is required.
- Example IDs are illustrative and should be replaced by real identifiers.
