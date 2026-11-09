'use client';

import { useRouter } from 'next/navigation';
import { Button, TermsFooter } from '@/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <main className="screen pt-safe pb-safe px-6">
      <div className="flex flex-1 flex-col items-center justify-end pb-11 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="GrabnGo" className="mb-14 h-[188px] w-[192px] object-contain" />
        <h1 className="px-2 text-[23px] font-extrabold leading-[27px] tracking-tight text-text">
          Your food, ready when you arrive. Zero wait, pure satisfaction.
        </h1>
        <p className="mt-4 text-[15px] leading-[21px] text-text">Smart pickup ordering tracks your journey. Restaurant notified, food timed.</p>
      </div>
      <div className="pb-3">
        <Button onClick={() => router.push('/onboarding')}>Get Started</Button>
        <Button variant="secondary" className="mt-3" onClick={() => router.push('/auth/login')}>
          Log in
        </Button>
        <TermsFooter />
      </div>
    </main>
  );
}
