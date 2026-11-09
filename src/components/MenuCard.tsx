'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/mock';
import { formatAmount } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

/** Large grid card on the restaurant menu ("Soup / Dumplings · 25.39 AED"). */
export function MenuCard({ product, placeId }: { product: Product; placeId: string }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [first, ...rest] = product.name.split(' ');
  return (
    <div role="link" tabIndex={0} aria-label={product.name} onClick={() => router.push(`/product/${product.id}?placeId=${placeId}`)} className="flex-1 cursor-pointer rounded-3xl bg-card p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt="" className="mx-auto my-1 h-[100px] w-[100px] object-contain" />
      <p className="mt-3.5 truncate text-[18px] text-ink">{first}</p>
      <p className="truncate text-[18px] text-gray">{rest.join(' ') || ' '}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[15px] text-gray-light">{formatAmount(product.price)} AED</span>
        <button
          type="button"
          aria-label={`Add ${product.name}`}
          onClick={(e) => {
            e.stopPropagation();
            addToCart({ productId: product.id, placeId });
          }}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#B8B8B8] text-white active:scale-90">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
