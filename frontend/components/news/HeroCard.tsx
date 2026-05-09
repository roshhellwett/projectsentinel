'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Database, Flame } from 'lucide-react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { CategoryPlaceholder } from './CategoryPlaceholder';
import { formatTimeAgo } from '@/lib/utils/formatDate';

interface HeroCardProps {
  post: Post;
  badge?: 'breaking' | 'trending' | null;
}

export function HeroCard({ post, badge = 'trending' }: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <Link
        href={`/news/${post.id}`}
        className="block relative overflow-hidden rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_0_1px_rgba(37,99,235,0.15),0_24px_80px_-16px_rgba(37,99,235,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[320px] lg:min-h-[380px]">
          {/* Visual side */}
          <div className="relative lg:col-span-2 min-h-[180px] lg:min-h-full overflow-hidden">
            <CategoryPlaceholder category={post.category} />
            {/* Edge fade for desktop seam */}
            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[#0a0a0a] pointer-events-none"
              aria-hidden="true"
            />
            {/* Badge */}
            {badge && (
              <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.10] text-[10px] font-bold uppercase tracking-wider text-white">
                <Flame className="w-3 h-3 text-accent" />
                {badge === 'breaking' ? 'Breaking' : 'Trending'}
              </div>
            )}
          </div>

          {/* Content side */}
          <div className="relative lg:col-span-3 p-7 md:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <CategoryTag category={post.category} />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(post.published_at)}
              </span>
            </div>

            <h2 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold text-white tracking-tight leading-[1.15] mb-5">
              {post.headline}
            </h2>

            <p className="text-base text-zinc-400 leading-relaxed line-clamp-3 max-w-2xl mb-7">
              {post.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                <CredibilityBadge score={post.credibility_score} compact />
                <div className="h-3.5 w-px bg-white/10" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                  <Database className="w-3 h-3" />
                  {post.source_count} sources
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent group-hover:gap-2.5 transition-all duration-300">
                Read full story
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
