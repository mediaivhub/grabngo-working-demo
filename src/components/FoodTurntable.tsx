'use client';

import { Check, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Price } from '@/components/ui';
import type { MerchantTheme, Product } from '@/data/mock';
import { r2, useWheel, wrapDelta } from '@/lib/useWheel';
import { useWidth } from '@/lib/useWidth';
import { useStore } from '@/store/AppStore';

/** Angle between neighbouring dishes on the table rim, in radians. */
const STEP = (34 * Math.PI) / 180;
/** Dishes further than this many steps from the front are hidden. */
const VISIBLE = 1.7;
const HEIGHT = 470;

/**
 * "Lazy Susan": a rotating serving table half off the left edge. Dragging up/down spins the
 * table; each plate also spins as it travels. The front dish is large, with details beside it.
 */
export function FoodTurntable({ items, placeId, theme }: { items: Product[]; placeId: string; theme: MerchantTheme }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [ref, width] = useWidth<HTMLDivElement>();
  const { offset, settle, handlers, current } = useWheel({ axis: 'y', pxPerStep: 110, fling: 140, easing: 'back', duration: 520 });
  const [added, setAdded] = useState<string | null>(null);
  const n = items.length;

  const dish = Math.round(width * 0.42);
  const radius = width * 0.78;
  const cx = -width * 0.46; // table centre sits off-screen to the left
  const cy = HEIGHT / 2;
  const activeIndex = ((Math.round(offset) % n) + n) % n;
  const active = items[activeIndex];
  const tableAngle = -offset * STEP;
  const infoLeft = cx + radius + dish / 2 + 16;

  const add = () => {
    addToCart({ productId: active.id, placeId });
    setAdded(active.id);
    setTimeout(() => setAdded((a) => (a === active.id ? null : a)), 1400);
  };

  return (
    <div ref={ref} className="no-select relative overflow-hidden" style={{ height: HEIGHT }} {...handlers}>
      <svg width={width} height={HEIGHT} className="pointer-events-none absolute inset-0" aria-hidden>
        <circle cx={cx} cy={cy} r={radius + 78} fill={theme.table} />
        <circle cx={cx} cy={cy} r={radius + 78} stroke="#EBDFD1" strokeWidth={2} fill="none" />
        <circle cx={cx} cy={cy} r={radius} stroke="#E8DCCD" strokeWidth={1.5} strokeDasharray="4 8" fill="none" />
        <circle cx={cx} cy={cy} r={radius - 96} fill="rgba(90,60,30,0.035)" />
        {Array.from({ length: 72 }, (_, k) => {
          const a = (k * 5 * Math.PI) / 180 + tableAngle;
          const long = k % 6 === 0;
          const r1 = radius + (long ? 58 : 64);
          const rOut = radius + 72;
          return <line key={k} x1={r2(cx + r1 * Math.cos(a))} y1={r2(cy + r1 * Math.sin(a))} x2={r2(cx + rOut * Math.cos(a))} y2={r2(cy + rOut * Math.sin(a))} stroke={long ? '#D9C7B3' : '#E8DCCD'} strokeWidth={long ? 2 : 1} />;
        })}
      </svg>

      {items.map((item, i) => {
        const d = wrapDelta(i, offset, n);
        if (Math.abs(d) > VISIBLE) return null;
        const theta = d * STEP;
        const x = cx + radius * Math.cos(theta);
        const y = cy + radius * Math.sin(theta);
        const size = dish * (1 - Math.min(Math.abs(d), 1.5) * 0.36);
        const isFront = Math.abs(d) < 0.5;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.name}
            onClick={() => (isFront ? router.push(`/product/${item.id}?placeId=${placeId}`) : settle(current() + Math.round(d)))}
            className="absolute rounded-full bg-white p-1.5 shadow-[0_8px_14px_rgba(107,74,43,0.22)]"
            style={{
              width: r2(size),
              height: r2(size),
              left: r2(x - size / 2),
              top: r2(y - size / 2),
              opacity: Math.min(1, (VISIBLE - Math.abs(d)) / 0.5),
              zIndex: isFront ? 3 : 1,
              // Plates spin as the table turns.
              transform: `rotate(${r2(-d * 110)}deg)`,
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" draggable={false} className="h-full w-full rounded-full object-cover" />
          </button>
        );
      })}

      <div className="absolute" style={{ left: infoLeft, top: cy - 92, width: width - infoLeft - 16 }}>
        <p className="text-[12px] font-medium tracking-[1px] text-gray">
          {String(activeIndex + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </p>
        <p key={active.id} className="mt-1.5 line-clamp-2 text-[21px] font-semibold leading-6 tracking-tight text-ink fade-in">
          {active.name}
        </p>
        {active.tagline && <p className="mt-1.5 line-clamp-3 text-[13px] leading-[18px] text-gray">{active.tagline}</p>}
        <Price amount={active.price} size={19} color="var(--color-ink)" weight={500} className="mt-2.5" />
        <button
          type="button"
          aria-label={`Add ${active.name} to cart`}
          onClick={add}
          className={`mt-3 flex h-9 items-center gap-1 rounded-full px-3.5 text-[14px] font-medium text-white transition-colors ${added === active.id ? 'bg-green' : 'bg-black'}`}>
          {added === active.id ? <Check size={17} /> : <Plus size={17} />}
          {added === active.id ? 'Added' : 'Add'}
        </button>
      </div>

      <div className="absolute right-4 top-4 flex gap-2">
        <button type="button" aria-label="Previous dish" onClick={() => settle(Math.round(current()) - 1)} className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-divider bg-white">
          <ChevronUp size={18} />
        </button>
        <button type="button" aria-label="Next dish" onClick={() => settle(Math.round(current()) + 1)} className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-divider bg-white">
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}
