import { Suspense } from 'react';
import { CreatedView } from './CreatedView';

export default function CreatedPage() {
  return (
    <Suspense>
      <CreatedView />
    </Suspense>
  );
}
