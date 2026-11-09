'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cx, SectionChevron, Switch } from '@/components/ui';

export function SettingsRow({ Icon, title, subtitle, first, value, onToggle, onClick, chevron, right }: { Icon: LucideIcon; title: string; subtitle?: string; first?: boolean; value?: boolean; onToggle?: (v: boolean) => void; onClick?: () => void; chevron?: boolean; right?: ReactNode }) {
  const body = (
    <>
      <Icon size={24} strokeWidth={1.6} className="w-7 shrink-0 text-ink" />
      <span className={cx('flex min-h-[66px] flex-1 items-center gap-3 py-3 text-left', !first && 'border-t border-divider')}>
        <span className="flex-1">
          <span className="block text-[17px] text-ink">{title}</span>
          {subtitle && <span className="mt-0.5 block text-[13px] text-gray">{subtitle}</span>}
        </span>
        {right}
        {value !== undefined && onToggle && <Switch value={value} onChange={onToggle} label={title} />}
        {chevron && <ChevronRight size={20} className="text-gray-light" />}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-4 active:opacity-60">
      {body}
    </button>
  ) : (
    <div className="flex items-center gap-4">{body}</div>
  );
}

export function SettingsSection({ title, children, collapsible }: { title?: string; children: ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="mb-1.5 rounded-[26px] bg-white px-5 pb-1.5">
      {title && (
        <button type="button" disabled={!collapsible} aria-expanded={collapsible ? open : undefined} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between pb-1.5 pt-[22px]">
          <span className="text-[15px] font-medium text-gray">{title}</span>
          {collapsible && <SectionChevron open={!open} />}
        </button>
      )}
      {open && children}
    </section>
  );
}

export const alwaysOn = <span className="text-[14px] text-gray-light">Always on</span>;
