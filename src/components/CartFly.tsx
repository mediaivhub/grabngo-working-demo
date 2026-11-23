'use client';

import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Price } from '@/components/ui';
import { orderTotals } from '@/lib/pricing';
import { useStore } from '@/store/AppStore';

/*
 * "Fly to cart": when a dish is added, its photo arcs from where you tapped into the cart icon on
 * screen (any element marked data-cart-target), which then bounces. Driven from the store's
 * addToCart, so every add button gets it without extra wiring.
 */

const last = { x: 0, y: 0, at: 0 };

/** Remembers where the last tap/click happened (mounted once in the root layout). */
export function FlyLayer() {
  useEffect(() => {
    const down = (e: PointerEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      last.at = performance.now();
    };
    window.addEventListener('pointerdown', down, { capture: true });
    return () => window.removeEventListener('pointerdown', down, { capture: true });
  }, []);
  return null;
}

function visibleTarget(): HTMLElement | null {
  const els = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')];
  return (
    els.reverse().find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }) ?? null
  );
}

export function flyToCart(imageSrc: string) {
  if (typeof window === 'undefined') return;
  const bump = () => window.dispatchEvent(new Event('cart-bump'));
  // Wait a frame: a cart bar may appear because of this very add.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const target = visibleTarget();
      const recent = performance.now() - last.at < 2500;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!target || !recent || reduce) return bump();

      const t = target.getBoundingClientRect();
      const size = 72;
      const [x0, y0] = [last.x - size / 2, last.y - size / 2];
      const [x1, y1] = [t.left + t.width / 2 - size / 2, t.top + t.height / 2 - size / 2];
      const lift = Math.min(160, Math.abs(y1 - y0) * 0.5 + 60);

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = '';
      Object.assign(img.style, {
        position: 'fixed', left: '0px', top: '0px', width: `${size}px`, height: `${size}px`, objectFit: 'cover',
        borderRadius: '50%', zIndex: '9999', pointerEvents: 'none', boxShadow: '0 10px 24px rgba(0,0,0,0.25)', background: '#fff',
      } as CSSStyleDeclaration);
      document.body.appendChild(img);
      const mid = (a: number, b: number) => a + (b - a) * 0.5;
      img
        .animate(
          [
            { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0.9 },
            { transform: `translate(${x0}px, ${y0 - 18}px) scale(1.1)`, opacity: 1, offset: 0.18 },
            { transform: `translate(${mid(x0, x1)}px, ${Math.min(y0, y1) - lift}px) scale(0.75)`, offset: 0.6 },
            { transform: `translate(${x1}px, ${y1}px) scale(0.22)`, opacity: 0.7 },
          ],
          { duration: 780, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' },
        )
        .finished.then(() => {
          img.remove();
          bump();
        })
        .catch(() => img.remove());
    }),
  );
}

/** True for a moment each time something lands in the cart (for a bounce). */
export function useCartBump() {
  const [bumping, setBumping] = useState(0);
  useEffect(() => {
    const on = () => setBumping((n) => n + 1);
    window.addEventListener('cart-bump', on);
    return () => window.removeEventListener('cart-bump', on);
  }, []);
  return bumping;
}

/** Floating "View cart" bar for pages without the header cart (e.g. a restaurant's page). */
export function FloatingCart({ placeId }: { placeId: string }) {
  const { cart, cartCount } = useStore();
  const bump = useCartBump();
  if (!cartCount || cart.placeId !== placeId) return null;
  const total = orderTotals(cart.lines).total;
  return (
    <div className="pb-safe sheet-in pointer-events-none absolute inset-x-4 bottom-3 z-20">
      <Link
        href="/cart"
        data-cart-target
        key={bump}
        className={`${bump ? 'cart-bump ' : ''}pointer-events-auto flex h-[60px] items-center gap-3 rounded-full bg-black pl-2 pr-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] active:scale-[0.98]`}>
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/12">
          <ShoppingBasket size={20} fill="currentColor" />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold">{cartCount}</span>
        </span>
        <span className="flex-1 text-[16px] font-semibold">View cart</span>
        <Price amount={total} size={16} color="#fff" weight={600} />
      </Link>
    </div>
  );
}
