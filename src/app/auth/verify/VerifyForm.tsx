'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorText, FormScreen, OtpInput } from '@/components/forms';
import { Button, orbs } from '@/components/ui';
import { OTP_DEMO_CODE } from '@/data/mock';
import { TEST_ACCOUNT, useStore } from '@/store/AppStore';

export function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';
  const mode = params.get('mode') ?? 'login';
  const fullName = params.get('fullName') ?? '';
  const nickname = params.get('nickname') ?? '';
  const next = params.get('next') ?? '';
  const { login } = useStore();
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const [resent, setResent] = useState(false);

  const verify = () => {
    // Mock backend: the demo code is always accepted.
    if (code !== OTP_DEMO_CODE) return setWrong(true);
    if (mode === 'signup') {
      login({ fullName, nickname: nickname || fullName.split(' ')[0], phone });
      router.replace(`/auth/created?next=${next}`);
    } else {
      // The test number logs into the demo profile; any other number gets a fresh profile.
      login(phone === TEST_ACCOUNT.phone ? TEST_ACCOUNT : { fullName: 'GrabnGo Guest', nickname: 'Guest', phone });
      router.replace(next === 'checkout' ? '/checkout' : '/home');
    }
  };

  const resend = () => {
    setResent(true);
    setWrong(false);
    setCode('');
  };

  return (
    <FormScreen header="Verify Your Number" orb={orbs.phone} title="Verify Your Number" subtitle={`We’ve sent a 5-digit code to\n${phone}`}>
      <OtpInput
        value={code}
        error={wrong}
        onChange={(v) => {
          setCode(v);
          setWrong(false);
        }}
      />
      {wrong ? (
        <div className="flex items-center justify-between">
          <ErrorText text="Wrong code. Try again." />
          <button type="button" onClick={resend} className="text-[15px] font-medium">
            Resend SMS
          </button>
        </div>
      ) : code.length > 0 || resent ? (
        <p className="text-[15px] text-gray">
          {resent ? (
            'Code sent again.'
          ) : (
            <>
              Don’t get the OTP?{' '}
              <button type="button" onClick={resend} className="font-medium text-ink">
                Resend SMS
              </button>
            </>
          )}
        </p>
      ) : null}
      <Button size="lg" disabled={code.length < 5} onClick={verify}>
        Verify & Continue
      </Button>
      <p className="text-center text-[13px] text-gray-light">Demo code: {OTP_DEMO_CODE}</p>
    </FormScreen>
  );
}
