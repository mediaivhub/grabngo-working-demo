'use client';

import { ArrowLeft, Clock, Heart, LogIn, Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { FloatingCart } from '@/components/CartFly';
import { RestaurantInvitation } from '@/components/Invitations';
import { DessertLayers } from '@/components/DessertLayers';
import { FoodTurntable } from '@/components/FoodTurntable';
import { MenuCard } from '@/components/MenuCard';
import { SignatureCarousel } from '@/components/SignatureCarousel';
import { useStatusBarTone } from '@/components/StatusBarTone';
import { CircleButton, cx, Pill, useGoBack } from '@/components/ui';
import { getMenu, getPlace, menuProducts, menuTabs, type Category, type Product } from '@/data/mock';
import { groupSchedule, openStatus } from '@/lib/hours';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/AppStore';

const HERO = 400;

export function RestaurantView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const back = useGoBack();
  const place = getPlace(id) ?? getPlace('orfali')!;
  const { favoritePlaces, toggleFavoritePlace } = useStore();
  const isFavorite = favoritePlaces.includes(place.id);
  const [tab, setTab] = useState<Category>('for-you');
  const [hoursOpen, setHoursOpen] = useState(false);
  // Opening status depends on the clock, so it's worked out in the browser.
  const now = useNow(60_000);
  const status = now ? openStatus(place.schedule, new Date(now)) : { open: true, label: 'Hours' };
  // White status bar over the photo, dark once it scrolls away.
  const [overPhoto, setOverPhoto] = useState(true);
  useStatusBarTone(overPhoto ? 'light' : 'dark');

  // Everything below comes from this merchant's own menu (items, sections, prices, colours).
  const menu = getMenu(place.id);
  const { theme } = menu;
  const all = menuProducts(menu, menu.items);
  const signature = menuProducts(menu, menu.signature);
  const food = menuProducts(menu, menu.food);
  const desserts = menuProducts(menu, menu.desserts);
  const tabs = menuTabs.filter((t) => t.id === 'for-you' || all.some((p) => p.categories.includes(t.id)));
  const filtered = all.filter((p) => p.categories.includes(tab));

  const grid = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-3 px-5">
      {items.map((p) => (
        <MenuCard key={p.id} product={p} placeId={place.id} />
      ))}
    </div>
  );

  return (
    <main className="screen">
      <div className="scroll pb-safe" onScroll={(e) => setOverPhoto(e.currentTarget.scrollTop < HERO - 80)}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.hero} alt="" className="w-full object-cover" style={{ height: HERO }} />
          <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-b from-white/0 to-white" />
        </div>
        <div className="relative z-[1] -mt-6 px-5 text-center">
          <h1 className="mx-auto max-w-[240px] text-[28px] font-medium leading-[34px] text-ink">{place.name}</h1>
          <p className="mt-3 text-[16px] text-gray">{place.address}</p>
          <div className="relative mt-[26px] flex flex-wrap justify-center gap-2">
            <Pill size="md" tone="gray" icon={status.open ? <LogIn size={17} /> : undefined} label={status.label} onClick={() => setHoursOpen(true)} />
            <Pill size="md" tone="gray" icon={<Clock size={17} />} label={place.eta} />
            <Pill size="md" tone="gray" icon={<Star size={17} />} label={place.rating.toFixed(1)} onClick={() => router.push(`/reviews/${place.id}`)} />
            {hoursOpen && (
              <>
                <button type="button" aria-label="Close opening hours" className="fixed inset-0 z-10 cursor-default" onClick={() => setHoursOpen(false)} />
                <div className="absolute bottom-[52px] left-0 z-20 w-[215px] rounded-[22px] bg-[#FAF8F6] px-5 py-3.5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.15)] fade-in">
                  {groupSchedule(place.schedule).map((r, i) => (
                    <Fragment key={r.days}>
                      {i > 0 && <div className="my-2.5 h-px bg-[#CFCFCF]" />}
                      <p className="text-[13px] text-gray">{r.days}</p>
                      <p className="mt-0.5 text-[17px] text-ink">{r.hours}</p>
                    </Fragment>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-[30px] rounded-[22px] bg-card p-4 text-left">
            <p className="text-[17px] font-medium">Details</p>
            <p className="mt-2.5 text-[15px] leading-[21px] text-gray">{place.details}</p>
          </div>
        </div>
        <RestaurantInvitation placeId={place.id} />

        <div className="sticky z-10 mt-4 bg-white pb-2" style={{ top: 'var(--safe-top)', boxShadow: '0 calc(-1 * var(--safe-top)) 0 #fff' }}>
          <div className="hscroll gap-1 px-5 pt-2" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cx('h-10 shrink-0 rounded-full px-4 text-[15px] text-ink', tab === t.id && 'bg-surface')}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'for-you' ? (
          <div>
            {signature.length > 0 && <SignatureCarousel items={signature} placeId={place.id} theme={theme} title={theme.titles?.signature} />}
            {food.length > 0 && (
              <>
                <div className="mx-5 mb-2">
                  <h2 className="text-[24px] text-ink">{theme.titles?.food ?? 'Food'}</h2>
                  <p className="mt-1 text-[14px] text-gray">Drag up or down to spin the table</p>
                </div>
                <FoodTurntable items={food} placeId={place.id} theme={theme} />
              </>
            )}
            {desserts.length > 0 && (
              <>
                <div className="mx-5 mb-2 mt-7">
                  <h2 className="text-[24px] text-ink">{theme.titles?.desserts ?? 'Desserts'}</h2>
                  <p className="mt-1 text-[14px] text-gray">{desserts.length > 1 ? 'Swipe sideways through the desserts' : 'A little something sweet'}</p>
                </div>
                <DessertLayers items={desserts} placeId={place.id} theme={theme} />
              </>
            )}
          </div>
        ) : (
          <div className="pt-3">{grid(filtered)}</div>
        )}
        <div className="h-24" />
      </div>
      <FloatingCart placeId={place.id} />

      <div className="pointer-events-none absolute inset-x-4 flex items-center justify-between" style={{ top: 'calc(var(--safe-top) + 10px)' }}>
        <CircleButton label="Back" variant="white" size={52} onClick={back} className="pointer-events-auto">
          <ArrowLeft size={24} />
        </CircleButton>
        <span className="text-[17px] font-medium text-white drop-shadow">{place.kind === 'cafe' ? 'Cafe’s' : 'Restaurants'}</span>
        <CircleButton label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} variant="white" size={52} onClick={() => toggleFavoritePlace(place.id)} className="pointer-events-auto">
          <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
        </CircleButton>
      </div>
    </main>
  );
}
