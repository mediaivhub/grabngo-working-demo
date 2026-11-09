'use client';

import { OrdersList } from '@/components/OrdersList';
import { EmptyState, NavHeader, orbs } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export default function YourOrdersScreen() {
  const { orders } = useStore();
  return (
    <main className="screen pt-safe">
      <NavHeader title="Your Orders" fallback="/profile" />
      <OrdersList orders={orders} empty={<EmptyState orb={orbs.search} title="No Orders Yet" body="Your order activity will appear here after your first purchase." />} />
    </main>
  );
}
