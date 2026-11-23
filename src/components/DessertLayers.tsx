'use client';

import { Check, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Price } from '@/components/ui';
import type { MerchantTheme, Product } from '@/data/mock';
import { r2, useWheel } from '@/lib/useWheel';
import { useStore } from '@/store/AppStore';

/** Height of the front card, and how far each card behind peeks out below it. */
const CARD_H = 420;
const PEEK = 24;
const SHOWN_BEHIND = 3;

/**
 * "Dessert stack": desserts as full-photo cards stacked like a deck. The cards behind peek out
 * below, smaller and dimmer; dragging up lifts the front card away and brings the next one
 * forward, its photo settling from a slow zoom. Tap a card behind to bring it forward.
 */
export function DessertLayers({ items, placeId }: { items: Product[]; placeId: string; theme?: MerchantTheme }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const n = items.length;
  const { offset: focus, settle, handlers } = useWheel({ axis: 'y', pxPerStep: 110, max: n - 1, duration: 520 });
  const [added, setAdded] = useState<string | null>(null);

  const add = (p: Product) => {
    addToCart({ productId: p.id, placeId });
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1400);
  };

  return (
    <div className="flex items-start gap-3 px-5">
      <div className="no-select relative flex-1" style={{ height: CARD_H + PEEK * SHOWN_BEHIND + 6 }} {...handlers}>
        {items.map((item, i) => {
          const d = i - focus; // <0 lifted away, 0 front, >0 waiting behind
          const front = Math.max(0, 1 - Math.abs(d)); // 1 when this is the front card
          const isFront = Math.abs(d) < 0.5;
          if (d > SHOWN_BEHIND + 0.5 || d < -1.2) return null;

          // Behind: step down, shrink and dim. Lifted away: rise, grow a touch and fade.
          const y = d >= 0 ? d * PEEK : d * 90;
          const scale = d >= 0 ? 1 - d * 0.055 : 1 - d * 0.04;
          const opacity = d >= 0 ? (d > SHOWN_BEHIND ? Math.max(0, SHOWN_BEHIND + 0.5 - d) * 2 : 1) : Math.max(0, 1 + d * 1.4);
          const dim = d > 0 ? Math.min(0.5, d * 0.16) : 0;

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={item.name}
              onClick={() => (isFront ? router.push(`/product/${item.id}?placeId=${placeId}`) : settle(i))}
              className="absolute inset-x-0 top-0 cursor-pointer overflow-hidden rounded-[28px] bg-[#1d1a18]"
              style={{
                height: CARD_H,
                transform: `translateY(${r2(y)}px) scale(${r2(scale * 1000) / 1000})`,
                transformOrigin: '50% 100%',
                opacity: r2(opacity * 100) / 100,
                zIndex: n - i,
                boxShadow: isFront ? '0 22px 40px -14px rgba(40,24,12,0.45)' : '0 10px 24px -12px rgba(40,24,12,0.35)',
              }}>
              {/* Photo settles from a slow zoom as its card comes forward */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.hero ?? item.image}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ transform: `scale(${r2((1.12 - front * 0.12) * 1000) / 1000})` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0)_28%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.78)_100%)]" />
              {dim > 0 && <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />}

              {/* Top label */}
              <p className="pointer-events-none absolute left-5 top-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85" style={{ opacity: front }}>
                Dessert {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </p>

              {/* Details on the front card */}
              <div className="absolute inset-x-5 bottom-5" style={{ opacity: Math.max(0, front * 1.5 - 0.5), transform: `translateY(${r2((1 - front) * 14)}px)`, pointerEvents: isFront ? 'auto' : 'none' }}>
                <p className="text-[28px] font-bold leading-[32px] tracking-tight text-white">{item.name}</p>
                {item.tagline && <p className="mt-1.5 line-clamp-2 text-[14px] leading-5 text-white/80">{item.tagline}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex h-10 items-center rounded-full border border-white/25 bg-white/15 px-4 backdrop-blur-md">
                    <Price amount={item.price} size={17} color="#fff" weight={600} />
                  </span>
                  <button
                    type="button"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      add(item);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors active:scale-90 ${added === item.id ? 'bg-green text-white' : 'bg-white text-ink'}`}>
                    {added === item.id ? <Check size={22} /> : <Plus size={22} />}
                  </button>
                </div>
              </div>

              {/* On cards behind: just the name, on the strip that peeks out */}
              <p className="pointer-events-none absolute inset-x-5 bottom-2 truncate text-[13px] font-medium text-white/90" style={{ opacity: d > 0.3 ? Math.min(1, (d - 0.3) * 2) : 0 }}>
                {item.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Slim progress line */}
      <div className="relative mt-2 w-[3px] rounded-full bg-[#E9E4DE]" style={{ height: CARD_H - 16 }} aria-hidden>
        <span className="absolute left-0 w-[3px] rounded-full bg-ink transition-[top] duration-150" style={{ height: r2((CARD_H - 16) / n), top: r2((Math.min(Math.max(focus, 0), n - 1) * (CARD_H - 16)) / n) }} />
      </div>
    </div>
  );
}
