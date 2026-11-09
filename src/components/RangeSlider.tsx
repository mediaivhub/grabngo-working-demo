"use client";

import { useRef } from "react";

const KNOB = 28;

/** Two-thumb slider for a price range. */
export function RangeSlider({
  min,
  max,
  low,
  high,
  step = 1,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  onChange: (low: number, high: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const valueAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const t = Math.min(
      Math.max((clientX - r.left - KNOB / 2) / (r.width - KNOB), 0),
      1,
    );
    return Math.round((min + t * (max - min)) / step) * step;
  };
  const pct = (v: number) => (v - min) / (max - min);

  const thumb = (which: "low" | "high") => (
    <div
      role="slider"
      tabIndex={0}
      aria-label={which === "low" ? "Minimum price" : "Maximum price"}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={which === "low" ? low : high}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const v = valueAt(e.clientX);
        if (which === "low") onChange(Math.min(v, high), high);
        else onChange(low, Math.max(v, low));
      }}
      onKeyDown={(e) => {
        const d =
          e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
        if (!d) return;
        if (which === "low")
          onChange(Math.min(Math.max(low + d, min), high), high);
        else onChange(low, Math.max(Math.min(high + d, max), low));
      }}
      className="no-select absolute top-1 cursor-grab rounded-full border-[2.5px] border-ink bg-white"
      style={{
        width: KNOB,
        height: KNOB,
        left: `calc(${pct(which === "low" ? low : high)} * (100% - ${KNOB}px))`,
      }}
    />
  );

  return (
    <div ref={track} className="relative h-9">
      <div
        className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E2E2E2]"
        style={{ left: KNOB / 2, right: KNOB / 2 }}
      />
      <div
        className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ink"
        style={{
          left: `calc(${pct(low)} * (100% - ${KNOB}px) + ${KNOB / 2}px)`,
          width: `calc(${pct(high) - pct(low)} * (100% - ${KNOB}px))`,
        }}
      />
      {thumb("low")}
      {thumb("high")}
    </div>
  );
}
