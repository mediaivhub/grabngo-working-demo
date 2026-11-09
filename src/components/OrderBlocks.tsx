import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx, Price } from '@/components/ui';
import type { Place } from '@/data/mock';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('mt-1.5 rounded-3xl bg-white p-5', className)}>{children}</section>;
}

export function PickupInfo({ place, children }: { place: Place; children?: ReactNode }) {
  return (
    <Section>
      <div className="flex items-center">
        <div className="flex-1">
          <h2 className="text-[22px] font-bold tracking-tight">Pickup Info</h2>
          <p className="mt-2 max-w-[220px] text-[15px] leading-5">
            {place.name}, {place.address}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/misc/cup-carrier.png" alt="" className="h-[78px] w-24 object-contain" />
      </div>
      {children}
    </Section>
  );
}

export function OrderSummary({ totals }: { totals: { subtotal: number; serviceFee: number; tax: number; total: number } }) {
  const rows: [string, number, boolean?][] = [
    ['Subtotal', totals.subtotal],
    ['Service Fee', totals.serviceFee],
    ['Estimated Tax', totals.tax, true],
    ['Total', totals.total],
  ];
  return (
    <Section>
      <h2 className="mb-3 text-[22px] font-bold tracking-tight">Order Summary</h2>
      {rows.map(([label, value, info]) => (
        <div key={label} className="flex items-center justify-between py-2">
          <span className="flex items-center gap-1.5 text-[16px]">
            {label} {info && <Info size={16} className="text-gray" />}
          </span>
          <Price amount={value} size={16} color="var(--color-ink)" />
        </div>
      ))}
    </Section>
  );
}

export function TotalBar({ total, label, onClick, disabled }: { total: number; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="pb-safe flex items-center gap-4 border-t border-divider bg-white px-5 pt-3">
      <Price amount={total} size={24} color="var(--color-ink)" weight={500} />
      <button type="button" disabled={disabled} onClick={onClick} className="h-14 flex-1 rounded-full bg-black text-[17px] font-semibold text-white disabled:bg-field disabled:text-field-text">
        {label}
      </button>
    </div>
  );
}
