import Link from 'next/link';
import { Post } from '@/types';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { CredibilityBadge } from './CredibilityBadge';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  if (!posts || posts.length === 0) return null;

  const trending = posts.sort((a, b) => b.credibility_score - a.credibility_score).slice(0, 5);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-india-saffron to-accent text-white">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Trending Stories</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {trending.map((post, index) => (
          <Link
            key={post.id}
            href={`/news/${post.id}`}
            className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-accent/30 transition-all overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-4xl font-bold text-slate-100 select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="relative z-10">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 block">
                #{index + 1} Trending
              </span>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-accent transition-colors mb-3 leading-snug">
                {post.headline}
              </h3>
              <div className="flex items-center justify-between">
                <CredibilityBadge score={post.credibility_score} />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
