"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, Play, ShieldCheck } from "lucide-react";
import type { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { cn } from "@/lib/utils/cn";
import { BookmarkButton } from "./BookmarkButton";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";
import { TopicIllustration } from "@/components/visual/TopicIllustration";
import { CategoryIcon } from "@/components/visual/MaterialIcon";

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  isRead?: boolean;
  rank?: number;
  customBadge?: { text: string; priority?: number };
}

export const NewsCard = memo(function NewsCard({ post, onClick, isNew = false, isRead = false, rank, customBadge }: NewsCardProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const timeAgo = useTimeAgo(post.published_at);
  const sourceCount = post.source_count ?? post.sources?.length ?? 0;
  const handleOpen = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    haptic.light();
    if (onClick) { event.preventDefault(); onClick(); }
  }, [onClick, haptic]);

  return (
    <article role="article" aria-label={`Read article: ${post.headline}${rank ? ` (Rank #${rank})` : ""}`} data-read={isRead} data-new={isNew} className="story-card">
      <TopicIllustration category={post.category} compact />
      <div className="story-card__top">
        <div className="flex items-center gap-2.5 min-w-0">
          {rank !== undefined && <span className="story-card__rank">{String(rank).padStart(2, "0")}</span>}
          <CategoryIcon category={post.category} size="xs" />
          <span className="story-meta__category font-mono text-[9px] tracking-[0.08em]">{t(`nav.${post.category}`)}</span>
        </div>
        <VerificationStamp score={post.credibility_score} xsmall />
      </div>
      <div className="story-meta mb-2.5">
        <span suppressHydrationWarning>{timeAgo}</span>
        {customBadge && <span className="text-accent">/ {customBadge.text}</span>}
        {isNew && <span className="text-accent">/ Just in</span>}
        {isRead && <span className="inline-flex items-center gap-1"><Eye size={11} aria-hidden="true" /> {t("card.viewed")}</span>}
      </div>
      <h3 className="story-card__title">
        <Link href={`/news/${post.id}`} onClick={handleOpen} className="story-card__link">{post.headline}</Link>
      </h3>
      <p className="story-card__summary line-clamp-3">{post.summary}</p>
      <div className="story-card__footer">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} aria-hidden="true" /> {sourceCount} {t(sourceCount === 1 ? "card.source" : "card.sources")}</span>
        <div className="story-card__tools">
          {post.content_type === "video" && post.video_url && (
            <a href={post.video_url} target="_blank" rel="noopener noreferrer" aria-label={t("news.aria_youtube", { headline: post.headline })} className="min-touch inline-flex items-center justify-center"><Play size={14} aria-hidden="true" /></a>
          )}
          <BookmarkButton postId={post.id} />
          <ArrowUpRight size={14} className={cn("text-ink", isRead && "text-muted")} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
});
