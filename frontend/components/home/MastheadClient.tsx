"use client";

import { useI18n } from "@/lib/i18n/i18n-shared";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveClock } from "@/components/layout/LiveClock";
import Link from "next/link";

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
      <div className="masthead">
        <div className="masthead__topline">
          <span className="masthead__live">Signal desk online</span>
          <span className="hidden sm:inline">Edition / 07 — Live from India</span>
          <LiveClock variant="hero" className="!border-0 !bg-transparent !p-0 !shadow-none !text-[inherit]" />
        </div>

        <div className="masthead__grid">
          <div className="min-w-0">
            <h1 className="sr-only">India Verified</h1>
            <p className="kicker mt-5">AI-cross-referenced Indian news</p>
            <h2 className="masthead__title">
              News, <em>verified.</em><br />
              Without the noise.
            </h2>
            <p className="masthead__lede">
              A calmer way to stay informed. We compare the signal across sources,
              surface what holds up, and show you why it matters.
            </p>

            <div className="masthead__stats" aria-label="Newsroom statistics">
              <div className="masthead__stat">
                <strong>{avgScore}%</strong>
                <span>{t("feed.avg_credibility")}</span>
              </div>
              <div className="masthead__stat">
                <strong><AnimatedCounter value={verifiedToday} /></strong>
                <span>verified today</span>
              </div>
            </div>
          </div>

          <div className="masthead__visual" aria-hidden="true">
            <span className="masthead__visual-index">/ 001 — LIVE</span>
            <div className="masthead__visual-core">IV</div>
            <span className="masthead__visual-label">cross-source intelligence / active</span>
          </div>
        </div>

        <div className="masthead__footer">
          <span>Start with the latest signal</span>
          <Link href="#latest" className="text-accent hover:text-accent-hover transition-colors duration-base">
            Explore today&apos;s edition <span aria-hidden="true">↘</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
