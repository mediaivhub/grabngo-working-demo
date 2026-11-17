'use client';

import { Check, ChevronDown, Plus, RotateCcw, RotateCw, Search, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Car3DView, type CarControls, PlateBadge, tintedBackground } from '@/components/car';
import { Button, cx, NavHeader, useGoBack } from '@/components/ui';
import { type Car, type CarColor, carName, CARS_3D, COLORS, DEMO_CAR, EMIRATES, type EmirateId, model3dFor, plateText } from '@/lib/car';
import { useStore } from '@/store/AppStore';

export default function MyCarScreen() {
  const { ready, car } = useStore();
  return (
    <main className="screen pt-safe pb-safe bg-surface">
      {/* Wait for saved data so the form starts from the real car. */}
      {ready ? <CarForm initial={car} /> : <NavHeader title="My Car" fallback="/profile" className="bg-white" />}
    </main>
  );
}

const fieldCls = 'h-12 w-full appearance-none rounded-2xl border-[1.5px] border-transparent bg-field px-3.5 text-[15px] outline-none focus:border-ink focus:bg-white';
const selectBg = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.6' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 34,
};

function CarForm({ initial }: { initial: Car | null }) {
  const back = useGoBack('/profile');
  const { setCar } = useStore();
  const [car, setDraft] = useState<Car>(initial ?? DEMO_CAR);
  const set = (patch: Partial<Car>) => setDraft((c) => ({ ...c, ...patch }));
  const [splash, setSplash] = useState<{ hex: string; id: number; x: number } | null>(null);
  const [paintOpen, setPaintOpen] = useState(false);
  // One line: the popular paints, plus the current one if it isn't among them.
  const quickColors = (() => {
    const base = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red'].map((n) => COLORS.find((c) => c.name === n)!);
    return base.some((c) => c.name === car.color.name) ? base : [car.color, ...base.slice(0, 5)];
  })();
  /** Repaint with a splash of the new colour rising from where it was tapped. */
  const pickColor = (c: CarColor, from?: HTMLElement) => {
    // (splash rises from the tapped chip)
    if (c.name === car.color.name) return;
    const r = from?.getBoundingClientRect();
    const x = r ? Math.min(90, Math.max(10, ((r.left + r.width / 2) / window.innerWidth) * 100)) : 50;
    setSplash({ hex: c.hex, id: Date.now(), x });
    set({ color: c });
    navigator.vibrate?.(12);
  };

  const plateOk = car.code.length > 0 && car.number.length >= 1;
  const save = () => {
    setCar(car);
    back();
  };

  return (
    <>
      <div className="scroll flex-1">
        <div className="rounded-b-[30px] bg-white px-5 pb-6">
          <NavHeader title="My Car" fallback="/profile" className="-mx-5" />

          <Stage car={car} splash={splash} onSplashEnd={() => setSplash(null)} />

          <div className="mt-3">
            <CarPicker value={car} onPick={(c) => set({ ...c, color: car.color })} />
          </div>
        </div>

        {/* Paint: one line, the rest behind + */}
        <section className="mt-1.5 rounded-[30px] bg-white px-5 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold">Paint</h2>
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray">
              <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: car.color.hex }} />
              {car.color.name}
            </span>
          </div>
          <div role="radiogroup" aria-label="Paint colour" className="mt-3 flex items-center justify-between">
            {quickColors.map((c) => (
              <Chip key={c.name} c={c} on={car.color.name === c.name} onPick={pickColor} />
            ))}
            <button
              type="button"
              aria-label="More colours"
              onClick={() => setPaintOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-gray-light text-gray active:scale-90">
              <Plus size={20} />
            </button>
          </div>
        </section>

        {/* Plate */}
        <section className="mt-1.5 rounded-[30px] bg-white px-5 pb-5 pt-4">
          <h2 className="text-[19px] font-bold">Plate</h2>
          <div className="mt-3 grid place-items-center rounded-2xl bg-gradient-to-b from-[#f4f4f4] to-[#e9e9e9] py-5">
            <PlateBadge car={car} className="origin-center scale-[1.7] drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]" />
          </div>
          <div className="mt-3 flex gap-2">
            <select
              aria-label="Emirate"
              value={car.emirate}
              onChange={(e) => {
                const emirate = e.target.value as EmirateId;
                set({ emirate, code: EMIRATES[emirate].codes[0] });
              }}
              className={cx(fieldCls, 'flex-[1.25]')}
              style={selectBg}>
              {Object.entries(EMIRATES).map(([id, e]) => (
                <option key={id} value={id}>
                  {e.label}
                </option>
              ))}
            </select>
            <input
              aria-label="Plate code"
              value={car.code}
              maxLength={2}
              onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
              className={cx(fieldCls, 'flex-[0.7] text-center font-semibold tracking-[2px]')}
            />
            <input
              aria-label="Plate number"
              value={car.number}
              maxLength={5}
              inputMode="numeric"
              onChange={(e) => set({ number: e.target.value.replace(/\D/g, '') })}
              className={cx(fieldCls, 'flex-[1.4] font-semibold tabular-nums tracking-[2px]')}
            />
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-[#f7f7f7] px-3.5 py-3 text-[14px] leading-[19px]">
            <span className="text-[20px]">🚘</span>
            <span>
              Staff will look for a <b className="font-semibold">{carName(car)}</b>, plate <b className="font-semibold">{plateText(car)}</b>.
            </span>
          </div>
          {initial && (
            <button
              type="button"
              onClick={() => {
                setCar(null);
                back();
              }}
              className="mt-4 flex items-center gap-1.5 text-[14px] text-gray">
              <Trash2 size={15} /> Remove car
            </button>
          )}
        </section>
      </div>
      <div className="bg-surface px-5 pt-3">
        <Button disabled={!plateOk || !model3dFor(car)} onClick={save}>
          Save Car
        </Button>
      </div>
      {paintOpen && <PaintSheet value={car.color} onPick={pickColor} onClose={() => setPaintOpen(false)} />}
    </>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
}

/** A glossy paint chip: highlight + depth; matte finishes stay flat. */
function swatchBg(name: string, hex: string) {
  if (/matte/i.test(name)) return `linear-gradient(160deg, ${hex}, #1a1a1c)`;
  const pearl = /pearl|silver|gold/i.test(name) ? ', conic-gradient(from 200deg, rgba(255,255,255,0.0), rgba(255,255,255,0.25), rgba(255,255,255,0))' : '';
  return `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0.25) 18%, rgba(255,255,255,0) 42%)${pearl}, radial-gradient(circle at 70% 85%, rgba(0,0,0,0.28), rgba(0,0,0,0) 55%), ${hex}`;
}

/** One glossy paint chip. */
function Chip({ c, on, onPick, size = 40 }: { c: CarColor; on: boolean; onPick: (c: CarColor, el: HTMLElement) => void; size?: number }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={c.name}
      title={c.name}
      onClick={(e) => onPick(c, e.currentTarget)}
      className={cx('grid shrink-0 place-items-center rounded-full transition-all duration-300', on ? 'scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-ink)]' : 'shadow-[0_2px_5px_rgba(0,0,0,0.15)] active:scale-90')}
      style={{ width: size, height: size, background: swatchBg(c.name, c.hex) }}>
      {on && <Check size={size * 0.42} strokeWidth={3} className="pop-in" color={isLight(c.hex) ? '#1a1a1a' : '#fff'} />}
    </button>
  );
}

