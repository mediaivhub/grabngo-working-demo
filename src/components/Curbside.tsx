'use client';

import { Check, MapPin, MessageCircle, Navigation, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Car3DView, PlateBadge } from '@/components/car';
import { cx } from '@/components/ui';
import { getPlace, type Place } from '@/data/mock';
import { type Car, model3dFor, plateText } from '@/lib/car';
import { KitchenLine, shortName, StartButton } from '@/components/KitchenTiming';
import { ARRIVE_M, formatDistance, formatEta, type Journey, metresFor, useJourney } from '@/lib/journey';
import { useNow } from '@/lib/useNow';
import { isHeld, SPOTS, useStore, type Order } from '@/store/AppStore';

/** The restaurant screen writes this every few seconds while it's open. */
export const MERCHANT_SEEN_KEY = 'grabngo.merchant.seen';
const merchantOpen = () => {
  try {
    return Date.now() - Number(window.localStorage.getItem(MERCHANT_SEEN_KEY) ?? 0) < 6000;
  } catch {
    return false;
  }
};

/** "grey G 63": how a person would describe the car out loud. */
export const carSaid = (car: Car) => (car.color.custom ? `${car.make} ${car.model}` : `${car.color.name.toLowerCase()} ${car.model}`);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const ago = (at: number, now: number | null) => {
  if (!now) return 'just now';
  const s = Math.max(0, Math.round((now - at) / 1000));
  return s < 10 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)} min ago`;
};

/**
 * Curbside pickup, start to finish:
 * the drive in (live location, timed against the kitchen) → arrival (detected, no tap needed)
 * → "I'm in the grey G 63, left side" → "Ahmed is walking out" → handed over.
 */
export function Curbside({ order }: { order: Order }) {
  const { markArrived, patchOrder, walkOut, startKitchen } = useStore();
  const place = getPlace(order.placeId);
  const car = order.car!;
  const arrived = !!order.arrivedAt;
  const held = isHeld(order);
  const prepSec = order.hold?.prepSec ?? 0;
  // When the kitchen waits for the drive, the demo starts far enough out to show it starting on the way.
  const journey = useJourney(place, !arrived, order.hold ? metresFor(prepSec + 240) : undefined);
  const now = useNow(1000);
  const tracking = journey.metres !== null && journey.etaSec !== null && journey.mode !== 'far';

  // "When I'm on my way": the kitchen starts by itself once the drive left is about the prep time.
  // The demo runs sped up, so its kitchen finishes when the demo drive does.
  const fireNow = held && order.hold?.mode === 'arrive' && tracking && journey.etaSec! <= prepSec;
  const demoEnd = journey.demoEndsAt;
  useEffect(() => {
    if (fireNow) startKitchen(order.id, demoEnd ?? undefined);
  }, [fireNow, demoEnd, order.id, startKitchen]);
  // Pulled in before saying go: start it now.
  useEffect(() => {
    if (arrived && held) startKitchen(order.id);
  }, [arrived, held, order.id, startKitchen]);

  // Arrival is detected from location: no tap needed.
  const near = journey.metres !== null && journey.mode !== 'far' && journey.metres <= ARRIVE_M;
  useEffect(() => {
    if (near && !arrived) markArrived(order.id);
  }, [near, arrived, markArrived, order.id]);

  // Share the drive with the restaurant, only when what they'd see changes.
  const sent = useRef('');
  const tripM = journey.metres === null || journey.mode === 'far' ? null : Math.round(journey.metres / 50) * 50;
  const tripS = journey.etaSec === null ? null : Math.round(journey.etaSec / 15) * 15;
  const demo = journey.mode === 'demo';
  useEffect(() => {
    if (arrived || tripM === null || tripS === null) return;
    const key = `${tripM}|${tripS}|${demo}`;
    if (sent.current === key) return;
    sent.current = key;
    patchOrder(order.id, { trip: { m: tripM, s: tripS, at: Date.now(), demo } });
  }, [arrived, tripM, tripS, demo, order.id, patchOrder]);

  // With no restaurant screen open (a solo demo), someone walks out a few seconds after arrival,
  // once the order is actually ready.
  const staff = place?.staff[0] ?? 'Ahmed';
  const cooked = !held && (order.status === 'ready' || (now !== null && now >= order.readyAt));
  useEffect(() => {
    if (!arrived || !cooked || order.walkingAt) return;
    const t = setTimeout(() => {
      if (!merchantOpen()) walkOut(order.id, staff);
    }, 7000);
    return () => clearTimeout(t);
  }, [arrived, cooked, order.walkingAt, order.id, staff, walkOut]);

  return (
    <>
      <Stage order={order} car={car} arrived={arrived} />
      {arrived ? <Handoff order={order} car={car} place={place} /> : <Drive order={order} journey={journey} place={place} onArrived={() => markArrived(order.id)} />}
      <Link href="/merchant" target="_blank" className="mt-4 block text-center text-[12.5px] text-gray underline decoration-gray-light underline-offset-4">
        Demo: open the restaurant’s screen
      </Link>
    </>
  );
}

function Stage({ order, car, arrived }: { order: Order; car: Car; arrived: boolean }) {
  const model = model3dFor(car);
  return (
    <div
      className="relative mt-4 h-[280px] overflow-hidden rounded-[28px]"
      style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 78%, rgba(255,244,225,0.28), rgba(255,244,225,0) 70%), linear-gradient(#3a3a3e 0%, #232326 100%)' }}>
      <div className="absolute inset-x-4 top-4 z-[2] flex justify-between text-[13px] text-white">
        <span className="rounded-xl bg-white/12 px-2.5 py-1.5 backdrop-blur">{arrived ? `You’re in Bay ${order.bay ?? 3}` : `Curbside · Bay ${order.bay ?? 3}`}</span>
        <span className="rounded-xl bg-white/12 px-2.5 py-1.5 backdrop-blur">{plateText(car)}</span>
      </div>
      {model ? (
        <>
          <Car3DView key={model.uid} car={car} background={[0.17, 0.17, 0.18]} dark />
          {arrived && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-[#ff3b30]/25 to-transparent" />}
        </>
      ) : (
        <PlateBadge car={car} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />
      )}
    </div>
  );
}

/* ---------------- The drive in ---------------- */

function LiveTag({ mode }: { mode: Journey['mode'] }) {
  const on = mode === 'live' || mode === 'demo';
  const label = { live: 'Live location', demo: 'Demo drive', locating: 'Finding you', off: 'Location off', far: 'Live location' }[mode];
  return (
    <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        {on && <span className="live-ping absolute inset-0 rounded-full bg-green" />}
        <span className={cx('relative h-2.5 w-2.5 rounded-full', on ? 'bg-green' : 'bg-gray-light')} />
      </span>
      {label}
    </span>
  );
}

function Drive({ order, journey, place, onArrived }: { order: Order; journey: Journey; place?: Place; onArrived: () => void }) {
  const now = useNow(1000);
  const { mode, metres, etaSec } = journey;
  const tracking = metres !== null && etaSec !== null && mode !== 'far';
  const progress = tracking ? Math.min(1, Math.max(0, 1 - metres / Math.max(journey.startM, 1))) : 0;

  // Weigh the drive against the kitchen.
  const held = isHeld(order);
  const prepSec = order.hold?.prepSec ?? 0;
  const name = shortName(place?.name);
  let timing = '';
  if (held && tracking) {
    const wait = etaSec - prepSec;
    if (order.hold?.mode === 'arrive') timing = `${name} starts your order when you’re ${Math.round(prepSec / 60)} min away. Drive as you like.`;
    else if (wait > 60) timing = `You’re ${formatEta(etaSec)} away and they need ${Math.round(prepSec / 60)}. Tap Start in about ${Math.round(wait / 60)} min.`;
    else timing = `Start now and it’ll be ready as you pull in.`;
  } else if (order.hold?.mode === 'arrive' && tracking && order.status !== 'ready') {
    timing = `${name} started as you set off. Ready the moment you pull in.`;
  } else if (tracking && now) {
    const readyIn = (order.readyAt - now) / 1000;
    const diff = readyIn - etaSec;
    if (order.status === 'ready' || readyIn <= 0) timing = 'Your order is ready. It’s kept hot until you pull in.';
    else if (Math.abs(diff) <= 120) timing = 'Perfect timing. It’ll be ready as you pull in.';
    else if (diff > 0) timing = `You’ll be there about ${Math.round(diff / 60)} min before it’s ready. No rush.`;
    else timing = `It’ll be ready ${Math.round(-diff / 60)} min before you arrive. We’ll keep it hot.`;
  }

  return (
    <>
      <section className="mt-3 rounded-[28px] bg-surface p-5">
        <div className="flex items-center justify-between">
          <LiveTag mode={mode} />
          <span className="truncate pl-3 text-[13px] text-gray">To {place?.name}</span>
        </div>

        {tracking ? (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[34px] font-extrabold leading-10 tracking-tight tabular-nums">{formatEta(etaSec)}</span>
              <span className="text-[15px] text-gray">away · {formatDistance(metres)}</span>
            </div>
            {/* The road in: your car moving towards the restaurant */}
            <div className="relative mt-4 h-9">
              <div className="absolute inset-x-[14px] top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out" style={{ width: `${progress * 100}%` }} />
              </div>
              <span
                className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-white shadow-md ring-[3px] ring-white transition-[left] duration-700 ease-out"
                style={{ left: `calc(14px + (100% - 28px) * ${progress})` }}>
                <Navigation size={13} className="rotate-45" fill="currentColor" />
              </span>
              <span className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-brand text-white ring-[3px] ring-white">
                <Store size={14} />
              </span>
            </div>
            {order.hold && <KitchenLine order={order} />}
            <p className="mt-3 text-[14px] leading-5 text-ink/75">{timing}</p>
          </>
        ) : mode === 'locating' ? (
          <p className="mt-3 text-[15px] text-gray">Finding your location…</p>
        ) : (
          <>
            <p className="mt-3 text-[15px] font-medium leading-[21px] text-ink">
              {held
                ? mode === 'off'
                  ? `Location is off, so tap Start when you’re about ${Math.round(prepSec / 60)} min away.`
                  : `You’re ${formatDistance(metres ?? 0)} away. Tap Start when you’re about ${Math.round(prepSec / 60)} min out.`
                : mode === 'off'
                  ? 'Turn on location and we’ll time your order to your drive.'
                  : `You’re ${formatDistance(metres ?? 0)} away. Tracking starts as you head over.`}
            </p>
            <p className="mt-1 text-[13px] leading-[18px] text-gray">Keep this screen open while you drive. We’ll know the moment you pull in.</p>
            <div className="mt-4 flex gap-2">
              {mode === 'off' && (
                <button type="button" onClick={journey.retry} className="h-10 flex-1 rounded-full bg-ink text-[14px] font-semibold text-white active:scale-[0.98]">
                  Try again
                </button>
              )}
              <button type="button" onClick={journey.startDemo} className="h-10 flex-1 rounded-full bg-white text-[14px] font-semibold text-ink active:scale-[0.98]">
                Demo the drive
              </button>
            </div>
          </>
        )}
      </section>
      {held && (
        <div className="mt-3">
          <StartButton order={order} label={order.hold?.mode === 'arrive' && tracking ? 'Start it now instead' : 'Start my order'} />
        </div>
      )}
      <button type="button" onClick={onArrived} className="mt-3 h-[52px] w-full rounded-full bg-surface text-[15px] font-medium text-ink active:scale-[0.99]">
        Already here? Let them know
      </button>
    </>
  );
}

/* ---------------- Arrived: the handoff ---------------- */

function Steps({ step }: { step: 0 | 1 | 2 }) {
  const labels = ['Arrived', 'Walking out', 'With you'];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {labels.map((l, i) => (
        <div key={l}>
          <div className="h-1 overflow-hidden rounded-full bg-white">
            <div className={cx('h-full rounded-full bg-ink transition-[width] duration-700', i <= step ? 'w-full' : 'w-0')} />
          </div>
          <p className={cx('mt-1.5 text-[11.5px]', i <= step ? 'font-medium text-ink' : 'text-gray')}>{l}</p>
        </div>
      ))}
    </div>
  );
}

function Handoff({ order, car, place }: { order: Order; car: Car; place?: Place }) {
  const router = useRouter();
  const { user, handOver, setOrderStatus } = useStore();
  const now = useNow(5000);
  const items = order.lines.reduce((n, l) => n + l.qty, 0);
  const step = order.handedAt ? 2 : order.walkingAt ? 1 : 0;
  const first = user?.nickname && user.nickname !== 'Guest' ? user.nickname : user?.fullName?.split(' ')[0];

  return (
    <>
      <section className="mt-3 rounded-[28px] bg-surface p-5">
        <Steps step={step} />

        {order.handedAt ? (
          <div className="mt-5 flex items-center gap-3.5">
            <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-green text-white">
              <Check size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-[18px] font-semibold leading-6">Enjoy{first ? `, ${first}` : ''}.</p>
              <p className="text-[13.5px] text-gray">Handed over by {order.staff ?? 'the team'} · {ago(order.handedAt, now)}</p>
            </div>
          </div>
        ) : order.walkingAt ? (
          <>
            <div className="mt-5 flex items-center gap-3.5">
              <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-ink text-[20px] font-semibold text-white">{order.staff?.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-semibold leading-6">{order.staff} is walking out</p>
                <p className="text-[13.5px] text-gray">
                  With your {items} {items === 1 ? 'item' : 'items'}, to Bay {order.bay ?? 3}
                </p>
              </div>
              <Link href="/account/chat" aria-label={`Message ${order.staff}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white active:scale-95">
                <MessageCircle size={19} />
              </Link>
            </div>
            {/* From the door to your car */}
            <div className="relative mx-2 mt-5 flex items-center">
              <Store size={16} className="shrink-0 text-gray" />
              <div className="relative mx-2 h-0 flex-1 border-t-2 border-dashed border-gray-light">
                <span className="walk-dot absolute -top-[6px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-ink" />
              </div>
              <span className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white" style={{ background: car.color.hex }} />
            </div>
          </>
        ) : (
          <div className="mt-5">
            <p className="flex items-center gap-2 text-[18px] font-semibold leading-6">
              <span className="relative grid h-2.5 w-2.5 place-items-center">
                <span className="live-ping absolute inset-0 rounded-full bg-brand" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              {place?.name.split(' ')[0] === 'The' ? place?.name.split(' ')[1] : place?.name.split(' ')[0]} knows you’re here
            </p>
            <p className="mt-1 text-[13.5px] leading-[19px] text-gray">
              {now && order.status !== 'ready' && order.readyAt - now > 30_000
                ? `It’s being made now, about ${Math.ceil((order.readyAt - now) / 60_000)} min. They’ll bring it straight out. Stay in the car.`
                : 'Someone will be out with your order in a moment. Stay in the car.'}
            </p>
          </div>
        )}
      </section>

      {order.handedAt ? (
        <button
          type="button"
          onClick={() => {
            setOrderStatus(order.id, 'completed');
            router.replace(`/order/rate?id=${order.id}`);
          }}
          className="mt-3 h-[58px] w-full rounded-full bg-ink text-[17px] font-semibold text-white active:scale-[0.99]">
          Rate your order
        </button>
      ) : (
        <>
          <SpotTap order={order} car={car} />
          {order.walkingAt && (
            <button type="button" onClick={() => handOver(order.id)} className="mt-2.5 h-[52px] w-full rounded-full bg-surface text-[15px] font-medium text-ink active:scale-[0.99]">
              Got my order
            </button>
          )}
        </>
      )}
    </>
  );
}

/** One tap: "I'm in the grey G 63, left side". */
function SpotTap({ order, car }: { order: Order; car: Car }) {
  const { sendSpot } = useStore();
  const now = useNow(5000);
  const [pick, setPick] = useState<string>(order.spot?.label ?? SPOTS[0]);
  const isSent = order.spot?.label === pick;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => sendSpot(order.id, pick)}
        className={cx('flex h-[58px] w-full items-center justify-center gap-2 rounded-full px-5 text-[16px] font-semibold text-white transition-colors active:scale-[0.99]', isSent ? 'bg-green' : 'bg-ink')}>
        {isSent ? <Check size={19} className="shrink-0" /> : <MapPin size={18} className="shrink-0" />}
        <span className="truncate">
          I’m in the {carSaid(car)}, {lowerFirst(pick)}
        </span>
      </button>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {SPOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPick(s)}
            className={cx('h-8 rounded-full px-3 text-[13px] transition-colors', pick === s ? 'bg-ink/[0.08] font-medium text-ink' : 'text-gray')}>
            {s}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[12.5px] text-gray">{order.spot && isSent ? `Sent ${ago(order.spot.at, now)} · they know where you are` : 'One tap tells them exactly where you are'}</p>
    </div>
  );
}
