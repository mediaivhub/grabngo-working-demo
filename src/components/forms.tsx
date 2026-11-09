'use client';

import { Check, ChevronDown, Info } from 'lucide-react';
import { forwardRef, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx, NavHeader } from '@/components/ui';

export type FieldStatus = 'idle' | 'error' | 'valid';

export function ErrorText({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[14px] text-error" role="alert">
      <Info size={17} /> {text}
    </p>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; status?: FieldStatus; error?: string; prefix?: string };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, status = 'idle', error, prefix, className, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const border = status === 'error' ? 'border-error' : status === 'valid' ? 'border-green' : focused ? 'border-ink' : 'border-transparent';
  const bg = status === 'idle' && !focused ? 'bg-field' : 'bg-white';
  return (
    <label className="flex flex-col gap-2.5">
      {label && <span className="text-[15px] text-ink">{label}</span>}
      <span className={cx('flex h-14 items-center rounded-full border-[1.5px] px-[22px] transition-colors', border, bg)}>
        {prefix && (
          <span className="mr-3.5 flex items-center gap-1.5 text-[16px] text-ink">
            {prefix} <ChevronDown size={14} className="text-gray-light" />
          </span>
        )}
        <input
          ref={ref}
          className={cx('h-full flex-1 bg-transparent text-[16px] text-ink placeholder:text-field-text', className)}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {status === 'valid' && (
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-green text-white">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </span>
      {status === 'error' && error && <ErrorText text={error} />}
    </label>
  );
});

/** Row of digit boxes backed by one input (so paste and SMS autofill work). */
export function OtpInput({ length = 5, value, onChange, error }: { length?: number; value: string; onChange: (v: string) => void; error?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex justify-between gap-2.5" onClick={() => ref.current?.focus()}>
      {Array.from({ length }, (_, i) => {
        const active = focused && i === Math.min(value.length, length - 1);
        return (
          <span key={i} className={cx('flex h-16 flex-1 items-center justify-center rounded-[18px] border-[1.5px] text-[18px]', active && !error ? 'border-ink bg-white' : 'border-transparent bg-field')}>
            {value[i] ?? (active ? <span className="h-5 w-px animate-pulse bg-gray" /> : '')}
          </span>
        );
      })}
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        aria-label="Verification code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 opacity-0"
      />
    </div>
  );
}

/** Orb + big title layout shared by login, sign-up, verify and success screens. */
export function FormScreen({ header, orb, title, subtitle, children, footer, headerRight, hideBack }: { header?: string; orb: string; title: string; subtitle?: string; children?: ReactNode; footer?: ReactNode; headerRight?: ReactNode; hideBack?: boolean }) {
  return (
    <main className="screen pt-safe pb-safe">
      <NavHeader title={header} right={headerRight} hideBack={hideBack} />
      <div className="scroll px-5 pb-6 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={orb} alt="" className="-ml-1.5 h-28 w-28" />
        <h1 className="mt-7 whitespace-pre-line text-[28px] font-extrabold leading-8 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 whitespace-pre-line text-[16.5px] leading-[23px]">{subtitle}</p>}
        <div className="mt-6 flex flex-col gap-4">{children}</div>
      </div>
      {footer && <div className="flex flex-col gap-3.5 px-5 pb-3">{footer}</div>}
    </main>
  );
}

export function SwitchLink({ muted, link, onClick }: { muted: string; link: string; onClick: () => void }) {
  return (
    <p className="text-center text-[16px] text-gray-light">
      {muted}{' '}
      <button type="button" onClick={onClick} className="font-medium text-ink">
        {link}
      </button>
    </p>
  );
}
