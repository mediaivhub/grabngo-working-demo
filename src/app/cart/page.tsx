'use client';

import { useRouter } from 'next/navigation';
import { OrderSummary, PickupInfo, Section, TotalBar } from '@/components/OrderBlocks';
import { EmptyState, NavHeader, orbs, Price, QtyStepper } from '@/components/ui';
import { getAddonGroup, getPlace, getProduct } from '@/data/mock';
import { orderTotals } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

export default function CartScreen() {
  const router = useRouter();
  const { cart, setQty, setCarPlate, user } = useStore();
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
        <PickupInfo place={place}>
          <input
            value={cart.carPlate}
            onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
            placeholder="Car plate number"
            aria-label="Car plate number"
            className="mt-6 h-[52px] w-full rounded-full bg-field px-5 text-[16px] placeholder:text-gray"
          />
        </PickupInfo>
        <OrderSummary totals={totals} />
      </div>
      <TotalBar total={totals.total} label="Confirm Pickup" onClick={() => router.push(user ? '/checkout' : '/auth/login?next=checkout')} />
    </main>
  );
}
