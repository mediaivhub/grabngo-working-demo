'use client';

import { ChevronRight, Navigation, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Curbside } from '@/components/Curbside';
import { CircleButton, cx, EmptyState, orbs, Price } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { useCountdown } from '@/lib/useCountdown';
import { HeldCard } from '@/components/KitchenTiming';
import { isHeld, kitchenStart, useStore, type Order } from '@/store/AppStore';

export default function OrderStatusScreen() {
  const router = useRouter();
  const { activeOrder } = useStore();
  return (
    <main className="screen pt-safe sheet-in">
      <div className="relative flex h-16 items-center justify-center">
        <h1 className="text-[18px] font-medium">Order Status</h1>
        <CircleButton label="Close" size={40} onClick={() => router.replace('/home')} className="absolute right-4">
          <X size={20} />
        </CircleButton>
      </div>
      {activeOrder ? <StatusBody order={activeOrder} /> : <EmptyState orb={orbs.search} title="No Active Order" body="Place an order and you can track it here." />}
    </main>
  );
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function StatusBody({ order }: { order: Order }) {
  const { setOrderStatus } = useStore();
  const held = isHeld(order);
  const countdown = useCountdown(kitchenStart(order), order.readyAt);
  const done = countdown.done && !held;
  const place = getPlace(order.placeId);
  const ready = done || order.status === 'ready';
  const curbside = !!order.car;

  useEffect(() => {
    if (done && order.status === 'preparing') setOrderStatus(order.id, 'ready');
  }, [done, order.id, order.status, setOrderStatus]);

  // One quiet line of status, a hairline of progress, three steps.
  const step = order.handedAt ? 3 : ready ? 2 : 1;
  const kicker = order.handedAt ? 'Collected' : ready ? 'Ready' : 'Being made';
  const title = order.handedAt ? 'Enjoy your order' : order.walkingAt ? `${order.staff} is on the way` : ready ? 'Ready for pickup' : `Ready at ${clock(order.readyAt)}`;
  const sub = order.handedAt
    ? `Collected from ${place?.name}`
    : order.walkingAt
      ? 'Bringing it to your car'
      : ready
        ? curbside
          ? 'We’ll bring it to your car'
          : 'Show your code at the counter'
        : `${countdown.label.replace(/^0(?=\d:)/, '')} to go`;
  // The bar runs through the steps: Making → Ready fills with the kitchen's progress.
  const progress = order.handedAt ? 1 : ready ? 2 / 3 : (1 + countdown.progress) / 3;

  return (
    <div className="scroll pb-safe px-5 pt-1">
      {!held && (
        <section className="px-1 pb-2 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray">
            {kicker} · {place?.name}
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-[34px] tracking-[-0.5px] tabular-nums">{title}</h2>
          <p className="mt-0.5 text-[13.5px] tabular-nums text-gray">{sub}</p>
          <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-surface">
            <div className={cx('h-full rounded-full transition-[width] duration-1000 ease-linear', ready || order.handedAt ? 'bg-green' : 'bg-ink')} style={{ width: `${Math.max(2, progress * 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px]">
            {['Paid', 'Making', 'Ready', 'Collected'].map((l, i) => (
              <span key={l} className={i <= step ? 'font-medium text-ink' : 'text-gray-light'}>
                {l}
              </span>
            ))}
          </div>
        </section>
      )}

      {curbside ? <Curbside order={order} /> : held && <HeldCard order={order} place={place} />}

      {/* The order, as a receipt */}
      <section className="mt-4 rounded-[24px] bg-surface p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place?.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-5">{place?.name}</p>
            <p className="truncate text-[12.5px] text-gray">{place?.address}</p>
          </div>
          <Link href="/order/pickup" aria-label="Directions" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white active:scale-95">
            <Navigation size={15} className="rotate-45" />
          </Link>
        </div>
        <div className="mt-3.5 border-t border-dashed border-divider pt-2.5">
          {order.lines.map((l) => {
            const p = getProduct(l.productId);
            return (
              <div key={l.key} className="flex items-baseline gap-2 py-1 text-[13.5px]">
                <span className="shrink-0 tabular-nums text-gray">{l.qty}×</span>
                <span className="shrink-0 text-ink">{p?.name}</span>
                <span className="mb-[3px] min-w-4 flex-1 border-b border-dotted border-gray-light" />
                {l.unitPrice === 0 ? <span className="shrink-0 text-[12.5px] text-green">Free</span> : <Price amount={l.unitPrice * l.qty} size={13.5} color="var(--color-ink)" fixed className="shrink-0" />}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-divider pt-2.5">
          <span className="text-[12.5px] text-gray">Total paid</span>
          <Price amount={order.total} size={15} color="var(--color-ink)" weight={600} fixed />
        </div>
      </section>

      {/* Pickup code */}
      <Link href="/order/qr" className="mb-4 mt-2 flex items-center gap-3.5 rounded-[24px] bg-surface p-3 pr-4 active:scale-[0.99]">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white">
          <QRCodeSVG value={`grabngo:${order.id}`} size={40} bgColor="transparent" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] text-gray">Pickup code</span>
          <span className="block text-[15px] font-medium tracking-[0.14em]">{order.id.replace('GNG-', '')}</span>
        </span>
        <ChevronRight size={18} className="text-gray" />
      </Link>
    </div>
  );
}
