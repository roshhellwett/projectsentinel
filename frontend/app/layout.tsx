import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiaverified.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'India Verified - AI-Verified Indian News',
    template: '%s - India Verified',
  },
  description: 'Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.',
  keywords: ['Indian news', 'AI verified news', 'fact-check', 'news aggregator', 'India news', 'trusted news'],
  openGraph: {
    title: 'India Verified - AI-Verified Indian News',
    description: 'Fully automated, AI-powered Indian news aggregator',
    type: 'website',
    locale: 'en_IN',
    siteName: 'India Verified',
    url: siteUrl,
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India Verified - AI-Verified Indian News',
    description: 'Fully automated, AI-powered Indian news aggregator',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl}/rss.xml`,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest',
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-slate-900 min-h-screen flex flex-col antialiased selection:bg-slate-200 selection:text-slate-900`}>
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
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1 w-full">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
