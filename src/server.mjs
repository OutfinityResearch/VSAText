#!/usr/bin/env node
/**
 * SCRIPTA Story Forge - Minimal Persistence Server
 * 
 * This server ONLY handles persistence (save/load projects).
 * All processing (CNL parsing, metrics, generation) happens in the browser.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.SCRIPTA_DATA_DIR || path.join(__dirname, '..', 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

// Ensure directories exist
[DATA_DIR, PROJECTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
  return `proj_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function jsonResponse(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function errorResponse(res, statusCode, code, message) {
  jsonResponse(res, statusCode, { error: { code, message } });
}

async function parseBody(req, maxSize = 10_000_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > maxSize) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
  });
}

// ============================================
// PROJECT STORAGE
// ============================================

function getProjectPath(id) {
  return path.join(PROJECTS_DIR, `${id}.json`);
}

function listProjects() {
  const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), 'utf-8'));
      return {
        id: data.id,
        name: data.name || 'Untitled',
        genre: data.metadata?.genre || '',
        modified_at: data.modified_at || data.created_at,
        metrics_summary: data.metrics?.scores ? { nqs: data.metrics.scores.nqs } : null,
        group_count: data.structure?.groups?.length || 0,
        entity_count: Object.values(data.entities || {}).flat().length
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function loadProject(id) {
  const filepath = getProjectPath(id);
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

function saveProject(project) {
  if (!project.id) project.id = generateId();
  project.modified_at = new Date().toISOString();
  if (!project.created_at) project.created_at = project.modified_at;
  
  const filepath = getProjectPath(project.id);
  fs.writeFileSync(filepath, JSON.stringify(project, null, 2), 'utf-8');
  return project.id;
}

function deleteProject(id) {
  const filepath = getProjectPath(id);
  if (!fs.existsSync(filepath)) return false;
  fs.unlinkSync(filepath);
  return true;
}

// ============================================
// HTTP SERVER
// ============================================

function createServer() {
  return http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;
    const method = req.method;

    try {
      // Health check
      if (method === 'GET' && p === '/health') {
        return jsonResponse(res, 200, { 
          status: 'ok', 
          service: 'scripta-persistence',
          version: '2.0.0',
          timestamp: new Date().toISOString()
        });
      }

      // List projects
      if (method === 'GET' && p === '/v1/projects') {
        return jsonResponse(res, 200, { projects: listProjects() });
      }

      // Get project
      if (method === 'GET' && p.match(/^\/v1\/projects\/([^/]+)$/)) {
        const id = p.split('/').pop();
        const project = loadProject(id);
        if (!project) return errorResponse(res, 404, 'not_found', 'Project not found');
        return jsonResponse(res, 200, { project });
      }

      // Create project
      if (method === 'POST' && p === '/v1/projects') {
        const body = await parseBody(req);
        const id = saveProject(body);
        return jsonResponse(res, 201, { id, saved_at: new Date().toISOString() });
      }

      // Update project
      if (method === 'PUT' && p.match(/^\/v1\/projects\/([^/]+)$/)) {
        const id = p.split('/').pop();
        if (!loadProject(id)) return errorResponse(res, 404, 'not_found', 'Project not found');
        const body = await parseBody(req);
        body.id = id;
        saveProject(body);
        return jsonResponse(res, 200, { id, saved_at: new Date().toISOString() });
      }

      // Delete project
      if (method === 'DELETE' && p.match(/^\/v1\/projects\/([^/]+)$/)) {
        const id = p.split('/').pop();
        if (!deleteProject(id)) return errorResponse(res, 404, 'not_found', 'Project not found');
        return jsonResponse(res, 200, { deleted: true });
      }

      // Not found
      return errorResponse(res, 404, 'not_found', 'Endpoint not found');

    } catch (err) {
      if (err.message === 'invalid_json') {
        return errorResponse(res, 400, 'invalid_json', 'Invalid JSON in request body');
      }
      if (err.message === 'payload_too_large') {
        return errorResponse(res, 413, 'payload_too_large', 'Request body too large');
      }
      console.error('Server error:', err);
      return errorResponse(res, 500, 'internal_error', err.message);
    }
  });
}

// ============================================
// MAIN
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const server = createServer();
  
  server.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║         SCRIPTA Persistence Server                ║
╠═══════════════════════════════════════════════════╣
║  Endpoint:  http://localhost:${String(port).padEnd(5)}                ║
║  Data dir:  ${DATA_DIR.slice(-35).padEnd(35)}  ║
║                                                   ║
║  This server only handles persistence.            ║
║  All processing happens in the browser.           ║
╚═══════════════════════════════════════════════════╝
`);
  });
}

export { createServer };
