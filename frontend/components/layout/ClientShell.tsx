'use client';

import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { I18nProvider } from '@/lib/i18n/context';
import { NewsBackground } from '@/components/layout/NewsBackground';
import dynamic from 'next/dynamic';

const ScrollToTop = dynamic(() => import('@/components/ui/ScrollToTop').then(m => m.ScrollToTop), { ssr: false });
const KeyboardShortcuts = dynamic(() => import('@/components/ui/KeyboardShortcuts').then(m => m.KeyboardShortcuts), { ssr: false });
const ScrollRestorer = dynamic(() => import('@/components/ui/ScrollRestorer').then(m => m.ScrollRestorer), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent').then(m => m.CookieConsent), { ssr: false });
const ToastProvider = dynamic(() => import('@/components/ui/ToastProvider').then(m => m.ToastProvider), { ssr: false });

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <NewsBackground />
      <I18nProvider>
        <Navbar />
        <main id="main" className="flex-1 w-full max-w-full overflow-x-hidden" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </I18nProvider>
      <ScrollToTop />
      <KeyboardShortcuts />
      <ScrollRestorer />
      <CookieConsent />
      <ToastProvider />
    </>
  );
}
