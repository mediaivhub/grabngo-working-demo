'use client';

import { ChevronDown, ChevronRight, ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { formatAmount } from '@/lib/pricing';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

/** Goes back in history, or to `fallback` when this page was opened directly. */
export function useGoBack(fallback = '/home') {
  const router = useRouter();
  return () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.replace(fallback);
  };
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary'; size?: 'md' | 'lg' };

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'w-full rounded-full font-semibold transition active:scale-[0.99] active:opacity-85',
        size === 'lg' ? 'h-[58px] text-[17px]' : 'h-[52px] text-[17px]',
        variant === 'primary' ? 'bg-black text-white disabled:bg-field disabled:text-field-text' : 'bg-field text-field-text',
        className,
      )}
      {...rest}>
      {children}
    </button>
  );
}

export function Wordmark({ size = 18, weight = 600 }: { size?: number; weight?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: weight, letterSpacing: -0.5 }} className="text-black">
      Grab<span className="text-brand">n</span>Go
    </span>
  );
}

export function TermsFooter() {
  return (
    <p className="mt-[18px] text-center text-[10px] leading-[14px] text-text">
      By continuing, you agree to GrabnGo&apos;s
      <br />
      <u>Terms</u> & <u>Conditions</u>.
    </p>
  );
}

/** UAE Dirham sign: a "D" struck through by two bars. */
export function DirhamSign({ size, color = 'currentColor' }: { size: number; color?: string }) {
  return (
    <svg width={size * 0.92} height={size * 0.8} viewBox="0 0 20 17" aria-hidden>
      <path d="M4.5 1.5h5c4.6 0 7.5 2.9 7.5 7s-2.9 7-7.5 7h-5z" stroke={color} strokeWidth={1.9} fill="none" />
      <path d="M.8 6.6h18.4M.8 10.4h18.4" stroke={color} strokeWidth={1.6} />
    </svg>
  );
}

export function Price({ amount, size = 15, color = 'var(--color-gray)', weight = 400, fixed, className }: { amount: number; size?: number; color?: string; weight?: number; fixed?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center', className)} style={{ color, fontSize: size, fontWeight: weight }} aria-label={`${formatAmount(amount, fixed)} dirhams`}>
      <DirhamSign size={size} color={color} />
      <span style={{ marginLeft: size * 0.18 }}>{formatAmount(amount, fixed)}</span>
    </span>
  );
}

export function CircleButton({ label, onClick, children, size = 44, variant = 'gray', className, style }: { label: string; onClick?: () => void; children: ReactNode; size?: number; variant?: 'white' | 'gray' | 'glass'; className?: string; style?: CSSProperties }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: size, height: size, ...style }}
      className={cx(
        'flex shrink-0 items-center justify-center rounded-full text-ink transition active:opacity-70',
        variant === 'white' && 'bg-white shadow-sm',
        variant === 'gray' && 'bg-surface',
        variant === 'glass' && 'bg-white/70 backdrop-blur',
        className,
      )}>
      {children}
    </button>
  );
}

