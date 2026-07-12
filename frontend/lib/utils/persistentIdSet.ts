"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  key: string;
  max?: number;
}

const subscribers = new Map<string, Set<() => void>>();

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
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

import { safeRead, safeWrite as persistToStorage } from "./safeStorage";

function loadFromStorage(key: string): string[] {
  try {
    const raw = safeRead(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

// BroadcastChannel for instant cross-tab sync
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("iv-sync")
    : null;

function broadcastChange(key: string) {
  channel?.postMessage({ type: "id-set-change", key, timestamp: Date.now() });
}

export function usePersistentIdSet({ key, max = 500 }: Options) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setIds(new Set(loadFromStorage(key)));

    const refresh = () => {
      setIds(new Set(loadFromStorage(key)));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      refresh();
    };

    const onBroadcast = (e: MessageEvent) => {
      if (e.data?.type === "id-set-change" && e.data?.key === key) {
        refresh();
      }
    };

    window.addEventListener("storage", onStorage);
    channel?.addEventListener("message", onBroadcast);
    const unsub = subscribe(key, refresh);

    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onBroadcast);
      unsub();
    };
  }, [key]);

  const add = useCallback(
    (id: string) => {
      if (!id) return;
      const arr = loadFromStorage(key);
      if (arr.includes(id)) return;
      arr.push(id);
      const trimmed = arr.length > max ? arr.slice(arr.length - max) : arr;
      persistToStorage(key, trimmed);
      notify(key);
      broadcastChange(key);
    },
    [key, max],
  );

  const remove = useCallback(
    (id: string) => {
      if (!id) return;
      const arr = loadFromStorage(key).filter((x) => x !== id);
      persistToStorage(key, arr);
      notify(key);
      broadcastChange(key);
    },
    [key],
  );

  const toggle = useCallback(
    (id: string) => {
      if (!id) return;
      const arr = loadFromStorage(key);
      if (arr.includes(id)) {
        persistToStorage(
          key,
          arr.filter((x) => x !== id),
        );
      } else {
        arr.push(id);
        const trimmed = arr.length > max ? arr.slice(arr.length - max) : arr;
        persistToStorage(key, trimmed);
      }
      notify(key);
      broadcastChange(key);
    },
    [key, max],
  );

  const clear = useCallback(() => {
    persistToStorage(key, []);
    notify(key);
    broadcastChange(key);
  }, [key]);

  const idsRef = useRef(ids);
  idsRef.current = ids;
  const has = useCallback((id: string) => idsRef.current.has(id), []);

  return { ids, add, remove, toggle, clear, has };
}
