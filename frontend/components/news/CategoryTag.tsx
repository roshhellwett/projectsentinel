import { Category } from "@/types";
import { getCategoryTheme } from "@/lib/theme/categoryTheme";

interface CategoryTagProps {
  category: Category | string;
  className?: string;
}

export function CategoryTag({ category, className = "" }: CategoryTagProps) {
  const theme = getCategoryTheme(category);

  return (
    <span
      className={`inline-flex items-center max-w-full min-w-0 text-fluid-2xs font-bold uppercase tracking-[0.18em] text-accent ${className}`}
    >
      <span className="truncate">{theme.label}</span>
    </span>
  );
}
