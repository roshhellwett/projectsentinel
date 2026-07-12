"use client";

export function pruneAllOfflineStorage(): void {
  if (typeof window === "undefined") return;
  const toDelete: string[] = [];
  const swipePrefix = "iv:swipe:";
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const getDayStr = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const validDates = new Set([
    getDayStr(0),
    getDayStr(1),
    getDayStr(2),
    getDayStr(3),
  ]);

  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith("iv:")) continue;

    if (k.startsWith(swipePrefix)) {
      const dateMatch = k.match(/(\d{4}-\d{2}-\d{2})$/);
      if (dateMatch && !validDates.has(dateMatch[1])) {
        toDelete.push(k);
      }
    } else {
      try {
        const val = window.localStorage.getItem(k);
        if (val && val.startsWith("[") && val.endsWith("]")) {
          JSON.parse(val);
        }
      } catch {
        toDelete.push(k);
      }
    }
  }

  toDelete.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });

  try {
    const readRaw = window.localStorage.getItem("iv:readPosts:v1");
    if (readRaw) {
      const arr = JSON.parse(readRaw);
      if (Array.isArray(arr) && arr.length > 200) {
        window.localStorage.setItem(
          "iv:readPosts:v1",
          JSON.stringify(arr.slice(-200)),
        );
      }
    }
  } catch {}
}

function panicFreeLocalStorage(): void {
  pruneAllOfflineStorage();
}

export function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  const str = typeof value === "string" ? value : JSON.stringify(value);
  try {
    window.localStorage.setItem(key, str);
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014)
    ) {
      panicFreeLocalStorage();
      try {
        window.localStorage.setItem(key, str);
      } catch {
        console.warn("LocalStorage quota permanently exceeded.");
      }
    }
  }
}

export function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}
