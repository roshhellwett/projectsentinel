/**
 * Decorative gradient placeholder shown when no image is available.
 * Used in featured / hero cards. Color is derived from category.
 */

interface CategoryPlaceholderProps {
  category: string;
  className?: string;
  showLabel?: boolean;
}

const CATEGORY_GRADIENT: Record<string, string> = {
  politics: 'from-rose-500/30 via-rose-500/10 to-transparent',
  business: 'from-emerald-500/30 via-emerald-500/10 to-transparent',
  sports: 'from-sky-500/30 via-sky-500/10 to-transparent',
  crime: 'from-orange-500/30 via-orange-500/10 to-transparent',
  science: 'from-violet-500/30 via-violet-500/10 to-transparent',
  health: 'from-pink-500/30 via-pink-500/10 to-transparent',
  tech: 'from-cyan-500/30 via-cyan-500/10 to-transparent',
  world: 'from-amber-500/30 via-amber-500/10 to-transparent',
  entertainment: 'from-fuchsia-500/30 via-fuchsia-500/10 to-transparent',
  education: 'from-violet-400/30 via-violet-400/10 to-transparent',
};

export function CategoryPlaceholder({
  category,
  className = '',
  showLabel = true,
}: CategoryPlaceholderProps) {
  const gradient = CATEGORY_GRADIENT[category] || 'from-accent/30 via-accent/10 to-transparent';
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-white ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_70%_70%,rgba(10,132,255,0.12),transparent_36%)]" />
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
