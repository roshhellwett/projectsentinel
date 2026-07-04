import type { CSSProperties } from 'react';

export interface CategoryTheme {
  hex: string;
  /** Vibrant gradient pair for card accents and badges */
  gradientFrom: string;
  gradientTo: string;
  /** CSS gradient string for direct use */
  cssGradient: string;
  pill: CSSProperties;
  darkPill: CSSProperties;
  gradient: string;
  label: string;
  /** Lucide icon name for category displays */
  icon: string;
}

interface ColorDef {
  label: string;
  hex: string;
  from: string;
  to: string;
  icon: string;
  lightBg: string;
  lightBorder: string;
  darkBg: string;
  darkBorder: string;
}

const COLORS: Record<string, ColorDef> = {
  politics:      { label: 'Politics',      hex: '#6366f1', from: '#6366f1', to: '#8b5cf6', icon: 'landmark',     lightBg: 'rgba(99,102,241,0.10)',  lightBorder: 'rgba(99,102,241,0.25)',  darkBg: 'rgba(99,102,241,0.18)',  darkBorder: 'rgba(139,92,246,0.30)' },
  business:      { label: 'Business',      hex: '#0ea5e9', from: '#0ea5e9', to: '#06b6d4', icon: 'trending-up',  lightBg: 'rgba(14,165,233,0.10)',  lightBorder: 'rgba(14,165,233,0.25)',  darkBg: 'rgba(14,165,233,0.18)',  darkBorder: 'rgba(6,182,212,0.30)' },
  sports:        { label: 'Sports',        hex: '#10b981', from: '#10b981', to: '#34d399', icon: 'trophy',       lightBg: 'rgba(16,185,129,0.10)',  lightBorder: 'rgba(16,185,129,0.25)',  darkBg: 'rgba(16,185,129,0.18)',  darkBorder: 'rgba(52,211,153,0.30)' },
  crime:         { label: 'Crime',         hex: '#ef4444', from: '#ef4444', to: '#f97316', icon: 'siren',        lightBg: 'rgba(239,68,68,0.10)',   lightBorder: 'rgba(239,68,68,0.25)',   darkBg: 'rgba(239,68,68,0.18)',   darkBorder: 'rgba(249,115,22,0.30)' },
  tech:          { label: 'Tech',          hex: '#a855f7', from: '#a855f7', to: '#ec4899', icon: 'cpu',          lightBg: 'rgba(168,85,247,0.10)',  lightBorder: 'rgba(168,85,247,0.25)',  darkBg: 'rgba(168,85,247,0.18)',  darkBorder: 'rgba(236,72,153,0.30)' },
  science:       { label: 'Science',       hex: '#14b8a6', from: '#14b8a6', to: '#06b6d4', icon: 'flask-conical', lightBg: 'rgba(20,184,166,0.10)',  lightBorder: 'rgba(20,184,166,0.25)',  darkBg: 'rgba(20,184,166,0.18)',  darkBorder: 'rgba(6,182,212,0.30)' },
  health:        { label: 'Health',        hex: '#f43f5e', from: '#f43f5e', to: '#fb923c', icon: 'heart-pulse',  lightBg: 'rgba(244,63,94,0.10)',   lightBorder: 'rgba(244,63,94,0.25)',   darkBg: 'rgba(244,63,94,0.18)',   darkBorder: 'rgba(251,146,60,0.30)' },
  world:         { label: 'World',         hex: '#3b82f6', from: '#3b82f6', to: '#6366f1', icon: 'globe',        lightBg: 'rgba(59,130,246,0.10)',  lightBorder: 'rgba(59,130,246,0.25)',  darkBg: 'rgba(59,130,246,0.18)',  darkBorder: 'rgba(99,102,241,0.30)' },
  entertainment: { label: 'Entertainment', hex: '#f59e0b', from: '#f59e0b', to: '#f97316', icon: 'clapperboard', lightBg: 'rgba(245,158,11,0.10)',  lightBorder: 'rgba(245,158,11,0.25)',  darkBg: 'rgba(245,158,11,0.18)',  darkBorder: 'rgba(249,115,22,0.30)' },
  education:     { label: 'Education',     hex: '#8b5cf6', from: '#8b5cf6', to: '#6366f1', icon: 'graduation-cap', lightBg: 'rgba(139,92,246,0.10)',  lightBorder: 'rgba(139,92,246,0.25)',  darkBg: 'rgba(139,92,246,0.18)',  darkBorder: 'rgba(99,102,241,0.30)' },
};

function makeTheme(def: ColorDef): CategoryTheme {
  return {
    hex: def.hex,
    gradientFrom: def.from,
    gradientTo: def.to,
    cssGradient: `linear-gradient(135deg, ${def.from}, ${def.to})`,
    pill: {
      background: def.lightBg,
      borderColor: def.lightBorder,
      color: def.hex,
    },
    darkPill: {
      background: def.darkBg,
      borderColor: def.darkBorder,
      color: def.hex,
    },
    gradient: `from-[${def.from}]/25 via-[${def.from}]/8 to-transparent`,
    label: def.label,
    icon: def.icon,
  };
}

const THEME: Record<string, CategoryTheme> = Object.fromEntries(
  Object.entries(COLORS).map(([key, def]) => [key, makeTheme(def)])
);

const DEFAULT_DEF: ColorDef = {
  label: 'News', hex: '#6366f1', from: '#6366f1', to: '#8b5cf6', icon: 'newspaper',
  lightBg: 'rgba(99,102,241,0.10)', lightBorder: 'rgba(99,102,241,0.25)',
  darkBg: 'rgba(99,102,241,0.18)', darkBorder: 'rgba(139,92,246,0.30)',
};

const DEFAULT_THEME: CategoryTheme = makeTheme(DEFAULT_DEF);

export function getCategoryTheme(category: string | undefined | null): CategoryTheme {
  if (!category || !category.trim()) return DEFAULT_THEME;
  const clean = category.trim();
  return THEME[clean.toLowerCase()] ?? {
    ...DEFAULT_THEME,
    label: clean.charAt(0).toUpperCase() + clean.slice(1),
  };
}

/** Get just the gradient CSS for a category */
export function getCategoryGradient(category: string | undefined | null): string {
  return getCategoryTheme(category).cssGradient;
}
