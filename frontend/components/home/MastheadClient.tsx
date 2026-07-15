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
      <div className="pb-6 sm:pb-8 border-b-2 border-ink/80 relative w-full min-w-0">
        <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
          <div className="min-w-0 flex-1 w-full">
            <h1 className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 border-rule bg-paper shadow-sm font-mono font-bold text-ink text-lg sm:text-xl uppercase tracking-[0.15em] mb-4">
              Satyamev Jayate
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 w-full">
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

              <LiveClock variant="hero" className="rounded-lg shadow-2xs border border-rule bg-paper-2/60 px-3 py-1.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
