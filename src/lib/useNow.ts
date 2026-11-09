'use client';

import { useEffect, useState } from 'react';

/**
 * The current time, read only in the browser (null while prerendering and on first paint),
 * so prerendered pages never bake in the build time. Re-reads every `everyMs` if given.
 */
export function useNow(everyMs?: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = everyMs ? setInterval(tick, everyMs) : undefined;
    return () => {
      clearTimeout(first);
      if (t) clearInterval(t);
    };
  }, [everyMs]);
  return now;
}
