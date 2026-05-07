/**
 * Root layout with fonts, navbar, and footer
 * Optimized: font display swap, viewport meta
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

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

export const metadata: Metadata = {
  title: 'Sentinel News - AI-Verified Indian News',
  description: 'Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.',
  keywords: ['Indian news', 'AI verified news', 'fact-check', 'news aggregator'],
  openGraph: {
    title: 'Sentinel News - AI-Verified Indian News',
    description: 'Fully automated, AI-powered Indian news aggregator',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#f8fafc'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-slate-900 min-h-screen flex flex-col antialiased selection:bg-slate-200 selection:text-slate-900`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
