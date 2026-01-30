#!/usr/bin/env node
/*
  Traceability checker for SCRIPTA.

  - Reads docs/specs/DS19-Traceability-Matrix.md
  - Emits warnings when referenced artifacts are missing or inconsistent
  - No external dependencies
*/

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[name] = value;
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function splitCsv(value) {
  const normalized = value.trim();
  if (!normalized) return [];
  if (normalized.toLowerCase() === 'none' || normalized.toLowerCase() === '(none)') return [];
  return normalized
    .split(/\s*,\s*|\s*\+\s*/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.toLowerCase() !== 'none' && s.toLowerCase() !== '(none)');
}

function findDsFile(dsDir, dsId) {
  const files = listFiles(dsDir);
  const prefix = `${dsId}-`;
  const found = files.find((f) => f.startsWith(prefix) && f.endsWith('.md'));
  return found ? path.join(dsDir, found) : null;
}

function extractField(body, fieldName) {
  const re = new RegExp(`^\\-\\s+${fieldName}:\\s+(.+)$`, 'm');
  const m = body.match(re);
  return m ? m[1].trim() : null;
}

function extractRequirementId(heading) {
  const m = heading.match(/\b(BR|SR|NFR)-\d+\b/);
  return m ? m[0] : null;
}

function endpointPathFromEntry(entry) {
  const m = entry.match(/\/v1\/[^\s,]+/);
  if (!m) return null;
  return m[0].split('?')[0];
}

function patternToRegex(pattern) {
  // Supports '*' only.
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const reStr = '^' + escaped.replace(/\*/g, '.*') + '$';
  return new RegExp(reStr);
}

function loadEvalsIds(evalsPath) {
  const ids = new Set();
  if (!fileExists(evalsPath)) return ids;
  const text = readText(evalsPath).trim();
  if (!text) return ids;
  for (const line of text.split(/\r?\n/)) {
    try {
      const obj = JSON.parse(line);
      if (obj && typeof obj.id === 'string') ids.add(obj.id);
    } catch {
      // ignore
    }
  }
  return ids;
}

function warn(warnings, reqId, msg) {
  warnings.push({ reqId, msg });
}

