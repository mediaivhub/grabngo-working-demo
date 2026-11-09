import { Suspense } from 'react';
import { products } from '@/data/mock';
import { IngredientsView } from './IngredientsView';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function IngredientsPage() {
  return (
    <Suspense>
      <IngredientsView />
    </Suspense>
  );
}
