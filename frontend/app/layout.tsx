import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';
import { ScrollRestorer } from '@/components/ui/ScrollRestorer';


const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'India Verified — AI-Verified Indian News',
    template: '%s — India Verified',
  },
  description:
    'AI-powered Indian news aggregator. Every story cross-referenced across multiple trusted sources. No ads. No bias. Open source.',
  keywords: [
    'Indian news',
    'AI verified news',
    'fact-check',
    'news aggregator',
    'India news',
    'trusted news',
  ],
  openGraph: {
    title: 'India Verified — AI-Verified Indian News',
    description: 'AI-Verified Indian News. No Ads. No Bias.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'India Verified',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India Verified — AI-Verified Indian News',
    description: 'AI-Verified Indian News. No Ads. No Bias.',
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
    types: { 'application/rss+xml': `${siteUrl}/rss.xml` },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  // Next.js automatically links app/manifest.ts at /manifest.webmanifest;
  // we point at the correct file rather than the previous '/manifest' 404.
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#fbfbfd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  // Pre-warm DNS + TLS for the two third-party origins we hit most often:
  // Supabase for the post API and Google for source favicons. Shaves
  // ~100–200 ms off the first request on cold network paths.
  const supabaseOrigin = (() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
      }
    } catch {
      /* ignore */
    }
    return null;
  })();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://www.google.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google.com" />
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
      </head>
      <body
        className={`${inter.variable} ${newsreader.variable} ${geistMono.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased bg-dot-grid`}
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
        {/* Fixed viewport-centered watermark — always behind content */}
        <div className="watermark-fixed" aria-hidden="true">
          <span>Verified News</span>
        </div>
        <div className="watermark-spotlight" aria-hidden="true" />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1 w-full relative z-10 page-enter">
          {children}
        </main>
        {/* Spacer so footer clears the fixed mobile bottom nav */}
        <div className="h-20 md:hidden" aria-hidden="true" />
        <Footer />
        <MobileBottomNav />
        <ScrollToTop />
        <KeyboardShortcuts />
        <ScrollRestorer />
      </body>
    </html>
  );
}
