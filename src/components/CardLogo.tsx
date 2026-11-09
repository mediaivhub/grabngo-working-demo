import type { CardBrand } from '@/store/AppStore';

export function CardLogo({ brand, small }: { brand: CardBrand; small?: boolean }) {
  const s = small ? 0.62 : 1;
  const box = { width: 56 * s, height: 36 * s, borderRadius: 6 * s };
  if (brand === 'mastercard')
    return (
      <span className="flex shrink-0 items-center justify-center bg-black" style={box}>
        <span className="rounded-full bg-[#EB001B]" style={{ width: 20 * s, height: 20 * s, marginRight: -7 * s }} />
        <span className="rounded-full bg-[#F79E1B] opacity-90" style={{ width: 20 * s, height: 20 * s }} />
      </span>
    );
  return (
    <span className="flex shrink-0 items-center justify-center font-extrabold italic tracking-tight text-white" style={{ ...box, background: brand === 'visa' ? '#1A1F71' : '#2E6DB4', fontSize: (brand === 'visa' ? 17 : 12) * s }}>
      {brand === 'visa' ? 'VISA' : brand === 'amex' ? 'AMEX' : 'CARD'}
    </span>
  );
}

export function OutlineLogo({ children }: { children: React.ReactNode }) {
  return <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md border border-ink bg-white text-[14px] font-semibold text-muted">{children}</span>;
}
