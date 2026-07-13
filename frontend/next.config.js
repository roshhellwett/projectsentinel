/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs');

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')()
  : (config) => config;

const nextConfig = {
  // ─────────────────────────────────────────────────────────────────────
  // Image Optimization
  // ─────────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
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
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  reactStrictMode: true,
  httpAgentOptions: {
    keepAlive: true,
  },

  // ─────────────────────────────────────────────────────────────────────
  // Security Headers & Caching
  // ─────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
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
      {
        source: '/category/technology',
        destination: '/category/tech',
        permanent: true,
      },
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
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react',
          priority: 20,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        framer: {
          test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
          name: 'framer',
          priority: 15,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        supabase: {
          test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
          name: 'supabase',
          priority: 12,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        ui: {
          test: /[\\/]node_modules[\\/](lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
          name: 'ui-vendors',
          priority: 8,
          reuseExistingChunk: true,
          chunks: 'all',
        },
        'radix-ui': {
          test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
          name: 'radix-ui',
          priority: 6,
          reuseExistingChunk: true,
          chunks: 'all',
        },
      };
    }
    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/ssr', '@supabase/supabase-js', 'framer-motion', 'clsx', 'class-variance-authority', 'jose', 'tailwind-merge', '@radix-ui/react-slot'],
    scrollRestoration: true,
    optimisticClientCache: true,
  },

  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Increase static generation timeout for free-tier Supabase
  staticPageGenerationTimeout: 120,
};

const sentryOptions = {
  widenClientFileUpload: true,
  hideSourceMaps: process.env.NODE_ENV === 'production',
  tunnelRoute: '/monitoring',
  telemetry: false,
};

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), sentryOptions);

