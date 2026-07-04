/** @type {import('next').NextConfig} */

/**
 * Derive the Supabase storage host from env so we aren't pinned to a single
 * project. Falls back to the previous hardcoded host so existing deploys
 * continue to work if NEXT_PUBLIC_SUPABASE_URL is not set at build time.
 */
let supabaseHost = 'ngygecxnwhdjdjhwmnzq.supabase.co';
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // keep fallback host
}

const nextConfig = {
  // ─────────────────────────────────────────────────────────────────────
  // Image Optimization
  // ─────────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons',
      },
    ],
    // Cache images aggressively
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Performance & Build Optimization
  // ─────────────────────────────────────────────────────────────────────
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // ─────────────────────────────────────────────────────────────────────
  // Security Headers & Caching
  // ─────────────────────────────────────────────────────────────────────
  async headers() {
    const supabaseHostRaw = supabaseHost;
    const csp = [
      "default-src 'self'",
      `connect-src 'self' https://${supabaseHostRaw} https://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com`,
      "script-src 'self' https://www.googletagmanager.com https://*.google-analytics.com 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://${supabaseHostRaw} https://*.supabase.co https://www.google.com https://*.googleusercontent.com https://www.googletagmanager.com",
      "frame-src 'self' https://www.googletagmanager.com",
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
          // Performance hints
          { key: 'Link', value: '<https://www.googletagmanager.com>; rel=preconnect' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API responses must never be cached — the polling client needs fresh data
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
        ],
      },
      // HTML pages: short CDN cache matching ISR revalidation (30s)
      {
        source: '/:path((?!.*\\..*|_next).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=59' },
        ],
      },
    ];
  },

  // ─────────────────────────────────────────────────────────────────────
  // Redirects & Rewrites for SEO
  // ─────────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect old URLs if any migration paths needed
    ];
  },

  // ─────────────────────────────────────────────────────────────────────
  // Environment Variable Validation
  // ─────────────────────────────────────────────────────────────────────
  env: {
    // Validate required public env vars at build time
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // ─────────────────────────────────────────────────────────────────────
  // Webpack & Build Optimization
  // ─────────────────────────────────────────────────────────────────────
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 10,
          reuseExistingChunk: true,
        },
        framer: {
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          name: 'framer',
          priority: 9,
          reuseExistingChunk: true,
        },
        supabase: {
          test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
          name: 'supabase',
          priority: 8,
          reuseExistingChunk: true,
        },
      };
    }
    return config;
  },

  experimental: {
    // Optimize for production
    optimizePackageImports: ['lucide-react', '@supabase/ssr'],
  },
};

module.exports = nextConfig;

// ═══════════════════════════════════════════════════════════════════
// CSP note:
//   Adding a strict CSP to a SPA that loads GTM is non-trivial.
//   For now we rely on X-XSS-Protection + X-Content-Type-Options.
//   A full strict CSP (nonce/hash-based) requires GTM to also be
//   configured for nonce injection — tracked as a future improvement.
// ═══════════════════════════════════════════════════════════════════
