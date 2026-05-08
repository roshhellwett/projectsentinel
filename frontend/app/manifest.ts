import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'India Verified - AI-Verified Indian News',
    short_name: 'India Verified',
    description: 'Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1e3a8a',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
