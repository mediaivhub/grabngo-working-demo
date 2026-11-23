/**
 * Invitations: how restaurants make offers on GrabnGo. Never "% off": a gesture from the house,
 * written like a private invitation. Accepted invitations show in the cart as "with our compliments".
 */
export type Invitation = {
  id: string;
  placeId: string;
  /** The gesture, said quietly: what they're offering. */
  gesture: string;
  /** When it applies. */
  condition: string;
  until: string;
  /** The complimentary item, if there is one. */
  giftProductId?: string;
};

export const INVITATIONS: Invitation[] = [
  { id: 'inv-orfali-kunafa', placeId: 'orfali', gesture: 'Kunafa cheesecake, on the house', condition: 'With any two coffees', until: 'Until Sunday', giftProductId: 'kunafa-cheesecake' },
  { id: 'inv-stay-crepe', placeId: 'stay', gesture: 'A slice of mille crêpe, our pleasure', condition: 'When you order two drinks', until: 'Until 30 November', giftProductId: 'mille-crepe' },
  { id: 'inv-nightjar-latte', placeId: 'nightjar', gesture: 'Your second iced latte is on us', condition: 'Any time this week', until: 'Until Friday', giftProductId: 'iced-latte' },
];

export const invitationFor = (placeId: string) => INVITATIONS.find((i) => i.placeId === placeId);
