'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { HeroCard } from '@/components/news/HeroCard';
import { TrendingSection } from '@/components/news/TrendingSection';
import { InfiniteFeed } from '@/components/news/InfiniteFeed';
import { Post } from '@/types';

interface HomeClientProps {
  heroPost: Post | null;
  allPosts: Post[];
  feedPosts: Post[];
  totalCount: number;
  trendingIds: Set<string>;
}

export function HomeClient({ heroPost, allPosts, feedPosts, totalCount, trendingIds }: HomeClientProps) {
  const excludeIds = new Set<string>();
  if (heroPost) excludeIds.add(heroPost.id);
  for (const id of trendingIds) excludeIds.add(id);

  return (
      <div className="min-h-screen bg-[#fafafa] relative">
        <div className="relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-24 lg:pt-28 pb-32">
            {/* Category Bar */}
            <div className="mb-12">
              <CategoryBar />
            </div>

            {/* Featured Story */}
            {heroPost && (
              <div className="mb-24">
                <HeroCard post={heroPost} />
              </div>
            )}

            {/* Trending Section */}
            {allPosts.length > 0 && (
              <div className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                  <motion.div
                    className="w-1 h-8 rounded-full bg-gradient-to-b from-orange-500 to-red-500"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-[-0.02em]">
                    Trending Now
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />
                </div>
                <TrendingSection posts={allPosts} />
              </div>
            )}

            {/* Latest News */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <motion.div
                  className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-[-0.02em]">
                  Latest News
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-200 to-transparent" />
              </div>

              <InfiniteFeed
                initialPosts={feedPosts}
                initialCount={totalCount}
                excludeIds={excludeIds}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
