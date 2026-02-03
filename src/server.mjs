#!/usr/bin/env node
/**
 * SCRIPTA Persistence Server
 * 
 * Minimal HTTP server for project persistence only.
 * All processing (CNL parsing, metrics, generation) happens in the browser.
 */

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initStorage,
  listProjects,
  loadProject,
  saveProject,
  deleteProject
} from './storage/projects.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.SCRIPTA_DATA_DIR || path.join(__dirname, '..', 'data');

// Initialize storage
initStorage(DATA_DIR);

// ============================================
// HTTP UTILITIES
// ============================================

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
          version: '0.1.0',
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
