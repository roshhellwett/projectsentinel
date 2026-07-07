import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'India Verified - AI-Verified Indian News',
    short_name: 'India Verified',
    description: 'Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.',
    start_url: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    background_color: '#fbfbfd',
    theme_color: '#1a1a2e',
    orientation: 'portrait',
    categories: ['news', 'politics', 'technology'],
    lang: 'en',
    screenshots: [
      {
        src: '/screenshot-narrow.png',
        sizes: '360x780',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'India Verified on mobile — swipe through verified news stories',
      },
    ],
    icons: [
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
