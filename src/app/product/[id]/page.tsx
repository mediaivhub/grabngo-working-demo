import { Suspense } from 'react';
import { products } from '@/data/mock';
import { ProductView } from './ProductView';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function ProductPage() {
  return (
    <Suspense>
      <ProductView />
    </Suspense>
  );
}
