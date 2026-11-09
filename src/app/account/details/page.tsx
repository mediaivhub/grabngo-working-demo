'use client';

import { Calendar } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { avatarSrc } from '@/components/cards';
import { ErrorText } from '@/components/forms';
import { Button, NavHeader, useGoBack } from '@/components/ui';
import { formatUaePhone, isValidUaePhone, typedPhone } from '@/lib/phone';
import { useStore, type User } from '@/store/AppStore';

/** "10041998" → "10 / 04 / 1998" */
function formatDob(input: string) {
  const d = input.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(' / ');
}

function isValidDob(value: string) {
  const m = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(value);
  if (!m) return false;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date < new Date() && year > 1900;
}

function UnderlineField({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="mt-[22px] block">
      <span className="text-[14px] text-gray">{label}</span>
      <span className={`flex items-center border-b ${error ? 'border-error' : 'border-divider'}`}>{children}</span>
      {error && (
        <span className="mt-2 block">
          <ErrorText text={error} />
        </span>
      )}
    </label>
  );
}

export default function PersonalDetailsScreen() {
  const { user, ready } = useStore();
  return (
    <main className="screen pt-safe pb-safe bg-surface">
      {/* Wait for saved data so the form starts from the real profile. */}
      {ready && user ? <DetailsForm user={user} /> : <NavHeader title="Your Personal Details" fallback="/profile" className="bg-white" />}
    </main>
  );
}

function DetailsForm({ user }: { user: User }) {
  const back = useGoBack('/profile');
  const { updateUser } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [dob, setDob] = useState(user.dob ?? '');
  const [avatarUri, setAvatarUri] = useState(user.avatarUri);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: submitted && !fullName.trim() ? 'Please enter your name.' : undefined,
    phone: submitted && !isValidUaePhone(phone) ? 'Invalid phone number. Try again.' : undefined,
    dob: submitted && dob && !isValidDob(dob) ? 'Enter a valid date (DD / MM / YYYY).' : undefined,
  };

  const pickAvatar = (f?: File) => {
    if (!f) return;
    // Shrink to a small data URL so it fits in browser storage.
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const s = Math.min(img.width, img.height);
      canvas.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      setAvatarUri(canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  };

  const save = () => {
    setSubmitted(true);
    if (!fullName.trim() || !isValidUaePhone(phone) || (dob && !isValidDob(dob))) return;
    updateUser({ fullName: fullName.trim(), phone: formatUaePhone(phone), dob, avatarUri });
    back();
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col rounded-b-[30px] bg-white">
        <NavHeader title="Your Personal Details" fallback="/profile" />
        <div className="scroll px-5 pb-8">
          <div className="mb-7 mt-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc(avatarUri)} alt="" className="h-[150px] w-[150px] rounded-full bg-divider object-cover" />
            <button type="button" onClick={() => file.current?.click()} className="-mt-6 h-11 rounded-full bg-surface px-[18px] text-[16px]">
              Change your avatar
            </button>
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pickAvatar(e.target.files?.[0])} />
          </div>
          <UnderlineField label="Full name" error={errors.name}>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className="h-12 flex-1 bg-transparent text-[19px]" />
          </UnderlineField>
          <UnderlineField label="Phone" error={errors.phone}>
            <input value={phone} onChange={(e) => setPhone(typedPhone(e.target.value))} type="tel" autoComplete="tel" className="h-12 flex-1 bg-transparent text-[19px]" />
          </UnderlineField>
          <UnderlineField label="Date of Birth" error={errors.dob}>
            <input value={dob} onChange={(e) => setDob(formatDob(e.target.value))} placeholder="DD / MM / YYYY" inputMode="numeric" className="h-12 flex-1 bg-transparent text-[19px] placeholder:text-gray-light" />
            <Calendar size={22} className="text-muted" />
          </UnderlineField>
        </div>
      </div>
      <div className="mt-1.5 rounded-t-[30px] bg-white px-5 pb-2 pt-5">
        <Button size="lg" onClick={save}>
          Save Changes
        </Button>
      </div>
    </>
  );
}
