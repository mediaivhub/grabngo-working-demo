"use client";

import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/ui";

const KNOB = 60;
const COMPLETE_AT = 0.7;

/** Drag the black knob across to place the item in the cart (Enter / Space also works). */
export function SwipeToOrder({
  amount,
  onComplete,
}: {
  amount: number;
  onComplete: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const start = useRef(0);
  // Track width is measured, not read from the ref during render.
  const [width, setWidth] = useState(300);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const maxX = () => Math.max(width - KNOB - 12, 1);

  const finish = () => {
    setX(maxX());
    setDone(true);
    onComplete();
  };

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label="Swipe to order"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((x / maxX()) * 100)}
      onKeyDown={(e) => {
        if (
          !done &&
          (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")
        )
          finish();
      }}
      className={`relative h-[60px] rounded-full transition-colors ${done ? "bg-green" : "bg-field"}`}
    >
      {!done && (
        <div
          className="pointer-events-none absolute left-[90px] right-2 top-1/2 -translate-y-1/2"
          style={{ opacity: Math.max(0, 1 - x / (maxX() * 0.5)) }}
        >
          <p className="text-[13px] text-gray">Swipe to order</p>
          <Price amount={amount} size={22} color="var(--color-ink)" />
        </div>
      )}
      <div
        onPointerDown={(e) => {
          if (done) return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          start.current = e.clientX - x;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setX(Math.min(Math.max(e.clientX - start.current, 0), maxX()));
        }}
        onPointerUp={() => {
          if (!dragging) return;
          setDragging(false);
          if (x >= maxX() * COMPLETE_AT) finish();
          else setX(0);
        }}
        className="no-select absolute left-0 top-0 flex h-[60px] w-[72px] cursor-grab items-center justify-center rounded-full bg-black text-[26px] font-semibold text-white active:cursor-grabbing"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.2,0.9,0.3,1.2)",
        }}
      >
        »
      </div>
    </div>
  );
}
