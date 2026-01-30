#!/usr/bin/env node
/**
 * SCRIPTA Demo Server
 * Serves the dashboard UI and provides real-time log streaming via SSE
 */

// Disable auth for demo mode (can be overridden with SCRIPTA_AUTH_REQUIRED=true)
if (process.env.SCRIPTA_AUTH_REQUIRED === undefined) {
  process.env.SCRIPTA_AUTH_REQUIRED = 'false';
}

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Import the main API handler
import { createApiHandler } from '../src/server.mjs';
import { logger, logRequest, getRecentLogs, subscribeLogs, logOperation } from '../src/services/logger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = __dirname;

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Serve static files from demo directory
 */
function serveStatic(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(DEMO_DIR, filePath);
  
  // Check if file exists and is within demo directory
  if (!fullPath.startsWith(DEMO_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const ext = path.extname(fullPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Server-Sent Events endpoint for real-time logs
 */
function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial logs
  const recentLogs = getRecentLogs(50);
  res.write(`event: init\ndata: ${JSON.stringify(recentLogs)}\n\n`);
  
  // Subscribe to new logs
  const unsubscribe = subscribeLogs((log) => {
    res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
  });
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`: keepalive\n\n`);
  }, 30000);
  
  // Cleanup on disconnect
  req.on('close', () => {
    unsubscribe();
    clearInterval(keepAlive);
  });
}

/**
 * Create the demo server
 */
function createDemoServer() {
  const { handler: apiHandler } = createApiHandler();
  
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const correlationId = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const reqLog = logRequest(req, correlationId);
    
    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);
    
    // Wrap response to capture status code
    const originalWriteHead = res.writeHead.bind(res);
    let statusCode = 200;
    res.writeHead = (code, ...args) => {
      statusCode = code;
      return originalWriteHead(code, ...args);
    };
    
    const originalEnd = res.end.bind(res);
    res.end = (...args) => {
      reqLog.logResponse(res, statusCode);
      return originalEnd(...args);
    };
    
    try {
      // SSE endpoint for logs
      if (url.pathname === '/api/logs/stream') {
        handleSSE(req, res);
        return;
      }
      
      // Get recent logs
      if (url.pathname === '/api/logs' && req.method === 'GET') {
        const count = parseInt(url.searchParams.get('count')) || 100;
        const level = url.searchParams.get('level');
        const logs = getRecentLogs(count, { level });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ logs }));
        return;
      }
      
      // API requests - forward to main API handler
      if (url.pathname.startsWith('/v1/') || url.pathname === '/health') {
        logOperation('api_request', { 
          path: url.pathname, 
          method: req.method,
          correlation_id: correlationId 
        });
        await apiHandler(req, res);
        return;
      }
      
      // Static files
      serveStatic(req, res);
      
    } catch (err) {
      logger.error('Server error', { 
        error: err.message, 
        stack: err.stack,
        correlation_id: correlationId 
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'internal_error', message: err.message } }));
    }
  });
  
  return server;
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const server = createDemoServer();
  
  server.listen(port, () => {
    logger.info('Demo server started', { port, url: `http://localhost:${port}` });
    console.log(`
  ╔════════════════════════════════════════════════╗
  ║          SCRIPTA Demo Dashboard                ║
  ╠════════════════════════════════════════════════╣
  ║  URL:  http://localhost:${String(port).padEnd(5)}                  ║
  ║  Auth: disabled (demo mode)                    ║
  ║                                                ║
  ║  Endpoints:                                    ║
  ║    /              - Dashboard UI               ║
  ║    /v1/*          - API endpoints              ║
  ║    /api/logs      - Recent logs                ║
  ║    /api/logs/stream - SSE log stream           ║
  ╚════════════════════════════════════════════════╝
`);
  });
}

export { createDemoServer };
