import { getProduct, type Category } from '@/data/mock';

/**
 * Invitations: how restaurants make offers on GrabnGo. Never "% off": a gesture from the house.
 * Once accepted, the gift is added free to the order at checkout when the cart meets the rule;
 * otherwise the cart says exactly what's missing.
 */
export type Invitation = {
  id: string;
  placeId: string;
  /** The gesture, said quietly: what they're offering. */
  gesture: string;
  /** When it applies, in words (shown on the invitation). */
  condition: string;
  until: string;
  /** The complimentary item added to the order. */
  giftProductId: string;
  /** What the cart needs: `count` items from these categories or products. */
  requires: { count: number; categories?: Category[]; productIds?: string[]; noun: [string, string] };
};

export const INVITATIONS: Invitation[] = [
  {
    id: 'inv-orfali-kunafa',
    placeId: 'orfali',
    gesture: 'Kunafa cheesecake, on the house',
    condition: 'With any two coffees',
    until: 'Until Sunday',
    giftProductId: 'kunafa-cheesecake',
    requires: { count: 2, categories: ['coffee', 'cold-coffee'], noun: ['coffee', 'coffees'] },
  },
  {
    id: 'inv-stay-crepe',
    placeId: 'stay',
    gesture: 'A slice of mille crêpe, our pleasure',
    condition: 'When you order two drinks',
    until: 'Until 30 November',
    giftProductId: 'mille-crepe',
    requires: { count: 2, categories: ['coffee', 'cold-coffee', 'not-coffee'], noun: ['drink', 'drinks'] },
  },
  {
    id: 'inv-nightjar-latte',
    placeId: 'nightjar',
    gesture: 'Your second iced latte is on us',
    condition: 'When you order an iced latte',
    until: 'Until Friday',
    giftProductId: 'iced-latte',
    requires: { count: 1, productIds: ['iced-latte'], noun: ['iced latte', 'iced lattes'] },
  },
];

export const invitationFor = (placeId: string) => INVITATIONS.find((i) => i.placeId === placeId);

type Line = { productId: string; qty: number };

export type InvitationCheck = {
  eligible: boolean;
  have: number;
  need: number;
  /** Why it doesn't apply yet, e.g. "Add 1 more coffee to get your complimentary Kunafa Cheesecake". */
  reason?: string;
};

/** Does this cart qualify for the invitation? */
export function checkInvitation(inv: Invitation, lines: Line[]): InvitationCheck {
  const r = inv.requires;
  const have = lines.reduce((n, l) => {
    const p = getProduct(l.productId);
    if (!p) return n;
    const counts = r.productIds ? r.productIds.includes(p.id) : (r.categories ?? []).some((c) => p.categories.includes(c));
    return counts ? n + l.qty : n;
  }, 0);
  const need = r.count;
  if (have >= need) return { eligible: true, have, need };
  const missing = need - have;
  const gift = getProduct(inv.giftProductId)?.name ?? 'gift';
  return { eligible: false, have, need, reason: `Add ${missing} more ${missing === 1 ? r.noun[0] : r.noun[1]} to get your complimentary ${gift}` };
}

/** The accepted invitation that applies to this cart (same restaurant), if any. */
export function acceptedInvitationFor(placeId: string, accepted: string[] | undefined) {
  const inv = invitationFor(placeId);
  return inv && (accepted ?? []).includes(inv.id) ? inv : undefined;
}
