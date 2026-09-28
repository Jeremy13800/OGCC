/**
 * Minimal OGCC logger. The only module allowed to use `console`.
 * `debug` output is silent unless debug mode is enabled in the settings.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const PREFIX = '[OGCC]';

let debugEnabled = false;

export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
}

export function isDebugEnabled(): boolean {
  return debugEnabled;
}

function write(level: LogLevel, scope: string | undefined, args: unknown[]): void {
  if (level === 'debug' && !debugEnabled) return;
  const tag = scope ? `${PREFIX}[${scope}]` : PREFIX;
  console[level](tag, ...args);
}

export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/** Creates a logger whose lines are tagged with a scope, e.g. `[OGCC][storage]`. */
export function createLogger(scope?: string): Logger {
  return {
    debug: (...args) => { write('debug', scope, args); },
    info: (...args) => { write('info', scope, args); },
    warn: (...args) => { write('warn', scope, args); },
    error: (...args) => { write('error', scope, args); },
  };
}

export const logger = createLogger();
