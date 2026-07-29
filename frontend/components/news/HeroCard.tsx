"use client";

import { memo } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { getHostname } from "@/lib/utils/getHostname";
import { cn } from "@/lib/utils/cn";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { BookmarkButton } from "@/components/news/BookmarkButton";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";

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

function YoutubeIcon({ className = "text-ink" }: { className?: string }) {
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
      className={className}
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
  const isVideo = post.content_type === "video" || !!post.video_url;
  const sourcesCount = post.source_count ?? post.sources?.length ?? 1;
  const firstSource = (post.sources ?? [])[0];
  const firstHost = firstSource ? getHostname(firstSource.url) : "";

  return (
    <div
      role="article"
      aria-label={`Featured article: ${post.headline}`}
      className={cn(
        "group relative cursor-pointer select-none touch-manipulation p-fluid-md sm:p-fluid-lg flex flex-col rounded-token-lg border-2 border-ink bg-paper/80 backdrop-blur-sm shadow-[4px_4px_0px_rgb(var(--c-ink))] transform-gpu transition-all duration-base ease-apple overflow-hidden",
        "hover:-translate-y-1.5 hover:-translate-x-1.5 hover:shadow-[10px_10px_0px_rgb(var(--c-ink))]",
        "active:translate-y-0 active:translate-x-0 active:shadow-[2px_2px_0px_rgb(var(--c-ink))]",
        "focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none"
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" }}
    >
      <div className="flex items-start justify-between gap-fluid-3xs sm:gap-fluid-2xs mb-fluid-xs sm:mb-fluid-sm min-h-[20px]">
        <div className="flex flex-wrap items-center gap-fluid-3xs sm:gap-fluid-2xs min-w-0">
          <span className="font-mono text-fluid-2xs font-bold tracking-wider uppercase text-ink bg-paper/80 px-2.5 py-0.5 rounded-token-xs border border-rule/70 shadow-2xs shrink-0">
            {post.category}
          </span>
          <span className="text-ink-soft/40 shrink-0" aria-hidden="true">
            ·
          </span>
          <span
            className="font-mono text-fluid-2xs text-ink-soft shrink-0"
            suppressHydrationWarning
          >
            {useTimeAgo(post.published_at)}
          </span>
          {badge && (
            <span className="font-mono text-fluid-2xs font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-token-xs shadow-2xs border text-paper bg-red-600 border-red-700 animate-pulse shrink-0">
              {badge === "breaking" ? t("hero.breaking") : t("hero.top_story")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <VerificationStamp score={post.credibility_score} compact />
        </div>
      </div>

      <Link
        href={`/news/${post.id}/`}
        onClick={() => haptic.medium()}
        className="block group-hover:opacity-95 transition-opacity duration-base min-w-0"
      >
        <h2 className="font-display font-[800] text-ink leading-[1.12] tracking-[-0.02em] mb-fluid-xs sm:mb-fluid-sm text-fluid-2xl group-hover:text-ink/90 transition-colors duration-base">
          {post.headline}
        </h2>

        <p className="font-body text-fluid-sm leading-[1.6] text-ink-soft line-clamp-3 mb-fluid-sm sm:mb-fluid-md font-normal">
          {post.summary}
        </p>

        {firstHost && (
          <div className="inline-block max-w-full px-3 py-1.5 rounded-token-md border border-rule/80 bg-paper/60 mb-fluid-sm sm:mb-fluid-md">
            <p className="font-body text-fluid-xs text-ink-soft truncate">
              {t("hero.first_reported")}{" "}
              <span className="font-mono font-bold text-ink underline decoration-rule-strong">{firstHost}</span>
            </p>
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between gap-fluid-2xs mt-auto pt-fluid-xs sm:pt-fluid-sm border-t border-rule/70">
        <div className="flex items-center gap-fluid-2xs sm:gap-fluid-xs min-w-0">
          <span className="inline-flex items-center gap-1 font-mono text-fluid-xs text-ink-soft font-medium shrink-0">
            <ShieldIcon />
            {sourcesCount}{" "}
            {t(sourcesCount === 1 ? "card.source" : "card.sources")}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] border border-ink/25 text-ink bg-ink/5 font-body text-fluid-2xs font-bold tracking-wider uppercase rounded-token-xs shadow-2xs shrink-0">
            <YoutubeIcon className="text-ink" />
            {t("card.youtube")}
          </span>
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>
    </div>
  );
});
