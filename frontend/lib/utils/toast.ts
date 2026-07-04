'use client';

import { useSyncExternalStore } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  icon?: 'bookmark' | 'bookmark-off' | 'share' | 'success';
}

type Subscriber = (toasts: ToastMessage[]) => void;
const subscribers = new Set<Subscriber>();
let toasts: ToastMessage[] = [];

function notify() {
  subscribers.forEach((fn) => fn(toasts));
}

export function showToast(message: string, icon?: ToastMessage['icon']) {
  if (typeof window === 'undefined') return;
  const id = Math.random().toString(36).substring(2, 9);
  
  
  toasts = [...toasts, { id, message, icon }].slice(-3);
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 2800);
}

function subscribeToasts(callback: Subscriber) {
  subscribers.add(callback);
  return () => { subscribers.delete(callback); };
}

const EMPTY_TOASTS: ToastMessage[] = [];
function getSnapshot() { return toasts; }
function getServerSnapshot() { return EMPTY_TOASTS; }

export function useToasts() {
  return useSyncExternalStore(subscribeToasts, getSnapshot, getServerSnapshot);
}
