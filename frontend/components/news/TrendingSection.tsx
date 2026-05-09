'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { CredibilityBadge } from './CredibilityBadge';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const seen = new Set<string>();
    const unique = posts.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    const now = Date.now();
    return [...unique]
      .map((post) => {
        const ageHours = (now - new Date(post.published_at).getTime()) / 3_600_000;
        const freshness = Math.max(0, 1 - ageHours / 12);
        return { post, score: post.credibility_score * 0.6 + freshness * 40 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ post }) => post);
  }, [posts]);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/30">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Trending Now</h2>
          <p className="text-[11px] text-zinc-500">Top stories by credibility</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-3" />
      </div>

      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
        {trending.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Link
              href={`/news/${post.id}`}
              className="group flex items-center gap-4 px-4 sm:px-5 py-4 border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.04] transition-colors duration-200"
            >
              {/* Rank number */}
              <span
                className="text-[28px] sm:text-[34px] font-black tracking-tighter text-zinc-700 group-hover:text-accent transition-colors duration-200 leading-none w-10 sm:w-12 flex-shrink-0 tabular-nums"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-200">
                  {post.headline}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 capitalize">{post.category}</p>
              </div>

              <div className="hidden sm:block flex-shrink-0">
                <CredibilityBadge score={post.credibility_score} compact />
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
