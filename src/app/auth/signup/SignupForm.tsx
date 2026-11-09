'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Field, FormScreen, SwitchLink } from '@/components/forms';
import { Button, orbs } from '@/components/ui';
import { formatUaePhone, isValidUaePhone, typedPhone } from '@/lib/phone';

export function SignupForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '';
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const phoneValid = isValidUaePhone(phone);

  const submit = () => {
    setSubmitted(true);
    if (!phoneValid || !fullName.trim()) return;
    router.push(`/auth/verify?${new URLSearchParams({ phone: formatUaePhone(phone), mode: 'signup', fullName: fullName.trim(), nickname: nickname.trim(), next })}`);
  };

  return (
    <FormScreen
      header="Create Your Account"
      orb={orbs.user}
      title="Create Your Account"
      subtitle="To confirm your order, you’ll need to log in or create an account."
      footer={
        <>
          <Button size="lg" onClick={submit}>
            Continue
          </Button>
          <SwitchLink muted="Already have an account?" link="Log in" onClick={() => router.replace(`/auth/login?next=${next}`)} />
        </>
      }>
      <Field label="Full Name" placeholder="Enter your full name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} status={submitted && !fullName.trim() ? 'error' : 'idle'} error="Please enter your name." />
      <Field label="Nickname" placeholder="Enter your Nickname" autoComplete="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <Field
        label="Phone Number"
        prefix={phone ? 'UAE' : undefined}
        placeholder="Enter your phone number"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(typedPhone(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        status={phoneValid ? 'valid' : submitted ? 'error' : 'idle'}
        error="Invalid phone number. Try again."
      />
    </FormScreen>
  );
}
