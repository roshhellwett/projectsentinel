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
      className="my-4 sm:my-6 w-full max-w-full"
    >
      <div className="pb-4 sm:pb-6 border-b border-rule">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6">
          <div className="min-w-0">
            <h1 className="font-display font-[900] text-ink text-[clamp(1.3rem,5vw,2.6rem)] leading-[1.05] tracking-[-0.02em] mb-1 sm:mb-2">
              Satyamev Jayate
            </h1>

            <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-ink-soft mb-2 sm:mb-4">
              AI-Cross-Referenced · Open Source
            </p>

            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
              <span className="font-body text-[10px] sm:text-[11px] tracking-wider text-ink-soft uppercase">
                {t("feed.avg_credibility")}:{" "}
                <span className="text-ink font-bold">{avgScore}%</span>
              </span>
              <span className="w-px h-3 bg-rule" aria-hidden="true" />
              <span className="font-body text-[10px] sm:text-[11px] tracking-wider text-ink-soft uppercase">
                <AnimatedCounter value={verifiedToday} /> {t("feed.stories")}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <LiveClock variant="hero" className="rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
