#!/usr/bin/env node
import fs from 'fs';
import { validateText } from './validator.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[name] = value;
    }
  }
  return args;
}

function loadInput(args) {
  if (args.text) return args.text;
  if (args.file) return fs.readFileSync(args.file, 'utf-8');
  if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf-8');
  console.error('No input provided. Use --text, --file, or pipe via stdin.');
  process.exit(1);
}

const args = parseArgs(process.argv);
const text = loadInput(args);
const { statements, errors } = validateText(text);
const output = {
  valid: errors.length === 0,
  errors,
  statements
};
console.log(JSON.stringify(output, null, 2));
process.exit(output.valid ? 0 : 2);
