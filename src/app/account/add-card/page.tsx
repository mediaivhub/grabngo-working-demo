'use client';

import { Check, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CardLogo } from '@/components/CardLogo';
import { ErrorText } from '@/components/forms';
import { Button, cx, NavHeader, useGoBack } from '@/components/ui';
import { cardDigits, detectBrand, formatCardNumber, formatExpiry, isCardComplete, isValidCardNumber, isValidCvv, isValidExpiry } from '@/lib/cards';
import { useStore } from '@/store/AppStore';

export default function AddCardScreen() {
  const back = useGoBack('/account/payments');
  const { addCard, setDefaultPayment, cards } = useStore();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [focus, setFocus] = useState<'number' | 'expiry' | 'cvv' | null>(null);
  const [touched, setTouched] = useState({ number: false, expiry: false });

  const brand = detectBrand(number);
  const numberValid = isValidCardNumber(number);
  const numberError = (touched.number || isCardComplete(number)) && cardDigits(number).length > 0 && !numberValid;
  const expiryError = touched.expiry && expiry.length > 0 && !isValidExpiry(expiry);
  const ready = numberValid && isValidExpiry(expiry) && isValidCvv(cvv, brand);

  const save = () => {
    if (!ready) return;
    const id = `card-${Date.now()}`;
    // Only what's needed to display the card is kept; the full number and CVV are discarded here.
    addCard({ id, brand, last4: cardDigits(number).slice(-4), expiry });
    if (cards.length === 0) setDefaultPayment(id);
    back();
  };

  const box = (field: 'number' | 'expiry' | 'cvv', error = false, valid = false) =>
    cx('flex h-[60px] items-center gap-2.5 rounded-full border-[1.5px] px-[22px] transition-colors', error ? 'border-error bg-white' : valid ? 'border-green bg-white' : focus === field ? 'border-ink bg-white' : 'border-transparent bg-field');

  return (
    <main className="screen pt-safe pb-safe sheet-in">
      <NavHeader title="Add New Card" className="h-[60px] border-b border-divider" fallback="/account/payments" />
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}>
        <div className="scroll p-5">
          <h1 className="mb-6 mt-2 text-[27px] font-medium tracking-tight">Enter Card Details</h1>
          <label className="mb-3 ml-1 block text-[17px]" htmlFor="cc-number">
            Card Number
          </label>
          <div className={box('number', numberError, numberValid && focus !== 'number')}>
            <input
              id="cc-number"
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
              placeholder="Card number"
              inputMode="numeric"
              autoComplete="cc-number"
              onFocus={() => setFocus('number')}
              onBlur={() => {
                setFocus(null);
                setTouched((t) => ({ ...t, number: true }));
              }}
              className="h-full flex-1 bg-transparent text-[17px] placeholder:text-field-text"
            />
            {numberValid && focus !== 'number' ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-white">
                <Check size={15} strokeWidth={3} />
              </span>
            ) : cardDigits(number).length > 0 && brand !== 'card' ? (
              <CardLogo brand={brand} small />
            ) : (
              <CreditCard size={24} className="text-muted" />
            )}
          </div>
          {numberError && (
            <div className="mt-2.5">
              <ErrorText text="Incorrect card number" />
            </div>
          )}
          <div className="mt-[26px] flex gap-3.5">
            <div className="flex-1">
              <label className="mb-3 ml-1 block text-[17px]" htmlFor="cc-exp">
                Expiry date
              </label>
              <div className={box('expiry', expiryError)}>
                <input
                  id="cc-exp"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  onFocus={() => setFocus('expiry')}
                  onBlur={() => {
                    setFocus(null);
                    setTouched((t) => ({ ...t, expiry: true }));
                  }}
                  className="h-full w-full bg-transparent text-[17px] placeholder:text-field-text"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-3 ml-1 block text-[17px]" htmlFor="cc-csc">
                CVV code
              </label>
              <div className={box('cvv')}>
                <input
                  id="cc-csc"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(cardDigits(e.target.value).slice(0, brand === 'amex' ? 4 : 3))}
                  placeholder={brand === 'amex' ? '1234' : '123'}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  onFocus={() => setFocus('cvv')}
                  onBlur={() => setFocus(null)}
                  className="h-full w-full bg-transparent text-[17px] placeholder:text-field-text"
                />
              </div>
            </div>
          </div>
          {expiryError && (
            <div className="mt-2.5">
              <ErrorText text="Enter a valid expiry date" />
            </div>
          )}
          <p className="mt-5 flex items-center gap-1.5 text-[12.5px] text-gray">
            <Lock size={13} /> Your card details are safe and securely encrypted with us
          </p>
          <Link href="/account/faqs" className="mt-3 inline-block text-[16px] underline">
            Read more about card security
          </Link>
          <p className="mt-6 text-[13px] text-gray-light">Demo: use test card 4242 4242 4242 4242 with any future date.</p>
        </div>
        <div className="px-5 pb-3 pt-2">
          <Button type="submit" size="lg" variant={ready ? 'primary' : 'secondary'} disabled={!ready}>
            Add Card
          </Button>
        </div>
      </form>
    </main>
  );
}
