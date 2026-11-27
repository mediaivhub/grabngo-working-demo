'use client';

import { ChefHat, Hand, Navigation, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cx } from '@/components/ui';
import { getPlace, type Place } from '@/data/mock';
import { prepFor } from '@/lib/pickup';
import { useNow } from '@/lib/useNow';
import { isHeld, kitchenStart, useStore, type KitchenTiming, type Order } from '@/store/AppStore';

/** How you'd say the place's name: "Orfali Bros", "Nightjar", "La Petite Maison". */
export const shortName = (name = '') =>
  name
    .replace(/^The\s+/, '')
    .replace(/\s+(Bistro|Caf[eé]|Kitchen|Restaurant|Coffee|Bakery|Roasters)$/i, '')
    .trim() || name;
const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Live kitchen minutes for a held order (it changes with the rush while it waits). */
function useLivePrep(order: Order) {
  const now = useNow(30_000);
  const place = getPlace(order.placeId);
  const live = place && now ? prepFor(place, order.lines.filter((l) => l.unitPrice > 0), now) : null;
  return { now, prep: live?.min ?? Math.round((order.hold?.prepSec ?? 0) / 60), live };
}

/** "8 min kitchen · +2 for 3 items · +4 lunch rush" */
function breakdown(p: ReturnType<typeof prepFor>) {
  return [`${p.base} min kitchen`, p.items > 0 && `+${p.items} for ${p.count} items`, p.rush > 0 && `+${p.rush} ${p.rushLabel}`].filter(Boolean).join(' · ');
}

