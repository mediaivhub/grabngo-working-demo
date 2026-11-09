import { Suspense } from 'react';
import { PlacesList } from './PlacesList';

export function generateStaticParams() {
  return [{ kind: 'restaurants' }, { kind: 'cafes' }, { kind: 'nearest' }, { kind: 'all' }];
}

export default function PlacesPage() {
  return (
    <Suspense>
      <PlacesList />
    </Suspense>
  );
}
