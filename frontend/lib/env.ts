import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  // Python worker that backs the reader assistant. Absent = chat degrades
  // to its fixed fallback sentence instead of erroring.
  WORKER_URL: z.string().url().optional(),
  WORKER_API_TOKEN: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_JWT_SECRET: z.string().optional(),
  ANALYZE: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
});

export function validateEnv() {
  // In CI environments like GitHub Actions, unset secrets are injected as empty strings.
  // We clean the env to convert empty strings to undefined so Zod's .optional() validation works.
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(([_, v]) => v !== undefined && v !== "")
  );

  const parsed = envSchema.safeParse(cleanEnv);
  if (!parsed.success) {
    const warnings = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    if (warnings) {
      console.warn(`Environment validation warnings:\n${warnings}`);
    }
    return envSchema.partial().parse(cleanEnv);
  }
  return parsed.data;
}

export type Env = z.infer<typeof envSchema>;
