'use client';

import { useState, useEffect } from 'react';

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
  
  // Keep only the latest 3 toasts to avoid clutter
  toasts = [...toasts, { id, message, icon }].slice(-3);
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 2800);
}

export function useToasts() {
  const [current, setCurrent] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setCurrent(toasts);
    subscribers.add(setCurrent);
    return () => {
      subscribers.delete(setCurrent);
    };
  }, []);

  return current;
}
