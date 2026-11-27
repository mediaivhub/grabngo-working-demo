'use client';

import { ArrowLeft, Check, Copy, Navigation, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StylizedMap } from '@/components/StylizedMap';
import { CircleButton, cx } from '@/components/ui';
import { getPlace } from '@/data/mock';
import { formatTime, openStatus } from '@/lib/hours';
import { distanceKm, driveMinutes } from '@/lib/pickup';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/AppStore';

/**
 * Where to pick up. The map does the talking; one quiet sheet holds the place, whether it's open,
 * how far it is, directions, and the next few days' hours.
 */
export default function PickupLocationScreen() {
  const router = useRouter();
  const { activeOrder, orders } = useStore();
  const order = activeOrder ?? orders[0];
  const place = getPlace(order?.placeId) ?? getPlace('orfali')!;
  const now = useNow(60_000);
  const [copied, setCopied] = useState(false);
  const address = `${place.name}, ${place.address}, UAE`;
  const status = now ? openStatus(place.schedule, new Date(now)) : null;

  const days = Array.from({ length: now ? 3 : 0 }, (_, i) => {
    const d = new Date(now!);
    d.setDate(d.getDate() + i);
    const r = place.schedule[d.getDay()];
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'long' }),
      hours: r ? `${formatTime(r[0])} – ${formatTime(r[1])}` : 'Closed',
      closed: !r,
    };
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <main className="screen bg-surface">
      {/* The map, edge to edge, with a floating back button */}
      <div className="relative min-h-0 flex-1">
        <StylizedMap
          zoom={3}
          focus={place.map}
          renderMarkers={(project) => {
            const { left, top } = project(place.map);
            return (
              <div className="pointer-events-none">
                <span className="live-ping absolute h-10 w-10 rounded-full bg-ink/15" style={{ left: left - 20, top: top - 20 }} />
                <span className="absolute grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]" style={{ left: left - 10, top: top - 10 }}>
                  <span className="h-2 w-2 rounded-full bg-ink" />
                </span>
                <div className="absolute flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink py-1.5 pl-1.5 pr-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.22)]" style={{ left, top: top - 58 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={place.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="whitespace-nowrap text-[13.5px] font-medium text-white">{place.name}</span>
                </div>
                <span className="absolute h-3 w-px bg-ink" style={{ left: left - 0.5, top: top - 22 }} />
              </div>
            );
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
        <CircleButton label="Back" variant="white" size={42} onClick={() => router.back()} className="absolute left-4" style={{ top: 'calc(var(--safe-top) + 10px)' }}>
          <ArrowLeft size={19} />
        </CircleButton>
      </div>

      {/* The sheet */}
      <section className="pb-safe relative z-10 -mt-7 rounded-t-[28px] bg-white px-5 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray">Pickup{order ? ` · #${order.id.replace('GNG-', '')}` : ''}</p>

        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[19px] font-semibold leading-6 tracking-tight">{place.name}</h1>
              <span className="flex shrink-0 items-center gap-0.5 text-[12.5px] font-medium text-ink/70">
                <Star size={12} fill="#F5A623" stroke="#F5A623" /> {place.rating.toFixed(1)}
              </span>
            </div>
            <p className="truncate text-[13px] text-gray">{place.address}, UAE</p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-2 text-[12.5px]">
          {status && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1">
              <span className={cx('h-1.5 w-1.5 rounded-full', status.open ? 'bg-green' : 'bg-gray-light')} />
              <span className="font-medium text-ink">{status.open ? 'Open now' : 'Closed now'}</span>
              {status.open && <span className="text-gray">{status.label.replace('til', 'until')}</span>}
            </span>
          )}
          <span className="rounded-full bg-surface px-2.5 py-1 text-ink/80">
            {distanceKm(place)} km · {driveMinutes(place)} min drive
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.geo.lat},${place.geo.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white active:scale-[0.99]">
            <Navigation size={16} className="rotate-45" fill="currentColor" /> Directions
          </a>
          <button type="button" onClick={copy} className="flex h-12 items-center gap-2 rounded-full bg-surface px-5 text-[14px] font-medium text-ink active:scale-95">
            {copied ? <Check size={16} className="text-green" /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>

        <div className="mb-4 mt-5 border-t border-dashed border-divider pt-3">
          {days.map((d, i) => (
            <div key={d.label} className="flex items-center justify-between py-1.5 text-[13.5px]">
              <span className={i === 0 ? 'font-medium text-ink' : 'text-ink/70'}>{d.label}</span>
              <span className={cx('tabular-nums', d.closed ? 'text-gray-light' : i === 0 ? 'text-ink' : 'text-gray')}>{d.hours}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
