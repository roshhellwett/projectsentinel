'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface DailyData {
  date: string;
  count: number;
  lastMilestone: number;
  days: Record<string, number>;
}

const STORAGE_KEY = 'iv:daily:v4';
const MILESTONES = [5, 10, 15, 25, 50, 100];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getLocalYmd(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayKey(): string {
  return getLocalYmd();
}

function load(): DailyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.count === 'number') return parsed;
    }
  } catch { /* ignore */ }
  return { date: todayKey(), count: 0, lastMilestone: 0, days: {} };
}

function save(data: DailyData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function calcStreak(days: Record<string, number>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getLocalYmd(d);
    if ((days[key] ?? 0) > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function useDailyReadCount() {
  const [count, setCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const daysRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const data = load();
    countRef.current = data.count;
    daysRef.current = data.days;
    setCount(data.count);
    setStreak(calcStreak(data.days));
  }, []);

  const recordRead = useCallback(() => {
    const today = todayKey();
    const existing = load();
    const isNewDay = existing.date !== today;
    const baseCount = isNewDay ? 0 : existing.count;
    const incremented = baseCount + 1;

    const newDays = { ...existing.days, [today]: (existing.days[today] ?? 0) + 1 };
    const nextMilestone = MILESTONES.find((m) => incremented >= m && m > existing.lastMilestone) ?? null;

    save({
      date: today,
      count: incremented,
      lastMilestone: nextMilestone ?? existing.lastMilestone,
      days: newDays,
    });

    countRef.current = incremented;
    daysRef.current = newDays;
    setCount(incremented);
    setStreak(calcStreak(newDays));

    if (nextMilestone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMilestone(nextMilestone);
      timerRef.current = setTimeout(() => setMilestone(null), 3000);
    }
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { dailyCount: count, streak, milestone, recordRead };
}