/**
 * The showroom: a dark spotlit stage. On open the camera swoops in round the car while its name
 * slides up; the floor glows in the paint colour, which splashes on every change.
 */
function Stage({ car, splash, onSplashEnd }: { car: Car; splash: { hex: string; id: number; x: number } | null; onSplashEnd: () => void }) {
  const model = model3dFor(car);
  const controls = useRef<CarControls | null>(null);
  if (!model) return null;
  return (
    <div className="relative mt-1 h-[340px] overflow-hidden overflow-clip rounded-[28px] bg-[#f1efec]">
      <Car3DView key={model.uid} car={car} background={tintedBackground([0.955, 0.948, 0.937], car.color.hex, 0.08)} controls={controls} intro />
      {/* spotlight + floor glow in the paint colour (over the car, never blocking touches) */}
      <span className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,255,255,0.7),transparent_70%)]" />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 transition-[background] duration-700"
        style={{ background: `radial-gradient(ellipse 70% 75% at 50% 100%, ${car.color.hex}30, transparent 78%)` }}
      />
      {splash && (
        <span
          key={splash.id}
          onAnimationEnd={onSplashEnd}
          className="paint-splash pointer-events-none absolute z-[3] h-[460px] w-[460px] rounded-full"
          style={{ left: `calc(${splash.x}% - 230px)`, top: 'calc(100% - 230px)', background: `radial-gradient(circle, ${splash.hex}cc 0%, ${splash.hex}55 45%, ${splash.hex}00 70%)` }}
        />
      )}
      <span className="showroom-sweep pointer-events-none absolute inset-0 z-[2]" />
      <div key={`${car.make}|${car.model}`} className="pointer-events-none absolute left-4 top-4 z-[2] text-ink">
        <p className="rise-in text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">{car.make}</p>
        <h1 className="rise-in text-[28px] font-bold leading-8 tracking-tight [animation-delay:120ms]">{car.model}</h1>
      </div>
      <span className="pointer-events-none absolute right-3 top-4 z-[2] rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">3D · drag to rotate</span>
      <div className="absolute bottom-3 left-3 right-3 z-[2] flex justify-between">
        <button type="button" aria-label="Rotate left" onClick={() => controls.current?.rotate(-60)} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur active:scale-90">
          <RotateCcw size={18} />
        </button>
        <button type="button" aria-label="Rotate right" onClick={() => controls.current?.rotate(60)} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur active:scale-90">
          <RotateCw size={18} />
        </button>
      </div>
    </div>
  );
}

