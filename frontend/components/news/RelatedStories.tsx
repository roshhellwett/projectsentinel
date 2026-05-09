import Link from 'next/link';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';

interface RelatedStoriesProps {
  posts: Post[];
  currentPostId: string;
}

export function RelatedStories({ posts, currentPostId }: RelatedStoriesProps) {
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
            className="group block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <CategoryTag category={post.category} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-accent transition-colors mb-3">
              {post.headline}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {post.summary}
            </p>
            <div className="flex items-center justify-between">
              <CredibilityBadge score={post.credibility_score} />
              <span className="text-xs text-slate-400">{post.source_count} sources</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

