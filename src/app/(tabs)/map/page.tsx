'use client';

import { ChevronRight, LocateFixed, Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/cards';
import { StylizedMap } from '@/components/StylizedMap';
import { cx, SearchBar } from '@/components/ui';
import { places, USER_MAP_POSITION, type Place } from '@/data/mock';
import { openStatus } from '@/lib/hours';
import { requestLocation } from '@/lib/permissions';
import { distanceKm, readyMinutes } from '@/lib/pickup';
import { useNow } from '@/lib/useNow';

const ZOOMS = [1, 2.2, 3.4];
type Filter = 'all' | 'open' | 'cafe' | 'restaurant';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open now' },
  { id: 'cafe', label: 'Cafés' },
  { id: 'restaurant', label: 'Restaurants' },
];

/**
 * The map: every place as a small photo pin, you as a quiet pulsing dot. Tap a pin (or a card)
 * and the map flies to it with a preview; the strip at the bottom lists what's nearest.
 */
export default function MapScreen() {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const now = useNow(60_000);
  const zoom = ZOOMS[zoomIndex];

  // Ask for location the first time the map is opened.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        if (p.state === 'prompt') void requestLocation();
      })
      .catch(() => {});
  }, []);

  const isOpen = (p: Place) => (now ? openStatus(p.schedule, new Date(now)).open : true);
  const q = query.trim().toLowerCase();
  const visible = places
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .filter((p) => (filter === 'open' ? isOpen(p) : filter === 'all' ? true : p.kind === filter))
    .sort((a, b) => distanceKm(a) - distanceKm(b));
  const picked = visible.find((p) => p.id === selected) ?? null;

  const flyTo = (p: Place) => {
    setSelected(p.id);
    setFocus({ ...p.map });
    setZoomIndex((i) => Math.max(i, 1));
  };
  const locate = () => {
    setSelected(null);
    setFocus({ ...USER_MAP_POSITION });
    setZoomIndex(1);
  };

  return (
    <>
      <AppHeader />
      <SearchBar value={query} onChange={setQuery} placeholder="Search places" className="mx-5" />
      <div className="hscroll mt-2.5 gap-1.5 px-5 pb-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cx('h-8 shrink-0 rounded-full px-3.5 text-[13px] transition-colors', filter === f.id ? 'bg-ink font-medium text-white' : 'bg-surface text-ink/75')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <StylizedMap
          zoom={zoom}
          focus={focus}
          renderMarkers={(project, z) => (
            <>
              {/* You */}
              {(() => {
                const me = project(USER_MAP_POSITION);
                return (
                  <div className="pointer-events-none absolute" style={{ left: me.left, top: me.top }}>
                    <span className="live-ping absolute -left-5 -top-5 h-10 w-10 rounded-full bg-[#0a84ff]/25" />
                    <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-[3px] border-white bg-[#0a84ff] shadow-[0_2px_6px_rgba(0,0,0,0.25)]" />
                  </div>
                );
              })()}
              {visible.map((p) => {
                const { left, top } = project(p.map);
                const on = p.id === selected;
                const s = on ? 44 : z >= 2 ? 34 : 26;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={p.name}
                    onClick={() => flyTo(p)}
                    className={cx('absolute transition-[left,top] duration-500', on ? 'z-20' : 'z-10')}
                    style={{ left: left - s / 2, top: top - s / 2 }}>
                    <span
                      className={cx('relative block overflow-hidden rounded-full border-2 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.22)] transition-all duration-300', on ? 'border-ink' : 'border-white', !isOpen(p) && 'grayscale')}
                      style={{ width: s, height: s }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    {(on || z >= 3) && (
                      <span className={cx('absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium shadow-sm', on ? 'bg-ink text-white' : 'bg-white/90 text-ink')}>
                        {p.name.replace(/ by .*/, '')}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        />

        {/* Controls */}
        <div className="absolute right-4 top-3 z-30 flex flex-col gap-2">
          <div className="w-10 overflow-hidden rounded-full bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.12)] backdrop-blur">
            <button type="button" aria-label="Zoom in" onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOMS.length - 1))} className="grid h-10 w-full place-items-center active:bg-surface">
              <Plus size={18} />
            </button>
            <div className="mx-2.5 h-px bg-divider" />
            <button type="button" aria-label="Zoom out" onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))} className="grid h-10 w-full place-items-center active:bg-surface">
              <Minus size={18} />
            </button>
          </div>
          <button type="button" aria-label="Show my location" onClick={locate} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#0a84ff] shadow-[0_2px_10px_rgba(0,0,0,0.12)] backdrop-blur active:scale-95">
            <LocateFixed size={18} />
          </button>
        </div>

        {/* Bottom: the picked place, or the nearest few */}
        <div className="absolute inset-x-0 bottom-3 z-30">
          {picked ? (
            <div className="fade-in mx-3 flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={picked.image} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15.5px] font-semibold leading-5">{picked.name}</p>
                <Meta place={picked} open={isOpen(picked)} />
              </div>
              <Link href={`/restaurant/${picked.id}`} className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-ink pl-4 pr-3 text-[13.5px] font-semibold text-white active:scale-95">
                Order <ChevronRight size={15} />
              </Link>
              <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="absolute -top-2.5 right-5 grid h-6 w-6 place-items-center rounded-full bg-white text-gray shadow-sm">
                <X size={13} />
              </button>
            </div>
          ) : visible.length ? (
            <div className="hscroll gap-2 px-3">
              {visible.slice(0, 8).map((p, i) => (
                <button key={p.id} type="button" onClick={() => flyTo(p)} className="flex w-[228px] shrink-0 items-center gap-2.5 rounded-[20px] bg-white p-2.5 text-left shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold">{p.name}</span>
                      {i === 0 && <span className="shrink-0 rounded-full bg-surface px-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray">Nearest</span>}
                    </span>
                    <Meta place={p} open={isOpen(p)} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mx-auto w-fit rounded-full bg-white px-4 py-2 text-[13px] text-gray shadow-sm">No places match</p>
          )}
        </div>
      </div>
    </>
  );
}

function Meta({ place, open }: { place: Place; open: boolean }) {
  return (
    <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-gray">
      <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', open ? 'bg-green' : 'bg-gray-light')} />
      <span className="truncate">{open ? `Ready in ${readyMinutes(place)} min` : 'Closed now'} · {distanceKm(place)} km</span>
    </span>
  );
}
