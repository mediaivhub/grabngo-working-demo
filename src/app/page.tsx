'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/ui';
import { hasOnboarded } from '@/lib/onboarding';

/** Logo springs in with ripples, wordmark rises, then the logo zooms toward you as the app opens. */
const EXIT_AT_MS = 1650;
const LAUNCH_DURATION_MS = 2000;

export default function LaunchScreen() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const next = hasOnboarded() ? '/home' : '/welcome';
    router.prefetch(next);
    const a = setTimeout(() => setLeaving(true), EXIT_AT_MS);
    const b = setTimeout(() => router.replace(next), LAUNCH_DURATION_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [router]);

  return (
    <main className="screen pt-safe pb-safe overflow-hidden">
      {/* warm glow behind the logo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2">
        <div className="splash-glow h-full w-full rounded-full bg-[radial-gradient(circle,rgba(230,14,13,0.16),rgba(255,127,126,0.08)_40%,transparent_70%)]" />
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        {/* ripples pulse out from behind the logo */}
        {[0, 280, 560].map((d) => (
          <span key={d} className="splash-ripple absolute h-[200px] w-[200px] rounded-full border-2 border-brand/40" style={{ animationDelay: `${350 + d}ms` }} />
        ))}
        <div className={leaving ? 'splash-exit' : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="GrabnGo" className="splash-pop relative h-[216px] w-[220px] object-contain" />
        </div>
      </div>
      <div className={leaving ? 'splash-exit pb-5 text-center' : 'pb-5 text-center'}>
        <span className="cascade-in inline-block [animation-delay:450ms]">
          <Wordmark size={20} />
        </span>
        <p className="cascade-in mt-1 text-[12px] font-medium uppercase tracking-[0.25em] text-gray [animation-delay:650ms]">Order ahead · Skip the wait</p>
      </div>
    </main>
  );
}
