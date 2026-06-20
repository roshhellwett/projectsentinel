'use client';

function panicFreeLocalStorage(): void {
  if (typeof window === 'undefined') return;
  const toDelete: string[] = [];
  const swipePrefix = 'iv:swipe:';
  const today = new Date();
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  
  // We want to delete ANY key starting with iv:swipe: that isn't for today.
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    
    // Non-iv:swipe keys are ignored
    if (!k.startsWith(swipePrefix)) continue;
    
    // If it has a date and it's not today, we delete it to free space
    const dateMatch = k.match(/(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch && dateMatch[1] !== todayStr) {
      toDelete.push(k);
    }
  }
  
  // Also clear read history if we're desperate
  toDelete.forEach((k) => {
    try { window.localStorage.removeItem(k); } catch { /* ignore */ }
  });
}

export function safeWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    window.localStorage.setItem(key, str);
  } catch (e) {
    // Check if it's a QuotaExceededError (code 22 or 1014)
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
      panicFreeLocalStorage();
      try {
        // Try one more time after panic
        window.localStorage.setItem(key, str);
      } catch {
        // If it still fails, the quota is genuinely exhausted by other apps or today's data.
        console.warn('LocalStorage quota permanently exceeded.');
      }
    }
  }
}
