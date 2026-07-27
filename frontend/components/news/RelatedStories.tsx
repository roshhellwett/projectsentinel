import Link from "next/link";
import { Post } from "@/types";
import { CategoryTag } from "./CategoryTag";
import { CredibilityBadge } from "./CredibilityBadge";

interface RelatedStoriesProps {
  posts: Post[];
  currentPostId: string;
}

export function RelatedStories({ posts, currentPostId }: RelatedStoriesProps) {
  if (!posts || posts.length === 0) return null;

  const related = posts
    .filter((p) => p.id !== currentPostId)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-fluid-sm">
        {related.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.id}/`}
            className="np-card group flex flex-col h-full p-fluid-sm min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors duration-base"
          >
            <div className="relative z-10 flex items-center gap-2 mb-2 sm:mb-3">
              <CategoryTag category={post.category} />
            </div>
            <h3 className="font-display relative z-10 text-fluid-sm font-bold text-ink tracking-[-0.01em] line-clamp-2 group-hover:text-accent transition-colors duration-base mb-fluid-2xs sm:mb-fluid-xs leading-snug">
              {post.headline}
            </h3>
            <p className="relative z-10 text-fluid-xs text-muted line-clamp-2 mb-fluid-xs sm:mb-fluid-sm mt-auto leading-relaxed">
              {post.summary}
            </p>
            <div className="relative z-10 flex items-center justify-between gap-fluid-2xs pt-2.5 sm:pt-3 border-t border-rule">
              <CredibilityBadge score={post.credibility_score} compact />
              <span className="text-fluid-2xs text-muted shrink-0">
                {post.source_count} sources
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
