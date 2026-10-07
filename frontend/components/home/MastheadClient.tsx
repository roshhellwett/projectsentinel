"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveClock } from "@/components/layout/LiveClock";
import { EditionArtwork } from "./EditionArtwork";
import { useI18n } from "@/lib/i18n/i18n-shared";

export function MastheadClient({ avgScore, verifiedToday }: { avgScore: number | null; verifiedToday: number }) {
  const { t } = useI18n();
  return (
    <section aria-label="Today's edition">
      <div className="edition-meta">
        <span className="edition-meta__live">The daily perspective</span>
        <span className="hidden md:inline">Independent by design. Open by default.</span>
        <LiveClock variant="hero" />
      </div>
      <div className="editorial-masthead">
        <div className="animate-slide-up">
          <p className="editorial-kicker">A little less noise. A lot more clarity.</p>
          <h1>Know the story.<br />See the <em>whole picture.</em></h1>
          <p className="editorial-masthead__description">
            India, in perspective. Concise stories, compared across sources—with the context and credibility to make up your own mind.
          </p>
          <div className="editorial-masthead__actions">
            <Link href="#latest" className="editorial-button">Read the latest <ArrowDown size={15} aria-hidden="true" /></Link>
            <Link href="/how-it-works" className="editorial-link">Our verification process <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <EditionArtwork />
      </div>
      <div className="edition-statbar">
        <div className="edition-statbar__promise">
          <span><Check size={12} aria-hidden="true" /> Source-linked</span>
          <span><Check size={12} aria-hidden="true" /> Ad-free</span>
          <span><Check size={12} aria-hidden="true" /> Open-source</span>
        </div>
        <div className="edition-stat"><strong>{avgScore === null ? "—" : `${avgScore}%`}</strong><span>{t("feed.avg_credibility")}</span></div>
        <div className="edition-stat"><strong><AnimatedCounter value={verifiedToday} /></strong><span>stories in the last 24h</span></div>
      </div>
    </section>
  );
}
