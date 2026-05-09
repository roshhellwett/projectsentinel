/**
 * Responsive grid of news cards with drawer functionality
 * Optimized: React.memo, stale selection reset, smooth animations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsGridProps {
  posts: Post[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export function NewsGrid({ posts }: NewsGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (selectedPost && !posts.find(p => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [posts, selectedPost]);

  const handleSelect = useCallback((post: Post) => {
    setSelectedPost(post);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPost(null);
  }, []);

  return (
    <>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No verified news found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We couldn&apos;t find any articles matching your criteria. Try selecting a different category or checking back later.
          </p>
        </div>
      ) : (
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={item}
              layout
            >
              <NewsCard
                post={post}
                onClick={() => handleSelect(post)}
              />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <NewsDrawer
        post={selectedPost}
        onClose={handleClose}
      />
    </>
  );
}
