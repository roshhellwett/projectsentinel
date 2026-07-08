'use client';

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
  let shadowGlow = 'shadow-[0_0_12px_rgba(245,158,11,0.25)]';
  let Icon = Flame;

  if (streak >= 30) {
    tierName = 'Legendary';
    tierColor = 'text-purple-400';
    bgColor = 'bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border-purple-500/40';
    shadowGlow = 'shadow-[0_0_24px_rgba(168,85,247,0.3)]';
    Icon = Trophy;
  } else if (streak >= 14) {
    tierName = 'Epic';
    tierColor = 'text-pink-500';
    bgColor = 'bg-pink-500/15 border-pink-500/30';
    shadowGlow = 'shadow-[0_0_18px_rgba(236,72,153,0.3)]';
    Icon = Award;
  } else if (streak >= 7) {
    tierName = 'On Fire';
    tierColor = 'text-orange-500';
    bgColor = 'bg-orange-500/15 border-orange-500/30';
    shadowGlow = 'shadow-[0_0_15px_rgba(249,115,22,0.3)]';
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
    <div
      className={cn(
        'animate-scale-in inline-flex items-center rounded-full border font-bold uppercase tracking-wider transition-all duration-300 select-none cursor-pointer',
        'hover:scale-105 active:scale-95',
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
    </div>
  );
}
