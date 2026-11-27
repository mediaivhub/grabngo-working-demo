'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/cards';
import { OrdersList, TasteStrip } from '@/components/OrdersList';
import { EmptyState, orbs, SearchBar } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { useStore } from '@/store/AppStore';

export default function OrdersScreen() {
  const { orders } = useStore();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = q
    ? orders.filter((o) => `${getPlace(o.placeId)?.name ?? ''} ${o.lines.map((l) => getProduct(l.productId)?.name ?? '').join(' ')}`.toLowerCase().includes(q))
    : orders;
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <AppHeader />
      <div className="scroll pb-6">
        <h1 className="px-5 text-[26px] font-bold leading-8 tracking-tight">Your orders</h1>
        <p className="mt-0.5 px-5 text-[15px] text-gray">Every pickup, kept like a receipt.</p>
        {!q && <TasteStrip orders={orders} />}
        <SearchBar value={query} onChange={setQuery} placeholder="Search a place or an item" className="mx-4 mt-5 bg-white" />
        <OrdersList
          bare
          orders={list}
          empty={
            <EmptyState
              orb={orbs.search}
              title={q ? 'No Matches' : 'No Orders Yet'}
              body={q ? 'Try a different restaurant or item name.' : 'Your order activity will appear here after your first purchase.'}
            />
          }
        />
      </div>
    </div>
  );
}
