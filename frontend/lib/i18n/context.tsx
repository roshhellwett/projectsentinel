"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { I18nContext, type Locale } from "./i18n-shared";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";

type Messages = Record<string, string>;

const SUPPORTED_LOCALES: Locale[] = ["en", "hi"];
const FALLBACK_LOCALE: Locale = "en";
const STORAGE_KEY = "iv-locale";

const LANG_MAP: Record<Locale, Messages> = { en, hi };

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val != null ? String(val) : `{${key}}`;
  });
}

function getMessage(
  key: string,
  locale: Locale,
  params?: Record<string, string | number>,
): string {
  const msgs = LANG_MAP[locale];
  const template = msgs?.[key];
  if (template) return interpolate(template, params);
  if (locale !== FALLBACK_LOCALE) {
    const fallback = LANG_MAP[FALLBACK_LOCALE]?.[key];
    if (fallback) return interpolate(fallback, params);
  }
  return key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(FALLBACK_LOCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale);
      setIsLoaded(true);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${STORAGE_KEY}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getMessage(key, locale, params);
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}

export { useI18n } from "./i18n-shared";
