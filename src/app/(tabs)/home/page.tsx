'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader, LiveOrderCard, ProductTile, UsualCard } from '@/components/cards';
import { SearchBar } from '@/components/ui';
import { FEATURED, getProduct, USUAL } from '@/data/mock';
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
          <SearchBar onClick={() => router.push('/search')} className="mx-5" />
        </div>
        <div className="mx-5 mt-2 flex gap-4">
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
        <h2 className={`${anim('cascade-in')} mx-5 mb-3.5 mt-[30px] text-[21px] text-ink [animation-delay:360ms]`}>Featured on GrabnGo</h2>
        <div className="hscroll gap-2.5 px-5">
          {FEATURED.map((id, i) => (
            <div key={id} className={`${anim('slide-in-right')} shrink-0`} style={{ animationDelay: `${420 + i * 70}ms` }}>
              <ProductTile product={getProduct(id)!} className="min-h-[170px] w-[122px] shrink-0" imageSize={96} />
            </div>
          ))}
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
