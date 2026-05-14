/**
 * Category tag pill — consumes the unified theme from `lib/theme/categoryTheme`.
 * Constrained width (max-w) prevents overflow inside cards.
 */

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
      className={`inline-flex items-center max-w-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase rounded-full border ${className}`}
      style={theme.pill}
    >
      <span className="truncate">{theme.label}</span>
    </span>
  );
}
