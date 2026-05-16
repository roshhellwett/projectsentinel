'use client';

/**
 * ScrollRestorer — preserves per-route vertical scroll across soft and
 * hard navigation, including iOS Safari's bfcache + back-swipe gestures.
 *
 * Why this exists
 * ───────────────
 * Next.js App Router resets `window.scrollY` to 0 on every navigation by
 * design. That's correct when you click a link to a *new* page, but it
 * destroys the user's context when they hit Back from an article to the
 * home feed they were 1500 px deep into. On mobile this is brutal: tapping
 * a story 30 cards down and then swiping back dumps you at the top with no
 * idea where you were.
 *
 * How it works
 * ────────────
 *  1. We take ownership of `history.scrollRestoration` so the browser's
 *     own (frequently buggy) heuristic stops fighting us.
 *  2. Every time the pathname changes, we *save* the prior scrollY under
 *     the previous pathname's key in sessionStorage.
 *  3. We also save on `pagehide` (covers iOS bfcache freeze, tab close,
 *     and "navigate away" in one event) and on `beforeunload` for desktop.
 *  4. After the new route paints, if we have a stored value for the new
 *     pathname, we restore it on the next animation frame. We retry once
 *     more 180 ms later in case Suspense boundaries are still hydrating
 *     content below the fold.
 *  5. `pageshow` with `persisted=true` (= iOS swiped-back from bfcache)
 *     triggers an immediate restore from the in-memory map too.
 *
 * The map lives in sessionStorage, so it resets cleanly when the tab is
 * closed but survives all in-tab navigation.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'iv:scrollMap:v1';
const MAX_ENTRIES = 50;

/** Read the sessionStorage-persisted scroll map. */
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

/** Write the scroll map with a hard cap to keep storage bounded. */
function writeMap(map: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      // Drop the oldest entries. We don't track timestamps to keep this
      // cheap; FIFO by insertion order is good enough for a single-tab
      // session.
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

  // One-time setup: take control of native scroll restoration, install the
  // pagehide/beforeunload save handlers, and listen for bfcache restores.
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
      // iOS swiped-back from bfcache — restore immediately for the current key.
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

  // On every route change: save the previous key's scrollY, then restore
  // the new key's scrollY if we have one. Otherwise scroll to top — which
  // matches Next.js's default behaviour for "fresh" navigations.
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
      // First paint: jump immediately so the user sees no flicker.
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: stored, behavior: 'auto' });
      });
      // Second-pass: after Suspense boundaries flush below-the-fold content,
      // the document height may have grown — re-apply once.
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
