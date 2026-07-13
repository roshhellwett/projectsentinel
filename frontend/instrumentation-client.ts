import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV !== "test",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

