/**
 * Category tag pill with accent-tinted variants.
 * Constrained width (max-w) prevents overflow inside cards.
 */

import { Category } from '@/types';

interface CategoryTagProps {
  category: Category | string;
  className?: string;
}

const CATEGORY_TINT: Record<string, string> = {
  politics: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  business: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  sports: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  crime: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  science: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  health: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  tech: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  world: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  entertainment: 'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20',
};

export function CategoryTag({ category, className = '' }: CategoryTagProps) {
  const colorClass =
    CATEGORY_TINT[category] || 'bg-slate-950/[0.05] text-slate-700 border-slate-950/[0.10]';
  const display = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={`inline-flex items-center max-w-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-full border ${colorClass} ${className}`}
    >
      <span className="truncate">{display}</span>
    </span>
  );
}
