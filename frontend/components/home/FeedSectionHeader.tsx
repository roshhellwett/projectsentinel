'use client';

import { useI18n } from '@/lib/i18n/i18n-shared';
import { Flame } from 'lucide-react';

export function FeedSectionHeader() {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-4 mb-7 pb-4 border-b border-rule/60">
      <h2 className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-bold text-ink">
        <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
          <Flame className="w-5 h-5" strokeWidth={2.2} />
        </span>
        <span>{t('feed.your_feed')}</span>
      </h2>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted bg-paper-2 px-3 py-1.5 rounded-full border border-rule/60">
        <span className="w-1.5 h-1.5 rounded-full bg-cred-high animate-pulse" />
        {t('feed.live_stream')}
      </span>
    </div>
  );
}
