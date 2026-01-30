#!/usr/bin/env node
import http from 'http';
import { randomUUID } from 'crypto';
import { validateText } from './cnl/validator.mjs';
import { encodeText, cosine } from './vsa/encoder.mjs';

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function errorResponse(res, statusCode, code, message, details = {}) {
  jsonResponse(res, statusCode, {
    error: {
      code,
      message,
      details,
      correlation_id: randomUUID().replace(/-/g, '').slice(0, 12)
    }
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('invalid_json'));
      }
    });
  });
}

function createApiServer() {
  const vsaIndex = new Map();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/health') {
      return jsonResponse(res, 200, { status: 'ok' });
    }

    if (req.method === 'POST' && path === '/v1/cnl/validate') {
      try {
        const body = await parseJsonBody(req);
        if (!body.cnl_text) return errorResponse(res, 422, 'invalid_request', 'cnl_text is required', { field: 'cnl_text' });
        const { statements, errors } = validateText(body.cnl_text);
        return jsonResponse(res, 200, { valid: errors.length === 0, errors, statements });
      } catch (err) {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && path === '/v1/vsa/encode') {
      try {
        const body = await parseJsonBody(req);
        if (!body.text) return errorResponse(res, 422, 'invalid_request', 'text is required', { field: 'text' });
        const dim = body.dim ? Number(body.dim) : 10000;
        const seed = body.seed ? Number(body.seed) : 42;
        const vector = encodeText(body.text, dim, seed);
        return jsonResponse(res, 200, { vector, dim });
      } catch (err) {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && path === '/v1/vsa/index') {
      try {
        const body = await parseJsonBody(req);
        const vectors = body.vectors;
        const ids = body.ids;
        if (!Array.isArray(vectors) || !Array.isArray(ids) || vectors.length !== ids.length) {
          return errorResponse(res, 422, 'invalid_request', 'vectors and ids arrays are required and must match in length');
        }
        for (let i = 0; i < ids.length; i++) {
          vsaIndex.set(ids[i], vectors[i]);
        }
        return jsonResponse(res, 200, { indexed: ids.length });
      } catch (err) {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && path === '/v1/vsa/search') {
      try {
        const body = await parseJsonBody(req);
        const queryVector = body.query_vector;
        const topK = body.top_k ? Number(body.top_k) : 5;
        if (!Array.isArray(queryVector)) {
          return errorResponse(res, 422, 'invalid_request', 'query_vector is required');
        }
        const results = Array.from(vsaIndex.entries()).map(([id, vec]) => ({
          id,
          score: cosine(queryVector, vec)
        }));
        results.sort((a, b) => b.score - a.score);
        const sliced = results.slice(0, topK);
        return jsonResponse(res, 200, { ids: sliced.map((r) => r.id), scores: sliced.map((r) => r.score) });
      } catch (err) {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    if (req.method === 'POST' && path === '/v1/specs') {
      try {
        const body = await parseJsonBody(req);
        if (!body.spec) return errorResponse(res, 422, 'invalid_request', 'spec is required', { field: 'spec' });
        return jsonResponse(res, 200, {
          spec: body.spec,
          audit: {
            id: `audit_${Date.now()}`,
            event_type: 'spec.created',
            actor: 'system',
            timestamp: new Date().toISOString(),
            payload_hash: '0000000000000000'
          }
        });
      } catch (err) {
        return errorResponse(res, 400, 'invalid_request', 'Invalid JSON payload');
      }
    }

    return errorResponse(res, 404, 'not_found', 'Route not found', { path });
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`SCRIPTA API stub listening on http://localhost:${port}`);
  });
}

export { createApiServer };