/** At checkout: when should the kitchen start? Optional, "Start now" is the default. */
export function TimingPicker({ place, lines, atCar, value, onChange }: { place: Place; lines: { productId: string; qty: number }[]; atCar: boolean; value: KitchenTiming; onChange: (t: KitchenTiming) => void }) {
  const now = useNow(30_000);
  const p = prepFor(place, lines, now);
  const n = p.min;
  const options: { id: KitchenTiming; Icon: typeof Zap; title: string; sub: ReactNode }[] = [
    { id: 'now', Icon: Zap, title: 'Start now', sub: now ? `Ready around ${clock(now + n * 60_000)}` : `Ready in about ${n} min` },
    ...(atCar ? [{ id: 'arrive' as const, Icon: Navigation, title: 'When I’m on my way', sub: `Starts by itself when you’re ${n} min away` }] : []),
    { id: 'say', Icon: Hand, title: 'When I say', sub: 'Pay now, start it when you’re ready' },
  ];
  return (
    <section className="mt-1.5 rounded-3xl bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[19px] font-bold tracking-tight">When should they start?</h2>
        <span className="text-[12.5px] text-gray">Optional</span>
      </div>
      <p className="mt-1 text-[13px] text-gray">
        About <b className="font-semibold text-ink">{n} min</b> right now · {breakdown(p)}
      </p>
      <div className="mt-3.5 flex flex-col gap-1.5" role="radiogroup" aria-label="When the kitchen starts">
        {options.map(({ id, Icon, title, sub }) => {
          const on = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              className={cx('flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors', on ? 'border-ink bg-white' : 'border-transparent bg-surface')}>
              <Icon size={17} className={cx('shrink-0', id === 'arrive' && 'rotate-45', on ? 'text-ink' : 'text-gray')} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">{title}</span>
                <span className="block text-[12.5px] text-gray">{sub}</span>
              </span>
              <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-ink' : 'border-gray-light')}>{on && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** The kitchen's side of the trip, under the drive: waiting for you, cooking, or ready. */
export function KitchenLine({ order }: { order: Order }) {
  const now = useNow(1000);
  const held = isHeld(order);
  const total = Math.max(1, order.readyAt - kitchenStart(order));
  const left = now ? Math.max(0, Math.ceil((order.readyAt - now) / 1000)) : null;
  const ready = !held && (order.status === 'ready' || left === 0);
  const progress = held || !now ? 0 : ready ? 1 : Math.min(1, (now - kitchenStart(order)) / total);
  return (
    <div className="mt-3 flex items-center gap-3">
      <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full', held ? 'bg-white text-gray' : ready ? 'bg-green text-white' : 'bg-orange text-white')}>
        <ChefHat size={14} />
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
        <div className={cx('h-full rounded-full transition-[width] duration-1000 ease-linear', ready ? 'bg-green' : 'bg-orange')} style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="w-[112px] shrink-0 text-right text-[12.5px] tabular-nums text-ink/70">
        {held ? 'Kitchen waiting' : ready ? 'Ready, kept hot' : order.trip?.demo ? 'Cooking, in step' : `Cooking · ${left === null ? '--' : mmss(left)}`}
      </span>
    </div>
  );
}

/** Start a held order now, with when it'd be ready. */
export function StartButton({ order, label = 'Start my order' }: { order: Order; label?: string }) {
  const { startKitchen } = useStore();
  const { now, prep } = useLivePrep(order);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.vibrate?.(12);
        startKitchen(order.id, Date.now() + prep * 60_000);
      }}
      className="flex h-12 w-full items-center justify-between rounded-full bg-ink pl-5 pr-4 text-white active:scale-[0.99]">
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="text-[12.5px] text-white/60">{now ? `Ready ${clock(now + prep * 60_000)}` : `${prep} min`}</span>
    </button>
  );
}

const ARRIVE_IN = [10, 20, 30, 45];

/**
 * A paid order waiting for the customer's word. One question ("When will you get there?"),
 * the answer in plain words (when the kitchen starts, when it's ready), one button.
 */
export function HeldCard({ order, place }: { order: Order; place?: Place }) {
  const { startKitchen, scheduleStart } = useStore();
  const { now, prep, live } = useLivePrep(order);
  const [arriveIn, setArriveIn] = useState<number | null>(null);
  const startAt = order.hold?.startAt;
  const t0 = now ?? order.createdAt;
  const startNow = () => {
    navigator.vibrate?.(12);
    startKitchen(order.id, Date.now() + prep * 60_000);
  };

  // The plan, from the answer.
  const later = arriveIn !== null && arriveIn > prep;
  const start = startAt ?? (later ? t0 + (arriveIn - prep) * 60_000 : t0);
  const ready = start + prep * 60_000;
  const lateBy = arriveIn !== null && !later ? prep - arriveIn : 0;

  return (
    <section className="mt-2 rounded-[24px] bg-surface p-4">
      <div className="flex items-center justify-between gap-3 text-[12.5px]">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <span className={cx('h-2 w-2 rounded-full', startAt ? 'bg-green' : 'bg-orange')} /> {startAt ? 'Paid · scheduled' : 'Paid · on hold'}
        </span>
        <span className="truncate text-gray">{place?.name}</span>
      </div>

      {startAt ? (
        <>
          <p className="mt-3 text-[17px] font-semibold leading-[22px]">All set. We’ll start it for you.</p>
          <Plan start={start} ready={ready} note="as you arrive" />
          <div className="mt-3.5 flex gap-2">
            <button type="button" onClick={() => scheduleStart(order.id, undefined)} className="h-11 rounded-full bg-white px-4 text-[13.5px] text-ink active:scale-95">
              Change
            </button>
            <button type="button" onClick={startNow} className="h-11 flex-1 rounded-full bg-ink text-[14px] font-semibold text-white active:scale-[0.99]">
              Start cooking now
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-[17px] font-semibold leading-[22px]">When will you get there?</p>
          <p className="mt-0.5 text-[12.5px] leading-[18px] text-gray">
            It takes {prep} min to make{live && (live.items > 0 || live.rush > 0) ? ` (${breakdown(live)})` : ''}. We’ll time it so it’s fresh when you arrive.
          </p>

          <div className="mt-3 grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="When you'll get there">
            {ARRIVE_IN.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={arriveIn === m}
                onClick={() => setArriveIn(arriveIn === m ? null : m)}
                className={cx('flex h-12 flex-col items-center justify-center rounded-2xl transition-colors', arriveIn === m ? 'bg-ink text-white' : 'bg-white text-ink')}>
                <span className="text-[14px] font-semibold leading-4 tabular-nums">{m} min</span>
                <span className={cx('text-[10.5px] tabular-nums', arriveIn === m ? 'text-white/60' : 'text-gray')}>{clock(t0 + m * 60_000)}</span>
              </button>
            ))}
          </div>

          {arriveIn !== null && <Plan start={start} ready={ready} note={later ? 'as you arrive' : lateBy > 0 ? `${lateBy} min after you` : 'as you arrive'} />}

          <button
            type="button"
            onClick={() => {
              if (!later) return startNow();
              navigator.vibrate?.(10);
              scheduleStart(order.id, start);
            }}
            className="mt-3.5 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-white active:scale-[0.99]">
            {later ? `Start at ${clock(start)}` : `Start now · ready ${clock(t0 + prep * 60_000)}`}
          </button>
          {later && (
            <button type="button" onClick={startNow} className="mx-auto mt-2 block text-[12.5px] text-gray underline decoration-gray-light underline-offset-4">
              Or start cooking now
            </button>
          )}
        </>
      )}
    </section>
  );
}

/** The answer in plain words: when the kitchen starts, when it's ready. */
function Plan({ start, ready, note }: { start: number; ready: number; note: string }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5">
      <div className="rounded-2xl bg-white px-3.5 py-2.5">
        <p className="text-[11px] text-gray">Kitchen starts</p>
        <p className="text-[16px] font-semibold tabular-nums">{clock(start)}</p>
      </div>
      <div className="rounded-2xl bg-white px-3.5 py-2.5">
        <p className="text-[11px] text-gray">Ready</p>
        <p className="text-[16px] font-semibold tabular-nums">
          {clock(ready)} <span className="text-[11.5px] font-normal text-gray">{note}</span>
        </p>
      </div>
    </div>
  );
}
