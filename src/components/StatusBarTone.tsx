'use client';

import { useEffect } from 'react';

/** Switches the mockup's status bar / home indicator to white over dark screens. */
export function useStatusBarTone(tone: 'dark' | 'light') {
  useEffect(() => {
    const device = document.querySelector<HTMLElement>('.device');
    if (!device) return;
    device.style.setProperty('--status-color', tone === 'light' ? '#fff' : '#000');
    return () => device.style.setProperty('--status-color', '#000');
  }, [tone]);
}
