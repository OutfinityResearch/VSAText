#!/usr/bin/env node
/**
 * SCRIPTA SDK - Test Runner
 * 
 * Discovers and runs all test files in the tests/ directory.
 * Tests are organized by use case in subdirectories.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find all test files
async function discoverTests() {
  const testFiles = [];
  
  const dirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.test.mjs'));
    
    for (const file of files) {
      testFiles.push(path.join(dir, file));
    }
  }
  
  // Also include legacy tests.mjs if exists
  if (fs.existsSync(path.join(__dirname, 'tests.mjs'))) {
    testFiles.push('tests.mjs');
  }
  
  return testFiles;
}

// Run tests from a module
async function runTestsFromModule(modulePath, stats) {
  const module = await import('./' + modulePath);
  
  // Get all exported functions that look like tests
  const testFunctions = Object.entries(module)
    .filter(([name, fn]) => typeof fn === 'function' && name.startsWith('test'))
    .map(([name, fn]) => ({ name, fn }));
  
  // Also support legacy 'tests' array export
  if (module.tests && Array.isArray(module.tests)) {
    for (const fn of module.tests) {
      testFunctions.push({ name: fn.name, fn });
    }
  }
  
  for (const { name, fn } of testFunctions) {
    try {
      await fn();
      console.log(`OK: ${name}`);
      stats.passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(err && err.stack ? err.stack : err);
      stats.failed++;
    }
  }
}

// Main
async function main() {
  console.log('SCRIPTA SDK Test Suite\n');
  
  const testFiles = await discoverTests();
  const stats = { passed: 0, failed: 0 };
  
  for (const file of testFiles) {
    console.log(`\n--- ${file} ---`);
    try {
      await runTestsFromModule(file, stats);
    } catch (err) {
      console.error(`Error loading ${file}:`, err.message);
      stats.failed++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Total: ${stats.passed + stats.failed} tests`);
  console.log(`Passed: ${stats.passed}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`========================================`);
  
  process.exit(stats.failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
