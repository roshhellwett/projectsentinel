"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import type { Post } from "@/types";
import { useTimeAgo } from "@/lib/hooks/useTimeAgo";
import { useI18n } from "@/lib/i18n/i18n-shared";

function BusinessStory({ post, index }: { post: Post; index: number }) {
  const { t } = useI18n();
  const timeAgo = useTimeAgo(post.published_at);
  const sourceCount = post.source_count ?? post.sources?.length ?? 0;

  return (
    <Link href={`/news/${post.id}`} className="business-brief__story">
      <span className="business-brief__story-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="business-brief__story-copy">
        <span className="business-brief__story-meta" suppressHydrationWarning>
          {timeAgo} <span aria-hidden="true">·</span> {sourceCount} {t(sourceCount === 1 ? "card.source" : "card.sources")}
        </span>
        <h3>{post.headline}</h3>
        <p>{post.summary}</p>
        <span className="business-brief__story-proof">
          <ShieldCheck size={13} aria-hidden="true" />
          {post.credibility_score}% {t("business.verified_for_decisions")}
        </span>
      </div>
      <ArrowUpRight size={16} aria-hidden="true" className="business-brief__story-arrow" />
    </Link>
  );
}

export function BusinessBrief({ posts }: { posts: Post[] }) {
  const { t } = useI18n();
  const businessStories = posts.filter((post) => post.category === "business").slice(0, 4);

  return (
    <section className="business-brief" aria-labelledby="business-brief-title">
      <div className="business-brief__header">
        <div className="business-brief__heading">
          <span className="business-brief__icon" aria-hidden="true">
            <BriefcaseBusiness size={19} strokeWidth={1.7} />
          </span>
          <div>
            <span className="business-brief__eyebrow">02 / Zenith business desk</span>
            <h2 id="business-brief-title">{t("business.title")}</h2>
            <p>{t("business.description")}</p>
          </div>
        </div>
        <Link href="/category/business" className="business-brief__link">
          {t("business.open_desk")} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {businessStories.length > 0 ? (
        <div className="business-brief__stories">
          {businessStories.map((post, index) => <BusinessStory key={post.id} post={post} index={index} />)}
        </div>
      ) : (
        <div className="business-brief__empty">
          <span className="business-brief__empty-label">{t("business.next_signal")}</span>
          <p>{t("business.empty")}</p>
          <Link href="/category/business" className="editorial-link">
            {t("business.browse_archive")} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
