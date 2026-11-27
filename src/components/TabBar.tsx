'use client';

import { House, MapPinned, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { avatarSrc } from '@/components/cards';
import { cx } from '@/components/ui';
import { useStore } from '@/store/AppStore';

const TABS = [
  { href: '/home', label: 'Home', Icon: House, pop: 'tab-hop' },
  { href: '/map', label: 'Map', Icon: MapPinned, pop: 'tab-wobble' },
  { href: '/orders', label: 'Orders', Icon: ReceiptText, pop: 'tab-print' },
  { href: '/profile', label: 'Profile', Icon: null, pop: 'tab-flip' },
] as const;
const N = TABS.length;
const GAP = 5; // px between the pill and its column edges

/**
 * The liquid tab bar. The white pill doesn't slide, it pours: the leading edge races to the new
 * tab, the trailing edge follows a beat later, so it stretches across and springs back into a drop,
 * with a splash ring as it lands. Each icon has its own little move when it's picked.
 */
export function TabBar() {
  const pathname = usePathname();
  const { user, activeOrder } = useStore();
  const idx = TABS.findIndex((t) => t.href === pathname);

  // Remember where the pill came from, to know which edge leads (React's "adjust state on change" pattern).
  const [seen, setSeen] = useState({ now: idx, prev: idx });
  if (seen.now !== idx) setSeen({ now: idx, prev: seen.now });
  const dir = Math.sign(idx - seen.prev);
  const spring = 'cubic-bezier(0.5, 1.55, 0.45, 1)';
  const lead = `420ms ${spring} 0ms`;
  const trail = `520ms ${spring} 110ms`;

  return (
    <nav className="pb-safe relative bg-black px-3 pt-3" aria-label="Main">
      <div className="relative grid h-[52px] grid-cols-4">
        {idx >= 0 && (
          <>
            {/* the liquid pill */}
            <span
              aria-hidden
              className="absolute inset-y-0 rounded-full bg-white shadow-[0_0_28px_rgba(255,255,255,0.16)]"
              style={{
                left: `calc(${(idx / N) * 100}% + ${GAP}px)`,
                right: `calc(${((N - 1 - idx) / N) * 100}% + ${GAP}px)`,
                transition: dir >= 0 ? `left ${trail}, right ${lead}` : `left ${lead}, right ${trail}`,
              }}
            />
            {/* the splash as it lands */}
            {seen.prev !== idx && (
              <span
                key={idx}
                aria-hidden
                className="tab-splash pointer-events-none absolute inset-y-0 rounded-full border border-white/70"
                style={{ left: `calc(${(idx / N) * 100}% + ${GAP}px)`, width: `calc(${100 / N}% - ${GAP * 2}px)` }}
              />
            )}
          </>
        )}

        {TABS.map(({ href, label, Icon, pop }, i) => {
          const active = i === idx;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigator.vibrate?.(8)}
              className={cx('relative z-[1] flex items-center justify-center gap-1.5 transition-colors duration-300', active ? 'text-black' : 'text-white/50 active:text-white/80')}>
              {/* the icon's own move, replayed each time the tab is picked */}
              <span key={active ? `on-${seen.prev}` : 'off'} className={cx('relative grid place-items-center', active && pop)}>
                {Icon ? (
                  <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc(user?.avatarUri)} alt="" className={cx('h-[25px] w-[25px] rounded-full object-cover', active ? 'ring-2 ring-black/10' : 'opacity-70 grayscale-[35%]')} />
                )}
                {href === '/orders' && activeOrder && (
                  <span className="absolute -right-1 -top-1 grid h-2.5 w-2.5 place-items-center">
                    <span className="live-ping absolute inset-0 rounded-full bg-brand" />
                    <span className={cx('relative h-2.5 w-2.5 rounded-full bg-brand ring-2', active ? 'ring-white' : 'ring-black')} />
                  </span>
                )}
              </span>
              {active && (
                <span key={`l-${seen.prev}`} className="tab-label text-[13.5px] font-semibold">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
