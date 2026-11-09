'use client';

import { Minus, Navigation, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/cards';
import { StylizedMap } from '@/components/StylizedMap';
import { orbs, SearchBar } from '@/components/ui';
import { places, USER_MAP_POSITION } from '@/data/mock';
import { requestLocation } from '@/lib/permissions';

const ZOOMS = [1, 2.2, 3.4];
/** Above this zoom, dots turn into named pins. */
const PIN_ZOOM = 2;

export default function MapScreen() {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [query, setQuery] = useState('');
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

  const q = query.trim().toLowerCase();
  const visible = q ? places.filter((p) => p.name.toLowerCase().includes(q)) : places;

  return (
    <>
      <AppHeader />
      <SearchBar value={query} onChange={setQuery} className="mx-5 mb-3" />
      <div className="relative min-h-0 flex-1">
        <StylizedMap
          zoom={zoom}
          focus={zoomIndex === 0 ? { x: 0.5, y: 0.5 } : USER_MAP_POSITION}
          renderMarkers={(project, z) => (
            <>
              {visible.map((p) => {
                const { left, top } = project(p.map);
                return z >= PIN_ZOOM ? (
                  <Link key={p.id} href={`/restaurant/${p.id}`} aria-label={p.name} className="absolute flex w-[120px] flex-col items-center fade-in" style={{ left: left - 60, top: top - 56 }}>
                    <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[3px] border-white bg-surface shadow-md">
                      <Sparkles size={20} />
                    </span>
                    <span className="-mt-1.5 h-2.5 w-2.5 rotate-45 bg-white" />
                    <span className="mt-1 truncate text-[13px] font-medium text-ink [text-shadow:0_0_4px_#fff]">{p.name.replace(/ by .*/, '')}</span>
                  </Link>
                ) : (
                  <button key={p.id} type="button" aria-label={p.name} onClick={() => setZoomIndex(1)} className="absolute h-3.5 w-3.5 rounded-full bg-black" style={{ left: left - 7, top: top - 7 }} />
                );
              })}
              {z >= PIN_ZOOM && (() => {
                const me = project(USER_MAP_POSITION);
                return (
                  <div className="pointer-events-none absolute flex w-24 flex-col items-center" style={{ left: me.left - 48, top: me.top - 70 }}>
                    <span className="absolute top-11 h-24 w-24 rounded-full bg-black/[0.08]" />
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={orbs.location} alt="You are here" className="h-[82px] w-[82px]" />
                    </span>
                  </div>
                );
              })()}
            </>
          )}
        />
        <div className="absolute right-[18px] top-6 w-[52px] overflow-hidden rounded-full bg-white shadow-md">
          <button type="button" aria-label="Zoom in" onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOMS.length - 1))} className="flex h-[52px] w-full items-center justify-center">
            <Plus size={24} />
          </button>
          <div className="h-px bg-divider" />
          <button type="button" aria-label="Zoom out" onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))} className="flex h-[52px] w-full items-center justify-center">
            <Minus size={24} />
          </button>
        </div>
        <Link href="/places/nearest" className="absolute bottom-4 left-1/2 flex h-14 -translate-x-1/2 items-center gap-3 rounded-full bg-white pl-2 pr-5 shadow-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Navigation size={18} />
          </span>
          <span className="whitespace-nowrap text-[18px] text-ink">Find the nearest</span>
        </Link>
      </div>
    </>
  );
}
