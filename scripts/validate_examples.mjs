#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'docs', 'schemas', 'api');
const EXAMPLE_DIR = path.join(ROOT, 'docs', 'examples', 'api');

const DEFAULT_MAPPING = {
  'create_spec_request.json': ['spec.json', 'CreateSpecRequest'],
  'create_spec_response.json': ['spec.json', 'CreateSpecResponse'],
  'get_spec_response.json': ['spec.json', 'GetSpecResponse'],
  'create_sop_request.json': ['sop.json', 'CreateSopRequest'],
  'create_sop_response.json': ['sop.json', 'CreateSopResponse'],
  'get_sop_response.json': ['sop.json', 'GetSopResponse'],
  'create_plan_request.json': ['plan.json', 'CreatePlanRequest'],
  'create_plan_response.json': ['plan.json', 'CreatePlanResponse'],
  'get_plan_response.json': ['plan.json', 'GetPlanResponse'],
  'generate_request.json': ['generate.json', 'GenerateRequest'],
  'generate_response.json': ['generate.json', 'GenerateResponse'],
  'get_generate_response.json': ['generate.json', 'GetGenerateResponse'],
  'verify_request.json': ['verify.json', 'VerifyRequest'],
  'verify_response.json': ['verify.json', 'VerifyResponse'],
  'get_verify_response.json': ['verify.json', 'GetVerifyResponse'],
  'guardrail_request.json': ['guardrail.json', 'GuardrailRequest'],
  'guardrail_response.json': ['guardrail.json', 'GuardrailResponse'],
  'get_guardrail_response.json': ['guardrail.json', 'GetGuardrailResponse'],
  'evaluate_request.json': ['evaluate.json', 'EvaluationRequest'],
  'evaluate_response.json': ['evaluate.json', 'EvaluationResponse'],
  'get_evaluate_response.json': ['evaluate.json', 'GetEvaluationResponse'],
  'pipeline_run_request.json': ['pipeline.json', 'PipelineRunRequest'],
  'pipeline_run_response.json': ['pipeline.json', 'PipelineRunResponse'],
  'get_pipeline_run_response.json': ['pipeline.json', 'GetPipelineRunResponse'],
  'cnl_translate_request.json': ['cnl.json', 'CnlTranslateRequest'],
  'cnl_translate_response.json': ['cnl.json', 'CnlTranslateResponse'],
  'cnl_validate_request.json': ['cnl.json', 'CnlValidateRequest'],
  'cnl_validate_response.json': ['cnl.json', 'CnlValidateResponse'],
  'vsa_encode_request.json': ['vsa.json', 'VsaEncodeRequest'],
  'vsa_encode_response.json': ['vsa.json', 'VsaEncodeResponse'],
  'vsa_index_request.json': ['vsa.json', 'VsaIndexRequest'],
  'vsa_index_response.json': ['vsa.json', 'VsaIndexResponse'],
  'vsa_search_request.json': ['vsa.json', 'VsaSearchRequest'],
  'vsa_search_response.json': ['vsa.json', 'VsaSearchResponse'],
  'audit_log_response.json': ['audit.json', 'AuditLogResponse'],
  'audit_log_list_response.json': ['audit.json', 'AuditLogListResponse'],
  'error_response.json': ['common.json', 'ErrorResponse'],
  'reverse_engineer_request.json': ['reverse.json', 'ReverseEngineerRequest'],
  'reverse_engineer_response.json': ['reverse.json', 'ReverseEngineerResponse'],
  'review_request.json': ['review.json', 'ReviewRequest'],
  'review_response.json': ['review.json', 'ReviewResponse'],
  'research_query_request.json': ['research.json', 'ResearchQueryRequest'],
  'research_query_response.json': ['research.json', 'ResearchQueryResponse'],
  'explain_request.json': ['explain.json', 'ExplainRequest'],
  'explain_response.json': ['explain.json', 'ExplainResponse'],
  'compliance_report_request.json': ['reports.json', 'ComplianceReportRequest'],
  'compliance_report_response.json': ['reports.json', 'ComplianceReportResponse']
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadSchemas(schemaDir) {
  const store = new Map();
  const files = fs.readdirSync(schemaDir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const full = path.join(schemaDir, file);
    const schema = readJson(full);
    store.set(full, schema);
    if (schema.$id) {
      store.set(schema.$id, schema);
    }
  }
  return store;
}

function resolveJsonPointer(doc, pointer) {
  if (!pointer || pointer === '' || pointer === '/') return doc;
  const parts = pointer.replace(/^\//, '').split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  let current = doc;
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function resolveRef(ref, basePath, store) {
  const [refPath, fragment] = ref.split('#');
  if (refPath) {
    const target = path.resolve(path.dirname(basePath), refPath);
    const doc = store.get(target) || readJson(target);
    store.set(target, doc);
    const pointer = fragment ? `/${fragment.replace(/^\//, '')}` : '';
    return { schema: resolveJsonPointer(doc, pointer), basePath: target };
  }
  const doc = store.get(basePath);
  const pointer = fragment ? `/${fragment.replace(/^\//, '')}` : '';
  return { schema: resolveJsonPointer(doc, pointer), basePath };
}

function typeMatches(schemaType, data) {
  switch (schemaType) {
    case 'object':
      return data !== null && typeof data === 'object' && !Array.isArray(data);
    case 'array':
      return Array.isArray(data);
    case 'string':
      return typeof data === 'string';
    case 'number':
      return typeof data === 'number' && Number.isFinite(data);
    case 'integer':
      return typeof data === 'number' && Number.isInteger(data);
    case 'boolean':
      return typeof data === 'boolean';
    default:
      return true;
  }
}

function validateSchema(schema, data, ctx, pathStack) {
  const errors = [];
  if (!schema) return errors;

  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, ctx.basePath, ctx.store);
    if (!resolved || !resolved.schema) {
      errors.push(`${pathStack}: unresolved $ref ${schema.$ref}`);
      return errors;
    }
    return errors.concat(validateSchema(resolved.schema, data, { ...ctx, basePath: resolved.basePath }, pathStack));
  }

  if (schema.const !== undefined && data !== schema.const) {
    errors.push(`${pathStack}: expected const ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${pathStack}: value not in enum`);
  }

  if (schema.oneOf) {
    let validCount = 0;
    for (const sub of schema.oneOf) {
      if (validateSchema(sub, data, ctx, pathStack).length === 0) validCount += 1;
    }
    if (validCount !== 1) {
      errors.push(`${pathStack}: oneOf validation failed`);
    }
  }

  if (schema.anyOf) {
    let valid = false;
    for (const sub of schema.anyOf) {
      if (validateSchema(sub, data, ctx, pathStack).length === 0) valid = true;
    }
    if (!valid) {
      errors.push(`${pathStack}: anyOf validation failed`);
    }
  }

  if (schema.allOf) {
    for (const sub of schema.allOf) {
      errors.push(...validateSchema(sub, data, ctx, pathStack));
    }
  }

  let schemaType = schema.type;
  if (Array.isArray(schemaType)) {
    const matched = schemaType.find((t) => typeMatches(t, data));
    if (!matched) {
      errors.push(`${pathStack}: expected type ${schemaType.join('|')}`);
      return errors;
    }
    schemaType = matched;
  } else if (schemaType && !typeMatches(schemaType, data)) {
    errors.push(`${pathStack}: expected type ${schemaType}`);
    return errors;
  }

  if (schemaType === 'object' || (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data))) {
    const props = schema.properties || {};
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in data)) {
        errors.push(`${pathStack}: missing required property ${key}`);
      }
    }
    for (const [key, value] of Object.entries(data)) {
      if (props[key]) {
        errors.push(...validateSchema(props[key], value, ctx, `${pathStack}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${pathStack}: additional property not allowed (${key})`);
      } else if (typeof schema.additionalProperties === 'object') {
        errors.push(...validateSchema(schema.additionalProperties, value, ctx, `${pathStack}.${key}`));
      }
    }
  }

  if (schemaType === 'array') {
    if (schema.items) {
      data.forEach((item, idx) => {
        errors.push(...validateSchema(schema.items, item, ctx, `${pathStack}[${idx}]`));
      });
    }
  }

  return errors;
}

