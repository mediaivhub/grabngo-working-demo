'use client';

import { Check, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Price } from '@/components/ui';
import type { MerchantTheme, Product } from '@/data/mock';
import { r2, useWheel } from '@/lib/useWheel';
import { useWidth } from '@/lib/useWidth';
import { useStore } from '@/store/AppStore';

const HEIGHT = 540;
/** Relative thickness of a squeezed layer vs. the one in focus. */
const THIN = 0.13;
const FROSTING = 16;

/** A crumb is the sponge colour, a shade deeper. */
function deepen(hex: string, amount = 0.12) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `#${[ch(16), ch(8), ch(0)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Deterministic crumb positions for a layer, kept to the top and bottom edges so they never sit on text. */
function crumbsFor(seed: number) {
  let x = seed * 9301 + 49297;
  const rand = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 14 }, (_, k) => ({ left: 0.16 + rand() * 0.8, top: k % 2 ? 0.18 + rand() * 0.12 : 0.78 + rand() * 0.12, size: 2 + rand() * 2.5 }));
}

/** A soft wave of cream along the top edge of each layer. */
function Frosting({ width }: { width: number }) {
  const waves = Math.max(6, Math.round(width / 46));
  const w = width / waves;
  let d = `M0 0 H${width} V${FROSTING * 0.45}`;
  for (let i = waves; i > 0; i--) d += ` Q${i * w - w / 2} ${FROSTING} ${i * w - w} ${FROSTING * 0.45}`;
  return (
    <svg width={width} height={FROSTING} className="pointer-events-none absolute -top-px left-0 z-[2]" aria-hidden>
      <path d={`${d} Z`} fill="#FFFFFF" />
    </svg>
  );
}

/**
 * "Layer Cake": desserts stacked like cake layers seen from the side. The layer in focus swells
 * into a full photo slice; dragging up/down squeezes it and swells the next in one motion.
 */
export function DessertLayers({ items, placeId, theme }: { items: Product[]; placeId: string; theme: MerchantTheme }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [ref, width] = useWidth<HTMLDivElement>();
  const n = items.length;
  const { offset: focus, settle, handlers } = useWheel({ axis: 'y', pxPerStep: 90, max: n - 1, duration: 460 });
  const [added, setAdded] = useState<string | null>(null);
  const cakeW = width - 48;

  // Each layer's share of the cake: a smooth bump around the focused index.
  const weights = items.map((_, i) => THIN + Math.exp(-((i - focus) ** 2) * 2.4));
  const total = weights.reduce((a, b) => a + b, 0);
  const heights = weights.map((w) => (w / total) * HEIGHT);
  const tops = heights.map((_, i) => heights.slice(0, i).reduce((a, b) => a + b, 0));

  const add = (p: Product) => {
    addToCart({ productId: p.id, placeId });
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1400);
  };

  return (
    <div ref={ref} className="flex items-center gap-1.5 pl-4">
      <div className="no-select relative overflow-hidden rounded-[30px] bg-[#FFFDF9] shadow-[0_10px_18px_rgba(107,74,43,0.18)]" style={{ width: cakeW, height: HEIGHT }} {...handlers}>
        {items.map((item, i) => {
          const d = i - focus;
          const open = Math.max(0, 1 - Math.abs(d)); // 1 when this layer is in focus
          const isFocus = Math.abs(d) < 0.5;
          const sponge = theme.sponges[i % theme.sponges.length];
          const crumb = deepen(sponge);
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={item.name}
              onClick={() => (isFocus ? router.push(`/product/${item.id}?placeId=${placeId}`) : settle(i))}
              className="absolute inset-x-0 cursor-pointer overflow-hidden"
              style={{ top: r2(tops[i]), height: r2(heights[i] + 1), background: sponge }}>
              {open < 0.9 &&
                crumbsFor(i + 1).map((c, k) => (
                  <span key={k} className="pointer-events-none absolute rounded-full" style={{ left: `${c.left * 100}%`, top: `${c.top * 100}%`, width: c.size, height: c.size, background: crumb, opacity: 1 - open }} />
                ))}
              {/* Parallax: the photo drifts as its layer opens and closes. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.hero ?? item.image} alt="" draggable={false} className="pointer-events-none absolute inset-x-0 w-full object-cover" style={{ top: -40 + d * 26, bottom: -40 - d * 26, height: 'calc(100% + 80px)', opacity: open }} />
              <div className="pointer-events-none absolute inset-0" style={{ opacity: open, background: 'linear-gradient(rgba(0,0,0,0) 40%, rgba(0,0,0,0.7))' }} />
              {i > 0 && <Frosting width={cakeW} />}

              <div className="pointer-events-none absolute inset-y-0 left-4 right-5 flex items-center justify-between pt-1.5" style={{ opacity: Math.max(0, 1 - open * 1.6) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.hero ?? item.image} alt="" className="h-[38px] w-[38px] rounded-full border-2 border-white object-cover" />
                <span className="mx-3 flex-1 truncate text-[16px] font-medium text-text">{item.name}</span>
                <Price amount={item.price} color="var(--color-muted)" />
              </div>

              <div className="absolute bottom-[22px] left-[22px] right-[22px]" style={{ opacity: Math.max(0, open * 1.6 - 0.6), pointerEvents: isFocus ? 'auto' : 'none' }}>
                <p className="text-[12px] font-medium tracking-[2px] text-white/80">
                  {String(i + 1).padStart(2, '0')} — {String(n).padStart(2, '0')}
                </p>
                <p className="mt-1.5 text-[30px] font-bold leading-[34px] tracking-tight text-white">{item.name}</p>
                {item.tagline && <p className="mt-1.5 text-[15px] leading-5 text-white/90">{item.tagline}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex h-9 items-center rounded-full bg-white px-3.5">
                    <Price amount={item.price} size={17} color="var(--color-ink)" weight={500} />
                  </span>
                  <button
                    type="button"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      add(item);
                    }}
                    className={`flex h-[50px] w-[50px] items-center justify-center rounded-full transition-colors ${added === item.id ? 'bg-green text-white' : 'bg-white text-ink'}`}>
                    {added === item.id ? <Check size={24} /> : <Plus size={24} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex w-2.5 flex-col items-center gap-1.5" style={{ height: HEIGHT, justifyContent: 'center' }}>
        {items.map((item, i) => {
          const open = Math.max(0, 1 - Math.abs(i - focus));
          return (
            <button key={item.id} type="button" aria-label={`Show ${item.name}`} onClick={() => settle(i)} className="py-0.5">
              <span className="block w-1 rounded-full transition-colors" style={{ height: 8 + open * 22, background: open > 0.5 ? 'var(--color-muted)' : '#E2DAD2' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
