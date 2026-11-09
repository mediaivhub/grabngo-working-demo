'use client';

import { useNow } from '@/lib/useNow';

/** Ticks every second between `start` and `end` (epoch ms). */
export function useCountdown(start: number, end: number) {
  const now = useNow(1000);
  if (now === null) return { remaining: end - start, label: '--:--', done: false, progress: 0 };
  const remaining = Math.max(0, end - now);
  const secs = Math.ceil(remaining / 1000);
  const label = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return { remaining, label, done: remaining === 0, progress: end > start ? 1 - remaining / (end - start) : 1 };
}
