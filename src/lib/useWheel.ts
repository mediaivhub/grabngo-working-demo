"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

type Options = {
  axis: "x" | "y";
  /** Pixels of drag that move the offset by 1. */
  pxPerStep: number;
  /** Extra travel added for flick velocity (px per px/ms). */
  fling?: number;
  /** Clamp to [0, max] instead of looping, with rubber-banding past the ends. */
  max?: number;
  easing?: "cubic" | "back";
  duration?: number;
};

/**
 * A draggable, animated "offset" for the showcase sections (drinks wheel, turntable, dessert layers).
 * Pointer drags along `axis` move the offset; release settles on the nearest whole step.
 * A drag swallows the click that follows it, so taps and drags never fight.
 */
export function useWheel({
  axis,
  pxPerStep,
  fling = 120,
  max,
  easing = "cubic",
  duration = 420,
}: Options) {
  const [offset, setOffset] = useState(0);
  const value = useRef(0);
  const frame = useRef(0);
  const drag = useRef<{
    start: number;
    at: number;
    last: number;
    t: number;
    v: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const set = (v: number) => {
    value.current = v;
    setOffset(v);
  };

  const clamp = (v: number) =>
    max === undefined ? v : Math.min(Math.max(v, 0), max);

  const settle = (target: number) => {
    cancelAnimationFrame(frame.current);
    const from = value.current;
    const to = clamp(target);
    const t0 = performance.now();
    const ease = easing === "back" ? easeOutBack : easeOutCubic;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      set(from + (to - from) * ease(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const pos = (e: ReactPointerEvent) => (axis === "x" ? e.clientX : e.clientY);
  const other = (e: ReactPointerEvent) =>
    axis === "x" ? e.clientY : e.clientX;
  const startOther = useRef(0);

  const handlers = {
    onPointerDown: (e: ReactPointerEvent) => {
      cancelAnimationFrame(frame.current);
      drag.current = {
        start: value.current,
        at: pos(e),
        last: pos(e),
        t: performance.now(),
        v: 0,
        moved: false,
      };
      startOther.current = other(e);
    },
    onPointerMove: (e: ReactPointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const delta = pos(e) - d.at;
      if (!d.moved) {
        // Only claim the gesture once it's clearly along our axis.
        if (
          Math.abs(delta) < 6 ||
          Math.abs(delta) < Math.abs(other(e) - startOther.current)
        )
          return;
        d.moved = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      }
      // Velocity in px/ms from the latest move, for flicks.
      const now = performance.now();
      d.v = (pos(e) - d.last) / Math.max(1, now - d.t);
      d.last = pos(e);
      d.t = now;
      let next = d.start - delta / pxPerStep;
      if (max !== undefined)
        next =
          next < 0 ? next * 0.3 : next > max ? max + (next - max) * 0.3 : next;
      set(next);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d?.moved) return;
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      const delta = pos(e) - d.at;
      settle(Math.round(d.start - (delta + d.v * fling) / pxPerStep));
    },
    onPointerCancel: () => {
      drag.current = null;
      settle(Math.round(value.current));
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (suppressClick.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
  };

  return { offset, settle, handlers, current: () => value.current };
}

/** Signed distance from `offset` to item `i` on a looping wheel of `n` items, in -n/2..n/2. */
export function wrapDelta(i: number, offset: number, n: number) {
  const d = (((i - offset) % n) + n) % n;
  return d > n / 2 ? d - n : d;
}

/** Rounds layout math so server and browser render identical numbers (avoids hydration mismatches). */
export const r2 = (v: number) => Math.round(v * 100) / 100;
