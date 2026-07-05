'use client';

import type { ContentLanguage } from '@/types';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'EN',
  hi: 'HI',
  ta: 'TA',
  te: 'TE',
  bn: 'BN',
  mr: 'MR',
  ml: 'ML',
  kn: 'KN',
  gu: 'GU',
  ur: 'UR',
};

export function LanguageBadge({ language }: { language?: ContentLanguage | string | null }) {
  if (!language || language === 'en') return null;
  const label = LANGUAGE_LABELS[language] || language.toUpperCase();

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] rounded bg-ink/10 text-ink/70 border border-ink/10">
      {label}
    </span>
  );
}
