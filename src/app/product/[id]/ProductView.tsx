'use client';

import { Check, Heart, Plus, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProductTile } from '@/components/cards';
import { SwipeToOrder } from '@/components/SwipeToOrder';
import { CircleButton, cx, Price, useGoBack } from '@/components/ui';
import { BETTER_TOGETHER, getAddonGroup, getMenu, getProduct, menuProduct, type AddonGroup } from '@/data/mock';
import { unitPrice, type AddonSelection, type Size } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

const HERO = 440;

const slotLabel = (group: AddonGroup, optionId?: string) => {
  const option = group.options.find((o) => o.id === optionId);
  return !option || group.id === 'healthy' ? group.label : `Add ${option.short}`;
};

export function ProductView() {
  const { id } = useParams<{ id: string }>();
  const placeId = useSearchParams().get('placeId') ?? 'orfali';
  const router = useRouter();
  const back = useGoBack();
  const menu = getMenu(placeId);
  const product = menuProduct(menu, id) ?? getProduct('coconut-macchiato')!;
  const { addToCart, favoriteProducts, toggleFavoriteProduct } = useStore();
  const isFavorite = favoriteProducts.includes(product.id);
  const [size, setSize] = useState<Size>('M');
  const [selection, setSelection] = useState<AddonSelection>({});
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const isDrink = product.addonGroups.length > 0;
  const price = unitPrice(product, size, selection);

  const pick = (groupId: string, optionId: string) => {
    setSelection((s) => {
      const next = { ...s };
      if (next[groupId] === optionId) delete next[groupId];
      else next[groupId] = optionId;
      return next;
    });
    setOpenGroup(null);
  };

  return (
    <main className="screen sheet-in">
      <div className="scroll" style={{ paddingBottom: 150 }}>
        <div className="relative" style={{ height: HERO }}>
          {product.hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.hero} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#EFE9E2] to-[#F8F5F1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" className="h-[280px] w-[240px] object-contain" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-white/0 to-white" />
        </div>
        <h1 className="mx-auto -mt-2 max-w-[220px] text-center text-[28px] font-medium leading-8">{product.name}</h1>

        <div className="mt-[30px] px-5">
          {isDrink && (
            <>
              <h2 className="mb-[22px] text-[24px]">Customize</h2>
              <div className="relative flex justify-between">
                {product.addonGroups.map((gid) => {
                  const group = getAddonGroup(gid)!;
                  const option = group.options.find((o) => o.id === selection[gid]);
                  const open = openGroup === gid;
                  return (
                    <button key={gid} type="button" aria-label={slotLabel(group, option?.id)} aria-expanded={open} onClick={() => setOpenGroup(open ? null : gid)} className="flex w-[66px] flex-col items-center">
                      <span className={cx('flex h-16 w-16 items-center justify-center overflow-hidden rounded-full transition-colors', open ? 'bg-black text-white' : 'bg-surface')}>
                        {option && !open ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={option.image} alt="" className="h-12 w-12 object-contain" />
                        ) : (
                          <Plus size={28} strokeWidth={1.6} />
                        )}
                      </span>
                      <span className="mt-2 whitespace-pre-line text-center text-[13px] leading-4">{slotLabel(group, option?.id).replace(' ', '\n')}</span>
                    </button>
                  );
                })}
                {openGroup && (
                  <>
                    <button type="button" aria-label="Close add-ons" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenGroup(null)} />
                    <div className="absolute -top-[190px] left-0 right-0 z-20 flex justify-center gap-2 fade-in">
                      {getAddonGroup(openGroup)!.options.map((o) => {
                        const selected = selection[openGroup] === o.id;
                        return (
                          <button key={o.id} type="button" aria-label={o.name} onClick={() => pick(openGroup, o.id)} className="flex h-[168px] w-[112px] flex-col items-center rounded-[26px] bg-[#F8F6F4] pt-3 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={o.image} alt="" className="h-16 w-16 object-contain" />
                            <span className="mb-0.5 mt-2 text-[15px] font-medium">{o.name}</span>
                            <Price amount={o.price} />
                            <span className={cx('mt-3 flex h-7 w-7 items-center justify-center rounded-full', selected ? 'bg-black text-white' : 'bg-[#E6E6E6]')}>
                              {selected ? <Check size={16} /> : <Plus size={16} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className="mt-8 rounded-3xl bg-card p-4">
            <div className="flex justify-around">
              {[
                [`${product.nutrition.kcal} kcal`, 'Energy'],
                [`${product.nutrition.protein} g`, 'Protein'],
                [`${product.nutrition.fats} g`, 'Fats'],
                [`${product.nutrition.carbs} g`, 'Carbs'],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col items-center gap-2">
                  <span className="text-[18px] font-medium">{v}</span>
                  <span className="text-[14px] text-gray">{l}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => router.push(`/ingredients/${product.id}`)} className="mt-[18px] h-[50px] w-full rounded-full bg-[#E2E2E2] text-[16px]">
              Ingredients
            </button>
          </div>

          <h2 className="mb-3.5 mt-9 text-[24px]">Details</h2>
          <p className="text-[16px] leading-[23px] text-gray">{product.details}</p>
          <h2 className="mb-[22px] mt-9 text-[24px]">Better together</h2>
        </div>
        <div className="hscroll items-start gap-2.5 px-5">
          {BETTER_TOGETHER.filter((pid) => pid !== product.id).map((pid) => (
            <ProductTile key={pid} product={menuProduct(menu, pid)!} placeId={placeId} plusColor="var(--color-orange)" imageSize={110} className="min-h-[190px] w-[122px] shrink-0" />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 flex justify-between" style={{ top: 'calc(var(--safe-top) + 10px)' }}>
        <CircleButton label="Close" variant="white" size={52} onClick={back} className="pointer-events-auto">
          <X size={24} />
        </CircleButton>
        <CircleButton label={isFavorite ? 'Remove from favorites' : 'Save to favorites'} variant="white" size={52} onClick={() => toggleFavoriteProduct(product.id)} className="pointer-events-auto">
          <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
        </CircleButton>
      </div>

      <div className="absolute inset-x-3.5 flex items-center gap-3 rounded-[40px] bg-white p-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.14)]" style={{ bottom: 'calc(var(--safe-bottom) + 8px)' }}>
        {isDrink && (
          <div className="flex h-[60px] items-center rounded-full bg-field p-1" role="radiogroup" aria-label="Size">
            {(['M', 'L'] as Size[]).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSize(s)} className={cx('flex h-[52px] min-w-[46px] flex-col items-center justify-center rounded-full px-3 transition-all', size === s && 'bg-[#DDD] px-[18px]')}>
                <span className="text-[17px]">{s}</span>
                {size === s && <span className="text-[12px] text-gray">{product.sizes[s]}</span>}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1">
          <SwipeToOrder
            amount={price}
            onComplete={() => {
              addToCart({ productId: product.id, placeId, size, addons: selection });
              setTimeout(() => router.replace('/cart'), 450);
            }}
          />
        </div>
      </div>
    </main>
  );
}