export function NavHeader({ title, right, hideBack, onBack, className, fallback }: { title?: string; right?: ReactNode; hideBack?: boolean; onBack?: () => void; className?: string; fallback?: string }) {
  const back = useGoBack(fallback);
  return (
    <div className={cx('flex h-[52px] shrink-0 items-center px-3.5', className)}>
      <div className="w-12">
        {!hideBack && (
          <button type="button" aria-label="Back" onClick={onBack ?? back} className="p-1 text-ink">
            <ArrowLeft size={26} strokeWidth={1.8} />
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-[17px] font-medium text-ink">{title}</h1>
      <div className="flex w-12 justify-end">{right}</div>
    </div>
  );
}

export function SearchBar({ value, onChange, onClick, placeholder = 'Search', className }: { value?: string; onChange?: (v: string) => void; onClick?: () => void; placeholder?: string; className?: string }) {
  const inner = (
    <>
      <Search size={22} className="shrink-0 text-ink" />
      {onClick ? (
        <span className="flex-1 text-left text-[17px] text-gray">{placeholder}</span>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-full flex-1 bg-transparent text-[17px] text-ink placeholder:text-gray"
        />
      )}
    </>
  );
  const cls = cx('flex h-12 items-center gap-2.5 rounded-2xl bg-surface px-3.5', className);
  return onClick ? (
    <button type="button" role="search" onClick={onClick} className={cx(cls, 'w-[calc(100%-40px)]')}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function EmptyState({ orb, title, body }: { orb: string; title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 text-center fade-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={orb} alt="" className="h-[102px] w-[102px]" />
      <h2 className="mt-5 text-[22px] font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-[15px] leading-[22px] text-gray">{body}</p>
    </div>
  );
}

export const orbs = {
  cart: '/images/orbs/cart.png',
  search: '/images/orbs/search.png',
  check: '/images/orbs/check.png',
  user: '/images/orbs/user.png',
  phone: '/images/orbs/phone.png',
  fork: '/images/orbs/fork.png',
  cup: '/images/orbs/cup.png',
  location: '/images/orb-location.png',
  bell: '/images/orb-bell.png',
};

export function Pill({ label, icon, size = 'sm', tone = 'white', onClick }: { label: string; icon?: ReactNode; size?: 'sm' | 'md'; tone?: 'white' | 'gray'; onClick?: () => void }) {
  const md = size === 'md';
  const cls = cx(
    'inline-flex shrink-0 items-center rounded-full',
    md ? 'h-10 gap-1.5 px-3.5 text-[15px] text-ink' : 'h-[26px] gap-[5px] px-[9px] text-[13px] text-gray',
    tone === 'white' ? 'bg-white' : 'bg-surface',
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  ) : (
    <span className={cls}>
      {icon}
      {label}
    </span>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex h-10 items-center gap-4 rounded-[14px] bg-surface px-3">
      <button type="button" aria-label="Decrease" onClick={() => onChange(value - 1)} className="text-xl leading-none">
        −
      </button>
      <span className="min-w-3.5 text-center text-[17px] font-medium">{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(value + 1)} className="text-xl leading-none">
        +
      </button>
    </div>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={cx('flex h-7 w-16 items-center rounded-full p-0.5 transition-colors', value ? 'bg-[#5A5A5A]' : 'bg-[#E3E3E3]')}>
      <span className={cx('h-6 w-[38px] rounded-full bg-white transition-transform', value && 'translate-x-[22px]')} />
    </button>
  );
}

export function Switch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={cx('flex h-8 w-[52px] shrink-0 items-center rounded-full p-0.5 transition-colors', value ? 'bg-[#5CBF6C]' : 'bg-[#E9E9EA]')}>
      <span className={cx('h-7 w-7 rounded-full bg-white shadow transition-transform', value && 'translate-x-5')} />
    </button>
  );
}

export function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-divider bg-field">
      {selected && <span className="h-3 w-3 rounded-full border-2 border-[#6E6E6E] bg-[#333]" />}
    </span>
  );
}

export function Stars({ value, size = 22, onChange, gap = 4 }: { value: number; size?: number; onChange?: (v: number) => void; gap?: number }) {
  return (
    <div className="flex" style={{ gap }} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0;
        const star = (
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`s${i}-${size}-${fill}`}>
                <stop offset={`${fill * 100}%`} stopColor="var(--color-orange)" />
                <stop offset={`${fill * 100}%`} stopColor="#EFEFEF" />
              </linearGradient>
            </defs>
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z" fill={`url(#s${i}-${size}-${fill})`} />
          </svg>
        );
        return onChange ? (
          <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} stars`} onClick={() => onChange(i)}>
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </div>
  );
}

export function SectionChevron({ open }: { open: boolean }) {
  return <ChevronDown size={20} className={cx('text-gray transition-transform', open && 'rotate-180')} />;
}

export { ChevronRight, X };
