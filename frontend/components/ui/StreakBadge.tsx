'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakBadge({
  streak,
  size = 'md',
  showLabel = true,
  className,
}: StreakBadgeProps) {
  if (streak <= 0) return null;

  let tierName = 'Warmup';
  let tierColor = 'text-streak';
  let bgColor = 'bg-streak/10 border-streak/20';
  let shadowGlow = 'shadow-[0_0_12px_rgb(245,158,11/0.25)]';
  let Icon = Flame;

  if (streak >= 30) {
    tierName = 'Legendary';
    tierColor = 'text-purple-400 dark:text-purple-300';
    bgColor = 'bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border-purple-500/40';
    shadowGlow = 'shadow-[0_0_24px_rgb(168,85,247/0.3)]';
    Icon = Trophy;
  } else if (streak >= 14) {
    tierName = 'Epic';
    tierColor = 'text-pink-500 dark:text-pink-400';
    bgColor = 'bg-pink-500/15 border-pink-500/30';
    shadowGlow = 'shadow-[0_0_18px_rgb(236,72,153/0.3)]';
    Icon = Award;
  } else if (streak >= 7) {
    tierName = 'On Fire';
    tierColor = 'text-orange-500 dark:text-orange-400';
    bgColor = 'bg-orange-500/15 border-orange-500/30';
    shadowGlow = 'shadow-[0_0_15px_rgb(249,115,22/0.3)]';
    Icon = Sparkles;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-extrabold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center rounded-full border font-bold uppercase tracking-wider transition-all duration-300 select-none cursor-pointer',
        bgColor,
        tierColor,
        shadowGlow,
        sizeClasses,
        className,
      )}
      title={`${streak} Day Streak (${tierName} Tier)`}
    >
      <Icon className={iconSizes} strokeWidth={2.5} />
      <span className="tabular-nums font-extrabold">{streak}</span>
      {showLabel && <span>{streak === 1 ? 'Day' : 'Days'}</span>}
    </motion.div>
  );
}
