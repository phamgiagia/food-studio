/**
 * Structured Logger — Food Studio
 * Wraps console.log/error with JSON format + severity levels.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Record<string, unknown>;

const LEVEL: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3,
};

let level: LogLevel = 'info';

export function configureLogger(logLevel: LogLevel) {
  level = logLevel;
}

function log(lvl: LogLevel, msg: string, ctx?: LogContext) {
  if (LEVEL[lvl] < LEVEL[level]) return;
  const entry = JSON.stringify({
    t: new Date().toISOString(),
    lvl, msg, ...(ctx ? { ctx } : {}),
  });
  if (lvl === 'error') console.error(entry);
  else console.log(entry);
}

export const logger = {
  debug: (m: string, c?: LogContext) => log('debug', m, c),
  info: (m: string, c?: LogContext) => log('info', m, c),
  warn: (m: string, c?: LogContext) => log('warn', m, c),
  error: (m: string, c?: LogContext) => log('error', m, c),
};