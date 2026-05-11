/** @type {import('next').NextConfig} */
// Derive the Supabase storage host from env so we aren't pinned to a single
// project. Falls back to the previous hardcoded host so existing deploys
// continue to work if NEXT_PUBLIC_SUPABASE_URL is not set at build time.
let supabaseHost = 'ngygecxnwhdjdjhwmnzq.supabase.co';
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // keep fallback host
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
      },
    ],
  },
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Link', value: `<https://www.googletagmanager.com>; rel=preconnect, <https://www.googletagmanager.com>; rel=preconnect; crossorigin` },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
