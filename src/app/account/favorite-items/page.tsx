'use client';

import { Heart, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ListHero } from '@/components/ListHero';
import { EmptyState, NavHeader, orbs, Price } from '@/components/ui';
import { getProduct, type Product } from '@/data/mock';
import { useStore } from '@/store/AppStore';

export default function FavoriteItemsScreen() {
  const router = useRouter();
  const { favoriteProducts, addToCart, toggleFavoriteProduct } = useStore();
  const data = favoriteProducts.map(getProduct).filter((p): p is Product => Boolean(p));
  return (
    <main className="screen pt-safe">
      <NavHeader title="Favorite Order" fallback="/profile" />
      {data.length === 0 ? (
        <EmptyState orb={orbs.cup} title="No Favorite Items Yet" body="Favorite your favorite orders to view them here anytime." />
      ) : (
        <div className="scroll pb-safe">
          <ListHero title="Favorite Orders" body="A dedicated space to review and manage the orders you’ve chosen to save." count={data.length} />
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-10">
            {data.map((p) => (
              <div key={p.id} role="link" tabIndex={0} aria-label={p.name} onClick={() => router.push(`/product/${p.id}?placeId=${p.placeId}`)} className="relative cursor-pointer rounded-3xl bg-card p-4">
                <button
                  type="button"
                  aria-label={`Remove ${p.name} from favorites`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteProduct(p.id, false);
                  }}
                  className="absolute right-3.5 top-3.5 text-[#8E8E8E]">
                  <Heart size={22} fill="currentColor" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="mx-auto mt-3 h-[110px] w-[110px] object-contain" />
                <p className="mt-3.5 line-clamp-2 min-h-10 text-[17px] leading-5">{p.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <Price amount={p.price} size={16} />
                  <button
                    type="button"
                    aria-label={`Add ${p.name} to cart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ productId: p.id, placeId: p.placeId });
                    }}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black text-white active:scale-90">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
