"use client";

import { memo, useCallback } from "react";
import type { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { truncateWords } from "@/lib/utils/truncate";
import { cn } from "@/lib/utils/cn";
import { BookmarkButton } from "./BookmarkButton";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";

function ShieldIcon() {
  return (
    <svg
      width="12"
      height="12"
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

function EyeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface SmartLabel {
  text: string;
  priority: number;
}

function getSmartLabel(post: Post): SmartLabel | null {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  const headline = (post.headline || "").toLowerCase();
  if (headline.includes("live:") || headline.includes("live update"))
    return { text: "LIVE", priority: 4 };
  if (headline.includes("breaking") || headline.includes("alert:"))
    return { text: "BREAKING", priority: 3 };
  if (ageMs < 45 * 60 * 1000 && post.credibility_score >= 80)
    return { text: "JUST IN", priority: 2 };
  if (ageMs < 120 * 60 * 1000 && post.credibility_score >= 85)
    return { text: "DEVELOPING", priority: 1 };
  return null;
}

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  isRead?: boolean;
  rank?: number;
  customBadge?: { text: string; priority?: number };
}

const NewsCardComponent = ({
  post,
  onClick,
  isNew = false,
  isRead = false,
  rank,
  customBadge,
}: NewsCardProps) => {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const smartLabel = getSmartLabel(post);
  const labelToDisplay = customBadge || smartLabel;
  const sourcesCount = post.source_count ?? post.sources?.length ?? 0;
  const isVideo = post.content_type === "video";

  const handleClick = useCallback(() => {
    haptic.light();
    onClick?.();
  }, [haptic, onClick]);

  const handleYoutubeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      haptic.light();
      const query = encodeURIComponent(`${post.headline} latest news`);
      window.open(
        `https://www.youtube.com/results?search_query=${query}&sp=CAI%3D`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [haptic, post.headline],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if ((e.target as HTMLElement).closest("a, button")) return;
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${isVideo ? "Video: " : "Read article: "}${post.headline}${typeof rank === "number" ? ` (Rank #${rank})` : ""}`}
      data-read={isRead ? "true" : "false"}
      className={cn(
        "group relative cursor-pointer select-none touch-manipulation paper-card glass-card p-4 sm:p-6 flex flex-col h-full rounded-2xl border border-rule transition-all duration-300 transform-gpu",
        "hover:-translate-y-1 hover:shadow-[0_12px_36px_rgb(var(--c-ink)/0.09)] hover:border-ink/40",
        "focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none",
        isNew && "border-l-[4px] border-l-ink",
        isVideo && "border-amber-500/30 bg-amber-500/[0.02]",
        isRead && "opacity-65 hover:opacity-100",
      )}
    >
      {isVideo && (
        <span className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
          <span
            className="absolute top-[-2px] right-[-12px] h-5 w-12 bg-amber-500/20 rotate-45"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              backgroundColor: "rgba(217, 119, 6, 0.2)",
            }}
          />
        </span>
      )}

      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 min-h-[18px] sm:min-h-[20px]">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0">
          {typeof rank === "number" && (
            <span className="flex items-center justify-center h-5 px-1.5 rounded border border-ink text-ink font-mono font-bold text-[10px] bg-paper shadow-[1.5px_1.5px_0px_rgb(var(--c-ink))]">
              {rank < 10 ? `#0${rank}` : `#${rank}`}
            </span>
          )}
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-ink bg-paper/80 px-2 py-0.5 rounded border border-rule/70 shadow-2xs">
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
          {labelToDisplay && (
            <span
              className={cn(
                "font-mono text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-2xs border",
                (labelToDisplay.priority ?? 1) >= 3
                  ? "text-paper bg-red-600 border-red-700 animate-pulse"
                  : "text-ink bg-amber-400/30 border-amber-500/40",
              )}
            >
              {labelToDisplay.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <VerificationStamp score={post.credibility_score} compact />
        </div>
      </div>

      <h3 className="font-display font-[800] text-[16px] sm:text-[19px] leading-[1.22] tracking-[-0.015em] text-ink line-clamp-3 mb-2 sm:mb-2.5 flex-shrink-0 group-hover:text-ink/90 transition-colors">
        {post.headline}
      </h3>

      <p className="font-body text-[13px] sm:text-[14.5px] leading-[1.55] text-ink-soft line-clamp-2 mb-3 sm:mb-4 flex-shrink-0 font-normal">
        {truncateWords(post.summary, 22)}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-rule/70">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-soft font-medium shrink-0">
            <ShieldIcon />
            {sourcesCount}{" "}
            {t(sourcesCount === 1 ? "card.source" : "card.sources")}
          </span>
          {(isVideo || post.video_url) && (
            <button
              type="button"
              onClick={handleYoutubeClick}
              className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] border border-ink/25 text-ink bg-ink/5 hover:bg-ink/15 active:scale-95 font-body text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded transition-all shadow-2xs"
              aria-label={t("news.aria_youtube", { headline: post.headline })}
            >
              <YoutubeIcon className="text-ink" />
              {t("card.youtube")}
            </button>
          )}
        </div>
        <BookmarkButton postId={post.id} variant="icon" />
      </div>

      {isRead && (
        <span className="inline-flex items-center gap-1 self-start px-2.5 py-0.5 mt-2 border border-rule rounded-full text-[10px] font-mono font-medium text-ink-soft bg-paper-2">
          <EyeIcon />
          {t("card.viewed")}
        </span>
      )}
    </div>
  );
};

export const NewsCard = memo(NewsCardComponent);
