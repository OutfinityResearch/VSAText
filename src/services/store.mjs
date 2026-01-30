/**
 * JSON File-based Persistence Store
 * Zero dependencies - uses only Node.js built-in modules
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.SCRIPTA_DATA_DIR || path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Simple JSON file store with in-memory caching
 */
class JsonStore {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.cache = null;
    this.dirty = false;
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.cache = JSON.parse(data);
      } else {
        this.cache = {};
      }
    } catch (err) {
      console.error(`Error loading store ${this.name}:`, err.message);
      this.cache = {};
    }
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), 'utf-8');
      this.dirty = false;
    } catch (err) {
      console.error(`Error saving store ${this.name}:`, err.message);
    }
  }

  get(id) {
    return this.cache[id] || null;
  }

  set(id, value) {
    this.cache[id] = value;
    this.dirty = true;
    this._save();
    return value;
  }

  delete(id) {
    if (this.cache[id]) {
      delete this.cache[id];
      this.dirty = true;
      this._save();
      return true;
    }
    return false;
  }

  has(id) {
    return id in this.cache;
  }

  values() {
    return Object.values(this.cache);
  }

  entries() {
    return Object.entries(this.cache);
  }

  keys() {
    return Object.keys(this.cache);
  }

  size() {
    return Object.keys(this.cache).length;
  }

  clear() {
    this.cache = {};
    this.dirty = true;
    this._save();
  }

  filter(predicate) {
    return Object.values(this.cache).filter(predicate);
  }

  find(predicate) {
    return Object.values(this.cache).find(predicate);
  }
}

// Singleton stores for each entity type
const stores = {
  specs: new JsonStore('specs'),
  sops: new JsonStore('sops'),
  plans: new JsonStore('plans'),
  generateJobs: new JsonStore('generate_jobs'),
  verifyReports: new JsonStore('verify_reports'),
  guardrailReports: new JsonStore('guardrail_reports'),
  evaluationReports: new JsonStore('evaluation_reports'),
  pipelineRuns: new JsonStore('pipeline_runs'),
  audit: new JsonStore('audit'),
  vsaIndex: new JsonStore('vsa_index'),
  apiKeys: new JsonStore('api_keys'),
  drafts: new JsonStore('drafts'),
  reviews: new JsonStore('reviews'),
  research: new JsonStore('research'),
  compliance: new JsonStore('compliance')
};

export { JsonStore, stores, DATA_DIR };
