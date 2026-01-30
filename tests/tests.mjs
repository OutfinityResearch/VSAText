import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { Readable } from 'stream';
import { validateText } from '../src/cnl/validator.mjs';
import { encodeText, cosine } from '../src/vsa/encoder.mjs';
import { createApiHandler } from '../src/server.mjs';
import { validateExamples } from '../scripts/validate_examples.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function testCnlValidator() {
  const valid = 'CHARACTER(Anna).\nTRAIT(Anna, courageous).';
  const invalid = 'character(anna).';
  const ok = validateText(valid);
  assert.strictEqual(ok.errors.length, 0);
  const bad = validateText(invalid);
  assert.ok(bad.errors.length > 0);
}

function testVsaEncoderDeterministic() {
  const vec1 = encodeText('storm at sea', 128, 42);
  const vec2 = encodeText('storm at sea', 128, 42);
  assert.deepStrictEqual(vec1, vec2);
  const vec3 = encodeText('calm harbor', 128, 42);
  const simSame = cosine(vec1, vec2);
  const simDiff = cosine(vec1, vec3);
  assert.ok(simSame >= simDiff);
}

function testExamplesValidatorCli() {
  const failures = validateExamples();
  assert.strictEqual(failures, 0);
}

async function testServerEndpoints() {
  const { handler } = createApiHandler();

  async function call({ method, urlPath, body }) {
    const reqBody = body ? Buffer.from(body, 'utf-8') : null;
    const req = reqBody ? Readable.from([reqBody]) : Readable.from([]);
    req.method = method;
    req.url = urlPath;
    req.headers = { host: 'localhost', 'content-type': 'application/json' };
    req.destroy = () => {};

    return await new Promise((resolve) => {
      const res = {
        statusCode: 200,
        headers: {},
        body: '',
        writeHead(code, headers) {
          this.statusCode = code;
          this.headers = headers || {};
        },
        end(chunk) {
          if (chunk) this.body += chunk.toString('utf-8');
          resolve(this);
        }
      };
      handler(req, res);
    });
  }

  const health = await call({ method: 'GET', urlPath: '/health' });
  assert.strictEqual(health.statusCode, 200);
  const healthJson = JSON.parse(health.body);
  assert.strictEqual(healthJson.status, 'ok');

  const cnlRes = await call({ method: 'POST', urlPath: '/v1/cnl/validate', body: JSON.stringify({ cnl_text: 'CHARACTER(Anna).' }) });
  assert.strictEqual(cnlRes.statusCode, 200);
  const cnlJson = JSON.parse(cnlRes.body);
  assert.strictEqual(cnlJson.valid, true);

  const vsaRes = await call({ method: 'POST', urlPath: '/v1/vsa/encode', body: JSON.stringify({ text: 'storm at sea', dim: 64, seed: 7 }) });
  assert.strictEqual(vsaRes.statusCode, 200);
  const vsaJson = JSON.parse(vsaRes.body);
  assert.strictEqual(vsaJson.dim, 64);

  const specCreate = await call({ method: 'POST', urlPath: '/v1/specs', body: JSON.stringify({ spec: { id: 'spec_test', title: 'Test Spec' } }) });
  assert.strictEqual(specCreate.statusCode, 200);
  const specCreateJson = JSON.parse(specCreate.body);
  assert.strictEqual(specCreateJson.spec.id, 'spec_test');

  const specGet = await call({ method: 'GET', urlPath: '/v1/specs/spec_test' });
  assert.strictEqual(specGet.statusCode, 200);
  const specGetJson = JSON.parse(specGet.body);
  assert.strictEqual(specGetJson.spec.title, 'Test Spec');

  const planCreate = await call({ method: 'POST', urlPath: '/v1/plans', body: JSON.stringify({ spec_id: 'spec_test' }) });
  assert.strictEqual(planCreate.statusCode, 200);
  const planCreateJson = JSON.parse(planCreate.body);
  assert.ok(planCreateJson.plan.id);

  const genCreate = await call({ method: 'POST', urlPath: '/v1/generate', body: JSON.stringify({ plan_id: planCreateJson.plan.id, scene_id: 'scene_1' }) });
  assert.strictEqual(genCreate.statusCode, 200);
  const genCreateJson = JSON.parse(genCreate.body);
  assert.ok(genCreateJson.job_id);

  const genGet = await call({ method: 'GET', urlPath: `/v1/generate/${genCreateJson.job_id}` });
  assert.strictEqual(genGet.statusCode, 200);
  const genGetJson = JSON.parse(genGet.body);
  assert.strictEqual(genGetJson.status, 'completed');
  assert.ok(Array.isArray(genGetJson.output_refs));

  const verifyCreate = await call({ method: 'POST', urlPath: '/v1/verify', body: JSON.stringify({ spec_id: 'spec_test', artifact_ref: { id: 'draft_1', type: 'draft' } }) });
  assert.strictEqual(verifyCreate.statusCode, 200);
  const verifyJson = JSON.parse(verifyCreate.body);
  assert.ok(verifyJson.report_id);

  const reviewRes = await call({ method: 'POST', urlPath: '/v1/review', body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, criteria: ['pacing'] }) });
  assert.strictEqual(reviewRes.statusCode, 200);
  const reviewJson = JSON.parse(reviewRes.body);
  assert.ok(reviewJson.report_id);

  const reverseRes = await call({ method: 'POST', urlPath: '/v1/reverse-engineer', body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, output: 'spec' }) });
  assert.strictEqual(reverseRes.statusCode, 200);
  const reverseJson = JSON.parse(reverseRes.body);
  assert.ok(reverseJson.spec);

  const researchRes = await call({ method: 'POST', urlPath: '/v1/research/query', body: JSON.stringify({ query: 'What is a storm surge?' }) });
  assert.strictEqual(researchRes.statusCode, 200);
  const researchJson = JSON.parse(researchRes.body);
  assert.ok(Array.isArray(researchJson.results));

  const explainRes = await call({ method: 'POST', urlPath: '/v1/explain', body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, question: 'Why?' }) });
  assert.strictEqual(explainRes.statusCode, 200);
  const explainJson = JSON.parse(explainRes.body);
  assert.ok(explainJson.explanation);

  const complianceRes = await call({ method: 'POST', urlPath: '/v1/reports/compliance', body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, policies: ['bias'] }) });
  assert.strictEqual(complianceRes.statusCode, 200);
  const complianceJson = JSON.parse(complianceRes.body);
  assert.ok(complianceJson.report_id);
}

function testEvalExamplesCnl() {
  const evalPath = path.join(ROOT, 'docs', 'evals', 'scripta_nl_cnl.jsonl');
  const lines = fs.readFileSync(evalPath, 'utf-8').trim().split(/\r?\n/);
  for (const line of lines) {
    const item = JSON.parse(line);
    const { errors } = validateText(item.cnl);
    assert.strictEqual(errors.length, 0, `CNL errors for ${item.id}`);
  }
}

export const tests = [
  testCnlValidator,
  testVsaEncoderDeterministic,
  testExamplesValidatorCli,
  testServerEndpoints,
  testEvalExamplesCnl
];
