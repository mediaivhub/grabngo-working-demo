'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { RangeSlider } from '@/components/RangeSlider';
import { Button, cx, NavHeader, RadioDot, useGoBack } from '@/components/ui';
import { foodTagOptions, PRICE_CEILING, products, ratingOptions } from '@/data/mock';
import { EMPTY_FILTERS, useStore, type SearchFilters } from '@/store/AppStore';

function PriceInput({ value, placeholder, onChange, label }: { value: number | null; placeholder: string; onChange: (v: number | null) => void; label: string }) {
  return (
    <label className={cx('flex h-[52px] flex-1 items-center gap-1.5 rounded-2xl border px-[18px] focus-within:border-ink focus-within:bg-white', value !== null ? 'border-ink bg-white' : 'border-transparent bg-surface')}>
      <span className={value !== null ? 'text-ink' : 'text-gray-light'}>AED</span>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '');
          onChange(digits ? Math.min(Number(digits), PRICE_CEILING) : null);
        }}
        className="h-full flex-1 bg-transparent text-[16px] placeholder:text-gray-light"
      />
    </label>
  );
}

export default function SearchFilterScreen() {
  const back = useGoBack('/search');
  const { searchFilters, setSearchFilters } = useStore();
  const [draft, setDraft] = useState<SearchFilters>(searchFilters);
  const dirty = JSON.stringify(draft) !== JSON.stringify(searchFilters);
  const anySet = JSON.stringify(draft) !== JSON.stringify(EMPTY_FILTERS);
  const counts = Object.fromEntries(foodTagOptions.map((t) => [t.id, products.filter((p) => p.foodTags.includes(t.id)).length]));
  const set = (patch: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const apply = () => {
    const { minPrice, maxPrice } = draft;
    // Keep the range the right way round if the inputs were typed backwards.
    setSearchFilters(minPrice !== null && maxPrice !== null && minPrice > maxPrice ? { ...draft, minPrice: maxPrice, maxPrice: minPrice } : draft);
    back();
  };

  return (
    <main className="screen pt-safe bg-surface sheet-in">
      <div className="border-b border-divider bg-white py-1.5">
        <NavHeader
          title="Sort & Filter"
          fallback="/search"
          right={
            anySet ? (
              <button type="button" onClick={() => setDraft(EMPTY_FILTERS)} className="text-[15px] text-gray">
                Reset
              </button>
            ) : undefined
          }
        />
      </div>
      <div className="scroll pb-6">
        <section className="mt-1.5 rounded-3xl bg-white p-5">
          <p className="mb-3.5 text-[14px] text-gray">Filter by Price</p>
          <div className="mb-3.5 flex items-center gap-3.5">
            <PriceInput label="Minimum price" value={draft.minPrice} placeholder="0" onChange={(v) => set({ minPrice: v })} />
            <span className="h-[1.5px] w-4 bg-divider" />
            <PriceInput label="Maximum price" value={draft.maxPrice} placeholder={String(PRICE_CEILING)} onChange={(v) => set({ maxPrice: v })} />
          </div>
          <RangeSlider min={0} max={PRICE_CEILING} low={draft.minPrice ?? 0} high={draft.maxPrice ?? PRICE_CEILING} onChange={(lo, hi) => set({ minPrice: lo === 0 ? null : lo, maxPrice: hi === PRICE_CEILING ? null : hi })} />
        </section>
        <section className="mt-1.5 rounded-3xl bg-white p-5" role="radiogroup" aria-label="Food categories">
          <p className="mb-1 text-[14px] text-gray">Food Categories</p>
          {foodTagOptions.map((t, i) => {
            const disabled = counts[t.id] === 0;
            const selected = draft.foodTag === t.id;
            return (
              <button key={t.id} type="button" role="radio" aria-checked={selected} disabled={disabled} onClick={() => set({ foodTag: selected ? null : t.id })} className="flex w-full items-center gap-5 text-left">
                <RadioDot selected={selected} />
                <span className={cx('flex flex-1 items-center justify-between py-[17px]', i > 0 && 'border-t border-divider')}>
                  <span className={cx('text-[16px]', disabled && 'text-gray')}>{t.label}</span>
                  <span className="text-[15px] text-gray">{counts[t.id]}</span>
                </span>
              </button>
            );
          })}
        </section>
        <section className="mt-1.5 rounded-3xl bg-white p-5" role="radiogroup" aria-label="Rating">
          <p className="mb-3.5 text-[14px] text-gray">Rating</p>
          <div className="flex justify-between">
            {ratingOptions.map((r, i) => {
              const selected = draft.minRating === r;
              return (
                <button key={r} type="button" role="radio" aria-checked={selected} onClick={() => set({ minRating: selected ? null : r })} className="flex items-center gap-1.5">
                  <RadioDot selected={selected} />
                  <Star size={15} fill="currentColor" />
                  <span className="-ml-0.5 text-[16px] font-medium">
                    {r.toFixed(1)}
                    {i === 0 ? '+' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <div className="pb-safe bg-white px-5 pt-2.5">
        <Button size="lg" variant={dirty ? 'primary' : 'secondary'} disabled={!dirty} onClick={apply}>
          Apply
        </Button>
      </div>
    </main>
  );
}
