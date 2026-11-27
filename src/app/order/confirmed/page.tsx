'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { shortName } from '@/components/KitchenTiming';
import { Button, CircleButton, EmptyState, orbs } from '@/components/ui';
import { getPlace } from '@/data/mock';
import { isHeld, useStore } from '@/store/AppStore';

export default function OrderConfirmedScreen() {
  const router = useRouter();
  const { activeOrder } = useStore();
  const held = activeOrder && isHeld(activeOrder) ? activeOrder : null;
  const name = shortName(getPlace(held?.placeId ?? '')?.name);
  const body = !held
    ? 'Your order is confirmed. We’ll notify you soon.'
    : held.hold?.mode === 'arrive'
      ? `Paid. ${name} starts cooking when you’re ${Math.round(held.hold.prepSec / 60)} min away. Leave whenever you like.`
      : `Paid. ${name} starts when you tap Start. Take your time.`;
  return (
    <main className="screen pt-safe pb-safe">
      <CircleButton label="Close" size={48} onClick={() => router.replace('/home')} className="absolute right-[18px] z-10" style={{ top: 'calc(var(--safe-top) + 14px)' }}>
        <X size={22} />
      </CircleButton>
      <EmptyState orb={orbs.check} title="Order Confirmed!" body={body} />
      <div className="flex flex-col gap-3 px-5 pb-3">
        <Button size="lg" onClick={() => router.replace('/order/status')}>
          Track Order
        </Button>
        <Button size="lg" variant="secondary" onClick={() => router.replace('/home')}>
          Back to Home
        </Button>
      </div>
    </main>
  );
}
