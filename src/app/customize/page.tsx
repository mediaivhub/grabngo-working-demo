'use client';

import { X } from 'lucide-react';
import { UsualCard } from '@/components/cards';
import { CircleButton, Toggle, useGoBack } from '@/components/ui';
import { USUAL } from '@/data/mock';
import { useStore, type UsualMode } from '@/store/AppStore';

const SECTIONS: { mode: UsualMode; title: string; badge?: string }[] = [
  { mode: 'recent', title: 'Your recent order' },
  { mode: 'favorite', title: 'Favorite order', badge: 'Most Ordered' },
  { mode: 'frequent', title: 'Frequently ordered' },
];

/** Choose which list powers "The usual" on Home. */
export default function CustomizeScreen() {
  const back = useGoBack();
  const { usualMode, setUsualMode, favoriteProducts } = useStore();
  const idsFor = (mode: UsualMode) => (mode === 'favorite' && favoriteProducts.length ? favoriteProducts.slice(0, 3) : USUAL[mode]);
  return (
    <main className="screen pt-safe sheet-in">
      <div className="mx-auto mt-1.5 h-[5px] w-9 rounded-full bg-[#D9D9D9]" />
      <div className="relative flex h-14 items-center justify-center">
        <h1 className="text-[18px] font-medium">Customize</h1>
        <CircleButton label="Close" onClick={back} className="absolute right-4">
          <X size={20} />
        </CircleButton>
      </div>
      <div className="scroll pb-safe space-y-5 p-5">
        {SECTIONS.map((s) => (
          <UsualCard
            key={s.mode}
            title={s.title}
            productIds={idsFor(s.mode)}
            dark={usualMode === s.mode}
            badgeFirst={s.badge}
            action={<Toggle label={s.title} value={usualMode === s.mode} onChange={(on) => on && setUsualMode(s.mode)} />}
          />
        ))}
      </div>
    </main>
  );
}
