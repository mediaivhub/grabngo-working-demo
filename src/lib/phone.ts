/** UAE mobile numbers: 9 digits starting with 5 (e.g. 52 345 6789). */
export function normalizeUaePhone(input: string) {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('971')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

export const isValidUaePhone = (input: string) => /^5\d{8}$/.test(normalizeUaePhone(input));

export function formatUaePhone(input: string) {
  const d = normalizeUaePhone(input).slice(0, 9);
  if (!d) return '';
  return `+971 ${[d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)].filter(Boolean).join(' ')}`;
}

/** Keeps the field formatted as the user types, without fighting deletion of the prefix. */
export const typedPhone = (t: string) => formatUaePhone(t) || t.replace(/[^\d+]/g, '');
