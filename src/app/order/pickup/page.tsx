'use client';

import { Clock, MapPin, Sparkles, Star } from 'lucide-react';
import { StylizedMap } from '@/components/StylizedMap';
import { NavHeader } from '@/components/ui';
import { getPlace } from '@/data/mock';
import { formatTime } from '@/lib/hours';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/AppStore';

export default function PickupLocationScreen() {
  const { activeOrder, orders } = useStore();
  const place = getPlace((activeOrder ?? orders[0])?.placeId) ?? getPlace('orfali')!;
  const now = useNow();
  const days = Array.from({ length: now ? 3 : 0 }, (_, i) => {
    const d = new Date(now!);
    d.setDate(d.getDate() + i);
    const r = place.schedule[d.getDay()];
    return { label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), hours: r ? `${formatTime(r[0])} - ${formatTime(r[1])}` : 'Closed' };
  });

  return (
    <main className="screen bg-surface">
      <div className="pt-safe relative z-10 rounded-b-[28px] bg-white">
        <NavHeader title="Pickup Location" fallback="/order/status" />
      </div>
      <div className="-mt-7 min-h-0 flex-1">
        <StylizedMap
          zoom={3}
          focus={place.map}
          renderMarkers={(project) => {
            const { left, top } = project(place.map);
            return (
              <div className="pointer-events-none">
                <span className="absolute h-[120px] w-[120px] rounded-full bg-black/[0.08]" style={{ left: left - 60, top: top - 60 }} />
                <div className="absolute flex w-[250px] items-center gap-3 rounded-full bg-black p-2.5 pr-6" style={{ left: left - 125, top: top - 110 }}>
                  <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#3A3A3A] text-white">
                    <Sparkles size={22} />
                  </span>
                  <span>
                    <span className="block text-[13px] text-[#9A9A9A]">You’re picking up at</span>
                    <span className="block max-w-[160px] truncate text-[19px] font-medium text-white">{place.name.split(' ').slice(0, 2).join(' ')}</span>
                  </span>
                </div>
                <span className="absolute h-[22px] w-0.5 bg-ink" style={{ left: left - 1, top: top - 34 }} />
                <span className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-white" style={{ left: left - 16, top: top - 16 }}>
                  <span className="h-2 w-2 rounded-full bg-ink" />
                </span>
              </div>
            );
          }}
        />
      </div>
      <div className="pb-safe -mt-6 relative z-10">
        <div className="mb-1.5 rounded-[28px] bg-white p-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-bold tracking-tight">Pickup Location</h1>
            <span className="flex h-7 items-center gap-1 rounded-lg bg-card px-1.5 text-[14px] font-medium text-gray">
              <Star size={15} fill="#F5A623" stroke="#F5A623" /> {place.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-5 flex items-center gap-4 text-[18px] leading-6">
            <MapPin size={26} className="shrink-0" /> {place.name}, {place.address}, UAE
          </p>
        </div>
        <div className="flex gap-4 rounded-[28px] bg-white p-5">
          <Clock size={26} className="shrink-0" />
          <div className="flex flex-1 flex-col gap-[18px]">
            {days.map((d) => (
              <div key={d.label} className="flex justify-between">
                <span className="text-[18px]">{d.label}</span>
                <span className="text-[16px] text-gray">{d.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
