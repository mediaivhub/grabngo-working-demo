'use client';

import { Check, ChevronRight, Clock, Plus, ShoppingBasket, Star, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx, Pill, Price } from '@/components/ui';
import { getProduct, type Place, type Product } from '@/data/mock';
import { useCountdown } from '@/lib/useCountdown';
import { useStore, type Order } from '@/store/AppStore';

export function avatarSrc(uri?: string) {
  return uri || '/images/misc/avatar.png';
}

/** Logo + basket + avatar row used on the Home, Map and Orders tabs. */
export function AppHeader() {
  const { cartCount, user } = useStore();
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-[26px] font-bold tracking-tight">
        Grab<span className="text-brand">n</span>Go
      </span>
      <div className="flex items-center gap-3">
        <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className="flex h-11 min-w-[66px] items-center justify-center gap-1.5 rounded-full bg-surface px-3.5">
          <ShoppingBasket size={22} fill="currentColor" />
          <span className="text-[18px] font-medium">{cartCount}</span>
        </Link>
        <Link href="/profile" aria-label="Profile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc(user?.avatarUri)} alt="" className="h-11 w-11 rounded-full object-cover" />
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

const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Floating "Preparing your order" card on Home while an order is live. */
export function LiveOrderCard({ order }: { order: Order }) {
  const { progress, done } = useCountdown(order.createdAt, order.readyAt);
  return (
    <Link
      href="/order/status"
      aria-label="Open order status"
      className="flex items-center rounded-[36px] bg-black py-2.5 pl-[22px] pr-2.5 shadow-[0_8px_18px_rgba(0,0,0,0.3)] fade-in">
      <div className="min-w-0 flex-1">
        <p className="text-[30px] font-bold tracking-tight text-white">
          {clock(order.readyAt)} - {clock(order.readyAt + 14 * 60 * 1000)}
        </p>
        <p className="mt-1.5 text-[14px] font-semibold text-white">{done ? 'Ready for pickup' : 'Preparing your order'}</p>
        <p className="truncate text-[13px] text-[#9A9A9A]">{done ? 'Show your QR code at the counter.' : 'When it’s ready, you can pick up your order.'}</p>
      </div>
      <div className="relative flex h-[104px] w-[104px] items-center justify-center">
        <ProgressRing progress={progress} />
        <span className="absolute flex h-[46px] w-[46px] items-center justify-center rounded-full bg-orange text-white">
          {done ? <Check size={22} /> : <Coffee size={22} />}
        </span>
      </div>
    </Link>
  );
}
