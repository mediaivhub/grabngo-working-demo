'use client';

import { Check, ChevronRight, Gift, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/components/ui';
import { getPlace, getProduct } from '@/data/mock';
import { INVITATIONS, invitationFor, type Invitation } from '@/lib/invitations';
import { useStore } from '@/store/AppStore';

/*
 * Invitations: restaurants' offers, shown as quiet gestures ("on the house"), never as discounts.
 * Styled with the app's own building blocks: grey rows, white sheets, standard cards.
 */

const names = (list: Invitation[]) => {
  const n = list.map((i) => getPlace(i.placeId)?.name.split(' ')[0] ?? '');
  return n.length > 2 ? `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` : n.join(' and ');
};

/** Home: one quiet row, styled like the search bar. */
export function InvitationsLine() {
  const { invitations } = useStore();
  const [host, setHost] = useState<Element | null>(null);
  const waiting = INVITATIONS.filter((i) => !(invitations ?? []).includes(i.id));
  if (!INVITATIONS.length) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => setHost(e.currentTarget.closest('.screen') ?? document.body)}
        className="mx-5 mt-3 flex w-[calc(100%-40px)] items-center gap-3 rounded-[20px] bg-surface py-2.5 pl-2.5 pr-3.5 text-left transition active:opacity-80">
        <span className="flex -space-x-2.5">
          {INVITATIONS.slice(0, 3).map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i.id} src={getPlace(i.placeId)?.image} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-surface" />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink">Invitations</span>
          <span className="block truncate text-[12.5px] text-gray">From {names(INVITATIONS)}</span>
        </span>
        {waiting.length > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-[12px] font-semibold text-white">{waiting.length}</span>}
        <ChevronRight size={18} className="text-gray-light" />
      </button>
      {host && createPortal(<InvitationsSheet onClose={() => setHost(null)} />, host)}
    </>
  );
}

/** Restaurant page: a row in the same style as the Details box. */
export function RestaurantInvitation({ placeId }: { placeId: string }) {
  const inv = invitationFor(placeId);
  const [host, setHost] = useState<Element | null>(null);
  if (!inv) return null;
  const gift = inv.giftProductId ? getProduct(inv.giftProductId) : undefined;
  return (
    <>
      <button
        type="button"
        onClick={(e) => setHost(e.currentTarget.closest('.screen') ?? document.body)}
        className="mx-5 mt-2.5 flex w-[calc(100%-40px)] items-center gap-3 rounded-[22px] bg-card p-3 text-left transition active:opacity-80">
        {gift ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gift.hero ?? gift.image} alt="" className="h-12 w-12 rounded-2xl object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white">
            <Gift size={20} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] text-gray">An invitation for you</span>
          <span className="block truncate text-[15px] font-medium text-ink">{inv.gesture}</span>
        </span>
        <ChevronRight size={18} className="text-gray-light" />
      </button>
      {host && createPortal(<InvitationsSheet onClose={() => setHost(null)} only={inv.id} />, host)}
    </>
  );
}

/** The invitations, in the app's standard white bottom sheet. */
export function InvitationsSheet({ onClose, only }: { onClose: () => void; only?: string }) {
  const list = only ? INVITATIONS.filter((i) => i.id === only) : INVITATIONS;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/35" onClick={onClose}>
      <div role="dialog" aria-label="Invitations" className="pb-safe sheet-in max-h-[85%] overflow-y-auto rounded-t-[30px] bg-white px-5 pb-6 pt-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight">Invitations</h2>
            <p className="mt-1 text-[14px] leading-5 text-gray">A little something from the places you order from.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {list.map((inv, i) => (
            <InvitationCard key={inv.id} inv={inv} delay={i * 60} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InvitationCard({ inv, delay }: { inv: Invitation; delay: number }) {
  const { invitations, acceptInvitation } = useStore();
  const accepted = (invitations ?? []).includes(inv.id);
  const place = getPlace(inv.placeId);
  const gift = inv.giftProductId ? getProduct(inv.giftProductId) : undefined;
  return (
    <div className="cascade-in flex items-center gap-3 rounded-[22px] bg-card p-3" style={{ animationDelay: `${delay}ms` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={gift ? gift.hero ?? gift.image : place?.image} alt="" className="h-[72px] w-[72px] shrink-0 rounded-[16px] object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] text-gray">{place?.name}</p>
        <p className="mt-0.5 text-[15px] font-medium leading-5 text-ink">{inv.gesture}</p>
        <p className="mt-1 text-[12.5px] text-gray">
          {inv.condition} · {inv.until}
        </p>
      </div>
      <button
        type="button"
        onClick={() => acceptInvitation(inv.id)}
        disabled={accepted}
        aria-label={accepted ? 'Accepted' : `Accept invitation from ${place?.name}`}
        className={cx('flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-semibold transition', accepted ? 'text-green' : 'bg-ink text-white active:scale-95')}>
        {accepted ? (
          <>
            <Check size={16} /> Added
          </>
        ) : (
          'Accept'
        )}
      </button>
    </div>
  );
}

/** Cart: an accepted invitation from this restaurant, as a complimentary line. */
export function InvitationInCart({ placeId }: { placeId: string }) {
  const { invitations } = useStore();
  const inv = invitationFor(placeId);
  if (!inv || !(invitations ?? []).includes(inv.id)) return null;
  const gift = inv.giftProductId ? getProduct(inv.giftProductId) : undefined;
  return (
    <section className="mt-1.5 rounded-3xl bg-white p-5">
      <div className="flex items-center gap-3">
        {gift ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gift.hero ?? gift.image} alt="" className="h-[52px] w-[52px] shrink-0 rounded-[14px] object-cover" />
        ) : (
          <span className="grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-card">
            <Gift size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] text-ink">{gift ? gift.name : inv.gesture}</p>
          <p className="truncate text-[13px] text-gray">Invitation · {inv.condition.toLowerCase()}</p>
        </div>
        <span className="text-[14px] font-medium text-green">Complimentary</span>
      </div>
    </section>
  );
}
