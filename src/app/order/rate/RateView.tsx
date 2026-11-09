'use client';

import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useStatusBarTone } from '@/components/StatusBarTone';
import { Button, CircleButton, cx, Stars, useGoBack } from '@/components/ui';
import { getPlace, getProduct, RATING_TAGS } from '@/data/mock';
import { useStore } from '@/store/AppStore';

export function RateView() {
  const id = useSearchParams().get('id');
  const back = useGoBack('/orders');
  const { orders, rateOrder } = useStore();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const place = getPlace(order?.placeId);
  const product = getProduct(order?.lines[0]?.productId);
  const [stars, setStars] = useState(order?.rating ?? 0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  useStatusBarTone('light');

  return (
    <main className="screen bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={place?.hero} alt="" className="absolute inset-x-0 top-0 h-[360px] w-full object-cover opacity-55" />
      <div className="absolute inset-x-4 flex items-center justify-between" style={{ top: 'calc(var(--safe-top) + 10px)' }}>
        <CircleButton label="Back" variant="glass" size={52} onClick={back}>
          <ArrowLeft size={24} />
        </CircleButton>
        <span className="text-[17px] font-medium text-white/75">{place?.kind === 'cafe' ? 'Cafe’s' : 'Restaurants'}</span>
        <span className="w-[52px]" />
      </div>
      <div className="relative mt-[240px] flex min-h-0 flex-1 flex-col rounded-t-[34px] bg-white sheet-in">
        <div className="scroll px-5 pt-7">
          <h1 className="text-center text-[32px] font-bold tracking-tight">Rate Experience</h1>
          <p className="mt-2 text-center text-[18px] text-gray">{product?.name ?? place?.name}</p>
          <div className="mt-[26px] flex justify-center">
            <Stars value={stars} size={56} gap={14} onChange={setStars} />
          </div>
          <div className="mt-[34px] flex flex-wrap justify-center gap-2">
            {RATING_TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button key={t} type="button" role="checkbox" aria-checked={on} onClick={() => setTags((s) => (on ? s.filter((x) => x !== t) : [...s, t]))} className={cx('h-11 rounded-full px-[18px] text-[16px]', on ? 'bg-black text-white' : 'bg-surface')}>
                  {t}
                </button>
              );
            })}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us more about your order…" aria-label="Comment" className="mt-9 min-h-[110px] w-full resize-none rounded-[18px] bg-card p-4 text-[16px] leading-[23px] outline-none placeholder:text-gray" />
        </div>
        <div className="pb-safe px-5 pt-3">
          <Button
            size="lg"
            disabled={stars === 0}
            onClick={() => {
              if (order) rateOrder(order.id, stars);
              back();
            }}>
            Submit Review
          </Button>
        </div>
      </div>
    </main>
  );
}
