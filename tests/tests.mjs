import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { validateText } from '../src/cnl/validator.mjs';
import { encodeText, cosine } from '../src/vsa/encoder.mjs';
import { createApiServer } from '../src/server.mjs';
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
  const server = createApiServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const health = await fetch(`${base}/health`);
  assert.strictEqual(health.status, 200);
  const healthJson = await health.json();
  assert.strictEqual(healthJson.status, 'ok');

  const cnlRes = await fetch(`${base}/v1/cnl/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnl_text: 'CHARACTER(Anna).' })
  });
  assert.strictEqual(cnlRes.status, 200);
  const cnlJson = await cnlRes.json();
  assert.strictEqual(cnlJson.valid, true);

  const vsaRes = await fetch(`${base}/v1/vsa/encode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'storm at sea', dim: 64, seed: 7 })
  });
  assert.strictEqual(vsaRes.status, 200);
  const vsaJson = await vsaRes.json();
  assert.strictEqual(vsaJson.dim, 64);

  const specCreate = await fetch(`${base}/v1/specs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec: { id: 'spec_test', title: 'Test Spec' } })
  });
  assert.strictEqual(specCreate.status, 200);
  const specCreateJson = await specCreate.json();
  assert.strictEqual(specCreateJson.spec.id, 'spec_test');

  const specGet = await fetch(`${base}/v1/specs/spec_test`);
  assert.strictEqual(specGet.status, 200);
  const specGetJson = await specGet.json();
  assert.strictEqual(specGetJson.spec.title, 'Test Spec');

  const planCreate = await fetch(`${base}/v1/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec_id: 'spec_test' })
  });
  assert.strictEqual(planCreate.status, 200);
  const planCreateJson = await planCreate.json();
  assert.ok(planCreateJson.plan.id);

  const genCreate = await fetch(`${base}/v1/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_id: planCreateJson.plan.id, scene_id: 'scene_1' })
  });
  assert.strictEqual(genCreate.status, 200);
  const genCreateJson = await genCreate.json();
  assert.ok(genCreateJson.job_id);

  const genGet = await fetch(`${base}/v1/generate/${genCreateJson.job_id}`);
  assert.strictEqual(genGet.status, 200);
  const genGetJson = await genGet.json();
  assert.strictEqual(genGetJson.status, 'completed');
  assert.ok(Array.isArray(genGetJson.output_refs));

  const verifyCreate = await fetch(`${base}/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec_id: 'spec_test', artifact_ref: { id: 'draft_1', type: 'draft' } })
  });
  assert.strictEqual(verifyCreate.status, 200);
  const verifyJson = await verifyCreate.json();
  assert.ok(verifyJson.report_id);

  const reviewRes = await fetch(`${base}/v1/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, criteria: ['pacing'] })
  });
  assert.strictEqual(reviewRes.status, 200);
  const reviewJson = await reviewRes.json();
  assert.ok(reviewJson.report_id);

  const reverseRes = await fetch(`${base}/v1/reverse-engineer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, output: 'spec' })
  });
  assert.strictEqual(reverseRes.status, 200);
  const reverseJson = await reverseRes.json();
  assert.ok(reverseJson.spec);

  const researchRes = await fetch(`${base}/v1/research/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What is a storm surge?' })
  });
  assert.strictEqual(researchRes.status, 200);
  const researchJson = await researchRes.json();
  assert.ok(Array.isArray(researchJson.results));

  const explainRes = await fetch(`${base}/v1/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, question: 'Why?' })
  });
  assert.strictEqual(explainRes.status, 200);
  const explainJson = await explainRes.json();
  assert.ok(explainJson.explanation);

  const complianceRes = await fetch(`${base}/v1/reports/compliance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifact_ref: { id: 'draft_1', type: 'draft' }, policies: ['bias'] })
  });
  assert.strictEqual(complianceRes.status, 200);
  const complianceJson = await complianceRes.json();
  assert.ok(complianceJson.report_id);

  server.close();
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
