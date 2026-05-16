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
      // Cache API responses moderately
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      // Cache HTML minimally for freshness
      {
        source: '/:path((?!.*\\..*|_next).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
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
