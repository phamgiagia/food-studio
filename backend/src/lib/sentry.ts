/**
 * Sentry / Error tracking setup for Cloudflare Workers.
 * 
 * Usage in code:
 *   import { captureException } from '../lib/sentry';
 *   captureException(error, { requestId, path });
 * 
 * To activate:
 *   1. Set SENTRY_DSN in wrangler.toml secrets
 *   2. Set SENTRY_ENVIRONMENT in vars
 * 
 * In dev/staging, logs go to console instead of Sentry.
 */

import type { Env } from '../types/env';

type SentryContext = Record<string, unknown>;

/**
 * Send an exception event to Sentry via its API.
 * Works in Cloudflare Workers (no SDK needed).
 */
export async function captureException(
  error: Error,
  context?: SentryContext,
  bindings?: Env,
): Promise<void> {
  const dsn = bindings?.SENTRY_DSN;
  if (!dsn) {
    // No DSN configured — fallback to structured console
    console.error('[SENTRY] No DSN configured. Error:', error.message, JSON.stringify(context));
    return;
  }

  try {
    const event = {
      event_id: crypto.randomUUID().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      level: 'error',
      logger: 'food-studio-api',
      exception: {
        values: [{
          type: error.name,
          value: error.message,
          stacktrace: error.stack
            ? { frames: parseStackFrames(error.stack) }
            : undefined,
        }],
      },
      tags: {
        environment: bindings?.ENVIRONMENT ?? 'unknown',
        service: 'food-studio-api',
      },
      extra: context ?? {},
      platform: 'javascript',
      sdk: { name: 'food-studio-sentry', version: '0.1.0' },
    };

    const projectId = dsn.split('/').pop();
    const key = dsn.split('//')[1]?.split('@')[0];
    const host = dsn.split('@')[1]?.split('/')[0];

    if (!projectId || !key || !host) {
      console.error('[SENTRY] Invalid DSN format');
      return;
    }

    await fetch(`https://${host}/api/${projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}`,
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error('[SENTRY] Failed to send event:', e);
  }
}

/**
 * Send a message/breadcrumb to Sentry
 */
export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: SentryContext,
  bindings?: Env,
): Promise<void> {
  const dsn = bindings?.SENTRY_DSN;
  if (!dsn) {
    console.log(`[SENTRY:${level}] ${message}`, JSON.stringify(context));
    return;
  }

  try {
    const event = {
      event_id: crypto.randomUUID().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      level,
      logger: 'food-studio-api',
      message: { formatted: message },
      tags: {
        environment: bindings?.ENVIRONMENT ?? 'unknown',
        service: 'food-studio-api',
      },
      extra: context ?? {},
      platform: 'javascript',
    };

    const projectId = dsn.split('/').pop();
    const key = dsn.split('//')[1]?.split('@')[0];
    const host = dsn.split('@')[1]?.split('/')[0];

    if (!projectId || !key || !host) return;

    await fetch(`https://${host}/api/${projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}`,
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error('[SENTRY] Failed to send message:', e);
  }
}

function parseStackFrames(stack: string): Array<{
  filename: string; function?: string; lineno?: number; colno?: number;
}> {
  return stack.split('\n').slice(1).map(line => {
    const match = line.match(/at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))\)?/);
    if (!match) return null;
    return {
      function: match[1] ?? '<anonymous>',
      filename: match[2] ?? '',
      lineno: parseInt(match[3]) || 0,
      colno: parseInt(match[4]) || 0,
    };
  }).filter((f): f is NonNullable<typeof f> => f !== null);
}