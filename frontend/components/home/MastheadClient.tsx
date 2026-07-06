'use client';

import { useI18n } from '@/lib/i18n/i18n-shared';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LiveClock } from '@/components/layout/LiveClock';
import { Zap, ShieldCheck, Radio } from 'lucide-react';

const IST_HOUR_FMT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
});

function getIndianGreeting(t: (key: string) => string): string {
  const hour = parseInt(IST_HOUR_FMT.format(new Date()), 10);
  if (Number.isNaN(hour)) return t('home.greeting_welcome');
  if (hour < 5) return t('home.greeting_night');
  if (hour < 12) return t('home.greeting_morning');
  if (hour < 17) return t('home.greeting_afternoon');
  if (hour < 21) return t('home.greeting_evening');
  return t('home.greeting_night');
}

interface MastheadClientProps {
  avgScore: number;
  verifiedToday: number;
}

export function MastheadClient({ avgScore, verifiedToday }: MastheadClientProps) {
  const { t } = useI18n();

  return (
    <section
      aria-label="Today's stats masthead"
      className="relative my-6 sm:my-8 p-7 sm:p-9 rounded-2xl bg-[#fcfaf7] dark:bg-[#15151e] md:bg-paper/70 md:backdrop-blur-2xl md:backdrop-saturate-[1.3] border border-rule/60 shadow-card overflow-hidden transform-gpu"
    >
      <div
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-[0.07] dark:opacity-[0.12] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--c-accent)), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full opacity-[0.05] dark:opacity-[0.08] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--c-glow-to)), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl stagger-entry">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.15em] border border-accent/15">
              <Radio className="w-3 h-3 flex-shrink-0" />
              <span>{t('feed.live_verified')}</span>
            </span>
            <span className="text-xs font-semibold text-muted">&middot; {getIndianGreeting(t)}</span>
          </div>

          <h1 className="font-display font-black text-ink leading-[1.04] tracking-[-0.025em] text-[clamp(2rem,4.5vw,3.5rem)] mb-4">
            {t('feed.heading_real_time')}
          </h1>

          <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
            {t('feed.heading_desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end flex-shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-5 p-4 rounded-xl bg-[#f2f0eb] dark:bg-[#1c1c28] md:bg-paper-2/70 border border-rule/60 shadow-sm md:backdrop-blur-xl md:backdrop-saturate-[1.3]">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-cred-high/10 text-cred-high">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.12em]">{t('feed.avg_credibility')}</div>
                <div className="text-sm font-bold text-ink tabular-nums">{avgScore}% {t('feed.verified')}</div>
              </div>
            </div>

            <div className="h-9 w-px bg-rule/50 hidden sm:block" />

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <Zap className="w-5 h-5" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.12em]">{t('feed.updates_24h')}</div>
                <div className="text-sm font-bold text-ink flex items-center gap-1">
                  <AnimatedCounter value={verifiedToday} />
                  <span>{t('feed.stories')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="self-end sm:self-auto w-full sm:w-auto">
            <LiveClock variant="hero" className="w-full bg-[#f2f0eb] dark:bg-[#1c1c28] md:bg-paper-2/70 rounded-xl border border-rule/60 px-4 py-2.5 shadow-sm md:backdrop-blur-xl md:backdrop-saturate-[1.3]" />
          </div>
        </div>
      </div>
    </section>
  );
}
