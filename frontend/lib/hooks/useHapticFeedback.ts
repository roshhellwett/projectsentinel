'use client';

/**
 * Lightweight haptic feedback wrapper for mobile interactions.
 * Falls back silently on unsupported devices.
 */
export function useHapticFeedback() {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return {
    /** Light tap — card press, toggle */
    light: () => { if (canVibrate) navigator.vibrate(8); },
    /** Medium tap — bookmark, share */
    medium: () => { if (canVibrate) navigator.vibrate(20); },
    /** Success pattern — milestone, reward */
    success: () => { if (canVibrate) navigator.vibrate([10, 40, 10]); },
    /** Error pattern */
    error: () => { if (canVibrate) navigator.vibrate([30, 20, 30]); },
  };
}
