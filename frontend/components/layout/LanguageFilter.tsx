'use client';

import { Languages } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n/i18n-shared';

const LOCALES: { code: Locale; labelKey: string }[] = [
  { code: 'en', labelKey: 'lang.en' },
  { code: 'hi', labelKey: 'lang.hi' },
  { code: 'ml', labelKey: 'lang.ml' },
  { code: 'ta', labelKey: 'lang.ta' },
  { code: 'mr', labelKey: 'lang.mr' },
  { code: 'bn', labelKey: 'lang.bn' },
];

export function LanguageFilter() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="relative flex items-center gap-1.5">
      <Languages className="w-3.5 h-3.5 text-muted flex-shrink-0" aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('lang.switch_to', { language: t(`lang.${locale}`) })}
        className="appearance-none bg-paper-2 border border-rule/60 rounded-lg px-2 py-1 pr-6 text-[11px] font-semibold text-muted hover:text-ink hover:border-ink/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer transition-colors"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {t(l.labelKey)}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
