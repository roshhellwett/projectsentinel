import * as Sentry from "@sentry/nextjs";

export function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
    enabled: process.env.NODE_ENV !== "test",
  });
}

export const onRequestError = Sentry.captureRequestError;

