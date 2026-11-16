'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CarStage } from '@/components/car';
import { Button, cx, NavHeader, useGoBack } from '@/components/ui';
import { type Car, carName, CARS_3D, DEMO_CAR, EMIRATES, type EmirateId, model3dFor, plateText } from '@/lib/car';
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
          <div role="radiogroup" aria-label="Car" className="grid grid-cols-2 gap-2">
            {CARS_3D.map((c) => {
              const on = c.make === car.make && c.model === car.model;
              return (
                <button
                  key={`${c.make}|${c.model}`}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set(c)}
                  className={cx('rounded-2xl border-[1.5px] p-3 text-left transition', on ? 'border-ink bg-white' : 'border-transparent bg-field')}>
                  <span className="block text-[12px] text-gray">{c.make}</span>
                  <span className="mt-0.5 block text-[16px] font-semibold">{c.model}</span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-gray">
                    <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ background: c.color.hex }} />
                    {c.color.name} · 3D
                  </span>
                </button>
              );
            })}
          </div>
          <CarStage car={car} className="-mx-1.5 mt-3" />
          <p className="mt-1.5 text-right text-[11px] text-gray">Real 3D model · more cars coming soon</p>
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
