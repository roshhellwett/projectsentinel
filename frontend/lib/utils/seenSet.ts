'use client';

const PREFIX = 'iv:swipe:seen:';
const KEEP_DAYS = 7;
const MAX_PER_DAY = 1000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dayKey(d: Date): string {
  return `${PREFIX}${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayKey(): string {
  return dayKey(new Date());
}

import { safeRead as baseSafeRead, safeWrite, safeRemove } from './safeStorage';

function safeRead(key: string): string[] {
  try {
    const raw = baseSafeRead(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function pruneStaleSeenKeys(): void {
  if (typeof window === 'undefined') return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const datePart = k.slice(PREFIX.length);
      const parsed = new Date(`${datePart}T00:00:00`);
      if (Number.isFinite(parsed.getTime()) && parsed < cutoff) toDelete.push(k);
    }
    toDelete.forEach((k) => safeRemove(k));
  } catch {}
}

let hasPruned = false;

export function loadSeenWithinDays(days: number = 1): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  if (!hasPruned) {
    pruneStaleSeenKeys();
    hasPruned = true;
  }
  const out = new Set<string>();
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    safeRead(dayKey(d)).forEach((id) => out.add(id));
  }
  return out;
}

export function markSeen(id: string): void {
  if (!id || typeof window === 'undefined') return;
  const key = todayKey();
  const arr = safeRead(key);
  if (arr.includes(id)) return;
  arr.push(id);
  const trimmed = arr.length > MAX_PER_DAY ? arr.slice(arr.length - MAX_PER_DAY) : arr;
  safeWrite(key, trimmed);
}

export function unmarkSeen(id: string): void {
  if (!id || typeof window === 'undefined') return;
  const key = todayKey();
  const arr = safeRead(key).filter((x) => x !== id);
  safeWrite(key, arr);
}
