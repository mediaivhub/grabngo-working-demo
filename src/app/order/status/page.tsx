'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Curbside } from '@/components/Curbside';
import { CircleButton, cx, EmptyState, orbs, Price } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { useCountdown } from '@/lib/useCountdown';
import { useStore, type Order } from '@/store/AppStore';

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

function StatusBody({ order }: { order: Order }) {
  const { setOrderStatus } = useStore();
  const { label, done } = useCountdown(order.createdAt, order.readyAt);
  const place = getPlace(order.placeId);
  const ready = done || order.status === 'ready';

  useEffect(() => {
    if (done && order.status === 'preparing') setOrderStatus(order.id, 'ready');
  }, [done, order.id, order.status, setOrderStatus]);

  return (
    <div className="scroll pb-safe px-5 pt-3">
      <div className="mx-auto flex h-40 w-[320px] max-w-full flex-col items-center justify-center rounded-full bg-surface">
        <span className={cx('font-extrabold leading-20 tracking-[-2px] tabular-nums', order.handedAt ? 'text-[56px]' : 'text-[72px]')}>{order.handedAt ? 'Collected' : ready ? 'Ready' : label}</span>
        <span className="text-[15px] text-gray">{order.handedAt ? 'Enjoy your order.' : order.walkingAt ? 'On its way to your car.' : ready ? 'Your order is ready for pickup.' : 'Until it’s ready for pickup.'}</span>
      </div>
      {order.car && <Curbside order={order} />}
      <h2 className="mb-5 mt-9 text-center text-[26px]">Order Items</h2>
      {order.lines.map((l) => {
        const p = getProduct(l.productId);
        return (
          <div key={l.key} className="mx-3 mb-3.5 flex h-24 items-center rounded-[40px] bg-surface pl-[30px] pr-6">
            <div className="flex-1">
              <p className="text-[18px]">{p?.name}</p>
              <p className="mt-1.5 flex items-center text-[16px] text-gray">
                {String(l.qty).padStart(2, '0')} Items -&nbsp;
                <Price amount={l.unitPrice * l.qty} size={16} fixed />
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p?.image} alt="" className="h-[76px] w-16 object-contain" />
          </div>
        );
      })}
      <div className="mt-[30px] flex gap-2 pb-4">
        <div className="flex h-[210px] flex-1 flex-col rounded-[30px] bg-surface p-5">
          <p className="text-[15px] text-gray">Pickup Location</p>
          <p className="mt-2 flex-1 text-[17px] font-medium leading-[23px]">
            {place?.name}, {place?.address}
          </p>
          <Link href="/order/pickup" className="self-start rounded-full bg-black px-3.5 py-2 text-[15px] text-white">
            Open in Maps
          </Link>
        </div>
        <Link href="/order/qr" className="flex h-[210px] flex-1 flex-col items-center justify-center rounded-[30px] bg-surface">
          <QRCodeSVG value={`grabngo:${order.id}`} size={110} bgColor="transparent" />
          <span className="mt-3.5 text-[15px] text-gray">Show QR code</span>
        </Link>
      </div>
    </div>
  );
}
