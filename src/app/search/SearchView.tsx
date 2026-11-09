'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PlaceRow, ProductTile } from '@/components/cards';
import { EmptyState, orbs, useGoBack } from '@/components/ui';
import { getPlace } from '@/data/mock';
import { countLabel, filtersActive, searchPlaces, searchProducts } from '@/lib/search';
import { useStore } from '@/store/AppStore';

export function SearchView() {
  const router = useRouter();
  const back = useGoBack();
  const params = useSearchParams();
  const { searchFilters } = useStore();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [submitted, setSubmitted] = useState(Boolean(params.get('q') && params.get('submit')));
  const hasQuery = query.trim().length > 0;
  const filtering = filtersActive(searchFilters);
  const items = searchProducts(query, searchFilters);
  const placeResults = searchPlaces(query, searchFilters);
  const noResults = submitted ? placeResults.length === 0 : hasQuery && items.length === 0;
  const submit = () => hasQuery && setSubmitted(true);

  return (
    <main className="screen pt-safe">
      <form
        className="flex h-16 shrink-0 items-center gap-3 border-b border-divider px-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}>
        <Search size={24} className="text-muted" />
        <input
          autoFocus
          type="search"
          enterKeyHint="search"
          aria-label="Search"
          placeholder="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSubmitted(false);
          }}
          className="h-full flex-1 bg-transparent text-[17px] font-medium placeholder:font-normal placeholder:text-gray [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="button" aria-label="Sort and filter" onClick={() => router.push('/search-filter')} className="relative">
          <SlidersHorizontal size={23} className={filtering ? 'text-ink' : 'text-[#A5A5A5]'} />
          {filtering && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />}
        </button>
        <span className="h-6 w-px bg-divider" />
        {/* "Search" submits; with nothing typed it doubles as Cancel. */}
        {hasQuery ? (
          <button type="submit" className="text-[16px]">
            Search
          </button>
        ) : (
          <button type="button" onClick={back} className="text-[16px]">
            Cancel
          </button>
        )}
      </form>

      {noResults ? (
        <EmptyState orb={orbs.search} title="No Results Found" body="Try a different search term or explore popular items." />
      ) : submitted ? (
        <div className="scroll pb-safe flex flex-col gap-2.5 px-5">
          <p className="mb-1 mt-5 text-[16px] text-gray">{countLabel(placeResults.length)}</p>
          {placeResults.map((p) => (
            <PlaceRow key={p.id} place={p} />
          ))}
        </div>
      ) : (
        <div className="scroll bg-surface">
          {hasQuery && (
            <div className="mb-1.5 rounded-b-3xl bg-white px-5 pb-2">
              {items.slice(0, 6).map((p, i) => (
                <button key={p.id} type="button" onClick={() => router.push(`/product/${p.id}?placeId=${p.placeId}`)} className="flex w-full items-center gap-[18px] text-left">
                  <span className="h-4 w-4 shrink-0 rounded-full border-[3.5px] border-[#8A8A8A]" />
                  <span className={`flex-1 py-3 ${i > 0 ? 'border-t border-divider' : ''}`}>
                    <span className="block text-[16px]">{p.name}</span>
                    <span className="block text-[13px] text-gray">{getPlace(p.placeId)?.name.replace(/^STAY by /, '')}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="min-h-[600px] rounded-t-3xl bg-white pb-10 pt-5">
            <p className="mx-5 mb-3.5 text-[16px] text-gray">{hasQuery ? countLabel(items.length) : 'Popular items'}</p>
            <div className="hscroll items-start gap-2 px-5">
              {items.slice(0, 12).map((p) => (
                <ProductTile key={p.id} product={p} placeId={p.placeId} className="min-h-[160px] w-[118px] shrink-0" />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
