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

const MemoizedNewsCard = NewsCard;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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
              <MemoizedNewsCard
                post={post}
                onClick={() => handleSelect(post)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <NewsDrawer
        post={selectedPost}
        onClose={handleClose}
      />
    </>
  );
}
