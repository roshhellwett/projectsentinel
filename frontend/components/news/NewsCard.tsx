'use client';

import { useState, useRef, memo } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, Bookmark, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Post } from '@/types';
import { formatTimeAgo, formatDate } from '@/lib/utils/formatDate';

interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
}

const categoryColors: Record<string, { gradient: string; light: string; border: string }> = {
  politics: { gradient: 'from-purple-600 to-pink-600', light: 'bg-purple-50/80', border: 'border-purple-200/60' },
  business: { gradient: 'from-blue-600 to-cyan-600', light: 'bg-blue-50/80', border: 'border-blue-200/60' },
  sports: { gradient: 'from-orange-600 to-red-600', light: 'bg-orange-50/80', border: 'border-orange-200/60' },
  tech: { gradient: 'from-green-600 to-emerald-600', light: 'bg-green-50/80', border: 'border-green-200/60' },
  entertainment: { gradient: 'from-pink-600 to-rose-600', light: 'bg-pink-50/80', border: 'border-pink-200/60' },
  education: { gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50/80', border: 'border-amber-200/60' },
  health: { gradient: 'from-emerald-600 to-teal-600', light: 'bg-emerald-50/80', border: 'border-emerald-200/60' },
  world: { gradient: 'from-indigo-600 to-violet-600', light: 'bg-indigo-50/80', border: 'border-indigo-200/60' },
  crime: { gradient: 'from-red-600 to-rose-600', light: 'bg-red-50/80', border: 'border-red-200/60' },
  science: { gradient: 'from-violet-600 to-purple-600', light: 'bg-violet-50/80', border: 'border-violet-200/60' },
};

const NewsCardComponent = ({ post, isNew = false }: NewsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = categoryColors[post.category] || { gradient: 'from-slate-600 to-slate-700', light: 'bg-slate-50/80', border: 'border-slate-200/60' };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
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
    <Link href={`/news/${post.id}`} className="block h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{
          scale: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }
        }}
        className={`group relative overflow-hidden rounded-[24px] bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-500 h-full cursor-pointer ${isNew ? 'flash-new-post' : ''}`}
      >
        {/* Gradient mesh on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${colors.gradient} opacity-[0.07] rounded-full blur-3xl`} />
        </div>

        {/* Shimmer effect */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.2 : 0,
            x: isHovered ? 60 : -60,
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
        />

        <div className="relative p-7 flex flex-col h-full" style={{ transform: "translateZ(12px)" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3.5 py-1.5 rounded-full ${colors.light} backdrop-blur-xl border ${colors.border} text-xs font-bold tracking-wide shadow-sm`}
            >
              <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
            </motion.span>

            <motion.button
              whileHover={{ scale: 1.15, rotate: 12 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isBookmarked) {
                  setIsBookmarked(false);
                  toast('Bookmark removed');
                } else {
                  setIsBookmarked(true);
                  toast.success('Article bookmarked!');
                }
              }}
              className={`p-2 rounded-full backdrop-blur-xl border transition-colors shadow-sm ${
                isBookmarked
                  ? 'bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100'
                  : 'bg-slate-50/80 border-slate-200/60 hover:bg-white'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600 text-emerald-600' : 'text-slate-600'}`} />
            </motion.button>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug line-clamp-3 flex-grow group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:via-blue-600 group-hover:to-slate-900 group-hover:bg-clip-text transition-all duration-500 tracking-[-0.01em]">
            {post.headline}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed font-light">
            {post.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100/80 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.max(1, Math.ceil((post.summary || '').split(' ').filter(Boolean).length / 200))} min read</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="text-xs text-slate-500 font-medium" title={formatDate(post.published_at)}>
                <span>{formatTimeAgo(post.published_at)}</span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/60 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{post.credibility_score}%</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.gradient} origin-left`}
        />

        {/* Border highlight */}
        <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute inset-[-1px] rounded-[24px] bg-gradient-to-r ${colors.gradient} opacity-20 blur-sm`} />
        </div>
      </motion.div>
    </Link>
  );
};

export const NewsCard = memo(NewsCardComponent);
