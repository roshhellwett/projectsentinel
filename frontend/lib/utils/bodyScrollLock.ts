/**
 * Reference-counted body-scroll lock.
 *
 * Multiple overlays can be open at once (NewsDrawer, SearchBar, Navbar mobile
 * drawer). Each was previously calling `document.body.style.overflow = ''`
 * unconditionally on close, which prematurely re-enabled scrolling when a
 * sibling overlay was still open. A shared counter makes the lock/unlock
 * symmetric and overlay-agnostic.
 */

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

/**
 * Subscribe to lock state transitions. Returns an unsubscribe fn.
 * Useful for components like LiveUpdateIsland that should hide when any
 * modal/drawer is open so they don't float above it.
 */
export function subscribeBodyScrollLock(fn: LockListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Synchronously read the current lock state (e.g. for initial render). */
export function isBodyScrollLocked(): boolean {
  return lockCount > 0;
}
