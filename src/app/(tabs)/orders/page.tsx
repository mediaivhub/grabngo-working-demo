'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/cards';
import { OrdersList } from '@/components/OrdersList';
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
    <>
      <AppHeader />
      <SearchBar value={query} onChange={setQuery} className="mx-5 mb-2" />
      <OrdersList
        orders={list}
        empty={
          <EmptyState
            orb={orbs.search}
            title={q ? 'No Matches' : 'No Orders Yet'}
            body={q ? 'Try a different restaurant or item name.' : 'Your order activity will appear here after your first purchase.'}
          />
        }
      />
    </>
  );
}
