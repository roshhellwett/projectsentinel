import type { CSSProperties } from "react";

const INK_HEX = "#1a1a1a";

export interface CategoryTheme {
  hex: string;
  label: string;
  icon: string;
}

const LABELS: Record<string, { label: string; icon: string }> = {
  politics: { label: "Politics", icon: "landmark" },
  business: { label: "Business", icon: "trending-up" },
  sports: { label: "Sports", icon: "trophy" },
  crime: { label: "Crime", icon: "siren" },
  tech: { label: "Tech", icon: "cpu" },
  science: { label: "Science", icon: "flask-conical" },
  health: { label: "Health", icon: "heart-pulse" },
  world: { label: "World", icon: "globe" },
  entertainment: { label: "Entertainment", icon: "clapperboard" },
  education: { label: "Education", icon: "graduation-cap" },
};

const DEFAULT: CategoryTheme = {
  hex: INK_HEX,
  label: "News",
  icon: "newspaper",
};

const THEME: Record<string, CategoryTheme> = Object.fromEntries(
  Object.entries(LABELS).map(([key, def]) => [
    key,
    { hex: INK_HEX, label: def.label, icon: def.icon },
  ]),
);

export function getCategoryTheme(
  category: string | undefined | null,
): CategoryTheme {
  if (!category || !category.trim()) return DEFAULT;
  const clean = category.trim();
  return (
    THEME[clean.toLowerCase()] ?? {
      hex: INK_HEX,
      label: clean.charAt(0).toUpperCase() + clean.slice(1),
      icon: "newspaper",
    }
  );
}
