'use client';

/**
 * usePersistentIdSet — generic localStorage-backed Set<string> hook.
 *
 * Shared engine behind:
 *   • useReadPosts   (which posts the reader has opened)
 *   • useSavedPosts  (which posts the reader bookmarked)
 *
 * Features:
 *   • SSR-safe: initial value is empty on the server; hydrates after mount,
 *     so React's hydration pass never sees a mismatch.
 *   • FIFO eviction beyond `max` entries so localStorage doesn't grow
 *     unbounded as the user reads more stories.
 *   • Cross-tab sync via the `storage` event — bookmark in one tab,
 *     instant reflection in any other open tab.
 *   • Listener-safe: per-instance subscription to a tiny in-memory pub/sub
 *     so multiple components sharing the same key stay in sync without
 *     waiting for the next render tick.
 */

import { useCallback, useEffect, useState } from 'react';

interface Options {
  /** localStorage key */
  key: string;
  /** Maximum number of IDs to retain — older entries are evicted first */
  max?: number;
}

// Tiny in-process pub/sub so all hook consumers of the same key stay in lock-step.
const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => {
    try { fn(); } catch { /* swallow */ }
  });
}

function subscribe(key: string, fn: () => void): () => void {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) subscribers.delete(key);
  };
}

function loadFromStorage(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persistToStorage(key: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* quota exceeded — silently drop */
  }
}

export function usePersistentIdSet({ key, max = 500 }: Options) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  // Hydrate from storage + register cross-tab and in-process listeners.
  useEffect(() => {
    setIds(new Set(loadFromStorage(key)));

    const refresh = () => setIds(new Set(loadFromStorage(key)));

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      refresh();
    };

    window.addEventListener('storage', onStorage);
    const unsub = subscribe(key, refresh);

    return () => {
      window.removeEventListener('storage', onStorage);
      unsub();
    };
  }, [key]);

  const add = useCallback((id: string) => {
    if (!id) return;
    const arr = loadFromStorage(key);
    if (arr.includes(id)) return;
    arr.push(id);
    const trimmed = arr.length > max ? arr.slice(arr.length - max) : arr;
    persistToStorage(key, trimmed);
    notify(key);
  }, [key, max]);

  const remove = useCallback((id: string) => {
    if (!id) return;
    const arr = loadFromStorage(key).filter((x) => x !== id);
    persistToStorage(key, arr);
    notify(key);
  }, [key]);

  const toggle = useCallback((id: string) => {
    if (!id) return;
    const arr = loadFromStorage(key);
    if (arr.includes(id)) {
      persistToStorage(key, arr.filter((x) => x !== id));
    } else {
      arr.push(id);
      const trimmed = arr.length > max ? arr.slice(arr.length - max) : arr;
      persistToStorage(key, trimmed);
    }
    notify(key);
  }, [key, max]);

  const clear = useCallback(() => {
    persistToStorage(key, []);
    notify(key);
  }, [key]);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  return { ids, add, remove, toggle, clear, has };
}
