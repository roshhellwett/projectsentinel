import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import dynamic from 'next/dynamic';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { OfflineBanner } from '@/components/layout/OfflineBanner';

const KeyboardShortcuts = dynamic(() => import('@/components/ui/KeyboardShortcuts').then(m => m.KeyboardShortcuts));
const ScrollRestorer = dynamic(() => import('@/components/ui/ScrollRestorer').then(m => m.ScrollRestorer));
const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent').then(m => m.CookieConsent));
const ToastProvider = dynamic(() => import('@/components/ui/ToastProvider').then(m => m.ToastProvider));

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
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

  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e1d7c2' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1c18' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
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
            __html: `(function(){try{var s=localStorage.getItem('iv-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');var tags=document.querySelectorAll('meta[name="theme-color"]');tags.forEach(function(t){    t.setAttribute('content',d?'#1e1c18':'#e1d7c2');t.removeAttribute('media');});}catch(e){}})();`,
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
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans bg-paper text-ink min-h-screen flex flex-col antialiased`}
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-paper focus:rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
        >
          Skip to content
        </a>
        <OfflineBanner />
        <Navbar />
        <main id="main" className="flex-1 w-full" tabIndex={-1}>
          {children}
        </main>

        <Footer />
        <MobileBottomNav />
        <ScrollToTop />
        <KeyboardShortcuts />
        <ScrollRestorer />
        <CookieConsent />
        <ToastProvider />
      </body>
    </html>
  );
}
