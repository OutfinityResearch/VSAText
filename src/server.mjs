#!/usr/bin/env node
/**
 * SCRIPTA API Server
 * Full implementation with all services integrated
 */

import http from 'http';
import crypto from 'crypto';

// Import all services
import { stores } from './services/store.mjs';
import { validateApiKey, generateApiKey, listApiKeys, revokeApiKey, API_KEY_HEADER } from './services/auth.mjs';
import { validateText } from './cnl/validator.mjs';
import { translateNlToCnl } from './services/cnl-translator.mjs';
import { encodeText, cosine } from './vsa/encoder.mjs';
import { generatePlan, extractCharacters } from './services/planning.mjs';
import { verifyAgainstSpec, checkCoherence } from './services/verification.mjs';
import { runGuardrailCheck } from './services/guardrails.mjs';
import { runEvaluation, calculateNQS } from './services/evaluation.mjs';
import { generateExplanation } from './services/explainability.mjs';
import { searchKnowledgeBase } from './services/research.mjs';
import { runLiteraryReview } from './services/literary-review.mjs';
import { reverseEngineer } from './services/reverse-engineering.mjs';
import { createJob, getJob, completeJob, failJob, startJob, updateJobProgress } from './services/jobs.mjs';
import { executeSop, getDefaultSop } from './services/sop-executor.mjs';
import { addAuditEntry, verifyChain, generateAuditReport, AUDIT_EVENTS } from './services/audit.mjs';

