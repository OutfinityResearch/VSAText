#!/usr/bin/env node
import fs from 'fs';
import { encodeText, cosine } from './encoder.mjs';

class VsaIndex {
  constructor(dim = 10000, seed = 42) {
    this.dim = dim;
    this.seed = seed;
    this.vectors = {};
  }

  add(id, text) {
    this.vectors[id] = encodeText(text, this.dim, this.seed);
  }

  addVector(id, vector) {
    this.vectors[id] = vector;
  }

  search(queryText, topK = 5) {
    const queryVec = encodeText(queryText, this.dim, this.seed);
    const scored = Object.entries(this.vectors).map(([id, vec]) => [id, cosine(queryVec, vec)]);
    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, topK);
  }

  save(filePath) {
    const payload = { dim: this.dim, seed: this.seed, vectors: this.vectors };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  }

  static load(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const index = new VsaIndex(data.dim, data.seed);
    index.vectors = data.vectors || {};
    return index;
  }
}

function parseArgs(argv) {
  const args = { add: [] };
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      if (name === 'add') {
        const id = argv[++i];
        const text = argv[++i];
        if (id && text) args.add.push([id, text]);
      } else {
        const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
        args[name] = value;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const dim = args.dim ? Number(args.dim) : 10000;
const seed = args.seed ? Number(args.seed) : 42;
const index = args.load ? VsaIndex.load(args.load) : new VsaIndex(dim, seed);

for (const [id, text] of args.add) {
  index.add(id, text);
}

if (args.search) {
  const topK = args['top-k'] ? Number(args['top-k']) : 5;
  const results = index.search(args.search, topK).map(([id, score]) => ({ id, score }));
  console.log(JSON.stringify({ query: args.search, results }, null, 2));
} else {
  console.log(JSON.stringify({ indexed: Object.keys(index.vectors).length }, null, 2));
}

if (args.save) {
  index.save(args.save);
}
