'use client';

import { Check, Footprints, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Car3DView, PlateBadge } from '@/components/car';
import { ago, MERCHANT_SEEN_KEY } from '@/components/Curbside';
import { useStatusBarTone } from '@/components/StatusBarTone';
import { cx } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { carName, model3dFor } from '@/lib/car';
import { formatDistance, formatEta } from '@/lib/journey';
import { useNow } from '@/lib/useNow';
import { useStore, type Order } from '@/store/AppStore';

/**
 * The restaurant's curbside screen (a staff phone or a tablet at the door).
 * Each car shows up as it drives in: its 3D model, plate, bay and where it parked.
 * Arrived cars pulse until someone walks out. Syncs live with the customer app on this device.
 */
export default function MerchantScreen() {
  const { orders } = useStore();
  const now = useNow(1000);
  useStatusBarTone('light');

  // Tell the customer app a person is watching, so it doesn't auto-walk the order out.
  useEffect(() => {
    const beat = () => {
      try {
        window.localStorage.setItem(MERCHANT_SEEN_KEY, String(Date.now()));
      } catch {}
    };
    beat();
    const t = setInterval(beat, 2000);
    return () => {
      clearInterval(t);
      try {
        window.localStorage.removeItem(MERCHANT_SEEN_KEY);
      } catch {}
    };
  }, []);

  const rank = (o: Order) => (o.handedAt ? 3 : o.walkingAt ? 1 : o.arrivedAt ? 0 : 2);
  const list = orders
    .filter((o) => o.car && o.status !== 'completed')
    .sort((a, b) => rank(a) - rank(b) || (a.arrivedAt ?? 0) - (b.arrivedAt ?? 0) || (a.trip?.s ?? 1e9) - (b.trip?.s ?? 1e9));
  const waiting = list.filter((o) => o.arrivedAt && !o.walkingAt).length;
  const place = getPlace(list[0]?.placeId ?? 'orfali');

  return (
    <main className="screen pt-safe text-white" style={{ background: "#0e0e0f" }}>
      <header className="flex items-end justify-between px-5 pb-3 pt-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45">{place?.name} · Staff</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight">Curbside</h1>
        </div>
        <div className="flex items-center gap-2">
          {waiting > 0 && <span className="rounded-full bg-[#ff3b30] px-2.5 py-1 text-[12.5px] font-semibold">{waiting} waiting</span>}
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12.5px] tabular-nums text-white/80">
            {now ? new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
        </div>
      </header>

      <div className="scroll pb-safe space-y-3 px-4 pb-8">
        {list.length === 0 ? (
          <div className="mt-24 px-6 text-center">
            <p className="text-[18px] font-semibold">No cars on the way</p>
            <p className="mt-2 text-[14px] leading-5 text-white/50">Curbside orders appear here the moment they’re placed, and move to the top when the car pulls in.</p>
          </div>
        ) : (
          list.map((o) => <CarCard key={o.id} order={o} now={now} />)
        )}
      </div>
    </main>
  );
}

function CarCard({ order, now }: { order: Order; now: number | null }) {
  const { walkOut, handOver, setOrderStatus } = useStore();
  const place = getPlace(order.placeId);
  const car = order.car!;
  const model = model3dFor(car);
  const staffList = place?.staff ?? ['Ahmed'];
  const [staff, setStaff] = useState(staffList[0]);
  const arrived = !!order.arrivedAt;
  const needsSomeone = arrived && !order.walkingAt;
  const prepLeft = now ? Math.max(0, Math.ceil((order.readyAt - now) / 1000)) : null;
  const ready = order.status === 'ready' || prepLeft === 0;

  let state: { text: string; tone: string };
  if (order.handedAt) state = { text: `Handed over ${ago(order.handedAt, now)}`, tone: 'bg-green text-white' };
  else if (order.walkingAt) state = { text: `${order.staff} walking out`, tone: 'bg-white text-black' };
  else if (arrived) state = { text: `Arrived ${ago(order.arrivedAt!, now)}`, tone: 'bg-[#ff3b30] text-white' };
  else if (order.trip) state = { text: `${formatEta(order.trip.s)} away · ${formatDistance(order.trip.m)}`, tone: 'bg-white/12 text-white' };
  else state = { text: 'On the way', tone: 'bg-white/12 text-white' };

  return (
    <article className={cx('overflow-hidden rounded-[28px] bg-[#1b1b1d]', needsSomeone ? 'arrive-pulse' : 'ring-1 ring-white/[0.06]')}>
      <div className="relative h-[200px]" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 78%, rgba(255,244,225,0.22), rgba(255,244,225,0) 70%), linear-gradient(#2c2c30, #1b1b1d)' }}>
        <div className="pointer-events-none absolute left-4 top-3.5 z-[2]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Bay</p>
          <p className="text-[44px] font-black leading-[44px] tabular-nums">{order.bay ?? 3}</p>
        </div>
        <span className={cx('absolute right-3.5 top-3.5 z-[2] rounded-full px-2.5 py-1 text-[12.5px] font-semibold', state.tone)}>{state.text}</span>
        {model ? <Car3DView key={model.uid} car={car} background={[0.15, 0.15, 0.16]} dark /> : <PlateBadge car={car} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />}
      </div>

      <div className="p-4 pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[17px] font-semibold">{carName(car)}</p>
          <p className="shrink-0 text-[12.5px] tabular-nums text-white/45">#{order.id.replace('GNG-', '')}</p>
        </div>

        {order.spot && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#ffd60a] px-3 py-1.5 text-[13.5px] font-semibold text-black">
            <MapPin size={14} /> {order.spot.label}
            <span className="font-normal text-black/55">· {ago(order.spot.at, now)}</span>
          </p>
        )}

        <p className="mt-3 text-[13.5px] leading-5 text-white/70">
          {order.lines.map((l) => `${l.qty}× ${getProduct(l.productId)?.name}${l.unitPrice === 0 ? ' (invitation)' : ''}`).join(' · ')}
        </p>
        <p className={cx('mt-1 text-[12.5px]', ready ? 'text-green' : 'text-white/45')}>
          {ready ? 'Ready to go out' : `Kitchen · ready in ${prepLeft === null ? '--' : `${Math.floor(prepLeft / 60)}:${String(prepLeft % 60).padStart(2, '0')}`}`}
          {order.trip?.demo && !arrived ? ' · demo drive' : ''}
        </p>

        {order.handedAt ? (
          <button type="button" onClick={() => setOrderStatus(order.id, 'completed')} className="mt-4 h-11 w-full rounded-full bg-white/10 text-[14px] font-medium text-white/80 active:scale-[0.99]">
            Clear
          </button>
        ) : order.walkingAt ? (
          <button type="button" onClick={() => handOver(order.id)} className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-green text-[16px] font-semibold active:scale-[0.99]">
            <Check size={19} /> Handed over
          </button>
        ) : (
          <>
            <div className="mt-4 flex gap-1.5">
              {staffList.map((s) => (
                <button key={s} type="button" onClick={() => setStaff(s)} className={cx('h-8 rounded-full px-3 text-[13px] transition-colors', staff === s ? 'bg-white font-medium text-black' : 'bg-white/8 text-white/70')}>
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => walkOut(order.id, staff)}
              className={cx('mt-2.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold active:scale-[0.99]', needsSomeone ? 'bg-[#ff3b30] text-white' : 'bg-white text-black')}>
              <Footprints size={18} /> {staff} walks out to Bay {order.bay ?? 3}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
