'use client';

import { PlaceRow } from '@/components/cards';
import { ListHero } from '@/components/ListHero';
import { EmptyState, NavHeader, orbs } from '@/components/ui';
import { getPlace, type Place } from '@/data/mock';
import { useStore } from '@/store/AppStore';

export default function FavoritePlacesScreen() {
  const { favoritePlaces } = useStore();
  const data = favoritePlaces.map(getPlace).filter((p): p is Place => Boolean(p));
  return (
    <main className="screen pt-safe">
      <NavHeader title="Favorite Restaurants" fallback="/profile" />
      {data.length === 0 ? (
        <EmptyState orb={orbs.fork} title="No Favorite Restaurants." body="Favorite restaurants will show up once you add favorites." />
      ) : (
        <div className="scroll pb-safe">
          <ListHero title={'Favorite\nRestaurants'} body="Revisit your favorite dining spots to choose your next meal." count={data.length} />
          <div className="flex flex-col gap-2.5 px-5 pb-10">
            {data.map((p) => (
              <PlaceRow key={p.id} place={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
