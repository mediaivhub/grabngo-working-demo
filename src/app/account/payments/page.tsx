'use client';

import { Check, ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CardLogo, OutlineLogo } from '@/components/CardLogo';
import { cx, NavHeader, RadioDot } from '@/components/ui';
import { brandName } from '@/lib/cards';
import { useStore, type WalletId } from '@/store/AppStore';

const WALLETS: { id: WalletId; title: string; subtitle: string; logo: string }[] = [
  { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Fast and secure way to pay', logo: ' Pay' },
  { id: 'google-pay', title: 'Google Pay', subtitle: 'Safe, secure transactions', logo: 'G Pay' },
];

export default function ManagePaymentsScreen() {
  const router = useRouter();
  const { cards, defaultPayment, setDefaultPayment } = useStore();
  return (
    <main className="screen pt-safe bg-surface sheet-in">
      <div className="bg-white">
        <NavHeader title="Manage Payments" fallback="/profile" />
      </div>
      <div className="scroll pb-safe">
        <section className="mb-1.5 rounded-b-[28px] bg-white px-5 py-1.5">
          {cards.map((c, i) => {
            const isDefault = defaultPayment === c.id;
            return (
              <div key={c.id} className="flex items-center gap-4">
                <CardLogo brand={c.brand} />
                <div className={cx('flex min-h-[86px] flex-1 items-center py-3.5', i > 0 && 'border-t border-divider')}>
                  <div className="flex-1">
                    <p className="text-[18px] font-medium">
                      {brandName(c.brand)} .... {c.last4}
                    </p>
                    <p className="mt-0.5 text-[14px] text-gray">Expiration: {c.expiry.replace('/', '/20')}</p>
                  </div>
                  {isDefault ? (
                    <span aria-label="Default card" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
                      <Check size={22} />
                    </span>
                  ) : (
                    <button type="button" onClick={() => setDefaultPayment(c.id)} className="h-[38px] rounded-xl bg-surface px-3.5 text-[16px] active:bg-[#222] active:text-white">
                      Make Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <button type="button" onClick={() => router.push('/account/add-card')} className="flex w-full items-center gap-4">
            <OutlineLogo>
              <Plus size={22} className="text-ink" />
            </OutlineLogo>
            <span className="flex min-h-[86px] flex-1 items-center border-t border-divider py-3.5">
              <span className="flex-1 text-left text-[18px] font-medium">Add Payment Method</span>
              <ChevronRight size={22} />
            </span>
          </button>
        </section>
        <section className="rounded-[28px] bg-white px-5 py-1.5" role="radiogroup" aria-label="Mobile wallet">
          <h2 className="mb-1 mt-[18px] text-[22px] font-medium">Mobile wallet</h2>
          {WALLETS.map((w, i) => {
            const selected = defaultPayment === w.id;
            return (
              <button key={w.id} type="button" role="radio" aria-checked={selected} onClick={() => setDefaultPayment(w.id)} className="flex w-full items-center gap-4 text-left">
                <OutlineLogo>{w.logo}</OutlineLogo>
                <span className={cx('flex min-h-[86px] flex-1 items-center py-3.5', i > 0 && 'border-t border-divider')}>
                  <span className="flex-1">
                    <span className={cx('block text-[18px] font-medium', !selected && 'text-gray')}>{w.title}</span>
                    <span className="mt-0.5 block text-[14px] text-gray-light">{w.subtitle}</span>
                  </span>
                  <RadioDot selected={selected} />
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
