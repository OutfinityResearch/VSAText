#!/usr/bin/env node
/**
 * SCRIPTA Story Forge Demo Server
 * 
 * Combined server that:
 * - Serves the Story Forge UI (static files)
 * - Handles project persistence (/v1/projects)
 *
 * Research/demo processing endpoints are also provided:
 * - Evaluate CNL (/v1/evaluate)
 * - LLM-backed generation/refinement (/v1/generate/*)
 * - Batch evaluation runner (/v1/run-eval)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { printDemoServerBanner } from './server-banner.mjs';

// Import storage modules
import {
  ensureDirectories,
  listProjects,
  loadProject,
  saveProject,
  deleteProject,
  getNextProjectNumber,
  generateDefaultProjectName,
  PROJECTS_DIR
} from './storage/projects.mjs';

import {
  listStoryVersions,
  saveStoryVersion,
  loadStoryVersion,
  deleteStoryVersion,
  parseVersionFilename
} from './storage/versions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = __dirname;
const ROOT_DIR = path.join(__dirname, '..');

// Ensure storage directories exist
ensureDirectories();

// ============================================
// MIME TYPES
// ============================================

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
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

function jsonResponse(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
  return true;
}

function errorResponse(res, statusCode, code, message) {
  return jsonResponse(res, statusCode, { error: { code, message } });
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
  
  // Handle /docs/theory/ requests
  if (!fs.existsSync(fullPath) && filePath.startsWith('/docs/theory/')) {
    fullPath = path.join(ROOT_DIR, filePath);
  }
  
  // Handle /docs/specs/ requests
  if (!fs.existsSync(fullPath) && filePath.startsWith('/docs/specs/')) {
    fullPath = path.join(ROOT_DIR, filePath);
  }
  
  // Security check - must be within allowed directories
  const isInDemo = fullPath.startsWith(DEMO_DIR);
  const isInSrc = fullPath.startsWith(path.join(ROOT_DIR, 'src'));
  const isInDocsTheory = fullPath.startsWith(path.join(ROOT_DIR, 'docs', 'theory'));
  const isInDocsSpecs = fullPath.startsWith(path.join(ROOT_DIR, 'docs', 'specs'));
  
  if (!isInDemo && !isInSrc && !isInDocsTheory && !isInDocsSpecs) {
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
// API ROUTE HANDLERS
// ============================================

async function handleProjectRoutes(method, p, req, res) {
  // List projects
  if (method === 'GET' && p === '/v1/projects') {
    return jsonResponse(res, 200, { projects: listProjects() });
  }

  // Get next available project number
  if (method === 'GET' && p === '/v1/projects/next-number') {
    const nextNumber = getNextProjectNumber();
    const defaultName = generateDefaultProjectName();
    return jsonResponse(res, 200, { nextNumber, defaultName });
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

  return false; // Not handled
}

async function handleVersionRoutes(method, p, req, res) {
  // List story versions for a project
  if (method === 'GET' && p.match(/^\/v1\/projects\/([^/]+)\/versions$/)) {
    const id = decodeURIComponent(p.split('/')[3]);
    if (!loadProject(id)) return errorResponse(res, 404, 'not_found', 'Project not found');
    const versions = listStoryVersions(id);
    return jsonResponse(res, 200, { versions });
  }

  // Save a new story version
  if (method === 'POST' && p.match(/^\/v1\/projects\/([^/]+)\/versions$/)) {
    const id = decodeURIComponent(p.split('/')[3]);
    if (!loadProject(id)) return errorResponse(res, 404, 'not_found', 'Project not found');
    
    const body = await parseBody(req);
    if (!body.content) return errorResponse(res, 400, 'missing_content', 'Story content is required');
    
    const language = body.language || 'en';
    const model = body.model || 'default';
    
    const versionInfo = saveStoryVersion(id, body.content, language, model);
    return jsonResponse(res, 201, versionInfo);
  }

  // Load a specific story version
  if (method === 'GET' && p.match(/^\/v1\/projects\/([^/]+)\/versions\/([^/]+)$/)) {
    const parts = p.split('/');
    const id = decodeURIComponent(parts[3]);
    const filename = decodeURIComponent(parts[5]);
    
    const content = loadStoryVersion(id, filename);
    if (content === null) return errorResponse(res, 404, 'not_found', 'Version not found');
    
    const meta = parseVersionFilename(filename);
    return jsonResponse(res, 200, { content, ...meta });
  }

  // Delete a story version
  if (method === 'DELETE' && p.match(/^\/v1\/projects\/([^/]+)\/versions\/([^/]+)$/)) {
    const parts = p.split('/');
    const id = decodeURIComponent(parts[3]);
    const filename = decodeURIComponent(parts[5]);
    
    if (!deleteStoryVersion(id, filename)) {
      return errorResponse(res, 404, 'not_found', 'Version not found');
    }
    return jsonResponse(res, 200, { deleted: true });
  }

  return false; // Not handled
}

async function handleLLMRoutes(method, p, req, res) {
  // Generate story with LLM
  if (method === 'POST' && p === '/v1/generate/llm') {
    const body = await parseBody(req);
    try {
      const llmGenerator = await import('./services/llm-generator.mjs');
      
      if (!llmGenerator.isLLMAvailable()) {
        return errorResponse(res, 503, 'llm_unavailable', 'LLM agent not available.');
      }
      
      const result = await llmGenerator.generateStoryWithLLM(body);
      return jsonResponse(res, 200, result);
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
      
      if (!llmGenerator.isLLMAvailable()) {
        return errorResponse(res, 503, 'llm_unavailable', 'LLM agent not available.');
      }
      
      const result = await llmGenerator.refineStoryWithLLM(body.project, body.options);
      return jsonResponse(res, 200, result);
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
    } catch {
      return jsonResponse(res, 200, { llmAvailable: false, strategies: ['random', 'advanced'] });
    }
  }
  
  // Get available LLM models
  if (method === 'GET' && p === '/v1/models') {
    try {
      const llmGenerator = await import('./services/llm-generator.mjs');
      const models = llmGenerator.getAvailableModels();
      const languages = llmGenerator.getSupportedLanguages();
      return jsonResponse(res, 200, { 
        models, languages, llmAvailable: llmGenerator.isLLMAvailable()
      });
    } catch {
      return jsonResponse(res, 200, { 
        models: { fast: [], deep: [], available: false }, languages: {}, llmAvailable: false
      });
    }
  }
  
  // Generate NL story from CNL
  if (method === 'POST' && p === '/v1/generate/nl-story') {
    const body = await parseBody(req);
    try {
      const llmGenerator = await import('./services/llm-generator.mjs');
      
      if (!body.cnl || body.cnl.trim().length < 50) {
        return errorResponse(res, 400, 'invalid_cnl', 'CNL specification is too short');
      }
      
      const result = await llmGenerator.generateNLFromCNL(
        body.cnl, body.storyName || 'Untitled Story', body.options || {}
      );
      return jsonResponse(res, 200, result);
    } catch (err) {
      console.error('NL story generation error:', err);
      return errorResponse(res, 500, 'generation_error', err.message);
    }
  }
  
  // Generate NL story with SSE streaming
  if (method === 'POST' && p === '/v1/generate/nl-story/stream') {
    return handleNLStoryStream(req, res);
  }

  return false; // Not handled
}

async function handleNLStoryStream(req, res) {
  const body = await parseBody(req);
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
  try {
    const llmGenerator = await import('./services/llm-generator.mjs');
    
    const { cnl, storyName = 'Untitled Story', options = {}, chapters = [] } = body;
    
    if (!cnl || cnl.trim().length < 50) {
      sendEvent({ type: 'error', message: 'CNL specification is too short' });
      res.end();
      return true;
    }
    
    if (!llmGenerator.isLLMAvailable()) {
      sendEvent({ type: 'error', message: 'LLM not available. Configure API keys.' });
      res.end();
      return true;
    }
    
    // If no chapters, generate all at once
    if (!chapters.length) {
      sendEvent({ type: 'start', totalChapters: 1 });
      sendEvent({ type: 'chapter_start', chapterNumber: 1, chapterTitle: 'Full Story' });
      
      const result = await llmGenerator.generateNLFromCNL(cnl, storyName, options);
      
      sendEvent({ type: 'chapter_complete', chapterNumber: 1, content: result.story });
      sendEvent({ type: 'complete', totalChapters: 1, fullStory: result.story });
      res.end();
      return true;
    }
    
    // Generate chapter by chapter
    sendEvent({ type: 'start', totalChapters: chapters.length, estimatedTotal: chapters.length * 10000 });
    
    let fullStory = '';
    let previousSummary = '';
    
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterNumber = i + 1;
      const startTime = Date.now();
      
      sendEvent({ 
        type: 'chapter_start', 
        chapterNumber, 
        chapterTitle: chapter.title || `Chapter ${chapterNumber}`,
        progress: Math.round((i / chapters.length) * 100)
      });
      
      try {
        const chapterResult = await llmGenerator.generateChapter(
          { number: chapterNumber, title: chapter.title, cnl: chapter.cnl || cnl },
          { storyName, previousSummary },
          options
        );
        
        const chapterContent = chapterResult.chapter;
        if (!chapterContent || chapterContent.length < 50) {
          throw new Error('Chapter content too short');
        }
        
        fullStory += (fullStory ? '\n\n' : '') + chapterContent;
        previousSummary += `\nChapter ${chapterNumber}: ${chapter.title} - ${chapterContent.substring(0, 200)}...`;
        
        sendEvent({ 
          type: 'chapter_complete', 
          chapterNumber, 
          chapterTitle: chapter.title,
          content: chapterContent,
          elapsed: Date.now() - startTime,
          progress: Math.round(((i + 1) / chapters.length) * 100)
        });
      } catch (chapterErr) {
        console.error(`Chapter ${chapterNumber} error:`, chapterErr);
        sendEvent({ type: 'chapter_error', chapterNumber, error: chapterErr.message });
        
        // Stop on critical errors
        if (chapterErr.message.includes('LLM') || chapterErr.message.includes('API')) {
          sendEvent({ type: 'error', message: `Generation stopped: ${chapterErr.message}` });
          res.end();
          return true;
        }
        
        fullStory += `\n\n## Chapter ${chapterNumber}\n\n[Generation failed]`;
      }
    }
    
    sendEvent({ type: 'complete', totalChapters: chapters.length, fullStory });
    res.end();
  } catch (err) {
    console.error('SSE NL generation error:', err);
    sendEvent({ type: 'error', message: err.message });
    res.end();
  }
  
  return true;
}

async function handleEvaluationRoutes(method, p, req, res) {
  // Evaluate CNL specification
  if (method === 'POST' && p === '/v1/evaluate') {
    const body = await parseBody(req);
    try {
      const { evaluateCNL } = await import('../src/evaluate.mjs');
      
      if (!body.cnl || body.cnl.trim().length < 10) {
        return errorResponse(res, 400, 'invalid_cnl', 'CNL specification is too short');
      }
      
      const result = evaluateCNL(body.cnl, { prose: body.prose, targetArc: body.targetArc });
      return jsonResponse(res, 200, result);
    } catch (err) {
      console.error('Evaluation error:', err);
      return errorResponse(res, 500, 'evaluation_error', err.message);
    }
  }
  
  // Run batch evaluation
  if (method === 'GET' && p === '/v1/run-eval') {
    return handleBatchEvaluation(req, res);
  }
  
  // Run batch evaluation with SSE streaming
  if (method === 'GET' && p === '/v1/run-eval/stream') {
    return handleBatchEvaluationStream(req, res);
  }

  return false;
}

async function handleBatchEvaluation(req, res) {
  try {
    const { runEvaluation, TEST_CONFIGS } = await import('../eval/runEval.mjs');
    
    const results = [];
    for (const config of TEST_CONFIGS) {
      try {
        const evalResult = await runEvaluation(config);
        results.push({
          id: config.id, name: config.name,
          success: evalResult.result.success,
          nqs: evalResult.result.success ? evalResult.result.summary.nqs : null,
          timeMs: evalResult.timeMs
        });
      } catch (err) {
        results.push({ id: config.id, name: config.name, success: false, error: err.message });
      }
    }
    
    const successful = results.filter(r => r.success);
    const nqsScores = successful.map(r => r.nqs);
    
    return jsonResponse(res, 200, {
      evaluatedAt: new Date().toISOString(),
      totalTests: TEST_CONFIGS.length,
      successful: successful.length,
      results,
      summary: nqsScores.length ? {
        avgNqs: nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length,
        minNqs: Math.min(...nqsScores),
        maxNqs: Math.max(...nqsScores)
      } : null
    });
  } catch (err) {
    console.error('Batch evaluation error:', err);
    return errorResponse(res, 500, 'eval_error', err.message);
  }
}

async function handleBatchEvaluationStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
  try {
    const { runEvaluation, TEST_CONFIGS } = await import('../eval/runEval.mjs');
    
    sendEvent({ type: 'start', total: TEST_CONFIGS.length });
    
    const results = [];
    for (let i = 0; i < TEST_CONFIGS.length; i++) {
      const config = TEST_CONFIGS[i];
      sendEvent({ type: 'progress', index: i, name: config.name });
      
      try {
        const evalResult = await runEvaluation(config);
        const resultData = {
          type: 'result', index: i, id: config.id, name: config.name,
          success: evalResult.result.success,
          nqs: evalResult.result.success ? evalResult.result.summary.nqs : null,
          timeMs: evalResult.timeMs
        };
        results.push(resultData);
        sendEvent(resultData);
      } catch (err) {
        const errorData = { type: 'result', index: i, id: config.id, name: config.name, success: false, error: err.message };
        results.push(errorData);
        sendEvent(errorData);
      }
    }
    
    const successful = results.filter(r => r.success);
    const nqsScores = successful.map(r => r.nqs);
    
    sendEvent({ 
      type: 'complete', 
      summary: nqsScores.length ? {
        avgNqs: nqsScores.reduce((a, b) => a + b, 0) / nqsScores.length,
        successCount: successful.length,
        totalTests: TEST_CONFIGS.length
      } : null
    });
    res.end();
  } catch (err) {
    console.error('SSE evaluation error:', err);
    sendEvent({ type: 'error', message: err.message });
    res.end();
  }
  
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
          status: 'ok', service: 'scripta-story-forge', version: '0.1.0'
        });
      }

      // Route handlers
      if (await handleProjectRoutes(method, p, req, res)) return;
      if (await handleVersionRoutes(method, p, req, res)) return;
      if (await handleLLMRoutes(method, p, req, res)) return;
      if (await handleEvaluationRoutes(method, p, req, res)) return;

      // API not found
      if (p.startsWith('/v1/')) {
        return errorResponse(res, 404, 'not_found', 'Endpoint not found');
      }

      // Static files
      serveStatic(req, res);

    } catch (err) {
      if (err.message === 'invalid_json') {
        return errorResponse(res, 400, 'invalid_json', 'Invalid JSON');
      }
      if (err.message === 'payload_too_large') {
        return errorResponse(res, 413, 'payload_too_large', 'Request too large');
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
  const argPort = process.argv[2] ? Number(process.argv[2]) : null;
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;
  const port = argPort || envPort || 3000;
  
  const server = createDemoServer();
  
  server.listen(port, () => {
    printDemoServerBanner({ port, projectsDir: PROJECTS_DIR });
  });
}

export { createDemoServer };
