'use client';

import { Bell, Car, ChefHat, ChevronRight, Cookie, CreditCard, HelpCircle, Lock, LogOut, MapPin, MessageCircle, User, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { avatarSrc } from '@/components/cards';
import { SettingsRow } from '@/components/settings';
import { Button } from '@/components/ui';
import { plateText } from '@/lib/car';
import { useStore } from '@/store/AppStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, orders, favoriteProducts, logout, car } = useStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  // Screens that need an account send guests to log in first.
  const go = (href: string) => router.push(user ? href : '/auth/login');

  const tiles = [
    { Icon: Cookie, title: 'Orders', subtitle: `You’ve made ${orders.length} orders`, href: '/account/orders' },
    { Icon: UtensilsCrossed, title: 'Favorite Restaurants', href: '/account/favorite-places' },
    { Icon: ChefHat, title: 'Favorite order', subtitle: `${favoriteProducts.length} Items saved`, href: '/account/favorite-items' },
    { Icon: CreditCard, title: 'Payment', subtitle: 'Manage payment system', href: '/account/payments' },
  ];

  return (
    // A tab now: it sits in the tab sheet, so no back button and no own safe-area padding.
    <main className="relative flex min-h-0 flex-1 flex-col bg-surface">
      <h1 className="px-5 pb-1 pt-4 text-[26px] font-bold tracking-tight">Profile</h1>
      <div className="scroll flex flex-col">
        <button type="button" onClick={() => go('/account/details')} className="mt-3 flex items-center gap-4 px-5 text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc(user?.avatarUri)} alt="" className="h-16 w-16 rounded-full bg-divider object-cover" />
          <span>
            <span className="block text-[19px] font-medium">{user?.fullName || 'Guest'}</span>
            <span className="mt-1 flex items-center gap-0.5 text-[16px] text-gray">
              {user ? 'Edit profile' : 'Log in or sign up'} <ChevronRight size={16} />
            </span>
          </span>
        </button>
        <div className="mt-6 grid grid-cols-2 gap-2 px-5">
          {tiles.map(({ Icon, title, subtitle, href }) => (
            <button key={title} type="button" onClick={() => go(href)} className="flex min-h-20 flex-col justify-center rounded-[22px] bg-white p-4 text-left">
              <span className="flex items-start gap-2">
                <Icon size={23} className="shrink-0 text-brand" />
                <span className="text-[17px] font-medium leading-5">{title}</span>
              </span>
              {subtitle && <span className="mt-1.5 text-[12.5px] text-gray">{subtitle}</span>}
            </button>
          ))}
        </div>
        <div className="mt-10 flex-1 rounded-t-[30px] bg-white px-5 pb-10 pt-3.5">
          <SettingsRow first Icon={User} title="Account Settings" chevron onClick={() => go('/account/details')} />
          <SettingsRow Icon={Car} title="My Car" subtitle={car ? `${car.make} ${car.model} · ${plateText(car)}` : 'For curbside pickup'} chevron onClick={() => go('/account/car')} />
          <SettingsRow Icon={Bell} title="Notifications" chevron onClick={() => router.push('/account/notifications')} />
          <SettingsRow Icon={Lock} title="Privacy & Security" chevron onClick={() => router.push('/account/privacy')} />
          <SettingsRow Icon={MapPin} title="Location Access" chevron onClick={() => router.push('/account/privacy')} />
          <SettingsRow Icon={HelpCircle} title="FAQs" chevron onClick={() => router.push('/account/faqs')} />
          <SettingsRow Icon={MessageCircle} title="Live Chat" chevron onClick={() => router.push('/account/chat')} />
          {user && <SettingsRow Icon={LogOut} title="Log Out" chevron onClick={() => setConfirmLogout(true)} />}
        </div>
      </div>
      {confirmLogout && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/35" onClick={() => setConfirmLogout(false)}>
          <div role="dialog" aria-label="Log out" className="pb-safe rounded-t-[30px] bg-white p-6 sheet-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[22px] font-bold">Log out?</h2>
            <p className="mb-[22px] mt-2 text-[15px] leading-[21px] text-gray">You’ll need your phone number and a verification code to log back in.</p>
            <Button
              onClick={() => {
                logout();
                setConfirmLogout(false);
                router.replace('/home');
              }}>
              Log Out
            </Button>
            <Button variant="secondary" className="mb-3 mt-2.5" onClick={() => setConfirmLogout(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
