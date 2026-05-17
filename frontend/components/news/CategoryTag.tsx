// last edited 2026-05-17 by roshhellwett

import { Category } from '@/types';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';

interface CategoryTagProps {
  category: Category | string;
  className?: string;
}

export function CategoryTag({ category, className = '' }: CategoryTagProps) {
  const theme = getCategoryTheme(category);

  return (
    <span
      className={`inline-flex items-center max-w-full text-[10px] font-bold uppercase tracking-[0.18em] text-accent ${className}`}
    >
      <span className="truncate">{theme.label}</span>
    </span>
  );
}
