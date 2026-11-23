'use client';

import { useEffect, useRef } from 'react';

const FOODS = ['/images/products/iced-latte.png', '/images/products/katsu-bowl.png', '/images/products/iced-coffee-float.png', '/images/products/soup-dumplings.png', '/images/products/hummus-plate.png'];

/**
 * Food dishes orbiting the logo on a tilted ellipse: they pass in front of and behind it, grow as
 * they come forward, fly in from off-screen on load, and drift with the pointer.
 * Positions are written straight to the DOM each frame (no React re-render).
 */
export function FoodOrbit({ size = 330 }: { size?: number }) {
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const logo = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf = 0;
    const R = size * 0.38; // horizontal radius (keeps dishes on screen)
    const r = size * 0.17; // vertical radius (tilt)
    const n = FOODS.length;

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      // Fly in: radius eases from far out to its orbit over ~1.3s (with a little overshoot).
      const k = Math.min(1, t / 1.3);
      const ease = reduce ? 1 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      const spread = reduce ? 1 : 1 + (1 - ease) * 1.6;
      const p = pointer.current;
      p.x += (p.tx - p.x) * 0.06;
      p.y += (p.ty - p.y) * 0.06;
      const spin = reduce ? 0 : t * 0.35;

      for (let i = 0; i < n; i++) {
        const el = items.current[i];
        if (!el) continue;
        const a = spin + (i / n) * Math.PI * 2;
        const depth = (Math.sin(a) + 1) / 2; // 0 back … 1 front
        const x = Math.cos(a) * R * spread + p.x * (8 + depth * 16);
        const y = Math.sin(a) * r * spread + Math.sin(t * 1.6 + i) * 4 + p.y * (6 + depth * 10);
        const s = 0.55 + depth * 0.55;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
        el.style.zIndex = String(depth > 0.5 ? 3 : 1);
        el.style.opacity = String(Math.min(1, k * 1.6) * (0.55 + depth * 0.45));
        el.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 5).toFixed(1)}px)` : 'none';
      }
      if (logo.current) logo.current.style.transform = `translate(-50%, -50%) translate(${(p.x * 6).toFixed(1)}px, ${(p.y * 4).toFixed(1)}px)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Gentle parallax with the pointer (mouse on desktop, finger drag on phones).
    const move = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, [size]);

  return (
    <div className="relative" style={{ width: size, height: size * 0.82 }} aria-hidden="true">
      {/* soft floor shadow under the orbit */}
      <div className="absolute left-1/2 top-[62%] h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-xl" />
      <div ref={logo} className="absolute left-1/2 top-1/2 z-[2]" style={{ transform: 'translate(-50%, -50%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" className="splash-pop h-[150px] w-[154px] object-contain drop-shadow-[0_14px_24px_rgba(230,14,13,0.18)]" />
      </div>
      {FOODS.map((src, i) => (
        <div
          key={src}
          ref={(el) => {
            items.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 opacity-0 will-change-transform"
          style={{ transform: 'translate(-50%, -50%)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-[96px] w-[96px] object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]" draggable={false} />
        </div>
      ))}
    </div>
  );
}
