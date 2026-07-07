let lockCount = 0;
let previousOverflow: string | null = null;
let previousPaddingRight: string | null = null;
let previousPosition: string | null = null;
let previousTop: string | null = null;
let previousWidth: string | null = null;
let savedScrollY = 0;

type LockListener = (locked: boolean) => void;
const listeners = new Set<LockListener>();

function emit(): void {
  const locked = lockCount > 0;
  for (const fn of listeners) {
    try {
      fn(locked);
    } catch {
      // ignore listener errors
    }
  }
}

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  const wasLocked = lockCount > 0;
  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    previousPosition = document.body.style.position;
    previousTop = document.body.style.top;
    previousWidth = document.body.style.width;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
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
    document.body.style.position = previousPosition ?? '';
    document.body.style.top = previousTop ?? '';
    document.body.style.width = previousWidth ?? '';
    const scrollYToRestore = savedScrollY;
    previousOverflow = null;
    previousPaddingRight = null;
    previousPosition = null;
    previousTop = null;
    previousWidth = null;
    savedScrollY = 0;
    window.scrollTo(0, scrollYToRestore);
    emit();
  }
}

export function forceUnlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount > 0 || document.body.style.overflow === 'hidden' || document.body.style.position === 'fixed') {
    lockCount = 0;
    document.body.style.overflow = previousOverflow ?? '';
    document.body.style.paddingRight = previousPaddingRight ?? '';
    document.body.style.position = previousPosition ?? '';
    document.body.style.top = previousTop ?? '';
    document.body.style.width = previousWidth ?? '';
    const scrollYToRestore = savedScrollY;
    previousOverflow = null;
    previousPaddingRight = null;
    previousPosition = null;
    previousTop = null;
    previousWidth = null;
    savedScrollY = 0;
    if (scrollYToRestore > 0) {
      window.scrollTo(0, scrollYToRestore);
    }
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
