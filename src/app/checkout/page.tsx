'use client';

import { Banknote, Check, ChevronRight, Plus, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { PlateBadge } from '@/components/car';
import { InvitationInCart } from '@/components/Invitations';
import { OrderSummary, PickupInfo, Section, TotalBar } from '@/components/OrderBlocks';
import { CardLogo, OutlineLogo } from '@/components/CardLogo';
import { NavHeader, RadioDot } from '@/components/ui';
import { brandName } from '@/lib/cards';
import { carName, plateText } from '@/lib/car';
import { getPlace } from '@/data/mock';
import { orderTotals } from '@/lib/pricing';
import { TimingPicker } from '@/components/KitchenTiming';
import { useStore, type KitchenTiming, type PaymentMethod } from '@/store/AppStore';

type Choice = { id: string; method: PaymentMethod; label: string; sub: string; logo: ReactNode };

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, submitOrder, cards, car } = useStore();
  const atCar = cart.pickup === 'car' && !!car;
  // Apple Pay is always pre-selected; other methods sit behind "Change payment method".
  const [choiceId, setChoiceId] = useState('apple-pay');
  const [changing, setChanging] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  // Optional: the kitchen starts straight away unless the customer picks otherwise.
  const [timing, setTiming] = useState<KitchenTiming>('now');
  const [coupon, setCoupon] = useState('');
  const place = getPlace(cart.placeId) ?? getPlace('orfali')!;
  const totals = orderTotals(cart.lines);

  const choices: Choice[] = [
    { id: 'apple-pay', method: 'apple-pay', label: 'Apple Pay', sub: 'Fast and secure way to pay', logo: <OutlineLogo> Pay</OutlineLogo> },
    { id: 'google-pay', method: 'google-pay', label: 'Google Pay', sub: 'Safe, secure transactions', logo: <OutlineLogo>G Pay</OutlineLogo> },
    ...cards.map((c) => ({ id: c.id, method: 'card' as const, label: `${brandName(c.brand)} •••• ${c.last4}`, sub: `Expires ${c.expiry}`, logo: <CardLogo brand={c.brand} /> })),
    { id: 'cash', method: 'cash', label: 'Pay with cash', sub: 'Pay at the counter on pickup', logo: <OutlineLogo><Banknote size={20} className="text-ink" /></OutlineLogo> },
  ];
  const selected = choices.find((c) => c.id === choiceId) ?? choices[0];

  return (
    <main className="screen bg-surface sheet-in">
      <div className="scroll pb-6">
        <Section className="mt-0 rounded-t-none pt-[var(--safe-top)]">
          <NavHeader className="-mx-5" fallback="/cart" />
          <h1 className="mb-4 mt-2 text-[24px] font-bold tracking-tight">Payment</h1>

          <div className="flex items-center gap-4 rounded-[18px] border-2 border-ink px-4 py-3.5" aria-live="polite">
            {selected.logo}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-medium">{selected.label}</p>
              <p className="truncate text-[13px] text-gray">{selected.sub}</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
              <Check size={16} strokeWidth={3} />
            </span>
          </div>

          <button type="button" aria-expanded={changing} onClick={() => setChanging((c) => !c)} className="mt-3 flex items-center gap-1 text-[14px] text-gray underline underline-offset-2">
            {changing ? 'Hide payment methods' : 'Change payment method'}
          </button>

          {changing && (
            <div className="mt-2 fade-in" role="radiogroup" aria-label="Payment method">
              {choices
                .filter((c) => c.id !== selected.id)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    onClick={() => {
                      setChoiceId(c.id);
                      setChanging(false);
                    }}
                    className="flex w-full items-center gap-4 border-b border-divider py-3 text-left last:border-0">
                    {c.logo}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px]">{c.label}</span>
                      <span className="block truncate text-[13px] text-gray">{c.sub}</span>
                    </span>
                    <RadioDot selected={false} />
                  </button>
                ))}
              <button type="button" onClick={() => router.push('/account/add-card')} className="flex w-full items-center gap-4 py-3 text-left">
                <OutlineLogo>
                  <Plus size={20} className="text-ink" />
                </OutlineLogo>
                <span className="flex-1 text-[16px]">Add new card</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="mt-3 flex h-14 items-center gap-3.5 border-t border-divider">
            <Ticket size={22} className="text-gray" />
            {couponOpen ? (
              <input autoFocus value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" aria-label="Coupon code" className="h-full flex-1 bg-transparent text-[17px] placeholder:text-gray" />
            ) : (
              <button type="button" onClick={() => setCouponOpen(true)} className="flex-1 text-left text-[17px] text-gray">
                {coupon || 'Coupon Code'}
              </button>
            )}
            <ChevronRight size={20} />
          </div>
        </Section>
        <PickupInfo place={place} hideArt={atCar}>
          {atCar && car && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f7f5f2] p-2.5 pr-4">
              <PlateBadge car={car} className="shrink-0" />
              <p className="text-[14px] leading-[19px]">
                Curbside · we’ll bring it to your <b className="font-semibold">{carName(car)}</b>
                <span className="mt-0.5 block text-gray">{plateText(car)}</span>
              </p>
            </div>
          )}
        </PickupInfo>
        <TimingPicker place={place} lines={cart.lines} atCar={atCar} value={timing} onChange={setTiming} />
        <InvitationInCart placeId={place.id} lines={cart.lines} compact />
        <OrderSummary totals={totals} />
      </div>
      <TotalBar
        total={totals.total}
        label={selected.method === 'apple-pay' ? 'Pay with Apple Pay' : selected.method === 'google-pay' ? 'Pay with Google Pay' : 'Confirm Pickup'}
        disabled={cart.lines.length === 0}
        onClick={() => {
          submitOrder(selected.method, { placeId: cart.placeId, lines: cart.lines, pickup: cart.pickup, timing });
          router.replace('/order/confirmed');
        }}
      />
    </main>
  );
}
