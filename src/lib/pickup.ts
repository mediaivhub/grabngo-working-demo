import { getProduct, USER_MAP_POSITION, type Place } from '@/data/mock';

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

/** How busy kitchens are around now: rush hours add minutes (demo; restaurants will set this live). */
export function rush(now: number | null): { min: number; label: string } {
  const h = now ? new Date(now).getHours() : 15;
  if (h >= 12 && h < 14) return { min: 4, label: 'lunch rush' };
  if (h >= 19 && h < 21) return { min: 3, label: 'dinner rush' };
  if (h >= 7 && h < 9) return { min: 2, label: 'morning rush' };
  return { min: 0, label: '' };
}

/**
 * Minutes this order takes to make, right now: the kitchen's base time, a little more per extra
 * item (food more than drinks), plus the rush. Recalculated live while an order waits.
 */
export function prepFor(place: Place, lines: { productId: string; qty: number }[], now: number | null) {
  let h = 0;
  for (const c of place.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const base = 5 + (h % 5);
  // The first item is in the base time; each extra one adds a little (food more than drinks).
  const units = lines.flatMap((l) => {
    const p = getProduct(l.productId);
    const food = p?.categories.some((c) => c === 'food' || c === 'dessert');
    return Array<number>(l.qty).fill(food ? 1.5 : 0.75);
  });
  const items = Math.round(units.slice(1).reduce((a, b) => a + b, 0));
  const r = rush(now);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return { min: base + items + r.min, base, items, count, rush: r.min, rushLabel: r.label };
}
