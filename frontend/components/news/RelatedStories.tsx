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
            href={`/news/${post.id}`}
            className="group flex flex-col h-full bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 hover:bg-white/[0.06] hover:border-accent/30 hover:shadow-glow-accent transition-[background-color,border-color,box-shadow] duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <CategoryTag category={post.category} />
            </div>
            <h3 className="text-[14px] font-semibold text-white tracking-tight line-clamp-2 group-hover:text-accent transition-colors mb-3 leading-snug">
              {post.headline}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-2 mb-4 mt-auto">
              {post.summary}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <CredibilityBadge score={post.credibility_score} compact />
              <span className="text-[10px] text-zinc-500">{post.source_count} sources</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

