'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { CredibilityBadge } from './CredibilityBadge';
import { CategoryTag } from './CategoryTag';

const CATEGORY_COLOR: Record<string, string> = {
  politics: '#f43f5e',
  business: '#10b981',
  sports: '#0ea5e9',
  crime: '#f97316',
  science: '#8b5cf6',
  health: '#ec4899',
  tech: '#06b6d4',
  world: '#f59e0b',
  entertainment: '#d946ef',
  education: '#a78bfa',
};

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  // Trending is now resolved server-side and passed in already in the
  // correct order. We only dedupe + cap defensively so this component
  // remains safe if a caller passes a raw list.
  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const seen = new Set<string>();
    const out: Post[] = [];
    for (const p of posts) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
      if (out.length === 5) break;
    }
    return out;
  }, [posts]);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/30">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950 tracking-tight">Trending Now</h2>
          <p className="text-[11px] text-slate-500">Top stories by credibility</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-950/10 to-transparent ml-3" />
      </div>

      <div className="premium-card rounded-[1.6rem] overflow-hidden">
        {trending.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Link
              href={`/news/${post.id}/`}
              className="touch-polish group relative z-10 flex items-center border-b border-slate-950/[0.07] last:border-b-0 hover:bg-slate-950/[0.035] active:bg-slate-950/[0.05] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-inset"
            >
              {/* Category colour left bar */}
              <div
                className="w-[3px] self-stretch flex-shrink-0 opacity-60"
                style={{ backgroundColor: CATEGORY_COLOR[post.category] ?? '#0a84ff' }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-4 flex-1 min-w-0 px-4 sm:px-5 py-4">
                {/* Rank number */}
                <span
                  className="text-[28px] sm:text-[32px] font-black tracking-tighter text-slate-300 group-hover:text-accent transition-colors duration-200 leading-none w-10 sm:w-12 flex-shrink-0 tabular-nums"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-200">
                    {post.headline}
                  </p>
                  <div className="mt-1.5"><CategoryTag category={post.category} /></div>
                </div>

                <div className="flex-shrink-0">
                  <CredibilityBadge score={post.credibility_score} compact />
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
