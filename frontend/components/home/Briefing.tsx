"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { useI18n } from "@/lib/i18n/i18n-shared";

function BriefItem({ post, index }: { post: Post; index: number }) {
  const ago = useTimeAgo(post.published_at);
  const { t } = useI18n();
  return (
    <Link href={`/news/${post.id}`} className="briefing__item">
      <span className="briefing__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <span className="story-meta__category font-mono text-[8px] tracking-wider">{t(`nav.${post.category}`)}</span>
        <h3 className="mt-1.5 mb-2">{post.headline}</h3>
        <span className="font-mono text-[9px] text-muted" suppressHydrationWarning>{ago}</span>
      </div>
    </Link>
  );
}

export function Briefing({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <aside className="briefing" aria-label="The briefing">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-medium">The briefing</h2>
        <ArrowUpRight size={15} className="text-accent" aria-hidden="true" />
      </div>
      <p className="text-[10px] text-muted mt-1">A few more stories worth your time.</p>
      <div className="briefing__items">{posts.slice(0, 3).map((post, index) => <BriefItem key={post.id} post={post} index={index} />)}</div>
    </aside>
  );
}
