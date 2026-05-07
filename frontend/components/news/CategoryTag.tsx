/**
 * Category tag pill component
 */

import { Category } from '@/types';

interface CategoryTagProps {
  category: Category | string;
}

const CATEGORY_COLORS: Record<string, string> = {
  politics: 'bg-red-500/20 text-red-400',
  business: 'bg-green-500/20 text-green-400',
  sports: 'bg-blue-500/20 text-blue-400',
  crime: 'bg-orange-500/20 text-orange-400',
  science: 'bg-purple-500/20 text-purple-400',
  health: 'bg-pink-500/20 text-pink-400',
  tech: 'bg-cyan-500/20 text-cyan-400',
  world: 'bg-yellow-500/20 text-yellow-400'
};

export function CategoryTag({ category }: CategoryTagProps) {
  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-500/20 text-gray-400';
  
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
