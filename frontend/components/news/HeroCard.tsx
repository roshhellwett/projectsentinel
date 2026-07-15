"use client";

import { memo } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { getHostname } from "@/lib/utils/getHostname";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9l6 4-6 4z" />
    </svg>
  );
}

interface HeroCardProps {
  post: Post;
  badge?: "breaking" | "trending" | null;
}

export const HeroCard = memo(function HeroCard({
  post,
  badge = "trending",
}: HeroCardProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const isVideo = post.content_type === "video";

  const firstSource = (post.sources ?? [])[0];
  const firstHost = firstSource ? getHostname(firstSource.url) : "";
  const otherSourceCount = Math.max(
    0,
    (post.source_count ?? post.sources?.length ?? 0) - 1,
  );

  return (
    <div
      role="article"
      aria-label={`Featured article: ${post.headline}`}
      className="w-full max-w-full border-2 border-ink/80 bg-paper-2/90 glass-card rounded-2xl p-5 sm:p-8 md:p-10 relative overflow-hidden shadow-[0_16px_48px_rgb(var(--c-ink)/0.08)] hover:shadow-[0_24px_64px_rgb(var(--c-ink)/0.12)] hover:border-ink transition-all duration-300 transform-gpu group"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" }}
    >
      <Link
        href={`/news/${post.id}/`}
        onClick={() => haptic.medium()}
        className="block"
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-rule bg-paper font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-ink" />
              {post.category}
            </span>
            <span
              className="font-mono text-xs text-ink-soft"
              suppressHydrationWarning
            >
              {useTimeAgo(post.published_at)}
            </span>
            {isVideo && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-ink/30 rounded text-ink font-body text-xs font-bold tracking-wider uppercase bg-ink/5 shadow-2xs">
                <YoutubeIcon />
                {t("hero.video")}
              </span>
            )}
          </div>
          <VerificationStamp score={post.credibility_score} compact />
        </div>

        {badge && (
          <div className="mb-2 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] sm:text-xs font-extrabold tracking-widest uppercase text-paper bg-ink shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-paper animate-ping" />
              {badge === "breaking" ? t("hero.breaking") : t("hero.top_story")}
            </span>
          </div>
        )}

        <h2 className="font-display font-[900] text-ink leading-[1.06] tracking-[-0.025em] mb-3 sm:mb-4 text-[clamp(1.4rem,4.5vw,2.6rem)] group-hover:text-ink/90 transition-colors">
          {post.headline}
        </h2>

        <p className="font-body text-[14px] sm:text-[16px] text-ink-soft leading-[1.65] line-clamp-3 max-w-4xl mb-4 sm:mb-6 font-normal">
          {post.summary}
        </p>

        {firstHost && (
          <div className="inline-block p-2.5 px-3.5 rounded-lg border border-rule/80 bg-paper/60 mb-4 sm:mb-6">
            <p className="font-body text-xs sm:text-[13px] text-ink-soft">
              {t("hero.first_reported")}{" "}
              <span className="font-mono font-bold text-ink underline decoration-rule-strong">{firstHost}</span>
              {otherSourceCount > 0 && (
                <> · <span className="font-semibold text-ink">{t("hero.verified_by", { count: otherSourceCount })}</span></>
              )}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 sm:pt-5 border-t-2 border-rule">
          <span className="font-body text-xs text-ink-soft flex items-center gap-1.5 font-medium">
            <ShieldIcon />
            {t("hero.sources_count", { n: post.source_count || 1 })} cross-referenced
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-ink group-hover:translate-x-1 transition-all duration-200 font-mono font-bold bg-paper px-3.5 py-1.5 rounded border border-rule shadow-2xs">
            {t("hero.read_article")} <ArrowRight />
          </span>
        </div>
      </Link>
    </div>
  );
});
