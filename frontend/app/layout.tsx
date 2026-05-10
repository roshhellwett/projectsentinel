import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Toaster } from 'sonner';


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
  manifest: '/manifest',
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

  return (
    <html lang="en" suppressHydrationWarning>
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
        {/* Figma ambient background */}
        <div className="figma-ambient" aria-hidden="true" />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2000,
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' },
          }}
        />
        <main id="main" className="flex-1 w-full relative z-10 page-enter">
          {children}
        </main>
        {/* Spacer so footer clears the fixed mobile bottom nav */}
        <div className="h-20 md:hidden" aria-hidden="true" />
        <Footer />
        <MobileBottomNav />
        <ScrollToTop />
      </body>
    </html>
  );
}
