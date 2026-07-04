import type { CSSProperties } from 'react';

export interface CategoryTheme {
  hex: string;
  pill: CSSProperties;
  darkPill: CSSProperties;
  gradient: string;
  label: string;
}

const GOLD = '#f1a82c';
const GOLD_LIGHT = 'rgba(241, 168, 44, 0.12)';
const GOLD_BORDER = 'rgba(241, 168, 44, 0.30)';
const GOLD_TEXT = '#b2801e';
const GOLD_DARK = 'rgba(241, 168, 44, 0.18)';
const GOLD_DARK_BORDER = 'rgba(241, 168, 44, 0.35)';
const GOLD_DARK_TEXT = '#f1c87a';

function makeTheme(label: string): CategoryTheme {
  return {
    hex: GOLD,
    pill: {
      background: GOLD_LIGHT,
      borderColor: GOLD_BORDER,
      color: GOLD_TEXT,
    },
    darkPill: {
      background: GOLD_DARK,
      borderColor: GOLD_DARK_BORDER,
      color: GOLD_DARK_TEXT,
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
  hex: GOLD,
  pill: {
    background: GOLD_LIGHT,
    borderColor: GOLD_BORDER,
    color: GOLD_TEXT,
  },
  darkPill: {
    background: GOLD_DARK,
    borderColor: GOLD_DARK_BORDER,
    color: GOLD_DARK_TEXT,
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
