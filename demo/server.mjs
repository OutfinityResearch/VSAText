#!/usr/bin/env node
/**
 * SCRIPTA Story Forge Demo Server
 * 
 * Combined server that:
 * - Serves the Story Forge UI (static files)
 * - Handles project persistence (/v1/projects)
 * 
 * All processing (CNL parsing, metrics, generation) happens in the browser.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = __dirname;
const DATA_DIR = process.env.SCRIPTA_DATA_DIR || '/tmp/scripta_storage';
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

// Ensure directories exist
[DATA_DIR, PROJECTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================
// MIME TYPES
// ============================================

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
  return `proj_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Sanitize a string to be used as a filename
 */
function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return null;
  // Remove/replace invalid filename characters
  return name
    .trim()
    .toLowerCase()
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_')          // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, '')     // Keep only word chars, dash, underscore, dot
    .substring(0, 100);            // Limit length
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
// STATIC FILE SERVER
// ============================================

const ROOT_DIR = path.join(__dirname, '..');

function serveStatic(req, res) {
  let filePath = req.url.split('?')[0]; // Remove query string
  if (filePath === '/') filePath = '/index.html';
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  
  // Try demo directory first, then root for src/ files
  let fullPath = path.join(DEMO_DIR, filePath);
  
  // If file doesn't exist in demo, check if it's a src/ request
  if (!fs.existsSync(fullPath) && filePath.startsWith('/src/')) {
    fullPath = path.join(ROOT_DIR, filePath);
  }
  
  // Also handle ../src/ requests from modules
  if (!fs.existsSync(fullPath) && filePath.includes('src/')) {
    const srcPath = filePath.substring(filePath.indexOf('src/'));
    fullPath = path.join(ROOT_DIR, srcPath);
  }
  
  // Handle /docs/theory/ requests - serve from ROOT/docs/theory/
  if (!fs.existsSync(fullPath) && filePath.startsWith('/docs/theory/')) {
    fullPath = path.join(ROOT_DIR, filePath);
  }
  
  // Security check - must be within demo, root/src, or root/docs/theory
  const isInDemo = fullPath.startsWith(DEMO_DIR);
  const isInSrc = fullPath.startsWith(path.join(ROOT_DIR, 'src'));
  const isInDocsTheory = fullPath.startsWith(path.join(ROOT_DIR, 'docs', 'theory'));
  
  if (!isInDemo && !isInSrc && !isInDocsTheory) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + filePath);
      return;
    }
    
    const ext = path.extname(fullPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

// ============================================
// PROJECT STORAGE
// ============================================

function getProjectPath(id) {
  // Sanitize id to prevent directory traversal
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(PROJECTS_DIR, `${safeId}.json`);
}

/**
 * Get project path by name (for saving with story name)
 */
function getProjectPathByName(name) {
  const safeName = sanitizeFilename(name);
  if (!safeName) return null;
  return path.join(PROJECTS_DIR, `${safeName}.json`);
}

/**
 * Find project by name
 */
function findProjectByName(name) {
  const safeName = sanitizeFilename(name);
  if (!safeName) return null;
  const filepath = path.join(PROJECTS_DIR, `${safeName}.json`);
  if (fs.existsSync(filepath)) {
    try {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
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
  // Try to use project name as filename if no ID exists
  if (!project.id) {
    const nameBasedPath = getProjectPathByName(project.name);
    if (nameBasedPath) {
      // Check if a project with this name already exists
      const existing = findProjectByName(project.name);
      if (existing) {
        // Use existing project's ID
        project.id = existing.id;
      } else {
        // Create new ID based on sanitized name
        const safeName = sanitizeFilename(project.name);
        project.id = safeName || generateId();
      }
    } else {
      project.id = generateId();
    }
  }
  
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

function createDemoServer() {
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
          service: 'scripta-story-forge',
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

      // ============================================
      // LLM GENERATION ENDPOINTS
      // ============================================
      
      // Generate story with LLM
      if (method === 'POST' && p === '/v1/generate/llm') {
        const body = await parseBody(req);
        try {
          const llmGenerator = await import('./services/llm-generator.mjs');
          
          if (llmGenerator.isLLMAvailable()) {
            const result = await llmGenerator.generateStoryWithLLM(body);
            return jsonResponse(res, 200, result);
          } else {
            // Fallback to structured generation without LLM
            const result = llmGenerator.generateStoryFallback(body);
            return jsonResponse(res, 200, { 
              ...result, 
              _fallback: true,
              _message: 'Generated using fallback mode (LLM not available)'
            });
          }
        } catch (err) {
          console.error('LLM generation error:', err);
          return errorResponse(res, 500, 'llm_error', err.message);
        }
      }
      
      // Refine story with LLM
      if (method === 'POST' && p === '/v1/generate/refine') {
        const body = await parseBody(req);
        try {
          const llmGenerator = await import('./services/llm-generator.mjs');
          
          if (llmGenerator.isLLMAvailable()) {
            const result = await llmGenerator.refineStoryWithLLM(body.project, body.options);
            return jsonResponse(res, 200, result);
          } else {
            // Return empty suggestions if LLM not available
            return jsonResponse(res, 200, { 
              suggestions: null,
              _message: 'LLM not available for refinement'
            });
          }
        } catch (err) {
          console.error('LLM refinement error:', err);
          return errorResponse(res, 500, 'llm_error', err.message);
        }
      }
      
      // Check LLM availability
      if (method === 'GET' && p === '/v1/generate/status') {
        try {
          const llmGenerator = await import('./services/llm-generator.mjs');
          return jsonResponse(res, 200, { 
            llmAvailable: llmGenerator.isLLMAvailable(),
            strategies: ['random', 'llm', 'advanced']
          });
        } catch (err) {
          return jsonResponse(res, 200, { 
            llmAvailable: false,
            strategies: ['random', 'advanced']
          });
        }
      }
      
      // ============================================
      // EVALUATION ENDPOINT
      // ============================================
      
      // Evaluate CNL specification
      if (method === 'POST' && p === '/v1/evaluate') {
        const body = await parseBody(req);
        try {
          const { evaluateCNL } = await import('../src/evaluate.mjs');
          
          const cnl = body.cnl;
          const prose = body.prose || null;
          const targetArc = body.targetArc || null;
          
          if (!cnl || cnl.trim().length < 10) {
            return errorResponse(res, 400, 'invalid_cnl', 'CNL specification is too short or empty');
          }
          
          const result = evaluateCNL(cnl, { prose, targetArc });
          return jsonResponse(res, 200, result);
          
        } catch (err) {
          console.error('Evaluation error:', err);
          return errorResponse(res, 500, 'evaluation_error', err.message);
        }
      }
      
      // Run batch evaluation (eval runner)
      if (method === 'GET' && p === '/v1/run-eval') {
        try {
          const { runEvaluation, TEST_CONFIGS, generateCNL } = await import('../eval/runEval.mjs');
          
          const results = [];
          for (const config of TEST_CONFIGS) {
            try {
              const evalResult = await runEvaluation(config);
              results.push({
                id: config.id,
                name: config.name,
                config: {
                  genre: config.genre,
                  length: config.length,
                  chars: config.chars,
                  tone: config.tone
                },
                success: evalResult.result.success,
                nqs: evalResult.result.success ? evalResult.result.summary.nqs : null,
                interpretation: evalResult.result.success ? evalResult.result.summary.interpretation : null,
                metrics: evalResult.result.success ? {
                  completeness: evalResult.result.metrics.completeness?.score,
                  coherence: evalResult.result.metrics.coherence?.score,
                  originality: evalResult.result.metrics.originality?.score,
                  explainability: evalResult.result.metrics.explainability?.score,
                  characterContinuity: evalResult.result.metrics.characterContinuity?.score,
                  locationLogic: evalResult.result.metrics.locationLogic?.score,
                  sceneCompleteness: evalResult.result.metrics.sceneCompleteness?.score
                } : null,
                structure: evalResult.result.success ? evalResult.result.structure : null,
                timeMs: evalResult.timeMs,
                error: evalResult.result.success ? null : evalResult.result.message
              });
            } catch (err) {
              results.push({
                id: config.id,
                name: config.name,
                success: false,
                error: err.message
              });
            }
          }
          
          // Calculate summary
          const successful = results.filter(r => r.success);
          const nqsScores = successful.map(r => r.nqs);
          
          const summary = nqsScores.length > 0 ? {
            avgNqs: nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length,
            minNqs: Math.min(...nqsScores),
            maxNqs: Math.max(...nqsScores),
            distribution: {
              excellent: nqsScores.filter(s => s >= 0.85).length,
              good: nqsScores.filter(s => s >= 0.7 && s < 0.85).length,
              fair: nqsScores.filter(s => s >= 0.5 && s < 0.7).length,
              poor: nqsScores.filter(s => s < 0.5).length
            }
          } : null;
          
          return jsonResponse(res, 200, {
            evaluatedAt: new Date().toISOString(),
            totalTests: TEST_CONFIGS.length,
            successful: successful.length,
            results,
            summary
          });
          
        } catch (err) {
          console.error('Batch evaluation error:', err);
          return errorResponse(res, 500, 'eval_error', err.message);
        }
      }
      
      // Run batch evaluation with SSE streaming
      if (method === 'GET' && p === '/v1/run-eval/stream') {
        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        
        const sendEvent = (data) => {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        
        try {
          const { runEvaluation, TEST_CONFIGS } = await import('../eval/runEval.mjs');
          
          // Send start event
          sendEvent({ type: 'start', total: TEST_CONFIGS.length });
          
          const results = [];
          
          for (let i = 0; i < TEST_CONFIGS.length; i++) {
            const config = TEST_CONFIGS[i];
            
            // Send progress event
            sendEvent({ 
              type: 'progress', 
              index: i, 
              name: config.name,
              config: {
                genre: config.genre,
                length: config.length,
                chars: config.chars,
                tone: config.tone
              }
            });
            
            try {
              const evalResult = await runEvaluation(config);
              
              const resultData = {
                type: 'result',
                index: i,
                id: config.id,
                name: config.name,
                success: evalResult.result.success,
                nqs: evalResult.result.success ? evalResult.result.summary.nqs : null,
                interpretation: evalResult.result.success ? evalResult.result.summary.interpretation : null,
                metrics: evalResult.result.success ? {
                  completeness: evalResult.result.metrics.completeness?.score,
                  coherence: evalResult.result.metrics.coherence?.score,
                  originality: evalResult.result.metrics.originality?.score,
                  explainability: evalResult.result.metrics.explainability?.score,
                  characterContinuity: evalResult.result.metrics.characterContinuity?.score,
                  locationLogic: evalResult.result.metrics.locationLogic?.score,
                  sceneCompleteness: evalResult.result.metrics.sceneCompleteness?.score
                } : null,
                structure: evalResult.result.success ? evalResult.result.structure : null,
                timeMs: evalResult.timeMs,
                error: evalResult.result.success ? null : evalResult.result.message
              };
              
              results.push(resultData);
              sendEvent(resultData);
              
            } catch (err) {
              const errorData = {
                type: 'result',
                index: i,
                id: config.id,
                name: config.name,
                success: false,
                error: err.message,
                timeMs: 0
              };
              results.push(errorData);
              sendEvent(errorData);
            }
          }
          
          // Calculate and send summary
          const successful = results.filter(r => r.success);
          const nqsScores = successful.map(r => r.nqs);
          
          const summary = nqsScores.length > 0 ? {
            avgNqs: nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length,
            minNqs: Math.min(...nqsScores),
            maxNqs: Math.max(...nqsScores),
            successCount: successful.length,
            totalTests: TEST_CONFIGS.length,
            distribution: {
              excellent: nqsScores.filter(s => s >= 0.85).length,
              good: nqsScores.filter(s => s >= 0.7 && s < 0.85).length,
              fair: nqsScores.filter(s => s >= 0.5 && s < 0.7).length,
              poor: nqsScores.filter(s => s < 0.5).length
            }
          } : null;
          
          sendEvent({ type: 'complete', summary });
          res.end();
          
        } catch (err) {
          console.error('SSE evaluation error:', err);
          sendEvent({ type: 'error', message: err.message });
          res.end();
        }
        return;
      }
      
      // Generate NL (Natural Language) story from CNL
      if (method === 'POST' && p === '/v1/generate/nl-story') {
        const body = await parseBody(req);
        try {
          const llmGenerator = await import('./services/llm-generator.mjs');
          
          const cnl = body.cnl;
          const storyName = body.storyName || 'Untitled Story';
          const options = body.options || {};
          
          if (!cnl || cnl.trim().length < 50) {
            return errorResponse(res, 400, 'invalid_cnl', 'CNL specification is too short or empty');
          }
          
          const result = await llmGenerator.generateNLFromCNL(cnl, storyName, options);
          return jsonResponse(res, 200, result);
          
        } catch (err) {
          console.error('NL story generation error:', err);
          return errorResponse(res, 500, 'generation_error', err.message);
        }
      }

      // API not found
      if (p.startsWith('/v1/')) {
        return errorResponse(res, 404, 'not_found', 'Endpoint not found');
      }

      // Static files
      serveStatic(req, res);

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
  // Parse port from command line argument (e.g., node server.mjs 3001) or env var
  const argPort = process.argv[2] ? Number(process.argv[2]) : null;
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;
  const port = argPort || envPort || 3000;
  
  const server = createDemoServer();
  
  server.listen(port, () => {
    const W = 58; // total width including borders
    const inner = W - 2; // inside the ║ borders
    
    const title = 'SCRIPTA Story Forge';
    const urlText = `http://localhost:${port}`;
    const storageText = PROJECTS_DIR.length > 42 ? '...' + PROJECTS_DIR.slice(-39) : PROJECTS_DIR;
    
    const center = (text) => {
      const pad = inner - text.length;
      const left = Math.floor(pad / 2);
      const right = pad - left;
      return '║' + ' '.repeat(left) + text + ' '.repeat(right) + '║';
    };
    
    const left = (text) => '║  ' + text.padEnd(inner - 2) + '║';
    const empty = '║' + ' '.repeat(inner) + '║';
    const top = '╔' + '═'.repeat(inner) + '╗';
    const mid = '╠' + '═'.repeat(inner) + '╣';
    const bot = '╚' + '═'.repeat(inner) + '╝';
    
    console.log(`
  ${top}
  ${center(title)}
  ${mid}
  ${left('URL:      ' + urlText)}
  ${left('Storage:  ' + storageText)}
  ${empty}
  ${left('Set SCRIPTA_DATA_DIR env var to change storage.')}
  ${empty}
    ${left('Endpoints:')}
  ${left('  /              - Story Forge UI')}
  ${left('  /health        - Health check')}
  ${left('  /v1/projects   - Projects API (CRUD)')}
  ${left('  /v1/generate/llm      - LLM story generation')}
  ${left('  /v1/generate/nl-story - CNL to prose generation')}
  ${left('  /v1/generate/refine   - LLM story refinement')}
  ${left('  /v1/generate/status   - Check LLM availability')}
  ${left('  /v1/evaluate          - Evaluate CNL specification')}
  ${left('  /v1/run-eval          - Batch evaluation tests')}
  ${left('  /v1/run-eval/stream   - SSE streaming evaluation')}
  ${left('  /eval.html            - Evaluation runner page')}
  ${bot}
`);
  });
}

export { createDemoServer };
