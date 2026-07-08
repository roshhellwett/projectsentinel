'use client';

import { useI18n } from '@/lib/i18n/i18n-shared';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LiveClock } from '@/components/layout/LiveClock';

interface MastheadClientProps {
  avgScore: number;
  verifiedToday: number;
}

export function MastheadClient({ avgScore, verifiedToday }: MastheadClientProps) {
  const { t } = useI18n();

  return (
    <section aria-label="Today's edition" className="my-6 w-full max-w-full">
      <div className="flex items-start justify-between gap-6 pb-6 border-b border-rule">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-soft mb-2">
            AI-Cross-Referenced · Open Source
          </p>

          <h1 className="font-body font-[900] text-ink text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[1.05] tracking-[-0.03em] mb-3">
            India Verified
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-body text-[11px] tracking-wider text-ink-soft uppercase">
              {t('feed.avg_credibility')}: <span className="text-ink font-bold">{avgScore}%</span>
            </span>
            <span className="w-px h-3 bg-rule" aria-hidden="true" />
            <span className="font-body text-[11px] tracking-wider text-ink-soft uppercase">
              <AnimatedCounter value={verifiedToday} /> {t('feed.stories')}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <LiveClock variant="hero" />
        </div>
      </div>
    </section>
  );
}
