import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'India Verified - AI-Verified Indian News',
    short_name: 'India Verified',
    description: 'Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#2563eb',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
