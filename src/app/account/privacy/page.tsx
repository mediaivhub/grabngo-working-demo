'use client';

import { Activity, Clock, CreditCard, Navigation, SlidersHorizontal, Sparkles, User } from 'lucide-react';
import { alwaysOn, SettingsRow, SettingsSection } from '@/components/settings';
import { NavHeader } from '@/components/ui';
import { requestLocation } from '@/lib/permissions';
import { useStore } from '@/store/AppStore';

export default function PrivacyScreen() {
  const { prefs, setPref } = useStore();
  const toggle = (key: string) => ({ value: prefs[key] ?? false, onToggle: (v: boolean) => setPref(key, v) });
  return (
    <main className="screen pt-safe bg-surface">
      <div className="bg-white">
        <NavHeader title="Privacy & Security" fallback="/profile" />
      </div>
      <div className="scroll pb-safe pb-8">
        <SettingsSection title="Data & Personalization">
          <SettingsRow first Icon={User} title="Personalization" subtitle="Recommendations for you" right={alwaysOn} />
          <SettingsRow Icon={Sparkles} title="Improve app experience" subtitle="Help improve performance" {...toggle('improveExperience')} />
          <SettingsRow Icon={Activity} title="Data Sharing & Permissions" {...toggle('dataSharing')} />
        </SettingsSection>
        <SettingsSection title="Location Access" collapsible>
          <SettingsRow
            first
            Icon={Navigation}
            title="Location access"
            subtitle="Used to time your order to your arrival"
            value={prefs.locationInSettings ?? false}
            onToggle={(v) => {
              setPref('locationInSettings', v);
              // The permission itself lives in the browser / OS; turning this on asks for it.
              if (v) void requestLocation();
            }}
          />
          <SettingsRow Icon={Clock} title="Smart order timing" subtitle="Use location to time your order preparation" {...toggle('backgroundLocation')} />
        </SettingsSection>
        <SettingsSection title="Communication preferences" collapsible>
          <SettingsRow first Icon={SlidersHorizontal} title="Marketing emails" {...toggle('marketingEmails')} />
          <SettingsRow Icon={CreditCard} title="Email receipts" subtitle="Get a receipt for every order" {...toggle('emailReceipts')} />
        </SettingsSection>
      </div>
    </main>
  );
}