function main() {
  const args = parseArgs(process.argv);

  const matrixPath = path.resolve(ROOT, args.matrix || 'docs/specs/DS19-Traceability-Matrix.md');
  const dsDir = path.resolve(ROOT, args['ds-dir'] || 'docs/specs');
  const schemaDir = path.resolve(ROOT, args['schema-dir'] || 'docs/schemas/api');
  const exampleDir = path.resolve(ROOT, args['example-dir'] || 'docs/examples/api');
  const evalsPath = path.resolve(ROOT, args.evals || 'docs/evals/scripta_nl_cnl.jsonl');
  const apiSpecPath = path.resolve(ROOT, args['api-spec'] || 'docs/specs/DS02-API.md');
  const serverPath = path.resolve(ROOT, args.server || 'src/server.mjs');

  const failOnWarn = Boolean(args['fail-on-warn']);

  const warnings = [];

  if (!fileExists(matrixPath)) {
    console.error(`ERROR: Traceability matrix not found: ${matrixPath}`);
    process.exit(2);
  }

  const matrix = readText(matrixPath);
  const apiSpec = fileExists(apiSpecPath) ? readText(apiSpecPath) : '';
  const serverSrc = fileExists(serverPath) ? readText(serverPath) : '';
  const testsSrc = fileExists(path.resolve(ROOT, 'tests/tests.mjs')) ? readText(path.resolve(ROOT, 'tests/tests.mjs')) : '';

  const evalIds = loadEvalsIds(evalsPath);

  const blocks = [];
  const re = /^###\s+([^\n]+)\n([\s\S]*?)(?=^###\s+|\Z)/gm;
  let m;
  while ((m = re.exec(matrix)) !== null) {
    blocks.push({ heading: m[1], body: m[2] });
  }

  if (blocks.length === 0) {
    console.error('ERROR: No requirement sections found in DS19. Expected headings starting with "###".');
    process.exit(2);
  }

  const seenReq = new Set();
  for (const block of blocks) {
    const reqId = extractRequirementId(block.heading);
    if (!reqId) {
      warn(warnings, 'UNKNOWN', `Unparseable requirement heading: ${block.heading}`);
      continue;
    }
    if (seenReq.has(reqId)) {
      warn(warnings, reqId, 'Duplicate requirement ID in DS19');
    }
    seenReq.add(reqId);

    const dsField = extractField(block.body, 'DS');
    const apiField = extractField(block.body, 'API');
    const schemaField = extractField(block.body, 'Schemas');
    const examplesField = extractField(block.body, 'Examples');
    const testsField = extractField(block.body, 'Tests');
    const evalsField = extractField(block.body, 'Evals');
    const statusField = extractField(block.body, 'Status') || '';

    // DS checks
    if (dsField) {
      for (const dsId of splitCsv(dsField)) {
        const dsPath = findDsFile(dsDir, dsId);
        if (!dsPath) {
          warn(warnings, reqId, `Missing DS file for ${dsId} in ${dsDir}`);
        }
      }
    }

    // API checks (against DS02 and optionally server for static routes)
    if (apiField && apiSpec) {
      for (const entry of splitCsv(apiField)) {
        const ep = endpointPathFromEntry(entry);
        if (!ep) {
          warn(warnings, reqId, `Could not parse endpoint from API entry: ${entry}`);
          continue;
        }
        if (!apiSpec.includes(ep)) {
          warn(warnings, reqId, `Endpoint not found in DS02 API spec: ${ep}`);
        }

        // If we claim stub implementation, ensure static endpoints exist in server.
        const isStub = statusField.toLowerCase().includes('implemented (stub)');
        const isStatic = !ep.includes('{') && !ep.includes('}');
        if (isStub && isStatic && serverSrc) {
          const matchStr1 = `p === '${ep}'`;
          const matchStr2 = `p === "${ep}"`;
          const matchStr3 = `p === \`${ep}\``;
          const likelyExists = serverSrc.includes(matchStr1) || serverSrc.includes(matchStr2) || serverSrc.includes(matchStr3);
          if (!likelyExists) {
            warn(warnings, reqId, `Endpoint marked stubbed but not found as a static route in server: ${ep}`);
          }
        }
      }
    }

    // Schema checks
    if (schemaField) {
      for (const schemaName of splitCsv(schemaField)) {
        const cleaned = schemaName.replace(/\(.*/, '').trim();
        const schemaPath = path.join(schemaDir, cleaned);
        if (!fileExists(schemaPath)) {
          warn(warnings, reqId, `Missing schema file: ${cleaned}`);
        }
      }
    }

    // Examples checks
    if (examplesField) {
      const exampleFiles = listFiles(exampleDir);
      for (const pattern of splitCsv(examplesField)) {
        const regex = patternToRegex(pattern);
        const matches = exampleFiles.filter((f) => regex.test(f));
        if (matches.length === 0) {
          warn(warnings, reqId, `No API examples match pattern: ${pattern}`);
        }
      }
    }

    // Tests checks
    if (testsField) {
      for (const testRef of splitCsv(testsField)) {
        // Accept three forms:
        // 1) file:function (tests/tests.mjs:testServerEndpoints)
        // 2) file only (scripts/validate_examples.mjs)
        // 3) function only (testServerEndpoints) -> defaults to tests/tests.mjs
        const hasColon = testRef.includes(':');
        const looksLikeFile = testRef.includes('/') || testRef.endsWith('.mjs');

        let filePart = null;
        let symbol = null;

        if (hasColon) {
          [filePart, symbol] = testRef.split(':');
        } else if (looksLikeFile) {
          filePart = testRef;
        } else {
          filePart = 'tests/tests.mjs';
          symbol = testRef;
        }

        const testPath = path.resolve(ROOT, filePart);
        if (!fileExists(testPath)) {
          warn(warnings, reqId, `Missing test file: ${filePart}`);
          continue;
        }

        if (symbol) {
          const testFileText = testPath.endsWith('tests/tests.mjs') ? testsSrc : readText(testPath);
          const fnRe = new RegExp(`\\bfunction\\s+${symbol}\\b`);
          if (!fnRe.test(testFileText)) {
            warn(warnings, reqId, `Test function not found: ${filePart}:${symbol}`);
          }
        }
      }
    }

    // Evals checks
    if (evalsField) {
      const normalized = evalsField.trim().toLowerCase();
      if (normalized === 'all' || normalized.startsWith('all evals')) {
        if (!fileExists(evalsPath)) {
          warn(warnings, reqId, `Missing evals file: ${path.relative(ROOT, evalsPath)}`);
        } else if (evalIds.size === 0) {
          warn(warnings, reqId, `Evals file is empty or unreadable: ${path.relative(ROOT, evalsPath)}`);
        }
      } else {
        for (const evalId of splitCsv(evalsField)) {
          if (!evalIds.has(evalId)) {
            warn(warnings, reqId, `Missing eval ID in ${path.relative(ROOT, evalsPath)}: ${evalId}`);
          }
        }
      }
    }
  }

  // Summary
  if (warnings.length === 0) {
    console.log('Traceability check: OK (no warnings)');
    process.exit(0);
  }

  console.log(`Traceability check: ${warnings.length} warning(s)`);
  for (const w of warnings) {
    console.log(`WARN [${w.reqId}] ${w.msg}`);
  }

  process.exit(failOnWarn ? 1 : 0);
}

main();
