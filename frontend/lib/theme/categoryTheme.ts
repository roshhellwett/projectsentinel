import type { CSSProperties } from 'react';

export interface CategoryTheme {
  hex: string;
  pill: CSSProperties;
  darkPill: CSSProperties;
  gradient: string;
  label: string;
}

const ACCENT = '#1e1e1a';
const ACCENT_LIGHT = 'rgba(30, 30, 26, 0.10)';
const ACCENT_BORDER = 'rgba(30, 30, 26, 0.25)';
const ACCENT_TEXT = '#1e1e1a';
const ACCENT_DARK = 'rgba(245, 240, 235, 0.15)';
const ACCENT_DARK_BORDER = 'rgba(245, 240, 235, 0.30)';
const ACCENT_DARK_TEXT = '#f5f0eb';

function makeTheme(label: string): CategoryTheme {
  return {
    hex: ACCENT,
    pill: {
      background: ACCENT_LIGHT,
      borderColor: ACCENT_BORDER,
      color: ACCENT_TEXT,
    },
    darkPill: {
      background: ACCENT_DARK,
      borderColor: ACCENT_DARK_BORDER,
      color: ACCENT_DARK_TEXT,
    },
    gradient: 'from-accent/25 via-accent/8 to-transparent',
    label,
  };
}

const THEME: Record<string, CategoryTheme> = {
  politics:     makeTheme('Politics'),
  business:     makeTheme('Business'),
  sports:       makeTheme('Sports'),
  crime:        makeTheme('Crime'),
  tech:         makeTheme('Tech'),
  science:      makeTheme('Science'),
  health:       makeTheme('Health'),
  world:        makeTheme('World'),
  entertainment: makeTheme('Entertainment'),
  education:    makeTheme('Education'),
};

const DEFAULT_THEME: CategoryTheme = {
  hex: ACCENT,
  pill: {
    background: ACCENT_LIGHT,
    borderColor: ACCENT_BORDER,
    color: ACCENT_TEXT,
  },
  darkPill: {
    background: ACCENT_DARK,
    borderColor: ACCENT_DARK_BORDER,
    color: ACCENT_DARK_TEXT,
  },
  gradient: 'from-accent/25 via-accent/8 to-transparent',
  label: 'News',
};

export function getCategoryTheme(category: string | undefined | null): CategoryTheme {
  if (!category) return DEFAULT_THEME;
  return THEME[category.toLowerCase()] ?? {
    ...DEFAULT_THEME,
    label: category.charAt(0).toUpperCase() + category.slice(1),
  };
}
