'use client';

import { ChevronRight, Heart, RotateCcw, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx, Price } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { useStore, type Order, type PaymentMethod } from '@/store/AppStore';

const day = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const time = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const month = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const PAID: Record<PaymentMethod, string> = { card: 'Card', 'apple-pay': 'Apple Pay', 'google-pay': 'Google Pay', cash: 'Cash' };

/** A barcode drawn from the order number, so every receipt's is its own. */
function Barcode({ code }: { code: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of code.replace(/\D/g, '').repeat(2)) {
    const n = Number(ch);
    bars.push({ x, w: 1 + (n % 3) });
    x += 1 + (n % 3) + 1 + ((n * 7) % 3);
  }
  return (
    <svg viewBox={`0 0 ${x} 24`} preserveAspectRatio="none" className="h-6 w-[112px]" aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={24} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Orders as a journal of receipts, grouped by month. Each order reads like the real thing:
 * the lines with dotted leaders, the total, a barcode, how you rated it, and "Order again".
 */
export function OrdersList({ orders, empty, bare }: { orders: Order[]; empty?: ReactNode; bare?: boolean }) {
  if (!orders.length) return <>{empty}</>;
  const groups: { label: string; orders: Order[] }[] = [];
  for (const o of orders) {
    const label = o.status !== 'completed' ? 'Right now' : month(o.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.orders.push(o);
    else groups.push({ label, orders: [o] });
  }
  return (
    <div className={cx('flex flex-col px-4 pb-6 pt-2', !bare && 'scroll bg-surface')}>
      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="mb-2.5 mt-5 px-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">{g.label}</h2>
          <div className="flex flex-col gap-4">
            {g.orders.map((o) => (
              <Receipt key={o.id} order={o} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Receipt({ order: o }: { order: Order }) {
  const router = useRouter();
  const { reorder, toggleFavorite } = useStore();
  const place = getPlace(o.placeId);
  const live = o.status !== 'completed';
  const open = () => router.push(live ? '/order/status' : `/order/rate?id=${o.id}`);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${place?.name} order, ${day(o.createdAt)}`}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className="receipt cursor-pointer bg-white px-5 pb-8 pt-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform active:scale-[0.99]">
      {/* Header: the place, when, and how it went */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place?.image} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold leading-5">{place?.name}</p>
          <p className="text-[12.5px] text-gray">
            {day(o.createdAt)} · {time(o.createdAt)}
          </p>
        </div>
        {live ? (
          <span className="flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-white">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="live-ping absolute inset-0 rounded-full bg-green" />
              <span className="relative h-2 w-2 rounded-full bg-green" />
            </span>
            Live
          </span>
        ) : o.rating ? (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-ink">
            <Star size={14} fill="currentColor" className="text-orange" /> {o.rating}.0
          </span>
        ) : (
          <span className="text-[12.5px] font-medium text-gray">Rate it</span>
        )}
      </div>

      {/* The lines */}
      <div className="mt-4 border-t border-dashed border-divider pt-3.5">
        {o.lines.map((l) => {
          const p = getProduct(l.productId);
          const free = l.unitPrice === 0;
          return (
            <div key={l.key} className="flex items-baseline gap-2 py-1 text-[14px]">
              <span className="shrink-0 tabular-nums text-gray">{l.qty}×</span>
              <span className="shrink-0 text-ink">{p?.name}</span>
              {l.size !== 'M' && <span className="shrink-0 text-[12px] text-gray">{l.size}</span>}
              <span className="mb-[3px] min-w-4 flex-1 border-b border-dotted border-gray-light" />
              {free ? <span className="shrink-0 text-[13px] font-medium text-green">Invitation · Free</span> : <Price amount={l.unitPrice * l.qty} size={14} color="var(--color-ink)" fixed className="shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-divider pt-3">
        <span className="text-[13px] text-gray">
          Total incl. fees · {PAID[o.payment]}
          {o.car ? ' · Curbside' : ''}
        </span>
        <Price amount={o.total} size={19} color="var(--color-ink)" weight={700} fixed />
      </div>

      {/* Barcode + actions */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-ink/80">
          <Barcode code={o.id} />
          <p className="mt-1 text-[10.5px] tracking-[0.2em] text-gray">{o.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {!live && (
            <button
              type="button"
              aria-label={o.favorite ? 'Remove from favourites' : 'Make favourite'}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(o.id);
              }}
              className={cx('grid h-10 w-10 place-items-center rounded-full transition-colors active:scale-90', o.favorite ? 'bg-brand text-white' : 'bg-surface text-ink')}>
              <Heart size={17} fill={o.favorite ? 'currentColor' : 'none'} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (live) return open();
              reorder(o);
              router.push('/cart');
            }}
            className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-semibold text-white active:scale-95">
            {live ? (
              <>
                Track <ChevronRight size={16} />
              </>
            ) : (
              <>
                <RotateCcw size={15} /> Order again
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/** The minutes of queueing an order-ahead pickup saves, on average (counter queue in a busy café). */
const QUEUE_MIN = 9;

/** "Your taste": what your orders say about you, at the top of the Orders tab. */
export function TasteStrip({ orders }: { orders: Order[] }) {
  const done = orders.filter((o) => o.status === 'completed');
  if (!done.length) return null;
  const count = <T,>(xs: T[]) => {
    const m = new Map<T, number>();
    xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  };
  const [placeId, placeN] = count(done.map((o) => o.placeId));
  const [productId, productN] = count(done.flatMap((o) => o.lines.filter((l) => l.unitPrice > 0).flatMap((l) => Array(l.qty).fill(l.productId) as string[])));
  const place = getPlace(placeId);
  const product = getProduct(productId);

  return (
    <div className="hscroll mt-4 gap-2.5 px-4">
      <div className="flex h-[132px] w-[150px] shrink-0 flex-col justify-between rounded-[24px] bg-ink p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Queue skipped</p>
        <div>
          <p className="text-[34px] font-extrabold leading-9 tracking-tight tabular-nums">{done.length * QUEUE_MIN} min</p>
          <p className="mt-1 text-[12px] text-white/60">across {done.length} pickups</p>
        </div>
      </div>
      {place && (
        <div className="relative h-[132px] w-[150px] shrink-0 overflow-hidden rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Your place</p>
            <div>
              <p className="line-clamp-2 text-[17px] font-bold leading-5">{place.name}</p>
              <p className="mt-1 text-[12px] text-white/70">
                {placeN} of {done.length} orders
              </p>
            </div>
          </div>
        </div>
      )}
      {product && (
        <div className="flex h-[132px] w-[150px] shrink-0 flex-col justify-between rounded-[24px] bg-white p-4">
          <div className="flex items-start justify-between">
            <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-gray">Your go-to</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" className="-mr-1.5 -mt-1.5 h-11 w-11 object-contain" />
          </div>
          <div>
            <p className="truncate text-[17px] font-bold leading-5">{product.name}</p>
            <p className="mt-1 text-[12px] text-gray">ordered {productN}×</p>
          </div>
        </div>
      )}
    </div>
  );
}
