"use client";

import { useI18n } from "@/lib/i18n/i18n-shared";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveClock } from "@/components/layout/LiveClock";

interface MastheadClientProps {
  avgScore: number;
  verifiedToday: number;
}

export function MastheadClient({
  avgScore,
  verifiedToday,
}: MastheadClientProps) {
  const { t } = useI18n();

  return (
    <section
      aria-label="Today's edition"
      className="my-5 sm:my-8 w-full max-w-full animate-entrance"
    >
      <div className="pb-6 sm:pb-8 border-b-2 border-ink/80 relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-rule bg-paper-2/80 shadow-2xs mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink font-bold">
                AI-Cross-Referenced · Open Source Engine
              </p>
            </div>

            <h1 className="font-display font-[900] text-ink text-[clamp(1.8rem,6vw,3.2rem)] leading-[1.02] tracking-[-0.03em] mb-3 drop-shadow-2xs">
              Satyamev Jayate
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rule bg-paper-2/60 shadow-2xs">
                <span className="font-body text-xs tracking-wider text-ink-soft uppercase font-semibold">
                  {t("feed.avg_credibility")}:
                </span>
                <span className="text-ink font-mono font-bold text-sm bg-ink/5 px-2 py-0.5 rounded border border-rule/50">
                  {avgScore}%
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rule bg-paper-2/60 shadow-2xs">
                <span className="font-body text-xs tracking-wider text-ink-soft uppercase font-semibold">
                  Verified Today:
                </span>
                <span className="text-ink font-mono font-bold text-sm bg-ink/5 px-2 py-0.5 rounded border border-rule/50 flex items-center gap-1">
                  <AnimatedCounter value={verifiedToday} />
                  <span className="text-[11px] font-normal text-ink-soft">stories</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 self-start lg:self-end">
            <LiveClock variant="hero" className="rounded-xl shadow-sm border border-rule/80 glass-card p-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