export function validateExamples({ schemaDir = SCHEMA_DIR, exampleDir = EXAMPLE_DIR, mapping = DEFAULT_MAPPING } = {}) {
  const store = loadSchemas(schemaDir);
  const localMapping = { ...mapping };
  // auto-map *_error_*.json to ErrorResponse
  for (const name of fs.readdirSync(exampleDir)) {
    if (name.endsWith('.json') && name.includes('_error_') && !(name in localMapping)) {
      localMapping[name] = ['common.json', 'ErrorResponse'];
    }
  }

  let failures = 0;
  for (const [exampleName, [schemaFile, defName]] of Object.entries(localMapping)) {
    const examplePath = path.join(exampleDir, exampleName);
    if (!fs.existsSync(examplePath)) {
      console.log(`Missing example: ${exampleName}`);
      failures += 1;
      continue;
    }
    const schemaPath = path.join(schemaDir, schemaFile);
    const schemaDoc = store.get(schemaPath) || readJson(schemaPath);
    store.set(schemaPath, schemaDoc);
    const defSchema = schemaDoc.$defs ? schemaDoc.$defs[defName] : undefined;
    if (!defSchema) {
      console.log(`Missing schema def: ${schemaFile}#/$defs/${defName}`);
      failures += 1;
      continue;
    }
    const data = readJson(examplePath);
    const errors = validateSchema(defSchema, data, { basePath: schemaPath, store }, '$');
    if (errors.length) {
      console.log(`FAIL: ${exampleName}`);
      errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
      failures += 1;
    } else {
      console.log(`OK: ${exampleName}`);
    }
  }
  return failures;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const failures = validateExamples();
  process.exit(failures === 0 ? 0 : 1);
}
