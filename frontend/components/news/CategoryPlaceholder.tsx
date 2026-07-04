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
  const label = theme.label;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-paper ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-5xl font-black tracking-normal text-ink/[0.10] uppercase select-none">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
