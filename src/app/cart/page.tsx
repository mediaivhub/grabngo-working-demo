'use client';

import { Car as CarIcon, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Car3DSheet, CarStage } from '@/components/car';
import { OrderSummary, PickupInfo, Section, TotalBar } from '@/components/OrderBlocks';
import { cx, EmptyState, NavHeader, orbs, Price, QtyStepper } from '@/components/ui';
import { carName, plateText } from '@/lib/car';
import { getAddonGroup, getPlace, getProduct } from '@/data/mock';
import { orderTotals } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

export default function CartScreen() {
  const router = useRouter();
  const { cart, setQty, user, car, setPickupMode } = useStore();
  const [show3d, setShow3d] = useState(false);
  const atCar = cart.pickup === 'car';
  const place = getPlace(cart.placeId) ?? getPlace('orfali')!;
  const totals = orderTotals(cart.lines);

  if (cart.lines.length === 0) {
    return (
      <main className="screen pt-safe">
        <NavHeader title="My Cart" />
        <EmptyState orb={orbs.cart} title="Your Cart Empty" body="Add items to your cart to purchase now or save them for later." />
      </main>
    );
  }

  return (
    <main className="screen bg-surface">
      <div className="scroll pb-6">
        <Section className="mt-0 rounded-t-none pt-[calc(var(--safe-top)+4px)]">
          <NavHeader title="Your Order" className="-mx-5 -mt-1" />
          {cart.lines.map((line, i) => {
            const product = getProduct(line.productId);
            const extras = Object.entries(line.addons)
              .map(([g, o]) => getAddonGroup(g)?.options.find((x) => x.id === o)?.short)
              .filter(Boolean);
            return (
              <div key={line.key} className={`flex items-center gap-3 py-3.5 ${i > 0 ? 'ml-[76px] border-t border-divider' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product?.image} alt="" className={`h-[66px] w-[66px] shrink-0 rounded-[14px] bg-card object-cover ${i > 0 ? '-ml-[76px]' : ''}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">{product?.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-[14px] text-gray">
                    <Price amount={line.unitPrice * line.qty} size={16} color="var(--color-ink)" />
                    <span className="truncate">· {extras.length ? `${line.size} · ${extras.join(', ')}` : `${product?.ratings} ratings`}</span>
                  </p>
                </div>
                <QtyStepper value={line.qty} onChange={(n) => setQty(line.key, n)} />
              </div>
            );
          })}
          <button type="button" onClick={() => router.push(`/restaurant/${place.id}`)} className="mt-3 h-[46px] w-full rounded-full bg-surface text-[15px]">
            Add More Items
          </button>
        </Section>
        <PickupInfo place={place} hideArt={atCar && !!car}>
          <div role="radiogroup" aria-label="Pickup" className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
            {([['counter', 'At the counter', Store], ['car', 'At my car', CarIcon]] as const).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={(cart.pickup ?? 'counter') === mode}
                onClick={() => setPickupMode(mode)}
                className={cx('flex h-11 items-center justify-center gap-1.5 rounded-full text-[15px] transition', (cart.pickup ?? 'counter') === mode ? 'bg-white font-medium shadow-sm' : 'text-gray')}>
                <Icon size={17} /> {label}
              </button>
            ))}
          </div>
          {atCar &&
            (car ? (
              <>
                <CarStage car={car} onView3D={() => setShow3d(true)} className="-mx-1.5 mt-3.5" />
                <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-[#f7f7f7] px-3.5 py-3 text-[14px] leading-[19px]">
                  <span className="min-w-0 flex-1">
                    Staff will bring it to your <b className="font-semibold">{carName(car)}</b>, plate <b className="font-semibold">{plateText(car)}</b>.
                  </span>
                  <button type="button" onClick={() => router.push('/account/car')} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium shadow-sm">
                    Change
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => router.push('/account/car')} className="mt-4 h-[52px] w-full rounded-full bg-black text-[16px] font-medium text-white">
                Add your car
              </button>
            ))}
        </PickupInfo>
        <OrderSummary totals={totals} />
      </div>
      <TotalBar total={totals.total} label="Confirm Pickup" disabled={atCar && !car} onClick={() => router.push(user ? '/checkout' : '/auth/login?next=checkout')} />
      {show3d && car && <Car3DSheet car={car} onClose={() => setShow3d(false)} />}
    </main>
  );
}
