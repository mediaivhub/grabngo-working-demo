'use client';

import { useRouter } from 'next/navigation';
import { Price } from '@/components/ui';
import type { MerchantTheme, Product } from '@/data/mock';
import { r2, useWheel, wrapDelta } from '@/lib/useWheel';
import { useWidth } from '@/lib/useWidth';

/** Angle between neighbouring drinks on the wheel, in radians. */
const STEP = (42 * Math.PI) / 180;
/** Drinks further than this many steps from the top are hidden (so three show at a time). */
const VISIBLE = 1.6;

/**
 * "Signature Coffee" wheel: drinks sit on a semicircle, the front one raised at the top,
 * its neighbours lower on either side. Dragging sideways turns the wheel; it loops through every drink.
 */
export function SignatureCarousel({ items, placeId, theme, title = 'Signature Coffee' }: { items: Product[]; placeId: string; theme: MerchantTheme; title?: string }) {
  const router = useRouter();
  const [ref, width] = useWidth<HTMLDivElement>();
  const { offset, settle, handlers, current } = useWheel({ axis: 'x', pxPerStep: 150, duration: 380 });
  const n = items.length;
  const itemW = Math.round(width * 0.42);
  const radius = width * 0.58;
  const arch = width * 1.5;
  const active = ((Math.round(offset) % n) + n) % n;

  return (
    <div ref={ref} className="no-select relative h-[480px] overflow-hidden" {...handlers} style={{ touchAction: 'pan-y' }}>
      <div className="absolute top-0 rounded-full" style={{ width: arch, height: arch, left: (width - arch) / 2, background: theme.arch }} />
      <svg width={width} height={70} className="pointer-events-none absolute top-1.5" aria-hidden>
        <defs>
          <path id="sig-arc" d={`M ${width * 0.2} 62 Q ${width / 2} 10 ${width * 0.8} 62`} />
        </defs>
        <text fill="var(--color-ink)" fontSize={19} textAnchor="middle" style={{ fontFamily: 'var(--font-inter)' }}>
          <textPath href="#sig-arc" startOffset="50%">
            {title}
          </textPath>
        </text>
      </svg>
      <h3 className="sr-only">{title}</h3>

      {items.map((item, i) => {
        const d = wrapDelta(i, offset, n);
        if (Math.abs(d) > VISIBLE) return null;
        const angle = d * STEP;
        const x = width / 2 + radius * Math.sin(angle);
        const y = 110 + radius * (1 - Math.cos(angle));
        const scale = 1 - Math.min(Math.abs(d), 1) * 0.12;
        const opacity = Math.min(1, (VISIBLE - Math.abs(d)) / 0.4);
        const isFront = Math.abs(d) < 0.5;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.name}
            onClick={() => (isFront ? router.push(`/product/${item.id}?placeId=${placeId}`) : settle(current() + Math.round(d)))}
            className="absolute flex flex-col items-center"
            style={{ width: itemW, left: r2(x - itemW / 2), top: r2(y), opacity: r2(opacity), zIndex: isFront ? 2 : 1, transform: `scale(${r2(scale)})` }}>
            <span className="absolute rounded-full" style={{ background: theme.disc, width: itemW * 0.8, height: itemW * 0.8, top: itemW * 0.3 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" draggable={false} className="relative object-contain" style={{ width: itemW * 0.95, height: itemW * 1.12 }} />
            <span className="mt-3 text-center text-[20px] leading-6 text-ink">{item.name}</span>
            <Price amount={item.price} size={18} className="mt-1.5" />
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-[84px] left-1/2 flex -translate-x-1/2 gap-[5px]">
        {items.map((p, i) => (
          <span key={p.id} className="h-[5px] rounded-full transition-all" style={{ width: i === active ? 18 : 5, background: i === active ? theme.disc : `${theme.disc}55` }} />
        ))}
      </div>
    </div>
  );
}
