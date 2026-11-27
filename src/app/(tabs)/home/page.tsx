'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader, LiveOrderCard } from '@/components/cards';
import { CravingPicks, HeroCarousel, ReadyFast, SmartGreeting, TodaysDrops } from '@/components/HomeExtras';
import { InvitationsLine } from '@/components/Invitations';
import { SearchBar } from '@/components/ui';
import { dayPart, type DayPart } from '@/lib/pickup';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/AppStore';

const CATEGORIES = [
  { kind: 'restaurants', label: 'Restaurants', image: '/images/misc/cat-restaurants.png' },
  { kind: 'cafes', label: 'Cafe’s', image: '/images/misc/cat-cafes.png' },
];

type Section = 'drops' | 'search' | 'hero' | 'cravings' | 'fast' | 'categories';

/**
 * Home rearranges itself through the day: coffee and the fastest pickups first in the morning,
 * what people are ordering at midday, new drops and desserts in the evening.
 */
const ORDER: Record<DayPart, Section[]> = {
  morning: ['search', 'categories', 'cravings', 'fast', 'drops', 'hero'],
  midday: ['drops', 'search', 'categories', 'cravings', 'fast', 'hero'],
  evening: ['drops', 'search', 'categories', 'hero', 'cravings', 'fast'],
  late: ['search', 'categories', 'fast', 'cravings', 'drops', 'hero'],
};

// The entrance cascade plays on the first visit only, not every time you switch back to Home.
let entrancePlayed = false;

export default function HomeScreen() {
  const [animate] = useState(() => !entrancePlayed);
  useEffect(() => {
    entrancePlayed = true;
  }, []);
  const router = useRouter();
  const now = useNow(60_000);
  const { activeOrder } = useStore();

  const sections: Record<Section, ReactNode> = {
    drops: <TodaysDrops />,
    search: <SearchBar onClick={() => router.push('/search')} className="mx-5 mt-4" />,
    hero: <HeroCarousel />,
    cravings: <CravingPicks />,
    fast: <ReadyFast />,
    categories: (
      <div className="mx-5 mt-5 flex gap-4">
        {CATEGORIES.map((c) => (
          <Link key={c.kind} href={`/places/${c.kind}`} className="flex flex-1 flex-col items-center transition-transform active:scale-95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt="" className="aspect-[258/132] w-full object-contain" />
            <span className="mt-2.5 text-[18px] text-ink">{c.label}</span>
          </Link>
        ))}
      </div>
    ),
  };

  return (
    <>
      <AppHeader />
      <div className="scroll" style={{ paddingBottom: activeOrder ? 104 : 32 }}>
        <div className={animate ? 'cascade-in' : ''}>
          <SmartGreeting />
          <InvitationsLine />
        </div>
        {/* Wait for the clock so the order doesn't jump after the first paint. */}
        {now !== null &&
          ORDER[dayPart(now)].map((key, i) => (
            <div key={key} className={animate ? 'cascade-in' : ''} style={animate ? { animationDelay: `${80 + i * 60}ms` } : undefined}>
              {sections[key]}
            </div>
          ))}
      </div>
      {activeOrder && (
        <div className="absolute inset-x-3 bottom-3">
          <LiveOrderCard order={activeOrder} />
        </div>
      )}
    </>
  );
}
