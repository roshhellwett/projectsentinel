import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
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
  manifest: '/manifest',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
        className={`${inter.variable} ${geistMono.variable} font-sans bg-background text-white min-h-screen flex flex-col antialiased bg-dot-grid`}
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
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
