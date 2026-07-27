/**
 * Next.js instrumentation hook — runs once per server process at boot.
 *
 * We use it to surface environment problems in the deploy log instead of
 * letting them turn into confusing runtime failures on the first request.
 * Validation is non-fatal by design: the site must still render (in degraded
 * form) when an optional integration is unconfigured.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { validateEnv } = await import("./lib/env");
  const env = validateEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "[env] Supabase is not configured — news pages will render their empty/error states.",
    );
  }
  if (!env.WORKER_URL) {
    console.warn(
      "[env] WORKER_URL is not set — the reader assistant will return its fallback reply.",
    );
  }
}
