import type { Context } from 'hono';
import type { Env } from '../types/env';

export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
  console.error('[ERROR]', err.message, err.stack);
  return c.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500
  );
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
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
