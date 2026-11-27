import { USER_MAP_POSITION, type Place } from '@/data/mock';

/** Rough km from the customer (the stylised map spans about 7 km). */
export const distanceKm = (p: Place) => Math.max(0.3, Math.round(Math.hypot(p.map.x - USER_MAP_POSITION.x, p.map.y - USER_MAP_POSITION.y) * 70) / 10);

/** Minutes until an order placed now would be ready: kitchen time plus how busy they are (demo, stable per place). */
export function readyMinutes(p: Place) {
  let h = 0;
  for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 7 + (h % 12);
}

/** When the customer would be there, roughly (city driving, about 2.5 min per km plus parking). */
export const driveMinutes = (p: Place) => Math.round(distanceKm(p) * 2.5 + 2);

export type DayPart = 'morning' | 'midday' | 'evening' | 'late';
export function dayPart(now: number | null): DayPart {
  const h = now ? new Date(now).getHours() : 13;
  return h < 5 ? 'late' : h < 11 ? 'morning' : h < 17 ? 'midday' : h < 23 ? 'evening' : 'late';
}
