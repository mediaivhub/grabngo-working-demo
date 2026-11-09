'use client';

import { useEffect, useRef, useState } from 'react';

/** Width of an element, kept up to date (the app is 390px in the mockup, device width on phones). */
export function useWidth<T extends HTMLElement>(fallback = 390) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth || fallback));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}
