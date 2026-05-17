'use client';

// last edited 2026-05-17 by roshhellwett

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
    /* fall through */
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
  } catch {
    /* quota or private-mode — non-fatal */
  }
}

export function ScrollRestorer() {
  const pathname = usePathname();
  const key = pathname ?? '/';
  const previousKeyRef = useRef<string | null>(null);



  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prevMode = history.scrollRestoration;
    try {
      history.scrollRestoration = 'manual';
    } catch {
      /* not supported — fine */
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
        /* ignore */
      }
    };
  }, [key]);




  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const prev = previousKeyRef.current;
    if (prev && prev !== key) {
      const map = readMap();
      map[prev] = window.scrollY;
      writeMap(map);
    }

    const map = readMap();
    const stored = map[key];

    if (typeof stored === 'number') {

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: stored, behavior: 'auto' });
      });


      const retry = window.setTimeout(() => {
        if (Math.abs(window.scrollY - stored) > 4) {
          window.scrollTo({ top: stored, behavior: 'auto' });
        }
      }, 180);
      previousKeyRef.current = key;
      return () => window.clearTimeout(retry);
    }

    previousKeyRef.current = key;
    return undefined;
    // No stored entry — leave the default-top behaviour to Next.js.
  }, [key]);

  return null;
}
