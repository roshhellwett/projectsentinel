/**
 * Category tag pill component
 */

import { Category } from '@/types';

interface CategoryTagProps {
  category: Category | string;
}

const CATEGORY_COLORS: Record<string, string> = {
  politics: 'bg-red-50 text-red-700 ring-red-200',
  business: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  sports: 'bg-blue-50 text-blue-700 ring-blue-200',
  crime: 'bg-orange-50 text-orange-700 ring-orange-200',
  science: 'bg-violet-50 text-violet-700 ring-violet-200',
  health: 'bg-rose-50 text-rose-700 ring-rose-200',
  tech: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  world: 'bg-amber-50 text-amber-700 ring-amber-200'
};

export function CategoryTag({ category }: CategoryTagProps) {
  const colorClass = CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 ring-slate-200';
  
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${colorClass}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
