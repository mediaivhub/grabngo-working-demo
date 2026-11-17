'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/components/ui';
import { type Car, model3dFor, plateBadgeSVG } from '@/lib/car';

export function PlateBadge({ car, className }: { car: Car; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: plateBadgeSVG(car) }} />;
}

/** Stage with the customer's real 3D car (drag to rotate) and a name tag. */
export function CarStage({ car, className }: { car: Car; className?: string }) {
  const model = model3dFor(car);
  if (!model) return null;
  return (
    <div className={cx('relative h-[260px] overflow-hidden rounded-[20px] bg-[#efebe6]', className)}>
      <Car3DView key={model.uid} car={car} background={[0.937, 0.922, 0.902]} />
      <div className="pointer-events-none absolute left-3 top-3 z-[2] flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-1.5 text-[12px] font-semibold shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ background: car.color.hex }} />
        {car.make} {car.model}
      </div>
      <span className="pointer-events-none absolute right-3 top-3 z-[2] rounded-xl bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold">↻ Drag to rotate</span>
    </div>
  );
}

/* ---------------- 3D viewer ---------------- */

type SketchfabApi = {
  start: () => void;
  addEventListener: (e: string, cb: () => void) => void;
  setBackground: (o: { color: number[] }) => void;
  focusOnVisibleGeometries: (cb: () => void) => void;
  getCameraLookAt: (cb: (err: unknown, cam: { position: number[]; target: number[] }) => void) => void;
  setCameraLookAt: (pos: number[], target: number[], duration: number) => void;
};
type SketchfabClient = { init: (uid: string, opts: Record<string, unknown>) => void };
declare global {
  interface Window {
    Sketchfab?: new (iframe: HTMLIFrameElement) => SketchfabClient;
  }
}

let sdk: Promise<void> | null = null;
function loadSketchfab() {
  if (window.Sketchfab) return Promise.resolve();
  sdk ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      sdk = null;
      reject(new Error('Sketchfab unavailable'));
    };
    document.head.appendChild(s);
  });
  return sdk;
}

/**
 * The real 3D model of the car, filling its parent: slowly turning, drag to rotate, with the
 * customer's plate under it.
 */
export function Car3DView({ car, background, dark }: { car: Car; background: number[]; dark?: boolean }) {
  const model = model3dFor(car);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const bg = background.join(',');

  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    // Don't keep the car hidden if the viewer is slow to report it's framed.
    const reveal = setTimeout(() => !cancelled && setState((st) => (st === 'loading' ? 'ready' : st)), 6000);
    loadSketchfab()
      .then(() => {
        if (cancelled || !frame.current || !window.Sketchfab) return;
        new window.Sketchfab(frame.current).init(model.uid, {
          // No wheel / double-click zoom: scrolling the page must never zoom the car. Drag still rotates.
          autostart: 1, autospin: 0.25, preload: 1, dnt: 1, transparent: 0, scrollwheel: 0, double_click: 0,
          ui_infos: 0, ui_controls: 0, ui_stop: 0, ui_watermark: 0, ui_watermark_link: 0, ui_hint: 0,
          ui_inspector: 0, ui_settings: 0, ui_vr: 0, ui_ar: 0, ui_fullscreen: 0, ui_annotations: 0, ui_help: 0, ui_loading: 0,
          success(api: SketchfabApi) {
            api.start();
            api.addEventListener('viewerready', () => {
              api.setBackground({ color: bg.split(',').map(Number) });
              // Frame the whole car once the model's own start camera has settled.
              setTimeout(
                () =>
                  api.focusOnVisibleGeometries(() =>
                    api.getCameraLookAt((err, cam) => {
                      if (!cancelled) setState('ready');
                      if (err) return;
                      api.setCameraLookAt(cam.position.map((p, k) => cam.target[k] + (p - cam.target[k]) * 1.15), cam.target, 0.6);
                    }),
                  ),
                600,
              );
            });
          },
          error() {
            if (!cancelled) setState('error');
          },
        });
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
      clearTimeout(reveal);
    };
  }, [model, bg]);

  if (!model) return null;
  if (state === 'error')
    return (
      <div className={cx('absolute inset-0 grid place-items-center text-center text-[13px]', dark ? 'text-white/60' : 'text-gray')}>
        <span>
          3D model couldn’t load.
          <br />
          Check your connection.
        </span>
      </div>
    );
  return (
    <>
      <iframe
        ref={frame}
        title={`${model.title} 3D model`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className={cx('absolute inset-0 h-full w-full border-0 transition-opacity duration-500', state === 'ready' ? 'opacity-100' : 'opacity-0')}
      />
      {state === 'loading' && (
        <span className={cx('pointer-events-none absolute inset-0 grid place-items-center text-[13px]', dark ? 'text-white/60' : 'text-gray')}>Loading your car…</span>
      )}
      <PlateBadge car={car} className="pointer-events-none absolute bottom-2.5 left-1/2 z-[2] -translate-x-1/2 drop-shadow-md" />
    </>
  );
}
