'use client';

import { useRouter } from 'next/navigation';
import { PermissionScreen } from '@/components/PermissionScreen';
import { orbs } from '@/components/ui';
import { requestLocation } from '@/lib/permissions';

export default function EnableLocationScreen() {
  const router = useRouter();
  const next = () => router.replace('/permissions/notifications');
  return (
    <PermissionScreen
      orb={orbs.location}
      title={'Enable smart timing\nwith location'}
      body="GrabnGo uses your location to track your journey and perfectly time your order preparation. Your food will be fresh and ready when you arrive."
      primaryLabel="Enable Location"
      secondaryLabel="Not now"
      onPrimary={async () => {
        await requestLocation();
        next();
      }}
      onSecondary={next}
    />
  );
}
