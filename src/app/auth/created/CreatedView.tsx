'use client';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormScreen } from '@/components/forms';
import { Button, CircleButton, orbs } from '@/components/ui';

export function CreatedView() {
  const router = useRouter();
  const toCheckout = useSearchParams().get('next') === 'checkout';
  return (
    <FormScreen
      hideBack
      headerRight={
        <CircleButton label="Close" size={48} onClick={() => router.replace('/home')}>
          <X size={22} />
        </CircleButton>
      }
      orb={orbs.check}
      title={'Account Created\nSuccessfully!'}
      subtitle="Welcome to GrabnGo your quick and easy way to pick up your favorite meals."
      footer={
        <Button size="lg" onClick={() => router.replace(toCheckout ? '/checkout' : '/home')}>
          {toCheckout ? 'Continue to Checkout' : 'Continue'}
        </Button>
      }
    />
  );
}
