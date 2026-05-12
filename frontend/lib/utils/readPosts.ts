'use client';

/**
 * useReadPosts — persistent client-side read/unread tracker.
 *
 * Why a hook + localStorage?
 *   • Users repeatedly asked us to mark which stories they have already
 *     opened. We can't depend on auth or a server table for that, so the
 *     simplest privacy-respecting approach is localStorage on the device.
 *   • We cap the set to MAX_TRACKED most-recent reads so the key never
 *     grows unbounded. (FIFO eviction by insertion order.)
 *   • Cross-tab sync via the `storage` event so opening a story in one tab
 *     immediately dims it in any other open tab.
 *
 * Exposes:
 *   - `readIds`: a stable Set<string> (referentially-changing on update)
 *   - `markRead(id)`: idempotent, persists + broadcasts
 *   - `isRead(id)`: O(1) membership test
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'iv:readPosts:v1';
const MAX_TRACKED = 500;

function loadFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persistToStorage(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota exceeded — silently drop */
  }
}

export function useReadPosts() {
  // Start empty on the server to avoid hydration mismatch; hydrate after mount.
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setReadIds(new Set(loadFromStorage()));

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setReadIds(new Set(loadFromStorage()));
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markRead = useCallback((id: string) => {
    if (!id) return;
    setReadIds((curr) => {
      if (curr.has(id)) return curr;
      // Maintain insertion order via array, then convert back to Set.
      const arr = [...curr, id];
      const trimmed = arr.length > MAX_TRACKED ? arr.slice(arr.length - MAX_TRACKED) : arr;
      persistToStorage(trimmed);
      return new Set(trimmed);
    });
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return { readIds, markRead, isRead };
}
