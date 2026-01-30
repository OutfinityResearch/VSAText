#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function resolveJsonPointer(doc, pointer) {
  if (!pointer || pointer === '' || pointer === '/') return doc;
  const parts = pointer.replace(/^\//, '').split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  let current = doc;
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function resolveRef(ref, basePath, store) {
  const [refPath, fragment] = ref.split('#');
  if (refPath) {
    const target = path.resolve(path.dirname(basePath), refPath);
    const doc = store.get(target) || readJson(target);
    store.set(target, doc);
    const pointer = fragment ? `/${fragment.replace(/^\//, '')}` : '';
    return resolveJsonPointer(doc, pointer);
  }
  const doc = store.get(basePath);
  const pointer = fragment ? `/${fragment.replace(/^\//, '')}` : '';
  return resolveJsonPointer(doc, pointer);
}

function exampleFromSchema(schema, basePath, store, seen) {
  if (!schema) return null;
  if (seen.has(schema)) return null;
  seen.add(schema);

  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, basePath, store);
    return exampleFromSchema(resolved, basePath, store, seen);
  }

  if (schema.const !== undefined) return schema.const;
  if (schema.enum && schema.enum.length) return schema.enum[0];

  if (schema.oneOf) return exampleFromSchema(schema.oneOf[0], basePath, store, seen);
  if (schema.anyOf) return exampleFromSchema(schema.anyOf[0], basePath, store, seen);
  if (schema.allOf) {
    const combined = {};
    for (const sub of schema.allOf) {
      const ex = exampleFromSchema(sub, basePath, store, seen);
      if (ex && typeof ex === 'object' && !Array.isArray(ex)) Object.assign(combined, ex);
    }
    return combined;
  }

  let schemaType = schema.type;
  if (Array.isArray(schemaType)) schemaType = schemaType.find((t) => t !== 'null') || schemaType[0];

  if (schemaType === 'object' || schema.properties) {
    const props = schema.properties || {};
    const required = schema.required || [];
    const obj = {};
    if (required.length) {
      for (const name of required) {
        if (props[name]) obj[name] = exampleFromSchema(props[name], basePath, store, seen);
      }
    } else {
      for (const [name, prop] of Object.entries(props)) {
        obj[name] = exampleFromSchema(prop, basePath, store, seen);
      }
    }
    return obj;
  }

  if (schemaType === 'array') {
    const item = exampleFromSchema(schema.items || {}, basePath, store, seen);
    return [item];
  }

  if (schemaType === 'string') {
    if (schema.format === 'date-time') return '2026-01-30T00:00:00Z';
    if (schema.pattern) return 'id_123456';
    return 'string';
  }

  if (schemaType === 'integer') return 0;
  if (schemaType === 'number') return 0.0;
  if (schemaType === 'boolean') return true;

  return null;
}

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

function main() {
  const args = parseArgs(process.argv);
  if (!args.schema || !args.def) {
    console.error('Usage: node scripts/generate_example_stub.mjs --schema <schema> --def <Definition> [--output file]');
    process.exit(1);
  }

  const schemaPath = path.resolve(args.schema);
  const store = new Map();
  const baseSchema = readJson(schemaPath);
  store.set(schemaPath, baseSchema);

  const defSchema = baseSchema.$defs ? baseSchema.$defs[args.def] : undefined;
  if (!defSchema) {
    console.error(`Definition not found: ${args.def}`);
    process.exit(1);
  }

  const example = exampleFromSchema(defSchema, schemaPath, store, new Set());
  const output = JSON.stringify(example, null, 2) + '\n';
  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), output, 'utf-8');
  } else {
    process.stdout.write(output);
  }
}

main();
