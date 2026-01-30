#!/usr/bin/env node

const PREDICATE_RE = /^[A-Z][A-Z0-9_]*$/;
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function splitArgs(argStr) {
  const args = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (const ch of argStr) {
    if (inString) {
      current += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      current += ch;
      continue;
    }
    if (ch === ',') {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  if (inString) return { args: [], error: 'unterminated string' };
  if (current || argStr.trim() === '') args.push(current.trim());
  return { args, error: '' };
}

function validateLine(line, lineNo) {
  const stripped = line.trim();
  if (!stripped || stripped.startsWith('#') || stripped.startsWith('//')) return { statement: null, error: null };
  if (!stripped.endsWith('.')) {
    return { statement: null, error: { line: lineNo, message: "statement must end with '.'" } };
  }
  const body = stripped.slice(0, -1).trim();
  if (!body.includes('(') || !body.endsWith(')')) {
    return { statement: null, error: { line: lineNo, message: 'statement must be predicate(args)' } };
  }
  const idx = body.indexOf('(');
  const predicate = body.slice(0, idx).trim();
  if (!predicate || !PREDICATE_RE.test(predicate)) {
    return { statement: null, error: { line: lineNo, message: 'predicate must be uppercase with underscores' } };
  }
  const argsBody = body.slice(idx + 1, -1).trim();
  const { args, error } = splitArgs(argsBody);
  if (error) return { statement: null, error: { line: lineNo, message: error } };
  const argList = argsBody === '' ? [] : args;
  for (let i = 0; i < argList.length; i++) {
    const arg = argList[i];
    if (!arg) return { statement: null, error: { line: lineNo, message: `empty argument at position ${i + 1}` } };
    if (arg.startsWith('"')) {
      if (!(arg.length >= 2 && arg.endsWith('"'))) {
        return { statement: null, error: { line: lineNo, message: `unterminated string at argument ${i + 1}` } };
      }
      continue;
    }
    if (NUMBER_RE.test(arg)) {
      continue;
    }
    if (!IDENT_RE.test(arg)) {
      return { statement: null, error: { line: lineNo, message: `invalid identifier: ${arg}` } };
    }
  }
  return { statement: { predicate, args: argList }, error: null };
}

export function validateText(text) {
  const statements = [];
  const errors = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const { statement, error } = validateLine(line, index + 1);
    if (error) errors.push(error);
    if (statement) statements.push(statement);
  });
  return { statements, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('usage: validator.mjs <file.cnl>');
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, 'utf-8');
  const { statements, errors } = validateText(text);
  const output = {
    valid: errors.length === 0,
    errors,
    statements
  };
  console.log(JSON.stringify(output, null, 2));
  process.exit(output.valid ? 0 : 2);
}
