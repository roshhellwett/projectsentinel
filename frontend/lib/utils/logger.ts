// last edited 2026-05-17 by roshhellwett

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

export function log(
  message: string,
  level: LogLevel = 'info',
  context?: LogContext
): void {

  if ((level === 'debug' || level === 'info') && process.env.NODE_ENV !== 'development') {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'warn' || level === 'error') {

    const consoleMethod = console[level];
    if (context) {
      consoleMethod(prefix, message, context);
    } else {
      consoleMethod(prefix, message);
    }
  }
}

export function logError(
  error: unknown,
  context?: LogContext
): void {
  const message =
    error instanceof Error ? error.message : String(error);

  log(message, 'error', {
    ...context,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Future: integrate with Sentry or similar error tracking
  // if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   captureException(error, { extra: context });
  // }
}

export function logPerformance(
  label: string,
  duration: number,
  context?: LogContext
): void {
  if (process.env.NODE_ENV === 'production' && duration > 3000) {

    log(`Slow operation: ${label} took ${duration}ms`, 'warn', context);
  } else if (process.env.NODE_ENV === 'development') {
    log(`Performance: ${label} took ${duration}ms`, 'debug', context);
  }
}
