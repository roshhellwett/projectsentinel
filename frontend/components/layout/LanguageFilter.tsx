'use client';

import { useI18n, type Locale } from '@/lib/i18n/i18n-shared';

const LOCALES: { code: Locale; labelKey: string }[] = [
  { code: 'en', labelKey: 'lang.en' },
  { code: 'hi', labelKey: 'lang.hi' },
];

function LangIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function LanguageFilter() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="relative flex items-center gap-1.5">
      <LangIcon />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('lang.switch_to', { language: t(`lang.${locale}`) })}
        className="appearance-none bg-paper/70 backdrop-blur-sm border border-rule/60 rounded-sm px-2.5 py-1.5 sm:px-2 sm:py-1 pr-5 font-body text-xs text-muted hover:text-ink cursor-pointer transition-colors"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {t(l.labelKey)}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted pointer-events-none"
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
