'use client';

import { useState } from 'react';
import { Button, TermsFooter } from '@/components/ui';

type Props = {
  orb: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => Promise<void> | void;
  onSecondary: () => void;
};

export function PermissionScreen({ orb, title, body, primaryLabel, secondaryLabel, onPrimary, onSecondary }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <main className="screen pt-safe pb-safe px-6">
      <div className="flex-1 pt-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={orb} alt="" className="-ml-0.5 h-[104px] w-[104px]" />
        <h1 className="mt-7 max-w-[260px] whitespace-pre-line text-[26px] font-extrabold leading-[29px] tracking-tight text-text">{title}</h1>
        <p className="mt-3 text-[16.5px] leading-[22px] text-text">{body}</p>
      </div>
      <div className="pb-3">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onPrimary();
            } finally {
              setBusy(false);
            }
          }}>
          {primaryLabel}
        </Button>
        <Button variant="secondary" className="mt-3" disabled={busy} onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <TermsFooter />
      </div>
    </main>
  );
}
