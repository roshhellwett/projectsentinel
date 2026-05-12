'use client';

/**
 * useReadPosts / useSavedPosts — persistent client-side reader state.
 *
 * Both hooks share the generic `usePersistentIdSet` engine in
 * `./persistentIdSet`, which handles localStorage, FIFO eviction, SSR
 * safety, and cross-tab sync. The wrappers here just bind the appropriate
 * storage key and expose semantically-named methods.
 */

import { usePersistentIdSet } from './persistentIdSet';

const READ_KEY = 'iv:readPosts:v1';
const SAVED_KEY = 'iv:savedPosts:v1';

/**
 * Tracks which posts the reader has opened (for dimming in the feed).
 * Public surface preserved verbatim for backwards compatibility.
 */
export function useReadPosts() {
  const { ids, add, has } = usePersistentIdSet({ key: READ_KEY, max: 500 });
  return { readIds: ids, markRead: add, isRead: has };
}

/**
 * Tracks which posts the reader has bookmarked for later reading.
 * Exposes a toggle for one-click save/unsave UX.
 */
export function useSavedPosts() {
  const { ids, add, remove, toggle, has, clear } = usePersistentIdSet({
    key: SAVED_KEY,
    max: 200,
  });
  return {
    savedIds: ids,
    save: add,
    unsave: remove,
    toggleSaved: toggle,
    isSaved: has,
    clearSaved: clear,
  };
}
