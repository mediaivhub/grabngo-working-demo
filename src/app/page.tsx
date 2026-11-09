'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Wordmark } from '@/components/ui';
import { hasOnboarded } from '@/lib/onboarding';

const LAUNCH_DURATION_MS = 1500;

export default function LaunchScreen() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace(hasOnboarded() ? '/home' : '/welcome'), LAUNCH_DURATION_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="screen pt-safe pb-safe">
      <div className="flex flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="GrabnGo" className="h-[216px] w-[220px] object-contain fade-in" />
      </div>
      <div className="pb-5 text-center">
        <Wordmark size={18} />
      </div>
    </main>
  );
}