// Check if auth is required (can be disabled for development)
// Evaluated at request time to allow runtime override
function isAuthRequired() {
  return process.env.SCRIPTA_AUTH_REQUIRED !== 'false';
}

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function errorResponse(res, statusCode, code, message, details = {}) {
  jsonResponse(res, statusCode, {
    error: {
      code,
      message,
      details,
      correlation_id: crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    }
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('invalid_json'));
      }
    });
  });
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function createApiHandler() {
  const ok = (res, payload) => jsonResponse(res, 200, payload);
  const created = (res, payload) => jsonResponse(res, 201, payload);

  const handler = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;
    const method = req.method;

    // Health check - no auth required
    if (method === 'GET' && p === '/health') {
      return ok(res, { status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
    }

    // Auth check for all other endpoints
    if (isAuthRequired() && !p.startsWith('/v1/auth/')) {
      const apiKey = req.headers[API_KEY_HEADER];
      const authResult = validateApiKey(apiKey);
      
      if (!authResult.valid) {
        addAuditEntry(AUDIT_EVENTS.AUTH_FAILURE, 'unknown', { path: p }, { ip: req.socket?.remoteAddress });
        return errorResponse(res, 401, 'unauthorized', authResult.error || 'Invalid API key');
      }
      
      req.keyRecord = authResult.keyRecord;
    }

    try {
      const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await parseJsonBody(req) : {};

      // ===== AUTH ENDPOINTS =====
      if (method === 'POST' && p === '/v1/auth/keys') {
        const { name, roles } = body;
        if (!name) return errorResponse(res, 422, 'invalid_request', 'name is required');
        const keyInfo = generateApiKey(name, roles);
        addAuditEntry('auth.key_created', 'system', { key_id: keyInfo.id });
        return created(res, { ...keyInfo, message: 'Store this key securely. It cannot be retrieved again.' });
      }

      if (method === 'GET' && p === '/v1/auth/keys') {
        return ok(res, { keys: listApiKeys() });
      }

      if (method === 'DELETE' && p.match(/^\/v1\/auth\/keys\/([^/]+)$/)) {
        const keyId = p.split('/').pop();
        const revoked = revokeApiKey(keyId);
        if (!revoked) return errorResponse(res, 404, 'not_found', 'API key not found');
        addAuditEntry('auth.key_revoked', req.keyRecord?.name || 'system', { key_id: keyId });
        return ok(res, { revoked: true });
      }

      // ===== SPECS ENDPOINTS =====
      if (method === 'POST' && p === '/v1/specs') {
        if (!body.spec) return errorResponse(res, 422, 'invalid_request', 'spec is required');
        const spec = { ...body.spec };
        if (!spec.id) spec.id = makeId('spec');
        spec.created_at = new Date().toISOString();
        stores.specs.set(spec.id, spec);
        const audit = addAuditEntry(AUDIT_EVENTS.SPEC_CREATED, req.keyRecord?.name || 'system', { spec_id: spec.id });
        return created(res, { spec, audit: { id: audit.id, signature: audit.signature } });
      }

      if (method === 'GET' && p.match(/^\/v1\/specs\/([^/]+)$/)) {
        const specId = p.split('/').pop();
        const spec = stores.specs.get(specId);
        if (!spec) return errorResponse(res, 404, 'not_found', 'Spec not found');
        return ok(res, { spec });
      }

      if (method === 'PUT' && p.match(/^\/v1\/specs\/([^/]+)$/)) {
        const specId = p.split('/').pop();
        const existing = stores.specs.get(specId);
        if (!existing) return errorResponse(res, 404, 'not_found', 'Spec not found');
        if (!body.spec) return errorResponse(res, 422, 'invalid_request', 'spec is required');
        const spec = { ...existing, ...body.spec, id: specId, updated_at: new Date().toISOString() };
        stores.specs.set(specId, spec);
        const audit = addAuditEntry(AUDIT_EVENTS.SPEC_UPDATED, req.keyRecord?.name || 'system', { spec_id: specId });
        return ok(res, { spec, audit: { id: audit.id } });
      }

      if (method === 'DELETE' && p.match(/^\/v1\/specs\/([^/]+)$/)) {
        const specId = p.split('/').pop();
        if (!stores.specs.has(specId)) return errorResponse(res, 404, 'not_found', 'Spec not found');
        stores.specs.delete(specId);
        const audit = addAuditEntry(AUDIT_EVENTS.SPEC_DELETED, req.keyRecord?.name || 'system', { spec_id: specId });
        return ok(res, { deleted: true, audit: { id: audit.id } });
      }

      if (method === 'GET' && p === '/v1/specs') {
        return ok(res, { specs: stores.specs.values() });
      }

      // ===== SOPS ENDPOINTS =====
      if (method === 'POST' && p === '/v1/sops') {
        if (!body.sop) return errorResponse(res, 422, 'invalid_request', 'sop is required');
        const sop = { ...body.sop };
        if (!sop.id) sop.id = makeId('sop');
        sop.created_at = new Date().toISOString();
        stores.sops.set(sop.id, sop);
        const audit = addAuditEntry(AUDIT_EVENTS.SOP_CREATED, req.keyRecord?.name || 'system', { sop_id: sop.id });
        return created(res, { sop, audit: { id: audit.id } });
      }

      if (method === 'GET' && p.match(/^\/v1\/sops\/([^/]+)$/)) {
        const sopId = p.split('/').pop();
        const sop = stores.sops.get(sopId);
        if (!sop) return errorResponse(res, 404, 'not_found', 'SOP not found');
        return ok(res, { sop });
      }

      if (method === 'PUT' && p.match(/^\/v1\/sops\/([^/]+)$/)) {
        const sopId = p.split('/').pop();
        const existing = stores.sops.get(sopId);
        if (!existing) return errorResponse(res, 404, 'not_found', 'SOP not found');
        if (!body.sop) return errorResponse(res, 422, 'invalid_request', 'sop is required');
        const sop = { ...existing, ...body.sop, id: sopId, updated_at: new Date().toISOString() };
        stores.sops.set(sopId, sop);
        const audit = addAuditEntry(AUDIT_EVENTS.SOP_UPDATED, req.keyRecord?.name || 'system', { sop_id: sopId });
        return ok(res, { sop, audit: { id: audit.id } });
      }

      if (method === 'DELETE' && p.match(/^\/v1\/sops\/([^/]+)$/)) {
        const sopId = p.split('/').pop();
        if (!stores.sops.has(sopId)) return errorResponse(res, 404, 'not_found', 'SOP not found');
        stores.sops.delete(sopId);
        return ok(res, { deleted: true });
      }

      if (method === 'POST' && p.match(/^\/v1\/sops\/([^/]+):validate$/)) {
        const sopId = p.split('/')[3].replace(':validate', '');
        const sop = stores.sops.get(sopId);
        if (!sop) return errorResponse(res, 404, 'not_found', 'SOP not found');
        // Basic validation
        const valid = sop.steps && Array.isArray(sop.steps) && sop.steps.length > 0;
        return ok(res, { valid, errors: valid ? [] : [{ message: 'SOP must have at least one step' }] });
      }

      // ===== PLANNING ENDPOINTS =====
      if (method === 'POST' && p === '/v1/plans') {
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required');
        const spec = stores.specs.get(body.spec_id);
        if (!spec) return errorResponse(res, 404, 'not_found', 'Spec not found');
        
        const plan = generatePlan(spec, body.planning_params || {});
        stores.plans.set(plan.id, plan);
        const audit = addAuditEntry(AUDIT_EVENTS.PLAN_CREATED, 'agent:planning', { plan_id: plan.id, spec_id: body.spec_id });
        return created(res, { plan, audit: { id: audit.id } });
      }

      if (method === 'GET' && p.match(/^\/v1\/plans\/([^/]+)$/)) {
        const planId = p.split('/').pop();
        const plan = stores.plans.get(planId);
        if (!plan) return errorResponse(res, 404, 'not_found', 'Plan not found');
        return ok(res, { plan });
      }

      // ===== GENERATION ENDPOINTS =====
      if (method === 'POST' && p === '/v1/generate') {
        if (!body.plan_id) return errorResponse(res, 422, 'invalid_request', 'plan_id is required');
        const plan = stores.plans.get(body.plan_id);
        if (!plan) return errorResponse(res, 404, 'not_found', 'Plan not found');
        
        // Create async job
        const job = createJob('generate', { plan_id: body.plan_id, scene_id: body.scene_id });
        addAuditEntry(AUDIT_EVENTS.GENERATE_STARTED, 'agent:generation', { job_id: job.job_id });
        
        // Simulate async processing
        startJob(job.job_id);
        updateJobProgress(job.job_id, 50, 'Generating content...');
        
        // Generate mock content
        const draftId = makeId('draft');
        const content = plan.scenes.map(s => `Scene ${s.number}: ${s.summary}\n\nThe story unfolds...`).join('\n\n');
        stores.drafts.set(draftId, { id: draftId, plan_id: body.plan_id, content, created_at: new Date().toISOString() });
        
        completeJob(job.job_id, { message: 'Generation complete' }, [{ id: draftId, type: 'draft', hash: crypto.createHash('md5').update(content).digest('hex').slice(0, 8) }]);
        addAuditEntry(AUDIT_EVENTS.GENERATE_COMPLETED, 'agent:generation', { job_id: job.job_id, draft_id: draftId });
        
        return ok(res, { job_id: job.job_id, status: 'completed' });
      }

      if (method === 'GET' && p.match(/^\/v1\/generate\/([^/]+)$/)) {
        const jobId = p.split('/').pop();
        const job = getJob(jobId);
        if (!job) return errorResponse(res, 404, 'not_found', 'Job not found');
        return ok(res, job);
      }

      // ===== VERIFICATION ENDPOINTS =====
      if (method === 'POST' && p === '/v1/verify') {
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required');
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required');
        
        const spec = stores.specs.get(body.spec_id);
        if (!spec) return errorResponse(res, 404, 'not_found', 'Spec not found');
        
        const draft = stores.drafts.get(body.artifact_ref.id);
        const text = draft?.content || body.text || 'No content available';
        
        const report = verifyAgainstSpec(text, spec);
        stores.verifyReports.set(report.report_id, report);
        addAuditEntry(AUDIT_EVENTS.VERIFY_COMPLETED, 'agent:verification', { report_id: report.report_id });
        
        return ok(res, report);
      }

      if (method === 'GET' && p.match(/^\/v1\/verify\/([^/]+)$/)) {
        const reportId = p.split('/').pop();
        const report = stores.verifyReports.get(reportId);
        if (!report) return errorResponse(res, 404, 'not_found', 'Report not found');
        return ok(res, report);
      }

      // ===== GUARDRAILS ENDPOINTS =====
      if (method === 'POST' && p === '/v1/guardrail/check') {
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required');
        
        const draft = stores.drafts.get(body.artifact_ref.id);
        const text = draft?.content || body.text || '';
        
        const report = runGuardrailCheck(text, { policies: body.policies });
        stores.guardrailReports.set(report.report_id, report);
        addAuditEntry(AUDIT_EVENTS.GUARDRAIL_COMPLETED, 'agent:guardrail', { report_id: report.report_id });
        
        return ok(res, report);
      }

      if (method === 'GET' && p.match(/^\/v1\/guardrail\/report\/([^/]+)$/)) {
        const reportId = p.split('/').pop();
        const report = stores.guardrailReports.get(reportId);
        if (!report) return errorResponse(res, 404, 'not_found', 'Report not found');
        return ok(res, report);
      }

      // ===== EVALUATION ENDPOINTS =====
      if (method === 'POST' && p === '/v1/evaluate') {
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required');
        if (!Array.isArray(body.metrics)) return errorResponse(res, 422, 'invalid_request', 'metrics[] is required');
        
        const draft = stores.drafts.get(body.artifact_ref.id);
        const text = draft?.content || body.text || '';
        const spec = body.spec_id ? stores.specs.get(body.spec_id) : {};
        
        const report = runEvaluation(text, spec, { metrics: body.metrics });
        stores.evaluationReports.set(report.report_id, report);
        addAuditEntry(AUDIT_EVENTS.EVALUATE_COMPLETED, 'agent:evaluation', { report_id: report.report_id });
        
        return ok(res, report);
      }

      if (method === 'GET' && p.match(/^\/v1\/evaluate\/([^/]+)$/)) {
        const reportId = p.split('/').pop();
        const report = stores.evaluationReports.get(reportId);
        if (!report) return errorResponse(res, 404, 'not_found', 'Report not found');
        return ok(res, report);
      }

      // ===== ORCHESTRATION ENDPOINTS =====
      if (method === 'POST' && p === '/v1/pipelines/run') {
        if (!body.sop_id && !body.use_default) return errorResponse(res, 422, 'invalid_request', 'sop_id is required');
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required');
        
        const sop = body.use_default ? getDefaultSop() : stores.sops.get(body.sop_id);
        const spec = stores.specs.get(body.spec_id);
        
        if (!sop) return errorResponse(res, 404, 'not_found', 'SOP not found');
        if (!spec) return errorResponse(res, 404, 'not_found', 'Spec not found');
        
        addAuditEntry(AUDIT_EVENTS.PIPELINE_STARTED, 'system', { sop_id: sop.id, spec_id: spec.id });
        const run = await executeSop(sop, spec);
        
        const auditEvent = run.status === 'completed' ? AUDIT_EVENTS.PIPELINE_COMPLETED : AUDIT_EVENTS.PIPELINE_FAILED;
        addAuditEntry(auditEvent, 'system', { run_id: run.run_id, status: run.status });
        
        return ok(res, run);
      }

      if (method === 'GET' && p.match(/^\/v1\/pipelines\/([^/]+)$/)) {
        const runId = p.split('/').pop();
        const run = stores.pipelineRuns.get(runId);
        if (!run) return errorResponse(res, 404, 'not_found', 'Pipeline run not found');
        return ok(res, run);
      }

      // ===== AUDIT ENDPOINTS =====
      if (method === 'GET' && p === '/v1/audit/logs') {
        const entries = stores.audit.values().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return ok(res, { entries: entries.slice(0, 100) });
      }

      if (method === 'GET' && p.match(/^\/v1\/audit\/logs\/([^/]+)$/)) {
        const auditId = p.split('/').pop();
        const entry = stores.audit.get(auditId);
        if (!entry) return errorResponse(res, 404, 'not_found', 'Audit entry not found');
        return ok(res, { entry });
      }

      if (method === 'GET' && p === '/v1/audit/verify') {
        const result = verifyChain();
        return ok(res, result);
      }

      if (method === 'POST' && p === '/v1/audit/report') {
        const report = generateAuditReport(body);
        return ok(res, report);
      }

      // ===== REVERSE ENGINEERING ENDPOINTS =====
      if (method === 'POST' && p === '/v1/reverse-engineer') {
        if (!body.artifact_ref && !body.text) return errorResponse(res, 422, 'invalid_request', 'artifact_ref or text is required');
        if (!body.output) return errorResponse(res, 422, 'invalid_request', 'output is required (spec or plan)');
        
        const draft = body.artifact_ref ? stores.drafts.get(body.artifact_ref.id) : null;
        const text = draft?.content || body.text || '';
        
        const result = reverseEngineer(text, body.output);
        
        if (result.spec) stores.specs.set(result.spec.id, result.spec);
        if (result.plan) stores.plans.set(result.plan.id, result.plan);
        
        addAuditEntry(AUDIT_EVENTS.REVERSE_ENGINEER, 'agent:reverse', { output: body.output });
        return ok(res, { ...result, audit: { event: AUDIT_EVENTS.REVERSE_ENGINEER } });
      }

      // ===== LITERARY REVIEW ENDPOINTS =====
      if (method === 'POST' && p === '/v1/review') {
        if (!body.artifact_ref && !body.text) return errorResponse(res, 422, 'invalid_request', 'artifact_ref or text is required');
        
        const draft = body.artifact_ref ? stores.drafts.get(body.artifact_ref.id) : null;
        const text = draft?.content || body.text || '';
        
        const report = runLiteraryReview(text, { criteria: body.criteria });
        stores.reviews.set(report.report_id, report);
        addAuditEntry(AUDIT_EVENTS.REVIEW_COMPLETED, 'agent:review', { report_id: report.report_id });
        
        return ok(res, report);
      }

      // ===== RESEARCH ENDPOINTS =====
      if (method === 'POST' && p === '/v1/research/query') {
        if (!body.query) return errorResponse(res, 422, 'invalid_request', 'query is required');
        
        const results = searchKnowledgeBase(body.query, { 
          top_k: body.top_k, 
          domains: body.constraints?.domains 
        });
        addAuditEntry(AUDIT_EVENTS.RESEARCH_QUERY, 'agent:research', { query: body.query.slice(0, 50) });
        
        return ok(res, results);
      }

      // ===== EXPLAINABILITY ENDPOINTS =====
      if (method === 'POST' && p === '/v1/explain') {
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required');
        if (!body.question) return errorResponse(res, 422, 'invalid_request', 'question is required');
        
        // Gather context from related reports
        const context = {};
        if (body.verification_report_id) {
          context.verificationReport = stores.verifyReports.get(body.verification_report_id);
        }
        if (body.guardrail_report_id) {
          context.guardrailReport = stores.guardrailReports.get(body.guardrail_report_id);
        }
        if (body.evaluation_report_id) {
          context.evaluationReport = stores.evaluationReports.get(body.evaluation_report_id);
        }
        if (body.plan_id) {
          context.plan = stores.plans.get(body.plan_id);
        }
        
        const explanation = generateExplanation(body.artifact_ref, body.question, context);
        return ok(res, explanation);
      }

      // ===== COMPLIANCE REPORTS ENDPOINTS =====
      if (method === 'POST' && p === '/v1/reports/compliance') {
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required');
        
        const draft = stores.drafts.get(body.artifact_ref.id);
        const text = draft?.content || '';
        
        // Gather all relevant reports
        const guardrailReport = runGuardrailCheck(text, { policies: body.policies || ['bias', 'pii', 'harmful'] });
        const auditVerification = verifyChain();
        
        const report = {
          report_id: makeId('compliance'),
          status: guardrailReport.status === 'pass' && auditVerification.valid ? 'pass' : 'fail',
          summary: 'Compliance check completed',
          artifact_ref: body.artifact_ref,
          findings: guardrailReport.findings,
          guardrail_summary: guardrailReport.summary,
          audit_chain_valid: auditVerification.valid,
          generated_at: new Date().toISOString()
        };
        
        stores.compliance.set(report.report_id, report);
        addAuditEntry(AUDIT_EVENTS.COMPLIANCE_REPORT, 'agent:compliance', { report_id: report.report_id });
        
        return ok(res, report);
      }

      // ===== CNL ENDPOINTS =====
      if (method === 'POST' && p === '/v1/cnl/validate') {
        if (!body.cnl_text) return errorResponse(res, 422, 'invalid_request', 'cnl_text is required');
        const { statements, errors } = validateText(body.cnl_text);
        return ok(res, { valid: errors.length === 0, errors, statements });
      }

      if (method === 'POST' && p === '/v1/cnl/translate') {
        if (!body.nl_text) return errorResponse(res, 422, 'invalid_request', 'nl_text is required');
        const result = translateNlToCnl(body.nl_text, body.context || {});
        return ok(res, result);
      }

      // ===== VSA ENDPOINTS =====
      if (method === 'POST' && p === '/v1/vsa/encode') {
        if (!body.text) return errorResponse(res, 422, 'invalid_request', 'text is required');
        const dim = body.dim ? Number(body.dim) : 10000;
        const seed = body.seed ? Number(body.seed) : 42;
        const vector = encodeText(body.text, dim, seed);
        return ok(res, { vector, dim });
      }

      if (method === 'POST' && p === '/v1/vsa/index') {
        const vectors = body.vectors;
        const ids = body.ids;
        if (!Array.isArray(vectors) || !Array.isArray(ids) || vectors.length !== ids.length) {
          return errorResponse(res, 422, 'invalid_request', 'vectors and ids arrays are required and must match');
        }
        for (let i = 0; i < ids.length; i++) {
          stores.vsaIndex.set(ids[i], vectors[i]);
        }
        return ok(res, { indexed: ids.length });
      }

      if (method === 'POST' && p === '/v1/vsa/search') {
        const queryVector = body.query_vector;
        const topK = body.top_k ? Number(body.top_k) : 5;
        if (!Array.isArray(queryVector)) return errorResponse(res, 422, 'invalid_request', 'query_vector is required');
        
        const results = stores.vsaIndex.entries().map(([id, vec]) => ({ id, score: cosine(queryVector, vec) }));
        results.sort((a, b) => b.score - a.score);
        const sliced = results.slice(0, topK);
        return ok(res, { ids: sliced.map(r => r.id), scores: sliced.map(r => r.score) });
      }

      // ===== DRAFTS ENDPOINTS =====
      if (method === 'GET' && p.match(/^\/v1\/drafts\/([^/]+)$/)) {
        const draftId = p.split('/').pop();
        const draft = stores.drafts.get(draftId);
        if (!draft) return errorResponse(res, 404, 'not_found', 'Draft not found');
        return ok(res, { draft });
      }

      return errorResponse(res, 404, 'not_found', 'Route not found', { path: p });

    } catch (err) {
      if (err.message === 'invalid_json') {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
      if (err.message === 'payload_too_large') {
        return errorResponse(res, 413, 'payload_too_large', 'Request body too large');
      }
      console.error('Server error:', err);
      return errorResponse(res, 500, 'internal_error', err.message);
    }
  };

  return { handler, stores };
}

function createApiServer() {
  const { handler } = createApiHandler();
  return http.createServer((req, res) => {
    handler(req, res);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const server = createApiServer();
  server.listen(port, () => {
    const authRequired = isAuthRequired();
    console.log(`SCRIPTA API listening on http://localhost:${port}`);
    console.log(`Auth required: ${authRequired}`);
    if (!authRequired) {
      console.log('WARNING: Authentication disabled. Set SCRIPTA_AUTH_REQUIRED=true for production.');
    }
  });
}

export { createApiHandler, createApiServer };
