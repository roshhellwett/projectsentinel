'use client';

import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { I18nProvider } from '@/lib/i18n/context';
import { NewsBackground } from '@/components/layout/NewsBackground';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import dynamic from 'next/dynamic';

const KeyboardShortcuts = dynamic(() => import('@/components/ui/KeyboardShortcuts').then(m => m.KeyboardShortcuts));
const ScrollRestorer = dynamic(() => import('@/components/ui/ScrollRestorer').then(m => m.ScrollRestorer));
const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent').then(m => m.CookieConsent));
const ToastProvider = dynamic(() => import('@/components/ui/ToastProvider').then(m => m.ToastProvider));

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <NewsBackground />
      <OfflineBanner />
      <I18nProvider>
        <Navbar />
        <main id="main" className="flex-1 w-full" tabIndex={-1}>
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
