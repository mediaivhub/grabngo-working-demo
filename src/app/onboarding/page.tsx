'use client';

import { Bell, ScanLine, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui';

const SLIDES = [
  { image: '/images/slide-1.jpg', bg: '#F5C3AA', text: 'Order ahead for your food ready on arrival.', Icon: Zap },
  { image: '/images/slide-2.jpg', bg: '#EEC3C3', text: 'Order now to start. We track distance and notify.', Icon: Bell },
  { image: '/images/slide-3.jpg', bg: '#CFBDA2', text: 'Show your QR code, collect your order, and leave.', Icon: ScanLine },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const finish = () => router.replace('/permissions/location');

  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setIndex(i);
  };

  return (
    <main className="screen">
      <div
        ref={track}
        className="hscroll h-full snap-x snap-mandatory"
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}>
        {SLIDES.map((s) => (
          <div key={s.image} className="relative h-full w-full shrink-0 snap-center" style={{ background: `linear-gradient(${s.bg} 0 12%, #fff 12%)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" className="absolute left-0 top-[10%] w-full" />
            <div className="absolute inset-x-0 top-[10%] h-10" style={{ background: `linear-gradient(${s.bg}, transparent)` }} />
            <div className="absolute inset-x-0 top-[48%] h-[30%]" style={{ background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.85) 55%, #fff)' }} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Skip"
        onClick={finish}
        className="absolute right-[18px] flex h-10 w-10 items-center justify-center rounded-full bg-white/55"
        style={{ top: 'calc(var(--safe-top) + 12px)' }}>
        <X size={18} strokeWidth={2.4} />
      </button>

      <div className="pb-safe absolute inset-x-6 bottom-0">
        <div className="flex justify-center gap-[22px]">
          {SLIDES.map(({ Icon }, i) => (
            <button key={i} type="button" aria-label={`Slide ${i + 1}`} onClick={() => goTo(i)} style={{ opacity: i === index ? 1 : 0.35 }}>
              <Icon size={26} color="#FF7F7E" fill="#FF7F7E" />
            </button>
          ))}
        </div>
        <p key={index} className="mt-6 min-h-[54px] px-3 text-center text-[20px] leading-[27px] text-text fade-in">
          {SLIDES[index].text}
        </p>
        <Button className="mt-5 mb-3" onClick={() => (index >= SLIDES.length - 1 ? finish() : goTo(index + 1))}>
          Next
        </Button>
      </div>
    </main>
  );
}
