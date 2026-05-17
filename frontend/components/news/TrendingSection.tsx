'use client';

// last edited 2026-05-17 by roshhellwett

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { CredibilityBar } from './CredibilityBar';
import { CategoryTag } from './CategoryTag';
import { useReadPosts } from '@/lib/utils/readPosts';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {



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




  const { isRead } = useReadPosts();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-12">
      <h2 className="section-rule mb-7">
        <span className="inline-flex items-center gap-2">
          <Flame className="w-4 h-4 text-accent" strokeWidth={2.2} aria-hidden="true" />
          Trending Now
        </span>
        <span className="ml-auto editorial-kicker text-[10px]">
          <span className="muted">Top {trending.length} by credibility</span>
        </span>
      </h2>

      <ol className="relative bg-paper border border-rule rounded-md overflow-hidden">
        {trending.map((post, index) => {
          const read = hydrated && isRead(post.id);
          const rank = index + 1;
          const isTop = rank === 1;
          return (
            <motion.li
              key={post.id}
              initial={{ x: -8 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`relative border-b last:border-b-0 border-rule ${isTop ? 'trending-top-shimmer overflow-hidden' : ''}`}
            >
              <Link
                href={`/news/${post.id}/`}
                data-read={read ? 'true' : 'false'}
                className={`group relative z-10 flex items-center gap-4 px-5 py-4 sm:py-5 transition-colors duration-200 hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${read ? 'opacity-60' : ''}`}
                aria-label={read ? `${post.headline} (already read)` : post.headline}
              >
                <div className="flex-shrink-0 w-9 sm:w-10 flex items-center justify-center">
                  <span
                    className={`font-display tabular-nums leading-none transition-colors duration-200 ${
                      isTop
                        ? 'text-[34px] sm:text-[40px] font-bold text-accent'
                        : 'text-[26px] sm:text-[30px] font-bold text-rule-strong group-hover:text-ink'
                    }`}
                    aria-hidden="true"
                  >
                    {String(rank).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-display text-[15px] sm:text-[16px] leading-[1.28] line-clamp-2 transition-colors duration-200 group-hover:text-accent ${
                    isTop ? 'font-bold text-ink' : 'font-semibold text-ink'
                  }`}>
                    {post.headline}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <CategoryTag category={post.category} />
                    {read && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-cred-high"
                        title="You have read this story"
                      >
                        <Check className="w-2.5 h-2.5" strokeWidth={2.4} />
                        Read
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden min-[360px]:flex flex-shrink-0 w-24 sm:w-28 items-center">
                  <CredibilityBar score={post.credibility_score} compact />
                </div>

                <ChevronRight className="w-4 h-4 text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
