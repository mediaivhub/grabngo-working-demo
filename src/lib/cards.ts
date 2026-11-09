import type { CardBrand } from '@/store/AppStore';

export const cardDigits = (s: string) => s.replace(/\D/g, '');

export function detectBrand(number: string): CardBrand {
  const d = cardDigits(number);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  return 'card';
}

const lengthFor = (brand: CardBrand) => (brand === 'amex' ? 15 : 16);

/** Standard Luhn checksum used by all card networks. */
export function luhn(number: string) {
  const d = cardDigits(number);
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return d.length > 0 && sum % 10 === 0;
}

export function formatCardNumber(input: string) {
  const brand = detectBrand(input);
  const d = cardDigits(input).slice(0, lengthFor(brand));
  if (brand === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ');
  return d.replace(/(.{4})/g, '$1 ').trim();
}

export const isCardComplete = (number: string) => cardDigits(number).length === lengthFor(detectBrand(number));
export const isValidCardNumber = (number: string) => isCardComplete(number) && luhn(number);

export function formatExpiry(input: string) {
  const d = cardDigits(input).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function isValidExpiry(value: string, now?: Date) {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  // Cards are valid through the end of their expiry month.
  return new Date(year, month, 1) > (now ?? new Date());
}

export const isValidCvv = (cvv: string, brand: CardBrand) => new RegExp(`^\\d{${brand === 'amex' ? 4 : 3}}$`).test(cvv);

export const brandName = (brand: CardBrand) => ({ visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', card: 'Card' })[brand];
