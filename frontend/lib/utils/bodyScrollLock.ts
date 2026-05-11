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

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? '';
    previousOverflow = null;
  }
}
