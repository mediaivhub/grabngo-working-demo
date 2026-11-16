'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Car3DSheet, CarArt } from '@/components/car';
import { CircleButton, cx, EmptyState, orbs, Price } from '@/components/ui';
import { carName, model3dFor, plateText } from '@/lib/car';
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

  useEffect(() => {
    if (done && order.status === 'preparing') setOrderStatus(order.id, 'ready');
  }, [done, order.id, order.status, setOrderStatus]);

  return (
    <div className="scroll pb-safe px-5 pt-3">
      <div className="mx-auto flex h-40 w-[320px] max-w-full flex-col items-center justify-center rounded-full bg-surface">
        <span className="text-[72px] font-extrabold leading-20 tracking-[-2px] tabular-nums">{done ? 'Ready' : label}</span>
        <span className="text-[15px] text-gray">{done ? 'Your order is ready for pickup.' : 'Until it’s ready for pickup.'}</span>
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

/** Curbside pickup: the customer's car in its bay, and "I've arrived" so staff walk the order out. */
function Curbside({ order }: { order: Order }) {
  const { markArrived } = useStore();
  const [show3d, setShow3d] = useState(false);
  const car = order.car!;
  const arrived = !!order.arrivedAt;
  return (
    <>
      <div
        className="relative mt-4 h-[300px] overflow-hidden rounded-[28px]"
        style={{
          // A pool of light over the bay so dark paint still reads.
          background: 'radial-gradient(ellipse 70% 55% at 50% 78%, rgba(255,244,225,0.28), rgba(255,244,225,0) 70%), linear-gradient(#3a3a3e 0%, #232326 100%)',
        }}>
        <div className="absolute inset-x-4 top-4 z-[2] flex justify-between text-[13px] text-white">
          <span className="rounded-xl bg-white/12 px-2.5 py-1.5 backdrop-blur">Curbside · Bay 3</span>
          <span className="rounded-xl bg-white/12 px-2.5 py-1.5 backdrop-blur">{plateText(car)}</span>
        </div>
        <div className="absolute bottom-0 left-1/2 h-40 w-[250px] -translate-x-1/2 rounded-t-[10px] border-[3px] border-b-0 border-dashed border-white/35">
          <span className="absolute left-1/2 top-2.5 -translate-x-1/2 text-[12px] font-bold tracking-[2px] text-white/55">BAY 3</span>
        </div>
        <CarArt car={car} brakes={arrived} className="absolute bottom-1.5 left-1/2 w-[250px] -translate-x-1/2" />
        {model3dFor(car) && (
          <button type="button" onClick={() => setShow3d(true)} className="absolute bottom-3 right-3 z-[2] rounded-xl bg-white/90 px-2.5 py-1.5 text-[12px] font-semibold">
            View in 3D
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={arrived}
        onClick={() => markArrived(order.id)}
        className={cx('mt-3.5 h-[58px] w-full rounded-full text-[17px] font-semibold text-white transition-colors', arrived ? 'bg-black' : 'bg-green')}>
        {arrived ? 'Staff are on the way' : 'I’ve arrived'}
      </button>
      <p className="mt-2.5 text-center text-[13px] text-gray">
        {arrived ? 'Bay 3 · Your order is coming out to the ' : 'We’ll bring your order to your '}
        <b className="font-semibold text-ink">{carName(car)}</b>.
      </p>
      {show3d && <Car3DSheet car={car} onClose={() => setShow3d(false)} />}
    </>
  );
}
