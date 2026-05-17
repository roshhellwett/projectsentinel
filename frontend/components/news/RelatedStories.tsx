// last edited 2026-05-17 by roshhellwett

import Link from 'next/link';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';

interface RelatedStoriesProps {
  posts: Post[];
  currentPostId: string;
}

export function RelatedStories({ posts, currentPostId }: RelatedStoriesProps) {
  if (!posts || posts.length === 0) return null;

  const related = posts
    .filter((p) => p.id !== currentPostId)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.id}/`}
            className="touch-polish premium-card premium-card-hover group flex flex-col h-full rounded-2xl p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <CategoryTag category={post.category} />
            </div>
            <h3 className="relative z-10 text-[14px] font-semibold text-slate-950 tracking-normal line-clamp-2 group-hover:text-accent transition-colors mb-3 leading-snug">
              {post.headline}
            </h3>
            <p className="relative z-10 text-xs text-slate-600 line-clamp-2 mb-4 mt-auto">
              {post.summary}
            </p>
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-950/[0.08]">
              <CredibilityBadge score={post.credibility_score} compact />
              <span className="text-[10px] text-slate-500">{post.source_count} sources</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

