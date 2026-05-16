/**
 * Environment variable validation & configuration
 * Ensures all required env vars are present and properly typed at runtime
 */

type EnvMode = 'development' | 'production' | 'test';

interface EnvConfig {
  isDev: boolean;
  isProd: boolean;
  mode: EnvMode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
  gtmId: string | null;
}

function getEnvMode(): EnvMode {
  return (process.env.NODE_ENV as EnvMode) || 'production';
}

function validateRequiredEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function createEnvConfig(): EnvConfig {
  const mode = getEnvMode();
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  // Required for browser client
  const supabaseUrl = validateRequiredEnv(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const supabaseAnonKey = validateRequiredEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Validate Supabase URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || null;

  return {
    isDev,
    isProd,
    mode,
    supabaseUrl,
    supabaseAnonKey,
    siteUrl,
    gtmId,
  };
}

let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = createEnvConfig();
  }
  return cachedConfig;
}

/**
 * Validate that all critical environment variables are set
 * Call this during app initialization (in layout or root component)
 */
export function validateEnv(): void {
  if (typeof window === 'undefined') {
    // Server-side: validate at build/start time
    try {
      getEnvConfig();
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw error;
    }
  }
}
