'use client';

import { Box, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '@/components/ui';
import { type Car, carName, carSVG, model3dFor, plateBadgeSVG } from '@/lib/car';

/** The drawn rear view of the customer's car, in their paint and with their plate. */
export function CarArt({ car, brakes, className }: { car: Car; brakes?: boolean; className?: string }) {
  const id = 'c' + useId().replace(/[^a-z0-9]/gi, '');
  return <div className={cx('[&>svg]:block [&>svg]:h-auto [&>svg]:w-full', className)} dangerouslySetInnerHTML={{ __html: carSVG(car, id, { brakes }) }} />;
}

export function PlateBadge({ car, className }: { car: Car; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: plateBadgeSVG(car) }} />;
}

/** Light "parking bay" stage with the car, a name tag, and View in 3D when a real model exists. */
export function CarStage({ car, onView3D, className }: { car: Car; onView3D?: () => void; className?: string }) {
  const has3d = !!model3dFor(car);
  return (
    <div className={cx('relative h-[206px] overflow-hidden rounded-[20px]', className)} style={{ background: 'linear-gradient(#f7f5f2 0%, #efebe6 62%, #e3ded7 62.5%, #ebe7e1 100%)' }}>
      <svg className="absolute inset-x-0 bottom-0 h-[74px] w-full" viewBox="0 0 390 74" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 74 L120 0 M350 74 L270 0" stroke="#fff" strokeWidth="3" opacity="0.8" />
      </svg>
      <div className="absolute left-3 top-3 z-[2] flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-1.5 text-[12px] font-semibold shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ background: car.color.hex }} />
        {car.make} {car.model}
      </div>
      {has3d && onView3D && (
        <button type="button" onClick={onView3D} className="absolute right-3 top-3 z-[2] flex items-center gap-1 rounded-xl bg-black px-2.5 py-1.5 text-[12px] font-semibold text-white">
          <Box size={13} /> View in 3D
        </button>
      )}
      <CarArt key={`${car.make}|${car.model}|${car.color.hex}|${car.body}`} car={car} className="car-pop absolute bottom-2 left-1/2 w-[236px] -translate-x-1/2" />
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

/** Bottom sheet with the real, drag-to-rotate 3D model of the car (Nissan Patrol, Mercedes G 63). */
export function Car3DSheet({ car, onClose }: { car: Car; onClose: () => void }) {
  const model = model3dFor(car);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    loadSketchfab()
      .then(() => {
        if (cancelled || !frame.current || !window.Sketchfab) return;
        new window.Sketchfab(frame.current).init(model.uid, {
          autostart: 1, autospin: 0.3, preload: 1, dnt: 1,
          ui_infos: 0, ui_controls: 0, ui_stop: 0, ui_watermark: 0, ui_watermark_link: 0, ui_hint: 0,
          ui_inspector: 0, ui_settings: 0, ui_vr: 0, ui_ar: 0, ui_fullscreen: 0, ui_annotations: 0, ui_help: 0, ui_loading: 0,
          success(api: SketchfabApi) {
            api.start();
            api.addEventListener('viewerready', () => {
              api.setBackground({ color: [0.937, 0.922, 0.902] });
              // Frame the whole car once the model's own start camera has settled.
              setTimeout(
                () =>
                  api.focusOnVisibleGeometries(() =>
                    api.getCameraLookAt((err, cam) => {
                      if (!cancelled) setState('ready');
                      if (err) return;
                      api.setCameraLookAt(cam.position.map((p, k) => cam.target[k] + (p - cam.target[k]) * 1.12), cam.target, 0.6);
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
    };
  }, [model]);

  if (!model) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45" onClick={onClose}>
      <div role="dialog" aria-label={`${model.title} in 3D`} className="pb-safe sheet-in rounded-t-[30px] bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[17px] font-semibold">{model.title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-surface">
            <X size={18} />
          </button>
        </div>
        <div className="relative h-[380px] overflow-hidden rounded-[20px] bg-[#efebe6]">
          <iframe ref={frame} title={`${model.title} 3D model`} allow="autoplay; fullscreen; xr-spatial-tracking" className="absolute inset-0 h-full w-full border-0" />
          {state !== 'ready' && (
            <span className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-gray">
              {state === 'error' ? '3D model unavailable right now' : 'Loading 3D model…'}
            </span>
          )}
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-[10px] bg-white/90 px-2.5 py-1 text-[11px] font-semibold">↻ Drag to rotate</span>
          <PlateBadge car={car} className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 drop-shadow-md" />
        </div>
        <p className="mt-2.5 px-1 text-[12px] leading-4 text-gray">
          Shown in {model.color.toLowerCase()} as modelled{car.color.name !== model.color && !car.color.custom ? ` — yours is ${car.color.name.toLowerCase()}` : ''}. 3D model:{' '}
          <a href={`https://sketchfab.com/3d-models/${model.uid}`} target="_blank" rel="noopener noreferrer" className="underline">
            {model.title}
          </a>{' '}
          by {model.author} · {model.license}
        </p>
        <p className="sr-only">{carName(car)}</p>
      </div>
    </div>
  );
}
