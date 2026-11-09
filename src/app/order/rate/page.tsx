import { Suspense } from 'react';
import { RateView } from './RateView';

export default function RatePage() {
  return (
    <Suspense>
      <RateView />
    </Suspense>
  );
}
