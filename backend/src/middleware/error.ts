import type { Context } from 'hono';
import type { Env } from '../types/env';
import { logger } from '../lib/logger';

export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
  const requestId = (c.get('requestId') as string) ?? 'unknown';
  const method = c.req.method;
  const path = c.req.path;

  if (err instanceof AppError) {
    logger.warn(`${err.code}: ${err.message}`, {
      requestId, method, path, code: err.code, status: err.status,
    });
    return c.json(
      { data: null, error: { code: err.code, message: err.message } },
      err.status,
    );
  }

  logger.error(`Unhandled: ${err.message}`, {
    requestId, method, path,
    stack: err.stack ?? 'no stack',
  });

  return c.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500,
  );
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { data, meta: meta ?? null, error: null } as const;
}

export function paginated<T>(data: T[], page: number, limit: number, total: number) {
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    error: null,
  } as const;
}