/** All paints, opened from the + in the paint row. */
function PaintSheet({ value, onPick, onClose }: { value: CarColor; onPick: (c: CarColor, el: HTMLElement) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div role="dialog" aria-label="All colours" className="pb-safe sheet-in rounded-t-[30px] bg-white px-5 pb-5 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold">All colours</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-surface">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4">
          {COLORS.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-1.5">
              <Chip
                c={c}
                size={52}
                on={value.name === c.name}
                onPick={(col, el) => {
                  onPick(col, el);
                  setTimeout(onClose, 250);
                }}
              />
              <span className={cx('text-center text-[11px] leading-[13px]', value.name === c.name ? 'font-semibold' : 'text-gray')}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Tap-to-open car picker: a sheet with search, cars grouped by make, and a photo of each car. */
function CarPicker({ value, onPick }: { value: Car; onPick: (c: (typeof CARS_3D)[number]) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = model3dFor(value);
  const query = q.trim().toLowerCase();
  const list = CARS_3D.filter((c) => !query || c.make.toLowerCase() === query || `${c.make} ${c.model}`.toLowerCase().includes(query));
  const makes = [...new Set(list.map((c) => c.make))];

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Car: ${value.make} ${value.model}. Change car`}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-transparent bg-field p-2 pr-4 text-left transition active:scale-[0.99]">
        {current?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.thumb} alt="" className="h-12 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="h-12 w-16 shrink-0 rounded-xl bg-white" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] text-gray">{value.make}</span>
          <span className="block truncate text-[16px] font-semibold">{value.model}</span>
        </span>
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray">
          Change <ChevronDown size={16} />
        </span>
      </button>

      {open && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Choose your car"
            className="pb-safe sheet-in flex max-h-[82%] flex-col rounded-t-[30px] bg-white"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-[19px] font-bold">Choose your car</h2>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-surface">
                <X size={18} />
              </button>
            </div>
            <label className="mx-5 mb-2 flex h-11 items-center gap-2 rounded-2xl bg-field px-3.5">
              <Search size={17} className="text-gray" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search make or model" aria-label="Search cars" className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray" />
            </label>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-2">
              {['All', ...new Set(CARS_3D.map((c) => c.make))].map((mk) => {
                const on = mk === 'All' ? !query : query === mk.toLowerCase();
                return (
                  <button
                    key={mk}
                    type="button"
                    onClick={() => setQ(mk === 'All' ? '' : mk)}
                    className={cx('h-8 shrink-0 rounded-full px-3 text-[13px] font-medium', on ? 'bg-ink text-white' : 'bg-surface text-ink')}>
                    {mk}
                  </button>
                );
              })}
            </div>
            <div className="scroll min-h-0 flex-1 px-5 pb-4">
              {makes.length === 0 && <p className="py-10 text-center text-[14px] text-gray">No cars match “{q}”. More cars are coming soon.</p>}
              {makes.map((make) => (
                <section key={make} className="mt-2">
                  <h3 className="sticky top-0 z-[1] bg-white py-1.5 text-[12px] font-semibold uppercase tracking-wider text-gray">{make}</h3>
                  {list
                    .filter((c) => c.make === make)
                    .map((c) => {
                      const m = model3dFor(c);
                      const on = c.make === value.make && c.model === value.model;
                      return (
                        <button
                          key={c.model}
                          type="button"
                          onClick={() => {
                            onPick(c);
                            setOpen(false);
                            setQ('');
                          }}
                          className={cx('mb-1.5 flex w-full items-center gap-3 rounded-2xl p-2 pr-3 text-left transition', on ? 'bg-ink text-white' : 'bg-surface active:bg-field')}>
                          {m?.thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.thumb} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-xl object-cover" />
                          ) : (
                            <span className="h-12 w-16 shrink-0 rounded-xl bg-white" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold">{c.model}</span>
                            <span className={cx('block text-[12px]', on ? 'text-white/70' : 'text-gray')}>3D · any colour</span>
                          </span>
                          {on && <Check size={18} />}
                        </button>
                      );
                    })}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
