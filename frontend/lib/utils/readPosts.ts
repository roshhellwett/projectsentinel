'use client';

import { usePersistentIdSet } from './persistentIdSet';

const READ_KEY = 'iv:readPosts:v1';
const SAVED_KEY = 'iv:savedPosts:v1';

export function useReadPosts() {
  const { ids, add, has } = usePersistentIdSet({ key: READ_KEY, max: 500 });
  return { readIds: ids, markRead: add, isRead: has };
}

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
