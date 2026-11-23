'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader, LiveOrderCard, UsualCard } from '@/components/cards';
import { CravingPicks, HeroCarousel, SmartGreeting, TodaysDrops } from '@/components/HomeExtras';
import { InvitationsLine } from '@/components/Invitations';
import { SearchBar } from '@/components/ui';
import { USUAL } from '@/data/mock';
import { useStore } from '@/store/AppStore';

const CATEGORIES = [
  { kind: 'restaurants', label: 'Restaurants', image: '/images/misc/cat-restaurants.png' },
  { kind: 'cafes', label: 'Cafe’s', image: '/images/misc/cat-cafes.png' },
];

// The entrance cascade plays on the first visit only, not every time you switch back to Home.
let entrancePlayed = false;

export default function HomeScreen() {
  const [animate] = useState(() => !entrancePlayed);
  useEffect(() => {
    entrancePlayed = true;
  }, []);
  const anim = (cls: string) => (animate ? cls : '');
  const router = useRouter();
  const { usualMode, activeOrder, favoriteProducts } = useStore();
  const usual = usualMode === 'favorite' && favoriteProducts.length ? favoriteProducts.slice(0, 3) : USUAL[usualMode];
  return (
    <>
      <AppHeader />
      <div className="scroll" style={{ paddingBottom: activeOrder ? 150 : 32 }}>
        <div className={anim('cascade-in')}>
          <SmartGreeting />
          <InvitationsLine />
        </div>
        <div className={anim('cascade-in')} style={{ animationDelay: '80ms' }}>
          <TodaysDrops />
        </div>
        <div className={`${anim('cascade-in')} mt-4`} style={{ animationDelay: '140ms' }}>
          <SearchBar onClick={() => router.push('/search')} className="mx-5" />
        </div>
        <div className={anim('cascade-in')} style={{ animationDelay: '200ms' }}>
          <HeroCarousel />
        </div>
        <div className={anim('cascade-in')} style={{ animationDelay: '260ms' }}>
          <CravingPicks />
        </div>
        <div className="mx-5 mt-7 flex gap-4">
          {CATEGORIES.map((c, i) => (
            <Link key={c.kind} href={`/places/${c.kind}`} className={`${anim('cascade-in')} flex flex-1 flex-col items-center transition-transform active:scale-95`} style={{ animationDelay: `${90 + i * 80}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="aspect-[258/132] w-full object-contain" />
              <span className="mt-2.5 text-[18px] text-ink">{c.label}</span>
            </Link>
          ))}
        </div>
        <div className={`${anim('cascade-in')} mx-5 mt-5 [animation-delay:260ms]`}>
          <UsualCard
            title="The usual"
            productIds={usual}
            onSeeAll={() => router.push('/orders')}
            action={
              <Link href="/customize" className="flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-[16px] text-ink">
                <Pencil size={16} fill="currentColor" /> Edit
              </Link>
            }
          />
        </div>
      </div>
      {activeOrder && (
        <div className="absolute inset-x-2.5 bottom-3.5">
          <LiveOrderCard order={activeOrder} />
        </div>
      )}
    </>
  );
}
