import type { WeekSchedule } from '@/data/mock';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function formatTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const rangeText = (r: [number, number] | null) => (r ? `${formatTime(r[0])} - ${formatTime(r[1])}` : 'Day off');

/** Collapses a week into rows like "mon - fri · 7:30 AM - 8:00 PM". */
export function groupSchedule(schedule: WeekSchedule) {
  const rows: { days: string; hours: string }[] = [];
  let start = 0;
  for (let i = 1; i <= 7; i++) {
    if (i < 7 && rangeText(schedule[i]) === rangeText(schedule[start])) continue;
    const end = i - 1;
    const days = start === end ? DAYS[start] : end - start === 1 ? `${DAYS[start]}, ${DAYS[end]}` : `${DAYS[start]} - ${DAYS[end]}`;
    rows.push({ days, hours: rangeText(schedule[start]) });
    start = i;
  }
  return rows;
}

export function openStatus(schedule: WeekSchedule, now: Date) {
  const today = schedule[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  if (today && mins >= today[0] && mins < today[1]) return { open: true, label: `til ${formatTime(today[1])}` };
  return { open: false, label: 'Closed' };
}
