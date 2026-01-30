/**
 * Structured Logging Service
 * Provides structured JSON logging with levels, correlation IDs, and real-time streaming
 */

import { EventEmitter } from 'events';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

const LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

// Current log level (can be set via environment)
let currentLevel = LOG_LEVELS[process.env.SCRIPTA_LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

// In-memory log buffer for real-time streaming
const LOG_BUFFER_SIZE = 1000;
const logBuffer = [];

// Event emitter for real-time log streaming
const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(100);

/**
 * Create a structured log entry
 */
function createLogEntry(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: LEVEL_NAMES[level],
    message,
    ...context
  };
  
  // Add to buffer
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
  
  // Emit for real-time listeners
  logEmitter.emit('log', entry);
  
  // Output to console
  if (level >= currentLevel) {
    const output = JSON.stringify(entry);
    if (level >= LOG_LEVELS.ERROR) {
      console.error(output);
    } else {
      console.log(output);
    }
  }
  
  return entry;
}

/**
 * Logger factory - creates a logger with context
 */
function createLogger(defaultContext = {}) {
  return {
    debug: (message, context = {}) => 
      createLogEntry(LOG_LEVELS.DEBUG, message, { ...defaultContext, ...context }),
    
    info: (message, context = {}) => 
      createLogEntry(LOG_LEVELS.INFO, message, { ...defaultContext, ...context }),
    
    warn: (message, context = {}) => 
      createLogEntry(LOG_LEVELS.WARN, message, { ...defaultContext, ...context }),
    
    error: (message, context = {}) => 
      createLogEntry(LOG_LEVELS.ERROR, message, { ...defaultContext, ...context }),
    
    fatal: (message, context = {}) => 
      createLogEntry(LOG_LEVELS.FATAL, message, { ...defaultContext, ...context }),
    
    child: (childContext) => 
      createLogger({ ...defaultContext, ...childContext })
  };
}

// Default logger
const logger = createLogger({ service: 'scripta' });

/**
 * HTTP request logging middleware
 */
function logRequest(req, correlationId) {
  const start = Date.now();
  
  return {
    start,
    correlationId,
    logResponse: (res, statusCode) => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        correlation_id: correlationId,
        method: req.method,
        path: new URL(req.url, 'http://localhost').pathname,
        status: statusCode,
        duration_ms: duration,
        user_agent: req.headers['user-agent']?.slice(0, 100)
      });
    }
  };
}

/**
 * Log an API operation
 */
function logOperation(operation, context = {}) {
  return logger.info(`Operation: ${operation}`, {
    operation,
    ...context
  });
}

/**
 * Log an error with stack trace
 */
function logError(error, context = {}) {
  return logger.error(error.message || String(error), {
    error_type: error.name || 'Error',
    stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    ...context
  });
}

/**
 * Get recent logs from buffer
 */
function getRecentLogs(count = 100, filter = {}) {
  let logs = logBuffer.slice(-count);
  
  if (filter.level) {
    const minLevel = LOG_LEVELS[filter.level.toUpperCase()] ?? 0;
    logs = logs.filter(l => LOG_LEVELS[l.level] >= minLevel);
  }
  
  if (filter.correlation_id) {
    logs = logs.filter(l => l.correlation_id === filter.correlation_id);
  }
  
  if (filter.operation) {
    logs = logs.filter(l => l.operation === filter.operation);
  }
  
  return logs;
}

/**
 * Subscribe to real-time logs
 */
function subscribeLogs(callback) {
  logEmitter.on('log', callback);
  return () => logEmitter.off('log', callback);
}

/**
 * Set log level
 */
function setLogLevel(level) {
  const lvl = LOG_LEVELS[level.toUpperCase()];
  if (lvl !== undefined) {
    currentLevel = lvl;
    logger.info('Log level changed', { new_level: level });
  }
}

/**
 * Clear log buffer
 */
function clearLogs() {
  logBuffer.length = 0;
}

export {
  logger,
  createLogger,
  logRequest,
  logOperation,
  logError,
  getRecentLogs,
  subscribeLogs,
  setLogLevel,
  clearLogs,
  LOG_LEVELS,
  LEVEL_NAMES,
  logEmitter
};
