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
        "group relative cursor-pointer select-none touch-manipulation p-5 sm:p-7 md:p-8 flex flex-col rounded-[20px] sm:rounded-[24px] border-2 border-ink bg-paper shadow-[4px_4px_0px_rgb(var(--c-ink))] transform-gpu transition-all duration-300 ease-out overflow-hidden",
        "hover:-translate-y-1.5 hover:-translate-x-1.5 hover:shadow-[10px_10px_0px_rgb(var(--c-ink))]",
        "active:translate-y-0 active:translate-x-0 active:shadow-[2px_2px_0px_rgb(var(--c-ink))]",
        "focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none"
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" }}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 min-h-[20px]">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink bg-paper/80 px-2.5 py-0.5 rounded border border-rule/70 shadow-2xs">
            {post.category}
          </span>
          <span className="text-ink-soft/40" aria-hidden="true">
            ·
          </span>
          <span
            className="font-mono text-[10px] sm:text-[11px] text-ink-soft"
            suppressHydrationWarning
          >
            {useTimeAgo(post.published_at)}
          </span>
          {badge && (
            <span className="font-mono text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-2xs border text-paper bg-red-600 border-red-700 animate-pulse">
              {badge === "breaking" ? t("hero.breaking") : t("hero.top_story")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <VerificationStamp score={post.credibility_score} compact />
        </div>
      </div>

      <Link
        href={`/news/${post.id}/`}
        onClick={() => haptic.medium()}
        className="block group-hover:opacity-95 transition-opacity"
      >
        <h2 className="font-display font-[800] text-ink leading-[1.12] tracking-[-0.02em] mb-3 sm:mb-4 text-[clamp(1.4rem,4vw,2.3rem)] group-hover:text-ink/90 transition-colors">
          {post.headline}
        </h2>

        <p className="font-body text-[14px] sm:text-[15.5px] leading-[1.6] text-ink-soft line-clamp-3 mb-4 sm:mb-5 font-normal">
          {post.summary}
        </p>

        {firstHost && (
          <div className="inline-block px-3 py-1.5 rounded-lg border border-rule/80 bg-paper/60 mb-4 sm:mb-5">
            <p className="font-body text-xs text-ink-soft">
              {t("hero.first_reported")}{" "}
              <span className="font-mono font-bold text-ink underline decoration-rule-strong">{firstHost}</span>
            </p>
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 sm:pt-4 border-t border-rule/70">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs text-ink-soft font-medium shrink-0">
            <ShieldIcon />
            {sourcesCount}{" "}
            {t(sourcesCount === 1 ? "card.source" : "card.sources")}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] border border-ink/25 text-ink bg-ink/5 font-body text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
            <YoutubeIcon className="text-ink" />
            {t("card.youtube")}
          </span>
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>
    </div>
  );
});
