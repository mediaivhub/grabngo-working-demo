'use client';

import { useRouter } from 'next/navigation';
import { Button, TermsFooter } from '@/components/ui';

const HEADLINE = 'Your food, ready when you arrive. Zero wait, pure satisfaction.';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <main className="screen pt-safe pb-safe overflow-hidden px-6">
      {/* warm colour blobs drifting behind everything */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="blob-a absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#FFD9C7] opacity-70 blur-3xl" />
        <div className="blob-b absolute -right-28 top-40 h-80 w-80 rounded-full bg-[#FFC9C8] opacity-60 blur-3xl" />
        <div className="blob-a absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#FFE9C2] opacity-60 blur-3xl [animation-delay:-4s]" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-end pb-9 text-center">
        {/* Logo over the pulsing red gradient glow */}
        <div className="relative mb-12 grid h-[240px] w-[240px] place-items-center">
          <div className="pointer-events-none absolute inset-[-90px]">
            <div className="splash-glow h-full w-full rounded-full bg-[radial-gradient(circle,rgba(230,14,13,0.2),rgba(255,127,126,0.1)_40%,transparent_70%)]" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="GrabnGo" className="splash-pop relative h-[188px] w-[192px] object-contain" />
        </div>
        <h1 className="px-2 text-[24px] font-extrabold leading-[29px] tracking-tight text-text">
          {HEADLINE.split(' ').map((w, i) => (
            <span key={i} className="word-rise" style={{ animationDelay: `${450 + i * 60}ms` }}>
              {w}&nbsp;
            </span>
          ))}
        </h1>
        <p className="cascade-in mt-4 text-[15px] leading-[21px] text-text/80 [animation-delay:1150ms]">
          Smart pickup ordering tracks your journey. Restaurant notified, food timed.
        </p>
      </div>
      <div className="relative pb-3">
        <div className="cascade-in [animation-delay:1300ms]">
          <Button className="btn-sheen" onClick={() => router.push('/onboarding')}>
            Get Started
          </Button>
        </div>
        <div className="cascade-in [animation-delay:1400ms]">
          <Button variant="secondary" className="mt-3" onClick={() => router.push('/auth/login')}>
            Log in
          </Button>
        </div>
        <div className="cascade-in [animation-delay:1500ms]">
          <TermsFooter />
        </div>
      </div>
    </main>
  );
}
