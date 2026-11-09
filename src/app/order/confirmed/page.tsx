'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, CircleButton, EmptyState, orbs } from '@/components/ui';

export default function OrderConfirmedScreen() {
  const router = useRouter();
  return (
    <main className="screen pt-safe pb-safe">
      <CircleButton label="Close" size={48} onClick={() => router.replace('/home')} className="absolute right-[18px] z-10" style={{ top: 'calc(var(--safe-top) + 14px)' }}>
        <X size={22} />
      </CircleButton>
      <EmptyState orb={orbs.check} title="Order Confirmed!" body="Your order is confirmed. We’ll notify you soon." />
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
