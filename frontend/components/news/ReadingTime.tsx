'use client';

import { useI18n } from '@/lib/i18n/context';

interface ReadingTimeProps {
  text: string;
}

const WPM = 220;

export function ReadingTime({ text }: ReadingTimeProps) {
  const { t } = useI18n();
  const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / WPM;

  const label = minutes < 1
    ? t('reading.quick')
    : t('reading.min', { n: Math.ceil(minutes) });

  return <span className="text-sm">{label}</span>;
}
