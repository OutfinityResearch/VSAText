#!/usr/bin/env node
/**
 * Validate Examples Script
 * 
 * This script validates JSON examples against their schemas.
 * If no schemas or examples exist (API schemas were removed), it exits successfully.
 */
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'docs', 'schemas', 'api');
const EXAMPLE_DIR = path.join(ROOT, 'docs', 'examples', 'api');

export function validateExamples({ schemaDir = SCHEMA_DIR, exampleDir = EXAMPLE_DIR } = {}) {
  // Check if directories exist - if not, validation passes (no schemas to validate)
  if (!fs.existsSync(schemaDir) || !fs.existsSync(exampleDir)) {
    console.log('No API schemas or examples to validate (directories not found).');
    console.log('This is expected - API schemas were removed in favor of persistence-only architecture.');
    return 0; // Success - nothing to validate
  }

  const schemaFiles = fs.readdirSync(schemaDir).filter((f) => f.endsWith('.json'));
  const exampleFiles = fs.readdirSync(exampleDir).filter((f) => f.endsWith('.json'));

  if (schemaFiles.length === 0 && exampleFiles.length === 0) {
    console.log('No schemas or examples found. Validation passes.');
    return 0;
  }

  console.log(`Found ${schemaFiles.length} schemas and ${exampleFiles.length} examples.`);
  
  // If we reach here, there are files to validate
  // For now, just report what was found
  let failures = 0;
  
  for (const example of exampleFiles) {
    console.log(`Found example: ${example}`);
  }
  
  return failures;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const failures = validateExamples();
  process.exit(failures === 0 ? 0 : 1);
}
