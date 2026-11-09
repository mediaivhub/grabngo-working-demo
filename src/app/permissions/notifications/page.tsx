'use client';

import { useRouter } from 'next/navigation';
import { PermissionScreen } from '@/components/PermissionScreen';
import { orbs } from '@/components/ui';
import { setOnboarded } from '@/lib/onboarding';

export default function EnableNotificationsScreen() {
  const router = useRouter();
  const next = () => {
    setOnboarded();
    router.replace('/home');
  };
  return (
    <PermissionScreen
      orb={orbs.bell}
      title={'Stay updated on\nyour order'}
      body="Get instant updates when your order is confirmed, being prepared, and ready for pickup."
      primaryLabel="Turn on Notifications"
      secondaryLabel="Maybe later"
      onPrimary={async () => {
        try {
          if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
        } catch {}
        next();
      }}
      onSecondary={next}
    />
  );
}
