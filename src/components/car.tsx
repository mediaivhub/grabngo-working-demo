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
  getMaterialList: (cb: (err: unknown, materials: SketchfabMaterial[]) => void) => void;
  setMaterial: (material: SketchfabMaterial, cb?: () => void) => void;
};
type SketchfabChannel = { color?: number[]; factor?: number; texture?: unknown; enable?: boolean };
type SketchfabMaterial = { name: string; channels: Record<string, SketchfabChannel> };
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

/** Loads the 3D viewer library in the background once the app is idle, so cars appear faster. */
export function Warm3D() {
  useEffect(() => {
    const go = () => void loadSketchfab().catch(() => {});
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go);
    else setTimeout(go, 1500);
  }, []);
  return null;
}

/** sRGB hex → the linear RGB the 3D viewer's materials use. */
function hexToLinear(hex: string) {
  return [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}
const PAINT_CHANNELS = ['AlbedoPBR', 'DiffuseColor', 'DiffusePBR'];

/**
 * The real 3D model of the car, filling its parent: slowly turning, drag to rotate, with the
 * customer's plate under it.
 */
export type CarControls = { rotate: (degrees: number) => void };

/** Paint colour blended into the stage background, as 0..1 RGB. */
export function tintedBackground(base: number[], hex: string, amount: number) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return base.map((b, i) => Math.round((b * (1 - amount) + c[i] * amount) * 1000) / 1000);
}

export function Car3DView({ car, background, dark, controls }: { car: Car; background: number[]; dark?: boolean; controls?: { current: CarControls | null } }) {
  const model = model3dFor(car);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const bg = background.join(',');
  const bgRef = useRef(bg);
  useEffect(() => {
    bgRef.current = bg;
    // Background follows the paint (no reload).
    viewer.current?.api.setBackground({ color: bg.split(',').map(Number) });
  }, [bg]);
  // The live viewer and the paint materials as they were modelled (to restore the original colour).
  const viewer = useRef<{ api: SketchfabApi; originals: SketchfabMaterial[] } | null>(null);
  const colorKey = car.color.name === model?.color ? 'original' : car.color.hex;
  const wanted = useRef(colorKey);
  useEffect(() => {
    wanted.current = colorKey;
  });

  /** Repaint the body to the customer's colour (or back to the modelled colour). */
  const applyPaint = (key: string) => {
    const v = viewer.current;
    if (!v) return;
    for (const orig of v.originals) {
      const m: SketchfabMaterial = structuredClone(orig);
      if (key !== 'original') {
        for (const ch of PAINT_CHANNELS) {
          const c = m.channels[ch];
          if (c) Object.assign(c, { color: hexToLinear(key), factor: 1, texture: undefined });
        }
      }
      v.api.setMaterial(m);
    }
  };
  const applyRef = useRef(applyPaint);
  useEffect(() => {
    applyRef.current = applyPaint;
  });
  useEffect(() => {
    applyRef.current(colorKey);
  }, [colorKey]);

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
          autostart: 1, autospin: 0.25, preload: 0, max_texture_size: 1024, dnt: 1, transparent: 0, scrollwheel: 0, double_click: 0,
          ui_infos: 0, ui_controls: 0, ui_stop: 0, ui_watermark: 0, ui_watermark_link: 0, ui_hint: 0,
          ui_inspector: 0, ui_settings: 0, ui_vr: 0, ui_ar: 0, ui_fullscreen: 0, ui_annotations: 0, ui_help: 0, ui_loading: 0,
          success(api: SketchfabApi) {
            api.start();
            api.addEventListener('viewerready', () => {
              api.setBackground({ color: bgRef.current.split(',').map(Number) });
              const re = new RegExp(model.paint);
              api.getMaterialList((err, list) => {
                if (cancelled || err) return;
                viewer.current = { api, originals: structuredClone(list.filter((m) => re.test(m.name))) };
                if (controls)
                  controls.current = {
                    // Orbit the camera around the car (the viewer's world is Z-up).
                    rotate: (deg) =>
                      api.getCameraLookAt((e, cam) => {
                        if (e) return;
                        const a = (deg * Math.PI) / 180;
                        const [dx, dy] = [cam.position[0] - cam.target[0], cam.position[1] - cam.target[1]];
                        const pos = [cam.target[0] + dx * Math.cos(a) - dy * Math.sin(a), cam.target[1] + dx * Math.sin(a) + dy * Math.cos(a), cam.position[2]];
                        api.setCameraLookAt(pos, cam.target, 0.7);
                      }),
                  };
                if (wanted.current !== 'original') applyRef.current(wanted.current);
              });
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
      viewer.current = null;
      if (controls) controls.current = null;
    };
  }, [model, controls]);

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
      {state === 'loading' &&
        (model.thumb ? (
          // The car's photo shows instantly while the 3D model loads behind it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={model.thumb} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className={cx('pointer-events-none absolute inset-0 grid place-items-center text-[13px]', dark ? 'text-white/60' : 'text-gray')}>Loading your car…</span>
        ))}
      {state === 'loading' && <span className="pointer-events-none absolute bottom-12 left-1/2 z-[2] h-1 w-16 -translate-x-1/2 overflow-hidden rounded-full bg-black/10"><span className="block h-full w-1/2 animate-[load-slide_1s_ease-in-out_infinite] rounded-full bg-black/40" /></span>}
      <PlateBadge car={car} className="pointer-events-none absolute bottom-2.5 left-1/2 z-[2] -translate-x-1/2 drop-shadow-md" />
    </>
  );
}
