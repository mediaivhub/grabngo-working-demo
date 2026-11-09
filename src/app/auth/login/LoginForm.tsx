'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Field, FormScreen, SwitchLink } from '@/components/forms';
import { Button, orbs } from '@/components/ui';
import { formatUaePhone, isValidUaePhone, typedPhone } from '@/lib/phone';
import { TEST_ACCOUNT } from '@/store/AppStore';

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '';
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const valid = isValidUaePhone(phone);

  const submit = () => {
    setSubmitted(true);
    if (!valid) return;
    router.push(`/auth/verify?${new URLSearchParams({ phone: formatUaePhone(phone), mode: 'login', next })}`);
  };

  return (
    <FormScreen
      header="Login"
      orb={orbs.user}
      title="Login to Continue"
      subtitle="To confirm your order, you’ll need to log in or create an account."
      footer={<SwitchLink muted="Don’t have an account?" link="Sign up" onClick={() => router.replace(`/auth/signup?next=${next}`)} />}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}>
        <Field
          prefix="UAE"
          placeholder="Enter phone number"
          type="tel"
          autoComplete="tel"
          aria-label="Phone number"
          value={phone}
          onChange={(e) => setPhone(typedPhone(e.target.value))}
          status={valid ? 'valid' : submitted ? 'error' : 'idle'}
          error="Invalid phone number. Try again."
        />
        <Button type="submit" size="lg">
          Log in
        </Button>
      </form>
      <button type="button" onClick={() => setPhone(TEST_ACCOUNT.phone)} className="rounded-2xl bg-card px-4 py-3 text-left text-[14px] leading-5 text-gray">
        <span className="font-medium text-ink">Test account</span> · {TEST_ACCOUNT.phone} · code 12345
        <span className="block text-[13px]">Tap to fill in</span>
      </button>
    </FormScreen>
  );
}
