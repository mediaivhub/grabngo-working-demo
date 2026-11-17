'use client';

import { Check, ChevronDown, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { CarStage } from '@/components/car';
import { Button, cx, NavHeader, useGoBack } from '@/components/ui';
import { type Car, carName, CARS_3D, COLORS, DEMO_CAR, EMIRATES, type EmirateId, model3dFor, plateText } from '@/lib/car';
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

  const plateOk = car.code.length > 0 && car.number.length >= 1;
  const save = () => {
    setCar(car);
    back();
  };

  return (
    <>
      <div className="scroll flex-1">
        <div className="rounded-b-[30px] bg-white px-5 pb-5">
          <NavHeader title="My Car" fallback="/profile" className="-mx-5" />
          <p className="text-[14px] leading-5 text-gray">For curbside pickup. Staff use your plate, make and colour to find your car.</p>
          <p className="mb-2 mt-4 text-[13px] font-medium text-gray">Choose your car</p>
          <CarPicker value={car} onPick={(c) => set({ ...c, color: car.color })} />
          <CarStage car={car} className="-mx-1.5 mt-3" />
          <p className="mt-1.5 text-right text-[11px] text-gray">Drag to rotate · {CARS_3D.length} cars in 3D</p>

          <p className="mb-2 mt-3 text-[13px] font-medium text-gray">
            Colour · <span className="text-ink">{car.color.name}</span>
          </p>
          <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => {
              const on = car.color.name === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => set({ color: c })}
                  className={cx('h-[34px] w-[34px] rounded-full border-2 border-white transition-transform', on ? 'scale-105 shadow-[0_0_0_2px_var(--color-ink)]' : 'shadow-[0_0_0_1px_var(--color-divider)]')}
                  style={{ background: c.hex }}
                />
              );
            })}
          </div>
          <p className="mb-2 mt-4 text-[13px] font-medium text-gray">Plate</p>
          <div className="flex gap-2">
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
        </div>
      </div>
      <div className="bg-surface px-5 pt-3">
        <Button disabled={!plateOk || !model3dFor(car)} onClick={save}>
          Save Car
        </Button>
      </div>
    </>
  );
}

/** Tap-to-open car picker: a sheet with search, cars grouped by make, and a photo of each car. */
function CarPicker({ value, onPick }: { value: Car; onPick: (c: (typeof CARS_3D)[number]) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = model3dFor(value);
  const query = q.trim().toLowerCase();
  const list = CARS_3D.filter((c) => !query || `${c.make} ${c.model}`.toLowerCase().includes(query));
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
