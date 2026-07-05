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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch {
      if (isDev) {
        console.warn(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`);
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';
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

export function validateEnv(): void {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      getEnvConfig();
    } catch (error) {
      console.warn('Environment validation warning:', error);
    }
  }
}
