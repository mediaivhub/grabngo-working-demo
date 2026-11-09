import { Suspense } from 'react';
import { places } from '@/data/mock';
import { RestaurantView } from './RestaurantView';

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export default function RestaurantPage() {
  return (
    <Suspense>
      <RestaurantView />
    </Suspense>
  );
}
