'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, CheckCircle2, TrendingUp, Flame } from 'lucide-react';
import { Post } from '@/types';
import { formatTimeAgo, formatDate } from '@/lib/utils/formatDate';

interface TrendingSectionProps {
  posts: Post[];
}

const categoryColors: Record<string, { gradient: string; light: string; glow: string }> = {
  politics: { gradient: 'from-purple-500 via-purple-600 to-pink-600', light: 'bg-purple-50/80', glow: 'shadow-purple-500/30' },
  business: { gradient: 'from-blue-500 via-blue-600 to-cyan-600', light: 'bg-blue-50/80', glow: 'shadow-blue-500/30' },
  sports: { gradient: 'from-orange-500 via-orange-600 to-red-600', light: 'bg-orange-50/80', glow: 'shadow-orange-500/30' },
  tech: { gradient: 'from-green-500 via-green-600 to-emerald-600', light: 'bg-green-50/80', glow: 'shadow-green-500/30' },
  entertainment: { gradient: 'from-pink-500 via-pink-600 to-rose-600', light: 'bg-pink-50/80', glow: 'shadow-pink-500/30' },
  education: { gradient: 'from-yellow-500 via-amber-500 to-orange-500', light: 'bg-amber-50/80', glow: 'shadow-amber-500/30' },
  health: { gradient: 'from-emerald-500 via-emerald-600 to-teal-600', light: 'bg-emerald-50/80', glow: 'shadow-emerald-500/30' },
  world: { gradient: 'from-indigo-500 via-indigo-600 to-violet-600', light: 'bg-indigo-50/80', glow: 'shadow-indigo-500/30' },
  crime: { gradient: 'from-red-500 via-red-600 to-rose-600', light: 'bg-red-50/80', glow: 'shadow-red-500/30' },
  science: { gradient: 'from-violet-500 via-violet-600 to-purple-600', light: 'bg-violet-50/80', glow: 'shadow-violet-500/30' },
};

function TrendingCard({ post, index }: { post: Post; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = categoryColors[post.category] || { gradient: 'from-slate-500 to-slate-600', light: 'bg-slate-50/80', glow: 'shadow-slate-500/30' };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 400,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / (rect.width / 2));
    mouseY.set((e.clientY - centerY) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <Link href={`/news/${post.id}`}>
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{
          scale: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
          y: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }
        }}
        className="group relative overflow-hidden rounded-[20px] bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_16px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_16px_32px_-6px_rgba(0,0,0,0.12)] transition-shadow duration-500 cursor-pointer h-full"
      >
        {/* Rank badge with 3D effect */}
        <div className="absolute -top-3 -left-3 z-10" style={{ transform: "translateZ(30px)" }}>
          <motion.div
            animate={{
              scale: isHovered ? 1.15 : 1,
              rotate: isHovered ? 5 : 0
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
          >
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${colors.gradient} ${colors.glow} shadow-xl flex items-center justify-center`}>
              <span className="text-white text-sm font-black">{index + 1}</span>
            </div>
            {index === 0 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1 -right-1"
              >
                <Flame className="w-5 h-5 text-orange-500 drop-shadow-lg" fill="currentColor" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Trending indicator */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-4 z-10"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/40">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-[0.06]`} />
        </div>

        {/* Shimmer */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.25 : 0,
            x: isHovered ? 80 : -80,
          }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
        />

        <div className="relative p-6 pt-8" style={{ transform: "translateZ(16px)" }}>
          {/* Category */}
          <div className="mb-4">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-block px-3 py-1.5 rounded-full ${colors.light} backdrop-blur-xl border border-slate-200/60 text-xs font-bold tracking-wide shadow-sm`}
            >
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
            </motion.span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 mb-5 leading-snug line-clamp-3 min-h-[4rem] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:via-amber-500 group-hover:to-orange-600 group-hover:bg-clip-text transition-all duration-500 tracking-[-0.01em]">
            {post.headline}
          </h3>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.max(1, Math.ceil((post.summary || '').split(' ').filter(Boolean).length / 200))} min read</span>
              <span className="text-slate-300 mx-0.5">·</span>
              <span title={formatDate(post.published_at)}>{formatTimeAgo(post.published_at)}</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/60 shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{post.credibility_score}%</span>
            </motion.div>
          </div>
        </div>

        {/* Animated bottom accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.gradient} origin-left`}
        />

        {/* Border glow */}
        <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute inset-[-1px] rounded-[20px] bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 blur-sm`} />
        </div>
      </motion.article>
    </Link>
  );
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="relative">
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trending.map((post, index) => (
          <div key={post.id} className="min-w-[300px] md:min-w-[320px] lg:min-w-[340px] snap-start flex-shrink-0">
            <TrendingCard post={post} index={index} />
          </div>
        ))}
      </div>
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-gray-900 text-white w-10 h-10 items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Scroll left"
        >
          ‹
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-gray-900 text-white w-10 h-10 items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Scroll right"
        >
          ›
        </button>
      )}
    </section>
  );
}
