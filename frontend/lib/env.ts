import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  ANALYZE: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const warnings = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    if (warnings) {
      console.warn(`Environment validation warnings:\n${warnings}`);
    }
    return envSchema.partial().parse(process.env);
  }
  return parsed.data;
}

export type Env = z.infer<typeof envSchema>;
