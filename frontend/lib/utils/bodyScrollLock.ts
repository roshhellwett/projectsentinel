// last edited 2026-05-17 by roshhellwett

let lockCount = 0;
let previousOverflow: string | null = null;

type LockListener = (locked: boolean) => void;
const listeners = new Set<LockListener>();

function emit(): void {
  const locked = lockCount > 0;
  for (const fn of listeners) {
    try {
      fn(locked);
    } catch {
      /* swallow listener errors so one bad subscriber can't break the rest */
    }
  }
}

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  const wasLocked = lockCount > 0;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
  if (!wasLocked) emit();
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? '';
    previousOverflow = null;
    emit();
  }
}

export function subscribeBodyScrollLock(fn: LockListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function isBodyScrollLocked(): boolean {
  return lockCount > 0;
}
