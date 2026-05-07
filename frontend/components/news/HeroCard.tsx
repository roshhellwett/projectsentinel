'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';

interface HeroCardProps {
  post: Post;
}

export function HeroCard({ post }: HeroCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mb-12 relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-india-saffron/30 via-accent/20 to-india-green/30 rounded-2xl blur opacity-30"></div>
      <Link
        href={`/news/${post.id}`}
        className="block relative min-h-[300px] md:min-h-[340px] rounded-2xl overflow-hidden group shadow-xl bg-surface flex flex-col justify-center border border-slate-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwZjE3MmEiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] z-0 opacity-50" />

        <div className="relative p-6 md:p-10 flex flex-col justify-center z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <CategoryTag category={post.category} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 group-hover:text-accent transition-colors duration-300 leading-tight tracking-tight mt-4 max-w-4xl"
          >
            {post.headline}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base md:text-lg text-slate-600 max-w-3xl line-clamp-3 leading-relaxed font-normal"
          >
            {post.summary}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 flex items-center gap-6 text-sm text-slate-600 bg-white/60 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-slate-200 shadow-sm"
          >
            <CredibilityBadge score={post.credibility_score} />
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="flex items-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {post.source_count} Sources Verified
            </span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
