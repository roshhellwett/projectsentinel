

let lockCount = 0;
let previousOverflow: string | null = null;
let previousPaddingRight: string | null = null;

type LockListener = (locked: boolean) => void;
const listeners = new Set<LockListener>();

function emit(): void {
  const locked = lockCount > 0;
  for (const fn of listeners) {
    try {
      fn(locked);
    } catch {
      /* swallow listener errors */
    }
  }
}

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  const wasLocked = lockCount > 0;
  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
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
    document.body.style.paddingRight = previousPaddingRight ?? '';
    previousOverflow = null;
    previousPaddingRight = null;
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
