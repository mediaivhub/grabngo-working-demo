'use client';

import { AlarmClock, Archive, CheckCircle2, Inbox, MessageCircle, QrCode, Receipt, Smartphone, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { alwaysOn, SettingsRow, SettingsSection } from '@/components/settings';
import { NavHeader } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export default function NotificationSettingsScreen() {
  const { prefs, setPref } = useStore();
  const toggle = (key: string) => ({ value: prefs[key] ?? false, onToggle: (v: boolean) => setPref(key, v) });
  return (
    <main className="screen pt-safe bg-surface">
      <div className="bg-white">
        <NavHeader
          title="Notifications"
          fallback="/profile"
          right={
            <Link href="/notifications" aria-label="Notification inbox">
              <Inbox size={23} />
            </Link>
          }
        />
      </div>
      <div className="scroll pb-safe pb-8">
        <SettingsSection title="Core Notifications">
          <SettingsRow first Icon={CheckCircle2} title="When order is ready" right={alwaysOn} />
          <SettingsRow Icon={Archive} title="Order updates" subtitle="Receive updates about order status" {...toggle('orderUpdates')} />
          <SettingsRow Icon={AlarmClock} title="Pickup reminders" right={alwaysOn} />
        </SettingsSection>
        <SettingsSection title="Restaurant & Offers" collapsible>
          <SettingsRow first Icon={Receipt} title="Special offers" subtitle="Get offers and updates" {...toggle('specialOffers')} />
          <SettingsRow Icon={UtensilsCrossed} title="New restaurant alerts" {...toggle('newRestaurants')} />
          <SettingsRow Icon={Smartphone} title="Enable dynamic island" {...toggle('dynamicIsland')} />
        </SettingsSection>
        <SettingsSection title="Delivery / Pickup" collapsible>
          <SettingsRow first Icon={QrCode} title="QR code alerts" subtitle="Get alerts for QR code updates." {...toggle('qrAlerts')} />
          <SettingsRow Icon={MessageCircle} title="Order follow-up" {...toggle('followUp')} />
        </SettingsSection>
      </div>
    </main>
  );
}
