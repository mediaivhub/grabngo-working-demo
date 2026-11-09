"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Illustrated city map (placeholder until a real map SDK is wired up).
 * Coordinates are normalised 0..1; `renderMarkers` gets a projector to on-screen points.
 */
export type MapPoint = { x: number; y: number };
export type Projector = (p: MapPoint) => { left: number; top: number };

const W = 100;
const H = 140;

function streetGrid(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  step: number,
  angle: number,
) {
  const lines: [number, number, number, number][] = [];
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const r = Math.hypot(x1 - x0, y1 - y0);
  const a = (angle * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  for (let d = -r; d <= r; d += step) {
    lines.push([
      cx + d * c - r * s,
      cy + d * s + r * c,
      cx + d * c + r * s,
      cy + d * s - r * c,
    ]);
    lines.push([
      cx + d * -s - r * c,
      cy + d * c - r * s,
      cx + d * -s + r * c,
      cy + d * c + r * s,
    ]);
  }
  return lines;
}

const label = {
  fontFamily: "var(--font-inter)",
  fontWeight: 700,
  letterSpacing: 0.4,
} as const;

export function StylizedMap({
  zoom,
  focus = { x: 0.5, y: 0.5 },
  renderMarkers,
}: {
  zoom: number;
  focus?: MapPoint;
  renderMarkers?: (project: Projector, zoom: number) => ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Panning is relative to the current focus; a new focus resets it.
  const focusKey = `${focus.x},${focus.y}`;
  const [panned, setPanned] = useState<{
    key: string;
    center: MapPoint;
  } | null>(null);
  const center = panned?.key === focusKey ? panned.center : focus;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = (c: MapPoint, z: number) => {
    const half = 0.5 / z;
    return {
      x: Math.min(Math.max(c.x, half), 1 - half),
      y: Math.min(Math.max(c.y, half), 1 - half),
    };
  };
  const view = clamp(center, zoom);

  const drag = useRef<{ x: number; y: number; start: MapPoint } | null>(null);
  const [dragging, setDragging] = useState(false);

  const project: Projector = (p) => ({
    left: (p.x - view.x) * size.w * zoom + size.w / 2,
    top: (p.y - view.y) * size.h * zoom + size.h / 2,
  });

  const streets = useMemo(
    () => [
      ...streetGrid(0, 0, 45, 70, 9, 8),
      ...streetGrid(55, 60, 100, 140, 10, -22),
      ...streetGrid(0, 75, 50, 140, 10, 14),
      ...streetGrid(60, 0, 100, 55, 10, -30),
    ],
    [],
  );
  const origin = project({ x: 0, y: 0 });

  return (
    <div
      ref={box}
      className="no-select relative h-full w-full overflow-hidden bg-[#F8F8F6]"
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, start: view };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !size.w) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) < 4) return;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
        setDragging(true);
        setPanned({
          key: focusKey,
          center: clamp(
            {
              x: d.start.x - dx / (size.w * zoom),
              y: d.start.y - dy / (size.h * zoom),
            },
            zoom,
          ),
        });
      }}
      onPointerUp={() => {
        drag.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
    >
      {size.w > 0 && (
        <svg
          width={size.w * zoom}
          height={size.h * zoom}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute"
          style={{
            left: origin.left,
            top: origin.top,
            transition: dragging ? "none" : "all 0.35s ease",
          }}
        >
          <rect width={W} height={H} fill="#F8F8F6" />
          {streets.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#EDEDEB"
              strokeWidth={0.7}
            />
          ))}
          <path
            d="M36 12 C46 6 62 8 70 16 C78 24 76 36 68 42 C60 48 44 46 38 38 C32 30 30 18 36 12Z"
            fill="#E4EEDA"
          />
          <path
            d="M60 70 C70 64 86 68 88 78 C90 88 80 96 70 94 C60 92 54 80 60 70Z"
            fill="#E4EEDA"
          />
          <path
            d="M8 104 C16 96 32 98 36 108 C40 118 30 128 18 126 C8 124 2 112 8 104Z"
            fill="#E4EEDA"
          />
          <path d="M88 0 L100 0 L100 14 C94 12 90 6 88 0Z" fill="#E4EEDA" />
          <path
            d="M40 17 C46 20 50 24 55 26 C60 28 64 30 67 34"
            stroke="#BFE2F2"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0 76 C20 72 32 68 50 66 C70 64 86 66 100 64"
            stroke="#DCDCDA"
            strokeWidth={2.6}
            fill="none"
          />
          <path
            d="M44 0 C46 20 50 40 52 66 C54 90 58 110 62 140"
            stroke="#E3E3E1"
            strokeWidth={1.6}
            fill="none"
          />
          <path
            d="M0 30 C30 34 60 44 100 36"
            stroke="#E6E6E4"
            strokeWidth={1.3}
            fill="none"
          />
          <text
            x={55}
            y={29}
            fontSize={2.6}
            fill="#8FA07A"
            textAnchor="middle"
            style={{ ...label, fontWeight: 600, letterSpacing: 0 }}
          >
            Clove Lakes
          </text>
          <text
            x={55}
            y={32.6}
            fontSize={2.6}
            fill="#8FA07A"
            textAnchor="middle"
            style={{ ...label, fontWeight: 600, letterSpacing: 0 }}
          >
            Park
          </text>
          {[
            ["CASTLETON", 29, 50],
            ["CORNERS", 29, 53.4],
            ["MANOR", 20, 96],
            ["HEIGHTS", 20, 99.4],
            ["TODT HILL", 88, 104],
          ].map(([t, x, y]) => (
            <text
              key={t as string}
              x={x}
              y={y}
              fontSize={2.3}
              fill="#6E6E6E"
              textAnchor="middle"
              style={label}
            >
              {t}
            </text>
          ))}
          {[
            ["Victory Blvd", 80, 42, -10],
            ["Holden Blvd", 24, 87, 0],
            ["Ocean Terrace", 70, 86, 0],
          ].map(([t, x, y, r]) => (
            <text
              key={t as string}
              x={x}
              y={y}
              fontSize={1.7}
              fill="#8A8A8A"
              textAnchor="middle"
              transform={`rotate(${r} ${x} ${y})`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {t}
            </text>
          ))}
        </svg>
      )}
      {size.w > 0 && renderMarkers?.(project, zoom)}
    </div>
  );
}
