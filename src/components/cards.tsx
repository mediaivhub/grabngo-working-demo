'use client';

import { Check, ChevronRight, Clock, Coffee, Footprints, MapPin, Navigation, Plus, ShoppingBasket, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCartBump } from '@/components/CartFly';
import { cx, Pill, Price } from '@/components/ui';
import { getPlace, getProduct, type Place, type Product } from '@/data/mock';
import { useCountdown } from '@/lib/useCountdown';
import { useStore, type Order } from '@/store/AppStore';

export function avatarSrc(uri?: string) {
  return uri || '/images/misc/avatar.png';
}

/** Logo + basket + avatar row used on the Home, Map and Orders tabs. */
export function AppHeader() {
  const { cartCount } = useStore();
  const bump = useCartBump();
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-[26px] font-bold tracking-tight">
        Grab<span className="text-brand">n</span>Go
      </span>
      <div className="flex items-center gap-3">
        {/* Profile lives in the tab bar now; the header keeps just the cart, with a count only when there's something in it. */}
        <Link key={bump} data-cart-target href="/cart" aria-label={`Cart, ${cartCount} items`} className={cx('relative grid h-11 w-11 place-items-center rounded-full bg-surface', bump > 0 && 'cart-bump')}>
          <ShoppingBasket size={21} fill="currentColor" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-brand px-1.5 text-[12px] font-semibold tabular-nums text-white ring-2 ring-white">{cartCount}</span>
          )}
        </Link>
      </div>
    </div>
  );
}

export function PlaceRow({ place }: { place: Place }) {
  return (
    <Link href={`/restaurant/${place.id}`} className="flex items-center gap-[15px] rounded-[20px] bg-card p-[11px] pr-6 transition active:opacity-85">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={place.image} alt="" className="h-[83px] w-[83px] rounded-[14px] object-cover" />
      <div className="flex-1">
        <p className="max-w-[170px] text-[17px] leading-[19px] text-ink">{place.name}</p>
        <div className="mt-2 flex gap-2">
          <Pill icon={<Clock size={13} />} label={place.eta} />
          <Pill icon={<Star size={13} />} label={place.rating.toFixed(1)} />
        </div>
      </div>
      <ChevronRight size={20} className="text-gray" />
    </Link>
  );
}

/** Grey card with a product cut-out, name, price and a quick-add "+" button. */
export function ProductTile({ product, placeId = 'orfali', badge, plusColor = '#000', className, imageSize = 70 }: { product: Product; placeId?: string; badge?: string; plusColor?: string; className?: string; imageSize?: number }) {
  const router = useRouter();
  const { addToCart } = useStore();
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={product.name}
      onClick={() => router.push(`/product/${product.id}?placeId=${placeId}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/product/${product.id}?placeId=${placeId}`)}
      className={cx('flex cursor-pointer flex-col justify-between rounded-2xl bg-card p-3 pt-4 transition active:opacity-85', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt="" style={{ width: imageSize, height: imageSize }} className="self-center object-contain" />
      <div className="mt-2">
        {badge && <span className="mb-1 inline-block rounded-lg bg-gray-light px-1.5 py-0.5 text-[10px] font-medium text-white">{badge}</span>}
        <p className="line-clamp-2 flex min-h-[30px] items-end text-[14px] leading-[15px] text-ink">{product.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <Price amount={product.price} />
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ productId: product.id, placeId });
            }}
            style={{ background: plusColor }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white active:scale-90">
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** "The usual" block: a header strip over a white tray of three product tiles. */
export function UsualCard({ title, productIds, dark = true, action, onSeeAll, badgeFirst }: { title: string; productIds: string[]; dark?: boolean; action?: ReactNode; onSeeAll?: () => void; badgeFirst?: string }) {
  return (
    <div className={cx('rounded-[28px] px-[5px] pb-[5px]', dark ? 'bg-black shadow-[0_10px_16px_rgba(0,0,0,0.12)]' : 'bg-surface')}>
      <div className="flex h-[62px] items-center justify-between px-[15px]">
        <span className={cx('text-[19px]', dark ? 'text-white' : 'text-ink')}>{title}</span>
        {action}
      </div>
      <div className="rounded-3xl bg-white p-[7px] pb-2">
        <div className="flex gap-2">
          {productIds.map((id, i) => {
            const p = getProduct(id);
            return p ? <ProductTile key={id} product={p} className="min-h-[152px] flex-1" badge={i === 0 ? badgeFirst : undefined} /> : null;
          })}
        </div>
        {onSeeAll && (
          <button type="button" onClick={onSeeAll} className="mx-auto mt-2.5 flex h-[26px] items-center gap-0.5 rounded-[13px] bg-card px-2.5 text-[13px] text-ink">
            See all <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ProgressRing({ progress, size = 104, stroke = 16 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2A2A2A" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#fff"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={c * (1 - Math.min(Math.max(progress, 0.02), 1))}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

/**
 * Floating live order bar on Home. Compact (it shouldn't cover the page) and it says what's
 * actually happening: kitchen time, the drive in, arrival, who's walking out, collected.
 */
export function LiveOrderCard({ order }: { order: Order }) {
  const { progress, done, label } = useCountdown(order.createdAt, order.readyAt);
  const place = getPlace(order.placeId);
  const curbside = !!order.car;
  const ready = done || order.status === 'ready';
  const bay = order.bay ?? 3;

  let title: string;
  let sub: string;
  let tone = 'bg-orange';
  let icon: ReactNode = <Coffee size={17} />;
  if (order.handedAt) {
    [title, sub, tone, icon] = ['Collected. Enjoy.', 'Tap to rate your order', 'bg-green', <Check key="c" size={18} />];
  } else if (order.walkingAt) {
    [title, sub, tone, icon] = [`${order.staff} is walking out`, `To your car in Bay ${bay}`, 'bg-orange', <Footprints key="f" size={17} />];
  } else if (order.arrivedAt) {
    [title, sub, tone, icon] = [`You’re in Bay ${bay}`, `${place?.name} knows you’re here`, 'bg-brand', <MapPin key="m" size={17} />];
  } else if (curbside && order.trip) {
    title = `${order.trip.s < 60 ? 'Under a minute' : `${Math.round(order.trip.s / 60)} min`} away`;
    sub = ready ? 'Your order is ready and kept hot' : `Ready in ${label} · ${place?.name}`;
    icon = <Navigation key="n" size={15} className="rotate-45" fill="currentColor" />;
  } else if (ready) {
    [title, sub, tone, icon] = ['Ready for pickup', curbside ? 'Head over, we’ll bring it to your car' : 'Show your code at the counter', 'bg-green', <Check key="c" size={18} />];
  } else {
    title = `Ready in ${label}`;
    sub = `${place?.name} · ${curbside ? 'curbside' : 'counter'} pickup`;
  }

  return (
    <Link
      href="/order/status"
      aria-label="Open order status"
      className="fade-in flex h-[68px] items-center gap-3 rounded-full bg-black py-2 pl-2 pr-4 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
      <span className="relative grid h-[52px] w-[52px] shrink-0 place-items-center">
        <span className="absolute inset-0">
          <ProgressRing progress={order.handedAt || ready ? 1 : progress} size={52} stroke={4} />
        </span>
        <span className={cx('grid h-9 w-9 place-items-center rounded-full text-white', tone)}>{icon}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold tabular-nums text-white">{title}</span>
        <span className="block truncate text-[12.5px] text-white/60">{sub}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-white/50" />
    </Link>
  );
}
