'use client';

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Car3DSheet, CarStage } from '@/components/car';
import { Button, cx, NavHeader, useGoBack } from '@/components/ui';
import { type Car, type CarModel, carName, COLORS, DEMO_CAR, EMIRATES, type EmirateId, MAKES, model3dFor, modelsFor, plateText, POPULAR } from '@/lib/car';
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
  const [models, setModels] = useState<CarModel[] | null>(null);
  const [show3d, setShow3d] = useState(false);
  const [customHex, setCustomHex] = useState(car.color.custom ? car.color.hex : '#7a4fd1');
  const set = (patch: Partial<Car>) => setDraft((c) => ({ ...c, ...patch }));

  // Load the models for the chosen make; keep the current model if it's in the list.
  useEffect(() => {
    let live = true;
    modelsFor(car.make).then((list) => {
      if (!live) return;
      setModels(list);
      setDraft((c) => {
        if (c.make !== car.make) return c;
        const names = list.map((m) => m.name);
        const name = [c.model, POPULAR[c.make], names[0]].find((n) => n && names.includes(n)) ?? names[0];
        const body = list.find((m) => m.name === name)?.body ?? c.body;
        return name === c.model && body === c.body ? c : { ...c, model: name, body };
      });
    });
    return () => {
      live = false;
    };
  }, [car.make]);

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
          <CarStage car={car} onView3D={() => setShow3d(true)} className="-mx-1.5 mt-3.5" />
          {model3dFor(car) ? (
            <p className="mt-1.5 text-right text-[11px] text-gray">Real 3D model available for this car</p>
          ) : (
            <p className="mt-1.5 text-right text-[11px] text-gray">3D view: Nissan Patrol and Mercedes G 63</p>
          )}

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

          <p className="mb-2 mt-4 text-[13px] font-medium text-gray">Car{models ? ` · ${models.length} models` : ''}</p>
          <div className="flex gap-2">
            <select aria-label="Make" value={car.make} onChange={(e) => { setModels(null); set({ make: e.target.value }); }} className={fieldCls} style={selectBg}>
              {Object.keys(MAKES).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select
              aria-label="Model"
              value={car.model}
              disabled={!models}
              onChange={(e) => set({ model: e.target.value, body: models?.find((m) => m.name === e.target.value)?.body ?? car.body })}
              className={fieldCls}
              style={selectBg}>
              {models ? models.map((m) => <option key={m.name}>{m.name}</option>) : <option>{car.model || 'Loading models…'}</option>}
            </select>
          </div>

          <p className="mb-2 mt-4 text-[13px] font-medium text-gray">
            Colour · <span className="text-ink">{car.color.custom ? `Custom ${car.color.hex.toUpperCase()}` : car.color.name}</span>
          </p>
          <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => {
              const on = !car.color.custom && car.color.name === c.name;
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
            <label
              title="Custom colour"
              aria-label="Custom colour"
              className={cx('relative h-[34px] w-[34px] overflow-hidden rounded-full border-2 border-white', car.color.custom ? 'scale-105 shadow-[0_0_0_2px_var(--color-ink)]' : 'shadow-[0_0_0_1px_var(--color-divider)]')}
              style={{ background: car.color.custom ? car.color.hex : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}>
              <input
                type="color"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value);
                  set({ color: { name: 'Custom', hex: e.target.value, custom: true } });
                }}
                className="absolute -inset-2 h-[50px] w-[50px] cursor-pointer opacity-0"
              />
            </label>
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
        <Button disabled={!plateOk || !models} onClick={save}>
          Save Car
        </Button>
      </div>
      {show3d && <Car3DSheet car={car} onClose={() => setShow3d(false)} />}
    </>
  );
}
