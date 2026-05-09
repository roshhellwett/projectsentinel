'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { Clock, ArrowRight } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils/formatDate';

interface HeroCardProps {
  post: Post;
}

export function HeroCard({ post }: HeroCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mb-14 relative group"
    >
      {/* Animated gradient glow */}
      <div className="absolute -inset-[2px] rounded-3xl gradient-border-animated opacity-40 group-hover:opacity-70 transition-opacity duration-700 blur-sm" />
      <div className="absolute -inset-[1px] rounded-3xl gradient-border-animated opacity-20 group-hover:opacity-50 transition-opacity duration-700" />
      
      <Link
        href={`/news/${post.id}`}
        className="block relative rounded-3xl overflow-hidden shadow-card group-hover:shadow-card-hover transition-all duration-500"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-saffron-light via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 z-0" />
        
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-india-saffron/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 dark:bg-india-saffron/[0.04]" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 dark:bg-accent/[0.03]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-60 dark:opacity-20" />

        {/* Saffron accent strip at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-india-saffron via-orange-400 to-india-saffron z-10" />

        <div className="relative p-8 md:p-12 lg:p-14 flex flex-col justify-center min-h-[320px] md:min-h-[380px] z-10">
          {/* Top row: Category + Time */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3 mb-5"
          >
            <CategoryTag category={post.category} />
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {formatTimeAgo(post.published_at)}
            </span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-5 group-hover:text-india-saffron transition-colors duration-500 leading-[1.15] tracking-tight max-w-4xl"
          >
            {post.headline}
          </motion.h1>
          
          {/* Summary */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-3xl line-clamp-3 leading-relaxed font-normal mb-8"
          >
            {post.summary}
          </motion.p>
          
          {/* Bottom bar with score + sources + CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <CredibilityBadge score={post.credibility_score} />
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {post.source_count} Sources
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-india-saffron group-hover:gap-3 transition-all duration-300">
              Read Full Story
              <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
