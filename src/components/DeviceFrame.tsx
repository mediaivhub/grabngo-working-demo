'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const DEVICE_W = 414;
const DEVICE_H = 868;

function StatusIcons() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <svg width="18" height="12" viewBox="0 0 18 12">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 5} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill="currentColor" />
        ))}
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
        <path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .6C5.3.6 2.8 1.6.9 3.5L2 4.7a8.4 8.4 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.1-1.2A7 7 0 0 0 8 4c-1.8 0-3.5.7-4.7 1.9l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.6 0-1.1.2-1.5.6L8 11.4l1.5-1.7c-.4-.4-.9-.6-1.5-.6Z" />
      </svg>
      <svg width="27" height="13" viewBox="0 0 27 13">
        <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.4" />
        <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
        <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.5" />
      </svg>
    </span>
  );
}

/**
 * Phones get the app full-screen; anything wider shows it inside an iPhone mockup.
 * The switch is pure CSS (see globals.css) so the page renders the same on server and client;
 * JS only scales the mockup down to fit short windows.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const scale = Math.min(1, (window.innerHeight - 40) / DEVICE_H, (window.innerWidth - 40) / DEVICE_W);
      stage.current?.style.setProperty('--device-scale', String(scale));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div ref={stage} className="device-stage">
      <div className="device-scaler">
        <div className="device">
          <span className="device-button" style={{ left: -6, top: 150, height: 32 }} />
          <span className="device-button" style={{ left: -6, top: 210, height: 62 }} />
          <span className="device-button" style={{ left: -6, top: 286, height: 62 }} />
          <span className="device-button" style={{ right: -6, top: 230, height: 96 }} />
          <div className="app-shell">{children}</div>
          <div className="device-island" />
          <div className="device-status">
            <span>9:41</span>
            <StatusIcons />
          </div>
          <div className="device-home" />
        </div>
      </div>
    </div>
  );
}
