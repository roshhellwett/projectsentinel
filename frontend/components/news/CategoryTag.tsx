/**
 * Category tag pill — dark glass style with accent-tinted variants.
 * Constrained width (max-w) prevents overflow inside cards.
 */

import { Category } from '@/types';

interface CategoryTagProps {
  category: Category | string;
  className?: string;
}

const CATEGORY_TINT: Record<string, string> = {
  politics: 'bg-rose-500/12 text-rose-300 border-rose-500/25',
  business: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  sports: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  crime: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
  science: 'bg-violet-500/12 text-violet-300 border-violet-500/25',
  health: 'bg-pink-500/12 text-pink-300 border-pink-500/25',
  tech: 'bg-cyan-500/12 text-cyan-300 border-cyan-500/25',
  world: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  entertainment: 'bg-fuchsia-500/12 text-fuchsia-300 border-fuchsia-500/25',
};

export function CategoryTag({ category, className = '' }: CategoryTagProps) {
  const colorClass =
    CATEGORY_TINT[category] || 'bg-white/[0.06] text-zinc-300 border-white/[0.10]';
  const display = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={`inline-flex items-center max-w-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-full border ${colorClass} ${className}`}
    >
      <span className="truncate">{display}</span>
    </span>
  );
}
