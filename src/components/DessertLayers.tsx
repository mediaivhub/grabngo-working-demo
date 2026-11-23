'use client';

import { Check, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Price } from '@/components/ui';
import type { MerchantTheme, Product } from '@/data/mock';
import { r2, useWheel } from '@/lib/useWheel';
import { useWidth } from '@/lib/useWidth';
import { useStore } from '@/store/AppStore';

const HEIGHT = 500;
const PLATE = 236;

/** Average colour of a photo (sampled small), so each dessert's backdrop matches its own palette. */
function useImageTints(srcs: string[]) {
  const [tints, setTints] = useState<Record<string, [number, number, number]>>({});
  const key = srcs.join('|');
  useEffect(() => {
    let live = true;
    for (const src of key.split('|')) {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 24;
          const g = c.getContext('2d', { willReadFrequently: true })!;
          g.drawImage(img, 0, 0, 24, 24);
          const d = g.getImageData(0, 0, 24, 24).data;
          let [r, gg, b, n] = [0, 0, 0, 0];
          for (let i = 0; i < d.length; i += 4) {
            const [R, G, B] = [d[i], d[i + 1], d[i + 2]];
            const sat = Math.max(R, G, B) - Math.min(R, G, B);
            const w = 1 + sat / 40; // favour the colourful pixels over grey table/plate
            r += R * w;
            gg += G * w;
            b += B * w;
            n += w;
          }
          if (live) setTints((t) => ({ ...t, [src]: [r / n, gg / n, b / n] }));
        } catch {}
      };
      img.src = src;
    }
    return () => {
      live = false;
    };
  }, [key]);
  return tints;
}

/** Soft, light wash of a colour (mixed with cream) for the backdrop. */
const wash = ([r, g, b]: [number, number, number], k = 0.72) => [r + (252 - r) * k, g + (248 - g) * k, b + (243 - b) * k] as const;
const deep = ([r, g, b]: [number, number, number]) => `rgb(${Math.round(r * 0.45)},${Math.round(g * 0.45)},${Math.round(b * 0.45)})`;

function splitName(name: string): [string, string] {
  const words = name.split(' ');
  if (words.length < 2) return [name, name];
  return [words[0], words.slice(1).join(' ')];
}

/** Font size that lets a word span the section width. */
const fit = (word: string, width: number, max: number) => Math.min(max, (width * 0.92) / (Math.max(word.length, 3) * 0.7));

/**
 * "Editorial": each dessert as a food-magazine cover. Its name is set huge across the section
 * (outlined above, solid below) with the plated dessert floating between, on a backdrop washed in
 * the dessert's own colours. Swiping slides the words apart at different speeds, spins the plate
 * out and rolls the next dessert in.
 */
export function DessertLayers({ items, placeId }: { items: Product[]; placeId: string; theme?: MerchantTheme }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [ref, width] = useWidth<HTMLDivElement>();
  const n = items.length;
  const { offset: focus, settle, handlers } = useWheel({ axis: 'x', pxPerStep: 140, max: n - 1, duration: 620 });
  const [added, setAdded] = useState<string | null>(null);
  const tints = useImageTints(items.map((p) => p.hero ?? p.image));
  const W = width || 375;

  // Backdrop: blend between the two nearest desserts' colours as you swipe.
  const lo = Math.max(0, Math.min(n - 1, Math.floor(focus)));
  const hi = Math.min(n - 1, lo + 1);
  const f = Math.min(1, Math.max(0, focus - lo));
  const ta = tints[items[lo].hero ?? items[lo].image] ?? [228, 214, 198];
  const tb = tints[items[hi].hero ?? items[hi].image] ?? ta;
  const mix = [0, 1, 2].map((k) => ta[k] + (tb[k] - ta[k]) * f) as [number, number, number];
  const bg = wash(mix);
  const accent = deep(mix);

  const current = items[Math.round(Math.min(Math.max(focus, 0), n - 1))];
  const add = (p: Product) => {
    addToCart({ productId: p.id, placeId });
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1400);
  };

  return (
    <div ref={ref} className="no-select relative mx-5 overflow-hidden rounded-[30px]" style={{ height: HEIGHT, background: `rgb(${bg.map(Math.round).join(',')})` }} {...handlers}>
      {/* soft light from above */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_35%,rgba(255,255,255,0.7),transparent_70%)]" />

      {items.map((item, i) => {
        const d = i - focus;
        if (Math.abs(d) > 1.4) return null;
        const [top, bottom] = splitName(item.name);
        const vis = Math.max(0, 1 - Math.abs(d));
        const topSize = fit(top, W, 92);
        const botSize = fit(bottom, W, 64);
        return (
          <div key={item.id} className="pointer-events-none absolute inset-0" style={{ opacity: r2(Math.min(1, vis * 1.6) * 100) / 100 }}>
            {/* giant outlined word, sliding fastest */}
            <p
              className="absolute left-0 right-0 top-6 whitespace-nowrap text-center font-black uppercase leading-none"
              style={{ fontSize: r2(topSize), letterSpacing: '-0.02em', color: 'transparent', WebkitTextStroke: `1.5px ${accent}`, transform: `translateX(${r2(d * W * 1.25)}px)`, opacity: 0.55 }}>
              {top}
            </p>
            {/* the plate: spins out and in */}
            <button
              type="button"
              aria-label={`Open ${item.name}`}
              onClick={() => (Math.abs(d) < 0.5 ? router.push(`/product/${item.id}?placeId=${placeId}`) : settle(i))}
              className="pointer-events-auto absolute left-1/2 top-[86px] rounded-full"
              style={{
                width: PLATE,
                height: PLATE,
                marginLeft: -PLATE / 2,
                transform: `translateX(${r2(d * W * 0.95)}px) rotate(${r2(d * 70)}deg) scale(${r2((1 - Math.abs(d) * 0.28) * 1000) / 1000})`,
                boxShadow: '0 30px 50px -18px rgba(40,22,10,0.55), 0 0 0 7px rgba(255,255,255,0.9)',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.hero ?? item.image} alt="" draggable={false} className="h-full w-full rounded-full object-cover" />
            </button>
            {/* solid word, sliding slower */}
            <p
              className="absolute left-0 right-0 top-[340px] whitespace-nowrap text-center font-black uppercase leading-none"
              style={{ fontSize: r2(botSize), letterSpacing: '-0.02em', color: accent, transform: `translateX(${r2(d * W * 0.7)}px)` }}>
              {bottom}
            </p>
          </div>
        );
      })}

      {/* Footer: count, line, price and add */}
      <div className="absolute inset-x-5 bottom-5">
        <div className="mb-3 h-px" style={{ background: accent, opacity: 0.25 }} />
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
              {String(Math.round(Math.min(Math.max(focus, 0), n - 1)) + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </p>
            <p key={current.id} className="fade-in mt-0.5 truncate text-[13px] text-ink/70">
              {current.tagline ?? current.name}
            </p>
          </div>
          <Price amount={current.price} size={18} color="var(--color-ink)" weight={600} />
          <button
            type="button"
            aria-label={`Add ${current.name} to cart`}
            onClick={() => add(current)}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-lg transition-colors active:scale-90 ${added === current.id ? 'bg-green text-white' : 'bg-ink text-white'}`}>
            {added === current.id ? <Check size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
}
