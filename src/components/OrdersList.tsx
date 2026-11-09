'use client';

import { CheckCircle2, Clock, Heart, Hourglass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx, Price } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { useStore, type Order } from '@/store/AppStore';

const when = (ms: number) =>
  `${new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${new Date(ms).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}`;

const STATUS_LABEL = { preparing: 'Preparing', ready: 'Ready', completed: 'Completed' } as const;

/** Past/active order cards with Reorder and Make Favorite (Orders tab and Profile → Orders). */
export function OrdersList({ orders, empty }: { orders: Order[]; empty?: ReactNode }) {
  const router = useRouter();
  const { reorder, toggleFavorite } = useStore();
  if (!orders.length) return <>{empty}</>;
  return (
    <div className="scroll flex flex-col gap-3.5 p-5 pt-4">
      {orders.map((o) => {
        const place = getPlace(o.placeId);
        const first = getProduct(o.lines[0]?.productId);
        const live = o.status !== 'completed';
        return (
          <div
            key={o.id}
            role="link"
            tabIndex={0}
            aria-label={`${place?.name} order`}
            onClick={() => router.push(live ? '/order/status' : `/order/rate?id=${o.id}`)}
            className="cursor-pointer rounded-3xl bg-card p-3.5">
            <div className="flex gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={place?.image} alt="" className="h-[83px] w-[83px] rounded-[14px] object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 flex-1 text-[17px] leading-[19px]">{place?.name}</p>
                  <Price amount={o.total} size={17} color="var(--color-orange)" fixed />
                </div>
                <p className="mt-1 truncate text-[14px] text-gray">
                  {first?.name}
                  {o.lines.length > 1 ? ` +${o.lines.length - 1} more` : ''}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="flex h-[26px] items-center gap-1 rounded-full bg-white px-2 text-[12px] text-gray">
                    <Clock size={13} className="text-orange" /> {when(o.createdAt)}
                  </span>
                  <span className="flex h-[26px] items-center gap-1 rounded-full bg-white px-2 text-[12px] text-gray">
                    {live ? <Hourglass size={13} className="text-orange" /> : <CheckCircle2 size={13} className="text-orange" />} {STATUS_LABEL[o.status]}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reorder(o);
                  router.push('/cart');
                }}
                className="h-9 flex-1 rounded-full border border-divider text-[15px]">
                Reorder
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(o.id);
                }}
                className={cx('flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-[15px]', o.favorite ? 'border-black bg-black text-white' : 'border-divider')}>
                {o.favorite && <Heart size={15} fill="currentColor" />}
                {o.favorite ? 'Favorite' : 'Make Favorite'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
