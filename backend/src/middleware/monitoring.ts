/**
 * Monitoring middleware — request logging + timing
 */

import type { Context, Next } from 'hono';
import type { Env } from '../types/env';
import { logger } from '../lib/logger';

export async function monitoringMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = crypto.randomUUID().slice(0, 8);

  // Attach request id to context
  c.set('requestId', requestId);

  logger.info(`→ ${method} ${path}`, { requestId, method, path });

  try {
    await next();
  } catch (err) {
    const ms = Date.now() - start;
    logger.error(`✗ ${method} ${path} ${c.res.status} ${ms}ms`, {
      requestId, method, path, status: c.res.status, ms,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  const ms = Date.now() - start;
  const status = c.res.status;

  if (status >= 500) {
    logger.error(`✗ ${method} ${path} ${status} ${ms}ms`, { requestId, status, ms });
  } else if (status >= 400) {
    logger.warn(`! ${method} ${path} ${status} ${ms}ms`, { requestId, status, ms });
  } else {
    logger.info(`✓ ${method} ${path} ${status} ${ms}ms`, { requestId, status, ms });
  }
}