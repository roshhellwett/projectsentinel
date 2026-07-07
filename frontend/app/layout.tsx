import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import dynamic from 'next/dynamic';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { websiteJsonLd, organizationJsonLd, jsonLdToString } from '@/lib/utils/structuredData';

const ClientShell = dynamic(() => import('@/components/layout/ClientShell'));

// Load only the font weights actually used in the app
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: true,
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  adjustFontFallback: true,
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  adjustFontFallback: true,
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Zenith Open Source — AI-Verified Indian News by Roshhellwett',
    template: '%s — Zenith Open Source Projects',
  },
  description:
    'AI-powered Indian news aggregator by Roshhellwett and Zenith Open Source Projects. Every story cross-referenced across multiple trusted sources. No ads. No bias. 100% open source.',
  keywords: [
    'Roshhellwett',
    'Zenith Open Source Projects',
    'roshhellwett organization',
    'zenith open source news',
    'Indian news',
    'AI verified news',
    'fact-check',
    'news aggregator',
    'India news',
    'trusted news',
    'AI news India',
  ],
  authors: [{ name: 'Roshhellwett', url: 'https://github.com/roshhellwett' }, { name: 'Zenith Open Source Projects', url: siteUrl }],
  creator: 'Roshhellwett',
  publisher: 'Zenith Open Source Projects',
  category: 'News & Media',
  verification: {
    google: 'google1bd198fa5b4dc9f1.html',
    other: {
      'google-site-verification': ['google1bd198fa5b4dc9f1.html', '1bd198fa5b4dc9f1'],
    },
  },
  openGraph: {
    title: 'Zenith Open Source — AI-Verified Indian News by Roshhellwett',
    description: 'AI-Verified Indian News by Roshhellwett and Zenith Open Source Projects. No Ads. No Bias.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Zenith Open Source Projects',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenith Open Source — AI-Verified Indian News by Roshhellwett',
    description: 'AI-Verified Indian News by Roshhellwett and Zenith Open Source Projects. No Ads. No Bias.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    types: { 'application/rss+xml': `${siteUrl}/rss.xml` },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },

  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e1d7c2' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1c18' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const supabaseOrigin = (() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
      }
    } catch {
          }
    return null;
  })();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('iv-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=d?'dark':'light';var tags=document.querySelectorAll('meta[name="theme-color"]');tags.forEach(function(t){t.setAttribute('content',d?'#1e1c18':'#e1d7c2');t.removeAttribute('media');});}catch(e){}})();`,
          }}
        />
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://www.google.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="prefetch" href="/" as="document" />
        <link rel="modulepreload" href="/manifest.webmanifest" as="fetch" crossOrigin="" />


        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdToString(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdToString(organizationJsonLd()) }}
        />
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker'in navigator&&'https:'===location.protocol){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}`}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans bg-paper text-ink min-h-screen flex flex-col antialiased w-full relative`}
      >
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <a
          href="#main"
          className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ${Z_INDEX.skipLink} focus:px-4 focus:py-2 focus:bg-accent focus:text-paper focus:rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper`}
        >
          Skip to content
        </a>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
