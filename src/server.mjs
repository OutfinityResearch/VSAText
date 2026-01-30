#!/usr/bin/env node
import http from 'http';
import { randomUUID } from 'crypto';
import { validateText } from './cnl/validator.mjs';
import { encodeText, cosine } from './vsa/encoder.mjs';

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
      correlation_id: randomUUID().replace(/-/g, '').slice(0, 12)
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

function createApiHandler() {
  const stores = {
    specs: new Map(),
    sops: new Map(),
    plans: new Map(),
    generateJobs: new Map(),
    verifyReports: new Map(),
    guardrailReports: new Map(),
    evaluationReports: new Map(),
    pipelineRuns: new Map(),
    audit: new Map(),
    vsaIndex: new Map()
  };

  function makeId(prefix) {
    return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }

  function addAudit(event_type, actor, payload_hash = '0000000000000000') {
    const entry = {
      id: `audit_${Date.now()}`,
      event_type,
      actor,
      timestamp: new Date().toISOString(),
      payload_hash
    };
    stores.audit.set(entry.id, entry);
    return entry;
  }

  function ok(res, payload) {
    return jsonResponse(res, 200, payload);
  }

  const handler = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;

    if (req.method === 'GET' && p === '/health') {
      return ok(res, { status: 'ok' });
    }

    // ----- Specs -----
    if (req.method === 'POST' && p === '/v1/specs') {
      try {
        const body = await parseJsonBody(req);
        if (!body.spec) return errorResponse(res, 422, 'invalid_request', 'spec is required', { field: 'spec' });
        const spec = { ...body.spec };
        if (!spec.id) spec.id = makeId('spec');
        stores.specs.set(spec.id, spec);
        return ok(res, { spec, audit: addAudit('spec.created', 'system') });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const specMatch = p.match(/^\/v1\/specs\/([^/]+)$/);
    if (req.method === 'GET' && specMatch) {
      const specId = specMatch[1];
      const spec = stores.specs.get(specId);
      if (!spec) return errorResponse(res, 404, 'not_found', 'Spec not found', { id: specId });
      return ok(res, { spec });
    }

    // ----- SOPs -----
    if (req.method === 'POST' && p === '/v1/sops') {
      try {
        const body = await parseJsonBody(req);
        if (!body.sop) return errorResponse(res, 422, 'invalid_request', 'sop is required', { field: 'sop' });
        const sop = { ...body.sop };
        if (!sop.id) sop.id = makeId('sop');
        stores.sops.set(sop.id, sop);
        return ok(res, { sop, audit: addAudit('sop.created', 'system') });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const sopMatch = p.match(/^\/v1\/sops\/([^/]+)$/);
    if (req.method === 'GET' && sopMatch) {
      const sopId = sopMatch[1];
      const sop = stores.sops.get(sopId);
      if (!sop) return errorResponse(res, 404, 'not_found', 'SOP not found', { id: sopId });
      return ok(res, { sop });
    }

    // ----- Planning -----
    if (req.method === 'POST' && p === '/v1/plans') {
      try {
        const body = await parseJsonBody(req);
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required', { field: 'spec_id' });
        const plan = {
          id: makeId('plan'),
          spec_id: body.spec_id,
          plot_graph: 'plot_graph_ref_stub',
          scenes: [
            { id: 'scene_1', summary: 'Setup' },
            { id: 'scene_2', summary: 'Complication' },
            { id: 'scene_3', summary: 'Decision' }
          ],
          arcs: []
        };
        stores.plans.set(plan.id, plan);
        return ok(res, { plan, audit: addAudit('plan.created', 'agent:planning') });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const planMatch = p.match(/^\/v1\/plans\/([^/]+)$/);
    if (req.method === 'GET' && planMatch) {
      const planId = planMatch[1];
      const plan = stores.plans.get(planId);
      if (!plan) return errorResponse(res, 404, 'not_found', 'Plan not found', { id: planId });
      return ok(res, { plan });
    }

    // ----- Generation -----
    if (req.method === 'POST' && p === '/v1/generate') {
      try {
        const body = await parseJsonBody(req);
        if (!body.plan_id) return errorResponse(res, 422, 'invalid_request', 'plan_id is required', { field: 'plan_id' });
        const job_id = makeId('job');
        const outputRef = { id: makeId('draft'), type: 'draft', hash: 'stub' };
        const job = { job_id, status: 'completed', output_refs: [outputRef] };
        stores.generateJobs.set(job_id, job);
        addAudit('generate.completed', 'agent:generation');
        return ok(res, { job_id, status: job.status });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const genMatch = p.match(/^\/v1\/generate\/([^/]+)$/);
    if (req.method === 'GET' && genMatch) {
      const jobId = genMatch[1];
      const job = stores.generateJobs.get(jobId);
      if (!job) return errorResponse(res, 404, 'not_found', 'Job not found', { id: jobId });
      return ok(res, job);
    }

    // ----- Verification -----
    if (req.method === 'POST' && p === '/v1/verify') {
      try {
        const body = await parseJsonBody(req);
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required', { field: 'spec_id' });
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        const report_id = makeId('verify');
        const report = {
          report_id,
          checks: [{ name: 'character_consistency', status: 'pass' }],
          violations: []
        };
        stores.verifyReports.set(report_id, report);
        addAudit('verify.completed', 'agent:verification');
        return ok(res, report);
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const verifyMatch = p.match(/^\/v1\/verify\/([^/]+)$/);
    if (req.method === 'GET' && verifyMatch) {
      const reportId = verifyMatch[1];
      const report = stores.verifyReports.get(reportId);
      if (!report) return errorResponse(res, 404, 'not_found', 'Verification report not found', { id: reportId });
      return ok(res, report);
    }

    // ----- Guardrails -----
    if (req.method === 'POST' && p === '/v1/guardrail/check') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        const report_id = makeId('guard');
        const report = { report_id, findings: [], status: 'pass' };
        stores.guardrailReports.set(report_id, report);
        addAudit('guardrail.completed', 'agent:guardrail');
        return ok(res, report);
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const guardMatch = p.match(/^\/v1\/guardrail\/report\/([^/]+)$/);
    if (req.method === 'GET' && guardMatch) {
      const reportId = guardMatch[1];
      const report = stores.guardrailReports.get(reportId);
      if (!report) return errorResponse(res, 404, 'not_found', 'Guardrail report not found', { id: reportId });
      return ok(res, report);
    }

    // ----- Evaluation -----
    if (req.method === 'POST' && p === '/v1/evaluate') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        if (!Array.isArray(body.metrics)) return errorResponse(res, 422, 'invalid_request', 'metrics[] is required', { field: 'metrics' });
        const report_id = makeId('eval');
        const report = { report_id, results: body.metrics.map((m) => ({ name: m, value: 0 })) };
        stores.evaluationReports.set(report_id, report);
        addAudit('evaluate.completed', 'agent:evaluation');
        return ok(res, report);
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const evalMatch = p.match(/^\/v1\/evaluate\/([^/]+)$/);
    if (req.method === 'GET' && evalMatch) {
      const reportId = evalMatch[1];
      const report = stores.evaluationReports.get(reportId);
      if (!report) return errorResponse(res, 404, 'not_found', 'Evaluation report not found', { id: reportId });
      return ok(res, report);
    }

    // ----- Orchestration -----
    if (req.method === 'POST' && p === '/v1/pipelines/run') {
      try {
        const body = await parseJsonBody(req);
        if (!body.sop_id) return errorResponse(res, 422, 'invalid_request', 'sop_id is required', { field: 'sop_id' });
        if (!body.spec_id) return errorResponse(res, 422, 'invalid_request', 'spec_id is required', { field: 'spec_id' });
        const run_id = makeId('run');
        const run = { run_id, status: 'completed' };
        stores.pipelineRuns.set(run_id, run);
        addAudit('pipeline.completed', 'system');
        return ok(res, run);
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    const pipeMatch = p.match(/^\/v1\/pipelines\/([^/]+)$/);
    if (req.method === 'GET' && pipeMatch) {
      const runId = pipeMatch[1];
      const run = stores.pipelineRuns.get(runId);
      if (!run) return errorResponse(res, 404, 'not_found', 'Pipeline run not found', { id: runId });
      return ok(res, run);
    }

    // ----- Audit -----
    if (req.method === 'GET' && p === '/v1/audit/logs') {
      return ok(res, { entries: Array.from(stores.audit.values()) });
    }

    const auditMatch = p.match(/^\/v1\/audit\/logs\/([^/]+)$/);
    if (req.method === 'GET' && auditMatch) {
      const auditId = auditMatch[1];
      const entry = stores.audit.get(auditId);
      if (!entry) return errorResponse(res, 404, 'not_found', 'Audit entry not found', { id: auditId });
      return ok(res, { entry });
    }

    // ----- Reverse Engineering -----
    if (req.method === 'POST' && p === '/v1/reverse-engineer') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        if (!body.output) return errorResponse(res, 422, 'invalid_request', 'output is required', { field: 'output' });
        const audit = addAudit('reverse_engineer.completed', 'agent:reverse');
        if (body.output === 'plan') {
          const plan = { id: makeId('plan'), spec_id: makeId('spec'), plot_graph: 'extracted_graph', scenes: [], arcs: [] };
          return ok(res, { plan, audit });
        }
        const spec = { id: makeId('spec'), title: 'Extracted Spec', synopsis: 'Recovered synopsis from artifact.', themes: [], constraints: [], cnl_constraints: [], characters: [], world_rules: [] };
        return ok(res, { spec, audit });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- Literary Review -----
    if (req.method === 'POST' && p === '/v1/review') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        const report = { report_id: makeId('review'), score: 0.75, findings: ['Stub review finding'], suggestions: ['Stub suggestion'] };
        addAudit('review.completed', 'agent:review');
        return ok(res, report);
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- Research -----
    if (req.method === 'POST' && p === '/v1/research/query') {
      try {
        const body = await parseJsonBody(req);
        if (!body.query) return errorResponse(res, 422, 'invalid_request', 'query is required', { field: 'query' });
        const results = [{ title: 'Stub research result', snippet: 'This is a stubbed research snippet.', source: 'internal_stub' }];
        return ok(res, { results, audit: addAudit('research.query', 'agent:research') });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- Explainability -----
    if (req.method === 'POST' && p === '/v1/explain') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        if (!body.question) return errorResponse(res, 422, 'invalid_request', 'question is required', { field: 'question' });
        return ok(res, { explanation: 'Stub explanation', evidence: ['Stub evidence'] });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- Compliance Reports -----
    if (req.method === 'POST' && p === '/v1/reports/compliance') {
      try {
        const body = await parseJsonBody(req);
        if (!body.artifact_ref) return errorResponse(res, 422, 'invalid_request', 'artifact_ref is required', { field: 'artifact_ref' });
        const report = {
          report_id: makeId('compliance'),
          status: 'pass',
          summary: 'Stub compliance report',
          findings: []
        };
        return ok(res, { ...report, audit: addAudit('report.compliance', 'agent:compliance') });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- CNL -----
    if (req.method === 'POST' && p === '/v1/cnl/validate') {
      try {
        const body = await parseJsonBody(req);
        if (!body.cnl_text) return errorResponse(res, 422, 'invalid_request', 'cnl_text is required', { field: 'cnl_text' });
        const { statements, errors } = validateText(body.cnl_text);
        return ok(res, { valid: errors.length === 0, errors, statements });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && p === '/v1/cnl/translate') {
      try {
        const body = await parseJsonBody(req);
        if (!body.nl_text) return errorResponse(res, 422, 'invalid_request', 'nl_text is required', { field: 'nl_text' });
        // Placeholder: real implementation uses an LLM + strict validator loop.
        return ok(res, { cnl_text: 'RULE(Document, must_include, \"constraints\").', confidence: 0.5 });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    // ----- VSA -----
    if (req.method === 'POST' && p === '/v1/vsa/encode') {
      try {
        const body = await parseJsonBody(req);
        if (!body.text) return errorResponse(res, 422, 'invalid_request', 'text is required', { field: 'text' });
        const dim = body.dim ? Number(body.dim) : 10000;
        const seed = body.seed ? Number(body.seed) : 42;
        const vector = encodeText(body.text, dim, seed);
        return ok(res, { vector, dim });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && p === '/v1/vsa/index') {
      try {
        const body = await parseJsonBody(req);
        const vectors = body.vectors;
        const ids = body.ids;
        if (!Array.isArray(vectors) || !Array.isArray(ids) || vectors.length !== ids.length) {
          return errorResponse(res, 422, 'invalid_request', 'vectors and ids arrays are required and must match in length');
        }
        for (let i = 0; i < ids.length; i++) {
          stores.vsaIndex.set(ids[i], vectors[i]);
        }
        return ok(res, { indexed: ids.length });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && p === '/v1/vsa/search') {
      try {
        const body = await parseJsonBody(req);
        const queryVector = body.query_vector;
        const topK = body.top_k ? Number(body.top_k) : 5;
        if (!Array.isArray(queryVector)) return errorResponse(res, 422, 'invalid_request', 'query_vector is required');
        const results = Array.from(stores.vsaIndex.entries()).map(([id, vec]) => ({ id, score: cosine(queryVector, vec) }));
        results.sort((a, b) => b.score - a.score);
        const sliced = results.slice(0, topK);
        return ok(res, { ids: sliced.map((r) => r.id), scores: sliced.map((r) => r.score) });
      } catch {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    return errorResponse(res, 404, 'not_found', 'Route not found', { path: p });
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
    console.log(`SCRIPTA API stub listening on http://localhost:${port}`);
  });
}

export { createApiHandler, createApiServer };
