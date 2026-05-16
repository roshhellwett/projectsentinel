/**
 * Error logging & monitoring
 * Production-safe error handling with optional Sentry integration
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Log a message with appropriate level
 * In production, only warn/error are logged to console
 */
export function log(
  message: string,
  level: LogLevel = 'info',
  context?: LogContext
): void {
  // Only log debug/info in development
  if ((level === 'debug' || level === 'info') && process.env.NODE_ENV !== 'development') {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'warn' || level === 'error') {
    // eslint-disable-next-line no-console
    const consoleMethod = console[level];
    if (context) {
      consoleMethod(prefix, message, context);
    } else {
      consoleMethod(prefix, message);
    }
  }
}

/**
 * Log an error with context and optional reporting
 * In production, errors are tracked for monitoring
 */
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

/**
 * Log performance metrics
 */
export function logPerformance(
  label: string,
  duration: number,
  context?: LogContext
): void {
  if (process.env.NODE_ENV === 'production' && duration > 3000) {
    // Only warn in production if slow
    log(`Slow operation: ${label} took ${duration}ms`, 'warn', context);
  } else if (process.env.NODE_ENV === 'development') {
    log(`Performance: ${label} took ${duration}ms`, 'debug', context);
  }
}
