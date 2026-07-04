'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'iv:scrollMap:v1';
const MAX_ENTRIES = 50;

function readMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, number>;
  } catch {
      }
  return {};
}

function writeMap(map: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      const trimmed: Record<string, number> = {};
      for (const k of keys.slice(keys.length - MAX_ENTRIES)) trimmed[k] = map[k];
      map = trimmed;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
              }
    }
  }
}

export function ScrollRestorer() {
  const pathname = usePathname();
  const key = pathname ?? '/';
  const previousKeyRef = useRef<string | null>(null);
  const scrollTrackerRef = useRef<number>(0);

  useEffect(() => {
    const trackScroll = () => {
      scrollTrackerRef.current = window.scrollY;
    };
    window.addEventListener('scroll', trackScroll, { passive: true });
    return () => window.removeEventListener('scroll', trackScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prevMode = history.scrollRestoration;
    try {
      history.scrollRestoration = 'manual';
    } catch {
          }

    const save = () => {
      const k = previousKeyRef.current;
      if (!k) return;
      const map = readMap();
      map[k] = window.scrollY;
      writeMap(map);
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;

      const map = readMap();
      const y = map[previousKeyRef.current ?? key];
      if (typeof y === 'number') window.scrollTo({ top: y, behavior: 'auto' });
    };

    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('pagehide', save);
      window.removeEventListener('beforeunload', save);
      window.removeEventListener('pageshow', onPageShow);
      try {
        history.scrollRestoration = prevMode;
      } catch {
              }
    };
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const prev = previousKeyRef.current;
    if (prev && prev !== key) {
      const map = readMap();
      map[prev] = scrollTrackerRef.current;
      writeMap(map);
    }

    const map = readMap();
    const stored = map[key];

    if (typeof stored === 'number') {
      let cancelled = false;
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.min(stored, maxScroll), behavior: 'auto' });
      });

      const retry = window.setInterval(() => {
        if (cancelled) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const target = Math.min(stored, maxScroll);
        if (Math.abs(window.scrollY - target) > 4) {
          window.scrollTo({ top: target, behavior: 'auto' });
        }
      }, 150);

      const cancelRetry = () => {
        cancelled = true;
        window.clearInterval(retry);
      };
      window.addEventListener('touchstart', cancelRetry, { passive: true, once: true });
      window.addEventListener('wheel', cancelRetry, { passive: true, once: true });
      window.addEventListener('keydown', cancelRetry, { passive: true, once: true });

      const timeout = window.setTimeout(() => {
        cancelRetry();
        window.removeEventListener('touchstart', cancelRetry);
        window.removeEventListener('wheel', cancelRetry);
        window.removeEventListener('keydown', cancelRetry);
      }, 1500);

      previousKeyRef.current = key;
      return () => {
        cancelRetry();
        window.clearTimeout(timeout);
        window.removeEventListener('touchstart', cancelRetry);
        window.removeEventListener('wheel', cancelRetry);
        window.removeEventListener('keydown', cancelRetry);
      };
    }

    previousKeyRef.current = key;
    return undefined;
    
  }, [key]);

  return null;
}
