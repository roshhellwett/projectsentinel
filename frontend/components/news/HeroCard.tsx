"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { getHostname } from "@/lib/utils/getHostname";
import { VerificationStamp } from "@/components/ui/VerificationStamp";
import { BookmarkButton } from "./BookmarkButton";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";
import { useI18n } from "@/lib/i18n/context";

interface HeroCardProps { post: Post; badge?: "breaking" | "trending" | null }

export const HeroCard = memo(function HeroCard({ post, badge = "trending" }: HeroCardProps) {
  const { t } = useI18n();
  const haptic = useHapticFeedback();
  const timeAgo = useTimeAgo(post.published_at);
  const sourceCount = post.source_count ?? post.sources?.length ?? 0;
  const host = post.sources?.[0] ? getHostname(post.sources[0].url) : "";
  return (
    <article className="lead-story" role="article" aria-label={`Featured article: ${post.headline}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="story-meta">
          <Link href={`/category/${post.category}`} className="story-meta__category">{t(`nav.${post.category}`)}</Link>
          <span aria-hidden="true">/</span>
          <span suppressHydrationWarning>{timeAgo}</span>
          {badge === "breaking" && <span className="text-accent">{t("hero.breaking")}</span>}
        </div>
        <VerificationStamp score={post.credibility_score} compact />
      </div>
      <Link href={`/news/${post.id}`} onClick={() => haptic.medium()} className="group">
        <h2 className="transition-colors duration-300 group-hover:text-accent">{post.headline}</h2>
      </Link>
      <p className="lead-story__summary">{post.summary}</p>
      {post.credibility_reason && (
        <div className="lead-story__evidence">
          <ShieldCheck size={20} className="text-stamp mt-0.5" aria-hidden="true" />
          <div>
            <span className="editorial-kicker !text-stamp mb-1">Behind the headline</span>
            <p className="line-clamp-3">{post.credibility_reason}</p>
          </div>
        </div>
      )}
      <div className="lead-story__footer">
        <Link href={`/news/${post.id}`} className="editorial-link">Read the full perspective <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <div className="flex items-center gap-5">
          <span className="text-[10px] text-muted">{sourceCount} {t(sourceCount === 1 ? "card.source" : "card.sources")}{host && <span className="hidden sm:inline"> · {host}</span>}</span>
          <BookmarkButton postId={post.id} />
        </div>
      </div>
    </article>
  );
});
