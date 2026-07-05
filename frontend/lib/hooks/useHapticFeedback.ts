'use client';

export function useHapticFeedback() {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return {
    light: () => { if (canVibrate) navigator.vibrate(8); },
    medium: () => { if (canVibrate) navigator.vibrate(20); },
    success: () => { if (canVibrate) navigator.vibrate([10, 40, 10]); },
    error: () => { if (canVibrate) navigator.vibrate([30, 20, 30]); },
  };
}
