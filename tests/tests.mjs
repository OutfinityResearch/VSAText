import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { validateText } from '../src/cnl/validator.mjs';
import { encodeText, cosine } from '../src/vsa/encoder.mjs';
import { createApiServer } from '../src/server.mjs';
import { execFileSync } from 'child_process';

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
  execFileSync('node', [path.join(ROOT, 'scripts', 'validate_examples.mjs')], { stdio: 'pipe' });
}

async function testServerEndpoints() {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
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
