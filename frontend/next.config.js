/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xkztysfrnvqjnjyowlcw.supabase.co',
      },
    ],
  },
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
}

module.exports = nextConfig
