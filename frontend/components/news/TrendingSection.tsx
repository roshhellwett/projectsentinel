'use client';

import Link from 'next/link';
import { Post } from '@/types';
import { TrendingUp, ChevronRight, Flame } from 'lucide-react';
import { CredibilityBadge } from './CredibilityBadge';
import { motion } from 'framer-motion';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  if (!posts || posts.length === 0) return null;

  const now = Date.now();
  const trending = [...posts]
    .map((post) => {
      const ageHours = (now - new Date(post.published_at).getTime()) / 3_600_000;
      const freshness = Math.max(0, 1 - ageHours / 12);
      return { post, trendScore: post.credibility_score * 0.6 + freshness * 40 };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 5)
    .map(({ post }) => post);

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-india-saffron via-orange-500 to-accent text-white shadow-lg shadow-india-saffron/25">
          <TrendingUp className="w-5 h-5" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-india-saffron to-accent opacity-0 animate-pulse-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending Now</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Top verified stories by credibility</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-india-saffron/30 via-slate-200 to-transparent ml-4 dark:from-india-saffron/20 dark:via-slate-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {trending.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/news/${post.id}`}
              className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-xl hover:shadow-india-saffron/10 hover:border-india-saffron/40 dark:hover:border-india-saffron/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-india-saffron/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="absolute -top-1 -right-1 text-5xl font-black text-slate-100/80 dark:text-slate-800/50 select-none leading-none">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <Flame className="w-3.5 h-3.5 text-india-saffron" />
                  <span className="text-[11px] font-bold text-india-saffron uppercase tracking-widest">
                    #{index + 1} Trending
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-india-saffron transition-colors duration-300 mb-auto leading-snug">
                  {post.headline}
                </h3>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <CredibilityBadge score={post.credibility_score} />
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-india-saffron group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
