'use client';

import { Droplet, Pipette, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { CircleButton, useGoBack } from '@/components/ui';
import { getProduct, ingredients } from '@/data/mock';

export function IngredientsView() {
  const { id } = useParams<{ id: string }>();
  const back = useGoBack();
  const product = getProduct(id);
  const list = ingredients.filter((i) => !product || product.ingredients.includes(i.id));
  return (
    <main className="screen pt-safe sheet-in">
      <CircleButton label="Close" size={48} onClick={back} className="absolute right-3.5 z-10" style={{ top: 'calc(var(--safe-top) + 14px)' }}>
        <X size={22} />
      </CircleButton>
      <h1 className="mx-5 mt-11 text-[24px] font-bold tracking-tight">Ingredients</h1>
      <div className="scroll pb-safe px-5 pt-3">
        {list.map((item, i) => (
          <div key={item.id} className="flex items-center gap-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" className="h-[60px] w-[60px] object-contain" />
            <div className={`flex-1 py-4 ${i > 0 ? 'border-t border-divider' : ''}`}>
              <p className="text-[19px]">{item.name}</p>
              <span className="mt-2 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-surface px-2.5 text-[16px] text-gray">
                {item.unit === 'drop' ? <Droplet size={16} /> : <Pipette size={16} />} {item.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
