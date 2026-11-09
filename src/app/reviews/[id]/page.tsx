'use client';

import { Star, X } from 'lucide-react';
import { useState } from 'react';
import { CircleButton, Stars, useGoBack } from '@/components/ui';
import { REVIEW_SUMMARY, reviews } from '@/data/mock';

const SORTS = ['By default', 'Top rated', 'Lowest rated'] as const;

export default function ReviewsScreen() {
  const back = useGoBack();
  const [sort, setSort] = useState(0);
  const data = sort === 1 ? [...reviews].sort((a, b) => b.stars - a.stars) : sort === 2 ? [...reviews].sort((a, b) => a.stars - b.stars) : reviews;
  return (
    <main className="screen pt-safe bg-surface sheet-in">
      <div className="mb-1.5 flex items-center gap-2.5 rounded-[28px] bg-white px-5 py-3.5">
        <span className="text-[52px] font-extrabold tracking-[-1.5px]">{REVIEW_SUMMARY.average}</span>
        <span className="flex h-10 items-center gap-1.5 rounded-full bg-surface px-3 text-[14px]">
          <Star size={17} className="text-orange" /> Based on customer reviews.
        </span>
        <CircleButton label="Close" size={34} onClick={back} className="ml-auto">
          <X size={17} />
        </CircleButton>
      </div>
      <div className="scroll pb-safe rounded-t-[28px] bg-white px-5">
        <div className="flex items-center justify-between py-[18px]">
          <h1 className="text-[24px] font-bold tracking-tight">{REVIEW_SUMMARY.count} Reviews</h1>
          <button type="button" onClick={() => setSort((s) => (s + 1) % SORTS.length)} className="h-11 rounded-full bg-surface px-[18px] text-[15px] text-gray">
            {SORTS[sort]}
          </button>
        </div>
        {data.map((r, i) => (
          <div key={r.id} className={`py-[18px] ${i > 0 ? 'border-t border-divider' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[17px] font-semibold">{r.author}</p>
                <p className="mt-0.5 text-[14px] text-gray">{r.ago}</p>
              </div>
              <Stars value={r.stars} size={24} gap={5} />
            </div>
            <p className="mt-3 text-[16px] leading-6">{r.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
