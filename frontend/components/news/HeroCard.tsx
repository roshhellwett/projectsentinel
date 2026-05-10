'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Post } from '@/types';
import { formatTimeAgo, formatDate } from '@/lib/utils/formatDate';

interface HeroCardProps {
  post: Post;
}

const heroGradients: Record<string, string> = {
  politics: 'from-indigo-600 via-purple-600 to-violet-800',
  business: 'from-blue-700 via-cyan-600 to-teal-700',
  sports: 'from-blue-600 via-cyan-500 to-green-500',
  tech: 'from-gray-800 via-slate-700 to-blue-800',
  entertainment: 'from-pink-600 via-rose-500 to-orange-500',
  education: 'from-amber-600 via-yellow-500 to-orange-600',
  health: 'from-emerald-600 via-green-500 to-teal-600',
  world: 'from-violet-700 via-indigo-600 to-blue-700',
};

function HeroGradient({ category }: { category: string }) {
  const gradient = heroGradients[category] || 'from-purple-700 via-blue-600 to-indigo-800';
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.15),transparent_50%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8rem] md:text-[10rem] font-black text-white/10 select-none leading-none">
          IV
        </span>
      </div>
    </div>
  );
}

export function HeroCard({ post }: HeroCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
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
      className="group relative overflow-hidden rounded-[32px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_30px_80px_-15px_rgba(0,0,0,0.15)] transition-shadow duration-700"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Glass reflection */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.15 : 0,
          x: isHovered ? 100 : -100,
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
      />

      <div className="relative flex flex-col md:flex-row" style={{ transform: "translateZ(20px)" }}>
        {/* Left half — content */}
        <div className="flex-1 p-8 md:p-12 lg:p-16">
          {/* Category and Credibility */}
          <div className="flex items-center gap-4 mb-8">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold tracking-wide shadow-lg shadow-blue-500/30"
            >
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </motion.span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/60 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{post.credibility_score}% Verified</span>
            </motion.div>
          </div>

          {/* Title and Excerpt */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-[-0.02em]">
              {post.headline}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
              {post.summary}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-base text-slate-500 font-medium">
              <Clock className="w-5 h-5" />
              <span>{Math.max(1, Math.ceil((post.summary || '').split(' ').filter(Boolean).length / 200))} min read</span>
              <span className="text-slate-300 mx-1">·</span>
              <span title={formatDate(post.published_at)}>{formatTimeAgo(post.published_at)}</span>
            </div>

            <Link href={`/news/${post.id}`}>
              <motion.span
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-[0_4px_24px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.4)]"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </div>
        </div>

        {/* Right half — category gradient fallback */}
        <div className="relative w-full md:w-[280px] lg:w-[360px] min-h-[200px] md:min-h-full overflow-hidden rounded-b-[32px] md:rounded-r-[32px] md:rounded-bl-none">
          <HeroGradient category={post.category} />
        </div>
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[0] rounded-[32px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-xl" />
      </div>
    </motion.article>
  );
}
