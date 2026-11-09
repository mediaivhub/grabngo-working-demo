'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { PlaceRow } from '@/components/cards';
import { EmptyState, NavHeader, orbs, SearchBar } from '@/components/ui';
import { places, USER_MAP_POSITION, type Place } from '@/data/mock';

type Kind = 'restaurants' | 'cafes' | 'nearest' | 'all';
const TITLES: Record<Kind, string> = { restaurants: 'Restaurants', cafes: 'Cafe’s', nearest: 'Nearest places', all: 'Places' };
const distance = (p: Place) => Math.hypot(p.map.x - USER_MAP_POSITION.x, p.map.y - USER_MAP_POSITION.y);

function listFor(kind: Kind): Place[] {
  if (kind === 'restaurants') return places.filter((p) => p.kind === 'restaurant').slice(0, 7);
  if (kind === 'cafes') return places.filter((p) => p.kind === 'cafe').slice(0, 5);
  if (kind === 'nearest') return [...places].sort((a, b) => distance(a) - distance(b)).slice(0, 8);
  return places;
}

export function PlacesList() {
  const { kind } = useParams<{ kind: Kind }>();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const data = listFor(kind).filter((p) => !q || p.name.toLowerCase().includes(q));
  return (
    <main className="screen pt-safe">
      <NavHeader title={TITLES[kind] ?? 'Places'} />
      <SearchBar value={query} onChange={setQuery} className="mx-5 mt-6" />
      <div className="scroll pb-safe flex flex-col gap-2.5 p-5">
        {data.length ? data.map((p) => <PlaceRow key={p.id} place={p} />) : <EmptyState orb={orbs.search} title="No Matches" body="Try another name." />}
      </div>
    </main>
  );
}
