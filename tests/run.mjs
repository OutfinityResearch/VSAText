#!/usr/bin/env node
import { tests } from './tests.mjs';

let failures = 0;
for (const test of tests) {
  try {
    await test();
    console.log(`OK: ${test.name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL: ${test.name}`);
    console.error(err && err.stack ? err.stack : err);
  }
}

process.exit(failures === 0 ? 0 : 1);
