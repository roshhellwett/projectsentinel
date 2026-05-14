/**
 * Decorative gradient placeholder shown when no image is available.
 * Used in featured / hero cards. Color is derived from category via the
 * unified theme so the hero card, badge, and trending bar all use the
 * same family of hues for a given category.
 */

import { getCategoryTheme } from '@/lib/theme/categoryTheme';

interface CategoryPlaceholderProps {
  category: string;
  className?: string;
  showLabel?: boolean;
}

export function CategoryPlaceholder({
  category,
  className = '',
  showLabel = true,
}: CategoryPlaceholderProps) {
  const theme = getCategoryTheme(category);
  const gradient = theme.gradient;
  const label = theme.label;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-white ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_70%_70%,rgba(139,127,240,0.12),transparent_36%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950/[0.10] uppercase select-none">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
