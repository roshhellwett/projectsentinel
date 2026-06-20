'use client';

const COUNT_PREFIX  = 'iv:swipe:count:';
const HOSTS_PREFIX  = 'iv:swipe:hosts:';
const STREAK_KEY    = 'iv:swipe:streak:v1';
const HINT_KEY      = 'iv:swipe:hint:dismissed:v1';
const BREAK_PREFIX  = 'iv:swipe:break:snoozed:';

const KEEP_DAYS = 14;

function pad(n: number): string { return String(n).padStart(2, '0'); }

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayYmd(): string { return ymd(new Date()); }

function dayDiff(aYmd: string, bYmd: string): number {
  const a = new Date(`${aYmd}T00:00:00`);
  const b = new Date(`${bYmd}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

import { safeWrite } from './safeStorage';

export function pruneStaleStatsKeys(): void {
  if (typeof window === 'undefined') return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      const isSwipeKey = k.startsWith('iv:swipe:');
      if (!isSwipeKey) continue;
      
      const dateMatch = k.match(/(\d{4}-\d{2}-\d{2})$/);
      if (!dateMatch) continue;
      
      const datePart = dateMatch[1];
      const parsed = new Date(`${datePart}T00:00:00`);
      if (Number.isFinite(parsed.getTime()) && parsed < cutoff) {
        toDelete.push(k);
      }
    }
    toDelete.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* non-fatal */
  }
}

export function getCardsToday(): number {
  return safeRead<number>(`${COUNT_PREFIX}${todayYmd()}`, 0);
}

export function incrementCardsToday(): number {
  const key = `${COUNT_PREFIX}${todayYmd()}`;
  const next = safeRead<number>(key, 0) + 1;
  safeWrite(key, next);
  return next;
}

export function recordHostsToday(hosts: string[]): void {
  if (hosts.length === 0) return;
  const key = `${HOSTS_PREFIX}${todayYmd()}`;
  const set = new Set<string>(safeRead<string[]>(key, []));
  hosts.forEach((h) => h && set.add(h));
  safeWrite(key, Array.from(set));
}

export function getUniqueHostsToday(): number {
  return safeRead<string[]>(`${HOSTS_PREFIX}${todayYmd()}`, []).length;
}

interface StreakState {
  count: number;
  lastDay: string;
}

export function bumpStreak(): StreakState {
  const today = todayYmd();
  const prev = safeRead<StreakState | null>(STREAK_KEY, null);
  let next: StreakState;
  if (!prev) {
    next = { count: 1, lastDay: today };
  } else if (prev.lastDay === today) {
    next = prev;
  } else if (dayDiff(prev.lastDay, today) === 1) {
    next = { count: prev.count + 1, lastDay: today };
  } else {
    next = { count: 1, lastDay: today };
  }
  safeWrite(STREAK_KEY, next);
  return next;
}

export function getStreak(): number {
  const today = todayYmd();
  const prev = safeRead<StreakState | null>(STREAK_KEY, null);
  if (!prev) return 0;
  const diff = dayDiff(prev.lastDay, today);
  if (diff === 0 || diff === 1) return prev.count;
  return 0;
}

export function isHintDismissed(): boolean {
  return safeRead<boolean>(HINT_KEY, false);
}

export function dismissHint(): void {
  safeWrite(HINT_KEY, true);
}

export function isBreakSnoozedToday(): boolean {
  return safeRead<boolean>(`${BREAK_PREFIX}${todayYmd()}`, false);
}

export function snoozeBreakToday(): void {
  safeWrite(`${BREAK_PREFIX}${todayYmd()}`, true);
}
