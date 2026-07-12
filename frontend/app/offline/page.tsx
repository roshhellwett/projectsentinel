'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
      <WifiOff className="w-16 h-16 text-muted mb-6" strokeWidth={1.5} />
      <h1 className="text-2xl font-display font-semibold text-ink mb-3">{t('offline.title')}</h1>
      <p className="text-muted text-center max-w-sm mb-8">{t('offline.desc')}</p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-paper rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          {t('offline.retry')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-paper/70 backdrop-blur-sm border border-rule/50 text-ink rounded-xl font-medium hover:bg-paper-2/70 transition-colors"
        >
          {t('offline.home')}
        </Link>
      </div>
    </main>
  );
}
